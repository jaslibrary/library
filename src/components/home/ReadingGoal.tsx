import React, { useState, useEffect } from 'react';
import { Trophy, Edit2, Check } from 'lucide-react';
import clsx from 'clsx';

interface ReadingGoalProps {
    booksRead: number;
}

export const ReadingGoal = ({ booksRead }: ReadingGoalProps) => {
    const [goal, setGoal] = useState(12); // Default goal
    const [isEditing, setIsEditing] = useState(false);
    const [tempGoal, setTempGoal] = useState<string>('12');

    useEffect(() => {
        const savedGoal = localStorage.getItem('annualReadingGoal');
        if (savedGoal) {
            setGoal(parseInt(savedGoal, 10));
            setTempGoal(savedGoal);
        }
    }, []);

    const handleSaveGoal = () => {
        const newGoal = parseInt(tempGoal, 10);
        if (!isNaN(newGoal) && newGoal > 0) {
            setGoal(newGoal);
            localStorage.setItem('annualReadingGoal', newGoal.toString());
            setIsEditing(false);
        }
    };

    const percentage = Math.min(100, Math.round((booksRead / goal) * 100));

    // Circular Progress Math
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 flex items-center justify-between relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute right-0 top-0 w-32 h-32 bg-gold/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="flex-1 z-10">
                <div className="flex items-center gap-2 mb-1 text-deep-blue font-serif font-medium">
                    <Trophy size={18} className="text-gold" />
                    <span>2026 Reading Goal</span>
                </div>

                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-deep-blue">{booksRead}</span>
                    <span className="text-ink-light text-sm">of</span>

                    {isEditing ? (
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={tempGoal}
                                onChange={(e) => setTempGoal(e.target.value)}
                                className="w-16 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-sm font-bold text-deep-blue focus:outline-none focus:ring-2 focus:ring-gold"
                            />
                            <button onClick={handleSaveGoal} className="bg-gold text-white p-1 rounded-full hover:scale-105 transition-transform">
                                <Check size={14} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditing(true)}>
                            <span className="text-xl font-bold text-ink-light border-b border-transparent group-hover:border-stone-300 transition-colors">{goal}</span>
                            <Edit2 size={12} className="text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    )}

                    <span className="text-ink-light text-sm">books</span>
                </div>

                <p className="text-xs text-ink-light mt-2 max-w-[150px]">
                    {percentage >= 100 ? "Goal met! You're amazing!" : `${goal - booksRead} books away from your target.`}
                </p>
            </div>

            {/* Circular Chart */}
            <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0 z-10">
                <svg className="w-full h-full transform -rotate-90">
                    {/* Track */}
                    <circle
                        cx="50%"
                        cy="50%"
                        r={radius}
                        fill="none"
                        className="stroke-stone-100"
                        strokeWidth="8"
                    />
                    {/* Progress */}
                    <circle
                        cx="50%"
                        cy="50%"
                        r={radius}
                        fill="none"
                        className="stroke-gold transition-all duration-1000 ease-out"
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-deep-blue">{percentage}%</span>
                </div>
            </div>
        </div>
    );
};
