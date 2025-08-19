// screens/InvestmentsScreen.js
import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Modal,
    TextInput,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useFinanceData } from '../hooks/useFinanceData'
import type { Investment } from '../lib/models'
import { INVESTMENT_TYPES } from '../lib/models'

/** Currency formatter */
const formatCurrency = (value: number): string =>
    `$${(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`

/** Type label lookup */
const getTypeLabel = (type: Investment['type']): string => {
    const info = INVESTMENT_TYPES.find(t => t.value === type)
    return info ? info.label : type
}

/** Props for the Investment Form Modal */
interface InvestmentFormModalProps {
    visible: boolean
    onClose: () => void
    onSave: (investmentData: Omit<Investment, 'id' | 'createdAt'>) => void
    editingInvestment?: Investment | null
}

/** Local form state type */
interface InvestmentFormState {
    name: string
    type: Investment['type']
    symbol: string
    institutionName: string
    investedAmount: string
    currentValue: string
    interestRate: string
    startDate: string
    maturityDate: string
    description: string
    // Property-specific
    propertyAddress?: string
    propertyAreaSqFt?: string
    rentalIncome?: string
}

/** Modal form for adding/editing an investment */
function InvestmentFormModal({
                                 visible,
                                 onClose,
                                 onSave,
                                 editingInvestment = null,
                             }: InvestmentFormModalProps) {
    const [formData, setFormData] = useState<InvestmentFormState>({
        name: '',
        type: 'stock',
        symbol: '',
        institutionName: '',
        investedAmount: '',
        currentValue: '',
        interestRate: '',
        startDate: (new Date().toISOString().split('T')[0] as string),
        maturityDate: (new Date().toISOString().split('T')[0] as string),
        description: '',
        propertyAddress: '',
        propertyAreaSqFt: '',
        rentalIncome: '',
    })

    useEffect(() => {
        if (editingInvestment) {
            setFormData({
                name: editingInvestment.name ?? '',
                type: (editingInvestment.type as Investment['type']) ?? 'stock',
                symbol: editingInvestment.symbol ?? '',
                institutionName: editingInvestment.institutionName ?? '',
                investedAmount: editingInvestment.investedAmount?.toString() ?? '',
                currentValue: editingInvestment.currentValue?.toString() ?? '',
                interestRate: editingInvestment.interestRate?.toString() ?? '',
                startDate: editingInvestment.startDate ? (new Date(editingInvestment.startDate).toISOString().split('T')[0] as string) : '',
                maturityDate: editingInvestment.maturityDate ? (new Date(editingInvestment.maturityDate).toISOString().split('T')[0] as string) : '',
                description: editingInvestment.description ?? '',
                propertyAddress: editingInvestment.propertyAddress ?? '',
                propertyAreaSqFt: editingInvestment.propertyAreaSqFt?.toString() ?? '',
                rentalIncome: editingInvestment.rentalIncome?.toString() ?? '',
            })
        } else {
            setFormData({
                name: '',
                type: 'stock',
                symbol: '',
                institutionName: '',
                investedAmount: '',
                currentValue: '',
                interestRate: '',
                startDate: (new Date().toISOString().split('T')[0] as string),
                maturityDate: (new Date().toISOString().split('T')[0] as string),
                description: '',
                propertyAddress: '',
                propertyAreaSqFt: '',
                rentalIncome: '',
            })
        }
    }, [editingInvestment, visible])

    const handleSave = () => {
        if (!formData.name || !formData.investedAmount) {
            Alert.alert('Validation Error', 'Name and Invested Amount are required')
            return
        }

        const investmentData: Omit<Investment, 'id' | 'createdAt'> = {
            name: formData.name,
            type: formData.type,
            investedAmount: parseFloat(formData.investedAmount) || 0,
            currentValue:
                parseFloat(formData.currentValue) ||
                parseFloat(formData.investedAmount) ||
                0,
            description: formData.description,
        }

        if (formData.symbol) {
            investmentData.symbol = formData.symbol
        }
        if (formData.institutionName) {
            investmentData.institutionName = formData.institutionName
        }
        if (formData.interestRate) {
            investmentData.interestRate = parseFloat(formData.interestRate)
        }
        const parseDateInputToMs = (input: string): number | undefined => {
            const trimmed = input.trim()
            if (!trimmed) return undefined
            const num = Number(trimmed)
            if (!Number.isNaN(num)) return num
            const parsed = Date.parse(trimmed)
            return Number.isNaN(parsed) ? undefined : parsed
        }
        const startMs = parseDateInputToMs(formData.startDate)
        if (startMs !== undefined) {
            investmentData.startDate = startMs
        }
        const maturityMs = parseDateInputToMs(formData.maturityDate)
        if (maturityMs !== undefined) {
            investmentData.maturityDate = maturityMs
        }
        if (formData.propertyAddress) {
            investmentData.propertyAddress = formData.propertyAddress
        }
        if (formData.propertyAreaSqFt) {
            investmentData.propertyAreaSqFt = parseFloat(formData.propertyAreaSqFt)
        }
        if (formData.rentalIncome) {
            investmentData.rentalIncome = parseFloat(formData.rentalIncome)
        }

        onSave(investmentData)
        onClose()
    }

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
                <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={onClose}>
                        <Text style={styles.modalCancelButton}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>
                        {editingInvestment ? 'Edit Investment' : 'Add Investment'}
                    </Text>
                    <TouchableOpacity onPress={handleSave}>
                        <Text style={styles.modalSaveButton}>Save</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.formContainer}>
                    <View style={styles.formField}>
                        <Text style={styles.fieldLabel}>Name *</Text>
                        <TextInput
                            style={styles.fieldInput}
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                            placeholder="Investment name"
                        />
                    </View>

                    <View style={styles.formField}>
                        <Text style={styles.fieldLabel}>Type</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterBar}>
                            {INVESTMENT_TYPES.map((t) => {
                                const active = formData.type === (t.value as Investment['type'])
                                return (
                                    <TouchableOpacity
                                        key={t.value}
                                        style={[styles.chip, active && styles.chipActive]}
                                        onPress={() => setFormData({ ...formData, type: t.value as Investment['type'] })}
                                    >
                                        <Text style={[styles.chipText, active && styles.chipTextActive]}>{t.label}</Text>
                                    </TouchableOpacity>
                                )
                            })}
                        </ScrollView>
                    </View>

                    {/* Common fields */}
                    <View style={styles.formField}>
                        <Text style={styles.fieldLabel}>Invested Amount *</Text>
                        <TextInput
                            style={styles.fieldInput}
                            value={formData.investedAmount}
                            onChangeText={(text) => setFormData({ ...formData, investedAmount: text })}
                            placeholder="0.00"
                            keyboardType="numeric"
                        />
                    </View>

                    {/* Conditional fields by type */}
                    {['stock', 'etf', 'crypto', 'mutual_fund'].includes(formData.type) ? (
                        <View style={styles.formField}>
                            <Text style={styles.fieldLabel}>Symbol</Text>
                            <TextInput
                                style={styles.fieldInput}
                                value={formData.symbol}
                                onChangeText={(text) => setFormData({ ...formData, symbol: text })}
                                placeholder="e.g. AAPL, BTC"
                            />
                        </View>
                    ) : null}

                    {['fd', 'rd', 'bond'].includes(formData.type) ? (
                        <>
                            <View style={styles.formField}>
                                <Text style={styles.fieldLabel}>Institution</Text>
                                <TextInput
                                    style={styles.fieldInput}
                                    value={formData.institutionName}
                                    onChangeText={(text) => setFormData({ ...formData, institutionName: text })}
                                    placeholder="Bank / Institution"
                                />
                            </View>
                            <View style={styles.formField}>
                                <Text style={styles.fieldLabel}>Interest Rate (%)</Text>
                                <TextInput
                                    style={styles.fieldInput}
                                    value={formData.interestRate}
                                    onChangeText={(text) => setFormData({ ...formData, interestRate: text })}
                                    placeholder="e.g. 7.5"
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={styles.formField}>
                                <Text style={styles.fieldLabel}>Start Date</Text>
                                <TextInput
                                    style={styles.fieldInput}
                                    value={formData.startDate}
                                    onChangeText={(text) => setFormData({ ...formData, startDate: text })}
                                    placeholder="YYYY-MM-DD or epoch ms"
                                />
                            </View>
                            <View style={styles.formField}>
                                <Text style={styles.fieldLabel}>Maturity Date</Text>
                                <TextInput
                                    style={styles.fieldInput}
                                    value={formData.maturityDate}
                                    onChangeText={(text) => setFormData({ ...formData, maturityDate: text })}
                                    placeholder="YYYY-MM-DD or epoch ms"
                                />
                            </View>
                        </>
                    ) : null}

                    {formData.type === 'property' ? (
                        <>
                            <View style={styles.formField}>
                                <Text style={styles.fieldLabel}>Property Address</Text>
                                <TextInput
                                    style={styles.fieldInput}
                                    value={formData.propertyAddress}
                                    onChangeText={(text) => setFormData({ ...formData, propertyAddress: text })}
                                    placeholder="Address"
                                />
                            </View>
                            <View style={styles.formField}>
                                <Text style={styles.fieldLabel}>Area (sq ft)</Text>
                                <TextInput
                                    style={styles.fieldInput}
                                    value={formData.propertyAreaSqFt}
                                    onChangeText={(text) => setFormData({ ...formData, propertyAreaSqFt: text })}
                                    placeholder="e.g. 1200"
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={styles.formField}>
                                <Text style={styles.fieldLabel}>Monthly Rental Income</Text>
                                <TextInput
                                    style={styles.fieldInput}
                                    value={formData.rentalIncome}
                                    onChangeText={(text) => setFormData({ ...formData, rentalIncome: text })}
                                    placeholder="0.00"
                                    keyboardType="numeric"
                                />
                            </View>
                        </>
                    ) : null}

                    <View style={styles.formField}>
                        <Text style={styles.fieldLabel}>Current Value</Text>
                        <TextInput
                            style={styles.fieldInput}
                            value={formData.currentValue}
                            onChangeText={(text) => setFormData({ ...formData, currentValue: text })}
                            placeholder="0.00"
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.formField}>
                        <Text style={styles.fieldLabel}>Description</Text>
                        <TextInput
                            style={[styles.fieldInput, styles.textArea]}
                            value={formData.description}
                            onChangeText={(text) => setFormData({ ...formData, description: text })}
                            placeholder="Notes"
                            multiline
                        />
                    </View>
                </ScrollView>
            </View>
            </View>
        </Modal>
    )
}

/** Props for each investment card */
interface InvestmentCardProps {
    investment: Investment
    onEdit: (inv: Investment) => void
    onDelete: (id: string) => void
}

/** Card UI for showing investment */
function InvestmentCard({ investment, onEdit, onDelete }: InvestmentCardProps) {
    const profit = investment.currentValue - investment.investedAmount
    const isProfit = profit >= 0
    const changePercent =
        investment.investedAmount > 0
            ? ((profit / investment.investedAmount) * 100).toFixed(1)
            : '0.0'

    const handleLongPress = () => {
        Alert.alert('Investment Options', `What would you like to do with ${investment.name}?`, [
            { text: 'Edit', onPress: () => onEdit(investment) },
            { text: 'Delete', onPress: handleDelete, style: 'destructive' },
            { text: 'Cancel', style: 'cancel' },
        ])
    }

    const handleDelete = () => {
        Alert.alert('Delete Investment', `Are you sure you want to delete ${investment.name}?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', onPress: () => onDelete(investment.id), style: 'destructive' },
        ])
    }

    return (
        <TouchableOpacity
            style={styles.investmentCard}
            onPress={() => {
                const details = [
                    `Type: ${getTypeLabel(investment.type)}`,
                    investment.symbol ? `Symbol: ${investment.symbol}` : null,
                    investment.institutionName
                        ? `Institution: ${investment.institutionName}`
                        : null,
                    investment.interestRate
                        ? `Interest Rate: ${investment.interestRate}%`
                        : null,
                    investment.maturityDate
                        ? `Maturity: ${investment.maturityDate}`
                        : null,
                    investment.description ? `Notes: ${investment.description}` : null,
                ]
                    .filter(Boolean)
                    .join('\n')
                Alert.alert('Investment Details', details)
            }}
            onLongPress={handleLongPress}
        >
            <View style={styles.investmentHeader}>
                <View style={styles.investmentInfo}>
                    <Text style={styles.investmentName}>{investment.name}</Text>
                    {investment.symbol ? (
                        <Text style={styles.investmentSymbol}>{investment.symbol}</Text>
                    ) : null}
                    <View style={styles.typeBadge}>
                        <Text style={styles.typeBadgeText}>{getTypeLabel(investment.type)}</Text>
                    </View>
                </View>
                <View style={styles.investmentHeaderRight}>
                    <View style={styles.investmentValues}>
                        <Text style={styles.currentValue}>{formatCurrency(investment.currentValue)}</Text>
                        <Text style={[styles.changeText, { color: isProfit ? '#10B981' : '#EF4444' }]}>
                            {isProfit ? '+' : ''}{profit.toFixed(2)} ({changePercent}%)
                        </Text>
                    </View>
                    <View style={styles.cardActions}>
                        <TouchableOpacity onPress={() => onEdit(investment)} style={styles.cardActionBtn}>
                            <Ionicons name="create-outline" size={18} color="#6B7280" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleDelete} style={styles.cardActionBtn}>
                            <Ionicons name="trash-outline" size={18} color="#EF4444" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            <View style={styles.investmentFooter}>
                <Text style={styles.investedLabel}>Invested: {formatCurrency(investment.investedAmount)}</Text>
                <Text style={[styles.profitLoss, { color: isProfit ? '#10B981' : '#EF4444' }]}>
                    {isProfit ? 'Profit' : 'Loss'} {formatCurrency(Math.abs(profit))}
                </Text>
            </View>
        </TouchableOpacity>
    )
}

/** Main screen for portfolio */
export default function InvestmentsScreen() {
    const [selectedTab, setSelectedTab] = useState<'portfolio' | 'watchlist' | 'research'>(
        'portfolio'
    )
    const [showInvestmentForm, setShowInvestmentForm] = useState(false)
    const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null)
    const [selectedFilter, setSelectedFilter] = useState<'all' | Investment['type']>('all')

    const { investments, createInvestment, editInvestment, removeInvestment } =
        useFinanceData()

    const totalInvested = investments.reduce((sum, inv) => sum + inv.investedAmount, 0)
    const totalCurrent = investments.reduce((sum, inv) => sum + inv.currentValue, 0)
    const totalProfit = totalCurrent - totalInvested
    const totalReturn =
        totalInvested > 0 ? ((totalProfit / totalInvested) * 100).toFixed(2) : '0.00'

    const visibleInvestments = selectedFilter === 'all'
        ? investments
        : investments.filter((i) => i.type === selectedFilter)

    const handleAddInvestment = () => {
        setEditingInvestment(null)
        setShowInvestmentForm(true)
    }

    const handleEditInvestment = (investment: Investment) => {
        setEditingInvestment(investment)
        setShowInvestmentForm(true)
    }

    const handleDeleteInvestment = async (investmentId: string) => {
        try {
            await removeInvestment(investmentId)
        } catch {
            Alert.alert('Error', 'Failed to delete investment')
        }
    }

    const handleSaveInvestment = async (investmentData: Omit<Investment, 'id' | 'createdAt'>) => {
        try {
            if (editingInvestment) {
                await editInvestment(editingInvestment.id, investmentData)
            } else {
                await createInvestment(investmentData)
            }
            setShowInvestmentForm(false)
            setEditingInvestment(null)
        } catch {
            Alert.alert('Error', 'Failed to save investment')
        }
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.summaryContainer}>
                <Text style={styles.summaryTitle}>Portfolio Summary</Text>
                <Text style={styles.portfolioValue}>{formatCurrency(totalCurrent)}</Text>
                <View style={styles.summaryRow}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Invested</Text>
                        <Text style={styles.summaryValue}>{formatCurrency(totalInvested)}</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Profit</Text>
                        <Text style={[styles.summaryValue, { color: totalProfit >= 0 ? '#10B981' : '#EF4444' }]}>
                            {formatCurrency(totalProfit)} ({totalReturn}%)
                        </Text>
                    </View>
                </View>
            </View>


                <View style={styles.portfolioSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Investments</Text>
                        <TouchableOpacity style={styles.addButton} onPress={handleAddInvestment}>
                            <Ionicons name="add-circle-outline" size={24} color="#6366F1" />
                        </TouchableOpacity>
                    </View>

                    {/* Filter bar */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filterBar}
                    >
                        <TouchableOpacity
                            style={[styles.chip, selectedFilter === 'all' && styles.chipActive]}
                            onPress={() => setSelectedFilter('all')}
                        >
                            <Text style={[styles.chipText, selectedFilter === 'all' && styles.chipTextActive]}>All</Text>
                        </TouchableOpacity>
                        {INVESTMENT_TYPES.map((t) => (
                            <TouchableOpacity
                                key={t.value}
                                style={[styles.chip, selectedFilter === (t.value as Investment['type']) && styles.chipActive]}
                                onPress={() => setSelectedFilter(t.value as Investment['type'])}
                            >
                                <Text style={[styles.chipText, selectedFilter === (t.value as Investment['type']) && styles.chipTextActive]}>
                                    {t.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {visibleInvestments.length === 0 ? (
                        <View style={styles.emptyInvestments}>
                            <Ionicons name="bar-chart-outline" size={32} color="#9CA3AF" />
                            <Text style={styles.emptyInvestmentsText}>No investments yet</Text>
                            <Text style={styles.emptyInvestmentsSubtext}>
                                Start tracking your investments to see performance here.
                            </Text>
                            <TouchableOpacity style={styles.addWatchlistButton} onPress={handleAddInvestment}>
                                <Text style={styles.addWatchlistText}>Add Investment</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View>
                            {visibleInvestments.map((inv) => (
                                <InvestmentCard
                                    key={inv.id}
                                    investment={inv}
                                    onEdit={handleEditInvestment}
                                    onDelete={handleDeleteInvestment}
                                />
                            ))}
                        </View>
                    )}
                </View>


            <InvestmentFormModal
                visible={showInvestmentForm}
                onClose={() => setShowInvestmentForm(false)}
                onSave={handleSaveInvestment}
                editingInvestment={editingInvestment}
            />
        </ScrollView>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    summaryContainer: {
        backgroundColor: '#FFFFFF',
        padding: 24,
        marginBottom: 16,
    },
    summaryTitle: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 8,
    },
    portfolioValue: {
        fontSize: 32,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    summaryItem: {
        flex: 1,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        marginBottom: 16,
    },
    tab: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: '#E5E7EB',
    },
    activeTab: {
        borderBottomColor: '#6366F1',
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
    },
    activeTabText: {
        color: '#6366F1',
    },
    portfolioSection: {
        paddingHorizontal: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
    },
    addButton: {
        padding: 4,
    },
    investmentCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    investmentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    investmentInfo: {
        flex: 1,
    },
    investmentName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    investmentSymbol: {
        fontSize: 14,
        color: '#6B7280',
    },
    investmentValues: {
        alignItems: 'flex-end',
    },
    investmentHeaderRight: {
        alignItems: 'flex-end',
        gap: 8,
    },
    currentValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 4,
    },
    changeText: {
        fontSize: 14,
        fontWeight: '600',
    },
    cardActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    cardActionBtn: {
        padding: 6,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },
    investmentFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    investedLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    profitLoss: {
        fontSize: 14,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        padding: 48,
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        borderRadius: 12,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
    },
    typeBadge: {
        marginTop: 6,
        alignSelf: 'flex-start',
        backgroundColor: '#EEF2FF',
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    typeBadgeText: {
        color: '#4338CA',
        fontWeight: '700',
        fontSize: 12,
    },
    filterBar: {
        paddingVertical: 8,
        gap: 8,
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
    addWatchlistButton: {
        marginTop:24,
        backgroundColor: '#6366F1',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    addWatchlistText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalSheet: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 16,
        width: '100%',
        height: '90%',
    },
    quickActions: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 24,
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#10B981',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    sellButton: {
        backgroundColor: '#EF4444',
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    // Modal styles
    modalContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
    },
    modalCancelButton: {
        fontSize: 16,
        color: '#6B7280',
    },
    modalSaveButton: {
        fontSize: 16,
        color: '#6366F1',
        fontWeight: '600',
    },
    formContainer: {
        flex: 1,
        padding: 16,
    },
    formField: {
        marginBottom: 16,
    },
    fieldLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 8,
    },
    fieldInput: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#FFFFFF',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    // Empty investments state
    emptyInvestments: {
        alignItems: 'center',
        padding: 48,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginVertical: 16,
    },
    emptyInvestmentsText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyInvestmentsSubtext: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
    },
})
