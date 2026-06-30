import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, MapPin, Bed, Square, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/aiSearch';

const EXAMPLES = [
    'Find me a 2BHK apartment near OMR under 60 lakh',
    'Villa with swimming pool',
    'Rental apartment near IT parks',
    'Land suitable for commercial use',
];

// Build the chips that show how the AI understood the query
function filterChips(f) {
    if (!f) return [];
    const chips = [];
    if (f.type === 'rent') chips.push('For Rent');
    else if (f.type === 'sale') chips.push('For Sale');
    if (f.minBedrooms) chips.push(`${f.minBedrooms}+ BHK`);
    if (f.propertyType) chips.push(f.propertyType);
    if (f.location) chips.push(`📍 ${f.location}`);
    if (f.minPrice && f.maxPrice) chips.push(`${formatINR(f.minPrice)} – ${formatINR(f.maxPrice)}`);
    else if (f.maxPrice) chips.push(`≤ ${formatINR(f.maxPrice)}`);
    else if (f.minPrice) chips.push(`≥ ${formatINR(f.minPrice)}`);
    (f.keywords || []).forEach((k) => chips.push(k));
    return chips;
}

function viewAllParams(f) {
    const p = new URLSearchParams();
    if (f.type) p.append('type', f.type);
    if (f.propertyType) p.append('propertyType', f.propertyType);
    if (f.location) p.append('location', f.location);
    if (f.minPrice != null) p.append('minPrice', f.minPrice);
    if (f.maxPrice != null) p.append('maxPrice', f.maxPrice);
    if (f.minBedrooms != null) p.append('minBedrooms', f.minBedrooms);
    if (f.keywords && f.keywords.length) p.append('q', f.keywords.join(','));
    return p.toString();
}

const ResultCard = ({ r, onClick }) => (
    <Link
        to={`/property/${r.id || r._id}`}
        onClick={onClick}
        className="flex gap-3 p-2 rounded-xl hover:bg-slate-100 transition-colors border border-slate-100 bg-white"
    >
        <img
            src={r.image}
            alt={r.title || 'Listing'}
            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
        />
        <div className="min-w-0 flex-1">
            <p className="font-bold text-slate-800 text-sm truncate">{r.title || 'Listing'}</p>
            <p className="text-indigo-600 font-extrabold text-sm">
                {formatINR(r.price)}
                {r.type === 'rent' && <span className="text-slate-400 font-normal text-xs">/mo</span>}
            </p>
            <p className="text-xs text-slate-500 flex items-center truncate">
                <MapPin className="w-3 h-3 mr-1 text-indigo-400 flex-shrink-0" />
                <span className="truncate">{r.location}</span>
            </p>
            <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                {r.bedrooms ? (
                    <span className="flex items-center"><Bed className="w-3 h-3 mr-1" />{r.bedrooms}</span>
                ) : null}
                {r.area ? (
                    <span className="flex items-center"><Square className="w-3 h-3 mr-1" />{r.area} sqft</span>
                ) : null}
            </p>
        </div>
    </Link>
);

const TypingDots = () => (
    <div className="flex gap-1 px-2 py-1">
        {[0, 150, 300].map((d) => (
            <span
                key={d}
                className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                style={{ animationDelay: `${d}ms` }}
            />
        ))}
    </div>
);

const AIChatbot = () => {
    const { aiSearch, compareList } = useApp();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            summary: "Hi! I'm your AI property assistant. Describe what you're looking for in plain English and I'll find it.",
        },
    ]);
    const scrollRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages, loading]);

    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 100);
    }, [open]);

    const send = async (text) => {
        const query = (text ?? input).trim();
        if (!query || loading) return;
        setInput('');
        setMessages((m) => [...m, { role: 'user', text: query }]);
        setLoading(true);
        const data = await aiSearch(query);
        setLoading(false);
        setMessages((m) => [
            ...m,
            {
                role: 'assistant',
                summary: data.summary,
                filters: data.filters,
                results: data.results || [],
                relaxed: data.relaxed || [],
            },
        ]);
    };

    const onKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    const closePanel = () => setOpen(false);

    return (
        <>
            {/* Launcher */}
            {!open && (
                <button
                    onClick={() => setOpen(true)}
                    className={`fixed right-6 z-[90] flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white pl-4 pr-5 py-3.5 rounded-full shadow-2xl shadow-indigo-300 hover:-translate-y-0.5 transition-all font-bold ${compareList.length ? 'bottom-32 md:bottom-6' : 'bottom-6'}`}
                >
                    <Sparkles className="w-5 h-5" />
                    AI Search
                </button>
            )}

            {/* Chat panel */}
            {open && (
                <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-[95] w-full sm:w-96 h-full sm:h-[min(70vh,560px)] bg-white sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-fade-in">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-4 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-xl">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-white font-bold leading-tight">AI Property Assistant</p>
                                <p className="text-indigo-100 text-xs">Search by describing what you want</p>
                            </div>
                        </div>
                        <button
                            onClick={closePanel}
                            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50">
                        {messages.map((msg, i) =>
                            msg.role === 'user' ? (
                                <div key={i} className="flex justify-end">
                                    <div className="bg-indigo-600 text-white px-4 py-2.5 rounded-2xl rounded-br-md max-w-[85%] text-sm font-medium">
                                        {msg.text}
                                    </div>
                                </div>
                            ) : (
                                <div key={i} className="flex flex-col items-start gap-2">
                                    <div className="bg-white border border-slate-100 text-slate-700 px-4 py-2.5 rounded-2xl rounded-bl-md max-w-[90%] text-sm shadow-sm">
                                        {msg.summary}
                                    </div>

                                    {msg.filters && filterChips(msg.filters).length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 max-w-[95%]">
                                            {filterChips(msg.filters).map((c, j) => (
                                                <span
                                                    key={j}
                                                    className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-100"
                                                >
                                                    {c}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {msg.relaxed && msg.relaxed.length > 0 && (
                                        <p className="text-[11px] text-amber-600 max-w-[95%]">
                                            Broadened search by ignoring: {msg.relaxed.join(', ')}.
                                        </p>
                                    )}

                                    {msg.results && msg.results.length > 0 && (
                                        <div className="w-full space-y-2">
                                            {msg.results.slice(0, 4).map((r) => (
                                                <ResultCard key={r.id || r._id} r={r} onClick={closePanel} />
                                            ))}

                                            {msg.filters && (
                                                <button
                                                    onClick={() => {
                                                        navigate(`/search?${viewAllParams(msg.filters)}`);
                                                        closePanel();
                                                    }}
                                                    className="w-full flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-indigo-600 text-white text-sm font-bold py-2.5 rounded-xl transition-colors"
                                                >
                                                    View all {msg.results.length} results
                                                    <ArrowRight className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        )}

                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-md shadow-sm">
                                    <TypingDots />
                                </div>
                            </div>
                        )}

                        {/* Example prompts (only before the first user message) */}
                        {messages.length === 1 && !loading && (
                            <div className="space-y-2 pt-2">
                                <p className="text-xs text-slate-400 font-semibold px-1">Try asking:</p>
                                {EXAMPLES.map((ex) => (
                                    <button
                                        key={ex}
                                        onClick={() => send(ex)}
                                        className="block w-full text-left text-sm bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-600 hover:text-indigo-700 px-3 py-2 rounded-xl transition-colors"
                                    >
                                        “{ex}”
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t border-slate-100 bg-white flex-shrink-0">
                        <div className="flex items-end gap-2 bg-slate-100 rounded-2xl p-1.5">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={onKeyDown}
                                rows={1}
                                placeholder="e.g. 3BHK villa in Adyar under 2 crore"
                                className="flex-1 bg-transparent resize-none outline-none text-sm text-slate-800 placeholder:text-slate-400 px-3 py-2 max-h-24"
                            />
                            <button
                                onClick={() => send()}
                                disabled={loading || !input.trim()}
                                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition-colors flex-shrink-0"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AIChatbot;
