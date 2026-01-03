import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/ui/Header';
import { BottomNav } from '../components/ui/BottomNav';

export const MainLayout = () => {
    return (
        <div className="min-h-screen bg-warm-beige pb-24">
            <Header />
            <main className="px-5 transition-all duration-300 ease-in-out">
                <Outlet />
            </main>
            <BottomNav />
        </div>
    );
};
