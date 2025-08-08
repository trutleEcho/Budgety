export interface Wallet {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'cash' | 'investment';
  balance: number;
  currency: string;
  description: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  walletId: string;
  date: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  name: string;
  category: string;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate: string | null;
  createdAt: string;
}

export interface Saving {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string | null;
  description: string;
  category: string;
  createdAt: string;
}

export interface Loan {
  id: string;
  type: 'lent' | 'borrowed';
  amount: number;
  personName: string;
  description: string;
  dueDate: string | null;
  interestRate: number;
  status: 'active' | 'paid' | 'overdue';
  paidAmount?: number; // Optional, as it might not be present initially
  createdAt: string;
}

// Data models for Personal Finance App

// Wallet model
export const createWallet = ({
  name = 'New Wallet',
  type = 'checking', // checking, savings, cash, investment
  balance = 0,
  currency = 'USD',
  description = ''
}: Partial<Wallet>): Wallet => ({
  id: Date.now().toString(), // Will be overwritten by storage.ts addWallet
  name,
  type,
  balance: parseFloat(balance as any),
  currency,
  description,
  createdAt: new Date().toISOString(), // Will be overwritten by storage.ts addWallet
});

// Transaction model
export const createTransaction = ({
  amount,
  type = 'expense',
  category = 'general',
  description = '',
  walletId = '',
  date = new Date().toISOString().split('T')[0] ?? ''
}: Partial<Transaction>): Transaction => ({
  id: Date.now().toString(), // Will be overwritten by storage.ts addTransaction
  amount: parseFloat(amount as any),
  type,
  category,
  description,
  walletId,
  date,
  createdAt: new Date().toISOString(), // Will be overwritten by storage.ts addTransaction
});

// Budget model
export const createBudget = ({
  name = 'New Budget',
  category = 'general',
  amount,
  period = 'monthly', // weekly, monthly, yearly
  startDate = new Date().toISOString().split('T')[0] ?? '',
  endDate = null
}: Partial<Budget>): Budget => ({
  id: Date.now().toString(), // Will be overwritten by storage.ts addBudget
  name,
  category,
  amount: parseFloat(amount as any),
  period,
  startDate,
  endDate,
  createdAt: new Date().toISOString(), // Will be overwritten by storage.ts addBudget
});

// Saving goal model
export const createSaving = ({
  name = 'New Saving Goal',
  targetAmount,
  currentAmount = 0,
  targetDate = null,
  description = '',
  category = 'general'
}: Partial<Saving>): Saving => ({
  id: Date.now().toString(), // Will be overwritten by storage.ts addSaving
  name,
  targetAmount: parseFloat(targetAmount as any),
  currentAmount: parseFloat(currentAmount as any),
  targetDate,
  description,
  category,
  createdAt: new Date().toISOString(), // Will be overwritten by storage.ts addSaving
});

// Loan model
export const createLoan = ({
  type = 'lent',
  amount,
  personName = '',
  description = '',
  dueDate = null,
  interestRate = 0,
  status = 'active' // active, paid, overdue
}: Partial<Loan>): Loan => ({
  id: Date.now().toString(), // Will be overwritten by storage.ts addLoan
  type,
  amount: parseFloat(amount as any),
  personName,
  description,
  dueDate,
  interestRate: parseFloat(interestRate as any),
  status,
  createdAt: new Date().toISOString(), // Will be overwritten by storage.ts addLoan
});

// Transaction categories
export const TRANSACTION_CATEGORIES = {
  INCOME: [
    'Salary',
    'Freelance',
    'Business',
    'Investment',
    'Gift',
    'Other Income'
  ] as const,
  EXPENSE: [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Education',
    'Travel',
    'Other Expense'
  ] as const
};

// Wallet types
export const WALLET_TYPES = [
  { value: 'checking', label: 'Checking Account', icon: 'credit-card' },
  { value: 'savings', label: 'Savings Account', icon: 'piggy-bank' },
  { value: 'cash', label: 'Cash', icon: 'banknote' },
  { value: 'investment', label: 'Investment', icon: 'trending-up' }
] as const;

// Budget periods
export const BUDGET_PERIODS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' }
] as const;

// Loan statuses
export const LOAN_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' }
] as const;

// Utility functions
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const calculateBudgetProgress = (budget: Budget, transactions: Transaction[]) => {
  const budgetTransactions = transactions.filter(t => 
    t.category === budget.category && 
    t.type === 'expense' &&
    new Date(t.date) >= new Date(budget.startDate) &&
    (budget.endDate ? new Date(t.date) <= new Date(budget.endDate) : true)
  );
  
  const spent = budgetTransactions.reduce((sum, t) => sum + t.amount, 0);
  const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
  
  return {
    spent,
    remaining: budget.amount - spent,
    percentage: Math.min(percentage, 100)
  };
};

export const calculateSavingProgress = (saving: Saving) => {
  const percentage = saving.targetAmount > 0 ? (saving.currentAmount / saving.targetAmount) * 100 : 0;
  return {
    percentage: Math.min(percentage, 100),
    remaining: saving.targetAmount - saving.currentAmount
  };
};

export const getTotalBalance = (wallets: Wallet[]): number => {
  return wallets.reduce((total, wallet) => total + wallet.balance, 0);
};

export const getRecentTransactions = (transactions: Transaction[], limit: number = 5): Transaction[] => {
  return transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
};

export const getTransactionsByDateRange = (transactions: Transaction[], startDate: string, endDate: string): Transaction[] => {
  return transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= new Date(startDate) && transactionDate <= new Date(endDate);
  });
};

export const getIncomeVsExpenses = (transactions: Transaction[], period: 'week' | 'month' | 'year' = 'month') => {
  const now = new Date();
  let startDate: Date;
  
  switch (period) {
    case 'week':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }
  
  const periodTransactions = getTransactionsByDateRange(transactions, startDate.toISOString().split('T')[0] ?? '', now.toISOString().split('T')[0] ?? '');
  
  const income = periodTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const expenses = periodTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  return { income, expenses, net: income - expenses };
};

