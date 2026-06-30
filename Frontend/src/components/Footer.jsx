import React from 'react';
import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => (
    <footer className="bg-slate-900 text-slate-300 w-full mt-auto border-t border-slate-800">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 md:px-12 py-10 sm:py-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12">
                <div className="col-span-1 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center mb-6 text-white">
                        <div className="bg-indigo-600 p-2 rounded-lg mr-3">
                            <Home className="w-5 h-5" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight">EstateHub</span>
                    </div>
                    <p className="text-white/80 hover:text-white transition-colors leading-relaxed mb-6">
                        Connecting dreamers with their dream homes. The most trusted real estate marketplace for buying, selling, and renting.
                    </p>
                    <div className="flex space-x-4">
                        {/* Social placeholders */}
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-600 text-white transition-all cursor-pointer">FB</div>
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-600 text-white transition-all cursor-pointer">TW</div>
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-600 text-white transition-all cursor-pointer">IG</div>
                    </div>
                </div>
                <div>
                    <h3 className="text-white font-bold text-lg mb-6">Marketplace</h3>
                    <ul className="space-y-4">
                        <li><Link to="/buy" className="text-white/80 hover:text-white transition-colors flex items-center"><span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2"></span>Buy Property</Link></li>
                        <li><Link to="/rent" className="text-white/80 hover:text-white transition-colors flex items-center"><span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2"></span>Rent Property</Link></li>
                        <li><Link to="/list-property" className="text-white/80 hover:text-white transition-colors flex items-center"><span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2"></span>Sell Property</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-white font-bold text-lg mb-6">Company</h3>
                    <ul className="space-y-4">
                        <li><a href="#" className="text-white/80 hover:text-white transition-colors">About Us</a></li>
                        <li><a href="#" className="text-white/80 hover:text-white transition-colors">Contact Support</a></li>
                        <li><a href="#" className="text-white/80 hover:text-white transition-colors">Careers</a></li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-white font-bold text-lg mb-6">Newsletter</h3>
                    <p className="text-white/80 text-sm mb-4">Subscribe to get the latest property news.</p>
                    <div className="flex">
                        <input type="text" placeholder="Your email" className="bg-slate-800 text-white px-4 py-3 rounded-l-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full border border-slate-700" />
                        <button className="bg-indigo-600 text-white px-4 py-3 rounded-r-xl hover:bg-indigo-700 transition-colors font-bold">Go</button>
                    </div>
                </div>
            </div>
            <div className="border-t border-slate-800 mt-10 sm:mt-16 pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/60">
                <p>&copy; 2024 EstateHub. All rights reserved.</p>
                <div className="flex space-x-6 mt-4 md:mt-0">
                    <a href="#" className="hover:text-white">Privacy Policy</a>
                    <a href="#" className="hover:text-white">Terms of Service</a>
                </div>
            </div>
        </div>
    </footer>
);

export default Footer;
