// import { BookOpen } from 'lucide-react';
interface HeroBookProps {
    title?: string;
    author?: string; // Not in design but good to have
    category?: string;
    coverUrl?: string; // We'll use a placeholder if null
    onClick?: () => void;
}

export const HeroCard = ({
    title = "Fantasy Novel",
    category = "Fantasy Novel",
    coverUrl,
    onClick
}: HeroBookProps) => {
    const finalCover = coverUrl || "https://images.unsplash.com/photo-1541963463532-d68292c34b19?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";

    return (
        <div
            onClick={onClick}
            className={`relative w-full aspect-[2/1] sm:aspect-[2.5/1] rounded-3xl overflow-hidden shadow-2xl group ${onClick ? 'cursor-pointer' : ''}`}
        >
            {/* Ambient Background Layer */}
            <div className="absolute inset-0 z-0">
                <img
                    src={finalCover}
                    alt="Background"
                    className="w-full h-full object-cover blur-2xl scale-125 opacity-60 animate-slow-pan"
                />
                <div className="absolute inset-0 bg-stone-900/40 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-r from-stone-900/90 via-stone-900/60 to-transparent" />

                {/* Subtle sheen overlay */}
                <div className="absolute inset-0 z-10 opacity-20 pointer-events-none overflow-hidden">
                    <div className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 animate-shimmer-fast" />
                </div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 w-full h-full p-6 flex items-center gap-5 sm:gap-8">

                {/* Book Cover (Floating) */}
                <div className="h-[90%] sm:h-full aspect-[2/3] rounded-lg shadow-2xl shadow-black/50 overflow-hidden flex-shrink-0 border border-white/20 transform transition-transform duration-500 ease-out group-hover:scale-105 group-hover:-rotate-2 group-hover:-translate-y-1">
                    <img
                        src={finalCover}
                        alt="Book Cover"
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Info Text */}
                <div className="flex-1 flex flex-col justify-center space-y-2">
                    <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/10 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                            <span className="text-[9px] font-bold text-white/90 uppercase tracking-widest leading-none pt-0.5">Reading Now</span>
                        </span>

                        <h3 className="text-white text-xl sm:text-3xl font-serif leading-snug tracking-wide line-clamp-2 drop-shadow-lg">
                            {title}
                        </h3>

                        <div className="h-0.5 w-12 bg-gold/50 rounded-full my-1" />

                        <p className="text-white/70 text-xs sm:text-sm font-medium tracking-wide line-clamp-1">
                            {category}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
