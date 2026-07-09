import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Bed, Bath, Square, Star, Mail, Phone, X, User, Home } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useParams, Link, useNavigate } from 'react-router-dom';

const PropertyDetailsPage = () => {
    const { id } = useParams();
    const { properties, lands, showToast } = useApp();
    const [property, setProperty] = useState(null);
    const [showContactModal, setShowContactModal] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (properties.length > 0 || lands.length > 0) {
            const allListings = [...properties, ...lands];
            const found = allListings.find(p => p.id === id || p._id === id); // Handle string/number ID matching
            setProperty(found);
            setLoading(false);
        }
    }, [id, properties, lands]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!property) return <div className="min-h-screen flex items-center justify-center">Property not found</div>;

    const owner = property.owner || { name: 'EstateHub Agent', phone: 'N/A', email: 'contact@estatehub.com' };

    // Filter out legacy hardcoded phone number
    if (owner.phone === '(555) 000-0000') {
        owner.phone = null;
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-8 pb-24 w-full">
            <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 md:px-12">

                <Link to="/" className="flex items-center text-slate-500 hover:text-indigo-600 mb-8 transition-colors font-bold group w-fit">
                    <div className="bg-white p-2 rounded-full shadow-sm mr-3 group-hover:shadow-md transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                    Back to Listings
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Main Content */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Image Gallery */}
                        <div className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 h-[280px] sm:h-[400px] md:h-[600px] relative group">
                            <img src={property.image} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute top-6 left-6 flex gap-3">
                                <span className={`px-4 py-2 rounded-full text-white text-sm font-bold shadow-lg ${property.type === 'sale' ? 'bg-emerald-500' : 'bg-indigo-500'}`}>
                                    {property.type === 'sale' ? 'FOR SALE' : 'FOR RENT'}
                                </span>
                            </div>
                        </div>

                        {/* Title & Info */}
                        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-100/50">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-8">
                                <div>
                                    <div className="flex items-center text-indigo-500 font-semibold mb-2">
                                        <MapPin className="w-5 h-5 mr-2" />
                                        {property.location}
                                    </div>
                                    <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-slate-900 mb-2">{property.title || (!property.propertyType ? 'Land Plot' : 'Untitled Listing')}</h1>
                                </div>
                                <div className="text-left md:text-right bg-slate-50 p-4 rounded-2xl md:bg-transparent md:p-0">
                                    <p className="text-slate-500 text-sm font-bold uppercase mb-1">Price</p>
                                    <p className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-indigo-600">
                                        ₹{property.price.toLocaleString()}{property.type === 'rent' ? <span className="text-xl text-slate-400 font-normal">/mo</span> : ''}
                                    </p>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10">
                                {(() => {
                                    const stats = [
                                        { icon: Home, label: 'Type', val: property.propertyType || 'Land' }
                                    ];

                                    if (property.bedrooms) {
                                        stats.push({ icon: Bed, label: 'Bedrooms', val: property.bedrooms });
                                    }
                                    if (property.bathrooms) {
                                        stats.push({ icon: Bath, label: 'Bathrooms', val: property.bathrooms });
                                    }

                                    stats.push({
                                        icon: Square,
                                        label: property.propertyType ? 'Living Area' : 'Land Area',
                                        val: `${property.area} ${property.propertyType ? 'sqft' : 'sqft'}`
                                    });

                                    return stats.map((stat, i) => (
                                        <div key={i} className="bg-slate-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl text-center border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/50 transition-colors">
                                            <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600 mx-auto mb-2 sm:mb-3" />
                                            <p className="text-slate-500 text-[10px] sm:text-xs uppercase font-bold tracking-wider mb-1">{stat.label}</p>
                                            <p className="text-slate-900 font-extrabold text-base sm:text-xl">{stat.val}</p>
                                        </div>
                                    ));
                                })()}
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">About this property</h2>
                                <p className="text-slate-600 leading-relaxed text-lg">{property.description}</p>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / Contact */}
                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-100/50 lg:sticky top-24">
                            <h2 className="text-2xl font-bold text-slate-900 mb-8">Agent Information</h2>

                            <div className="flex items-center gap-5 mb-8 pb-8 border-b border-slate-100">
                                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-3xl shadow-inner">
                                    {owner.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 text-xl">{owner.name}</p>
                                    <p className="text-sm text-slate-500 font-medium">Property Owner</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={() => setShowContactModal(true)}
                                    className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 text-lg flex items-center justify-center"
                                >
                                    <Mail className="w-5 h-5 mr-2 text-white" /> Send Message
                                </button>
                                {/* Changed to dark button for white text */}
                                {owner.phone && (
                                    <a
                                        href={`tel:${owner.phone}`}
                                        className="w-full bg-slate-800 text-white py-4 rounded-xl font-bold hover:bg-slate-700 transition-all text-lg flex items-center justify-center"
                                    >
                                        <Phone className="w-5 h-5 mr-2 text-white" /> Call Agent
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Modal */}
            {showContactModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative scale-100">
                        <button
                            onClick={() => setShowContactModal(false)}
                            className="absolute top-5 right-5 p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Get in Touch</h3>
                        <p className="text-slate-500 mb-8">Contact the owner directly</p>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="bg-white p-2 rounded-full shadow-sm mr-4">
                                    <User className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase">Name</p>
                                    <p className="text-slate-800 font-bold text-lg">{owner.name}</p>
                                </div>
                            </div>
                            {owner.phone && (
                                <div className="flex items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="bg-white p-2 rounded-full shadow-sm mr-4">
                                        <Phone className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase">Phone</p>
                                        <p className="text-slate-800 font-bold text-lg">{owner.phone}</p>
                                    </div>
                                </div>
                            )}
                            {owner.email && (
                                <div className="flex items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="bg-white p-2 rounded-full shadow-sm mr-4">
                                        <Mail className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase">Email</p>
                                        <p className="text-slate-800 font-bold text-lg break-all">{owner.email}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => { showToast('Message sent to owner!'); setShowContactModal(false); }}
                            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 text-lg shadow-lg shadow-indigo-200 transition-transform hover:scale-[1.02]"
                        >
                            Send Enquiry
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PropertyDetailsPage;
