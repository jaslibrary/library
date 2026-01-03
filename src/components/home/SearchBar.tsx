import { Search, X } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

interface SearchBarProps {
    value: string;
    onChange: (val: string) => void;
    activeFilter: string | null;
    onFilterChange: (filter: string | null) => void;
    filters: string[];
}

export const SearchBar = ({ value, onChange, activeFilter, onFilterChange, filters }: SearchBarProps) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="space-y-4 px-1">
            {/* Search Input */}
            <div className={clsx(
                "relative group transition-all duration-300",
                isFocused ? "scale-[1.02]" : "scale-100"
            )}>
                <div className="absolute inset-x-0 bottom-0 h-10 bg-gold/20 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
                <div className="relative bg-white rounded-2xl shadow-sm border border-stone-200 flex items-center p-1 focus-within:ring-2 focus-within:ring-deep-blue/10 focus-within:border-deep-blue/30 transition-all overflow-hidden">
                    <div className="pl-4 pr-3 text-gray-400">
                        <Search size={20} />
                    </div>
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="Search title, author, series..."
                        className="flex-1 w-full py-3 bg-transparent outline-none text-deep-blue font-medium placeholder:text-gray-400"
                    />
                    {value && (
                        <button
                            onClick={() => onChange('')}
                            className="p-2 text-gray-400 hover:text-deep-blue transition-colors"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Filter Pills */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-6 px-6 mask-fade-right">
                <button
                    onClick={() => onFilterChange(null)}
                    className={clsx(
                        "flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all border",
                        !activeFilter
                            ? "bg-deep-blue text-white border-deep-blue shadow-md"
                            : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                    )}
                >
                    All Books
                </button>
                {filters.map(filter => (
                    <button
                        key={filter}
                        onClick={() => onFilterChange(activeFilter === filter ? null : filter)}
                        className={clsx(
                            "flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all border",
                            activeFilter === filter
                                ? "bg-deep-blue text-white border-deep-blue shadow-md"
                                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                        )}
                    >
                        {filter}
                    </button>
                ))}
            </div>
        </div>
    );
};
