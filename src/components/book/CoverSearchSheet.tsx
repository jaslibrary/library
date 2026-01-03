import React, { useState, useEffect } from 'react';
import { X, Search, Check } from 'lucide-react';
import { searchGoogleBooks, type GoogleBookResult } from '../../lib/google-books';
import clsx from 'clsx';

interface CoverSearchSheetProps {
    isOpen: boolean;
    onClose: () => void;
    currentTitle: string;
    onSelectCover: (url: string) => void;
}

export const CoverSearchSheet = ({ isOpen, onClose, currentTitle, onSelectCover }: CoverSearchSheetProps) => {
    const [query, setQuery] = useState(currentTitle);
    const [results, setResults] = useState<GoogleBookResult[]>([]);
    const [loading, setLoading] = useState(false);

    // Auto-search on open
    useEffect(() => {
        if (isOpen && currentTitle) {
            setQuery(currentTitle);
            handleSearch(currentTitle);
        }
    }, [isOpen, currentTitle]);

    const handleSearch = async (searchQuery: string) => {
        if (!searchQuery.trim()) return;
        setLoading(true);
        const books = await searchGoogleBooks(searchQuery);
        setResults(books);
        setLoading(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch(query);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Sheet Content */}
            <div className="relative w-full max-w-md bg-warm-beige rounded-t-3xl sm:rounded-2xl shadow-2xl h-[85vh] flex flex-col overflow-hidden animate-slide-up">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-white/50 backdrop-blur-md border-b border-stone-200">
                    <h3 className="text-lg font-serif text-deep-blue">Select Cover</h3>
                    <button onClick={onClose} className="p-2 -mr-2 text-ink-light hover:bg-black/5 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-4 bg-white">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-deep-blue placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
                            placeholder="Search by title, author, or ISBN..."
                        />
                    </div>
                </div>

                {/* Results Grid */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-48 space-y-4">
                            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-sm text-ink-light">Searching library...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-3">
                            {results.map((book, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => onSelectCover(book.cover_url)}
                                    className="group relative aspect-[2/3] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all active:scale-95"
                                >
                                    <img
                                        src={book.cover_url}
                                        alt={book.title}
                                        className="w-full h-full object-cover group-hover:opacity-90"
                                        loading="lazy"
                                    />
                                    {/* Select Overlay */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <Check className="text-white drop-shadow-md" size={24} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {!loading && results.length === 0 && (
                        <div className="text-center py-10 text-ink-light/60">
                            <p>No covers found.</p>
                            <p className="text-xs mt-1">Try a different keyword.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
