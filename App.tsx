import React, { type JSX } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// Import main screens
import DashboardScreen from './screens/DashboardScreen';
import FinanceTabNavigator from './components/FinanceTabNavigator';
import GoalsTabNavigator from './components/GoalsTabNavigator';
import MoreScreen from './screens/MoreScreens';
import VersionLogScreen from './screens/VersionLogScreen';
import Header from "./components/header";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

type TabIconName =
    | 'home' | 'home-outline'
    | 'card' | 'card-outline'
    | 'trending-up' | 'trending-up-outline'
    | 'ellipsis-horizontal' | 'ellipsis-horizontal-outline';

// Finance Stack Navigator (contains Transactions, Wallets, Budgets)
function FinanceStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#6366F1',
                    elevation: 0,
                    shadowOpacity: 0,
                },
                headerTintColor: '#FFFFFF',
                headerTitleStyle: {
                    fontWeight: '700',
                    fontSize: 18,
                },
            }}
        >
            <Stack.Screen
                name="FinanceTabs"
                component={FinanceTabNavigator}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
}

// Goals Stack Navigator (contains Savings, Loans, Investments)
function GoalsStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#6366F1',
                    elevation: 0,
                    shadowOpacity: 0,
                },
                headerTintColor: '#FFFFFF',
                headerTitleStyle: {
                    fontWeight: '700',
                    fontSize: 18,
                },
            }}
        >
            <Stack.Screen
                name="GoalsTabs"
                component={GoalsTabNavigator}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
}

// More Stack Navigator (contains More home and Version Log)
function MoreStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#6366F1',
                    elevation: 0,
                    shadowOpacity: 0,
                },
                headerTintColor: '#FFFFFF',
                headerTitleStyle: {
                    fontWeight: '700',
                    fontSize: 18,
                },
            }}
        >
            <Stack.Screen
                name="MoreHome"
                component={MoreScreen}
                options={{ headerTitle: () => <Header title="More" /> }}
            />
            <Stack.Screen
                name="VersionLogScreen"
                component={VersionLogScreen}
                options={{ headerTitle: () => <Header title="Version Log" /> }}
            />
        </Stack.Navigator>
    );
}

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
                        } else if (route.name === 'Finance') {
                            iconName = focused ? 'card' : 'card-outline';
                        } else if (route.name === 'Goals') {
                            iconName = focused ? 'trending-up' : 'trending-up-outline';
                        } else if (route.name === 'More') {
                            iconName = focused ? 'ellipsis-horizontal' : 'ellipsis-horizontal-outline';
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
                        backgroundColor: '#6366F1',
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
                    name="Finance"
                    component={FinanceStack}
                    options={{ headerTitle: () => <Header title="Finance" /> }}
                />
                <Tab.Screen
                    name="Goals"
                    component={GoalsStack}
                    options={{ headerTitle: () => <Header title="Goals" /> }}
                />
                <Tab.Screen
                    name="More"
                    component={MoreStack}
                    options={{ headerShown: false }}
                />
            </Tab.Navigator>
        </NavigationContainer>
    );
}