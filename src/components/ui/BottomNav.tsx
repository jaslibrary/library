import React from 'react';
import { Home, Search, Plus, Heart, BarChart2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';

export const BottomNav = () => {
    const location = useLocation();
    const currentPath = location.pathname;

    const NavItem = ({ to, icon: Icon, label, isMain = false }: { to: string, icon: any, label: string, isMain?: boolean }) => {
        const isActive = currentPath === to;

        if (isMain) {
            return (
                <div className="relative -top-6">
                    <Link
                        to={to}
                        className="flex h-16 w-16 items-center justify-center rounded-full bg-gold text-white shadow-xl shadow-gold/30 transition-transform active:scale-95 border-4 border-warm-beige"
                    >
                        <Icon size={32} />
                    </Link>
                </div>
            );
        }

        return (
            <Link
                to={to}
                className={clsx(
                    "flex flex-col items-center justify-center space-y-1.5 w-16 transition-all duration-200",
                    isActive ? "text-gold translate-y-[-2px]" : "text-slate-400 hover:text-slate-200"
                )}
            >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className={clsx("text-[10px] font-medium tracking-wide", isActive ? "opacity-100" : "opacity-0")}>{label}</span>
            </Link>
        );
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50">
            {/* Dark gradient overlap for smooth fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-deep-blue via-deep-blue/95 to-transparent pointer-events-none" />

            <div className="relative bg-deep-blue border-t border-white/5 pb-6 pt-3 px-6 rounded-t-3xl shadow-[0_-10px_30px_-5px_rgba(0,0,0,0.3)]">
                <div className="flex items-center justify-between mx-auto max-w-md">
                    <NavItem to="/" icon={Home} label="Home" />
                    <NavItem to="/search" icon={Search} label="Search" />
                    <div className="w-12"></div> {/* Spacer for center button */}
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-5">
                        <NavItem to="/add" icon={Plus} label="Add" isMain />
                    </div>
                    <NavItem to="/wishlist" icon={Heart} label="Wishlist" />
                    <NavItem to="/stats" icon={BarChart2} label="Stats" />
                </div>
            </div>
        </div>
    );
};
