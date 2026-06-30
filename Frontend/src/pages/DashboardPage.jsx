import React, { useState, useEffect } from 'react';
import { Home, MapPin, Edit, Trash2, Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import PropertyCard from '../components/PropertyCard';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const DashboardPage = () => {
    const { user, properties, lands, wishlist, toggleWishlist, deleteProperty, deleteLand, updateProfile } = useApp();
    const [activeTab, setActiveTab] = useState('listings');
    const [profileData, setProfileData] = useState({ name: '', email: '', phone: '' });

    useEffect(() => {
        if (user) {
            setProfileData({ name: user.name, email: user.email, phone: user.phone || '' });
        }
    }, [user]);
    const navigate = useNavigate();
    const location = useLocation();

    // Handle initial tab based on URL (e.g. /wishlist vs /dashboard)
    useEffect(() => {
        if (location.pathname === '/wishlist') {
            setActiveTab('wishlist');
        } else {
            setActiveTab('listings');
        }
    }, [location.pathname]);

    const isOwner = (item) => {
        if (!item.owner || !user) return false;
        const ownerId = typeof item.owner === 'object' ? (item.owner.id || item.owner._id) : item.owner;
        const userId = user.id || user._id;
        return ownerId && userId && ownerId.toString() === userId.toString();
    };

    const userListings = [
        ...properties.filter(isOwner).map(p => ({ ...p, listingType: 'property' })),
        ...lands.filter(isOwner).map(l => ({ ...l, listingType: 'land' }))
    ];
    const wishlistedProps = properties.filter(p => wishlist.includes(p.id));

    if (!user) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Please login to view dashboard</h2>
                    <button onClick={() => navigate('/login')} className="bg-indigo-600 text-white px-6 py-2 rounded-lg">Login</button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12">
            <h1 className="text-2xl sm:text-4xl font-extrabold mb-6 sm:mb-10 text-slate-900">My Dashboard</h1>

            <div className="bg-slate-900 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-700 overflow-hidden min-h-[400px] sm:min-h-[500px]">
                {/* Tabs */}
                <div className="border-b border-slate-700">
                    <div className="flex overflow-x-auto">
                        <button onClick={() => setActiveTab('listings')} className={`px-4 sm:px-8 py-4 sm:py-6 font-bold text-sm sm:text-lg whitespace-nowrap transition-colors border-b-4 ${activeTab === 'listings' ? 'text-indigo-400 border-indigo-400 bg-slate-800' : 'text-slate-400 border-transparent hover:text-white/80'}`}>
                            My Listings
                        </button>
                        <button onClick={() => setActiveTab('wishlist')} className={`px-4 sm:px-8 py-4 sm:py-6 font-bold text-sm sm:text-lg whitespace-nowrap transition-colors border-b-4 ${activeTab === 'wishlist' ? 'text-indigo-400 border-indigo-400 bg-slate-800' : 'text-slate-400 border-transparent hover:text-white/80'}`}>
                            Wishlist ({wishlist.length})
                        </button>
                        <button onClick={() => setActiveTab('profile')} className={`px-4 sm:px-8 py-4 sm:py-6 font-bold text-sm sm:text-lg whitespace-nowrap transition-colors border-b-4 ${activeTab === 'profile' ? 'text-indigo-400 border-indigo-400 bg-slate-800' : 'text-slate-400 border-transparent hover:text-white/80'}`}>
                            Profile
                        </button>
                    </div>
                </div>

                <div className="p-4 sm:p-8 md:p-12">
                    {activeTab === 'listings' && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                                <h2 className="text-2xl font-bold text-white/80 hover:text-white transition-colors">Your Active Listings</h2>
                                <button onClick={() => navigate('/list-property')} className="bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-900/50 transition-all hover:-translate-y-0.5">
                                    + Create New Listing
                                </button>
                            </div>

                            {userListings.length > 0 ? (
                                <div className="space-y-6">
                                    {userListings.map(property => (
                                        <div key={property.id} className="border border-slate-700 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 hover:shadow-lg transition-all bg-slate-800/50 hover:bg-slate-800">
                                            <img src={property.image} alt={property.title} className="w-full sm:w-48 h-32 object-cover rounded-xl" />
                                            <div className="flex-1 text-center sm:text-left w-full">
                                                <h3 className="text-xl font-bold mb-2 text-white">
                                                    {property.title || 'Land / Plot'}
                                                    {property.listingType === 'land' && <span className="ml-2 text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full uppercase">Land</span>}
                                                </h3>
                                                <p className="text-slate-400 mb-2 flex items-center justify-center sm:justify-start font-medium"><MapPin className="w-4 h-4 mr-1 text-indigo-400" /> {property.location}</p>
                                                <p className="text-2xl font-extrabold text-indigo-400">₹{property.price.toLocaleString()}</p>
                                            </div>
                                            <div className="flex gap-3">
                                                <button className="p-3 text-white bg-indigo-600/20 hover:bg-indigo-600 rounded-xl transition-colors border border-indigo-500/30" title="Edit">
                                                    <Edit className="w-5 h-5 text-indigo-400 group-hover:text-white" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('Are you sure you want to delete this listing?')) {
                                                            if (property.listingType === 'land') {
                                                                deleteLand(property.id || property._id);
                                                            } else {
                                                                deleteProperty(property.id || property._id);
                                                            }
                                                        }
                                                    }}
                                                    className="p-3 text-white bg-red-600/20 hover:bg-red-600 rounded-xl transition-colors border border-red-500/30"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-5 h-5 text-red-400 group-hover:text-white" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-24 bg-slate-800/30 rounded-3xl border-dashed border-2 border-slate-700">
                                    <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                        <Home className="w-10 h-10 text-slate-500" />
                                    </div>
                                    <p className="text-slate-400 text-xl font-medium mb-6">You haven't listed any properties yet.</p>
                                    <button onClick={() => navigate('/list-property')} className="text-indigo-400 font-bold hover:text-indigo-300">Start Listing</button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'wishlist' && (
                        <div>
                            <h2 className="text-2xl font-bold mb-8 text-white/80 hover:text-white transition-colors">Saved Properties</h2>
                            {wishlistedProps.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
                                    {wishlistedProps.map(property => (
                                        <PropertyCard
                                            key={property.id}
                                            property={property}
                                            onViewDetails={() => { }} // Not needed as card links directly
                                            isWishlisted={wishlist.includes(property.id)}
                                            onToggleWishlist={toggleWishlist}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-24 bg-slate-800/30 rounded-3xl border-dashed border-2 border-slate-700">
                                    <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                        <Heart className="w-10 h-10 text-slate-500" />
                                    </div>
                                    <p className="text-slate-400 text-xl font-medium mb-6">Your wishlist is empty.</p>
                                    <Link to="/buy" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 inline-block">Browse Properties</Link>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="max-w-2xl">
                            <h2 className="text-2xl font-bold mb-8 text-white/80 hover:text-white transition-colors">Account Details</h2>
                            <div className="space-y-8">
                                <div>
                                    <label className="block text-slate-400 mb-2 font-bold text-sm uppercase tracking-wide">Full Name</label>
                                    <input
                                        type="text"
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                        className="w-full px-6 py-4 border border-slate-700 rounded-xl bg-slate-800 text-white font-bold text-lg focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 mb-2 font-bold text-sm uppercase tracking-wide">Email Address</label>
                                    <input
                                        type="email"
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                        className="w-full px-6 py-4 border border-slate-700 rounded-xl bg-slate-800 text-white font-bold text-lg focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 mb-2 font-bold text-sm uppercase tracking-wide">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                        className="w-full px-6 py-4 border border-slate-700 rounded-xl bg-slate-800 text-white font-bold text-lg focus:outline-none focus:border-indigo-500"
                                        placeholder="Add phone number"
                                    />
                                </div>
                                <div className="pt-4">
                                    <button
                                        onClick={() => updateProfile(user.id || user._id, profileData.name, profileData.email, profileData.phone)}
                                        className="bg-indigo-600 text-white px-10 py-4 rounded-xl hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-900/50 transition-all"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
