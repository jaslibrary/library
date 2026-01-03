import { supabase } from '../lib/supabase';

// Helper to check if an image URL is valid (returns 200)
const isValidImage = async (url: string): Promise<boolean> => {
    try {
        const res = await fetch(url, { method: 'HEAD' });
        return res.ok;
    } catch {
        return false;
    }
};

export const findBookCover = async (isbn: string, title?: string, author?: string): Promise<string | null> => {
    console.log(`Starting cover hunt for ISBN: ${isbn}`);

    // 1. iTunes / Apple Books API (High Quality)
    try {
        const res = await fetch(`https://itunes.apple.com/lookup?isbn=${isbn}`);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
            // Get the largest artwork
            const artwork = data.results[0].artworkUrl100; // usually comes small, we can hack the URL for larger
            if (artwork) {
                const highRes = artwork.replace('100x100bb', '900x0w'); // Apple URL hack for max res
                return highRes;
            }
        }
    } catch (e) {
        console.error('iTunes lookup failed:', e);
    }

    // 2. Google Books API (Fallback)
    try {
        const query = isbn ? `isbn:${isbn}` : `intitle:${title}+inauthor:${author}`;
        const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}`);
        const data = await res.json();
        if (data.items && data.items.length > 0) {
            const vol = data.items[0].volumeInfo;
            if (vol.imageLinks) {
                // Prefer extraLarge, then large, then medium, etc.
                return vol.imageLinks.extraLarge || vol.imageLinks.large || vol.imageLinks.medium || vol.imageLinks.thumbnail || null;
            }
        }
    } catch (e) {
        console.error('Google Books lookup failed:', e);
    }

    // 3. Open Library (Last Resort)
    try {
        const coverUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
        if (await isValidImage(coverUrl)) {
            return coverUrl;
        }
    } catch (e) {
        console.error('OpenLibrary lookup failed:', e);
    }

    return null;
};

export const autoPatchCover = async (bookId: string, isbn: string, title: string, author: string) => {
    const coverUrl = await findBookCover(isbn, title, author);
    if (coverUrl) {
        await supabase
            .from('books')
            .update({ cover_url: coverUrl })
            .eq('id', bookId);
        console.log(`Updated cover for book ${bookId}`);
        return coverUrl;
    }
    return null;
}
