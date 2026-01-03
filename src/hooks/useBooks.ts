import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Book } from '../types/book';

export const useBooks = () => {
    const queryClient = useQueryClient();

    const booksQuery = useQuery({
        queryKey: ['books'],
        queryFn: async () => {
            console.log("useBooks: Fetching books...");
            try {
                const { data, error } = await supabase
                    .from('books')
                    .select('*')
                    .order('date_added', { ascending: false });

                if (error) {
                    console.error("useBooks: Supabase Error", error);
                    throw new Error(error.message);
                }

                console.log("useBooks: Success", data?.length);
                return data as Book[];
            } catch (err) {
                console.error("useBooks: System Error", err);
                throw err;
            }
        },
    });

    const updateBook = useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<Book> }) => {
            const { error } = await supabase.from('books').update(updates).eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['books'] });
            queryClient.invalidateQueries({ queryKey: ['books', 'reading'] });
        },
    });

    const deleteBook = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('books').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['books'] });
            queryClient.invalidateQueries({ queryKey: ['books', 'reading'] });
        },
    });

    const addBook = useMutation({
        mutationFn: async (newBook: Partial<Book>) => {
            const { error } = await supabase.from('books').insert([newBook]);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['books'] });
        },
    });

    return {
        ...booksQuery,
        addBook: addBook.mutateAsync,
        updateBook: updateBook.mutateAsync,
        deleteBook: deleteBook.mutateAsync,
    };
};

export const useReadingNow = () => {
    return useQuery({
        queryKey: ['books', 'reading'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('books')
                .select('*')
                .eq('status', 'reading')
                .limit(1)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found", which is fine
                throw new Error(error.message);
            }
            return data as Book | null;
        }
    })
}
