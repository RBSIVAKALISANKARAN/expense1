import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Expense, ExpenseInsert, ExpenseCategory } from '../types';
import { getTodayDate, getMonthStart, getMonthEnd } from '../lib/utils';

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = useCallback(async (filters?: {
    category?: ExpenseCategory;
    startDate?: string;
    endDate?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('expenses')
        .select('*')
        .eq('is_deleted', false)
        .order('date', { ascending: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.startDate) {
        query = query.gte('date', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('date', filters.endDate);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setExpenses(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  }, []);

  const addExpense = async (expense: ExpenseInsert): Promise<Expense | null> => {
    try {
      setError(null);
      const { data, error: insertError } = await supabase
        .from('expenses')
        .insert(expense)
        .select()
        .single();

      if (insertError) throw insertError;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add expense');
      return null;
    }
  };

  const updateExpense = async (id: string, updates: Partial<ExpenseInsert>): Promise<Expense | null> => {
    try {
      setError(null);
      const { data, error: updateError } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update expense');
      return null;
    }
  };

  const deleteExpense = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('expenses')
        .update({ is_deleted: true })
        .eq('id', id);

      if (deleteError) throw deleteError;
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete expense');
      return false;
    }
  };

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('expenses-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expenses',
        },
        () => {
          fetchExpenses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchExpenses]);

  // Initial fetch
  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  return {
    expenses,
    loading,
    error,
    fetchExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
  };
}

export function useExpenseStats() {
  const [todayTotal, setTodayTotal] = useState(0);
  const [monthTotal, setMonthTotal] = useState(0);
  const [categoryTotals, setCategoryTotals] = useState<Record<string, number>>({});

  const fetchStats = useCallback(async () => {
    try {
      const today = getTodayDate();
      const monthStart = getMonthStart();
      const monthEnd = getMonthEnd();

      // Today's expenses
      const { data: todayData } = await supabase
        .from('expenses')
        .select('amount')
        .eq('is_deleted', false)
        .eq('date', today);

      const todaySum = todayData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
      setTodayTotal(todaySum);

      // Month's expenses
      const { data: monthData } = await supabase
        .from('expenses')
        .select('category, amount')
        .eq('is_deleted', false)
        .gte('date', monthStart)
        .lte('date', monthEnd);

      const monthSum = monthData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
      setMonthTotal(monthSum);

      // Category totals
      const categoryMap: Record<string, number> = {};
      monthData?.forEach((item) => {
        const current = categoryMap[item.category] || 0;
        categoryMap[item.category] = current + Number(item.amount);
      });
      setCategoryTotals(categoryMap);
    } catch (err) {
      console.error('Error fetching expense stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Real-time subscription for stats
  useEffect(() => {
    const channel = supabase
      .channel('expenses-stats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expenses',
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchStats]);

  return {
    todayTotal,
    monthTotal,
    categoryTotals,
    refetch: fetchStats,
  };
}
