import React, { useState, useEffect } from 'react';
import { Home } from 'lucide-react';
import { useApp } from '../context/AppContext';
import PropertyCard from '../components/PropertyCard';
import { useSearchParams, Link } from 'react-router-dom';

const PropertiesPage = ({ initialFilters = {}, title }) => {
    const { properties, lands, wishlist, toggleWishlist } = useApp();
    const [filteredProperties, setFilteredProperties] = useState([]);
    const [searchParams] = useSearchParams();

    const locationFilter = searchParams.get('location') || initialFilters.location;
    const propertyTypeFilter = searchParams.get('propertyType') || initialFilters.propertyType;
    const typeFilter = searchParams.get('type') || initialFilters.type;
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minBedrooms = searchParams.get('minBedrooms');
    const qParam = searchParams.get('q');
    const relaxedParam = searchParams.get('relaxed');

    useEffect(() => {
        // Start with ALL listings (Properties + Lands)
        let tempProperties = [...properties];

        // Dynamically add lands if we are NOT on a strictly 'property' route (like /buy or /rent might imply, but let's allow lands there too if type matches? No, usually lands are 'sale'.
        // For search page, definitely include both.
        // For simplicity, let's include lands in the pool and let filters decide.
        // Lands don't have 'type' (rent/sale) usually, they are implicitly Sale. 
        // Backend Land model doesn't have 'type'. We should treat them as 'sale' if logic requires.
        const landsWithProps = lands.map(l => ({ ...l, type: 'sale', propertyType: 'Land', title: l.title || 'Land Plot' }));
        tempProperties = [...tempProperties, ...landsWithProps];

        const keywords = (qParam || '').split(',').map(s => s.trim()).filter(Boolean);
        const relaxedFilters = (relaxedParam || '').split(',').map(s => s.trim().toLowerCase());

        const ignoreKeywords = relaxedFilters.includes('amenities') || relaxedFilters.includes('keywords');
        const ignoreBedrooms = relaxedFilters.includes('bedrooms');
        const ignorePrice = relaxedFilters.includes('price');
        const ignoreLocation = relaxedFilters.includes('location');

        if (locationFilter && !ignoreLocation) {
            const searchLocationLower = locationFilter.toLowerCase();
            tempProperties = tempProperties.filter(p =>
                (p.location && p.location.toLowerCase().includes(searchLocationLower)) ||
                (p.title && p.title.toLowerCase().includes(searchLocationLower))
            );
        }
        if (propertyTypeFilter && propertyTypeFilter !== 'Property Type') {
            const propertyTypeLower = propertyTypeFilter.toLowerCase();
            tempProperties = tempProperties.filter(p => (p.propertyType || 'land').toLowerCase() === propertyTypeLower);
        }
        if (typeFilter) { // 'sale' or 'rent'
            tempProperties = tempProperties.filter(p => p.type === typeFilter);
        }
        if (minPrice && !ignorePrice) {
            tempProperties = tempProperties.filter(p => Number(p.price) >= Number(minPrice));
        }
        if (maxPrice && !ignorePrice) {
            tempProperties = tempProperties.filter(p => Number(p.price) <= Number(maxPrice));
        }
        if (minBedrooms && !ignoreBedrooms) {
            tempProperties = tempProperties.filter(p => Number(p.bedrooms || 0) >= Number(minBedrooms));
        }
        if (keywords.length && !ignoreKeywords) {
            tempProperties = tempProperties.filter(p =>
                keywords.some(k => {
                    const n = k.toLowerCase();
                    return (p.title && p.title.toLowerCase().includes(n)) ||
                        (p.description && p.description.toLowerCase().includes(n)) ||
                        (p.location && p.location.toLowerCase().includes(n));
                })
            );
        }

        // Filter duplicates by unique ID and content fingerprint (to catch duplicate submissions with different DB IDs)
        const seenIds = new Set();
        const seenFingerprints = new Set();
        const uniqueProperties = tempProperties.filter(item => {
            const id = item.id || item._id;
            const idStr = id ? id.toString() : '';
            const fingerprint = `${item.title || ''}_${item.price}_${item.location || ''}_${item.area}`;

            if (idStr && seenIds.has(idStr)) return false;
            if (seenFingerprints.has(fingerprint)) return false;

            if (idStr) seenIds.add(idStr);
            seenFingerprints.add(fingerprint);
            return true;
        });

        setFilteredProperties(uniqueProperties);
    }, [properties, lands, locationFilter, propertyTypeFilter, typeFilter, minPrice, maxPrice, minBedrooms, qParam, relaxedParam]);

    return (
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12">
            <h1 className="text-2xl sm:text-4xl font-extrabold mb-6 sm:mb-10 text-slate-900">{title}</h1>

            {filteredProperties.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
                    {filteredProperties.map(property => (
                        <PropertyCard
                            key={property.id}
                            property={property}
                            isWishlisted={wishlist.includes(property.id)}
                            onToggleWishlist={toggleWishlist}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-24 bg-slate-50 rounded-3xl border-dashed border-2 border-slate-200">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <Home className="w-10 h-10 text-slate-300" />
                    </div>
                    <p className="text-slate-500 text-xl font-medium mb-6">No properties found matching your criteria.</p>
                    <Link to="/" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700">Back to Home</Link>
                </div>
            )}
        </div>
    );
};

export default PropertiesPage;
