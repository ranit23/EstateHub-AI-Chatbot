import React from 'react';
import { MapPin, Square } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';

const LandsPage = () => {
    const { lands } = useApp();

    return (
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12">
            <h1 className="text-2xl sm:text-4xl font-extrabold mb-6 sm:mb-10 text-slate-900">Land & Plots for Sale</h1>

            {lands.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
                    {lands.map(land => (
                        <div key={land.id} className="group bg-white rounded-3xl shadow-sm hover:shadow-2xl hover:shadow-slate-200 border border-slate-100 overflow-hidden transition-all duration-300 transform hover:-translate-y-2 flex flex-col h-full cursor-pointer">
                            <div className="relative h-52 sm:h-72 overflow-hidden">
                                <Link to={`/property/${land.id}`}>
                                    <img
                                        src={land.image}
                                        alt={land.description}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                </Link>
                                <div className="absolute top-4 left-4">
                                    <span className="px-4 py-1.5 rounded-full text-white text-xs font-bold uppercase tracking-wider shadow-lg bg-emerald-500">
                                        For Sale
                                    </span>
                                </div>
                            </div>
                            <div className="p-6 flex flex-col flex-grow">
                                <div className="mb-4">
                                    <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                        <Link to={`/property/${land.id}`}>{land.title || 'Land / Plot'}</Link>
                                    </h3>
                                    <p className="text-2xl font-bold text-indigo-600 mb-1">₹{land.price.toLocaleString()}</p>
                                    <p className="text-slate-500 text-sm font-medium flex items-center"><MapPin className="w-4 h-4 mr-1" /> {land.location}</p>
                                </div>
                                <p className="text-slate-700 font-medium line-clamp-2 mb-6">{land.description}</p>

                                <div className="mt-auto border-t border-slate-100 pt-4 flex justify-between items-center">
                                    <div className="flex items-center text-slate-500 font-bold text-sm">
                                        <Square className="w-4 h-4 mr-2 text-indigo-500" /> {land.area} sqft
                                    </div>
                                    <Link to={`/property/${land.id}`} className="bg-slate-900 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-indigo-600 transition-all shadow-lg hover:shadow-indigo-200">
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-24 bg-slate-50 rounded-3xl border-dashed border-2 border-slate-200">
                    <p className="text-slate-500 text-xl font-medium mb-6">No land listings available yet.</p>
                    <Link to="/list-property" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 inline-block">List Your Land</Link>
                </div>
            )}
        </div>
    );
};

export default LandsPage;
