import React, { useState } from 'react';
import { User, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const ListPropertyPage = () => {
    const { user, addProperty, addLand, showToast } = useApp();
    const navigate = useNavigate();
    const [listingCategory, setListingCategory] = useState('property'); // 'property' or 'land'

    const [formData, setFormData] = useState({
        title: '', description: '', price: '', type: 'sale', propertyType: 'house',
        location: '', area: '', bedrooms: '', bathrooms: '', image: null
    });

    if (!user) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center px-4 w-full bg-slate-50">
                <div className="bg-white p-12 rounded-3xl shadow-xl text-center max-w-lg w-full border border-slate-100">
                    <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <User className="w-12 h-12 text-indigo-600" />
                    </div>
                    <h2 className="text-3xl font-extrabold mb-4 text-slate-900">Sign in Required</h2>
                    <p className="text-slate-500 mb-10 text-lg font-medium">You need to be logged in to list on EstateHub.</p>
                    <button onClick={() => navigate('/login')} className="w-full bg-indigo-600 text-white px-8 py-4 rounded-xl hover:bg-indigo-700 font-bold text-lg shadow-xl shadow-indigo-200 transition-all">
                        Login Now
                    </button>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('price', formData.price);
        data.append('location', formData.location);
        data.append('area', formData.area);
        if (formData.image) {
            data.append('image', formData.image);
        }
        data.append('owner', user.id || user._id);

        if (listingCategory === 'land') {
            const success = await addLand(data);
            if (success) {
                showToast('Land listed successfully!');
                navigate('/');
            }
        } else {
            data.append('type', formData.type);
            data.append('propertyType', formData.propertyType);
            data.append('bedrooms', formData.bedrooms);
            data.append('bathrooms', formData.bathrooms);
            data.append('featured', 'false');

            const success = await addProperty(data);
            if (success) {
                showToast('Property listed successfully!');
                navigate('/');
            }
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto px-6 py-16">
            <div className="mb-12 text-center">
                <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-3 sm:mb-4">List Your Property Or Land</h1>
                <p className="text-base sm:text-xl text-slate-500 max-w-2xl mx-auto">Fill in the details below to publish your listing.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-100 p-5 sm:p-8 md:p-12 space-y-6 sm:space-y-8">

                {/* Category Switcher */}
                <div>
                    <label className="block text-slate-700 mb-2 font-bold text-sm uppercase tracking-wide">Listing Category</label>
                    <div className="p-1 bg-slate-100 rounded-xl flex gap-2">
                        <button type="button" onClick={() => setListingCategory('property')} className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${listingCategory === 'property' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>Property (House/Apt)</button>
                        <button type="button" onClick={() => setListingCategory('land')} className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${listingCategory === 'land' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>Land / Plot</button>
                    </div>
                </div>

                {/* Common Fields */}
                <div>
                    <label className="block text-slate-700 mb-2 font-bold text-sm uppercase tracking-wide">Title (e.g. 5 Acres in Texas or Modern Apartment)</label>
                    <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-lg" required />
                </div>

                <div>
                    <label className="block text-slate-700 mb-2 font-bold text-sm uppercase tracking-wide">Upload Image</label>
                    <input type="file" onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })} className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" accept="image/*" />
                </div>

                <div>
                    <label className="block text-slate-700 mb-2 font-bold text-sm uppercase tracking-wide">Description</label>
                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="5" className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-lg" required></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="block text-slate-700 mb-2 font-bold text-sm uppercase tracking-wide">Price (₹)</label>
                        <input type="number" placeholder="0.00" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-lg" required />
                    </div>
                    <div>
                        <label className="block text-slate-700 mb-2 font-bold text-sm uppercase tracking-wide">Location</label>
                        <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-lg" required />
                    </div>
                </div>

                {/* Land Specific: Area only */}
                {listingCategory === 'land' && (
                    <div>
                        <label className="block text-slate-700 mb-2 font-bold text-sm uppercase tracking-wide">Land Size (Sqft / Acres)</label>
                        <input type="number" value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-lg" required />
                    </div>
                )}

                {/* Property Specific Fields */}
                {listingCategory === 'property' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-slate-700 mb-2 font-bold text-sm uppercase tracking-wide">Listing Type</label>
                                <div className="relative">
                                    <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 appearance-none font-medium text-lg cursor-pointer">
                                        <option value="sale">For Sale</option>
                                        <option value="rent">For Rent</option>
                                    </select>
                                    <ChevronDown className="absolute right-6 top-5 w-5 h-5 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-slate-700 mb-2 font-bold text-sm uppercase tracking-wide">Property Type</label>
                                <div className="relative">
                                    <select value={formData.propertyType} onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })} className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 appearance-none font-medium text-lg cursor-pointer">
                                        <option value="house">House</option>
                                        <option value="apartment">Apartment</option>
                                        <option value="villa">Villa</option>
                                    </select>
                                    <ChevronDown className="absolute right-6 top-5 w-5 h-5 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                            <div>
                                <label className="block text-slate-700 mb-2 font-bold text-sm uppercase tracking-wide">Area (Sqft)</label>
                                <input type="number" value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-lg" required />
                            </div>
                            <div>
                                <label className="block text-slate-700 mb-2 font-bold text-sm uppercase tracking-wide">Beds</label>
                                <input type="number" value={formData.bedrooms} onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })} className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-lg" required />
                            </div>
                            <div>
                                <label className="block text-slate-700 mb-2 font-bold text-sm uppercase tracking-wide">Baths</label>
                                <input type="number" value={formData.bathrooms} onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })} className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-lg" required />
                            </div>
                        </div>
                    </>
                )}

                <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-2xl hover:bg-indigo-700 font-bold text-xl shadow-xl shadow-indigo-200 transition-all hover:-translate-y-1 mt-6">
                    Publish Listing
                </button>
            </form>
        </div>
    );
};

export default ListPropertyPage;
