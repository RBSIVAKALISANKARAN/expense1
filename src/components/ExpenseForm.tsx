import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { useExpenses } from '../hooks/useExpenses';
import type {
  ExpenseCategory,
  ExpenseInsert,
  MealType,
  FoodCategory,
  PGExpenseType,
  TransportType,
  DonationType,
  HealthType,
  PaymentMode,
} from '../types';
import { getTodayDate } from '../lib/utils';

interface ExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: ExpenseCategory;
  editingExpense?: ExpenseInsert & { id: string };
  onSuccess?: () => void;
}

export default function ExpenseForm({
  isOpen,
  onClose,
  defaultCategory = 'stationary',
  editingExpense,
  onSuccess,
}: ExpenseFormProps) {
  const { addExpense, updateExpense, error } = useExpenses();
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory>(
    editingExpense?.category || defaultCategory
  );

  const [formData, setFormData] = useState<{
    category: ExpenseCategory;
    amount: number;
    mode_of_payment: PaymentMode;
    date: string;
    notes: string;
    // Category-specific fields
    item?: string;
    meal_type?: MealType;
    food_category?: FoodCategory;
    expense_type?: PGExpenseType;
    transport_type?: TransportType;
    custom_transport?: string;
    from_to?: string;
    reason?: string;
    donation_type?: DonationType;
    health_type?: HealthType;
    name?: string;
    medicine?: string;
  }>({
    category: editingExpense?.category || defaultCategory,
    amount: editingExpense?.amount || 0,
    mode_of_payment: editingExpense?.mode_of_payment || 'upi',
    date: editingExpense?.date || getTodayDate(),
    notes: editingExpense?.notes || '',
    item: (editingExpense?.meta_data as any)?.item || '',
    meal_type: (editingExpense?.meta_data as any)?.meal_type || 'breakfast',
    food_category: (editingExpense?.meta_data as any)?.food_category || 'fruits',
    expense_type: (editingExpense?.meta_data as any)?.expense_type || 'rent',
    transport_type: (editingExpense?.meta_data as any)?.transport_type || 'bus',
    custom_transport: (editingExpense?.meta_data as any)?.custom_transport || '',
    from_to: (editingExpense?.meta_data as any)?.from_to || '',
    reason: (editingExpense?.meta_data as any)?.reason || '',
    donation_type: (editingExpense?.meta_data as any)?.donation_type || 'food',
    health_type: (editingExpense?.meta_data as any)?.health_type || 'hospital',
    name: (editingExpense?.meta_data as any)?.name || '',
    medicine: (editingExpense?.meta_data as any)?.medicine || '',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (defaultCategory && !editingExpense) {
      setSelectedCategory(defaultCategory);
      setFormData((prev) => ({ ...prev, category: defaultCategory }));
    }
  }, [defaultCategory, editingExpense]);

  if (!isOpen) return null;

  const categoryLabels: Record<ExpenseCategory, string> = {
    stationary: 'Stationery',
    food: 'Food',
    pg: 'PG',
    transport: 'Transport',
    household: 'Household',
    friends: 'Friends',
    family: 'Family',
    donated: 'Donated',
    health: 'Health',
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (formData.amount <= 0) errors.amount = 'Amount must be greater than 0';
    if (!formData.date) errors.date = 'Date is required';

    switch (selectedCategory) {
      case 'stationary':
        if (!formData.item?.trim()) errors.item = 'Item is required';
        break;
      case 'food':
        if (!formData.item?.trim()) errors.item = 'Item is required';
        break;
      case 'transport':
        if (formData.transport_type === 'others' && !formData.custom_transport?.trim()) {
          errors.custom_transport = 'Custom transport type is required';
        }
        if (!formData.from_to?.trim()) errors.from_to = 'From-To is required';
        break;
      case 'household':
        if (!formData.item?.trim()) errors.item = 'Item is required';
        break;
      case 'friends':
      case 'family':
        if (!formData.reason?.trim()) errors.reason = 'Reason is required';
        break;
      case 'health':
        if (!formData.name?.trim()) errors.name = 'Name is required';
        if (!formData.medicine?.trim()) errors.medicine = 'Medicine is required';
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const buildMetadata = () => {
    const metadata: any = {};

    switch (selectedCategory) {
      case 'stationary':
        metadata.item = formData.item;
        break;
      case 'food':
        metadata.meal_type = formData.meal_type;
        metadata.food_category = formData.food_category;
        metadata.item = formData.item;
        break;
      case 'pg':
        metadata.expense_type = formData.expense_type;
        break;
      case 'transport':
        metadata.transport_type = formData.transport_type;
        if (formData.transport_type === 'others') {
          metadata.custom_transport = formData.custom_transport;
        }
        metadata.from_to = formData.from_to;
        break;
      case 'household':
        metadata.item = formData.item;
        break;
      case 'friends':
      case 'family':
        metadata.reason = formData.reason;
        break;
      case 'donated':
        metadata.donation_type = formData.donation_type;
        break;
      case 'health':
        metadata.health_type = formData.health_type;
        metadata.name = formData.name;
        metadata.medicine = formData.medicine;
        break;
    }

    return metadata;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const metadata = buildMetadata();
      const expenseData: ExpenseInsert = {
        category: selectedCategory,
        amount: formData.amount,
        mode_of_payment: formData.mode_of_payment,
        meta_data: metadata,
        date: formData.date,
        notes: formData.notes,
      };

      let result;
      if (editingExpense) {
        result = await updateExpense(editingExpense.id, expenseData);
      } else {
        result = await addExpense(expenseData);
      }

      if (result) {
        onSuccess?.();
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const renderCategorySpecificFields = () => {
    switch (selectedCategory) {
      case 'stationary':
        return (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Item <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.item}
              onChange={(e) => handleInputChange('item', e.target.value)}
              placeholder="Enter item name"
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            {validationErrors.item && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.item}</p>
            )}
          </div>
        );

      case 'food':
        return (
          <>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Meal Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['breakfast', 'lunch', 'dinner', 'snacks'] as const).map((meal) => (
                  <button
                    key={meal}
                    type="button"
                    onClick={() => handleInputChange('meal_type', meal)}
                    className={`py-2 px-4 rounded-lg font-semibold transition-all ${
                      formData.meal_type === meal
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {meal.charAt(0).toUpperCase() + meal.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Food Category <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['fruits', 'vegies', 'millets', 'carbsitems', 'junk'] as const).map(
                  (cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleInputChange('food_category', cat)}
                      className={`py-2 px-3 rounded-lg font-semibold transition-all ${
                        formData.food_category === cat
                          ? 'bg-orange-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  )
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Item <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.item}
                onChange={(e) => handleInputChange('item', e.target.value)}
                placeholder="Enter food item"
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              />
              {validationErrors.item && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.item}</p>
              )}
            </div>
          </>
        );

      case 'pg':
        return (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Expense Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['rent', 'eb', 'water'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleInputChange('expense_type', type)}
                  className={`py-2 px-4 rounded-lg font-semibold transition-all ${
                    formData.expense_type === type
                      ? 'bg-green-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        );

      case 'transport':
        return (
          <>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Transport Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['bus', 'train', 'bike', 'auto', 'others'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleInputChange('transport_type', type)}
                    className={`py-2 px-4 rounded-lg font-semibold transition-all ${
                      formData.transport_type === type
                        ? 'bg-indigo-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {formData.transport_type === 'others' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Specify Transport Type <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.custom_transport}
                  onChange={(e) => handleInputChange('custom_transport', e.target.value)}
                  placeholder="Enter transport type"
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
                {validationErrors.custom_transport && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.custom_transport}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                From - To <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.from_to}
                onChange={(e) => handleInputChange('from_to', e.target.value)}
                placeholder="e.g., Home to Office"
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
              {validationErrors.from_to && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.from_to}</p>
              )}
            </div>
          </>
        );

      case 'household':
        return (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Item <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.item}
              onChange={(e) => handleInputChange('item', e.target.value)}
              placeholder="Enter item name"
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
            />
            {validationErrors.item && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.item}</p>
            )}
          </div>
        );

      case 'friends':
      case 'family':
        return (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Reason <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              placeholder="Enter reason"
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
            />
            {validationErrors.reason && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.reason}</p>
            )}
          </div>
        );

      case 'donated':
        return (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Donation Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['food', 'drink', 'money'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleInputChange('donation_type', type)}
                  className={`py-2 px-4 rounded-lg font-semibold transition-all ${
                    formData.donation_type === type
                      ? 'bg-teal-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        );

      case 'health':
        return (
          <>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Health Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['hospital', 'medical'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleInputChange('health_type', type)}
                    className={`py-2 px-4 rounded-lg font-semibold transition-all ${
                      formData.health_type === type
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Person/Patient name"
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
              />
              {validationErrors.name && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Medicine <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.medicine}
                onChange={(e) => handleInputChange('medicine', e.target.value)}
                placeholder="Medicine/Treatment details"
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
              />
              {validationErrors.medicine && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.medicine}</p>
              )}
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const categoryColors: Record<ExpenseCategory, string> = {
    stationary: 'blue',
    food: 'orange',
    pg: 'green',
    transport: 'indigo',
    household: 'pink',
    friends: 'purple',
    family: 'red',
    donated: 'teal',
    health: 'amber',
  };

  const color = categoryColors[selectedCategory];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <Plus className={`w-6 h-6 text-${color}-500`} />
            <h2 className="text-2xl font-bold text-gray-800">
              {editingExpense ? 'Edit Expense' : 'Add Expense'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(categoryLabels).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(key as ExpenseCategory);
                    handleInputChange('category', key);
                  }}
                  className={`py-2.5 px-3 rounded-lg font-semibold transition-all text-sm ${
                    selectedCategory === key
                      ? `bg-${categoryColors[key as ExpenseCategory]}-500 text-white shadow-md`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Category-Specific Fields */}
          {renderCategorySpecificFields()}

          {/* Amount */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Amount (Rs.) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
              placeholder="Enter amount"
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-${color}-500 focus:border-${color}-500 transition-all`}
              min="0"
              step="0.01"
            />
            {validationErrors.amount && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.amount}</p>
            )}
          </div>

          {/* Payment Mode */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Payment Mode <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              {(['cash', 'upi', 'card'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => handleInputChange('mode_of_payment', mode)}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition-all ${
                    formData.mode_of_payment === mode
                      ? `bg-${color}-500 text-white shadow-md`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {mode.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-${color}-500 focus:border-${color}-500 transition-all`}
            />
            {validationErrors.date && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.date}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Add any notes..."
              rows={3}
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-2.5 border rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 px-6 py-2.5 bg-${color}-500 text-white rounded-lg font-semibold hover:bg-${color}-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSubmitting
                ? 'Saving...'
                : editingExpense
                ? 'Update Expense'
                : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
