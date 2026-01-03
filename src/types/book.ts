export interface Book {
    id: string; // or number, keeping basic for now
    title: string;
    author: string;
    cover_url?: string;
    status: 'read' | 'reading' | 'tbr' | 'wishlist';
    rating?: number;
    pages_total?: number;
    pages_read?: number;
    date_read?: string;
    date_started?: string;
    date_added?: string;
    book_type?: string;
    isbn?: string;
    author_name?: string; // Mapped from author column if needed, or alias
    notes?: string;
    quotes?: string;
}
