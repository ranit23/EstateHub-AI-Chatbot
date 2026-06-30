import React, { useState } from 'react';
import { Scale, X, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import CompareModal from './CompareModal';

const CompareTray = () => {
    const { compareList, removeCompare, clearCompare } = useApp();
    const [showModal, setShowModal] = useState(false);

    if (compareList.length === 0) return null;

    return (
        <>
            {/* Left-anchored on larger screens so it never collides with the AI Search button / panel (bottom-right) */}
            <div className="fixed bottom-6 left-4 right-4 sm:right-auto z-[90] sm:max-w-xl">
                <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 p-3 flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 text-white font-bold pl-2 pr-1 flex-shrink-0">
                        <Scale className="w-5 h-5 text-indigo-400" />
                        Compare
                    </div>

                    {/* selected thumbnails */}
                    <div className="flex items-center gap-2 flex-1 overflow-x-auto">
                        {compareList.map((p) => (
                            <div key={p.id || p._id} className="relative flex-shrink-0 group">
                                <img
                                    src={p.image}
                                    alt={p.title || 'Listing'}
                                    className="w-12 h-12 rounded-lg object-cover border-2 border-slate-700"
                                />
                                <button
                                    onClick={() => removeCompare(p.id || p._id)}
                                    className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 shadow"
                                    title="Remove"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                        <span className="text-slate-400 text-xs font-medium flex-shrink-0 pl-1">
                            {compareList.length} selected
                        </span>
                    </div>

                    <button
                        onClick={clearCompare}
                        className="text-slate-400 hover:text-white text-sm font-medium px-2 flex-shrink-0 hidden sm:block"
                    >
                        Clear
                    </button>

                    <button
                        onClick={() => setShowModal(true)}
                        disabled={compareList.length < 2}
                        className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors flex-shrink-0"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>Compare</span>
                        {compareList.length >= 2 && <span>({compareList.length})</span>}
                    </button>
                </div>
                {compareList.length < 2 && (
                    <p className="text-center text-xs text-slate-500 mt-2 font-medium">
                        Select at least 2 properties to compare
                    </p>
                )}
            </div>

            {showModal && (
                <CompareModal
                    items={compareList}
                    onClose={() => setShowModal(false)}
                    onRemove={(id) => {
                        removeCompare(id);
                        if (compareList.length <= 2) setShowModal(false);
                    }}
                />
            )}
        </>
    );
};

export default CompareTray;
