import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Check, BookOpen } from 'lucide-react';
import { BarcodeScanner } from '../components/scanner/BarcodeScanner';
import { supabase } from '../lib/supabase';
// import { searchGoogleBooks } from '../utils/coverHunt'; // Reuse or create new util

export const MobileAddBook = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<'scan' | 'manual' | 'confirm' | 'success'>('scan');
    const [, setManualIsbn] = useState<string>(''); // manualIsbn unused for now
    const [bookData, setBookData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Manual Entry State
    const [manualTitle, setManualTitle] = useState('');
    const [manualAuthor, setManualAuthor] = useState('');

    const handleScan = async (isbn: string) => {
        setManualIsbn(isbn);
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
            const data = await response.json();

            if (data.totalItems > 0) {
                const volume = data.items[0].volumeInfo;
                setBookData({
                    title: volume.title,
                    author: volume.authors ? volume.authors[0] : 'Unknown Author',
                    cover_url: volume.imageLinks?.thumbnail?.replace('http:', 'https:'),
                    pages_total: volume.pageCount,
                    isbn: isbn,
                    description: volume.description
                });
                setStep('confirm');
            } else {
                setError("Book not found. Try scanning again.");
                setManualIsbn('');
            }
        } catch (err) {
            setError("Failed to fetch book data.");
            setManualIsbn('');
        } finally {
            setLoading(false);
        }
    };

    const handleManualSubmit = async () => {
        if (!manualTitle || !manualAuthor) {
            setError("Please enter both title and author.");
            return;
        }

        setLoading(true);
        setError(null);

        // Try to find a cover first
        let foundCover = `https://ui-avatars.com/api/?name=${encodeURIComponent(manualTitle)}&background=random`;
        let foundIsbn = 'MANUAL-' + Date.now();
        let foundPages = 0;
        let foundDesc = '';

        try {
            const query = `intitle:${encodeURIComponent(manualTitle)}+inauthor:${encodeURIComponent(manualAuthor)}`;
            const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`);
            const data = await response.json();

            if (data.totalItems > 0) {
                const vol = data.items[0].volumeInfo;
                if (vol.imageLinks?.thumbnail) {
                    foundCover = vol.imageLinks.thumbnail.replace('http:', 'https:');
                }
                foundPages = vol.pageCount || 0;
                foundDesc = vol.description || '';
                // Keep our manual title/author as primary, but maybe use found ones if they seem better? 
                // Let's stick to user input for Title/Author to be safe, but use the cover.
            }
        } catch (e) {
            // Ignore error, use placeholder
        }

        setBookData({
            title: manualTitle,
            author: manualAuthor,
            cover_url: foundCover,
            pages_total: foundPages,
            isbn: foundIsbn,
            description: foundDesc
        });
        setLoading(false);
        setStep('confirm');
    };

    const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);

    const checkDuplicate = async (isbn: string) => {
        if (!isbn || isbn.startsWith('MANUAL')) return false;
        const { data } = await supabase.from('books').select('id').eq('isbn', isbn);
        return data && data.length > 0;
    };

    const handleConfirm = async () => {
        if (!bookData) return;
        setLoading(true);

        // Check for duplicate if we haven't confirmed the warning yet
        if (!showDuplicateWarning) {
            const isDuplicate = await checkDuplicate(bookData.isbn);
            if (isDuplicate) {
                setShowDuplicateWarning(true);
                setLoading(false);
                return;
            }
        }

        try {
            const { error: insertError } = await supabase
                .from('books')
                .insert([{
                    title: bookData.title,
                    author: bookData.author,
                    cover_url: bookData.cover_url,
                    pages_total: bookData.pages_total,
                    isbn: bookData.isbn,
                    status: 'tbr',
                    date_added: new Date().toISOString()
                }]);

            if (insertError) throw insertError;
            setStep('success');
            setShowDuplicateWarning(false);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to save book.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-warm-beige flex flex-col animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200/50 bg-white/50 backdrop-blur-md sticky top-0">
                <h2 className="text-xl font-serif text-deep-blue tracking-wide">Add New Book</h2>
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-black/5 transition-colors">
                    <X size={24} className="text-ink-light" />
                </button>
            </div>

            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                <div className="bg-white p-1 rounded-3xl shadow-lg border border-white/20 overflow-hidden relative min-h-[400px]">

                    {step === 'scan' && (
                        <>
                            {!loading ? (
                                <>
                                    <div className="absolute top-4 left-0 right-0 z-10 text-center pointer-events-none">
                                        <span className="px-3 py-1 bg-black/50 backdrop-blur-md text-white/90 text-[10px] font-medium tracking-widest uppercase rounded-full">Scan ISBN</span>
                                    </div>
                                    <BarcodeScanner onScanSuccess={handleScan} />
                                    {error && <p className="text-red-500 text-center mt-4">{error}</p>}
                                    <div className="text-center mt-4 flex flex-col gap-2">
                                        <button onClick={() => { setStep('manual'); setError(null); }} className="text-deep-blue font-medium underline">
                                            Enter Manually
                                        </button>
                                        <button onClick={() => handleScan('9780140328721')} className="text-xs text-gray-400 underline">Simulate Scan</button>
                                    </div>
                                </>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-20">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
                                    <p className="mt-4 text-deep-blue font-serif">Looking up book...</p>
                                </div>
                            )}
                        </>
                    )}

                    {step === 'manual' && (
                        <div className="p-6 space-y-4 animate-fade-in">
                            <h3 className="text-lg font-serif text-deep-blue">Enter Details</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-ink-light mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={manualTitle}
                                        onChange={(e) => setManualTitle(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-gold focus:outline-none"
                                        placeholder="e.g. The Great Gatsby"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-ink-light mb-1">Author</label>
                                    <input
                                        type="text"
                                        value={manualAuthor}
                                        onChange={(e) => setManualAuthor(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-gold focus:outline-none"
                                        placeholder="e.g. F. Scott Fitzgerald"
                                    />
                                </div>
                            </div>
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            <div className="pt-4 space-y-3">
                                <button
                                    onClick={handleManualSubmit}
                                    className="w-full py-3 bg-gold text-white rounded-xl font-medium tracking-wide shadow-lg shadow-gold/30"
                                >
                                    Continue
                                </button>
                                <button
                                    onClick={() => setStep('scan')}
                                    className="w-full py-3 text-ink-light font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'confirm' && bookData && (
                        <div className="p-6 flex flex-col items-center text-center space-y-4 animate-fade-in relative">
                            {showDuplicateWarning && (
                                <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fade-in rounded-3xl">
                                    <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
                                        <BookOpen size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-deep-blue mb-2">Duplicate Found</h3>
                                    <p className="text-gray-600 mb-6">
                                        You already have a book with this ISBN in your library. Do you want to add this copy anyway?
                                    </p>
                                    <div className="w-full space-y-3">
                                        <button
                                            onClick={handleConfirm}
                                            disabled={loading}
                                            className="w-full py-3 bg-deep-blue text-white rounded-xl font-bold"
                                        >
                                            {loading ? 'Adding...' : 'Yes, Add Duplicate'}
                                        </button>
                                        <button
                                            onClick={() => { setShowDuplicateWarning(false); setStep('scan'); }}
                                            className="w-full py-3 text-gray-500 font-medium"
                                        >
                                            No, Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            <img src={bookData.cover_url} alt={bookData.title} className="w-32 h-48 object-cover rounded-md shadow-lg" />
                            <div>
                                <h3 className="text-xl font-serif text-deep-blue leading-tight">{bookData.title}</h3>
                                <p className="text-ink-light font-medium">{bookData.author}</p>
                            </div>
                            <div className="w-full pt-4 space-y-3">
                                <button
                                    onClick={handleConfirm}
                                    disabled={loading}
                                    className="w-full py-3 bg-gold text-white rounded-xl font-medium tracking-wide shadow-lg shadow-gold/30 active:scale-95 transition-transform"
                                >
                                    {loading ? 'Saving...' : 'Add to Library'}
                                </button>
                                <button
                                    onClick={() => setStep('scan')}
                                    className="w-full py-3 text-ink-light font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-50 animate-fade-in p-6 text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
                                <Check size={40} strokeWidth={3} />
                            </div>
                            <h3 className="text-2xl font-serif text-deep-blue mb-2">Book Added!</h3>
                            <p className="text-ink-light mb-8">"{bookData.title}" is now in your library.</p>
                            <div className="w-full space-y-3">
                                <button
                                    onClick={() => { setStep('scan'); setBookData(null); setManualTitle(''); setManualAuthor(''); }}
                                    className="w-full py-3 bg-white border border-stone-200 text-deep-blue rounded-xl font-medium shadow-sm"
                                >
                                    Scan Another
                                </button>
                                <button
                                    onClick={() => navigate('/')}
                                    className="w-full py-3 text-gold font-medium"
                                >
                                    Return Home
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
