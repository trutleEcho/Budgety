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
import {formatCurrency, createSaving, calculateSavingProgress, type Saving} from '../lib/models';
import {useFocusEffect} from "@react-navigation/native";

export default function SavingsScreen() {
  const { savings, createSaving: addSaving, editSaving, removeSaving, loading,refreshData } = useFinanceData();
  const [modalVisible, setModalVisible] = useState(false);
  const [addMoneyModal, setAddMoneyModal] = useState(false);
  const [selectedSaving, setSelectedSaving] = useState<Saving>();
  const [addAmount, setAddAmount] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    description: ''
  });

  useFocusEffect(
      useCallback(() => {
        refreshData(); // fetch again whenever screen is focused
      }, [refreshData])
  );

  const handleAddSaving = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a saving goal name');
      return;
    }

    if (!formData.targetAmount || isNaN(parseFloat(formData.targetAmount))) {
      Alert.alert('Error', 'Please enter a valid target amount');
      return;
    }

    const currentAmount = formData.currentAmount ? parseFloat(formData.currentAmount) : 0;
    if (isNaN(currentAmount) || currentAmount < 0) {
      Alert.alert('Error', 'Please enter a valid current amount');
      return;
    }

    try {
      const savingData = createSaving({
        name: formData.name.trim(),
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: currentAmount,
        description: formData.description.trim()
      });

      await addSaving(savingData);
      setModalVisible(false);
      setFormData({ name: '', targetAmount: '', currentAmount: '', description: '' });
      Alert.alert('Success', 'Saving goal created successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to create saving goal');
    }
  };

  const handleAddMoney = async () => {
    if (!addAmount || isNaN(parseFloat(addAmount))) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const amount = parseFloat(addAmount);
    if (amount <= 0) {
      Alert.alert('Error', 'Amount must be greater than 0');
      return;
    }

    try {
      const newCurrentAmount = (selectedSaving?.currentAmount || 0) + amount;
      await editSaving(selectedSaving?.id!!, { currentAmount: newCurrentAmount });
      setAddMoneyModal(false);
      setAddAmount('');
      setSelectedSaving(undefined);
      Alert.alert('Success', `Added ${formatCurrency(amount)} to ${selectedSaving?.name}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to add money');
    }
  };

  const handleDeleteSaving = (saving: Saving) => {
    Alert.alert(
      'Delete Saving Goal',
      `Are you sure you want to delete "${saving.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => removeSaving(saving.id)
        }
      ]
    );
  };

  const openAddMoneyModal = (saving:Saving) => {
    setSelectedSaving(saving);
    setAddMoneyModal(true);
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
      <ScrollView style={styles.savingsList}>
        {savings.length > 0 ? (
          savings.map((saving) => {
            const progress = calculateSavingProgress(saving);
            const isCompleted = progress.percentage >= 100;
            
            return (
              <View key={saving.id} style={styles.savingCard}>
                <View style={styles.savingHeader}>
                  <View style={styles.savingInfo}>
                    <Text style={styles.savingName}>{saving.name}</Text>
                    {saving.description ? (
                      <Text style={styles.savingDescription}>{saving.description}</Text>
                    ) : null}
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteSaving(saving)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>

                <View style={styles.savingProgress}>
                  <View style={styles.progressInfo}>
                    <Text style={styles.progressText}>
                      {formatCurrency(saving.currentAmount)} / {formatCurrency(saving.targetAmount)}
                    </Text>
                    {isCompleted && (
                      <View style={styles.completedBadge}>
                        <Ionicons name="checkmark-circle" size={16} color="#fff" />
                        <Text style={styles.completedText}>Completed</Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.progressBar}>
                    <View style={[
                      styles.progressFill,
                      { 
                        width: `${Math.min(progress.percentage, 100)}%`,
                        backgroundColor: isCompleted ? '#10B981' : '#3B82F6'
                      }
                    ]} />
                  </View>
                  
                  <View style={styles.progressDetails}>
                    <Text style={styles.progressPercentage}>
                      {progress.percentage.toFixed(1)}% complete
                    </Text>
                    {!isCompleted && (
                      <Text style={styles.remainingAmount}>
                        {formatCurrency(progress.remaining)} remaining
                      </Text>
                    )}
                  </View>
                </View>

                {!isCompleted && (
                  <TouchableOpacity
                    style={styles.addMoneyButton}
                    onPress={() => openAddMoneyModal(saving)}
                  >
                    <Ionicons name="add-circle-outline" size={20} color="#3B82F6" />
                    <Text style={styles.addMoneyText}>Add Money</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="trending-up-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No saving goals yet</Text>
            <Text style={styles.emptySubtitle}>Create your first saving goal to start building wealth</Text>
          </View>
        )}
      </ScrollView>

      {/* Create Saving Goal Button */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.createButtonText}>Create Saving Goal</Text>
      </TouchableOpacity>

      {/* Create Saving Goal Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Saving Goal</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Goal Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                  placeholder="e.g., Emergency Fund"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Target Amount *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.targetAmount}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, targetAmount: text }))}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Current Amount</Text>
                <TextInput
                  style={styles.input}
                  value={formData.currentAmount}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, currentAmount: text }))}
                  placeholder="0.00"
                  keyboardType="numeric"
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
                style={[styles.button, styles.createSavingButton]}
                onPress={handleAddSaving}
              >
                <Text style={styles.createSavingButtonText}>Create Goal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Money Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addMoneyModal}
        onRequestClose={() => setAddMoneyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Money</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setAddMoneyModal(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedSaving && (
              <View style={styles.savingInfo}>
                <Text style={styles.selectedSavingName}>{selectedSaving.name}</Text>
                <Text style={styles.selectedSavingProgress}>
                  Current: {formatCurrency(selectedSaving.currentAmount)} / {formatCurrency(selectedSaving.targetAmount)}
                </Text>
              </View>
            )}

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Amount to Add *</Text>
                <TextInput
                  style={styles.input}
                  value={addAmount}
                  onChangeText={setAddAmount}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setAddMoneyModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.addMoneyButtonModal]}
                onPress={handleAddMoney}
              >
                <Text style={styles.addMoneyButtonModalText}>Add Money</Text>
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
  savingsList: {
    flex: 1,
    padding: 16,
  },
  savingCard: {
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
  savingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  savingInfo: {
    flex: 1,
  },
  savingName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  savingDescription: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    padding: 8,
  },
  savingProgress: {
    marginBottom: 12,
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
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  completedText: {
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
  progressDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 14,
    color: '#666',
  },
  remainingAmount: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  addMoneyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
    gap: 8,
  },
  addMoneyText: {
    color: '#3B82F6',
    fontSize: 16,
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
  createSavingButton: {
    backgroundColor: '#3B82F6',
  },
  createSavingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedSavingName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  selectedSavingProgress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  addMoneyButtonModal: {
    backgroundColor: '#10B981',
  },
  addMoneyButtonModalText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

