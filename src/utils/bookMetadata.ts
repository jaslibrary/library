
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
                const noise = ['accessible book', 'protected daisy', 'large type', 'textbooks', 'juvenile literature', 'juvenile fiction'];
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
