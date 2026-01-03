
import type { Book } from '../types/book';

export interface SeriesBook {
    title: string;
    author: string;
    cover_url: string;
    first_publish_year?: number;
    key: string;
    series_number?: number;
}

const CACHE_KEY_PREFIX = 'series_cache_v4_'; // v4 aggressive hydration
const CACHE_DURATION = 1000 * 60 * 60 * 24 * 7; // 7 days

// Helper for fuzzy string matching (Levenshtein distance simplified or includes check)
const isAuthorMatch = (a1: string, a2: string) => {
    const s1 = a1.toLowerCase().replace(/[^\w\s]/g, '');
    const s2 = a2.toLowerCase().replace(/[^\w\s]/g, '');
    return s1.includes(s2) || s2.includes(s1);
};

export const fetchSeriesBooks = async (seriesName: string, authorName: string): Promise<SeriesBook[]> => {
    // 1. Check Cache
    const cacheKey = `${CACHE_KEY_PREFIX}${seriesName}_${authorName}`.toLowerCase().replace(/\s+/g, '_');
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        const { timestamp, data } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
            return data;
        }
    }

    try {
        // 2. Fetch from OpenLibrary
        const query = `series:${seriesName.replace(/\s+/g, '+')} author:${authorName.replace(/\s+/g, '+')}`;
        const response = await fetch(`https://openlibrary.org/search.json?q=${query}&limit=50`);
        const data = await response.json();

        if (!data.docs || data.docs.length === 0) return [];

        // 3. Transform & Strict Filter & Deduplicate
        const relevantDocs = data.docs.filter((doc: any) => {
            // Strict Author Filter
            if (!doc.author_name || !doc.author_name.some((a: string) => isAuthorMatch(a, authorName))) return false;

            // Box Set / Omnibus / Collection Filter (Hardcore Mode)
            const titleLower = doc.title.toLowerCase();
            const badKeywords = [
                'box set', 'boxset', 'boxed', 'collection', 'omnibus', 'bundle', 'complete series',
                'anthology', 'trilogy', 'quartet', 'saga', 'duology', 'compendium', 'set of'
            ];
            // Regex for "1-5", "1 - 5", "Books 1-3", "1 through 5"
            const rangeRegex = /\b\d+\s?(-|–|through|to)\s?\d+\b/i;

            if (badKeywords.some(kw => titleLower.includes(kw))) return false;
            if (rangeRegex.test(titleLower) && (titleLower.includes('book') || titleLower.includes('vol') || titleLower.includes('part'))) return false;

            if (titleLower.startsWith('the complete')) return false;

            return true;
        });

        // Group by "Series Number" or "Normalized Title" to find best edition (with cover)
        const bookMap = new Map<string, SeriesBook>();

        relevantDocs.forEach((doc: any) => {
            let seriesNum: number | undefined;
            const numberMatch = doc.title.match(/[\(\[]\s?(?:Book|Vol\.?|#)\s?(\d+)[\)\]]/i) ||
                doc.title.match(/Series\s?#?(\d+)/i);
            if (numberMatch) seriesNum = parseInt(numberMatch[1], 10);

            const candidate: SeriesBook = {
                title: doc.title,
                author: doc.author_name ? doc.author_name[0] : authorName,
                cover_url: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : '',
                first_publish_year: doc.first_publish_year,
                key: doc.key,
                series_number: seriesNum
            };

            let key = seriesNum ? `num_${seriesNum}` : `title_${doc.title.toLowerCase().replace(/[^\w]/g, '')}`;

            const existing = bookMap.get(key);
            if (!existing) {
                bookMap.set(key, candidate);
            } else {
                if (!existing.cover_url && candidate.cover_url) {
                    bookMap.set(key, candidate);
                }
            }
        });

        const books = Array.from(bookMap.values());

        // Sort
        books.sort((a, b) => {
            if (a.series_number && b.series_number) return a.series_number - b.series_number;
            return (a.first_publish_year || 0) - (b.first_publish_year || 0);
        });

        // 4. Deep Hydration: Fill gaps (Covers AND Series Numbers) using Google Books
        const hydratedBooks = await Promise.all(books.map(async (b) => {
            // Need hydration if: No cover OR No series number
            if (b.cover_url && b.series_number) return b;

            try {
                const { searchGoogleBooks } = await import('../lib/google-books');
                const gRes = await searchGoogleBooks(`${b.title} ${b.author}`);

                if (!gRes || gRes.length === 0) return b;

                const gBook = gRes[0];
                const newB = { ...b };

                // Rescue Cover
                if (!newB.cover_url && gBook.cover_url) {
                    newB.cover_url = gBook.cover_url;
                }

                // Rescue Series Number
                if (!newB.series_number) {
                    // Try to extract from Google Title or Description if available
                    // Google often puts "Title: Series Name, Book 3"
                    const combinedText = `${gBook.title} ${gBook.description || ''}`;
                    const deepMatch = combinedText.match(/(?:Book|Vol\.?|#)\s?(\d+)/i);
                    if (deepMatch) {
                        newB.series_number = parseInt(deepMatch[1], 10);
                    }
                }

                return newB;
            } catch (e) {
                // Ignore failure
            }
            return b;
        }));

        const finalBooks = hydratedBooks.sort((a, b) => {
            if (a.series_number && b.series_number) return a.series_number - b.series_number;
            return (a.first_publish_year || 0) - (b.first_publish_year || 0);
        });

        // 5. Update Cache
        localStorage.setItem(cacheKey, JSON.stringify({
            timestamp: Date.now(),
            data: finalBooks
        }));

        return finalBooks;
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

export const checkBookSeries = async (title: string, author: string): Promise<string | null> => {
    try {
        // Use general search to find the book
        const query = `title:${title.replace(/\s+/g, '+')} author:${author.replace(/\s+/g, '+')}`;
        const response = await fetch(`https://openlibrary.org/search.json?q=${query}&limit=1`);
        const data = await response.json();

        if (data.docs && data.docs.length > 0) {
            const doc = data.docs[0];
            // Check if it has series data 
            // OpenLibrary "series" field is an array of strings
            if (doc.series && doc.series.length > 0) {
                return doc.series[0]; // Return the first series name
            }
        }
        return null;
    } catch (e) {
        console.error("Failed to check series for", title, e);
        return null;
    }
};
