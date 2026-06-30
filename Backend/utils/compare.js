// ---------------------------------------------------------------------------
// Property comparison helpers
// ---------------------------------------------------------------------------
// Builds a normalized comparison set, computes deterministic "highlight" tags
// (Best value, Lowest price, Largest, Most bedrooms) and a fallback summary
// sentence used when Gemini is not available.
// ---------------------------------------------------------------------------

import { formatINR } from './parseQuery.js';

function label(i) {
    return String.fromCharCode(65 + i); // A, B, C, ...
}

export function buildComparison(rawItems = []) {
    const items = rawItems.map((p, i) => {
        const price = Number(p.price) || 0;
        const area = Number(p.area) || 0;
        return {
            id: p.id || p._id || `item-${i}`,
            label: label(i),
            title: p.title || (p.propertyType === 'Land' ? 'Land Plot' : 'Listing'),
            price,
            area,
            bedrooms: Number(p.bedrooms) || 0,
            bathrooms: Number(p.bathrooms) || 0,
            type: p.type || 'sale',
            propertyType: p.propertyType || 'Land',
            location: p.location || '—',
            pricePerSqft: area > 0 ? price / area : null,
        };
    });

    // superlatives (ignore zero/empty values where it doesn't make sense)
    const withPrice = items.filter((x) => x.price > 0);
    const withArea = items.filter((x) => x.area > 0);
    const withPps = items.filter((x) => x.pricePerSqft != null);
    const withBeds = items.filter((x) => x.bedrooms > 0);

    const minBy = (arr, key) =>
        arr.length ? arr.reduce((a, b) => (b[key] < a[key] ? b : a)) : null;
    const maxBy = (arr, key) =>
        arr.length ? arr.reduce((a, b) => (b[key] > a[key] ? b : a)) : null;

    const cheapest = minBy(withPrice, 'price');
    const bestValue = minBy(withPps, 'pricePerSqft');
    const largest = maxBy(withArea, 'area');
    const mostBeds = maxBy(withBeds, 'bedrooms');

    // tags keyed by item id
    const tags = {};
    const push = (id, t) => {
        if (!id) return;
        (tags[id] = tags[id] || []).push(t);
    };
    if (cheapest) push(cheapest.id, 'Lowest price');
    if (bestValue) push(bestValue.id, 'Best value / sqft');
    if (largest) push(largest.id, 'Largest area');
    if (mostBeds && items.filter((x) => x.bedrooms === mostBeds.bedrooms).length < items.length) {
        push(mostBeds.id, 'Most bedrooms');
    }

    // deterministic fallback summary
    const summaryFallback = buildFallbackSummary(items, { cheapest, bestValue, largest });

    return { items, tags, summaryFallback };
}

function buildFallbackSummary(items, { cheapest, bestValue, largest }) {
    if (items.length < 2) return 'Select at least two listings to compare.';

    const sentences = [];

    if (bestValue && bestValue.pricePerSqft != null) {
        sentences.push(
            `${bestValue.title} offers the best value at about ${formatINR(Math.round(bestValue.pricePerSqft))}/sqft.`
        );
    }
    if (largest && (!bestValue || largest.id !== bestValue.id)) {
        sentences.push(
            `${largest.title} is the most spacious with ${largest.area.toLocaleString('en-IN')} sqft.`
        );
    }
    if (cheapest && (!bestValue || cheapest.id !== bestValue.id) && (!largest || cheapest.id !== largest.id)) {
        sentences.push(
            `${cheapest.title} has the lowest overall price at ${formatINR(cheapest.price)}.`
        );
    }

    if (!sentences.length) {
        sentences.push('These listings are closely matched on price and size — the right pick comes down to location and layout preferences.');
    } else {
        sentences.push('Weigh the trade-offs against your budget and preferred location.');
    }

    return sentences.join(' ');
}
