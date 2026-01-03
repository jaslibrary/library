import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Check, Upload, ImagePlus } from 'lucide-react';
import { searchGoogleBooks, type GoogleBookResult } from '../../lib/google-books';
import { supabase } from '../../lib/supabase';

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
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        setUploading(true);

        try {
            // 1. Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('covers')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('covers')
                .getPublicUrl(filePath);

            onSelectCover(publicUrl);
        } catch (error: any) {
            console.error('Error uploading cover:', error);
            alert('Failed to upload cover: ' + (error.message || 'Unknown error'));
        } finally {
            setUploading(false);
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

                {/* Search Bar & Upload */}
                <div className="p-4 bg-white space-y-3">
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

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="w-full py-3 bg-deep-blue text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-deep-blue/90 transition-colors shadow-lg shadow-deep-blue/20"
                    >
                        {uploading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Upload size={18} />
                        )}
                        {uploading ? 'Uploading...' : 'Upload from Device'}
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/*"
                        className="hidden"
                    />
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
                                    className="group relative aspect-[2/3] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all active:scale-95 bg-gray-100"
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
                            <div className="flex justify-center mb-3">
                                <ImagePlus className="text-gray-300" size={48} strokeWidth={1.5} />
                            </div>
                            <p>No covers found.</p>
                            <p className="text-xs mt-1">Try a different keyword or upload your own!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
