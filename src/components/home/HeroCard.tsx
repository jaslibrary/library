// import { BookOpen } from 'lucide-react';
interface HeroBookProps {
    title?: string;
    author?: string; // Not in design but good to have
    category?: string;
    coverUrl?: string; // We'll use a placeholder if null
}

export const HeroCard = ({
    title = "Fantasy Novel",
    category = "Fantasy Novel",
    coverUrl
}: HeroBookProps) => {
    return (
        <div className="relative w-full aspect-[2/1] bg-deep-blue rounded-3xl overflow-hidden shadow-2xl p-6 flex items-center gap-6">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            {/* Book Cover */}
            <div className="h-full aspect-[2/3] rounded-md shadow-lg shadow-black/40 overflow-hidden flex-shrink-0 relative transform transition-transform hover:scale-105 duration-300 border border-white/10">
                <img
                    src={coverUrl || "https://images.unsplash.com/photo-1541963463532-d68292c34b19?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"}
                    alt="Book Cover"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Info Content */}
            <div className="flex-1 flex flex-col justify-center h-full space-y-4 z-10">
                <div className="space-y-1.5">
                    <span className="text-[10px] font-sans font-bold tracking-widest text-gold uppercase opacity-80">Reading Now</span>
                    <h3 className="text-white text-2xl font-serif tracking-wide drop-shadow-md line-clamp-2 leading-tight">
                        {title}
                    </h3>
                    <p className="text-slate-400 text-xs font-medium tracking-wide">
                        {category}
                    </p>
                </div>


            </div>
        </div>
    );
};
