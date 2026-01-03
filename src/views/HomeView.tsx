import { useState } from 'react';
import { HeroCard } from '../components/home/HeroCard';
import { BookRow } from '../components/home/BookRow';
import { useBooks, useReadingNow } from '../hooks/useBooks';
import { BookDetailsSheet } from '../components/book/BookDetailsSheet';
import { ShuffleModal } from '../components/home/ShuffleModal';
import { StatsModal } from '../components/home/StatsModal';
import { ReadingGoal } from '../components/home/ReadingGoal';
import type { Book } from '../types/book';

export const HomeView = () => {
    const { data: books, error, updateBook, deleteBook } = useBooks();
    const { data: readingNow } = useReadingNow();

    // Sheet State
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isShuffleOpen, setIsShuffleOpen] = useState(false);
    const [isStatsOpen, setIsStatsOpen] = useState(false);

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
        <div className="space-y-4 pt-2 pb-24 h-[calc(100dvh-6rem)] overflow-y-auto no-scrollbar">
            {/* Header Area with Stats Button */}
            <div className="px-6 flex justify-between items-center" />

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
                        {/* decorative bg glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gold/10 blur-3xl rounded-full pointer-events-none" />
                    </div>
                )}
            </div>

            {/* Reading Goal Widget & Stats Trigger */}
            <div className="px-6 relative">
                <ReadingGoal booksRead={books?.filter(b => b.status === 'read').length || 0} />

            </div>

            {/* List of Books */}
            <BookRow
                title="Recent Adds"
                books={books?.filter(b => b.status !== 'wishlist') || []}
                onBookClick={handleBookClick}
            />

            {/* Details Sheet */}
            <BookDetailsSheet
                book={selectedBook}
                isOpen={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
                onUpdate={handleUpdateBook}
                onDelete={handleDeleteBook}
            />

            {/* Shuffle Modal */}
            <ShuffleModal
                isOpen={isShuffleOpen}
                onClose={() => setIsShuffleOpen(false)}
                books={books?.filter(b => b.status !== 'wishlist') || []}
                onStartReading={handleStartReading}
            />

            {/* Stats Modal */}
            <StatsModal
                isOpen={isStatsOpen}
                onClose={() => setIsStatsOpen(false)}
                books={books || []}
            />
        </div>
    );
};

