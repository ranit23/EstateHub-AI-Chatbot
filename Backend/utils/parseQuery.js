// ---------------------------------------------------------------------------
// Natural-language query parsing (rule-based)
// ---------------------------------------------------------------------------
// Converts a free-text query like
//   "Find me a 2BHK apartment near OMR under 60 lakh"
// into structured filters:
//   { type, propertyType, location, minPrice, maxPrice, minBedrooms, keywords }
//
// Used as the deterministic engine and as a fallback when Gemini is not
// configured or unavailable.
// ---------------------------------------------------------------------------

export const escapeRegex = (s = '') => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export const numOrNull = (v) => (v == null || isNaN(Number(v)) ? null : Number(v));
export const intOrNull = (v) => (v == null || isNaN(parseInt(v, 10)) ? null : parseInt(v, 10));

const PROPERTY_TYPES = [
    { name: 'Apartment', words: ['apartment', 'apartments', 'flat', 'flats', 'condo', 'bhk'] },
    { name: 'Villa', words: ['villa', 'villas', 'bungalow', 'bungalows'] },
    { name: 'House', words: ['house', 'houses', 'independent house'] },
    { name: 'Land', words: ['land', 'lands', 'plot', 'plots', 'acre', 'acres', 'ground'] },
];

const KEYWORD_TERMS = [
    'swimming pool', 'pool', 'garden', 'parking', 'furnished', 'semi-furnished',
    'unfurnished', 'gym', 'lift', 'elevator', 'security', 'gated', 'sea view',
    'lake view', 'park view', 'balcony', 'terrace', 'commercial', 'residential',
    'agricultural', 'corner', 'east facing', 'north facing', 'it park', 'metro',
    'school', 'hospital',
];

const WORD_NUMBERS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 };

// tokens that should NOT be treated as part of a location after a preposition
const STOPWORDS = new Set([
    'under', 'below', 'above', 'over', 'around', 'about', 'with', 'and', 'for',
    'the', 'a', 'an', 'near', 'in', 'at', 'to', 'within', 'less', 'more', 'than',
    'budget', 'price', 'rs', 'inr', 'lakh', 'lakhs', 'lac', 'crore', 'cr', 'k',
    'between', 'upto', 'up',
]);

const NUM_UNIT = '(\\d+(?:\\.\\d+)?)\\s*(crores?|cr|lakhs?|lacs?|lakh|lac|l|k)?';

function unitToRupees(numStr, unit) {
    let n = parseFloat(String(numStr).replace(/,/g, ''));
    if (isNaN(n)) return null;
    if (!unit) {
        // bare number used with a price preposition: treat small numbers as lakh
        // (e.g. "under 60" -> 60 lakh), larger numbers as plain rupees.
        return n < 1000 ? n * 100000 : n;
    }
    const u = unit.toLowerCase();
    if (u.startsWith('cr')) return Math.round(n * 10000000);
    if (u.startsWith('l') || u.startsWith('lac') || u.startsWith('lakh')) return Math.round(n * 100000);
    if (u === 'k') return Math.round(n * 1000);
    return Math.round(n);
}

function parsePrice(text) {
    const t = text.toLowerCase();
    let minPrice = null;
    let maxPrice = null;

    // between X and Y
    let m = t.match(new RegExp(`between\\s+${NUM_UNIT}\\s+(?:and|to|-)\\s+${NUM_UNIT}`));
    if (m) {
        return { minPrice: unitToRupees(m[1], m[2]), maxPrice: unitToRupees(m[3], m[4]) };
    }

    // explicit range "X - Y lakh" / "X to Y cr"
    m = t.match(new RegExp(`${NUM_UNIT}\\s*(?:-|to)\\s*${NUM_UNIT}`));
    if (m && (m[2] || m[4])) {
        return {
            minPrice: unitToRupees(m[1], m[2] || m[4]),
            maxPrice: unitToRupees(m[3], m[4] || m[2]),
        };
    }

    // under / below / max / within
    m = t.match(new RegExp(`(?:under|below|less than|upto|up to|max|maximum|within|budget of|budget)\\s+${NUM_UNIT}`));
    if (m) maxPrice = unitToRupees(m[1], m[2]);

    // above / over / min / from
    let m2 = t.match(new RegExp(`(?:above|over|more than|min|minimum|starting at|starting from|from)\\s+${NUM_UNIT}`));
    if (m2) minPrice = unitToRupees(m2[1], m2[2]);

    // around / about / approx  -> +/- 10%
    if (minPrice == null && maxPrice == null) {
        const m3 = t.match(new RegExp(`(?:around|about|approx(?:imately)?|~)\\s+${NUM_UNIT}`));
        if (m3) {
            const base = unitToRupees(m3[1], m3[2]);
            if (base) {
                minPrice = Math.round(base * 0.9);
                maxPrice = Math.round(base * 1.1);
            }
        }
    }

    return { minPrice, maxPrice };
}

function parseBedrooms(text) {
    const t = text.toLowerCase();
    let m = t.match(/(\d+)\s*(?:bhk|bedroom|bedrooms|bed|beds|br)\b/);
    if (m) return parseInt(m[1], 10);
    m = t.match(/\b(one|two|three|four|five|six)\s*(?:bhk|bedroom|bedrooms|bed|beds|br)\b/);
    if (m) return WORD_NUMBERS[m[1]] || null;
    return null;
}

function parseType(text) {
    const t = text.toLowerCase();
    if (/\b(rent|rental|rentals|renting|lease|leasing|to let|for rent)\b/.test(t)) return 'rent';
    if (/\b(buy|buying|sale|sales|purchase|for sale|to buy|selling)\b/.test(t)) return 'sale';
    return null;
}

function parsePropertyType(text) {
    const t = ` ${text.toLowerCase()} `;
    for (const pt of PROPERTY_TYPES) {
        for (const w of pt.words) {
            if (new RegExp(`\\b${escapeRegex(w)}\\b`).test(t)) return pt.name;
        }
    }
    return null;
}

function parseKeywords(text) {
    const t = text.toLowerCase();
    const found = [];
    for (const term of KEYWORD_TERMS) {
        const rx = new RegExp(`\\b${term.replace(/[-\s]+/g, '[-\\s]+')}s?\\b`, 'i');
        if (rx.test(t)) found.push(term);
    }
    // de-dupe overlaps: prefer "swimming pool" over "pool"
    if (found.includes('swimming pool')) {
        const i = found.indexOf('pool');
        if (i !== -1) found.splice(i, 1);
    }
    return [...new Set(found)];
}

function parseLocation(text, knownLocations = []) {
    const lower = text.toLowerCase();

    // 1) match against known locations from the database first
    for (const loc of knownLocations) {
        if (loc && lower.includes(String(loc).toLowerCase())) return loc;
    }

    // 2) capture words following a location preposition
    const m = text.match(/\b(?:near to|close to|located in|located at|near|in|at|around|within)\b\s+([a-zA-Z0-9.\-' ]+)/i);
    if (m) {
        const tokens = m[1].trim().split(/\s+/);
        const out = [];
        for (const tok of tokens) {
            const clean = tok.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (!clean || STOPWORDS.has(clean) || /^\d/.test(clean)) break;
            out.push(tok.replace(/[.,]$/, ''));
            if (out.length >= 3) break;
        }
        const phrase = out.join(' ').trim();
        // don't treat an amenity phrase ("IT park") as a literal location
        if (phrase && !KEYWORD_TERMS.includes(phrase.toLowerCase())) return phrase;
    }
    return null;
}

/** Main rule-based parser. */
export function parseQueryHeuristic(query, knownLocations = []) {
    const text = String(query || '');
    const { minPrice, maxPrice } = parsePrice(text);
    return {
        type: parseType(text),
        propertyType: parsePropertyType(text),
        location: parseLocation(text, knownLocations),
        minPrice,
        maxPrice,
        minBedrooms: parseBedrooms(text),
        keywords: parseKeywords(text),
    };
}

/** Map free-form LLM property-type text onto our canonical set. */
export function normalizePropertyType(value) {
    if (!value) return null;
    const v = String(value).toLowerCase();
    if (/(apartment|flat|condo|bhk)/.test(v)) return 'Apartment';
    if (/(villa|bungalow)/.test(v)) return 'Villa';
    if (/(land|plot|acre|ground)/.test(v)) return 'Land';
    if (/(house|home)/.test(v)) return 'House';
    return null;
}

// ---------------------------------------------------------------------------
// Mongo query builders
// ---------------------------------------------------------------------------

export function mongoFromFilters(f, opts = {}) {
    const {
        includeKeywords = true,
        includeBedrooms = true,
        includeLocation = true,
        includePrice = true,
    } = opts;

    const q = {};
    if (f.type) q.type = f.type;
    if (f.propertyType) {
        q.propertyType = { $regex: new RegExp(`^${escapeRegex(f.propertyType)}$`, 'i') };
    }
    if (includeLocation && f.location) {
        q.$or = [
            { location: { $regex: new RegExp(escapeRegex(f.location), 'i') } },
            { title: { $regex: new RegExp(escapeRegex(f.location), 'i') } },
        ];
    }
    if (includePrice && (f.minPrice != null || f.maxPrice != null)) {
        q.price = {};
        if (f.minPrice != null) q.price.$gte = f.minPrice;
        if (f.maxPrice != null) q.price.$lte = f.maxPrice;
    }
    if (includeBedrooms && f.minBedrooms != null) {
        q.bedrooms = { $gte: f.minBedrooms };
    }
    if (includeKeywords && f.keywords && f.keywords.length) {
        const kwOr = [];
        for (const k of f.keywords) {
            const rx = new RegExp(escapeRegex(k), 'i');
            kwOr.push({ title: rx }, { description: rx });
        }
        // combine with a location $or via $and so neither clobbers the other
        if (q.$or) {
            q.$and = [{ $or: q.$or }, { $or: kwOr }];
            delete q.$or;
        } else {
            q.$or = kwOr;
        }
    }
    return q;
}

export function mongoFromLandFilters(f, opts = {}) {
    const { includeKeywords = true, includeLocation = true, includePrice = true } = opts;
    const q = {};
    if (includeLocation && f.location) {
        q.location = { $regex: new RegExp(escapeRegex(f.location), 'i') };
    }
    if (includePrice && (f.minPrice != null || f.maxPrice != null)) {
        q.price = {};
        if (f.minPrice != null) q.price.$gte = f.minPrice;
        if (f.maxPrice != null) q.price.$lte = f.maxPrice;
    }
    if (includeKeywords && f.keywords && f.keywords.length) {
        q.$or = f.keywords.map((k) => ({
            description: { $regex: new RegExp(escapeRegex(k), 'i') },
        }));
    }
    return q;
}

// ---------------------------------------------------------------------------
// Formatting / description helpers
// ---------------------------------------------------------------------------

export function formatINR(n) {
    if (n == null || isNaN(n)) return '';
    const num = Number(n);
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2).replace(/\.00$/, '')} L`;
    return `₹${num.toLocaleString('en-IN')}`;
}

export function describeFilters(f) {
    const parts = [];
    if (f.minBedrooms) parts.push(`${f.minBedrooms}+ BHK`);
    parts.push(f.propertyType ? f.propertyType.toLowerCase() : 'properties');
    if (f.type === 'rent') parts.push('for rent');
    else if (f.type === 'sale') parts.push('for sale');
    if (f.location) parts.push(`in ${f.location}`);
    if (f.minPrice && f.maxPrice) parts.push(`between ${formatINR(f.minPrice)} and ${formatINR(f.maxPrice)}`);
    else if (f.maxPrice) parts.push(`under ${formatINR(f.maxPrice)}`);
    else if (f.minPrice) parts.push(`above ${formatINR(f.minPrice)}`);
    if (f.keywords && f.keywords.length) parts.push(`with ${f.keywords.join(', ')}`);
    return parts.join(' ');
}
