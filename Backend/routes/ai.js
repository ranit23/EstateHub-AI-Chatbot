import express from 'express';
import Property from '../models/Property.js';
import Land from '../models/Land.js';
import { callLLM, isLLMConfigured, llmProvider } from '../utils/aiClient.js';
import {
    parseQueryHeuristic,
    normalizePropertyType,
    mongoFromFilters,
    mongoFromLandFilters,
    formatINR,
    describeFilters,
    numOrNull,
    intOrNull,
} from '../utils/parseQuery.js';
import { buildComparison } from '../utils/compare.js';

const router = express.Router();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getKnownLocations() {
    try {
        const [p, l] = await Promise.all([
            Property.distinct('location'),
            Land.distinct('location'),
        ]);
        return [...new Set([...(p || []), ...(l || [])])].filter(Boolean);
    } catch {
        return [];
    }
}

const SEARCH_SYSTEM = `You parse natural-language real-estate searches for an Indian property website.
Return ONLY a JSON object with exactly these keys:
{
  "type": "sale" | "rent" | null,
  "propertyType": "House" | "Apartment" | "Villa" | "Land" | null,
  "location": string | null,
  "minPrice": number | null,
  "maxPrice": number | null,
  "minBedrooms": number | null,
  "keywords": string[]
}
Rules:
- Prices are in Indian Rupees. 1 lakh = 100000, 1 crore = 10000000. "under/below" sets maxPrice; "above/over" sets minPrice.
- "2BHK"/"2 bed" -> minBedrooms 2.
- propertyType must be one of the four listed values or null. "flat" -> "Apartment", "plot" -> "Land".
- location is a short place name only (e.g. "OMR", "Velachery"), or null.
- keywords are lowercase amenity/use terms not captured above (e.g. "swimming pool", "commercial", "furnished"), or [].
Output JSON only, no commentary.`;

async function parseQuery(query, knownLocations) {
    const heuristic = parseQueryHeuristic(query, knownLocations);

    if (isLLMConfigured()) {
        const llm = await callLLM({
            system: SEARCH_SYSTEM,
            user: `Query: "${query}"\nKnown locations in our database: ${knownLocations.slice(0, 40).join(', ') || 'none'}`,
            json: true,
            maxTokens: 300,
            temperature: 0.1,
        });

        if (llm && typeof llm === 'object') {
            return {
                type: llm.type === 'sale' || llm.type === 'rent' ? llm.type : heuristic.type,
                propertyType: normalizePropertyType(llm.propertyType) || heuristic.propertyType,
                location: (llm.location && String(llm.location).trim()) || heuristic.location,
                minPrice: numOrNull(llm.minPrice) ?? heuristic.minPrice,
                maxPrice: numOrNull(llm.maxPrice) ?? heuristic.maxPrice,
                minBedrooms: intOrNull(llm.minBedrooms) ?? heuristic.minBedrooms,
                keywords:
                    Array.isArray(llm.keywords) && llm.keywords.length
                        ? llm.keywords.map((k) => String(k).toLowerCase())
                        : heuristic.keywords,
                _engine: 'ai',
            };
        }
    }

    return { ...heuristic, _engine: 'rules' };
}

function relaxedLabels(opts, f) {
    const r = [];
    if (opts.includeKeywords === false && f.keywords && f.keywords.length) r.push('amenities');
    if (opts.includeBedrooms === false && f.minBedrooms != null) r.push('bedrooms');
    if (opts.includePrice === false && (f.minPrice != null || f.maxPrice != null)) r.push('price');
    if (opts.includeLocation === false && f.location) r.push('location');
    return r;
}

async function runSearch(filters, query) {
    const landRelevant =
        filters.propertyType === 'Land' ||
        /\b(land|plot|plots|acre|acres|ground|commercial|agricultural)\b/i.test(query);
    const onlyLand = filters.propertyType === 'Land';

    // progressively widen the search until we have results
    const relaxSteps = [
        {},
        { includeKeywords: false },
        { includeKeywords: false, includeBedrooms: false },
        { includeKeywords: false, includeBedrooms: false, includePrice: false },
        { includeKeywords: false, includeBedrooms: false, includePrice: false, includeLocation: false },
    ];

    let results = [];
    let relaxed = [];

    for (const opts of relaxSteps) {
        results = [];

        if (!onlyLand) {
            const docs = await Property.find(mongoFromFilters(filters, opts))
                .sort({ createdAt: -1 })
                .limit(30)
                .populate('owner', 'name email phone');
            results.push(...docs.map((d) => d.toObject({ virtuals: true })));
        }

        if (landRelevant) {
            const lands = await Land.find(mongoFromLandFilters(filters, opts))
                .sort({ createdAt: -1 })
                .limit(30)
                .populate('owner', 'name email phone');
            results.push(
                ...lands.map((d) => ({
                    ...d.toObject({ virtuals: true }),
                    type: 'sale',
                    propertyType: 'Land',
                    title: d.title || 'Land Plot',
                }))
            );
        }

        if (results.length) {
            relaxed = relaxedLabels(opts, filters);
            break;
        }
    }

    return { results: results.slice(0, 24), relaxed };
}

function publicFilters(f) {
    return {
        type: f.type ?? null,
        propertyType: f.propertyType ?? null,
        location: f.location ?? null,
        minPrice: f.minPrice ?? null,
        maxPrice: f.maxPrice ?? null,
        minBedrooms: f.minBedrooms ?? null,
        keywords: f.keywords ?? [],
    };
}

// ---------------------------------------------------------------------------
// POST /api/ai/search   { query }  ->  { filters, results, summary, ... }
// ---------------------------------------------------------------------------
router.post('/search', async (req, res) => {
    try {
        const query = String(req.body?.query || '').trim();
        if (!query) return res.status(400).json({ error: 'Query is required' });

        const knownLocations = await getKnownLocations();
        const filters = await parseQuery(query, knownLocations);
        const { results, relaxed } = await runSearch(filters, query);

        // friendly one-line summary
        let summary;
        if (isLLMConfigured()) {
            const sample = results
                .slice(0, 5)
                .map((r) => `${r.title || 'Listing'} - ${formatINR(r.price)} in ${r.location}`)
                .join('; ');
            const llm = await callLLM({
                system: 'You are a friendly property search assistant. In ONE short sentence, summarize the results for the user. Mention the result count. Never invent details. Plain text only.',
                user: `User query: "${query}"\nInterpreted as: ${describeFilters(filters)}\nResult count: ${results.length}\nRelaxed filters: ${relaxed.join(', ') || 'none'}\nSamples: ${sample || 'none'}`,
                json: false,
                maxTokens: 90,
                temperature: 0.5,
            });
            if (llm) summary = llm.trim();
        }
        if (!summary) {
            summary = results.length
                ? `Found ${results.length} ${results.length === 1 ? 'listing' : 'listings'} matching ${describeFilters(filters)}.`
                : `I couldn't find listings matching ${describeFilters(filters)}. Try widening your budget or location.`;
            if (relaxed.length) summary += ` (Broadened by ignoring: ${relaxed.join(', ')}.)`;
        }

        res.json({
            query,
            engine: filters._engine,
            provider: llmProvider(),
            filters: publicFilters(filters),
            relaxed,
            count: results.length,
            results,
            summary,
        });
    } catch (err) {
        console.error('AI search error:', err);
        res.status(500).json({ error: 'AI search failed' });
    }
});

// ---------------------------------------------------------------------------
// POST /api/ai/compare   { properties: [...] }  ->  { summary, tags, engine }
// ---------------------------------------------------------------------------
router.post('/compare', async (req, res) => {
    try {
        const items = Array.isArray(req.body?.properties) ? req.body.properties : [];
        if (items.length < 2) {
            return res.status(400).json({ error: 'Select at least 2 properties to compare' });
        }

        const cmp = buildComparison(items);
        let summary = cmp.summaryFallback;
        let engine = 'rules';

        if (isLLMConfigured()) {
            const compact = cmp.items.map((p) => ({
                label: p.label,
                title: p.title,
                priceINR: p.price,
                area_sqft: p.area,
                bedrooms: p.bedrooms,
                bathrooms: p.bathrooms,
                type: p.type,
                propertyType: p.propertyType,
                location: p.location,
                price_per_sqft: p.pricePerSqft ? Math.round(p.pricePerSqft) : null,
            }));

            const llm = await callLLM({
                system: 'You are a concise, balanced real-estate advisor. Compare the given properties in 2-3 sentences, highlighting trade-offs in value-for-money (price per sqft), size, bedrooms, total price and location. Refer to each property by its title. Be specific and neutral. Plain text only, no lists.',
                user: JSON.stringify({ properties: compact }, null, 2),
                json: false,
                maxTokens: 220,
                temperature: 0.4,
            });
            if (llm && typeof llm === 'string') {
                summary = llm.trim();
                engine = 'ai';
            }
        }

        res.json({ summary, tags: cmp.tags, engine, provider: llmProvider() });
    } catch (err) {
        console.error('AI compare error:', err);
        res.status(500).json({ error: 'AI comparison failed' });
    }
});

export default router;
