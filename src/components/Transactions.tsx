import { useState, useEffect } from 'react';
import { Search, Filter, X, Edit, Trash2, Undo } from 'lucide-react';
import { useExpenses } from '../hooks/useExpenses';
import { useIncome } from '../hooks/useIncome';
import { formatCurrency, formatDate, formatDateShort } from '../lib/utils';
import type { Transaction, ExpenseCategory } from '../types';

interface TransactionsProps {
  onEditExpense?: (expense: any) => void;
  onEditIncome?: (income: any) => void;
}

export default function Transactions({ onEditExpense, onEditIncome }: TransactionsProps) {
  const { expenses, fetchExpenses, deleteExpense } = useExpenses();
  const { incomeList, fetchIncome, deleteIncome } = useIncome();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [deletedItem, setDeletedItem] = useState<{
    type: 'income' | 'expense';
    id: string;
    timestamp: number;
  } | null>(null);

  useEffect(() => {
    fetchExpenses();
    fetchIncome();
  }, [fetchExpenses, fetchIncome]);

  useEffect(() => {
    // Combine and sort transactions
    const allTransactions: Transaction[] = [
      ...expenses.map((exp) => ({
        id: exp.id,
        type: 'expense' as const,
        category: exp.category,
        amount: exp.amount,
        date: exp.date,
        payment_mode: exp.mode_of_payment,
        meta_data: exp.meta_data,
        notes: exp.notes,
        created_at: exp.created_at,
      })),
      ...incomeList.map((inc) => ({
        id: inc.id,
        type: 'income' as const,
        source: inc.source,
        amount: inc.amount,
        date: inc.date,
        payment_mode: inc.payment_mode,
        notes: inc.notes,
        created_at: inc.created_at,
      })),
    ];

    // Sort by date descending
    allTransactions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    setTransactions(allTransactions);
  }, [expenses, incomeList]);

  useEffect(() => {
    // Apply filters
    let filtered = [...transactions];

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter((t) => t.type === selectedType);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((t) => t.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((t) => {
        const meta = t.meta_data as any;
        return (
          t.category?.toLowerCase().includes(query) ||
          t.source?.toLowerCase().includes(query) ||
          meta?.item?.toLowerCase().includes(query) ||
          meta?.reason?.toLowerCase().includes(query) ||
          meta?.name?.toLowerCase().includes(query) ||
          meta?.from_to?.toLowerCase().includes(query) ||
          t.notes?.toLowerCase().includes(query)
        );
      });
    }

    setFilteredTransactions(filtered);
  }, [transactions, selectedType, selectedCategory, searchQuery]);

  const handleDelete = async (id: string, type: 'income' | 'expense') => {
    let success = false;
    if (type === 'expense') {
      success = await deleteExpense(id);
    } else {
      success = await deleteIncome(id);
    }

    if (success) {
      setDeletedItem({ type, id, timestamp: Date.now() });
      // Auto-clear after 5 seconds
      setTimeout(() => setDeletedItem(null), 5000);
    }
  };

  const handleUndo = async () => {
    if (!deletedItem) return;

    // Note: For undo, we would need to implement a restore function
    // For now, just clear the deleted item state
    setDeletedItem(null);
  };

  const getTransactionTitle = (t: Transaction): string => {
    if (t.type === 'income') {
      return t.source || 'Income';
    }

    const meta = t.meta_data as any;
    const category = t.category || 'Expense';

    switch (t.category) {
      case 'stationary':
        return meta?.item || category;
      case 'food':
        return meta?.item || category;
      case 'pg':
        return meta?.expense_type?.toUpperCase() || category;
      case 'transport':
        return meta?.custom_transport || meta?.transport_type || category;
      case 'household':
        return meta?.item || category;
      case 'friends':
      case 'family':
        return meta?.reason || category;
      case 'donated':
        return meta?.donation_type || category;
      case 'health':
        return meta?.name || category;
      default:
        return category;
    }
  };

  const categories: ExpenseCategory[] = [
    'stationary',
    'food',
    'pg',
    'transport',
    'household',
    'friends',
    'family',
    'donated',
    'health',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">All Transactions</h2>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            showFilters
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transactions..."
            className="w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="bg-white border rounded-lg p-4 space-y-4">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Transaction Type
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'income', label: 'Income' },
                  { value: 'expense', label: 'Expenses' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() =>
                      setSelectedType(option.value as 'all' | 'income' | 'expense')
                    }
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedType === option.value
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            {selectedType !== 'income' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Expense Category
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedCategory === 'all'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                        selectedCategory === cat
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>{filteredTransactions.length} transactions found</span>
        {(selectedType !== 'all' || selectedCategory !== 'all' || searchQuery) && (
          <button
            onClick={() => {
              setSelectedType('all');
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="text-blue-500 hover:text-blue-700 font-medium"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Undo Snackbar */}
      {deletedItem && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-4 z-50">
          <span>Transaction deleted</span>
          <button
            onClick={handleUndo}
            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium"
          >
            <Undo className="w-4 h-4" />
            Undo
          </button>
        </div>
      )}

      {/* Transactions List */}
      <div className="bg-white rounded-xl shadow-md border overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            {searchQuery || selectedType !== 'all' || selectedCategory !== 'all'
              ? 'No matching transactions found'
              : 'No transactions yet'}
          </div>
        ) : (
          <div className="divide-y">
            {filteredTransactions.map((transaction) => (
              <div
                key={`${transaction.type}-${transaction.id}`}
                className="p-4 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-1 h-12 rounded-full ${
                        transaction.type === 'income'
                          ? 'bg-emerald-500'
                          : 'bg-red-500'
                      }`}
                    />
                    <div>
                      <p className="font-semibold text-gray-800">
                        {getTransactionTitle(transaction)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            transaction.type === 'income'
                              ? 'bg-emerald-100 text-emerald-600'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {transaction.type === 'income'
                            ? 'INCOME'
                            : transaction.category?.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDateShort(transaction.date)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
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

                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          if (transaction.type === 'expense' && onEditExpense) {
                            const expense = expenses.find(
                              (e) => e.id === transaction.id
                            );
                            if (expense) onEditExpense(expense);
                          } else if (transaction.type === 'income' && onEditIncome) {
                            const income = incomeList.find(
                              (i) => i.id === transaction.id
                            );
                            if (income) onEditIncome(income);
                          }
                        }}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          handleDelete(transaction.id, transaction.type)
                        }
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {transaction.notes && (
                  <p className="text-sm text-gray-500 mt-2 pl-5">
                    {transaction.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
