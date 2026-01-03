export interface GoogleBookResult {
    title: string;
    author: string;
    cover_url: string;
    year?: string;
    description?: string;
    pages_total?: number;
}

export const searchGoogleBooks = async (query: string): Promise<GoogleBookResult[]> => {
    try {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20`);
        const data = await response.json();

        if (!data.items) return [];

        return data.items
            .filter((item: any) => item.volumeInfo.imageLinks?.thumbnail)
            .map((item: any) => ({
                title: item.volumeInfo.title,
                author: item.volumeInfo.authors ? item.volumeInfo.authors[0] : 'Unknown',
                cover_url: item.volumeInfo.imageLinks.thumbnail.replace('http:', 'https:'),
                year: item.volumeInfo.publishedDate?.substring(0, 4),
                description: item.volumeInfo.description,
                pages_total: item.volumeInfo.pageCount
            }));
    } catch (error) {
        console.error("Google Books Search Error:", error);
        return [];
    }
};
