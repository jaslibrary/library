import { useState, useEffect } from 'react';
import { Save, Quote, FileText, Loader2 } from 'lucide-react';
import type { Book } from '../../types/book';

interface JournalTabProps {
    book: Book;
    onUpdate: (updates: Partial<Book>) => void;
}

export const JournalTab = ({ book, onUpdate }: JournalTabProps) => {
    const [notes, setNotes] = useState(book.notes || '');
    const [quotes, setQuotes] = useState(book.quotes || '');
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        setNotes(book.notes || '');
        setQuotes(book.quotes || '');
        setHasChanges(false);
    }, [book.id]);

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate a small delay for UX so it doesn't feel instant/fake
        await new Promise(resolve => setTimeout(resolve, 500));

        onUpdate({ notes, quotes });
        setIsSaving(false);
        setHasChanges(false);
    };

    const handleChange = (type: 'notes' | 'quotes', value: string) => {
        if (type === 'notes') setNotes(value);
        if (type === 'quotes') setQuotes(value);
        setHasChanges(true);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Thoughts Section */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-deep-blue font-bold font-serif">
                    <FileText size={18} className="text-gold" />
                    <h3>My Thoughts</h3>
                </div>
                <textarea
                    value={notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="What did you think? How did it make you feel? Write your private review here..."
                    className="w-full h-32 p-4 rounded-xl bg-warm-beige/30 border-2 border-transparent focus:border-gold focus:bg-white outline-none transition-all placeholder:text-gray-400 text-ink resize-none font-medium leading-relaxed"
                />
            </div>

            {/* Quotes Section */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-deep-blue font-bold font-serif">
                    <Quote size={18} className="text-gold" />
                    <h3>Favorite Quotes</h3>
                </div>
                <textarea
                    value={quotes}
                    onChange={(e) => handleChange('quotes', e.target.value)}
                    placeholder={'"The struggle itself towards the heights is enough to fill a man\'s heart..."'}
                    className="w-full h-32 p-4 rounded-xl bg-warm-beige/30 border-2 border-transparent focus:border-gold focus:bg-white outline-none transition-all placeholder:text-gray-400 text-ink resize-none font-serif italic leading-relaxed"
                />
            </div>

            {/* Save Action */}
            <div className="flex justify-end pt-2">
                <button
                    onClick={handleSave}
                    disabled={!hasChanges || isSaving}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-md ${hasChanges
                            ? 'bg-deep-blue text-white hover:scale-105 active:scale-95'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {isSaving ? 'Saving...' : 'Save Journal'}
                </button>
            </div>
        </div>
    );
};
