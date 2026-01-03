
import { useState } from 'react';
import { Plus, Loader2, BookOpen } from 'lucide-react';
import type { SeriesBook } from '../../utils/seriesService';

interface SeriesGapCardProps {
    seriesName: string;
    missingBooks: SeriesBook[];
    onAddBook: (book: SeriesBook) => Promise<void>;
}

export const SeriesGapCard = ({ seriesName, missingBooks, onAddBook }: SeriesGapCardProps) => {
    const [addingIsbn, setAddingIsbn] = useState<string | null>(null);

    const handleAdd = async (book: SeriesBook) => {
        if (addingIsbn) return; // Prevent multiple clicks
        setAddingIsbn(book.key); // Use Key as ID
        try {
            await onAddBook(book);
        } catch (e) {
            console.error(e);
        } finally {
            setAddingIsbn(null);
        }
    };

    if (missingBooks.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                    <BookOpen size={16} />
                </div>
                <div>
                    <h3 className="font-serif font-bold text-deep-blue text-lg leading-none">Complete the Series</h3>
                    <p className="text-xs text-gray-500 font-medium">Missing from <span className="text-gold font-bold">{seriesName}</span></p>
                </div>
            </div>

            <div className="flex overflow-x-auto gap-4 pb-2 -mx-5 px-5 no-scrollbar snap-x snap-mandatory">
                {missingBooks.map((book) => (
                    <div key={book.key} className="flex-none w-28 snap-center group relative">
                        {/* Cover */}
                        <div className="aspect-[2/3] bg-gray-100 rounded-lg overflow-hidden mb-2 shadow-sm relative">
                            {book.cover_url ? (
                                <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" loading="lazy" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-stone-50 text-stone-300">
                                    <BookOpen size={24} />
                                </div>
                            )}

                            {/* Add Overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                {/* Desktop Hover Action */}
                            </div>
                        </div>

                        {/* Title */}
                        <h4 className="font-bold text-deep-blue text-xs leading-tight line-clamp-2 h-8 mb-2">{book.title}</h4>

                        {/* Add Button */}
                        <button
                            onClick={() => handleAdd(book)}
                            disabled={addingIsbn === book.key}
                            className={`w-full py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${addingIsbn === book.key
                                ? 'bg-green-100 text-green-700'
                                : 'bg-stone-100 text-stone-600 hover:bg-gold hover:text-white'
                                }`}
                        >
                            {addingIsbn === book.key ? (
                                <>
                                    <Loader2 size={12} className="animate-spin" />
                                    <span>Adding...</span>
                                </>
                            ) : (
                                <>
                                    <Plus size={12} />
                                    <span>Add</span>
                                </>
                            )}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
