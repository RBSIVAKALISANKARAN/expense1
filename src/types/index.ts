// Expense Categories
export type ExpenseCategory =
  | 'stationary'
  | 'food'
  | 'pg'
  | 'transport'
  | 'household'
  | 'friends'
  | 'family'
  | 'donated'
  | 'health';

// Payment Modes
export type PaymentMode = 'cash' | 'upi' | 'card';

// Meal Types for Food Category
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

// Food Categories
export type FoodCategory = 'fruits' | 'vegies' | 'millets' | 'carbsitems' | 'junk';

// PG Expense Types
export type PGExpenseType = 'rent' | 'eb' | 'water';

// Transport Types
export type TransportType = 'bus' | 'train' | 'bike' | 'auto' | 'others';

// Donation Types
export type DonationType = 'food' | 'drink' | 'money';

// Health Types
export type HealthType = 'hospital' | 'medical';

// Metadata structures for each category
export interface StationaryMetadata {
  item: string;
}

export interface FoodMetadata {
  meal_type: MealType;
  food_category: FoodCategory;
  item: string;
}

export interface PGMetadata {
  expense_type: PGExpenseType;
}

export interface TransportMetadata {
  transport_type: TransportType;
  custom_transport?: string; // When transport_type is 'others'
  from_to: string;
}

export interface HouseholdMetadata {
  item: string;
}

export interface FriendsMetadata {
  reason: string;
}

export interface FamilyMetadata {
  reason: string;
}

export interface DonatedMetadata {
  donation_type: DonationType;
}

export interface HealthMetadata {
  health_type: HealthType;
  name: string;
  medicine: string;
}

// Union type for all metadata
export type ExpenseMetadata =
  | StationaryMetadata
  | FoodMetadata
  | PGMetadata
  | TransportMetadata
  | HouseholdMetadata
  | FriendsMetadata
  | FamilyMetadata
  | DonatedMetadata
  | HealthMetadata;

// Base Expense type
export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  mode_of_payment: PaymentMode;
  meta_data: ExpenseMetadata;
  date: string;
  notes?: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

// Expense insert type (without id, created_at, updated_at)
export interface ExpenseInsert {
  category: ExpenseCategory;
  amount: number;
  mode_of_payment: PaymentMode;
  meta_data: ExpenseMetadata;
  date: string;
  notes?: string;
}

// Income Types
export interface Income {
  id: string;
  source: string;
  amount: number;
  payment_mode: PaymentMode;
  account_id?: string;
  date: string;
  notes?: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

// Income insert type
export interface IncomeInsert {
  source: string;
  amount: number;
  payment_mode: PaymentMode;
  account_id?: string;
  date: string;
  notes?: string;
}

// Dashboard stats
export interface DashboardStats {
  todayIncome: number;
  todayExpenses: number;
  todayBalance: number;
  monthIncome: number;
  monthExpenses: number;
  monthBalance: number;
}

// Transaction type for combined view
export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category?: ExpenseCategory;
  source?: string;
  amount: number;
  date: string;
  payment_mode: PaymentMode;
  meta_data?: ExpenseMetadata;
  notes?: string;
  created_at: string;
}
