import { useState, useEffect } from 'react';
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
import { useExpenses } from '../hooks/useExpenses';
import { formatCurrency } from '../lib/utils';

type AnalyticsType = 'food' | 'health' | 'income';

export default function Analytics() {
  const [activeTab, setActiveTab] = useState<AnalyticsType>('food');
  const { expenses, fetchExpenses } = useExpenses();
  const [foodData, setFoodData] = useState<any>({
    mealTypeChart: [],
    foodCategoryChart: [],
    dailyTrend: [],
  });
  const [healthData, setHealthData] = useState<any>({
    typeChart: [],
    monthlyChart: [],
    expenses: [],
  });

  useEffect(() => {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);
    startDate.setDate(1);
    const endDate = new Date();

    fetchExpenses({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    });
  }, [fetchExpenses]);

  useEffect(() => {
    // Process Food Expense Data
    const foodExpenses = expenses.filter((exp) => exp.category === 'food');

    // Meal Type Distribution
    const mealTypeTotals: Record<string, number> = {
      breakfast: 0,
      lunch: 0,
      dinner: 0,
      snacks: 0,
    };

    // Food Category Distribution
    const foodCategoryTotals: Record<string, number> = {
      fruits: 0,
      vegies: 0,
      millets: 0,
      carbsitems: 0,
      junk: 0,
    };

    foodExpenses.forEach((exp) => {
      const meta = exp.meta_data as any;
      if (meta.meal_type) {
        mealTypeTotals[meta.meal_type] += Number(exp.amount);
      }
      if (meta.food_category) {
        foodCategoryTotals[meta.food_category] += Number(exp.amount);
      }
    });

    const mealTypeChart = Object.entries(mealTypeTotals).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));

    const foodCategoryChart = Object.entries(foodCategoryTotals).map(
      ([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      })
    );

    // Daily Food Spending Trend (Last 30 days)
    const last30Days: any[] = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayTotal = foodExpenses
        .filter((exp) => exp.date === dateStr)
        .reduce((sum, exp) => sum + Number(exp.amount), 0);

      last30Days.push({
        date: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        amount: dayTotal,
      });
    }

    setFoodData({
      mealTypeChart,
      foodCategoryChart,
      dailyTrend: last30Days,
    });

    // Process Health Expense Data
    const healthExpenses = expenses.filter((exp) => exp.category === 'health');

    // Health Type Distribution
    const healthTypeTotals: Record<string, number> = {
      hospital: 0,
      medical: 0,
    };

    healthExpenses.forEach((exp) => {
      const meta = exp.meta_data as any;
      if (meta.health_type) {
        healthTypeTotals[meta.health_type] += Number(exp.amount);
      }
    });

    const typeChart = Object.entries(healthTypeTotals).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));

    // Monthly Health Expenses (Last 6 months)
    const monthlyChart: any[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const monthLabel = monthStart.toLocaleDateString('en-IN', { month: 'short' });

      const monthTotal = healthExpenses
        .filter((exp) => {
          const expDate = new Date(exp.date);
          return expDate >= monthStart && expDate <= monthEnd;
        })
        .reduce((sum, exp) => sum + Number(exp.amount), 0);

      monthlyChart.push({
        month: monthLabel,
        amount: monthTotal,
      });
    }

    setHealthData({
      typeChart,
      monthlyChart,
      expenses: healthExpenses.slice(0, 20),
    });
  }, [expenses]);

  const MEAL_COLORS = ['#F59E0B', '#EF4444', '#6366F1', '#14B8A6'];
  const FOOD_CAT_COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EF4444'];
  const HEALTH_COLORS = ['#EF4444', '#F97316'];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-3 bg-gray-100 p-1 rounded-lg">
        {(['food', 'health'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 px-6 rounded-md font-semibold transition-all capitalize ${
              activeTab === tab
                ? 'bg-white text-gray-800 shadow'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab} Analytics
          </button>
        ))}
      </div>

      {/* Food Analytics */}
      {activeTab === 'food' && (
        <div className="space-y-6">
          {/* Meal Type Distribution */}
          <div className="bg-white rounded-xl shadow-md p-6 border">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Spending by Meal Type
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={foodData.mealTypeChart}
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
                    {foodData.mealTypeChart.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={MEAL_COLORS[index % MEAL_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {foodData.mealTypeChart.map((entry: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: MEAL_COLORS[index] }}
                      />
                      <span className="font-medium text-gray-700">{entry.name}</span>
                    </div>
                    <span className="font-bold text-gray-800">
                      {formatCurrency(entry.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Food Category Distribution */}
          <div className="bg-white rounded-xl shadow-md p-6 border">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Spending by Food Category
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={foodData.foodCategoryChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#F59E0B">
                  {foodData.foodCategoryChart.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={FOOD_CAT_COLORS[index % FOOD_CAT_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Daily Food Spending Trend */}
          <div className="bg-white rounded-xl shadow-md p-6 border">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Daily Food Spending (Last 30 Days)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={foodData.dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" interval={4} />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={{ fill: '#F59E0B', r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Health Analytics */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          {/* Health Type Distribution */}
          <div className="bg-white rounded-xl shadow-md p-6 border">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Hospital vs Medical
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={healthData.typeChart}
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
                    {healthData.typeChart.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={HEALTH_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col justify-center gap-6">
                {healthData.typeChart.map((entry: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: HEALTH_COLORS[index] }}
                      />
                      <span className="font-medium text-gray-700 text-lg">
                        {entry.name}
                      </span>
                    </div>
                    <span className="font-bold text-2xl text-gray-800">
                      {formatCurrency(entry.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Monthly Health Expenses */}
          <div className="bg-white rounded-xl shadow-md p-6 border">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Monthly Health Expenses
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={healthData.monthlyChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Health Expenses List */}
          <div className="bg-white rounded-xl shadow-md p-6 border">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Recent Health Expenses
            </h3>
            {healthData.expenses.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No health expenses recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Type
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Medicine
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {healthData.expenses.map((exp: any) => {
                      const meta = exp.meta_data as any;
                      return (
                        <tr key={exp.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {new Date(exp.date).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                meta.health_type === 'hospital'
                                  ? 'bg-red-100 text-red-600'
                                  : 'bg-orange-100 text-orange-600'
                              }`}
                            >
                              {meta.health_type?.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-gray-800">
                            {meta.name}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {meta.medicine}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-red-600">
                            {formatCurrency(exp.amount)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
