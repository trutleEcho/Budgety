// navigation/GoalsTabNavigator.js
import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { View, StyleSheet } from 'react-native';

// Import your existing screens
import LoansScreen from '../screens/LoansScreen';

// Import new screens for Goals section
import InvestmentsScreen from '../screens/InvestmentsScreen';

const TopTab = createMaterialTopTabNavigator();


export default function GoalsTabNavigator() {
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
                        fontWeight: '600',
                        textTransform: 'none',
                    },
                    tabBarScrollEnabled: true, // Enable scrolling if you add more tabs
                }}
            >
                <TopTab.Screen
                    name="Investments"
                    component={InvestmentsScreen}
                />
                <TopTab.Screen
                    name="Loans"
                    component={LoansScreen}
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
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerIcon: {
        marginRight: 16,
    },
});