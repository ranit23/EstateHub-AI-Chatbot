import React from 'react';
import { MapPin, Bed, Bath, Square, Heart, Scale, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const PropertyCard = ({ property, isWishlisted, onToggleWishlist, onViewDetails }) => {
    const { isInCompare, toggleCompare } = useApp();
    const inCompare = isInCompare(property.id);
    return (
        <div className="group bg-white rounded-3xl shadow-sm hover:shadow-2xl hover:shadow-slate-200 border border-slate-100 overflow-hidden transition-all duration-300 transform hover:-translate-y-2 flex flex-col h-full relative">
            {/* Featured Badge */}
            {property.featured && (
                <div className="absolute top-4 left-4 z-10">
                    <span className="px-4 py-1.5 rounded-full text-white text-xs font-bold uppercase tracking-wider shadow-lg bg-indigo-600">
                        Featured
                    </span>
                </div>
            )}

            {/* Action buttons (wishlist + compare) */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleWishlist(property.id); }}
                    title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                    className="p-2.5 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-white transition-all duration-300 group-hover:scale-110"
                >
                    <Heart className={`w-5 h-5 transition-colors ${isWishlisted ? 'text-red-500 fill-red-500' : 'text-slate-400 hover:text-red-500'}`} />
                </button>
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleCompare(property); }}
                    title={inCompare ? 'Remove from comparison' : 'Add to compare'}
                    className={`p-2.5 rounded-full backdrop-blur-sm shadow-md transition-all duration-300 group-hover:scale-110 ${inCompare ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-white/90 hover:bg-white'}`}
                >
                    {inCompare
                        ? <Check className="w-5 h-5 text-white" />
                        : <Scale className="w-5 h-5 text-slate-400 hover:text-indigo-600 transition-colors" />}
                </button>
            </div>

            {/* Image */}
            <div className="relative h-52 sm:h-72 overflow-hidden">
                <Link to={`/property/${property.id}`}>
                    <img
                        src={property.image}
                        alt={property.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                </Link>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/80 to-transparent p-6 pt-20">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide text-white border border-white/30 backdrop-blur-md ${property.type === 'sale' ? 'bg-emerald-500/80' : 'bg-indigo-500/80'}`}>
                        {property.type === 'sale' ? 'For Sale' : 'For Rent'}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-grow">
                <div className="mb-4">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg sm:text-xl font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                            <Link to={`/property/${property.id}`}>{property.title || 'Untitled Listing'}</Link>
                        </h3>
                    </div>
                    <p className="text-slate-500 text-sm font-medium flex items-center"><MapPin className="w-4 h-4 mr-1 text-indigo-400" /> {property.location}</p>
                </div>

                <div className="flex gap-4 mb-6 border-b border-slate-100 pb-4 justify-center">
                    {property.bedrooms && (
                        <div className="text-center">
                            <div className="flex items-center justify-center text-slate-400 mb-1"><Bed className="w-4 h-4" /></div>
                            <span className="text-slate-800 font-bold text-sm text-nowrap">{property.bedrooms} Beds</span>
                        </div>
                    )}
                    {property.bathrooms && (
                        <div className="text-center pl-4 border-l border-slate-100">
                            <div className="flex items-center justify-center text-slate-400 mb-1"><Bath className="w-4 h-4" /></div>
                            <span className="text-slate-800 font-bold text-sm text-nowrap">{property.bathrooms} Baths</span>
                        </div>
                    )}
                    <div className={`text-center ${property.bedrooms ? 'pl-4 border-l border-slate-100' : ''}`}>
                        <div className="flex items-center justify-center text-slate-400 mb-1"><Square className="w-4 h-4" /></div>
                        <span className="text-slate-800 font-bold text-sm text-nowrap">{property.area} sqft</span>
                    </div>
                </div>

                <div className="mt-auto flex justify-between items-center">
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-0.5">Price</p>
                        <p className="text-xl sm:text-2xl font-extrabold text-indigo-600">₹{property.price.toLocaleString()}<span className="text-sm text-slate-400 font-normal">{property.type === 'rent' ? '/mo' : ''}</span></p>
                    </div>
                    <Link
                        to={`/property/${property.id}`}
                        onClick={() => onViewDetails && onViewDetails(property)}
                        className="bg-slate-900 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-600 transition-all shadow-lg hover:shadow-indigo-200"
                    >
                        View Details
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PropertyCard;
