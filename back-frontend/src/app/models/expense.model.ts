export interface Expense {
  id?: number;
  amount: number;
  category: string;
  description: string;
  date?: string;
}

export interface ExpenseStats {
  totalAmount: number;
  totalEntries: number;
  averageAmount: number;
  monthlyBreakdown: MonthlyBreakdown[];
}

export interface MonthlyBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

export interface ExpenseCategory {
  value: string;
  label: string;
  icon: string;
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { value: 'food', label: 'Food & Drink', icon: '🍽️' },
  { value: 'clothing', label: 'Clothing', icon: '👕' },
  { value: 'transport', label: 'Transport', icon: '🚗' },
  { value: 'electronics', label: 'Electronics', icon: '📱' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎬' },
  { value: 'hospital', label: 'Healthcare', icon: '🏥' },
  { value: 'other', label: 'Other', icon: '📋' }
];
