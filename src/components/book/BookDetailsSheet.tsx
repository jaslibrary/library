import { useState } from 'react';
import { X, Trash2, Edit2, BookOpen, Clock, CheckCircle } from 'lucide-react';
import type { Book } from '../../types/book';
import { CoverSearchSheet } from './CoverSearchSheet';
import { JournalTab } from './JournalTab';
import clsx from 'clsx';

interface BookDetailsSheetProps {
    book: Book | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (updates: Partial<Book>) => void;
    onDelete: (id: string) => void;
}

export const BookDetailsSheet = ({ book, isOpen, onClose, onUpdate, onDelete }: BookDetailsSheetProps) => {
    if (!isOpen || !book) return null;

    const [isDeleting, setIsDeleting] = useState(false);
    const [isCoverSheetOpen, setIsCoverSheetOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'details' | 'journal'>('details');

    // Format date added
    const dateAdded = book.date_added ? new Date(book.date_added).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown';

    // Status helpers
    const isActive = (status: string) => book.status === status;

    const handleStatusChange = (newStatus: 'reading' | 'read' | 'tbr') => {
        const updates: Partial<Book> = { status: newStatus };
        if (newStatus === 'read' && !book.date_read) {
            updates.date_read = new Date().toISOString().split('T')[0];
        }
        onUpdate(updates);
    };

    const handleDelete = () => {
        if (isDeleting) {
            onDelete(book.id);
            onClose();
        } else {
            setIsDeleting(true);
            setTimeout(() => setIsDeleting(false), 3000); // Reset confirm state after 3s
        }
    };

    const handleCoverUpdate = (newUrl: string) => {
        onUpdate({ cover_url: newUrl });
        setIsCoverSheetOpen(false);
    };

    return (
        <>
            <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />

                {/* Sheet Content */}
                <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl transform transition-transform duration-300 ease-out max-h-[90vh] overflow-y-auto">
                    {/* Drag Handle (Visual only for now) */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-200 rounded-full sm:hidden" />

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"
                    >
                        <X size={20} />
                    </button>

                    <div className="p-6 pt-10">
                        {/* Header Section */}
                        <div className="flex gap-6 mb-8">
                            {/* Cover Image */}
                            <div className="w-32 flex-shrink-0 shadow-lg rounded-lg overflow-hidden aspect-[2/3] bg-gray-100 relative group">
                                <img
                                    src={book.cover_url}
                                    alt={book.title}
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    onClick={() => setIsCoverSheetOpen(true)}
                                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer w-full h-full"
                                >
                                    <span className="text-white text-xs font-bold flex flex-col items-center">
                                        <Edit2 size={16} className="mb-1" />
                                        Change
                                    </span>
                                </button>
                            </div>

                            {/* Title & Stats */}
                            <div className="flex-1 space-y-2">
                                <h2 className="text-2xl font-serif text-deep-blue leading-tight mb-1">{book.title}</h2>
                                <p className="text-ink-light text-sm font-medium">{book.author || "Unknown Author"}</p>

                                <div className="flex flex-wrap gap-2 mt-3">
                                    {book.pages_total && (
                                        <span className="inline-flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                                            {book.pages_total} pages
                                        </span>
                                    )}
                                    <span className="inline-flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                                        Added {dateAdded}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions (Status) */}
                        {book.status === 'wishlist' ? (
                            <div className="space-y-3 mb-8">
                                <button
                                    onClick={() => handleStatusChange('tbr')}
                                    className="w-full py-4 bg-deep-blue text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-deep-blue/90 transition-all"
                                >
                                    <BookOpen size={20} />
                                    Add to Library
                                </button>
                                <p className="text-center text-xs text-gray-400">
                                    Moving this book to your library (TBR) will remove it from your wishlist.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-3 mb-8">
                                <StatusButton
                                    active={isActive('tbr')}
                                    onClick={() => handleStatusChange('tbr')}
                                    icon={Clock}
                                    label="TBR"
                                />
                                <StatusButton
                                    active={isActive('reading')}
                                    onClick={() => handleStatusChange('reading')}
                                    icon={BookOpen}
                                    label="Reading"
                                />
                                <StatusButton
                                    active={isActive('read')}
                                    onClick={() => handleStatusChange('read')}
                                    icon={CheckCircle}
                                    label="Read"
                                />
                            </div>
                        )}

                        {/* Tabs */}
                        <div className="flex gap-6 border-b border-gray-100 mb-6">
                            <button
                                onClick={() => setActiveTab('details')}
                                className={clsx("pb-3 font-bold text-sm transition-colors relative", activeTab === 'details' ? "text-deep-blue" : "text-gray-400")}
                            >
                                Details
                                {activeTab === 'details' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold rounded-full" />}
                            </button>
                            <button
                                onClick={() => setActiveTab('journal')}
                                className={clsx("pb-3 font-bold text-sm transition-colors relative", activeTab === 'journal' ? "text-deep-blue" : "text-gray-400")}
                            >
                                Journal
                                {activeTab === 'journal' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold rounded-full" />}
                            </button>
                        </div>

                        {activeTab === 'details' ? (
                            <>
                                {/* Progress Bar (if reading) */}
                                {book.status === 'reading' && book.pages_total && (
                                    <div className="mb-8 p-4 bg-warm-beige/30 rounded-xl border border-warm-beige">
                                        <div className="flex justify-between text-sm mb-2 font-medium text-ink">
                                            <span>Reading Progress</span>
                                            <span>{Math.round(((book.pages_read || 0) / book.pages_total) * 100)}%</span>
                                        </div>
                                        <div className="h-2 bg-white rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gold transition-all duration-500"
                                                style={{ width: `${Math.round(((book.pages_read || 0) / book.pages_total) * 100)}%` }}
                                            />
                                        </div>
                                        <div className="flex items-center justify-center gap-1">
                                            <input
                                                type="number"
                                                value={book.pages_read || 0}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value) || 0;
                                                    onUpdate({ pages_read: Math.min(val, book.pages_total!) });
                                                }}
                                                className="w-16 text-center bg-white/50 border border-gray-200 rounded px-1 py-0.5 text-deep-blue font-bold focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                                            />
                                            <span>of {book.pages_total} pages</span>
                                        </div>
                                    </div>
                                )}

                                {/* Metadata Editor */}
                                <div className="mb-8 space-y-4">
                                    <h3 className="font-bold text-deep-blue text-sm border-b border-gray-100 pb-2">Library Data</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Genre</label>
                                            <input
                                                type="text"
                                                value={book.genre || ''}
                                                onChange={(e) => onUpdate({ genre: e.target.value })}
                                                className="w-full p-2 bg-gray-50 rounded-lg text-sm font-medium text-deep-blue border border-gray-100 focus:border-gold focus:outline-none transition-colors"
                                                placeholder="Fantasy"
                                            />
                                        </div>
                                        {book.status === 'read' && (
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date Finished</label>
                                                <input
                                                    type="date"
                                                    value={book.date_read ? book.date_read.split('T')[0] : ''}
                                                    onChange={(e) => onUpdate({ date_read: e.target.value })}
                                                    className="w-full p-2 bg-gray-50 rounded-lg text-sm font-medium text-deep-blue border border-gray-100 focus:border-gold focus:outline-none transition-colors"
                                                />
                                            </div>
                                        )}
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Rating (1-5)</label>
                                            <input
                                                type="number"
                                                max={5}
                                                min={0}
                                                value={book.rating || ''}
                                                onChange={(e) => onUpdate({ rating: parseInt(e.target.value) || undefined })}
                                                className="w-full p-2 bg-gray-50 rounded-lg text-sm font-medium text-deep-blue border border-gray-100 focus:border-gold focus:outline-none transition-colors"
                                                placeholder="-"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Series Name</label>
                                            <input
                                                type="text"
                                                value={book.series || ''}
                                                onChange={(e) => onUpdate({ series: e.target.value })}
                                                className="w-full p-2 bg-gray-50 rounded-lg text-sm font-medium text-deep-blue border border-gray-100 focus:border-gold focus:outline-none transition-colors"
                                                placeholder="ACOTAR"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Book #</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={book.series_order || ''}
                                                onChange={(e) => onUpdate({ series_order: parseFloat(e.target.value) || undefined })}
                                                className="w-full p-2 bg-gray-50 rounded-lg text-sm font-medium text-deep-blue border border-gray-100 focus:border-gold focus:outline-none transition-colors"
                                                placeholder="1"
                                            />
                                        </div>
                                        <div className="col-span-2 space-y-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Edition / Variant</label>
                                            <input
                                                type="text"
                                                value={book.edition || ''}
                                                onChange={(e) => onUpdate({ edition: e.target.value })}
                                                className="w-full p-2 bg-gray-50 rounded-lg text-sm font-medium text-deep-blue border border-gray-100 focus:border-gold focus:outline-none transition-colors"
                                                placeholder="e.g. Color Edition, B&W, Hardcover"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <JournalTab book={book} onUpdate={onUpdate} />
                        )}

                        {/* Danger Zone */}
                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <button
                                onClick={handleDelete}
                                className={clsx(
                                    "w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors",
                                    isDeleting
                                        ? "bg-red-600 text-white hover:bg-red-700"
                                        : "bg-red-50 text-red-600 hover:bg-red-100"
                                )}
                            >
                                <Trash2 size={18} />
                                {isDeleting ? "Tap again to Confirm" : (book.status === 'wishlist' ? "Remove from Wishlist" : "Remove from Library")}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <CoverSearchSheet
                isOpen={isCoverSheetOpen}
                onClose={() => setIsCoverSheetOpen(false)}
                currentTitle={book.title}
                onSelectCover={handleCoverUpdate}
            />
        </>
    );
};

const StatusButton = ({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) => (
    <button
        onClick={onClick}
        className={clsx(
            "flex flex-col items-center justify-center p-3 rounded-xl transition-all border-2",
            active
                ? "border-gold bg-gold/5 text-deep-blue"
                : "border-transparent bg-gray-50 text-gray-400 hover:bg-gray-100"
        )}
    >
        <Icon size={24} className={clsx("mb-1", active ? "text-gold" : "text-gray-400")} />
        <span className="text-xs font-bold">{label}</span>
    </button>
);
