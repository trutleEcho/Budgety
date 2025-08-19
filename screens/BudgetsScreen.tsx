import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFinanceData } from '../hooks/useFinanceData';
import {
  formatCurrency,
  TRANSACTION_CATEGORIES,
  BUDGET_PERIODS,
  createBudget,
  calculateBudgetProgress,
  type Budget
} from '../lib/models';
import {useFocusEffect} from "@react-navigation/native";

export default function BudgetsScreen() {
  const { budgets, transactions, createBudget: addBudget, removeBudget, loading, refreshData } = useFinanceData();
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    amount: '',
    period: 'monthly'
  });

  useFocusEffect(
      useCallback(() => {
        refreshData(); // fetch again whenever screen is focused
      }, [refreshData])
  );

  const handleAddBudget = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a budget name');
      return;
    }

    if (!formData.category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    if (!formData.amount || isNaN(parseFloat(formData.amount))) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      const budgetData = createBudget({
        name: formData.name.trim(),
        category: formData.category,
        amount: parseFloat(formData.amount),
        period: formData.period as 'weekly' | 'monthly' | 'yearly'
      });

      await addBudget(budgetData);
      setModalVisible(false);
      setFormData({ name: '', category: '', amount: '', period: 'monthly' });
      Alert.alert('Success', 'Budget created successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to create budget');
    }
  };

  const handleDeleteBudget = (budget:Budget) => {
    Alert.alert(
      'Delete Budget',
      `Are you sure you want to delete "${budget.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => removeBudget(budget.id)
        }
      ]
    );
  };

  const getBudgetStatus = (percentage : number) => {
    if (percentage >= 100) return { status: 'Over Budget', color: '#EF4444' };
    if (percentage >= 90) return { status: 'Near Limit', color: '#F59E0B' };
    if (percentage >= 70) return { status: 'On Track', color: '#F59E0B' };
    return { status: 'On Track', color: '#10B981' };
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.budgetsList}>
        {budgets.length > 0 ? (
          budgets.map((budget) => {
            const progress = calculateBudgetProgress(budget, transactions);
            const status = getBudgetStatus(progress.percentage);
            
            return (
              <View key={budget.id} style={styles.budgetCard}>
                <View style={styles.budgetHeader}>
                  <View style={styles.budgetInfo}>
                    <Text style={styles.budgetName}>{budget.name}</Text>
                    <Text style={styles.budgetCategory}>{budget.category}</Text>
                    <Text style={styles.budgetPeriod}>
                      {BUDGET_PERIODS.find(p => p.value === budget.period)?.label || budget.period}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteBudget(budget)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>

                <View style={styles.budgetProgress}>
                  <View style={styles.progressInfo}>
                    <Text style={styles.progressText}>
                      {formatCurrency(progress.spent)} / {formatCurrency(budget.amount)}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
                      <Text style={styles.statusText}>{status.status}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.progressBar}>
                    <View style={[
                      styles.progressFill,
                      { 
                        width: `${Math.min(progress.percentage, 100)}%`,
                        backgroundColor: status.color
                      }
                    ]} />
                  </View>
                  
                  <Text style={styles.progressPercentage}>
                    {progress.percentage.toFixed(1)}% used
                  </Text>
                  
                  {progress.remaining > 0 && (
                    <Text style={styles.remainingAmount}>
                      {formatCurrency(progress.remaining)} remaining
                    </Text>
                  )}
                  
                  {progress.remaining < 0 && (
                    <Text style={styles.overAmount}>
                      {formatCurrency(Math.abs(progress.remaining))} over budget
                    </Text>
                  )}
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="pie-chart-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No budgets yet</Text>
            <Text style={styles.emptySubtitle}>Create your first budget to track spending</Text>
          </View>
        )}
      </ScrollView>

      {/* Create Budget Button */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.createButtonText}>Create Budget</Text>
      </TouchableOpacity>

      {/* Create Budget Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Budget</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Budget Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                  placeholder="e.g., Monthly Groceries"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Category *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsBar}>
                  <TouchableOpacity
                    style={[styles.chip, formData.category === '' && styles.chipActive]}
                    onPress={() => setFormData(prev => ({ ...prev, category: '' }))}
                  >
                    <Text style={[styles.chipText, formData.category === '' && styles.chipTextActive]}>Select category</Text>
                  </TouchableOpacity>
                  {TRANSACTION_CATEGORIES.EXPENSE.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[styles.chip, formData.category === category && styles.chipActive]}
                      onPress={() => setFormData(prev => ({ ...prev, category }))}
                    >
                      <Text style={[styles.chipText, formData.category === category && styles.chipTextActive]}>{category}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Budget Amount *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.amount}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, amount: text }))}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Period *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsBar}>
                  {BUDGET_PERIODS.map((period) => (
                    <TouchableOpacity
                      key={period.value}
                      style={[styles.chip, formData.period === period.value && styles.chipActive]}
                      onPress={() => setFormData(prev => ({ ...prev, period: period.value }))}
                    >
                      <Text style={[styles.chipText, formData.period === period.value && styles.chipTextActive]}>{period.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.createBudgetButton]}
                onPress={handleAddBudget}
              >
                <Text style={styles.createBudgetButtonText}>Create Budget</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  budgetsList: {
    flex: 1,
    padding: 16,
  },
  budgetCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  budgetInfo: {
    flex: 1,
  },
  budgetName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  budgetCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  budgetPeriod: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    padding: 8,
  },
  budgetProgress: {
    marginTop: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  remainingAmount: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  overAmount: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    gap: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    width: '100%',
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  form: {
    marginBottom: 20,
    maxHeight: 300,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  picker: {
    color: '#000',
    height: 50,
  },
  chipsBar: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  chipActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  chipText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 12,
  },
  chipTextActive: {
    color: '#4338CA',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  createBudgetButton: {
    backgroundColor: '#3B82F6',
  },
  createBudgetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

