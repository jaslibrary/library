
/**
 * Utility to fetch enhanced metadata (Genre, Series) for a book.
 * Parses OpenLibrary and Google Books data and maps to a standardized genre list.
 */

// Keywords that map to specific genres
// Order matters for "includes" checks if we were simple, but we'll use a scoring/matching system.
const KEYWORD_MAP: Record<string, string[]> = {
    "Fantasy Romance": ["fantasy romance", "romantic fantasy", "romantasy", "paranormal romance", "court of"], // "Court of" for SJM
    "Science Fiction": ["science fiction", "sci-fi", "scifi", "space", "cyberpunk", "futuristic", "aliens", "time travel"],
    "Fantasy": ["fantasy", "magic", "wizard", "witch", "mythical", "dragons", "sorcery", "fae", "elf"], // "Fae" for SJM
    "Romance": ["romance", "love", "relationship", "contemporary romance"],
    "Thriller / Suspense": ["thriller", "suspense", "psychological thriller", "espionage", "spy"],
    "Mystery": ["mystery", "crime", "detective", "murder"],
    "Horror": ["horror", "scary", "ghost", "undead", "supernatural"],
    "Historical Fiction": ["historical fiction", "historical romance", "regency"],
    "Dystopian": ["dystopian", "post-apocalyptic", "apocalyptic"],
    "Literary Fiction": ["literary fiction", "classic", "literature"],
    "Western": ["western", "frontier", "cowboy"],
    "Adventure": ["adventure", "exploration"],
    "Memoir / Autobiography": ["memoir", "autobiography", "diary"],
    "Biography": ["biography"],
    "True Crime": ["true crime"],
    "Self-Help": ["self-help", "self help", "personal development", "improvement", "psychology"],
    "History": ["history", "civilization", "war"],
    "Travel": ["travel", "quide", "journey"],
    "Science & Nature": ["science", "nature", "biology", "physics", "chemistry", "environment"],
    "Philosophy / Religion": ["philosophy", "religion", "theology", "spirituality", "wisdom"],
    "Cookbooks": ["cookbook", "cooking", "food", "recipes", "baking"]
};

// Normalizes and maps raw strings to the Standard Genre List
export const mapToStandardGenres = (rawInputs: string[]): string[] => {
    const findings = new Set<string>();
    const combinedText = rawInputs.join(' ').toLowerCase();

    // 1. Check specific composite logic first
    const hasFantasy = combinedText.includes('fantasy') || combinedText.includes('magic') || combinedText.includes('fae');
    const hasRomance = combinedText.includes('romance') || combinedText.includes('love');

    // Explicit override for Fantasy Romance
    if ((hasFantasy && hasRomance) || combinedText.includes('romantasy')) {
        findings.add("Fantasy Romance");
    }

    // 2. Iterate through map
    for (const [standard, keywords] of Object.entries(KEYWORD_MAP)) {
        // If we found Fantasy Romance, skip generic Fantasy and Romance to avoid duplicates/dilution?
        // User wants "Best matching".
        if (standard === "Fantasy" && findings.has("Fantasy Romance")) continue;
        if (standard === "Romance" && findings.has("Fantasy Romance")) continue;

        for (const kw of keywords) {
            // Check if any raw input *contains* the keyword
            // or strict match? Keyword "fantasy" matches "High Fantasy".
            if (rawInputs.some(input => input.toLowerCase().includes(kw))) {
                findings.add(standard);
                break; // Found this genre, move to next
            }
        }
    }

    // 3. Fallback: If "Fiction" is the only thing we have, maybe return it?
    // User didn't explicitly list "Fiction" as a category, just header. 
    // But "Literary Fiction" is there. 
    // If no match found, output nothing (empty string) so user can manually edit?
    // Or return just the capitalized inputs if meaningful?
    // User said: "only genres from the list I want populating"

    return Array.from(findings);
};

interface EnhancedBookMetadata {
    genre?: string;
    series?: string;
}

export const fetchEnhancedBookMetadata = async (isbn: string, googleCategories: string[] = []): Promise<EnhancedBookMetadata> => {
    try {
        const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&jscmd=data&format=json`);
        const data = await response.json();

        const bookKey = `ISBN:${isbn}`;
        const book = data[bookKey];

        let series = '';
        let validGenres: string[] = [];

        // Collect all raw inputs
        let rawTags: string[] = [...googleCategories];

        if (book) {
            // 1. Extract Series
            if (book.subjects && Array.isArray(book.subjects)) {
                const seriesSubject = book.subjects.find((s: any) => s.name.toLowerCase().startsWith('series:'));
                if (seriesSubject) {
                    series = seriesSubject.name.replace(/^series:/i, '').replace(/_/g, ' ').trim();
                }

                // Add OpenLibrary subjects to raw tags
                book.subjects.forEach((s: any) => {
                    if (!s.name.toLowerCase().startsWith('series:')) {
                        rawTags.push(s.name);
                    }
                });
            }
        }

        // 2. Smart Map
        validGenres = mapToStandardGenres(rawTags);

        // Deduplicate and join
        // If Fantasy Romance is present, we likely prefer that.
        // The set in mapToStandardGenres handles uniqueness.

        const finalGenre = validGenres.join(', ');

        return {
            series: series || undefined,
            genre: finalGenre || undefined
        };

    } catch (error) {
        console.error("Failed to fetch enhanced metadata:", error);
        // Fallback: try to map just the google categories
        const fallbackGenres = mapToStandardGenres(googleCategories);
        return {
            genre: fallbackGenres.join(', ') || undefined
        };
    }
};

/**
 * Cleans a category string from Google Books using the Standard List.
 * This is used for the immediate UI feedback before background fetch.
 */
export const cleanGoogleBooksGenre = (category: string): string => {
    if (!category) return '';
    const parts = category.split(/[\/,]/).map(p => p.trim());
    const mapped = mapToStandardGenres(parts);
    return mapped.join(', ');
};
