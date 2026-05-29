import { useState, useEffect, useCallback } from 'react';
import { useExpenseStats } from './useExpenses';
import { useIncomeStats } from './useIncome';

export function useBalance() {
  const { todayTotal: todayExpenses, monthTotal: monthExpenses, refetch: refetchExpenses } = useExpenseStats();
  const { todayTotal: todayIncome, monthTotal: monthIncome, refetch: refetchIncome } = useIncomeStats();

  const [todayBalance, setTodayBalance] = useState(0);
  const [monthBalance, setMonthBalance] = useState(0);

  useEffect(() => {
    setTodayBalance(todayIncome - todayExpenses);
    setMonthBalance(monthIncome - monthExpenses);
  }, [todayIncome, todayExpenses, monthIncome, monthExpenses]);

  const refetch = useCallback(() => {
    refetchExpenses();
    refetchIncome();
  }, [refetchExpenses, refetchIncome]);

  return {
    todayIncome,
    todayExpenses,
    todayBalance,
    monthIncome,
    monthExpenses,
    monthBalance,
    refetch,
  };
}
