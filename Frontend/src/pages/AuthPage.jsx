import React, { useState } from 'react';
import { Home } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate, Link } from 'react-router-dom';

const AuthPage = ({ type }) => {
    const { login, register } = useApp();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        let success = false;

        if (type === 'login') {
            success = await login(formData.email, formData.password);
        } else {
            success = await register(formData.name, formData.email, formData.password, formData.phone);
        }

        if (success) {
            navigate('/');
        }
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 bg-slate-50 w-full">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-10 max-w-md w-full border border-slate-100">
                <div className="text-center mb-10">
                    <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-200 rotate-3">
                        <Home className="text-white w-8 h-8 -rotate-3" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">{type === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
                    <p className="text-slate-500 font-medium">Enter your details to continue</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {type === 'register' && (
                        <div>
                            <label className="block text-slate-700 mb-2 font-bold text-sm uppercase">Full Name</label>
                            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-colors font-medium" required />
                        </div>
                    )}
                    {type === 'register' && (
                        <div>
                            <label className="block text-slate-700 mb-2 font-bold text-sm uppercase">Phone Number</label>
                            <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-colors font-medium" placeholder="Optional" />
                        </div>
                    )}
                    <div>
                        <label className="block text-slate-700 mb-2 font-bold text-sm uppercase">Email Address</label>
                        <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-colors font-medium" required />
                    </div>
                    <div>
                        <label className="block text-slate-700 mb-2 font-bold text-sm uppercase">Password</label>
                        <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-colors font-medium" required />
                    </div>

                    <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-200 text-lg transition-transform hover:-translate-y-0.5">
                        {type === 'login' ? 'Sign In' : 'Sign Up'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-slate-600 font-medium">
                        {type === 'login' ? "Don't have an account?" : "Already have an account?"}
                        <Link to={type === 'login' ? '/register' : '/login'} className="text-indigo-600 font-bold hover:underline ml-2">
                            {type === 'login' ? 'Register' : 'Login'}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
