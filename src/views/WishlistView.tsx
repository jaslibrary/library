import React, { useState } from 'react';
import { Plus, Search, X, Loader2 } from 'lucide-react';
import { useBooks } from '../hooks/useBooks';
import { BookCard } from '../components/home/BookCard';
import { BookDetailsSheet } from '../components/book/BookDetailsSheet';
import { searchGoogleBooks, type GoogleBookResult } from '../lib/google-books';

import type { Book } from '../types/book';

export const WishlistView = () => {
    const { data: books, isLoading, updateBook, deleteBook } = useBooks();
    const wishlistBooks = books?.filter(b => b.status === 'wishlist') || [];

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const handleBookClick = (book: Book) => {
        setSelectedBook(book);
        setIsDetailsOpen(true);
    };

    const handleUpdateBook = (updates: Partial<Book>) => {
        if (selectedBook) {
            updateBook({ id: selectedBook.id, updates });
            setSelectedBook({ ...selectedBook, ...updates });
        }
    };

    return (
        <div className="space-y-6 pt-6 pb-24 px-6 min-h-screen">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-serif text-deep-blue font-bold">My Wishlist</h1>
                <button
                    onClick={() => setIsAddOpen(true)}
                    className="w-10 h-10 bg-gold text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                >
                    <Plus size={24} />
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-20 text-gray-400">Loading Wishlist...</div>
            ) : wishlistBooks.length > 0 ? (
                <div className="grid grid-cols-2 gap-x-4 gap-y-8">
                    {wishlistBooks.map(book => (
                        <BookCard
                            key={book.id}
                            {...book}
                            coverUrl={book.cover_url}
                            onBookClick={() => handleBookClick(book)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 text-gray-400 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-300">
                        <Plus size={32} />
                    </div>
                    <p>Your wishlist is empty.<br />Tap the + button to add books you want to read seamlessly!</p>
                </div>
            )}

            <AddToWishlistSheet isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />

            <BookDetailsSheet
                book={selectedBook}
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                onUpdate={handleUpdateBook}
                onDelete={(id) => { deleteBook(id); setIsDetailsOpen(false); }}
            />
        </div>
    );
};

const AddToWishlistSheet = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const [step, setStep] = useState<'input' | 'cover'>('input');
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState<GoogleBookResult[]>([]);
    const { addBook } = useBooks();

    const reset = () => {
        setTitle('');
        setAuthor('');
        setResults([]);
        setStep('input');
        onClose();
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title) return;

        setIsSearching(true);
        try {
            const query = `${title} ${author}`;
            const searchResults = await searchGoogleBooks(query);
            setResults(searchResults);
            setStep('cover');
        } catch (err) {
            console.error(err);
        } finally {
            setIsSearching(false);
        }
    };

    const [isSaving, setIsSaving] = useState(false);

    const handleSelectCover = async (coverUrl: string) => {
        if (isSaving) return;

        setIsSaving(true);
        try {
            await addBook({
                title,
                author,
                cover_url: coverUrl,
                status: 'wishlist',
                date_added: new Date().toISOString()
            });
            alert("Book Saved Successfully! (Check the list now)");
            reset();
        } catch (err: any) {
            console.error("Failed to add to wishlist", err);
            if (err.code === '23514' || err.message?.includes('books_status_check')) {
                alert("⚠️ Database Update Required ⚠️\n\nYour database is blocking the 'wishlist' status.\nPlease copy the SQL I just sent you and run it in your Supabase SQL Editor.");
            } else {
                alert(`Failed to save: ${err.message || 'Unknown error'}`);
            }
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={reset} />
            <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl overflow-hidden h-[80vh] flex flex-col">
                <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 pb-2 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-deep-blue">
                        {step === 'input' ? 'Add to Wishlist' : 'Select Cover'}
                    </h2>
                    <button
                        onClick={reset}
                        className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 active:scale-95 transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {step === 'input' ? (
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Book Title</label>
                            <input
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold outline-none"
                                placeholder="e.g. The Great Gatsby"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Author</label>
                            <input
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold outline-none"
                                placeholder="e.g. F. Scott Fitzgerald"
                                value={author}
                                onChange={e => setAuthor(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!title || isSearching}
                            className="w-full bg-deep-blue text-white font-bold py-4 rounded-xl mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isSearching ? <Loader2 className="animate-spin" /> : <Search size={20} />}
                            {isSearching ? 'Searching...' : 'Find Book'}
                        </button>
                    </form>
                ) : (
                    <div className="overflow-y-auto flex-1 -mx-2 px-2">
                        <div className="grid grid-cols-3 gap-3">
                            {results.map((book, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSelectCover(book.cover_url!)}
                                    disabled={isSaving}
                                    className="aspect-[2/3] relative rounded-lg overflow-hidden shadow-md hover:ring-4 ring-gold transition-all disabled:opacity-50"
                                >
                                    <img src={book.cover_url} className="w-full h-full object-cover" loading="lazy" />
                                    {isSaving && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <Loader2 className="text-white animate-spin" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                        {results.length === 0 && <p className="text-center text-gray-500 mt-10">No covers found. Try refining your title.</p>}
                        <button onClick={() => setStep('input')} className="w-full mt-6 py-3 text-gray-500 font-medium">Back to Search</button>
                    </div>
                )}
            </div>
        </div>
    );
};
