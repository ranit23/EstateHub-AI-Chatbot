import React, { createContext, useContext, useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { parseQueryClient, filterListings, buildComparisonClient } from '../utils/aiSearch';

const AppContext = createContext();

const API_BASE = 'http://localhost:5000';
const COMPARE_LIMIT = 4;

export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')) || null);
    const [wishlist, setWishlist] = useState([]);
    const [properties, setProperties] = useState([]);
    const [lands, setLands] = useState([]);
    const [toast, setToast] = useState(null);
    const [compareList, setCompareList] = useState([]); // properties selected for AI comparison

    useEffect(() => {
        localStorage.setItem('user', JSON.stringify(user));
    }, [user]);

    // Load wishlist when user changes (login/logout)
    useEffect(() => {
        if (user && user.id) {
            const storedWishlist = JSON.parse(localStorage.getItem(`wishlist_${user.id}`)) || [];
            setWishlist(storedWishlist);
        } else {
            setWishlist([]); // Clear wishlist on logout
        }
    }, [user]);

    // Save wishlist whenever it changes, keyed by user ID
    useEffect(() => {
        if (user && user.id) {
            localStorage.setItem(`wishlist_${user.id}`, JSON.stringify(wishlist));
        }
    }, [wishlist, user]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        fetchProperties();
        fetchLands();
    }, []);

    const fetchProperties = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/properties');
            const data = await res.json();
            if (Array.isArray(data)) {
                setProperties(data);
            }
        } catch (err) {
            console.error('Failed to fetch properties:', err);
        }
    };

    const fetchLands = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/lands');
            const data = await res.json();
            if (Array.isArray(data)) setLands(data);
        } catch (err) {
            console.error('Failed to fetch lands:', err);
        }
    };

    const searchProperties = async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            if (filters.type) params.append('type', filters.type);
            if (filters.propertyType) params.append('propertyType', filters.propertyType);
            if (filters.location) params.append('location', filters.location);

            const res = await fetch(`http://localhost:5000/api/properties?${params.toString()}`);
            return await res.json();
        } catch (err) {
            showToast('Search failed', 'error');
            return [];
        }
    };

    const login = async (email, password) => {
        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) {
                setUser(data);
                localStorage.setItem('user', JSON.stringify(data));
                showToast('Welcome back!');
                return true;
            } else {
                showToast(data.error || 'Login failed', 'error');
                return false;
            }
        } catch (err) {
            showToast('Connection error', 'error');
            return false;
        }
    };

    const register = async (name, email, password, phone) => {
        try {
            const res = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, phone })
            });
            const data = await res.json();
            if (res.ok) {
                setUser(data);
                localStorage.setItem('user', JSON.stringify(data));
                showToast('Account created successfully!');
                return true;
            } else {
                showToast(data.error || 'Registration failed', 'error');
                return false;
            }
        } catch (err) {
            showToast('Connection error', 'error');
            return false;
        }
    };

    const updateProfile = async (id, name, email, phone) => {
        try {
            const res = await fetch('http://localhost:5000/api/auth/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, name, email, phone })
            });
            const data = await res.json();
            if (res.ok) {
                setUser(data);
                localStorage.setItem('user', JSON.stringify(data));
                showToast('Profile updated successfully!');
                return true;
            } else {
                showToast(data.error || 'Update failed', 'error');
                return false;
            }
        } catch (err) {
            showToast('Connection error', 'error');
            return false;
        }
    };

    const toggleWishlist = (propertyId) => {
        if (!user) {
            showToast('Please login to use wishlist', 'error');
            return;
        }

        if (wishlist.includes(propertyId)) {
            setWishlist(prev => prev.filter(id => id !== propertyId));
            showToast('Removed from wishlist', 'info');
        } else {
            setWishlist(prev => [...prev, propertyId]);
            showToast('Added to wishlist', 'success');
        }
    };

    const addProperty = async (newProperty) => {
        try {
            // Determine if we are sending JSON or FormData
            const isFormData = newProperty instanceof FormData;
            const headers = isFormData ? {} : { 'Content-Type': 'application/json' };
            const body = isFormData ? newProperty : JSON.stringify(newProperty);

            const res = await fetch('http://localhost:5000/api/properties', {
                method: 'POST',
                headers: headers,
                body: body
            });
            const savedProperty = await res.json();
            if (res.ok) {
                setProperties([savedProperty, ...properties]);
                return true;
            }
            return false;
        } catch (err) {
            showToast('Failed to add property', 'error');
            return false;
        }
    };

    const addLand = async (newLand) => {
        try {
            const isFormData = newLand instanceof FormData;
            const headers = isFormData ? {} : { 'Content-Type': 'application/json' };
            const body = isFormData ? newLand : JSON.stringify(newLand);

            const res = await fetch('http://localhost:5000/api/lands', {
                method: 'POST',
                headers: headers,
                body: body
            });
            const savedLand = await res.json();
            if (res.ok) {
                setLands([savedLand, ...lands]);
                return true;
            }
            return false;
        } catch (err) {
            showToast('Failed to add land', 'error');
            return false;
        }
    };

    const deleteProperty = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/api/properties/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setProperties(prev => prev.filter(p => p._id !== id && p.id !== id));
                showToast('Listing deleted successfully');
                return true;
            } else {
                const data = await res.json();
                showToast(data.error || 'Failed to delete listing', 'error');
                return false;
            }
        } catch (err) {
            console.error('Error deleting property:', err);
            showToast('Connection error', 'error');
            return false;
        }
    };

    const deleteLand = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/api/lands/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setLands(prev => prev.filter(l => l._id !== id && l.id !== id));
                showToast('Land deleted successfully');
                return true;
            } else {
                const data = await res.json();
                showToast(data.error || 'Failed to delete land', 'error');
                return false;
            }
        } catch (err) {
            console.error('Error deleting land:', err);
            showToast('Connection error', 'error');
            return false;
        }
    };

    // ----- Compare selection (for AI property comparison) -----
    const isInCompare = (id) => compareList.some(p => (p.id || p._id) === id);

    const toggleCompare = (property) => {
        const id = property.id || property._id;
        setCompareList(prev => {
            if (prev.some(p => (p.id || p._id) === id)) {
                return prev.filter(p => (p.id || p._id) !== id);
            }
            if (prev.length >= COMPARE_LIMIT) {
                showToast(`You can compare up to ${COMPARE_LIMIT} properties`, 'info');
                return prev;
            }
            return [...prev, property];
        });
    };

    const removeCompare = (id) =>
        setCompareList(prev => prev.filter(p => (p.id || p._id) !== id));

    const clearCompare = () => setCompareList([]);

    // ----- AI natural-language search (backend, with offline fallback) -----
    const aiSearch = async (query) => {
        try {
            const res = await fetch(`${API_BASE}/api/ai/search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query })
            });
            if (!res.ok) throw new Error('bad status');
            return await res.json();
        } catch (err) {
            // Fallback: parse + filter the already-loaded listings on the client
            const knownLocations = [...new Set([...properties, ...lands].map(p => p.location).filter(Boolean))];
            const filters = parseQueryClient(query, knownLocations);
            const landPool = lands.map(l => ({ ...l, type: 'sale', propertyType: 'Land', title: l.title || 'Land Plot' }));
            const { results, relaxed } = filterListings([...properties, ...landPool], filters);
            const summary = results.length
                ? `Found ${results.length} matching ${results.length === 1 ? 'listing' : 'listings'}.`
                : `No listings matched. Try widening your budget or location.`;
            return { query, engine: 'rules-offline', filters, relaxed, count: results.length, results, summary };
        }
    };

    // ----- AI comparison summary (backend, with offline fallback) -----
    const aiCompare = async (items) => {
        try {
            const res = await fetch(`${API_BASE}/api/ai/compare`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ properties: items })
            });
            if (!res.ok) throw new Error('bad status');
            return await res.json();
        } catch (err) {
            const { tags, summary } = buildComparisonClient(items);
            return { summary, tags, engine: 'rules-offline' };
        }
    };

    return (
        <AppContext.Provider value={{
            user, setUser, login, register, updateProfile,
            compareList, toggleCompare, removeCompare, clearCompare, isInCompare,
            aiSearch, aiCompare,
            wishlist, toggleWishlist,
            properties, setProperties, addProperty, deleteProperty,
            lands, setLands, addLand, deleteLand, fetchLands,
            showToast, searchProperties, fetchProperties
        }}>
            {children}
            {toast && <Toast message={toast.message} type={toast.type} />}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);

// Internal Toast Component
const Toast = ({ message, type }) => (
    <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl z-[100] animate-bounce-in flex items-center space-x-3 ${type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-red-600' : 'bg-slate-800'
        } text-white font-medium`}>
        {type === 'success' && <CheckCircle className="w-5 h-5" />}
        <span className="max-w-sm truncate">{message}</span>
    </div>
);
