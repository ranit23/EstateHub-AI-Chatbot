import React, { useState, useEffect, useMemo } from 'react';
import { X, Scale, Sparkles, MapPin, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR, formatPerSqft } from '../utils/aiSearch';

const CompareModal = ({ items, onClose, onRemove }) => {
    const { aiCompare } = useApp();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const key = items.map((p) => p.id || p._id).join(',');

    useEffect(() => {
        let active = true;
        setLoading(true);
        aiCompare(items).then((res) => {
            if (active) {
                setData(res);
                setLoading(false);
            }
        });
        return () => {
            active = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    // local "best" ids for cell highlighting (works even before AI responds)
    const best = useMemo(() => {
        const withArea = items.filter((p) => Number(p.area) > 0);
        const withPrice = items.filter((p) => Number(p.price) > 0);
        const idOf = (p) => p.id || p._id;
        const minBy = (arr, fn) => (arr.length ? arr.reduce((a, b) => (fn(b) < fn(a) ? b : a)) : null);
        const maxBy = (arr, fn) => (arr.length ? arr.reduce((a, b) => (fn(b) > fn(a) ? b : a)) : null);

        const cheapest = minBy(withPrice, (p) => Number(p.price));
        const bestValue = minBy(withArea, (p) => Number(p.price) / Number(p.area));
        const largest = maxBy(withArea, (p) => Number(p.area));
        const beds = items.map((p) => Number(p.bedrooms) || 0);
        const allBedsEqual = beds.every((b) => b === beds[0]);
        const mostBeds = allBedsEqual ? null : maxBy(items, (p) => Number(p.bedrooms) || 0);

        return {
            price: cheapest ? idOf(cheapest) : null,
            value: bestValue ? idOf(bestValue) : null,
            area: largest ? idOf(largest) : null,
            beds: mostBeds ? idOf(mostBeds) : null,
        };
    }, [key]);

    const tags = data?.tags || {};
    const engineLabel =
        data?.engine === 'ai' ? 'Powered by Gemini' : 'Smart compare';

    const hi = 'text-emerald-600 font-extrabold';
    const idOf = (p) => p.id || p._id;

    const rows = [
        {
            label: 'Price',
            render: (p) => (
                <span className={idOf(p) === best.price ? hi : 'font-bold text-slate-800'}>
                    {formatINR(p.price)}
                    {p.type === 'rent' && <span className="text-slate-400 font-normal text-xs">/mo</span>}
                </span>
            ),
        },
        {
            label: 'Price / sqft',
            render: (p) => (
                <span className={idOf(p) === best.value ? hi : 'text-slate-700'}>
                    {formatPerSqft(p.price, p.area)}
                </span>
            ),
        },
        {
            label: 'Area',
            render: (p) => (
                <span className={idOf(p) === best.area ? hi : 'text-slate-700'}>
                    {p.area ? `${Number(p.area).toLocaleString('en-IN')} sqft` : '—'}
                </span>
            ),
        },
        {
            label: 'Bedrooms',
            render: (p) => (
                <span className={idOf(p) === best.beds ? hi : 'text-slate-700'}>
                    {p.bedrooms ? `${p.bedrooms} BHK` : '—'}
                </span>
            ),
        },
        { label: 'Bathrooms', render: (p) => <span className="text-slate-700">{p.bathrooms || '—'}</span> },
        {
            label: 'Listing type',
            render: (p) => (
                <span className="text-slate-700">{p.type === 'rent' ? 'For Rent' : 'For Sale'}</span>
            ),
        },
        { label: 'Category', render: (p) => <span className="text-slate-700">{p.propertyType || 'Land'}</span> },
        {
            label: 'Location',
            render: (p) => (
                <span className="text-slate-700 flex items-center justify-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" /> {p.location || '—'}
                </span>
            ),
        },
    ];

    return (
        <div
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-5xl max-h-[95vh] sm:max-h-[92vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 p-2 rounded-xl">
                            <Scale className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-base sm:text-xl font-extrabold text-slate-900">AI Property Comparison</h2>
                            <p className="text-sm text-slate-500">{items.length} properties side by side</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-100 transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* AI summary */}
                <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-indigo-50 to-violet-50 border-b border-indigo-100 flex-shrink-0">
                    <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                            <p className="text-xs font-bold uppercase tracking-wide text-indigo-600 mb-1">
                                AI Summary · {engineLabel}
                            </p>
                            {loading ? (
                                <p className="text-slate-500 text-sm animate-pulse">Analyzing properties…</p>
                            ) : (
                                <p className="text-slate-700 text-sm leading-relaxed">{data?.summary}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Comparison table */}
                <div className="overflow-auto flex-1">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr>
                                <th className="sticky left-0 z-10 bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-400 px-3 sm:px-4 py-3 w-24 sm:w-32 min-w-24 sm:min-w-32">
                                    Feature
                                </th>
                                {items.map((p) => (
                                    <th key={idOf(p)} className="px-2 sm:px-3 py-3 align-top min-w-[140px] sm:min-w-[170px] border-l border-slate-100">
                                        <div className="relative">
                                            <img
                                                src={p.image}
                                                alt={p.title || 'Listing'}
                                                className="w-full h-24 object-cover rounded-xl mb-2"
                                            />
                                            <button
                                                onClick={() => onRemove(idOf(p))}
                                                title="Remove from comparison"
                                                className="absolute top-1.5 right-1.5 bg-white/90 hover:bg-white text-slate-500 hover:text-red-500 p-1.5 rounded-full shadow transition"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <p className="font-bold text-slate-800 text-sm leading-tight line-clamp-2 text-center">
                                            {p.title || 'Land Plot'}
                                        </p>
                                        {(tags[idOf(p)] || []).length > 0 && (
                                            <div className="flex flex-wrap gap-1 justify-center mt-1.5">
                                                {tags[idOf(p)].map((t) => (
                                                    <span
                                                        key={t}
                                                        className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100"
                                                    >
                                                        {t}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, idx) => (
                                <tr key={row.label} className={idx % 2 ? 'bg-slate-50/60' : 'bg-white'}>
                                    <td className="sticky left-0 z-10 bg-inherit text-[10px] sm:text-xs font-bold uppercase tracking-wide text-slate-400 px-3 sm:px-4 py-3 w-24 sm:w-32 min-w-24 sm:min-w-32">
                                        {row.label}
                                    </td>
                                    {items.map((p) => (
                                        <td key={idOf(p)} className="px-2 sm:px-3 py-3 text-center border-l border-slate-100 text-xs sm:text-sm">
                                            {row.render(p)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-3 border-t border-slate-100 text-center flex-shrink-0">
                    <p className="text-[11px] text-slate-400">
                        Green values mark the best in each row. AI summaries are guidance, not financial advice.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CompareModal;
