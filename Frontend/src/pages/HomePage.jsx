import React, { useState } from 'react';
import { Home, MapPin, Search, Phone, Trees, Filter, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import PropertyCard from '../components/PropertyCard';
import { useNavigate, Link } from 'react-router-dom';

const HomePage = () => {
    const { properties, wishlist, toggleWishlist } = useApp();
    const navigate = useNavigate();

    // Directly show the latest properties from the database
    const featuredProperties = properties.slice(0, 3);

    const [searchLocation, setSearchLocation] = useState('');
    const [searchType, setSearchType] = useState('Property Type');

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (searchLocation) params.append('location', searchLocation);
        if (searchType && searchType !== 'Property Type') params.append('propertyType', searchType);

        navigate(`/search?${params.toString()}`);
    };

    return (
        <div className="bg-slate-50 w-full">
            {/* Hero Section */}
            <section className="relative w-full h-[500px] sm:h-[600px] md:h-[700px] flex items-center justify-center overflow-hidden">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1170&auto=format&fit=crop"
                        className="w-full h-full object-cover"
                        alt="Hero Background"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 mix-blend-multiply"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent"></div>
                </div>

                <div className="relative z-10 w-full max-w-[1920px] px-4 sm:px-6 text-center">
                    <span className="inline-block py-1 px-3 rounded-full bg-indigo-500/30 border border-indigo-400/50 backdrop-blur-sm text-white font-semibold text-xs sm:text-sm mb-4 sm:mb-6 animate-fade-in-up">
                        👋 Welcome to EstateHub
                    </span>
                    <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold text-white mb-4 sm:mb-6 tracking-tight drop-shadow-xl animate-fade-in-up delay-100 leading-tight">
                        Discover Your <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-white">Perfect Sanctuary</span>
                    </h1>
                    <p className="text-base sm:text-lg md:text-2xl text-white/80 hover:text-white transition-colors mb-8 sm:mb-12 max-w-2xl mx-auto font-medium leading-relaxed animate-fade-in-up delay-200">
                        Browse our exclusive selection of luxury homes, urban apartments, and beachfront villas.
                    </p>

                    {/* Modern Search Bar */}
                    <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-xl p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl border border-white/20 shadow-2xl animate-fade-in-up delay-300">
                        <div className="bg-white rounded-xl sm:rounded-2xl flex flex-col md:flex-row p-1.5 sm:p-2 gap-2 shadow-inner">
                            <div className="flex-[2] relative group">
                                <MapPin className="absolute left-4 top-4 text-slate-400 w-5 h-5 group-focus-within:text-indigo-600 transition-colors" />
                                <input
                                    type="text"
                                    value={searchLocation}
                                    onChange={(e) => setSearchLocation(e.target.value)}
                                    placeholder="Search by location..."
                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 focus:bg-white text-slate-800 border-none focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-400 font-medium transition-all outline-none"
                                />
                            </div>
                            <div className="flex-1 md:border-l border-slate-100 md:pl-2">
                                <select
                                    value={searchType}
                                    onChange={(e) => setSearchType(e.target.value)}
                                    className="w-full px-4 py-3.5 rounded-xl bg-transparent text-slate-700 font-semibold cursor-pointer outline-none focus:bg-slate-50"
                                >
                                    <option>Property Type</option>
                                    <option>House</option>
                                    <option>Apartment</option>
                                    <option>Villa</option>
                                    <option>Land</option>
                                </select>
                            </div>
                            <button onClick={handleSearch} className="flex-1 bg-indigo-600 text-white px-8 py-3.5 rounded-xl hover:bg-indigo-700 font-bold transition-all shadow-lg shadow-indigo-200 flex items-center justify-center group">
                                <Search className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform text-white" /> Search
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 md:px-12 py-16 sm:py-24 -mt-16 sm:-mt-20 relative z-20">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-6">
                    {[
                        { title: 'Buy a Home', icon: Home, color: 'text-indigo-600', bg: 'bg-indigo-50', page: '/buy', desc: 'Find your place' },
                        { title: 'Rent a Home', icon: Phone, color: 'text-emerald-600', bg: 'bg-emerald-50', page: '/rent', desc: 'Rental listings' },
                        { title: 'Land & Plots', icon: Trees, color: 'text-green-600', bg: 'bg-green-50', page: '/lands', desc: 'Build your dream' },
                        { title: 'Sell Property', icon: Search, color: 'text-purple-600', bg: 'bg-purple-50', page: '/list-property', desc: 'List your own' },
                        { title: 'New Projects', icon: Filter, color: 'text-rose-600', bg: 'bg-rose-50', page: '/buy', desc: 'Fresh builds' }
                    ].map((cat, i) => (
                        <Link key={i} to={cat.page} className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 text-center cursor-pointer hover:shadow-2xl hover:shadow-indigo-100 hover:-translate-y-2 transition-all duration-300 group block">
                            <div className={`w-11 h-11 sm:w-14 sm:h-14 ${cat.bg} rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 rotate-3 group-hover:rotate-0`}>
                                <cat.icon className={`w-5 h-5 sm:w-7 sm:h-7 ${cat.color}`} />
                            </div>
                            <h3 className="text-slate-800 font-bold text-sm sm:text-lg mb-1">{cat.title}</h3>
                            <p className="text-slate-400 text-[11px] sm:text-xs font-medium hidden sm:block">{cat.desc}</p>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Featured Listings */}
            <section className="bg-white py-16 sm:py-24 w-full">
                <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 md:px-12">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 sm:mb-12">
                        <div>
                            <span className="text-indigo-600 font-bold uppercase tracking-wider text-xs sm:text-sm mb-2 block">Curated Listings</span>
                            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">Featured Properties</h2>
                        </div>
                        <Link to="/buy" className="hidden md:flex text-white font-bold hover:bg-slate-800 items-center bg-slate-900 px-6 py-3 rounded-full transition-all border border-slate-900">
                            View All Properties <ChevronDown className="w-5 h-5 ml-2 -rotate-90 text-white" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
                        {featuredProperties.map(property => (
                            <PropertyCard
                                key={property.id}
                                property={property}
                                onViewDetails={() => { }} // PropertyCard now links directly
                                isWishlisted={wishlist.includes(property.id)}
                                onToggleWishlist={toggleWishlist}
                            />
                        ))}
                    </div>

                    <Link to="/buy" className="md:hidden w-full mt-10 bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 flex justify-center">
                        View All Properties
                    </Link>
                </div>
            </section>

            {/* Stats Section */}
            <section className="w-full bg-slate-50 py-14 sm:py-20 border-y border-slate-200">
                <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 md:px-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
                        {[
                            { val: '25k+', label: 'Properties Listed' },
                            { val: '12k+', label: 'Happy Customers' },
                            { val: '150+', label: 'Awards Won' },
                            { val: '24/7', label: 'Support Agent' }
                        ].map((stat, i) => (
                            <div key={i}>
                                <h4 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-indigo-600 mb-1 sm:mb-2">{stat.val}</h4>
                                <p className="text-slate-500 font-medium text-sm sm:text-lg">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-indigo-600 py-16 sm:py-28 w-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-indigo-900 opacity-20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>

                <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
                    <h2 className="text-2xl sm:text-4xl md:text-6xl font-extrabold text-white mb-4 sm:mb-6 leading-tight">Ready to List Your Property?</h2>
                    <p className="text-indigo-100 text-base sm:text-xl mb-8 sm:mb-12 max-w-2xl mx-auto font-medium">Join thousands of property owners who have successfully sold or rented their properties through EstateHub.</p>
                    <div className="flex flex-col sm:flex-row gap-5 justify-center">
                        {/* Buttons forced to have white text */}
                        <Link to="/list-property" className="bg-slate-900 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-2xl hover:-translate-y-1 text-base sm:text-lg inline-block">
                            Start Listing Now
                        </Link>
                        <Link to="/register" className="bg-white/20 backdrop-blur-sm border border-white/40 !text-white px-8 sm:px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-bold hover:bg-white/30 transition-all hover:-translate-y-1 text-base sm:text-lg inline-block">
                            Create Account
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
