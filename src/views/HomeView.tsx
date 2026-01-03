import { useState, useMemo } from 'react';
import { HeroCard } from '../components/home/HeroCard';
import { BookRow } from '../components/home/BookRow';
import { useBooks, useReadingNow } from '../hooks/useBooks';
import { BookDetailsSheet } from '../components/book/BookDetailsSheet';
import { ShuffleModal } from '../components/home/ShuffleModal';
import { StatsModal } from '../components/home/StatsModal';
import { ReadingGoal } from '../components/home/ReadingGoal';
import { SearchBar } from '../components/home/SearchBar';
import type { Book } from '../types/book';

export const HomeView = () => {
    const { data: books, error, updateBook, deleteBook } = useBooks();
    const { data: readingNow } = useReadingNow();

    // Sheet State
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isShuffleOpen, setIsShuffleOpen] = useState(false);
    const [isStatsOpen, setIsStatsOpen] = useState(false);

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<string | null>(null);

    // Derived Filters
    const genres = useMemo(() => {
        if (!books) return [];
        const g = new Set<string>();
        // Add default status filters
        g.add('TBR');
        g.add('Read');
        g.add('Reading');

        books.forEach(b => {
            if (b.genre) g.add(b.genre);
        });
        return Array.from(g).sort();
    }, [books]);

    const filteredBooks = useMemo(() => {
        if (!books) return [];
        let result = books;

        // 1. Search (Title, Author, Series)
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(b =>
                b.title.toLowerCase().includes(q) ||
                b.author.toLowerCase().includes(q) ||
                (b.series && b.series.toLowerCase().includes(q))
            );
        }

        // 2. Filter (Genre or Status)
        if (activeFilter) {
            if (['TBR', 'Read', 'Reading'].includes(activeFilter)) {
                result = result.filter(b => b.status.toLowerCase() === activeFilter.toLowerCase());
            } else {
                result = result.filter(b => b.genre === activeFilter);
            }
        }

        // 3. Sort by Series if searching/filtering
        // If the user has filtered down, we should group by series naturally.
        // We'll stable sort: first by Series Name, then by Series Order.
        if (searchQuery || activeFilter) {
            result.sort((a, b) => {
                if (a.series && b.series && a.series === b.series) {
                    return (a.series_order || 0) - (b.series_order || 0);
                }
                if (a.series && !b.series) return -1;
                if (!a.series && b.series) return 1;
                return 0; // Keep original order (date added) otherwise
            });
        }

        return result;
    }, [books, searchQuery, activeFilter]);

    const isSearching = !!searchQuery || !!activeFilter;

    const handleBookClick = (book: Book) => {
        setSelectedBook(book);
        setIsSheetOpen(true);
    };

    const handleUpdateBook = (updates: Partial<Book>) => {
        if (selectedBook) {
            updateBook({ id: selectedBook.id, updates });
            // Optimistic update for the sheet
            setSelectedBook({ ...selectedBook, ...updates });
        }
    };

    const handleDeleteBook = (id: string) => {
        deleteBook(id);
        setIsSheetOpen(false);
    };

    const handleStartReading = async (id: string) => {
        try {
            await updateBook({ id, updates: { status: 'reading', date_started: new Date().toISOString() } });
            setIsShuffleOpen(false);
        } catch (error: any) {
            console.error("Failed to start reading:", error);
            alert(`Error: ${error.message || JSON.stringify(error)}`);
        }
    };

    if (error) return <div className="p-10 text-red-500">Error: {(error as any).message}</div>;

    return (
        <div className="space-y-6 pt-2 pb-24 h-[calc(100dvh-6rem)] overflow-y-auto no-scrollbar">
            {/* Header / Search */}
            <div className="px-6 space-y-4">
                <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                    filters={genres}
                />
            </div>

            {/* Main Content Area */}
            {isSearching ? (
                <div className="px-6 animate-fade-in">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                        {filteredBooks.length} Result{filteredBooks.length !== 1 ? 's' : ''}
                    </h2>

                    {filteredBooks.length > 0 ? (
                        <div className="grid grid-cols-3 gap-x-4 gap-y-8">
                            {filteredBooks.map(book => (
                                <div key={book.id} onClick={() => handleBookClick(book)} className="group cursor-pointer">
                                    <div className="aspect-[2/3] rounded-lg bg-gray-100 shadow-md overflow-hidden mb-2 relative">
                                        <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        {book.series && (
                                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-1">
                                                <p className="text-[10px] text-white text-center font-bold truncate">
                                                    {book.series_order ? `#${book.series_order} ` : ''}{book.series}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="font-serif text-sm text-deep-blue leading-tight line-clamp-2">{book.title}</h3>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 opacity-50">
                            <p>No books found.</p>
                        </div>
                    )}
                </div>
            ) : (
                <>
                    <div className="px-6">
                        {readingNow ? (
                            <HeroCard
                                title={readingNow.title}
                                category="Currently Reading"
                                coverUrl={readingNow.cover_url}
                                onClick={() => handleBookClick(readingNow)}
                            />
                        ) : (
                            <div className="p-5 bg-deep-blue rounded-2xl text-center border border-white/10 relative overflow-hidden group">
                                <div className="relative z-10 flex flex-col items-center gap-3">
                                    <div className="text-white/60 font-medium text-sm">No book currently in progress</div>
                                    <button
                                        onClick={() => setIsShuffleOpen(true)}
                                        className="px-5 py-2.5 bg-gold text-deep-blue font-bold rounded-lg shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 text-sm"
                                    >
                                        <span className="text-base">🎲</span> Surprise Me
                                    </button>
                                </div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gold/10 blur-3xl rounded-full pointer-events-none" />
                            </div>
                        )}
                    </div>

                    <div className="px-6 relative">
                        <ReadingGoal booksRead={books?.filter(b => b.status === 'read').length || 0} />
                    </div>

                    <BookRow
                        title="Recent Adds"
                        books={books?.filter(b => b.status !== 'wishlist') || []}
                        onBookClick={handleBookClick}
                    />
                </>
            )}

            {/* Detail Modal & Other Modals */}
            <BookDetailsSheet
                book={selectedBook}
                isOpen={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
                onUpdate={handleUpdateBook}
                onDelete={handleDeleteBook}
            />

            <ShuffleModal
                isOpen={isShuffleOpen}
                onClose={() => setIsShuffleOpen(false)}
                books={books?.filter(b => b.status !== 'wishlist') || []}
                onStartReading={handleStartReading}
            />

            <StatsModal
                isOpen={isStatsOpen}
                onClose={() => setIsStatsOpen(false)}
                books={books || []}
            />
        </div>
    );
};

