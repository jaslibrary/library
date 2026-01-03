import React, { useEffect } from 'react';

export const AddBookView = () => {
    useEffect(() => {
        console.log("Empty AddBookView Mounted");
    }, []);

    return (
        <div className="p-10 bg-green-100 min-h-screen pt-24 text-center">
            <h1 className="text-3xl font-bold">Add Book View (Safe Mode)</h1>
            <p>If you see this, the routing works and the file is safe.</p>
        </div>
    );
};
