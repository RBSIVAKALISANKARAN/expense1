import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Package,
  Wallet,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { useBalance } from '../hooks/useBalance';
import { useExpenses } from '../hooks/useExpenses';
import { formatCurrency, formatDateShort, getCategoryColor } from '../lib/utils';
import type { Transaction } from '../types';

export default function Dashboard() {
  const {
    todayIncome,
    todayExpenses,
    todayBalance,
    monthIncome,
    monthExpenses,
    monthBalance,
  } = useBalance();
  const { expenses, fetchExpenses } = useExpenses();
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [categoryDistribution, setCategoryDistribution] = useState<any[]>([]);

  useEffect(() => {
    // Fetch expenses for current month
    const startDate = new Date();
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    fetchExpenses({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    });
  }, [fetchExpenses]);

  useEffect(() => {
    // Build recent transactions
    const transactions: Transaction[] = expenses.slice(0, 10).map((exp) => ({
      id: exp.id,
      type: 'expense' as const,
      category: exp.category,
      amount: exp.amount,
      date: exp.date,
      payment_mode: exp.mode_of_payment,
      meta_data: exp.meta_data,
      notes: exp.notes,
      created_at: exp.created_at,
    }));
    setRecentTransactions(transactions);

    // Build category distribution
    const categoryTotals: Record<string, number> = {};
    expenses.forEach((exp) => {
      const current = categoryTotals[exp.category] || 0;
      categoryTotals[exp.category] = current + Number(exp.amount);
    });

    const distribution = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        name: category.charAt(0).toUpperCase() + category.slice(1),
        value: amount,
        category,
      }))
      .sort((a, b) => b.value - a.value);

    setCategoryDistribution(distribution);

    // Build last 6 months data
    const months: any[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const monthLabel = monthStart.toLocaleDateString('en-IN', {
        month: 'short',
      });

      // Calculate income and expenses for this month
      const monthExpensesAmount = expenses
        .filter((exp) => {
          const expDate = new Date(exp.date);
          return expDate >= monthStart && expDate <= monthEnd;
        })
        .reduce((sum, exp) => sum + Number(exp.amount), 0);

      months.push({
        month: monthLabel,
        expenses: monthExpensesAmount,
        income: 0, // Will be updated with real income data
      });
    }
    setMonthlyData(months);
  }, [expenses]);

  const PIE_COLORS = [
    '#3B82F6',
    '#F59E0B',
    '#10B981',
    '#6366F1',
    '#EC4899',
    '#8B5CF6',
    '#EF4444',
    '#14B8A6',
    '#F97316',
  ];

  return (
    <div className="space-y-6">
      {/* Balance Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-100 text-lg font-medium">Current Balance</p>
            <h2 className="text-5xl font-bold mt-2">{formatCurrency(monthBalance)}</h2>
            <p className="text-emerald-100 mt-2">
              {monthBalance >= 0 ? 'Surplus' : 'Deficit'} this month
            </p>
          </div>
          <Wallet className="w-20 h-20 opacity-20" />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today */}
        <div className="bg-white rounded-xl shadow-md p-6 border hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Today</p>
              <p className="text-2xl font-bold text-gray-800">
                {formatCurrency(todayBalance)}
              </p>
            </div>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1 text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>{formatCurrency(todayIncome)}</span>
            </div>
            <div className="flex items-center gap-1 text-red-600">
              <TrendingDown className="w-4 h-4" />
              <span>{formatCurrency(todayExpenses)}</span>
            </div>
          </div>
        </div>

        {/* Month Income */}
        <div className="bg-white rounded-xl shadow-md p-6 border hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Month Income</p>
              <p className="text-2xl font-bold text-emerald-600">
                {formatCurrency(monthIncome)}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-500">This month's total earnings</p>
        </div>

        {/* Month Expenses */}
        <div className="bg-white rounded-xl shadow-md p-6 border hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <Package className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Month Expenses</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(monthExpenses)}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-500">This month's total spending</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expense Chart */}
        <div className="bg-white rounded-xl shadow-md p-6 border">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Income vs Expenses
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" fill="#10B981" name="Income" />
              <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl shadow-md p-6 border">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Expense Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getCategoryColor(entry.category)}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {categoryDistribution.slice(0, 5).map((entry, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getCategoryColor(entry.category) }}
                />
                <span className="text-gray-600">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-md p-6 border">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Recent Transactions
        </h3>
        {recentTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No transactions yet. Add your first expense or income!
          </div>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-12 rounded-full ${
                      transaction.type === 'income'
                        ? 'bg-emerald-500'
                        : 'bg-red-500'
                    }`}
                  />
                  <div>
                    <p className="font-semibold text-gray-800">
                      {transaction.type === 'income'
                        ? transaction.source
                        : transaction.category}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDateShort(transaction.date)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-bold text-lg ${
                      transaction.type === 'income'
                        ? 'text-emerald-600'
                        : 'text-red-600'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-xs text-gray-500 uppercase">
                    {transaction.payment_mode}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
