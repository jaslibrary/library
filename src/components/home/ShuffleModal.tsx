import { useState, useEffect } from 'react';
import { X, Sparkles, BookOpen } from 'lucide-react';
import type { Book } from '../../types/book';
import clsx from 'clsx';

interface ShuffleModalProps {
    isOpen: boolean;
    onClose: () => void;
    books: Book[];
    onStartReading: (bookId: string) => void;
}

export const ShuffleModal = ({ isOpen, onClose, books, onStartReading }: ShuffleModalProps) => {
    const [isShuffling, setIsShuffling] = useState(false);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);

    useEffect(() => {
        if (isOpen) {
            pickRandomBook();
            // Prevent body scrolling to stop browser UI from popping up
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
        } else {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        }

        return () => {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        };
    }, [isOpen]);

    const pickRandomBook = () => {
        setIsShuffling(true);
        setSelectedBook(null);

        // Filter for TBR books first, fallback to all books
        const pool = books.filter(b => b.status === 'tbr');
        const candidates = pool.length > 0 ? pool : books;

        if (candidates.length === 0) {
            setIsShuffling(false);
            return; // No books to shuffle
        }

        // Simulate shuffling effect
        let shuffles = 0;
        const maxShuffles = 10;
        const interval = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * candidates.length);
            setSelectedBook(candidates[randomIndex]);
            shuffles++;

            if (shuffles >= maxShuffles) {
                clearInterval(interval);
                setIsShuffling(false);
            }
        }, 150);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
                style={{ touchAction: 'none' }} // Prevent touch actions on backdrop
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-sm bg-warm-beige rounded-3xl shadow-2xl overflow-hidden animate-scale-in border-4 border-white/20">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 rounded-full text-deep-blue transition-colors z-10"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center p-6 pt-10">
                    {/* Icon / Header */}
                    <div className="mb-4">
                        <div className={clsx(
                            "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300",
                            isShuffling ? "bg-gold rotate-12 scale-110" : "bg-deep-blue rotate-0"
                        )}>
                            <Sparkles className={clsx("text-white", isShuffling && "animate-pulse")} size={24} />
                        </div>
                    </div>

                    <h2 className="text-xl font-serif text-deep-blue mb-1">
                        {isShuffling ? "Picking a Book..." : "Next Read Found!"}
                    </h2>

                    <p className="text-ink-light mb-4 text-sm h-5">
                        {isShuffling ? "Shuffling your library..." : "How about this one?"}
                    </p>

                    {/* Book Card */}
                    {selectedBook && (
                        <div className="bg-white p-3 rounded-xl shadow-lg border border-stone-100 mb-6 w-full max-w-[180px] transform transition-all">
                            <div className="aspect-[2/3] w-full bg-gray-100 rounded-lg mb-3 overflow-hidden shadow-inner">
                                <img
                                    src={selectedBook.cover_url}
                                    alt={selectedBook.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h3 className="font-serif text-base text-deep-blue line-clamp-1">{selectedBook.title}</h3>
                            <p className="text-[10px] text-ink-light mt-0.5">{selectedBook.author || "Unknown Author"}</p>
                        </div>
                    )}

                    {!selectedBook && !isShuffling && (
                        <div className="p-8 mb-8 text-ink-light">
                            No books found in your library!
                        </div>
                    )}

                    {/* Action Button */}
                    <button
                        onClick={() => selectedBook && onStartReading(selectedBook.id)}
                        disabled={isShuffling || !selectedBook}
                        className={clsx(
                            "w-full py-3.5 rounded-xl font-bold tracking-wide shadow-lg transition-all flex items-center justify-center gap-2 text-sm",
                            isShuffling || !selectedBook
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : "bg-gold text-deep-blue hover:brightness-110 active:scale-95"
                        )}
                    >
                        <BookOpen size={18} />
                        Start Reading
                    </button>

                    {!isShuffling && selectedBook && (
                        <button
                            onClick={pickRandomBook}
                            className="mt-3 text-xs text-ink-light underline hover:text-gold transition-colors"
                        >
                            Shuffle Again
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
