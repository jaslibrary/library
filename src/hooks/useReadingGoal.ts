import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export const useReadingGoal = (year: number = 2026) => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['reading-goal', year],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('reading_goals')
                .select('amount')
                .eq('year', year)
                .single();

            if (error) {
                // If row doesn't exist, return default 12 without erroring hard
                if (error.code === 'PGRST116') return 12;
                console.error('Error fetching reading goal:', error);
                return 12;
            }
            return data.amount;
        },
    });

    const updateGoal = useMutation({
        mutationFn: async (amount: number) => {
            const { error } = await supabase
                .from('reading_goals')
                .upsert({ year, amount, updated_at: new Date().toISOString() }, { onConflict: 'year' });

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reading-goal', year] });
        },
    });

    return {
        goal: query.data ?? 12,
        isLoading: query.isLoading,
        updateGoal: updateGoal.mutateAsync,
    };
};
