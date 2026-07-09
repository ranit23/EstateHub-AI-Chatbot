import React, { useState } from 'react';
import { Home, User, Menu, X, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Link, NavLink, useNavigate } from 'react-router-dom';

const Header = () => {
    const { user, setUser, fetchProperties } = useApp();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        setUser(null);
        setProfileMenuOpen(false);
        navigate('/');
    };

    const closeMenu = () => {
        setMobileMenuOpen(false);
        setProfileMenuOpen(false);
    };

    const handleHomeClick = (e) => {
        closeMenu();
        if (window.location.pathname === '/') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-slate-900/90 border-b border-slate-700 shadow-sm font-sans">
            <div className="max-w-7xl mx-auto px-6 md:px-10">
                <div className="flex items-center h-20">

                    {/* Logo */}
                    <Link
                        to="/"
                        onClick={handleHomeClick}
                        className="flex items-center cursor-pointer group mr-10"
                    >
                        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-3 rounded-xl shadow-lg group-hover:scale-105 transition-transform">
                            <Home className="w-6 h-6 text-white" />
                        </div>
                        <span className="ml-3 text-3xl font-extrabold text-white tracking-tight">
                            Estate<span className="text-indigo-400">Hub</span>
                        </span>
                    </Link>

                    {/* Desktop Section */}
                    <div className="hidden md:flex items-center ml-auto space-x-10">

                        {/* Navigation */}
                        <nav className="flex items-center space-x-6">
                            {[
                                { path: '/buy', label: 'Buy' },
                                { path: '/rent', label: 'Rent' },
                                { path: '/lands', label: 'Land & Plots' },
                                { path: '/list-property', label: 'List Property' }
                            ].map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) => `relative text-base font-semibold transition-all duration-300
                    ${isActive ? 'text-white' : 'text-white/80 hover:text-white'}`
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            {item.label}
                                            <span
                                                className={`absolute -bottom-2 left-0 h-0.5 bg-indigo-500 transition-all duration-300
                          ${isActive ? 'w-full' : 'w-0 hover:w-full'}`}
                                            />
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </nav>

                        {/* Divider */}
                        <div className="h-8 w-px bg-white/20"></div>

                        {/* Auth Section */}
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                    className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-2 rounded-full shadow-sm hover:shadow-md transition text-white/80 hover:text-white"
                                >
                                    <div className="bg-indigo-600 p-2 rounded-full">
                                        <User className="w-4 h-4 text-white" />
                                    </div>

                                    <span className="font-semibold text-base">
                                        {user.name}
                                    </span>

                                    <ChevronDown
                                        className={`w-4 h-4 transition-transform ${profileMenuOpen ? 'rotate-180' : ''
                                            }`}
                                    />
                                </button>

                                {/* Dropdown */}
                                {profileMenuOpen && (
                                    <div className="absolute right-0 mt-4 w-60 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden animate-fade-in z-50">
                                        <div className="px-4 py-3 border-b border-slate-700">
                                            <p className="text-sm text-slate-400 font-bold uppercase">
                                                Signed in as
                                            </p>
                                            <p className="text-base font-semibold truncate text-white">
                                                {user.email}
                                            </p>
                                        </div>

                                        <Link
                                            to="/dashboard"
                                            onClick={closeMenu}
                                            className="block w-full text-left px-4 py-3 text-base text-white/80 hover:text-white hover:bg-slate-700 transition"
                                        >
                                            Dashboard
                                        </Link>
                                        <Link
                                            to="/wishlist"
                                            onClick={closeMenu}
                                            className="block w-full text-left px-4 py-3 text-base text-white/80 hover:text-white hover:bg-slate-700 transition"
                                        >
                                            Wishlist
                                        </Link>

                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-3 text-base text-red-400 hover:bg-slate-700 hover:text-red-300 transition"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-5">
                                <Link
                                    to="/login"
                                    className="text-white/80 text-base font-semibold hover:text-white transition"
                                >
                                    Login
                                </Link>

                                <Link
                                    to="/register"
                                    className="px-6 py-2.5 rounded-xl bg-indigo-600 text-base text-white font-bold shadow-lg hover:shadow-xl hover:bg-indigo-700 hover:-translate-y-0.5 transition"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden ml-auto p-2 rounded-xl text-white hover:bg-white/10 transition"
                    >
                        {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
                    </button>

                </div>
            </div>

            {/* Mobile Menu Panel */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-slate-900/95 backdrop-blur-xl border-b border-slate-700 animate-fade-in">
                    <div className="max-w-7xl mx-auto px-6 py-6 space-y-4">
                        <nav className="flex flex-col space-y-1">
                            {[
                                { path: '/buy', label: 'Buy' },
                                { path: '/rent', label: 'Rent' },
                                { path: '/lands', label: 'Land & Plots' },
                                { path: '/list-property', label: 'List Property' }
                            ].map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={closeMenu}
                                    className={({ isActive }) =>
                                        `block px-4 py-3 rounded-xl text-base font-semibold transition-all ${isActive
                                            ? 'text-white bg-indigo-600/20 border border-indigo-500/30'
                                            : 'text-white/80 hover:text-white hover:bg-white/5'
                                        }`
                                    }
                                >
                                    {item.label}
                                </NavLink>
                            ))}
                        </nav>

                        <div className="border-t border-slate-700 pt-4">
                            {user ? (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 px-4 py-3">
                                        <div className="bg-indigo-600 p-2 rounded-full">
                                            <User className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-white font-semibold text-sm">{user.name}</p>
                                            <p className="text-slate-400 text-xs truncate">{user.email}</p>
                                        </div>
                                    </div>
                                    <Link
                                        to="/dashboard"
                                        onClick={closeMenu}
                                        className="block px-4 py-3 rounded-xl text-base font-semibold text-white/80 hover:text-white hover:bg-white/5 transition"
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        to="/wishlist"
                                        onClick={closeMenu}
                                        className="block px-4 py-3 rounded-xl text-base font-semibold text-white/80 hover:text-white hover:bg-white/5 transition"
                                    >
                                        Wishlist
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-3 rounded-xl text-base font-semibold text-red-400 hover:bg-white/5 transition"
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    <Link
                                        to="/login"
                                        onClick={closeMenu}
                                        className="w-full text-center py-3 rounded-xl text-white/80 font-semibold text-base border border-white/20 hover:bg-white/5 transition"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={closeMenu}
                                        className="w-full text-center py-3 rounded-xl bg-indigo-600 text-white font-bold text-base shadow-lg hover:bg-indigo-700 transition"
                                    >
                                        Register
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
