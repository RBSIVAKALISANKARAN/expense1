/*
  # Create Expenses and Income Tables

  1. Overview
    This migration creates the core database schema for the expense tracker application.
    It includes two main tables: 'expenses' for tracking all expense categories and 'income' for tracking income sources.
    The expenses table uses a JSONB metadata column to store category-specific fields efficiently.

  2. New Tables
    - `expenses`
      - id (uuid, primary key, auto-generated)
      - category (text, NOT NULL) - One of: stationary, food, pg, transport, household, friends, family, donated, health
      - amount (decimal, NOT NULL) - Expense amount in INR
      - mode_of_payment (text, NOT NULL) - One of: cash, upi, card
      - meta_data (jsonb) - Stores category-specific fields like meal_type, food_category, item, reason, etc.
      - date (date, NOT NULL) - Date of the expense
      - notes (text) - Optional notes for the expense
      - is_deleted (boolean, DEFAULT false) - Soft delete flag
      - created_at (timestamptz, DEFAULT now())
      - updated_at (timestamptz, DEFAULT now())

    - `income`
      - id (uuid, primary key, auto-generated)
      - source (text, NOT NULL) - Income source (salary, freelance, gift, investment, others)
      - amount (decimal, NOT NULL) - Income amount in INR
      - payment_mode (text, NOT NULL) - One of: cash, upi, card
      - account_id (text) - Optional account identifier
      - date (date, NOT NULL) - Date of income received
      - notes (text) - Optional notes
      - is_deleted (boolean, DEFAULT false) - Soft delete flag
      - created_at (timestamptz, DEFAULT now())
      - updated_at (timestamptz, DEFAULT now())

  3. Indexes
    - expenses: idx on (category, date, is_deleted) for efficient filtering
    - expenses: GIN idx on meta_data for JSONB queries
    - income: idx on (date, is_deleted) for efficient filtering

  4. Security (RLS)
    - Enable RLS on both tables
    - Policies allow authenticated users to read/write their own data (placeholder policies)
    - IMPORTANT: Update policies when user authentication is implemented

  5. Important Notes
    - The meta_data JSONB column allows flexible storage of different fields for each expense category
    - Soft delete is implemented via is_deleted flag to preserve data integrity
    - Updated_at trigger is included to automatically maintain the timestamp
*/

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('stationary', 'food', 'pg', 'transport', 'household', 'friends', 'family', 'donated', 'health')),
  amount decimal NOT NULL CHECK (amount >= 0),
  mode_of_payment text NOT NULL CHECK (mode_of_payment IN ('cash', 'upi', 'card')),
  meta_data jsonb DEFAULT '{}'::jsonb,
  date date NOT NULL,
  notes text,
  is_deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create income table
CREATE TABLE IF NOT EXISTS income (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  amount decimal NOT NULL CHECK (amount >= 0),
  payment_mode text NOT NULL CHECK (payment_mode IN ('cash', 'upi', 'card')),
  account_id text,
  date date NOT NULL,
  notes text,
  is_deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for expenses table
CREATE INDEX IF NOT EXISTS idx_expenses_category_date ON expenses(category, date) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_expenses_is_deleted ON expenses(is_deleted);
CREATE INDEX IF NOT EXISTS idx_expenses_meta_data ON expenses USING GIN(meta_data);

-- Create indexes for income table
CREATE INDEX IF NOT EXISTS idx_income_date ON income(date) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_income_is_deleted ON income(is_deleted);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to expenses
CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply updated_at trigger to income
CREATE TRIGGER update_income_updated_at
  BEFORE UPDATE ON income
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE income ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for expenses (authenticated users can manage all expenses for now)
-- When authentication is added, these should be updated to restrict by user_id
CREATE POLICY "Allow all access to expenses" ON expenses
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create RLS policies for income
CREATE POLICY "Allow all access to income" ON income
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Enable real-time for both tables
ALTER publication supabase_realtime ADD TABLE expenses;
ALTER publication supabase_realtime ADD TABLE income;