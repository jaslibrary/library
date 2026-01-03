import React, { useMemo } from 'react';
import { Trophy, BookOpen, Users, TrendingUp, BarChart3 } from 'lucide-react';
import { useBooks } from '../hooks/useBooks';

export const StatsView = () => {
    const { data: books, isLoading } = useBooks();

    const stats = useMemo(() => {
        if (!books) return null;

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

    if (isLoading || !stats) return <div className="text-center py-20 text-gray-400">Loading Stats...</div>;

    return (
        <div className="space-y-6 pt-6 pb-24 px-6 min-h-screen">
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-serif text-deep-blue font-bold flex items-center gap-3">
                    <BarChart3 className="text-gold" size={32} />
                    Stats
                </h1>
            </div>

            <div className="space-y-4 max-w-md mx-auto">

                {/* Books Read Card */}
                <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
                    <div className="text-sm font-bold text-ink-light mb-2 flex items-center gap-2">
                        <BookOpen size={18} /> Books Read
                    </div>
                    <div className="text-5xl font-serif text-[#6B8E23]">
                        {stats.readCount} <span className="text-2xl text-gray-400 font-sans">/ {stats.totalCount}</span>
                    </div>
                </div>

                {/* Completion Card */}
                <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
                    <div className="text-sm font-bold text-ink-light mb-2 flex items-center gap-2">
                        <TrendingUp size={18} /> Completion
                    </div>
                    <div className="text-6xl font-serif text-[#6B8E23]">
                        {stats.completionRate}<span className="text-3xl">%</span>
                    </div>
                </div>

                {/* Unique Authors */}
                <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
                    <div className="text-sm font-bold text-ink-light mb-2 flex items-center gap-2">
                        <Users size={18} /> Unique Authors
                    </div>
                    <div className="text-5xl font-serif text-[#6B8E23]">
                        {stats.uniqueAuthors}
                    </div>
                </div>

                {/* Top Author */}
                <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
                    <div className="text-sm font-bold text-ink-light mb-2 flex items-center gap-2">
                        <Trophy size={18} className="text-gold" /> Most Frequent Author
                    </div>
                    <div className="text-3xl font-serif text-[#6B8E23] leading-tight mb-1">
                        {stats.topAuthor}
                    </div>
                    <div className="text-sm text-gray-500">
                        {stats.topAuthorCount} books in library
                    </div>
                </div>

                {/* Extra Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-xl border border-stone-100 shadow-sm">
                        <div className="text-xs font-bold text-gray-500 mb-1">Pages Read</div>
                        <div className="text-2xl font-serif text-deep-blue">
                            {(stats.totalPages / 1000).toFixed(1)}k+
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-stone-100 shadow-sm">
                        <div className="text-xs font-bold text-gray-500 mb-1">TBR Pile</div>
                        <div className="text-2xl font-serif text-deep-blue">
                            {stats.tbrCount}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
