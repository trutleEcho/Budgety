import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Wallet, Transaction, Budget, Saving, Loan, Investment } from './models';

// Storage keys
const STORAGE_KEYS = {
  WALLETS: 'budgety_wallets',
  TRANSACTIONS: 'budgety_transactions',
  BUDGETS: 'budgety_budgets',
  SAVINGS: 'budgety_savings',
  LOANS: 'budgety_loans',
  INVESTMENTS: 'budgety_investments'
};

// Generic storage functions
export const storeData = async <T>(key: string, data: T): Promise<boolean> => {
  try {
    const jsonData = JSON.stringify(data);
    await AsyncStorage.setItem(key, jsonData);
    return true;
  } catch (error) {
    console.error(`Error storing data for key ${key}:`, error);
    return false;
  }
};

export const getData = async <T>(key: string, defaultValue: T): Promise<T> => {
  try {
    const jsonData = await AsyncStorage.getItem(key);
    return jsonData ? JSON.parse(jsonData) : defaultValue;
  } catch (error) {
    console.error(`Error getting data for key ${key}:`, error);
    return defaultValue;
  }
};

export const removeData = async (key: string): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing data for key ${key}:`, error);
    return false;
  }
};

export const clearAllData = async (): Promise<boolean> => {
  try {
    await AsyncStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing all data:', error);
    return false;
  }
};

// Wallet storage functions
export const getWallets = async (): Promise<Wallet[]> => {
  return await getData<Wallet[]>(STORAGE_KEYS.WALLETS, []);
};

export const saveWallets = async (wallets: Wallet[]): Promise<boolean> => {
  return await storeData<Wallet[]>(STORAGE_KEYS.WALLETS, wallets);
};

export const addWallet = async (wallet: Omit<Wallet, 'id' | 'createdAt'>): Promise<Wallet> => {
  const wallets = await getWallets();
  const newWallet: Wallet = {
    id: Date.now().toString(),
    ...wallet,
    createdAt: Date.now()
  };
  wallets.push(newWallet);
  await saveWallets(wallets);
  return newWallet;
};

export const updateWallet = async (walletId: string, updates: Partial<Wallet>): Promise<Wallet | null> => {
  const wallets = await getWallets();
  const index = wallets.findIndex(w => w.id === walletId);
  if (index !== -1) {
    const existingWallet = wallets[index];
    if (existingWallet) {
      wallets[index] = { ...existingWallet, ...updates };
      await saveWallets(wallets);
      return wallets[index];
    }
  }
  return null;
};

export const deleteWallet = async (walletId: string): Promise<boolean> => {
  const wallets = await getWallets();
  const filteredWallets = wallets.filter(w => w.id !== walletId);
  await saveWallets(filteredWallets);
  return true;
};

// Transaction storage functions
export const getTransactions = async (): Promise<Transaction[]> => {
  return await getData<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
};

export const saveTransactions = async (transactions: Transaction[]): Promise<boolean> => {
  return await storeData<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, transactions);
};

export const addTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> => {
  const transactions = await getTransactions();
  const newTransaction: Transaction = {
    id: Date.now().toString(),
    ...transaction,
    createdAt: Date.now()
  };
  transactions.push(newTransaction);
  await saveTransactions(transactions);
  
  // Update wallet balance
  const wallets = await getWallets();
  const walletIndex = wallets.findIndex(w => w.id === transaction.walletId);
  if (walletIndex !== -1 && wallets[walletIndex]) {
    const balanceChange = transaction.type === 'income' ? transaction.amount : -transaction.amount;
    wallets[walletIndex]!.balance += balanceChange;
    await saveWallets(wallets);
  }
  
  return newTransaction;
};

export const updateTransaction = async (transactionId: string, updates: Partial<Transaction>): Promise<Transaction | null> => {
  const transactions = await getTransactions();
  const index = transactions.findIndex(t => t.id === transactionId);
  
  if (index === -1) {
    return null;
  }
  
  const oldTransaction = transactions[index];
  if (!oldTransaction) {
    return null;
  }
  
  const updatedTransaction = { ...oldTransaction, ...updates };
  transactions[index] = updatedTransaction;
  await saveTransactions(transactions);
  
  // Update wallet balance if amount or type changed
  if (updates.amount !== undefined || updates.type !== undefined) {
    const wallets = await getWallets();
    const walletIndex = wallets.findIndex(w => w.id === oldTransaction.walletId);
    
    if (walletIndex !== -1 && wallets[walletIndex]) {
      // Reverse old transaction
      const oldBalanceChange = oldTransaction.type === 'income' 
        ? -oldTransaction.amount 
        : oldTransaction.amount;
      
      // Apply new transaction
      const newBalanceChange = updatedTransaction.type === 'income' 
        ? updatedTransaction.amount 
        : -updatedTransaction.amount;
      
      wallets[walletIndex].balance += (oldBalanceChange + newBalanceChange);
      await saveWallets(wallets);
    }
  }
  
  return updatedTransaction;
};

export const deleteTransaction = async (transactionId: string): Promise<boolean> => {
  const transactions = await getTransactions();
  const transactionIndex = transactions.findIndex(t => t.id === transactionId);
  
  if (transactionIndex === -1) {
    return false;
  }
  
  const transaction = transactions[transactionIndex];
  if (!transaction) {
    return false;
  }
  
  // Reverse the transaction from wallet balance
  const wallets = await getWallets();
  const walletIndex = wallets.findIndex(w => w.id === transaction.walletId);
  
  if (walletIndex !== -1 && wallets[walletIndex]) {
    const balanceChange = transaction.type === 'income' 
      ? -transaction.amount 
      : transaction.amount;
    
    wallets[walletIndex].balance += balanceChange;
    await saveWallets(wallets);
  }
  
  // Remove the transaction
  const filteredTransactions = transactions.filter(t => t.id !== transactionId);
  await saveTransactions(filteredTransactions);
  
  return true;
};

// Budget storage functions
export const getBudgets = async (): Promise<Budget[]> => {
  return await getData<Budget[]>(STORAGE_KEYS.BUDGETS, []);
};

export const saveBudgets = async (budgets: Budget[]): Promise<boolean> => {
  return await storeData<Budget[]>(STORAGE_KEYS.BUDGETS, budgets);
};

export const addBudget = async (budget: Omit<Budget, 'id' | 'createdAt'>): Promise<Budget> => {
  const budgets = await getBudgets();
  const newBudget: Budget = {
    id: Date.now().toString(),
    ...budget,
    createdAt: Date.now()
  };
  budgets.push(newBudget);
  await saveBudgets(budgets);
  return newBudget;
};

export const updateBudget = async (budgetId: string, updates: Partial<Budget>): Promise<Budget | null> => {
  const budgets = await getBudgets();
  const index = budgets.findIndex(b => b.id === budgetId);
  if (index !== -1) {
    const existingBudget = budgets[index];
    if (existingBudget) {
      budgets[index] = { ...existingBudget, ...updates };
      await saveBudgets(budgets);
      return budgets[index];
    }
  }
  return null;
};

export const deleteBudget = async (budgetId: string): Promise<boolean> => {
  const budgets = await getBudgets();
  const filteredBudgets = budgets.filter(b => b.id !== budgetId);
  await saveBudgets(filteredBudgets);
  return true;
};

// Savings storage functions
export const getSavings = async (): Promise<Saving[]> => {
  return await getData<Saving[]>(STORAGE_KEYS.SAVINGS, []);
};

export const saveSavings = async (savings: Saving[]): Promise<boolean> => {
  return await storeData<Saving[]>(STORAGE_KEYS.SAVINGS, savings);
};

export const addSaving = async (saving: Omit<Saving, 'id' | 'createdAt'>): Promise<Saving> => {
  const savings = await getSavings();
  const newSaving: Saving = {
    id: Date.now().toString(),
    ...saving,
    createdAt: Date.now()
  };
  savings.push(newSaving);
  await saveSavings(savings);
  return newSaving;
};

export const updateSaving = async (savingId: string, updates: Partial<Saving>): Promise<Saving | null> => {
  const savings = await getSavings();
  const index = savings.findIndex(s => s.id === savingId);
  if (index !== -1) {
    const existingSaving = savings[index];
    if (existingSaving) {
      savings[index] = { ...existingSaving, ...updates };
      await saveSavings(savings);
      return savings[index];
    }
  }
  return null;
};

export const deleteSaving = async (savingId: string): Promise<boolean> => {
  const savings = await getSavings();
  const filteredSavings = savings.filter(s => s.id !== savingId);
  await saveSavings(filteredSavings);
  return true;
};

// Loans storage functions
export const getLoans = async (): Promise<Loan[]> => {
  return await getData<Loan[]>(STORAGE_KEYS.LOANS, []);
};

export const saveLoans = async (loans: Loan[]): Promise<boolean> => {
  return await storeData<Loan[]>(STORAGE_KEYS.LOANS, loans);
};

export const addLoan = async (loan: Omit<Loan, 'id' | 'createdAt'>): Promise<Loan> => {
  const loans = await getLoans();
  const newLoan: Loan = {
    id: Date.now().toString(),
    ...loan,
    createdAt: Date.now()
  };
  loans.push(newLoan);
  await saveLoans(loans);
  return newLoan;
};

export const updateLoan = async (loanId: string, updates: Partial<Loan>): Promise<Loan | null> => {
  const loans = await getLoans();
  const index = loans.findIndex(l => l.id === loanId);
  if (index !== -1) {
    const existingLoan = loans[index];
    if (existingLoan) {
      loans[index] = { ...existingLoan, ...updates };
      await saveLoans(loans);
      return loans[index];
    }
  }
  return null;
};

export const deleteLoan = async (loanId: string): Promise<boolean> => {
  const loans = await getLoans();
  const filteredLoans = loans.filter(l => l.id !== loanId);
  await saveLoans(filteredLoans);
  return true;
};

// Investment storage functions
export const getInvestments = async (): Promise<Investment[]> => {
  return await getData<Investment[]>(STORAGE_KEYS.INVESTMENTS, []);
};

export const saveInvestments = async (investments: Investment[]): Promise<boolean> => {
  return await storeData<Investment[]>(STORAGE_KEYS.INVESTMENTS, investments);
};

export const addInvestment = async (investment: Omit<Investment, 'id' | 'createdAt'>): Promise<Investment> => {
  const investments = await getInvestments();
  const newInvestment: Investment = {
    id: Date.now().toString(),
    ...investment,
    createdAt: Date.now()
  };
  
  // TODO: For FD/RD types, calculate currentValue based on interest rate and time if maturity date has passed
  // This could include compound interest calculations for different investment types
  
  investments.push(newInvestment);
  await saveInvestments(investments);
  return newInvestment;
};

export const updateInvestment = async (investmentId: string, updates: Partial<Investment>): Promise<Investment | null> => {
  const investments = await getInvestments();
  const index = investments.findIndex(i => i.id === investmentId);
  if (index !== -1) {
    const existingInvestment = investments[index];
    if (existingInvestment) {
      const updatedInvestment = { ...existingInvestment, ...updates };
      
      // TODO: For FD/RD types, optionally recalculate currentValue based on updated interest rate or dates
      
      investments[index] = updatedInvestment;
      await saveInvestments(investments);
      return investments[index];
    }
  }
  return null;
};

export const deleteInvestment = async (investmentId: string): Promise<boolean> => {
  const investments = await getInvestments();
  const filteredInvestments = investments.filter(i => i.id !== investmentId);
  await saveInvestments(filteredInvestments);
  return true;
};

