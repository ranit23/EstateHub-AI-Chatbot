// ---------------------------------------------------------------------------
// Client-side AI helpers
// ---------------------------------------------------------------------------
// formatINR is used throughout the AI UI. The parser/filter/comparison helpers
// are a lightweight fallback used only if the backend /api/ai/* call fails, so
// the chatbot and compare features still return something useful offline.
// ---------------------------------------------------------------------------

export function formatINR(n) {
    if (n == null || isNaN(n)) return '—';
    const num = Number(n);
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2).replace(/\.00$/, '')} L`;
    return `₹${num.toLocaleString('en-IN')}`;
}

export function formatPerSqft(price, area) {
    if (!price || !area) return '—';
    return `₹${Math.round(price / area).toLocaleString('en-IN')}/sqft`;
}

const PROPERTY_TYPES = [
    { name: 'Apartment', words: ['apartment', 'apartments', 'flat', 'flats', 'condo', 'bhk'] },
    { name: 'Villa', words: ['villa', 'villas', 'bungalow', 'bungalows'] },
    { name: 'House', words: ['house', 'houses'] },
    { name: 'Land', words: ['land', 'lands', 'plot', 'plots', 'acre', 'acres', 'ground'] },
];

const KEYWORD_TERMS = [
    'swimming pool', 'pool', 'garden', 'parking', 'furnished', 'gym', 'lift',
    'security', 'gated', 'sea view', 'lake view', 'balcony', 'terrace',
    'commercial', 'residential', 'agricultural', 'it park', 'metro',
];

const WORD_NUMBERS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 };
const NUM_UNIT = '(\\d+(?:\\.\\d+)?)\\s*(crores?|cr|lakhs?|lacs?|lakh|lac|l|k)?';

function unitToRupees(numStr, unit) {
    let n = parseFloat(String(numStr).replace(/,/g, ''));
    if (isNaN(n)) return null;
    if (!unit) return n < 1000 ? n * 100000 : n;
    const u = unit.toLowerCase();
    if (u.startsWith('cr')) return Math.round(n * 10000000);
    if (u.startsWith('l') || u.startsWith('lac') || u.startsWith('lakh')) return Math.round(n * 100000);
    if (u === 'k') return Math.round(n * 1000);
    return Math.round(n);
}

function parsePrice(t) {
    let m = t.match(new RegExp(`between\\s+${NUM_UNIT}\\s+(?:and|to|-)\\s+${NUM_UNIT}`));
    if (m) return { minPrice: unitToRupees(m[1], m[2]), maxPrice: unitToRupees(m[3], m[4]) };
    m = t.match(new RegExp(`${NUM_UNIT}\\s*(?:-|to)\\s*${NUM_UNIT}`));
    if (m && (m[2] || m[4]))
        return { minPrice: unitToRupees(m[1], m[2] || m[4]), maxPrice: unitToRupees(m[3], m[4] || m[2]) };

    let minPrice = null;
    let maxPrice = null;
    m = t.match(new RegExp(`(?:under|below|less than|upto|up to|max|within|budget)\\s+${NUM_UNIT}`));
    if (m) maxPrice = unitToRupees(m[1], m[2]);
    const m2 = t.match(new RegExp(`(?:above|over|more than|min|starting|from)\\s+${NUM_UNIT}`));
    if (m2) minPrice = unitToRupees(m2[1], m2[2]);
    if (minPrice == null && maxPrice == null) {
        const m3 = t.match(new RegExp(`(?:around|about|approx(?:imately)?|~)\\s+${NUM_UNIT}`));
        if (m3) {
            const base = unitToRupees(m3[1], m3[2]);
            if (base) { minPrice = Math.round(base * 0.9); maxPrice = Math.round(base * 1.1); }
        }
    }
    return { minPrice, maxPrice };
}

export function parseQueryClient(query, knownLocations = []) {
    const text = String(query || '');
    const t = text.toLowerCase();

    let type = null;
    if (/\b(rent|rental|rentals|lease|to let)\b/.test(t)) type = 'rent';
    else if (/\b(buy|sale|sales|purchase|for sale)\b/.test(t)) type = 'sale';

    let propertyType = null;
    for (const pt of PROPERTY_TYPES) {
        if (pt.words.some((w) => new RegExp(`\\b${w}\\b`).test(t))) { propertyType = pt.name; break; }
    }

    let minBedrooms = null;
    let mb = t.match(/(\d+)\s*(?:bhk|bedroom|bedrooms|bed|beds|br)\b/);
    if (mb) minBedrooms = parseInt(mb[1], 10);
    else {
        mb = t.match(/\b(one|two|three|four|five|six)\s*(?:bhk|bedroom|bed|br)\b/);
        if (mb) minBedrooms = WORD_NUMBERS[mb[1]];
    }

    const keywords = [];
    for (const term of KEYWORD_TERMS) {
        if (new RegExp(`\\b${term.replace(/[-\s]+/g, '[-\\s]+')}s?\\b`, 'i').test(t)) keywords.push(term);
    }
    if (keywords.includes('swimming pool')) {
        const i = keywords.indexOf('pool');
        if (i !== -1) keywords.splice(i, 1);
    }

    let location = null;
    for (const loc of knownLocations) {
        if (loc && t.includes(String(loc).toLowerCase())) { location = loc; break; }
    }
    if (!location) {
        const lm = text.match(/\b(?:near to|close to|located in|near|in|at|around)\b\s+([a-zA-Z0-9.\-' ]+)/i);
        if (lm) {
            const stop = new Set(['under', 'below', 'with', 'and', 'for', 'the', 'a', 'an', 'budget', 'price']);
            const out = [];
            for (const tok of lm[1].trim().split(/\s+/)) {
                const c = tok.toLowerCase().replace(/[^a-z0-9]/g, '');
                if (!c || stop.has(c) || /^\d/.test(c)) break;
                out.push(tok.replace(/[.,]$/, ''));
                if (out.length >= 3) break;
            }
            if (out.length && !KEYWORD_TERMS.includes(out.join(' ').toLowerCase())) location = out.join(' ');
        }
    }

    return { type, propertyType, location, ...parsePrice(t), minBedrooms, keywords };
}

/** Filter already-loaded listings with the parsed filters (offline fallback). */
export function filterListings(listings, f) {
    const matchText = (p, needle) => {
        const n = needle.toLowerCase();
        return (
            (p.location && p.location.toLowerCase().includes(n)) ||
            (p.title && p.title.toLowerCase().includes(n)) ||
            (p.description && p.description.toLowerCase().includes(n))
        );
    };

    const apply = (opts) =>
        listings.filter((p) => {
            if (f.type && p.type !== f.type) return false;
            if (f.propertyType && String(p.propertyType || '').toLowerCase() !== f.propertyType.toLowerCase()) return false;
            if (opts.location !== false && f.location) {
                const n = f.location.toLowerCase();
                if (!((p.location && p.location.toLowerCase().includes(n)) || (p.title && p.title.toLowerCase().includes(n)))) return false;
            }
            if (opts.price !== false && f.minPrice != null && Number(p.price) < f.minPrice) return false;
            if (opts.price !== false && f.maxPrice != null && Number(p.price) > f.maxPrice) return false;
            if (opts.bedrooms !== false && f.minBedrooms != null && Number(p.bedrooms || 0) < f.minBedrooms) return false;
            if (opts.keywords !== false && f.keywords && f.keywords.length) {
                if (!f.keywords.some((k) => matchText(p, k))) return false;
            }
            return true;
        });

    // same relaxation idea as the backend
    const ladder = [
        {},
        { keywords: false },
        { keywords: false, bedrooms: false },
        { keywords: false, bedrooms: false, price: false },
        { keywords: false, bedrooms: false, price: false, location: false },
    ];
    let results = [];
    let relaxed = [];
    for (const opts of ladder) {
        results = apply(opts);
        if (results.length) {
            if (opts.keywords === false && f.keywords?.length) relaxed.push('amenities');
            if (opts.bedrooms === false && f.minBedrooms != null) relaxed.push('bedrooms');
            if (opts.price === false && (f.minPrice != null || f.maxPrice != null)) relaxed.push('price');
            if (opts.location === false && f.location) relaxed.push('location');
            break;
        }
    }
    return { results: results.slice(0, 24), relaxed };
}

/** Deterministic comparison highlights + summary (offline fallback). */
export function buildComparisonClient(items) {
    const norm = items.map((p, i) => {
        const price = Number(p.price) || 0;
        const area = Number(p.area) || 0;
        return {
            id: p.id || p._id || `item-${i}`,
            price, area,
            pricePerSqft: area > 0 ? price / area : null,
            bedrooms: Number(p.bedrooms) || 0,
            title: p.title || (p.propertyType === 'Land' ? 'Land Plot' : 'Listing'),
        };
    });
    const minBy = (arr, k) => (arr.length ? arr.reduce((a, b) => (b[k] < a[k] ? b : a)) : null);
    const maxBy = (arr, k) => (arr.length ? arr.reduce((a, b) => (b[k] > a[k] ? b : a)) : null);

    const cheapest = minBy(norm.filter((x) => x.price > 0), 'price');
    const bestValue = minBy(norm.filter((x) => x.pricePerSqft != null), 'pricePerSqft');
    const largest = maxBy(norm.filter((x) => x.area > 0), 'area');
    const mostBeds = maxBy(norm.filter((x) => x.bedrooms > 0), 'bedrooms');

    const tags = {};
    const push = (id, t) => { if (id) (tags[id] = tags[id] || []).push(t); };
    if (cheapest) push(cheapest.id, 'Lowest price');
    if (bestValue) push(bestValue.id, 'Best value / sqft');
    if (largest) push(largest.id, 'Largest area');
    if (mostBeds && norm.filter((x) => x.bedrooms === mostBeds.bedrooms).length < norm.length)
        push(mostBeds.id, 'Most bedrooms');

    const s = [];
    if (bestValue?.pricePerSqft != null)
        s.push(`${bestValue.title} offers the best value at about ${formatINR(Math.round(bestValue.pricePerSqft))}/sqft.`);
    if (largest && (!bestValue || largest.id !== bestValue.id))
        s.push(`${largest.title} is the most spacious at ${largest.area.toLocaleString('en-IN')} sqft.`);
    if (!s.length) s.push('These listings are closely matched — your choice comes down to location and layout.');
    else s.push('Weigh the trade-offs against your budget and preferred location.');

    return { tags, summary: s.join(' ') };
}
