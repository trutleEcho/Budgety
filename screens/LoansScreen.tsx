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
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useFinanceData } from '../hooks/useFinanceData';
import {formatCurrency, formatDate, createLoan, type Loan} from '../lib/models';
import {useFocusEffect} from "@react-navigation/native";

export default function LoansScreen() {
  const { loans, createLoan: addLoan, editLoan, removeLoan, loading,refreshData } = useFinanceData();
  const [modalVisible, setModalVisible] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan>();
  const [paymentAmount, setPaymentAmount] = useState('');
  const [formData, setFormData] = useState({
    type: "lent" as ("lent" | "borrowed"),
    personName: '',
    amount: '',
    description: '',
    dueDate: '',
    interestRate: ''
  });

  useFocusEffect(
      useCallback(() => {
        refreshData(); // fetch again whenever screen is focused
      }, [refreshData])
  );

  const handleAddLoan = async () => {
    if (!formData.personName.trim()) {
      Alert.alert('Error', 'Please enter a person name');
      return;
    }

    if (!formData.amount || isNaN(parseFloat(formData.amount))) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      const loanData = createLoan({
        type: formData.type,
        personName: formData.personName.trim(),
        amount: parseFloat(formData.amount),
        description: formData.description.trim(),
        dueDate: formData.dueDate || null,
        interestRate: formData.interestRate ? parseFloat(formData.interestRate) : 0
      });

      await addLoan(loanData);
      setModalVisible(false);
      setFormData({
        type: 'lent',
        personName: '',
        amount: '',
        description: '',
        dueDate: '',
        interestRate: ''
      });
      Alert.alert('Success', 'Loan recorded successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to record loan');
    }
  };

  const handleAddPayment = async () => {
    if (!paymentAmount || isNaN(parseFloat(paymentAmount))) {
      Alert.alert('Error', 'Please enter a valid payment amount');
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (amount <= 0) {
      Alert.alert('Error', 'Payment amount must be greater than 0');
      return;
    }

    const currentPaid = selectedLoan?.paidAmount || 0;
    const newPaidAmount = currentPaid + amount;

    if (newPaidAmount > (selectedLoan?.amount || 0)) {
      Alert.alert('Error', 'Payment amount exceeds remaining loan amount');
      return;
    }

    try {
      const newStatus = newPaidAmount >= (selectedLoan?.amount || 0) ? 'paid' : 'active';
      await editLoan(selectedLoan?.id!!, {
        paidAmount: newPaidAmount,
        status: newStatus
      });
      setPaymentModal(false);
      setPaymentAmount('');
      setSelectedLoan(undefined);
      Alert.alert('Success', `Payment of ${formatCurrency(amount)} recorded`);
    } catch (error) {
      Alert.alert('Error', 'Failed to record payment');
    }
  };

  const handleMarkPaid = async (loan:Loan) => {
    Alert.alert(
      'Mark as Paid',
      `Mark "${loan.personName}" loan as fully paid?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Paid',
          onPress: async () => {
            try {
              await editLoan(loan.id, { 
                paidAmount: loan.amount,
                status: 'paid'
              });
              Alert.alert('Success', 'Loan marked as paid');
            } catch (error) {
              Alert.alert('Error', 'Failed to mark loan as paid');
            }
          }
        }
      ]
    );
  };

  const handleDeleteLoan = (loan:Loan) => {
    Alert.alert(
      'Delete Loan',
      `Are you sure you want to delete the loan with "${loan.personName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => removeLoan(loan.id)
        }
      ]
    );
  };

  const openPaymentModal = (loan:Loan) => {
    setSelectedLoan(loan);
    setPaymentModal(true);
  };

  const getLoanStatus = (loan:Loan) => {
    if (loan.status === 'paid') return { status: 'Paid', color: '#10B981' };
    
    const paidAmount = loan.paidAmount || 0;
    if (paidAmount > 0 && paidAmount < loan.amount) {
      return { status: 'Partial', color: '#F59E0B' };
    }
    
    if (loan.dueDate && new Date(loan.dueDate) < new Date()) {
      return { status: 'Overdue', color: '#EF4444' };
    }
    
    return { status: 'Pending', color: '#3B82F6' };
  };

  const getTotalLent = () => {
    return loans
      .filter(loan => loan.type === 'lent')
      .reduce((sum, loan) => sum + loan.amount, 0);
  };

  const getTotalBorrowed = () => {
    return loans
      .filter(loan => loan.type === 'borrowed')
      .reduce((sum, loan) => sum + loan.amount, 0);
  };

  const getTotalReceived = () => {
    return loans
      .filter(loan => loan.type === 'lent')
      .reduce((sum, loan) => sum + (loan.paidAmount || 0), 0);
  };

  const getTotalRepaid = () => {
    return loans
      .filter(loan => loan.type === 'borrowed')
      .reduce((sum, loan) => sum + (loan.paidAmount || 0), 0);
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
      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard]}>
            <View style={styles.summaryHeader}>
              <Ionicons name="trending-up" size={20} color="#10B981" />
              <Text style={styles.summaryLabel}>Money Lent</Text>
            </View>
            <Text style={styles.lentAmount}>{formatCurrency(getTotalLent())}</Text>
            <Text style={styles.summarySubtext}>{formatCurrency(getTotalReceived())} received</Text>
          </View>

          <View style={[styles.summaryCard]}>
            <View style={styles.summaryHeader}>
              <Ionicons name="trending-down" size={20} color="#EF4444" />
              <Text style={styles.summaryLabel}>Money Borrowed</Text>
            </View>
            <Text style={styles.borrowedAmount}>{formatCurrency(getTotalBorrowed())}</Text>
            <Text style={styles.summarySubtext}>{formatCurrency(getTotalRepaid())} repaid</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.loansList}>
        {loans.length > 0 ? (
          loans.map((loan) => {
            const status = getLoanStatus(loan);
            const paidAmount = loan.paidAmount || 0;
            const remainingAmount = loan.amount - paidAmount;
            const progressPercentage = (paidAmount / loan.amount) * 100;
            
            return (
              <View key={loan.id} style={styles.loanCard}>
                <View style={styles.loanHeader}>
                  <View style={styles.loanInfo}>
                    <View style={styles.loanTitleRow}>
                      <Ionicons
                        name={loan.type === 'lent' ? 'trending-up' : 'trending-down'}
                        size={20}
                        color={loan.type === 'lent' ? '#10B981' : '#EF4444'}
                      />
                      <Text style={styles.loanPerson}>{loan.personName}</Text>
                    </View>
                    <Text style={styles.loanType}>
                      Money {loan.type === 'lent' ? 'lent to' : 'borrowed from'} {loan.personName}
                    </Text>
                    {loan.description ? (
                      <Text style={styles.loanDescription}>{loan.description}</Text>
                    ) : null}
                  </View>
                  <View style={styles.loanActions}>
                    <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
                      <Text style={styles.statusText}>{status.status}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteLoan(loan)}
                    >
                      <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.loanAmount}>
                  <Text style={styles.amountText}>{formatCurrency(loan.amount)}</Text>
                  {loan.interestRate > 0 && (
                    <Text style={styles.interestText}>{loan.interestRate}% interest</Text>
                  )}
                </View>

                {paidAmount > 0 && (
                  <View style={styles.paymentProgress}>
                    <View style={styles.progressInfo}>
                      <Text style={styles.progressText}>
                        {formatCurrency(paidAmount)} / {formatCurrency(loan.amount)}
                      </Text>
                      <Text style={styles.progressPercentage}>
                        {progressPercentage.toFixed(1)}%
                      </Text>
                    </View>
                    <View style={styles.progressBar}>
                      <View style={[
                        styles.progressFill,
                        { 
                          width: `${Math.min(progressPercentage, 100)}%`,
                          backgroundColor: status.color
                        }
                      ]} />
                    </View>
                  </View>
                )}

                {loan.dueDate && (
                  <Text style={styles.dueDate}>
                    Due: {formatDate(loan.dueDate)}
                  </Text>
                )}

                {loan.status !== 'paid' && (
                  <View style={styles.loanButtons}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.paymentButton]}
                      onPress={() => openPaymentModal(loan)}
                    >
                      <Ionicons name="add-circle-outline" size={16} color="#3B82F6" />
                      <Text style={styles.paymentButtonText}>Add Payment</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.markPaidButton]}
                      onPress={() => handleMarkPaid(loan)}
                    >
                      <Ionicons name="checkmark-circle-outline" size={16} color="#10B981" />
                      <Text style={styles.markPaidButtonText}>Mark Paid</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No loans yet</Text>
            <Text style={styles.emptySubtitle}>Record your first loan to start tracking</Text>
          </View>
        )}
      </ScrollView>

      {/* Record Loan Button */}
      <TouchableOpacity
        style={styles.recordButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.recordButtonText}>Record Loan</Text>
      </TouchableOpacity>

      {/* Record Loan Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Record New Loan</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Type *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                    style={styles.picker}
                  >
                    <Picker.Item label="Money Lent (I gave money)" value="lent" />
                    <Picker.Item label="Money Borrowed (I received money)" value="borrowed" />
                  </Picker>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Person *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.personName}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, personName: text }))}
                  placeholder="e.g., John Smith"
                />
              </View>

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
                <Text style={styles.label}>Due Date (Optional)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.dueDate}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, dueDate: text }))}
                  placeholder="YYYY-MM-DD"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Interest Rate % (Optional)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.interestRate}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, interestRate: text }))}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.description}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                  placeholder="Purpose of the loan"
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
                style={[styles.button, styles.recordLoanButton]}
                onPress={handleAddLoan}
              >
                <Text style={styles.recordLoanButtonText}>Record Loan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Payment Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={paymentModal}
        onRequestClose={() => setPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Payment</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setPaymentModal(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedLoan && (
              <View style={styles.loanInfo}>
                <Text style={styles.selectedLoanPerson}>{selectedLoan.personName}</Text>
                <Text style={styles.selectedLoanAmount}>
                  Total: {formatCurrency(selectedLoan.amount)}
                </Text>
                <Text style={styles.selectedLoanPaid}>
                  Paid: {formatCurrency(selectedLoan.paidAmount || 0)}
                </Text>
                <Text style={styles.selectedLoanRemaining}>
                  Remaining: {formatCurrency(selectedLoan.amount - (selectedLoan.paidAmount || 0))}
                </Text>
              </View>
            )}

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Payment Amount *</Text>
                <TextInput
                  style={styles.input}
                  value={paymentAmount}
                  onChangeText={setPaymentAmount}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setPaymentModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.addPaymentButton]}
                onPress={handleAddPayment}
              >
                <Text style={styles.addPaymentButtonText}>Add Payment</Text>
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
    backgroundColor: '#f5f5f5',
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
  summaryContainer: {
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  lentAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  borrowedAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EF4444',
    marginBottom: 4,
  },
  summarySubtext: {
    fontSize: 12,
    color: '#999',
  },
  loansList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loanCard: {
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
  loanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  loanInfo: {
    flex: 1,
    marginRight: 12,
  },
  loanTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  loanPerson: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  loanType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  loanDescription: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  loanActions: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  deleteButton: {
    padding: 4,
  },
  loanAmount: {
    marginBottom: 12,
  },
  amountText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  interestText: {
    fontSize: 14,
    color: '#F59E0B',
    marginTop: 2,
  },
  paymentProgress: {
    marginBottom: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
  },
  progressPercentage: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  dueDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  loanButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 4,
  },
  paymentButton: {
    backgroundColor: '#f0f8ff',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  paymentButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
  },
  markPaidButton: {
    backgroundColor: '#f0fff4',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  markPaidButtonText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
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
  recordButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    gap: 8,
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
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
    color: '#000',
    height: 50,
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
  recordLoanButton: {
    backgroundColor: '#3B82F6',
  },
  recordLoanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedLoanPerson: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  selectedLoanAmount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  selectedLoanPaid: {
    fontSize: 14,
    color: '#10B981',
    marginBottom: 4,
  },
  selectedLoanRemaining: {
    fontSize: 14,
    color: '#EF4444',
    marginBottom: 16,
  },
  addPaymentButton: {
    backgroundColor: '#10B981',
  },
  addPaymentButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

