
import type { Book } from '../types/book';

export interface SeriesBook {
    title: string;
    author: string;
    cover_url: string;
    first_publish_year?: number;
    key: string;
}

const CACHE_KEY_PREFIX = 'series_cache_';
const CACHE_DURATION = 1000 * 60 * 60 * 24 * 7; // 7 days

export const fetchSeriesBooks = async (seriesName: string): Promise<SeriesBook[]> => {
    // 1. Check Cache
    const cacheKey = `${CACHE_KEY_PREFIX}${seriesName.toLowerCase().replace(/\s+/g, '_')}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        const { timestamp, data } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
            return data;
        }
    }

    try {
        // 2. Fetch from OpenLibrary
        // Use general search with series name. This is broader but often works for finding related books.
        // Ideally we'd find the "Works" but search is a good entry point.
        const query = `series:${seriesName.replace(/\s+/g, '+')}`;
        const response = await fetch(`https://openlibrary.org/search.json?q=${query}&limit=50`);
        const data = await response.json();

        if (!data.docs || data.docs.length === 0) return [];

        // 3. Transform Data
        const books: SeriesBook[] = data.docs.map((doc: any) => ({
            title: doc.title,
            author: doc.author_name ? doc.author_name[0] : 'Unknown',
            cover_url: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : '',
            first_publish_year: doc.first_publish_year,
            key: doc.key
        }));

        // Sort by publish year as a proxy for series order
        books.sort((a, b) => (a.first_publish_year || 0) - (b.first_publish_year || 0));

        // 4. Update Cache
        localStorage.setItem(cacheKey, JSON.stringify({
            timestamp: Date.now(),
            data: books
        }));

        return books;
    } catch (error) {
        console.error(`Failed to fetch series ${seriesName}`, error);
        return [];
    }
};

export const identifyMissingBooks = (ownedBooks: Book[], seriesBooks: SeriesBook[]): SeriesBook[] => {
    if (!seriesBooks || seriesBooks.length === 0) return [];

    // Filter out books we already own
    // We match somewhat loosely on Title because editions might vary
    return seriesBooks.filter(seriesBook => {
        const isOwned = ownedBooks.some(owned => {
            // Normalize titles for comparison
            const t1 = owned.title.toLowerCase().replace(/[^\w\s]/g, '');
            const t2 = seriesBook.title.toLowerCase().replace(/[^\w\s]/g, '');
            // Check if one contains the other (e.g. "Harry Potter and the Sorcerer's Stone" vs "Harry Potter 1")
            // Or exact match
            return t1 === t2 || t1.includes(t2) || t2.includes(t1);
        });
        return !isOwned;
    });
};
