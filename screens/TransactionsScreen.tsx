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
import {formatCurrency, formatDate, TRANSACTION_CATEGORIES, createTransaction, type Transaction} from '../lib/models';
import {useFocusEffect} from "@react-navigation/native";

export default function TransactionsScreen() {
  const { transactions, wallets, createTransaction: addTransaction, removeTransaction, loading, refreshData } = useFinanceData();
  const [modalVisible, setModalVisible] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    walletId: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  useFocusEffect(
      useCallback(() => {
        refreshData(); // fetch again whenever screen is focused
      }, [refreshData])
  );

  const handleAddTransaction = async () => {
    if (!formData.amount || isNaN(parseFloat(formData.amount))) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!formData.category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    if (!formData.walletId) {
      Alert.alert('Error', 'Please select a wallet');
      return;
    }

    try {
      const transactionData = createTransaction({
        amount: parseFloat(formData.amount),
        type: transactionType,
        category: formData.category,
        walletId: formData.walletId,
        description: formData.description.trim(),
        date: formData.date ?? new Date().toISOString()
      });

      await addTransaction(transactionData);
      setModalVisible(false);
      setFormData({
        amount: '',
        category: '',
        walletId: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      Alert.alert('Success', 'Transaction added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add transaction');
    }
  };

  const handleDeleteTransaction = (transaction:Transaction) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => removeTransaction(transaction.id)
        }
      ]
    );
  };

  const openModal = (type = 'income') => {
    setTransactionType(type as 'income' | 'expense');
    setFormData(prev => ({
      ...prev,
      category: '',
      walletId: wallets.length > 0 ? (wallets[0] ? wallets[0].id : '') : ''
    }));
    setModalVisible(true);
  };

  const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.transactionsList}>
        {sortedTransactions.length > 0 ? (
          sortedTransactions.map((transaction) => {
            const wallet = wallets.find(w => w.id === transaction.walletId);
            return (
              <View key={transaction.id} style={styles.transactionCard}>
                <View style={styles.transactionHeader}>
                  <View style={styles.transactionInfo}>
                    <View style={styles.categoryRow}>
                      <Ionicons
                        name={transaction.type === 'income' ? 'trending-up' : 'trending-down'}
                        size={20}
                        color={transaction.type === 'income' ? '#10B981' : '#EF4444'}
                      />
                      <Text style={styles.transactionCategory}>{transaction.category}</Text>
                    </View>
                    <Text style={styles.transactionDescription}>
                      {transaction.description || 'No description'}
                    </Text>
                    <Text style={styles.transactionDetails}>
                      {wallet?.name} • {formatDate(transaction.date)}
                    </Text>
                  </View>
                  <View style={styles.transactionActions}>
                    <Text style={[
                      styles.transactionAmount,
                      transaction.type === 'income' ? styles.incomeAmount : styles.expenseAmount
                    ]}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </Text>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteTransaction(transaction)}
                    >
                      <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No transactions yet</Text>
            <Text style={styles.emptySubtitle}>Add your first transaction to get started</Text>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.incomeButton]}
          onPress={() => openModal('income')}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Add Income</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.expenseButton]}
          onPress={() => openModal('expense')}
        >
          <Ionicons name="remove" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Add Expense</Text>
        </TouchableOpacity>
      </View>

      {/* Add Transaction Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Add {transactionType === 'income' ? 'Income' : 'Expense'}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Amount *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.amount}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, amount: text }))}
                  placeholder="0.00"
                  keyboardType="numeric"
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
                  {(transactionType === 'income' 
                    ? TRANSACTION_CATEGORIES.INCOME 
                    : TRANSACTION_CATEGORIES.EXPENSE
                  ).map((category) => (
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
                <Text style={styles.label}>Wallet *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsBar}>
                  <TouchableOpacity
                    style={[styles.chip, formData.walletId === '' && styles.chipActive]}
                    onPress={() => setFormData(prev => ({ ...prev, walletId: '' }))}
                  >
                    <Text style={[styles.chipText, formData.walletId === '' && styles.chipTextActive]}>Select wallet</Text>
                  </TouchableOpacity>
                  {wallets.map((wallet) => (
                    <TouchableOpacity
                      key={wallet.id}
                      style={[styles.chip, formData.walletId === wallet.id && styles.chipActive]}
                      onPress={() => setFormData(prev => ({ ...prev, walletId: wallet.id }))}
                    >
                      <Text style={[styles.chipText, formData.walletId === wallet.id && styles.chipTextActive]}>{wallet.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Date *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.date}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, date: text }))}
                  placeholder="YYYY-MM-DD"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.description}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                  placeholder="Optional description"
                  multiline
                  numberOfLines={3}
                />
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
                style={[styles.button, styles.addTransactionButton]}
                onPress={handleAddTransaction}
              >
                <Text style={styles.addTransactionButtonText}>
                  Add {transactionType === 'income' ? 'Income' : 'Expense'}
                </Text>
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
  transactionsList: {
    flex: 1,
    padding: 16,
  },
  transactionCard: {
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
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  transactionInfo: {
    flex: 1,
    marginRight: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  transactionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  transactionDetails: {
    fontSize: 12,
    color: '#999',
  },
  transactionActions: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  incomeAmount: {
    color: '#10B981',
  },
  expenseAmount: {
    color: '#EF4444',
  },
  deleteButton: {
    padding: 4,
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
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  incomeButton: {
    backgroundColor: '#10B981',
  },
  expenseButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
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
    maxHeight: 400,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  picker: {
    color: '#333',
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
  addTransactionButton: {
    backgroundColor: '#3B82F6',
  },
  addTransactionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

