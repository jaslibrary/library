
/**
 * Utility to fetch enhanced metadata (Genre, Series) for a book.
 * Primarily uses OpenLibrary.
 */

interface EnhancedBookMetadata {
    genre?: string;
    series?: string;
}

export const fetchEnhancedBookMetadata = async (isbn: string): Promise<EnhancedBookMetadata> => {
    try {
        const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&jscmd=data&format=json`);
        const data = await response.json();

        const bookKey = `ISBN:${isbn}`;
        const book = data[bookKey];

        if (!book) {
            return {};
        }

        let series = '';
        let genre = '';

        // 1. Extract Series from Subjects (OpenLibrary convention: "series:Series_Name")
        if (book.subjects && Array.isArray(book.subjects)) {
            const seriesSubject = book.subjects.find((s: any) => s.name.toLowerCase().startsWith('series:'));
            if (seriesSubject) {
                // "series:Harry_Potter" -> "Harry Potter"
                series = seriesSubject.name.replace(/^series:/i, '').replace(/_/g, ' ').trim();
            }

            // 2. Extract Genre
            // Helper to determine if a subject is a "good" genre candidate
            const isGenreCandidate = (name: string) => {
                const lower = name.toLowerCase();
                const invalidPrefixes = ['series:', 'person:', 'place:', 'time:', 'org:'];
                if (invalidPrefixes.some(p => lower.startsWith(p))) return false;

                // Filter out common noise
                const noise = ['accessible book', 'protected daisy', 'large type', 'textbooks', 'juvenile literature', 'juvenile fiction', 'general'];
                // We keep "Juvenile fiction" usually, but maybe we want specific genres like "Fantasy".
                // Let's filter out strictly structural things.
                if (noise.includes(lower)) return false;

                // Filter out messy automated tags (e.g. nyt:young-adult=2020)
                if (lower.includes('nyt:') || lower.includes('=') || lower.match(/\d{4}-\d{2}-\d{2}/)) return false;

                return true;
            };

            const genreSubjects = book.subjects
                .filter((s: any) => isGenreCandidate(s.name))
                .map((s: any) => s.name)
                .slice(0, 3); // Take top 3 valid genres

            if (genreSubjects.length > 0) {
                // Deduplicate and join
                genre = Array.from(new Set(genreSubjects)).join(', ');
            }
        }

        return {
            series: series || undefined,
            genre: genre || undefined
        };

    } catch (error) {
        console.error("Failed to fetch enhanced metadata:", error);
        return {};
    }
};

/**
 * Cleans a category string from Google Books (e.g. "Fiction / Romance / General")
 * Returns the most specific valid genre.
 */
export const cleanGoogleBooksGenre = (category: string): string => {
    if (!category) return '';

    // Split by slash or comma and trim
    const parts = category.split(/[\/,]/).map(p => p.trim());

    // Filter out "General" and empty strings
    const validParts = parts.filter(p => {
        const lower = p.toLowerCase();
        return lower !== 'general' && lower !== '';
    });

    // If we have parts left, join them
    // e.g. "Fiction / Romance" -> "Fiction, Romance"
    if (validParts.length > 0) {
        return validParts.join(', ');
    }

    return '';
};
