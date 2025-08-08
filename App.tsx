import React, {type JSX} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import DashboardScreen from './screens/DashboardScreen';
import TransactionsScreen from './screens/TransactionsScreen';
import WalletsScreen from './screens/WalletsScreen';
import BudgetsScreen from './screens/BudgetsScreen';
import SavingsScreen from './screens/SavingsScreen';
import LoansScreen from './screens/LoansScreen';
import Header from "./components/header";

const Tab = createBottomTabNavigator();

type TabIconName = 
  | 'home' | 'home-outline'
  | 'list' | 'list-outline'
  | 'wallet' | 'wallet-outline'
  | 'pie-chart' | 'pie-chart-outline'
  | 'trending-up' | 'trending-up-outline'
  | 'people' | 'people-outline';

export default function App(): JSX.Element {
  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#6366F1" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: TabIconName;

            if (route.name === 'Dashboard') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Transactions') {
              iconName = focused ? 'list' : 'list-outline';
            } else if (route.name === 'Wallets') {
              iconName = focused ? 'wallet' : 'wallet-outline';
            } else if (route.name === 'Budgets') {
              iconName = focused ? 'pie-chart' : 'pie-chart-outline';
            } else if (route.name === 'Savings') {
              iconName = focused ? 'trending-up' : 'trending-up-outline';
            } else if (route.name === 'Loans') {
              iconName = focused ? 'people' : 'people-outline';
            } else {
              iconName = 'home-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#6366F1',
          tabBarInactiveTintColor: '#9CA3AF',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#E5E7EB',
            paddingBottom: 8,
            paddingTop: 8,
            height: 70,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
          headerStyle: {
            backgroundColor: '#c5c6ff',
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
        })}
      >
        <Tab.Screen 
          name="Dashboard" 
          component={DashboardScreen}
          options={{ headerTitle: () => <Header title="Dashboard" /> }}
        />
        <Tab.Screen 
          name="Transactions" 
          component={TransactionsScreen}
          options={{ headerTitle: () => <Header title="Transactions" /> }}
        />
        <Tab.Screen 
          name="Wallets" 
          component={WalletsScreen}
          options={{ headerTitle: () => <Header title="Wallets" /> }}
        />
        <Tab.Screen 
          name="Budgets" 
          component={BudgetsScreen}
          options={{ headerTitle: () => <Header title="Budgets" /> }}
        />
        <Tab.Screen 
          name="Savings" 
          component={SavingsScreen}
          options={{ headerTitle: () => <Header title="Savings" /> }}
        />
        <Tab.Screen 
          name="Loans" 
          component={LoansScreen}
          options={{ headerTitle: () => <Header title="Loans" /> }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

