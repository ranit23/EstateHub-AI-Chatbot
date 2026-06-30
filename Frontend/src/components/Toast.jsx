import React from 'react';
import { CheckCircle } from 'lucide-react';

const Toast = ({ message, type }) => (
    <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl z-[100] animate-bounce-in flex items-center space-x-3 ${type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-red-600' : 'bg-slate-800'
        } text-white font-medium`}>
        {type === 'success' && <CheckCircle className="w-5 h-5" />}
        <span className="max-w-sm truncate">{message}</span>
    </div>
);

export default Toast;
