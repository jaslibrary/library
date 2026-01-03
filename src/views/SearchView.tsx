import { useState, useMemo } from 'react';
import { useBooks } from '../hooks/useBooks';
import { BookDetailsSheet } from '../components/book/BookDetailsSheet';
import { SearchBar } from '../components/home/SearchBar';
import type { Book } from '../types/book';

export const SearchView = () => {
    const { data: books, isLoading, updateBook, deleteBook } = useBooks();

    // Sheet State
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [selectedGenre, setSelectedGenre] = useState<string>('');

    // Filters
    const statusFilters = ['TBR', 'Reading', 'Read'];

    // Extract Genres
    const availableGenres = useMemo(() => {
        if (!books) return [];
        const g = new Set<string>();
        books.forEach(b => {
            if (b.genre) g.add(b.genre);
        });
        return Array.from(g).sort();
    }, [books]);

    // Filtering Logic
    const displayedBooks = useMemo(() => {
        if (!books) return [];
        // Exclude wishlist from Library View
        let result = books.filter(b => b.status !== 'wishlist');

        // 1. Search (Title, Author, Series)
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(b =>
                b.title.toLowerCase().includes(q) ||
                b.author.toLowerCase().includes(q) ||
                (b.series && b.series.toLowerCase().includes(q))
            );
        }

        // 2. Filter (Status)
        if (activeFilter) {
            // Since we only have status filters now
            result = result.filter(b => b.status.toLowerCase() === activeFilter.toLowerCase());
        }

        // 3. Filter (Genre)
        if (selectedGenre) {
            result = result.filter(b => b.genre === selectedGenre);
        }

        // 4. Sort
        // Default: Sort by Series if Series filter active (or just generally good to keep series together)
        // Check if we have active sort/search, otherwise Date Added
        if (searchQuery || activeFilter || selectedGenre) {
            result.sort((a, b) => {
                if (a.series && b.series && a.series === b.series) {
                    return (a.series_order || 0) - (b.series_order || 0);
                }
                return 0;
            });
        }

        return result;
    }, [books, searchQuery, activeFilter, selectedGenre]);

    const handleBookClick = (book: Book) => {
        setSelectedBook(book);
        setIsSheetOpen(true);
    };

    const handleUpdateBook = (updates: Partial<Book>) => {
        if (selectedBook) {
            updateBook({ id: selectedBook.id, updates });
            setSelectedBook({ ...selectedBook, ...updates });
        }
    };

    const handleDeleteBook = (id: string) => {
        deleteBook(id);
        setIsSheetOpen(false);
    };

    return (
        <div className="space-y-6 pt-2 pb-24 h-[calc(100dvh-6rem)] overflow-y-auto no-scrollbar">
            {/* Search Bar - Fixed at top or scrollable? User asked for "Magnifying glass in library" -> likely this view */}
            <div className="px-6 space-y-4 pt-2">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-serif text-deep-blue">My Library</h2>
                    {/* Genre Dropdown */}
                    <div className="relative">
                        <select
                            value={selectedGenre}
                            onChange={(e) => setSelectedGenre(e.target.value)}
                            className="appearance-none bg-white border border-stone-200 text-deep-blue text-xs font-bold py-2 pl-3 pr-8 rounded-lg outline-none focus:ring-2 focus:ring-gold/50 shadow-sm"
                        >
                            <option value="">All Genres</option>
                            {availableGenres.map(g => (
                                <option key={g} value={g}>{g}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-deep-blue">
                            <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                        </div>
                    </div>
                </div>
                <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                    filters={statusFilters}
                />
            </div>

            {/* Results Grid */}
            <div className="px-6 animate-fade-in">
                {isLoading && <p className="text-gray-400 text-center animate-pulse">Loading Library...</p>}

                {!isLoading && (
                    <>
                        <div className="mb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                            {displayedBooks.length} Book{displayedBooks.length !== 1 ? 's' : ''}
                        </div>

                        {displayedBooks.length > 0 ? (
                            <div className="grid grid-cols-3 gap-x-4 gap-y-8">
                                {displayedBooks.map(book => (
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
                                            {book.edition && (
                                                <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/70 backdrop-blur-md rounded text-[9px] font-bold text-white uppercase tracking-wider shadow-sm border border-white/20">
                                                    {book.edition}
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="font-serif text-sm text-deep-blue leading-tight line-clamp-2">{book.title}</h3>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 opacity-50">
                                <p>No books match your criteria.</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Details Sheet */}
            <BookDetailsSheet
                book={selectedBook}
                isOpen={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
                onUpdate={handleUpdateBook}
                onDelete={handleDeleteBook}
            />
        </div>
    );
};


