import { Book } from 'lucide-react';

export const Header = () => {
    return (
        <header className="sticky top-0 z-40 bg-warm-beige/95 backdrop-blur-sm px-6 py-2 flex items-center justify-between border-b border-stone-200/50">
            <div className="flex flex-col">
                <span className="text-[10px] font-sans font-medium tracking-widest text-gold text-transform uppercase mb-0">My Collection</span>
                <h1 className="text-2xl font-serif text-deep-blue tracking-tight leading-none">
                    Jasmine's Library
                </h1>
            </div>
            <div className="bg-white p-2 rounded-full shadow-sm border border-stone-100">
                <Book className="text-gold" size={20} />
            </div>
        </header>
    );
};
