import React, { useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { useBooks } from '../hooks/useBooks'; // Use shared hook
import { BookCard } from '../components/home/BookCard';
import { BookDetailsSheet } from '../components/book/BookDetailsSheet';
import type { Book } from '../types/book';

export const SearchView = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const { data: allBooks, isLoading, updateBook, deleteBook } = useBooks();

    // Sheet State
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

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

    // Client-side filtering
    const displayedBooks = React.useMemo(() => {
        if (!allBooks) return [];
        const libraryBooks = allBooks.filter(b => b.status !== 'wishlist'); // Exclude wishlist

        if (!searchTerm) return libraryBooks; // Show all library books by default

        const lowerTerm = searchTerm.toLowerCase();
        return libraryBooks.filter(book =>
            book.title.toLowerCase().includes(lowerTerm) ||
            book.author.toLowerCase().includes(lowerTerm) ||
            (book.isbn && book.isbn.includes(lowerTerm))
        );
    }, [allBooks, searchTerm]);

    return (
        <div className="space-y-6 pt-2 pb-24">
            {/* Search Bar */}
            <div className="sticky top-[72px] z-30 px-6 bg-warm-beige pb-4">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-3 border-none rounded-xl bg-white shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4B974] sm:text-sm"
                        placeholder="Search your library..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus={false}
                    />
                </div>
            </div>

            {/* Results */}
            <div className="px-6">
                {isLoading && <p className="text-gray-400 text-center animate-pulse">Loading Library...</p>}

                {!isLoading && displayedBooks.length > 0 && (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-8">
                        {displayedBooks.map((book) => (
                            <div key={book.id} className="flex justify-center">
                                <BookCard
                                    {...book}
                                    coverUrl={book.cover_url}
                                    onBookClick={() => handleBookClick(book)}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {!isLoading && searchTerm && displayedBooks.length === 0 && (
                    <div className="text-center py-10 text-gray-400">
                        No books found for "{searchTerm}"
                    </div>
                )}

                {/* Empty State / Prompt if library is empty */}
                {!isLoading && !searchTerm && displayedBooks.length === 0 && (
                    <div className="text-center py-20 text-gray-300">
                        Your library is empty. <br /> Tap "+" to add your first book!
                    </div>
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


