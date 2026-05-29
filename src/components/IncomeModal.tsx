import { useState } from 'react';
import { X, DollarSign } from 'lucide-react';
import { useIncome } from '../hooks/useIncome';
import type { IncomeInsert } from '../types';
import { getTodayDate } from '../lib/utils';

interface IncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingIncome?: IncomeInsert & { id: string };
  onSuccess?: () => void;
}

export default function IncomeModal({ isOpen, onClose, editingIncome, onSuccess }: IncomeModalProps) {
  const { addIncome, updateIncome, error } = useIncome();
  const [formData, setFormData] = useState<IncomeInsert>({
    source: editingIncome?.source || '',
    amount: editingIncome?.amount || 0,
    payment_mode: editingIncome?.payment_mode || 'upi',
    account_id: editingIncome?.account_id || '',
    date: editingIncome?.date || getTodayDate(),
    notes: editingIncome?.notes || '',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.source.trim()) errors.source = 'Source is required';
    if (formData.amount <= 0) errors.amount = 'Amount must be greater than 0';
    if (!formData.date) errors.date = 'Date is required';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      let result;
      if (editingIncome) {
        result = await updateIncome(editingIncome.id, formData);
      } else {
        result = await addIncome(formData);
      }

      if (result) {
        onSuccess?.();
        onClose();
        setFormData({
          source: '',
          amount: 0,
          payment_mode: 'upi',
          account_id: '',
          date: getTodayDate(),
          notes: '',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof IncomeInsert, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-500" />
            <h2 className="text-2xl font-bold text-gray-800">
              {editingIncome ? 'Edit Income' : 'Add Income'}
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
          {/* Source */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Source <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.source}
              onChange={(e) => handleInputChange('source', e.target.value)}
              placeholder="e.g., Salary, Freelance, Gift"
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              list="income-sources"
            />
            <datalist id="income-sources">
              <option value="Salary" />
              <option value="Freelance" />
              <option value="Gift" />
              <option value="Investment" />
              <option value="Bonus" />
              <option value="Others" />
            </datalist>
            {validationErrors.source && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.source}</p>
            )}
          </div>

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
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
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
                  onClick={() => handleInputChange('payment_mode', mode)}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition-all ${
                    formData.payment_mode === mode
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {mode.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Account ID */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Account ID (Optional)
            </label>
            <input
              type="text"
              value={formData.account_id}
              onChange={(e) => handleInputChange('account_id', e.target.value)}
              placeholder="e.g., ACC12345"
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
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
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
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
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
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
              className="flex-1 px-6 py-2.5 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : editingIncome ? 'Update' : 'Add Income'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
