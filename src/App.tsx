import { useState } from 'react';
import {
  Home,
  Plus,
  List,
  BarChart3,
  Menu,
  X,
  DollarSign,
  Book,
  UtensilsCrossed,
  Building,
  Car,
  Home as HomeIcon,
  Users,
  Heart,
  HandHeart,
  Stethoscope,
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import Transactions from './components/Transactions';
import IncomeModal from './components/IncomeModal';
import ExpenseForm from './components/ExpenseForm';
import type { ExpenseCategory, Expense, Income } from './types';

type View = 'dashboard' | 'transactions' | 'analytics' | 'add-expense';

interface SidebarItem {
  id: View | string;
  label: string;
  icon: React.ReactNode;
}

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mainNavItems: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
    { id: 'transactions', label: 'Transactions', icon: <List className="w-5 h-5" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
  ];

  const categoryItems: SidebarItem[] = [
    { id: 'stationary', label: 'Stationery', icon: <Book className="w-5 h-5" /> },
    { id: 'food', label: 'Food', icon: <UtensilsCrossed className="w-5 h-5" /> },
    { id: 'pg', label: 'PG', icon: <Building className="w-5 h-5" /> },
    { id: 'transport', label: 'Transport', icon: <Car className="w-5 h-5" /> },
    { id: 'household', label: 'Household', icon: <HomeIcon className="w-5 h-5" /> },
    { id: 'friends', label: 'Friends', icon: <Users className="w-5 h-5" /> },
    { id: 'family', label: 'Family', icon: <Heart className="w-5 h-5" /> },
    { id: 'donated', label: 'Donated', icon: <HandHeart className="w-5 h-5" /> },
    { id: 'health', label: 'Health', icon: <Stethoscope className="w-5 h-5" /> },
  ];

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setSelectedCategory(expense.category);
    setShowExpenseForm(true);
  };

  const handleEditIncome = (income: Income) => {
    setEditingIncome(income);
    setShowIncomeModal(true);
  };

  const handleAddExpense = (category: ExpenseCategory) => {
    setSelectedCategory(category);
    setEditingExpense(null);
    setShowExpenseForm(true);
    setMobileMenuOpen(false);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'transactions':
        return (
          <Transactions
            onEditExpense={handleEditExpense}
            onEditIncome={handleEditIncome}
          />
        );
      case 'analytics':
        return <Analytics />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r shadow-sm">
        {/* Logo/Header */}
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Expense Tracker
          </h1>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-b space-y-2">
          <button
            onClick={() => {
              setEditingIncome(null);
              setShowIncomeModal(true);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-colors"
          >
            <DollarSign className="w-5 h-5" />
            Add Income
          </button>
          <button
            onClick={() => {
              setSelectedCategory(null);
              setEditingExpense(null);
              setShowExpenseForm(true);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Expense
          </button>
        </div>

        {/* Main Navigation */}
        <div className="p-4 border-b">
          <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">
            Overview
          </p>
          <nav className="space-y-1">
            {mainNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as View)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-all ${
                  currentView === item.id
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Categories */}
        <div className="p-4 flex-1 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">
            Categories
          </p>
          <nav className="space-y-1">
            {categoryItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleAddExpense(item.id as ExpenseCategory)}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all"
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b shadow-sm z-40">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Expense Tracker
          </h1>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-600 hover:text-gray-800"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-bold">Menu</h2>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="p-4 space-y-2">
              <button
                onClick={() => {
                  setEditingIncome(null);
                  setShowIncomeModal(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-500 text-white rounded-lg font-semibold"
              >
                <DollarSign className="w-5 h-5" />
                Add Income
              </button>
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setEditingExpense(null);
                  setShowExpenseForm(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-blue-500 text-white rounded-lg font-semibold"
              >
                <Plus className="w-5 h-5" />
                Add Expense
              </button>
            </div>

            {/* Navigation */}
            <div className="p-4 space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-400 mb-2 uppercase">
                  Overview
                </p>
                {mainNavItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id as View);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium ${
                      currentView === item.id
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 mb-2 uppercase">
                  Categories
                </p>
                {categoryItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleAddExpense(item.id as ExpenseCategory);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600"
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-0 mt-16 lg:mt-0">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">{renderContent()}</div>
      </main>

      {/* Modals */}
      <IncomeModal
        isOpen={showIncomeModal}
        onClose={() => {
          setShowIncomeModal(false);
          setEditingIncome(null);
        }}
        editingIncome={editingIncome || undefined}
        onSuccess={() => {
          setShowIncomeModal(false);
          setEditingIncome(null);
        }}
      />

      <ExpenseForm
        isOpen={showExpenseForm}
        onClose={() => {
          setShowExpenseForm(false);
          setEditingExpense(null);
          setSelectedCategory(null);
        }}
        defaultCategory={selectedCategory || 'stationary'}
        editingExpense={editingExpense || undefined}
        onSuccess={() => {
          setShowExpenseForm(false);
          setEditingExpense(null);
          setSelectedCategory(null);
        }}
      />

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="flex justify-around items-center py-2">
          <button
            onClick={() => {
              setCurrentView('dashboard');
              setMobileMenuOpen(false);
            }}
            className={`flex flex-col items-center gap-1 px-4 py-2 ${
              currentView === 'dashboard' ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs font-medium">Home</span>
          </button>
          <button
            onClick={() => {
              setEditingIncome(null);
              setShowIncomeModal(true);
            }}
            className="flex flex-col items-center gap-1 px-4 py-2 text-gray-500"
          >
            <div className="p-3 bg-emerald-500 rounded-full text-white -mt-6 shadow-lg">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium">Income</span>
          </button>
          <button
            onClick={() => {
              setSelectedCategory(null);
              setEditingExpense(null);
              setShowExpenseForm(true);
            }}
            className="flex flex-col items-center gap-1 px-4 py-2 text-gray-500"
          >
            <div className="p-3 bg-blue-500 rounded-full text-white -mt-6 shadow-lg">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium">Expense</span>
          </button>
          <button
            onClick={() => {
              setCurrentView('transactions');
              setMobileMenuOpen(false);
            }}
            className={`flex flex-col items-center gap-1 px-4 py-2 ${
              currentView === 'transactions' ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <List className="w-6 h-6" />
            <span className="text-xs font-medium">History</span>
          </button>
          <button
            onClick={() => {
              setCurrentView('analytics');
              setMobileMenuOpen(false);
            }}
            className={`flex flex-col items-center gap-1 px-4 py-2 ${
              currentView === 'analytics' ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <BarChart3 className="w-6 h-6" />
            <span className="text-xs font-medium">Analytics</span>
          </button>
        </div>
      </div>
    </div>
  );
}
