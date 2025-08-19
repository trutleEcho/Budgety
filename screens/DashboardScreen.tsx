import React, {type JSX, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFinanceData } from '../hooks/useFinanceData';
import {
  formatCurrency,
  getTotalBalance,
  getIncomeVsExpenses,
  getRecentTransactions,
  calculateBudgetProgress,
  calculateSavingProgress,
  type Transaction, type Budget, type Saving
} from '../lib/models';
import {useFocusEffect} from "@react-navigation/native";

interface DashboardScreenProps {
  navigation: any;
}

const { width } = Dimensions.get('window');

export default function DashboardScreen({ navigation }: DashboardScreenProps): JSX.Element {
  const { wallets, transactions, budgets, savings, loading, refreshData } = useFinanceData();

  useFocusEffect(
      useCallback(() => {
        refreshData(); // fetch again whenever screen is focused
      }, [refreshData])
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingSpinner}>
          <Text style={styles.loadingText}>Loading your finances...</Text>
        </View>
      </View>
    );
  }

  const totalBalance = getTotalBalance(wallets);
  const { income, expenses, net } = getIncomeVsExpenses(transactions, 'month');
  const recentTransactions = getRecentTransactions(transactions, 3);

  const navigateToFinanceTab = (tab: 'Transactions' | 'Wallets' | 'Budgets' | 'Savings') => {
    navigation.navigate('Finance', {
      screen: 'FinanceTabs',
      params: { screen: tab },
    });
  };

  const handleAddIncome = () => {
    navigateToFinanceTab('Transactions');
  };

  const handleAddExpense = () => {
    navigateToFinanceTab('Transactions');
  };

  const renderTransactionItem = (transaction: Transaction) => (
    <View key={transaction.id} style={styles.transactionItem}>
      <View style={styles.transactionLeft}>
        <View style={[
          styles.transactionIcon,
          { backgroundColor: transaction.type === 'income' ? '#DCFCE7' : '#FEE2E2' }
        ]}>
          <Ionicons 
            name={transaction.type === 'income' ? 'trending-up' : 'trending-down'} 
            size={16} 
            color={transaction.type === 'income' ? '#16A34A' : '#DC2626'} 
          />
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionCategory}>{transaction.category}</Text>
          <Text style={styles.transactionDescription} numberOfLines={1}>
            {transaction.description || 'No description'}
          </Text>
        </View>
      </View>
      <View style={styles.transactionRight}>
        <Text style={[
          styles.transactionAmount,
          { color: transaction.type === 'income' ? '#16A34A' : '#DC2626' }
        ]}>
          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
        </Text>
        <Text style={styles.transactionDate}>{new Date(transaction.date).toLocaleDateString()}</Text>
      </View>
    </View>
  );

  const renderBudgetItem = (budget: Budget) => {
    const progress = calculateBudgetProgress(budget, transactions);
    const statusColor = progress.percentage > 90 ? '#DC2626' : progress.percentage > 70 ? '#EA580C' : '#16A34A';
    
    return (
      <View key={budget.id} style={styles.progressItem}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>{budget.name}</Text>
          <Text style={styles.progressAmount}>
            {formatCurrency(progress.spent)} / {formatCurrency(budget.amount)}
          </Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { backgroundColor: '#F3F4F6' }]}>
            <View style={[
              styles.progressFill,
              { 
                width: `${Math.min(progress.percentage, 100)}%`,
                backgroundColor: statusColor
              }
            ]} />
          </View>
          <Text style={[styles.progressPercentage, { color: statusColor }]}>
            {Math.round(progress.percentage)}%
          </Text>
        </View>
      </View>
    );
  };

  const renderSavingItem = (saving: Saving) => {
    const progress = calculateSavingProgress(saving);
    
    return (
      <View key={saving.id} style={styles.progressItem}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>{saving.name}</Text>
          <Text style={styles.progressAmount}>
            {formatCurrency(saving.currentAmount)} / {formatCurrency(saving.targetAmount)}
          </Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { backgroundColor: '#F3F4F6' }]}>
            <View style={[
              styles.progressFill,
              { 
                width: `${Math.min(progress.percentage, 100)}%`,
                backgroundColor: '#6366F1'
              }
            ]} />
          </View>
          <Text style={[styles.progressPercentage, { color: '#6366F1' }]}>
            {Math.round(progress.percentage)}%
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Greeting */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}!</Text>
        <Text style={styles.subGreeting}>Here's your financial overview</Text>
      </View>

      {/* Total Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceAmount}>{formatCurrency(totalBalance)}</Text>
        <View style={styles.netIncomeContainer}>
          <Text style={[
            styles.netIncome,
            { color: net >= 0 ? '#16A34A' : '#DC2626' }
          ]}>
            {net >= 0 ? '+' : ''}{formatCurrency(net)} this month
          </Text>
        </View>
      </View>

      {/* Income vs Expenses */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, styles.incomeCard]}>
          <View style={styles.summaryIcon}>
            <Ionicons name="trending-up" size={24} color="#16A34A" />
          </View>
          <Text style={styles.summaryAmount}>{formatCurrency(income)}</Text>
          <Text style={styles.summaryLabel}>Income</Text>
        </View>

        <View style={[styles.summaryCard, styles.expenseCard]}>
          <View style={styles.summaryIcon}>
            <Ionicons name="trending-down" size={24} color="#DC2626" />
          </View>
          <Text style={styles.summaryAmount}>{formatCurrency(expenses)}</Text>
          <Text style={styles.summaryLabel}>Expenses</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={[styles.quickActionButton, styles.incomeButton]} onPress={handleAddIncome}>
          <Ionicons name="add-circle" size={20} color="#FFFFFF" />
          <Text style={styles.quickActionText}>Add Income</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.quickActionButton, styles.expenseButton]} onPress={handleAddExpense}>
          <Ionicons name="remove-circle" size={20} color="#FFFFFF" />
          <Text style={styles.quickActionText}>Add Expense</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => navigateToFinanceTab('Transactions')}>
            <Text style={styles.sectionLink}>View All</Text>
          </TouchableOpacity>
        </View>
        {recentTransactions.length > 0 ? (
          <View style={styles.transactionsList}>
            {recentTransactions.map(renderTransactionItem)}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No transactions yet</Text>
            <Text style={styles.emptySubtext}>Start by adding your first transaction</Text>
          </View>
        )}
      </View>

      {/* Budget Overview */}
      {budgets.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Budget Overview</Text>
            <TouchableOpacity onPress={() => navigateToFinanceTab('Budgets')}>
              <Text style={styles.sectionLink}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.progressList}>
            {budgets.slice(0, 3).map(renderBudgetItem)}
          </View>
        </View>
      )}

      {/* Savings Goals */}
      {savings.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Savings Goals</Text>
            <TouchableOpacity onPress={() => navigateToFinanceTab('Savings')}>
              <Text style={styles.sectionLink}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.progressList}>
            {savings.slice(0, 3).map(renderSavingItem)}
          </View>
        </View>
      )}

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingSpinner: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 16,
    fontWeight: '500',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '400',
  },
  balanceCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 8,
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
  },
  netIncomeContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
  },
  netIncome: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  incomeButton: {
    backgroundColor: '#16A34A',
  },
  expenseButton: {
    backgroundColor: '#DC2626',
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  sectionLink: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
  },
  transactionsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  transactionDescription: {
    fontSize: 14,
    color: '#64748B',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  progressList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  progressItem: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  progressAmount: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 35,
    textAlign: 'right',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 16,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 20,
  },
  incomeCard: {},
  expenseCard: {},
});

