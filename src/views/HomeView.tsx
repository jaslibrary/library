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

    const handleStartReading = (id: string) => {
        updateBook({ id, updates: { status: 'reading', date_started: new Date().toISOString() } });
        setIsShuffleOpen(false);
    };

    if (error) return <div className="p-10 text-red-500">Error: {(error as any).message}</div>;

    return (
        <div className="space-y-10 pt-6 pb-40">
            {/* Header Area with Stats Button */}
            <div className="px-6 flex justify-between items-center">
                {/* Invisible spacer to maintain title center if needed, or just left align title */}
                {/* For now assuming title is handled by Header component which is separate. 
                     Wait, HomeView doesn't have a visible header title "My Library" in the code I see (it's in App? no). 
                     Ah, the previous HeroCard is top. Let's add a proper Header Row here if missing or check App layout. 
                     
                     Looking at Step 1336 summary: "Ensure header content (search, filters, goal tracker) is correctly centered."
                     And Step 1390 view_file: HomeView renders HeroCard 1st.
                     
                     I will add a floating Stats button near the ReadingGoal or just top right.
                     Actually, let's put it right above ReadingGoal or making ReadingGoal clickable?
                     Let's add a small 'Analytics' button next to the Reading Goal title? 
                     Or better, a dedicated customized header in HomeView if it doesn't exist.
                     
                     Let's verify Header in App.tsx. It's MainLayout.
                  */}
            </div>

            <div className="px-6">
                {readingNow ? (
                    <HeroCard
                        title={readingNow.title}
                        category="Currently Reading"
                        coverUrl={readingNow.cover_url}
                        progress={readingNow.pages_total ? Math.round(((readingNow.pages_read || 0) / readingNow.pages_total) * 100) : 0}
                    />
                ) : (
                    <div className="p-8 bg-deep-blue rounded-3xl text-center border border-white/10 relative overflow-hidden group">
                        <div className="relative z-10 flex flex-col items-center gap-4">
                            <div className="text-white/60 font-medium">No book currently in progress</div>
                            <button
                                onClick={() => setIsShuffleOpen(true)}
                                className="px-6 py-3 bg-gold text-deep-blue font-bold rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                            >
                                <span className="text-lg">🎲</span> Surprise Me
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
                <button
                    onClick={() => setIsStatsOpen(true)}
                    className="absolute top-4 right-10 p-2 bg-white/50 hover:bg-white text-deep-blue rounded-lg transition-colors"
                    title="View Analytics"
                >
                    {/* Reuse Lucide icon if imported, else standard emoji or similar */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="18" y1="20" y2="10" /><line x1="12" x2="12" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="14" /></svg>
                </button>
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

