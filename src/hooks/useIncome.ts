import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Income, IncomeInsert } from '../types';
import { getTodayDate, getMonthStart, getMonthEnd } from '../lib/utils';

export function useIncome() {
  const [incomeList, setIncomeList] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIncome = useCallback(async (filters?: {
    startDate?: string;
    endDate?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('income')
        .select('*')
        .eq('is_deleted', false)
        .order('date', { ascending: false });

      if (filters?.startDate) {
        query = query.gte('date', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('date', filters.endDate);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setIncomeList(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch income');
    } finally {
      setLoading(false);
    }
  }, []);

  const addIncome = async (income: IncomeInsert): Promise<Income | null> => {
    try {
      setError(null);
      const { data, error: insertError } = await supabase
        .from('income')
        .insert(income)
        .select()
        .single();

      if (insertError) throw insertError;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add income');
      return null;
    }
  };

  const updateIncome = async (id: string, updates: Partial<IncomeInsert>): Promise<Income | null> => {
    try {
      setError(null);
      const { data, error: updateError } = await supabase
        .from('income')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update income');
      return null;
    }
  };

  const deleteIncome = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('income')
        .update({ is_deleted: true })
        .eq('id', id);

      if (deleteError) throw deleteError;
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete income');
      return false;
    }
  };

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('income-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'income',
        },
        () => {
          fetchIncome();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchIncome]);

  // Initial fetch
  useEffect(() => {
    fetchIncome();
  }, [fetchIncome]);

  return {
    incomeList,
    loading,
    error,
    fetchIncome,
    addIncome,
    updateIncome,
    deleteIncome,
  };
}

export function useIncomeStats() {
  const [todayTotal, setTodayTotal] = useState(0);
  const [monthTotal, setMonthTotal] = useState(0);
  const [sourceTotals, setSourceTotals] = useState<Record<string, number>>({});

  const fetchStats = useCallback(async () => {
    try {
      const today = getTodayDate();
      const monthStart = getMonthStart();
      const monthEnd = getMonthEnd();

      // Today's income
      const { data: todayData } = await supabase
        .from('income')
        .select('amount')
        .eq('is_deleted', false)
        .eq('date', today);

      const todaySum = todayData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
      setTodayTotal(todaySum);

      // Month's income
      const { data: monthData } = await supabase
        .from('income')
        .select('source, amount')
        .eq('is_deleted', false)
        .gte('date', monthStart)
        .lte('date', monthEnd);

      const monthSum = monthData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
      setMonthTotal(monthSum);

      // Source totals
      const sourceMap: Record<string, number> = {};
      monthData?.forEach((item) => {
        const current = sourceMap[item.source] || 0;
        sourceMap[item.source] = current + Number(item.amount);
      });
      setSourceTotals(sourceMap);
    } catch (err) {
      console.error('Error fetching income stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Real-time subscription for stats
  useEffect(() => {
    const channel = supabase
      .channel('income-stats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'income',
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
    sourceTotals,
    refetch: fetchStats,
  };
}
