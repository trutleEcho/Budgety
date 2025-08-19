import { useState, useEffect, useCallback } from 'react';
import {
  getWallets, addWallet, updateWallet, deleteWallet,
  getTransactions, addTransaction, updateTransaction, deleteTransaction,
  getBudgets, addBudget, updateBudget, deleteBudget,
  getSavings, addSaving, updateSaving, deleteSaving,
  getLoans, addLoan, updateLoan, deleteLoan,
  getInvestments, addInvestment, updateInvestment, deleteInvestment
} from '../lib/storage';
import type{ Wallet, Transaction, Budget, Saving, Loan, Investment } from '../lib/models';

interface FinanceDataHook {
  wallets: Wallet[];
  transactions: Transaction[];
  budgets: Budget[];
  savings: Saving[];
  loans: Loan[];
  investments: Investment[];
  loading: boolean;
  createWallet: (walletData: Omit<Wallet, 'id' | 'createdAt'>) => Promise<Wallet>;
  editWallet: (walletId: string, updates: Partial<Wallet>) => Promise<Wallet | null>;
  removeWallet: (walletId: string) => Promise<boolean>;
  createTransaction: (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => Promise<Transaction>;
  editTransaction: (transactionId: string, updates: Partial<Transaction>) => Promise<Transaction | null>;
  removeTransaction: (transactionId: string) => Promise<boolean>;
  createBudget: (budgetData: Omit<Budget, 'id' | 'createdAt'>) => Promise<Budget>;
  editBudget: (budgetId: string, updates: Partial<Budget>) => Promise<Budget | null>;
  removeBudget: (budgetId: string) => Promise<boolean>;
  createSaving: (savingData: Omit<Saving, 'id' | 'createdAt'>) => Promise<Saving>;
  editSaving: (savingId: string, updates: Partial<Saving>) => Promise<Saving | null>;
  removeSaving: (savingId: string) => Promise<boolean>;
  createLoan: (loanData: Omit<Loan, 'id' | 'createdAt'>) => Promise<Loan>;
  editLoan: (loanId: string, updates: Partial<Loan>) => Promise<Loan | null>;
  removeLoan: (loanId: string) => Promise<boolean>;
  createInvestment: (investmentData: Omit<Investment, 'id' | 'createdAt'>) => Promise<Investment>;
  editInvestment: (investmentId: string, updates: Partial<Investment>) => Promise<Investment | null>;
  removeInvestment: (investmentId: string) => Promise<boolean>;
  refreshData: () => Promise<void>;
}

export const useFinanceData = (): FinanceDataHook => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savings, setSavings] = useState<Saving[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load all data on mount
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [walletsData, transactionsData, budgetsData, savingsData, loansData, investmentsData] = await Promise.all([
        getWallets(),
        getTransactions(),
        getBudgets(),
        getSavings(),
        getLoans(),
        getInvestments()
      ]);
      
      setWallets(walletsData);
      setTransactions(transactionsData);
      setBudgets(budgetsData);
      setSavings(savingsData);
      setLoans(loansData);
      setInvestments(investmentsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Wallet operations
  const createWallet = useCallback(async (walletData: Omit<Wallet, 'id' | 'createdAt'>) => {
    try {
      const newWallet = await addWallet(walletData);
      setWallets(prev => [...prev, newWallet]);
      return newWallet;
    } catch (error) {
      console.error("Error creating wallet:", error);
      throw error;
    }
  }, []);

  const editWallet = useCallback(async (walletId: string, updates: Partial<Wallet>) => {
    try {
      const updatedWallet = await updateWallet(walletId, updates);
      if (updatedWallet) {
        setWallets(prev => prev.map(w => w.id === walletId ? updatedWallet : w));
      }
      return updatedWallet;
    } catch (error) {
      console.error("Error updating wallet:", error);
      throw error;
    }
  }, []);

  const removeWallet = useCallback(async (walletId: string) => {
    try {
      await deleteWallet(walletId);
      setWallets(prev => prev.filter(w => w.id !== walletId));
      // Also remove transactions associated with this wallet
      const updatedTransactions = transactions.filter(t => t.walletId !== walletId);
      setTransactions(updatedTransactions);
      return true;
    } catch (error) {
      console.error("Error deleting wallet:", error);
      throw error;
    }
  }, [transactions]);

  // Transaction operations
  const createTransaction = useCallback(async (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => {
    try {
      const newTransaction = await addTransaction(transactionData);
      setTransactions(prev => [...prev, newTransaction]);
      // Reload wallets to get updated balances
      const updatedWallets = await getWallets();
      setWallets(updatedWallets);
      return newTransaction;
    } catch (error) {
      console.error("Error creating transaction:", error);
      throw error;
    }
  }, []);

  const editTransaction = useCallback(async (transactionId: string, updates: Partial<Transaction>) => {
    try {
      const updatedTransaction = await updateTransaction(transactionId, updates);
      if (updatedTransaction) {
        setTransactions(prev => prev.map(t => t.id === transactionId ? updatedTransaction : t));
        // Reload wallets to get updated balances
        const updatedWallets = await getWallets();
        setWallets(updatedWallets);
      }
      return updatedTransaction;
    } catch (error) {
      console.error("Error updating transaction:", error);
      throw error;
    }
  }, []);

  const removeTransaction = useCallback(async (transactionId: string) => {
    try {
      await deleteTransaction(transactionId);
      setTransactions(prev => prev.filter(t => t.id !== transactionId));
      // Reload wallets to get updated balances
      const updatedWallets = await getWallets();
      setWallets(updatedWallets);
      return true;
    } catch (error) {
      console.error("Error deleting transaction:", error);
      throw error;
    }
  }, []);

  // Budget operations
  const createBudget = useCallback(async (budgetData: Omit<Budget, 'id' | 'createdAt'>) => {
    try {
      const newBudget = await addBudget(budgetData);
      setBudgets(prev => [...prev, newBudget]);
      return newBudget;
    } catch (error) {
      console.error("Error creating budget:", error);
      throw error;
    }
  }, []);

  const editBudget = useCallback(async (budgetId: string, updates: Partial<Budget>) => {
    try {
      const updatedBudget = await updateBudget(budgetId, updates);
      if (updatedBudget) {
        setBudgets(prev => prev.map(b => b.id === budgetId ? updatedBudget : b));
      }
      return updatedBudget;
    } catch (error) {
      console.error("Error updating budget:", error);
      throw error;
    }
  }, []);

  const removeBudget = useCallback(async (budgetId: string) => {
    try {
      await deleteBudget(budgetId);
      setBudgets(prev => prev.filter(b => b.id !== budgetId));
      return true;
    } catch (error) {
      console.error("Error deleting budget:", error);
      throw error;
    }
  }, []);

  // Savings operations
  const createSaving = useCallback(async (savingData: Omit<Saving, 'id' | 'createdAt'>) => {
    try {
      const newSaving = await addSaving(savingData);
      setSavings(prev => [...prev, newSaving]);
      return newSaving;
    } catch (error) {
      console.error("Error creating saving:", error);
      throw error;
    }
  }, []);

  const editSaving = useCallback(async (savingId: string, updates: Partial<Saving>) => {
    try {
      const updatedSaving = await updateSaving(savingId, updates);
      if (updatedSaving) {
        setSavings(prev => prev.map(s => s.id === savingId ? updatedSaving : s));
      }
      return updatedSaving;
    } catch (error) {
      console.error("Error updating saving:", error);
      throw error;
    }
  }, []);

  const removeSaving = useCallback(async (savingId: string) => {
    try {
      await deleteSaving(savingId);
      setSavings(prev => prev.filter(s => s.id !== savingId));
      return true;
    } catch (error) {
      console.error("Error deleting saving:", error);
      throw error;
    }
  }, []);

  // Loan operations
  const createLoan = useCallback(async (loanData: Omit<Loan, 'id' | 'createdAt'>) => {
    try {
      const newLoan = await addLoan(loanData);
      setLoans(prev => [...prev, newLoan]);
      return newLoan;
    } catch (error) {
      console.error("Error creating loan:", error);
      throw error;
    }
  }, []);

  const editLoan = useCallback(async (loanId: string, updates: Partial<Loan>) => {
    try {
      const updatedLoan = await updateLoan(loanId, updates);
      if (updatedLoan) {
        setLoans(prev => prev.map(l => l.id === loanId ? updatedLoan : l));
      }
      return updatedLoan;
    } catch (error) {
      console.error("Error updating loan:", error);
      throw error;
    }
  }, []);

  const removeLoan = useCallback(async (loanId: string) => {
    try {
      await deleteLoan(loanId);
      setLoans(prev => prev.filter(l => l.id !== loanId));
      return true;
    } catch (error) {
      console.error("Error deleting loan:", error);
      throw error;
    }
  }, []);

  // Investment operations
  const createInvestment = useCallback(async (investmentData: Omit<Investment, 'id' | 'createdAt'>) => {
    try {
      const newInvestment = await addInvestment(investmentData);
      setInvestments(prev => [...prev, newInvestment]);
      return newInvestment;
    } catch (error) {
      console.error("Error creating investment:", error);
      throw error;
    }
  }, []);

  const editInvestment = useCallback(async (investmentId: string, updates: Partial<Investment>) => {
    try {
      const updatedInvestment = await updateInvestment(investmentId, updates);
      if (updatedInvestment) {
        setInvestments(prev => prev.map(i => i.id === investmentId ? updatedInvestment : i));
      }
      return updatedInvestment;
    } catch (error) {
      console.error("Error updating investment:", error);
      throw error;
    }
  }, []);

  const removeInvestment = useCallback(async (investmentId: string) => {
    try {
      await deleteInvestment(investmentId);
      setInvestments(prev => prev.filter(i => i.id !== investmentId));
      return true;
    } catch (error) {
      console.error("Error deleting investment:", error);
      throw error;
    }
  }, []);

  return {
    // Data
    wallets,
    transactions,
    budgets,
    savings,
    loans,
    investments,
    loading,
    
    // Operations
    createWallet,
    editWallet,
    removeWallet,
    
    createTransaction,
    editTransaction,
    removeTransaction,

    createBudget,
    editBudget,
    removeBudget,
    
    createSaving,
    editSaving,
    removeSaving,
    
    createLoan,
    editLoan,
    removeLoan,
    
    createInvestment,
    editInvestment,
    removeInvestment,
    
    // Utility
    refreshData: loadData
  };
};

