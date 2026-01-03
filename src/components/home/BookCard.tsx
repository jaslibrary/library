import { Star } from 'lucide-react';
import clsx from 'clsx';

interface BookCardProps {
    title: string;
    author: string;
    coverUrl?: string;
    rating?: number; // 0-5
    status?: string; // 'read', 'reading', 'tbr'
    onBookClick?: () => void;
}

export const BookCard = ({ title, author, coverUrl, rating = 0, status, onBookClick }: BookCardProps) => {
    return (
        <div
            className="w-[130px] flex-shrink-0 flex flex-col space-y-2 snap-start cursor-pointer transition-opacity active:opacity-70"
            onClick={onBookClick}
        >
            <div className="relative w-full aspect-[2/3] rounded-lg shadow-md overflow-hidden bg-gray-200 group">
                <img
                    src={coverUrl || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                />

                {/* Read Sash */}
                {status === 'read' && (
                    <div className="absolute top-3 -right-8 w-32 bg-[#A89F81]/90 text-white text-[10px] font-bold py-1 text-center rotate-45 shadow-sm transform translate-x-2">
                        Read
                    </div>
                )}
            </div>

            <div className="space-y-1">
                <h4 className="text-ink text-sm font-bold font-serif leading-tight line-clamp-2 pb-0.5">
                    {title}
                </h4>
                <p className="text-xs text-ink-light font-medium truncate pb-0.5">
                    {author}
                </p>
                {rating > 0 && (
                    <div className="flex items-center space-x-0.5">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                size={10}
                                className={clsx(
                                    i < rating ? "fill-gold text-gold" : "fill-gray-200 text-gray-200"
                                )}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
