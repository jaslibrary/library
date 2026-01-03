import React, { useMemo } from 'react';
import { X, Trophy, BookOpen, Users, TrendingUp, BarChart3, Medal } from 'lucide-react';
import type { Book } from '../../types/book';
import clsx from 'clsx';

interface StatsModalProps {
    isOpen: boolean;
    onClose: () => void;
    books: Book[];
}

export const StatsModal = ({ isOpen, onClose, books }: StatsModalProps) => {

    const stats = useMemo(() => {
        // Filter out wishlist books first
        const libraryBooks = books.filter(b => b.status !== 'wishlist');
        const readBooks = libraryBooks.filter(b => b.status === 'read');
        const totalBooks = libraryBooks.length;

        // 1. Completion Rate
        const completionRate = totalBooks > 0 ? Math.round((readBooks.length / totalBooks) * 100) : 0;

        // 2. Unique Authors
        const authors = new Set(libraryBooks.map(b => b.author?.trim()).filter(Boolean));

        // 3. Most Frequent Author
        const authorCounts: Record<string, number> = {};
        libraryBooks.forEach(b => {
            if (b.author) {
                const name = b.author.trim();
                authorCounts[name] = (authorCounts[name] || 0) + 1;
            }
        });

        let topAuthor = "None";
        let topAuthorCount = 0;
        Object.entries(authorCounts).forEach(([name, count]) => {
            if (count > topAuthorCount) {
                topAuthor = name;
                topAuthorCount = count;
            }
        });

        // 4. Total Pages
        const totalPages = readBooks.reduce((sum, b) => sum + (b.pages_total || 0), 0);

        // 5. TBR Pile
        const tbrCount = libraryBooks.filter(b => b.status === 'tbr' || b.status === 'reading').length;

        return {
            readCount: readBooks.length,
            totalCount: totalBooks,
            completionRate,
            uniqueAuthors: authors.size,
            topAuthor,
            topAuthorCount,
            totalPages,
            tbrCount
        };
    }, [books]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-sm bg-warm-beige rounded-3xl shadow-2xl overflow-hidden animate-scale-in border-4 border-white/20 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 pb-2">
                    <h2 className="text-2xl font-serif font-bold text-deep-blue flex items-center gap-2">
                        <BarChart3 className="text-gold" />
                        Library Analytics
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 bg-white/40 hover:bg-white/60 rounded-full text-deep-blue transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="p-6 pt-4 overflow-y-auto space-y-4">

                    {/* Books Read Card */}
                    <div className="bg-white/80 p-5 rounded-2xl border border-stone-100 shadow-sm">
                        <div className="text-sm font-bold text-ink-light mb-1 flex items-center gap-2">
                            <BookOpen size={16} /> Books Read
                        </div>
                        <div className="text-4xl font-serif text-[#6B8E23]">
                            {stats.readCount} <span className="text-xl text-gray-400 font-sans">/ {stats.totalCount}</span>
                        </div>
                    </div>

                    {/* Completion Card */}
                    <div className="bg-white/80 p-5 rounded-2xl border border-stone-100 shadow-sm">
                        <div className="text-sm font-bold text-ink-light mb-1 flex items-center gap-2">
                            <TrendingUp size={16} /> Completion
                        </div>
                        <div className="text-5xl font-serif text-[#6B8E23]">
                            {stats.completionRate}<span className="text-2xl">%</span>
                        </div>
                    </div>

                    {/* Unique Authors */}
                    <div className="bg-white/80 p-5 rounded-2xl border border-stone-100 shadow-sm">
                        <div className="text-sm font-bold text-ink-light mb-1 flex items-center gap-2">
                            <Users size={16} /> Unique Authors
                        </div>
                        <div className="text-4xl font-serif text-[#6B8E23]">
                            {stats.uniqueAuthors}
                        </div>
                    </div>

                    {/* Top Author */}
                    <div className="bg-white/80 p-5 rounded-2xl border border-stone-100 shadow-sm">
                        <div className="text-sm font-bold text-ink-light mb-1 flex items-center gap-2">
                            <Trophy size={16} className="text-gold" /> Most Frequent Author
                        </div>
                        <div className="text-2xl font-serif text-[#6B8E23] leading-tight mb-1">
                            {stats.topAuthor}
                        </div>
                        <div className="text-xs text-gray-500">
                            {stats.topAuthorCount} books in library
                        </div>
                    </div>

                    {/* Extra Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/60 p-4 rounded-xl border border-stone-100">
                            <div className="text-xs font-bold text-gray-500 mb-1">Pages Read</div>
                            <div className="text-xl font-serif text-deep-blue">
                                {(stats.totalPages / 1000).toFixed(1)}k+
                            </div>
                        </div>
                        <div className="bg-white/60 p-4 rounded-xl border border-stone-100">
                            <div className="text-xs font-bold text-gray-500 mb-1">TBR Pile</div>
                            <div className="text-xl font-serif text-deep-blue">
                                {stats.tbrCount}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
