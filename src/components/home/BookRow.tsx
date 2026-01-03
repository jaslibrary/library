import { BookCard } from './BookCard';

interface BookRowProps {
    title: string;
    books: any[]; // Using any for now, will type properly with Supabase
    onBookClick?: (book: any) => void;
}

export const BookRow = ({ title, books, onBookClick }: BookRowProps) => {
    return (
        <div className="flex flex-col space-y-4">
            <h2 className="px-6 text-xl font-serif text-deep-blue tracking-wide font-medium flex items-center gap-2">
                {title}
                <div className="h-px bg-stone-200 flex-1 ml-2"></div>
            </h2>

            {/* Horizontal Scroll Container */}
            <div className="flex overflow-x-auto px-6 pb-4 gap-6 snap-x snap-mandatory no-scrollbar scroll-pl-6">
                {books.map((book, idx) => {
                    // Map Supabase snake_case to component camelCase
                    const props = {
                        title: book.title,
                        author: book.author,
                        coverUrl: book.cover_url || book.coverUrl, // Handle both cases
                        rating: book.rating,
                        status: book.status,
                        edition: book.edition
                    };
                    return (
                        <div key={book.id || idx} onClick={() => onBookClick && onBookClick(book)}>
                            <BookCard {...props} />
                        </div>
                    );
                })}
            </div>
            {/* <div className="px-6 text-blue-500">BookRow Active (No Cards)</div> */}
        </div>
    );
};
