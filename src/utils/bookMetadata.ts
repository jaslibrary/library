
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

                return true;
            };

            const genreSubject = book.subjects.find((s: any) => isGenreCandidate(s.name));
            if (genreSubject) {
                genre = genreSubject.name;
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

    // If we have parts left, take the last one (usually most specific)
    // e.g. "Fiction / Romance" -> "Romance"
    if (validParts.length > 0) {
        return validParts[validParts.length - 1];
    }

    // If everything was filtered out (e.g. just "General"), return original or empty
    // If original was "General", we prefer empty string or "Fiction" if available? 
    // Let's just return the first part if we have nothing else, but we specifically want to avoid "General".
    // If only "General", return empty to indicate no good genre found.
    return '';
};
