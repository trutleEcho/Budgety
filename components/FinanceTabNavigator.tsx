// navigation/FinanceTabNavigator.js
import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { View, StyleSheet } from 'react-native';

// Import your existing screens
import TransactionsScreen from '../screens/TransactionsScreen';
import WalletsScreen from '../screens/WalletsScreen';
import BudgetsScreen from '../screens/BudgetsScreen';
import SavingsScreen from "../screens/SavingsScreen";

const TopTab = createMaterialTopTabNavigator();

export default function FinanceTabNavigator() {
    return (
        <View style={styles.container}>
            <TopTab.Navigator
                screenOptions={{
                    tabBarStyle: {
                        backgroundColor: '#6366F1',
                        elevation: 0,
                        shadowOpacity: 0,
                    },
                    tabBarActiveTintColor: '#FFFFFF',
                    tabBarInactiveTintColor: '#C7D2FE',
                    tabBarIndicatorStyle: {
                        backgroundColor: '#FFFFFF',
                        height: 3,
                    },
                    tabBarLabelStyle: {
                        fontSize: 14,
                        paddingRight:10,
                        paddingLeft:10,
                        fontWeight: '600',
                        textTransform: 'none',
                    },
                    tabBarScrollEnabled:true,
                }}
            >
                <TopTab.Screen
                    name="Transactions"
                    component={TransactionsScreen}
                />
                <TopTab.Screen
                    name="Wallets"
                    component={WalletsScreen}
                />
                <TopTab.Screen
                    name="Budgets"
                    component={BudgetsScreen}
                />
                <TopTab.Screen
                    name="Savings"
                    component={SavingsScreen}
                />
            </TopTab.Navigator>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#6366F1',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        backgroundColor: '#6366F1',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});