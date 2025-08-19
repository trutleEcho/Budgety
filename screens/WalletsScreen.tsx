import React, {type JSX, useCallback, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFinanceData } from '../hooks/useFinanceData';
import { formatCurrency, WALLET_TYPES, createWallet, type Wallet } from '../lib/models';
import {useFocusEffect} from "@react-navigation/native";

interface WalletFormData {
  name: string;
  type: 'checking' | 'savings' | 'cash' | 'investment';
  balance: string;
  description: string;
}

const { width } = Dimensions.get('window');

export default function WalletsScreen(): JSX.Element {
  const { wallets, createWallet: addWallet, removeWallet, loading,refreshData } = useFinanceData();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [formData, setFormData] = useState<WalletFormData>({
    name: '',
    type: 'checking',
    balance: '',
    description: ''
  });

  useFocusEffect(
      useCallback(() => {
        refreshData(); // fetch again whenever screen is focused
      }, [refreshData])
  );

  const handleAddWallet = async (): Promise<void> => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a wallet name');
      return;
    }

    if (!formData.balance || isNaN(parseFloat(formData.balance))) {
      Alert.alert('Error', 'Please enter a valid balance');
      return;
    }

    try {
      const walletData = createWallet({
        name: formData.name.trim() ?? 'New Wallet',
        type: formData.type,
        balance: parseFloat(formData.balance),
        description: formData.description.trim()
      });

      await addWallet(walletData);
      setModalVisible(false);
      setFormData({ name: '', type: 'checking', balance: '', description: '' });
      Alert.alert('Success', 'Wallet added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add wallet');
    }
  };

  const handleDeleteWallet = (wallet: Wallet): void => {
    Alert.alert(
      'Delete Wallet',
      `Are you sure you want to delete "${wallet.name}"? This will also delete all associated transactions.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => removeWallet(wallet.id)
        }
      ]
    );
  };

  const getWalletIcon = (type: string): string => {
    switch (type) {
      case 'checking':
        return 'card';
      case 'savings':
        return 'wallet';
      case 'cash':
        return 'cash';
      case 'investment':
        return 'trending-up';
      default:
        return 'wallet';
    }
  };

  const getWalletColor = (type: string): string => {
    switch (type) {
      case 'checking':
        return '#3B82F6';
      case 'savings':
        return '#10B981';
      case 'cash':
        return '#F59E0B';
      case 'investment':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingSpinner}>
          <Text style={styles.loadingText}>Loading wallets...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Wallets</Text>
          <Text style={styles.headerSubtitle}>Manage your accounts and balances</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Total Balance Card */}
      <View style={styles.totalCard}>
        <View style={styles.totalContent}>
          <Text style={styles.totalLabel}>Total Balance</Text>
          <Text style={styles.totalAmount}>{formatCurrency(totalBalance)}</Text>
          <Text style={styles.totalSubtext}>Across {wallets.length} wallet{wallets.length !== 1 ? 's' : ''}</Text>
        </View>
      </View>

      {/* Wallets List */}
      <ScrollView style={styles.walletsList} showsVerticalScrollIndicator={false}>
        {wallets.length > 0 ? (
          wallets.map((wallet) => (
            <View key={wallet.id} style={styles.walletCard}>
              <View style={styles.walletHeader}>
                <View style={styles.walletLeft}>
                  <View style={[
                    styles.walletIcon,
                    { backgroundColor: `${getWalletColor(wallet.type)}20` }
                  ]}>
                    <Ionicons 
                      name={getWalletIcon(wallet.type) as any} 
                      size={24} 
                      color={getWalletColor(wallet.type)} 
                    />
                  </View>
                  <View style={styles.walletInfo}>
                    <Text style={styles.walletName}>{wallet.name}</Text>
                    <Text style={styles.walletType}>
                      {WALLET_TYPES.find(t => t.value === wallet.type)?.label || wallet.type}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDeleteWallet(wallet)}
                >
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.walletBalance}>
                <Text style={styles.balanceAmount}>{formatCurrency(wallet.balance)}</Text>
                {wallet.description ? (
                  <Text style={styles.walletDescription}>{wallet.description}</Text>
                ) : null}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No wallets yet</Text>
            <Text style={styles.emptySubtitle}>Add your first wallet to start tracking your finances</Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.emptyButtonText}>Add Wallet</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Add Wallet Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Wallet</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Wallet Name *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g., Main Checking"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Wallet Type *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsBar}>
                  {WALLET_TYPES.map((type) => {
                    const active = formData.type === type.value
                    return (
                      <TouchableOpacity
                        key={type.value}
                        style={[styles.chip, active && styles.chipActive]}
                        onPress={() => setFormData({ ...formData, type: type.value })}
                      >
                        <Text style={[styles.chipText, active && styles.chipTextActive]}>{type.label}</Text>
                      </TouchableOpacity>
                    )
                  })}
                </ScrollView>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Initial Balance *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="0.00"
                  value={formData.balance}
                  onChangeText={(text) => setFormData({ ...formData, balance: text })}
                  keyboardType="numeric"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Description (Optional)</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  placeholder="Add a description..."
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  multiline
                  numberOfLines={3}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleAddWallet}
              >
                <Text style={styles.submitButtonText}>Add Wallet</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748B',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  totalCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  totalContent: {
    padding: 24,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 8,
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  totalSubtext: {
    fontSize: 14,
    color: '#94A3B8',
  },
  walletsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  walletCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 12,
  },
  walletLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  walletIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  walletInfo: {
    flex: 1,
  },
  walletName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  walletType: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletBalance: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  walletDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalForm: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
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
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#6366F1',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

