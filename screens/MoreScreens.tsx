// screens/MoreScreen.js
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import appConfig from "../app.json";
import {useNavigation} from "@react-navigation/native"; // If navigation is needed, use inside component

const menuItems = [
    {
        id: '1',
        title: 'Reports & Analytics',
        subtitle: 'View detailed financial reports',
        icon: 'analytics',
        color: '#10B981',
        onPress: () => Alert.alert('Reports', 'Navigate to Reports screen'),
    },
    {
        id: '2',
        title: 'Categories',
        subtitle: 'Manage transaction categories',
        icon: 'grid',
        color: '#F59E0B',
        onPress: () => Alert.alert('Categories', 'Navigate to Categories screen'),
    },
    // {
    //     id: '3',
    //     title: 'Recurring Payments',
    //     subtitle: 'Set up automatic payments',
    //     icon: 'repeat',
    //     color: '#8B5CF6',
    //     onPress: () => Alert.alert('Recurring', 'Navigate to Recurring Payments'),
    // },
    // {
    //     id: '4',
    //     title: 'Bill Reminders',
    //     subtitle: 'Never miss a payment',
    //     icon: 'alarm',
    //     color: '#EF4444',
    //     onPress: () => Alert.alert('Reminders', 'Navigate to Bill Reminders'),
    // },
    // {
    //     id: '5',
    //     title: 'Export Data',
    //     subtitle: 'Download your financial data',
    //     icon: 'download',
    //     color: '#06B6D4',
    //     onPress: () => Alert.alert('Export', 'Export functionality'),
    // },
    // {
    //     id: '6',
    //     title: 'Security & Privacy',
    //     subtitle: 'Manage your account security',
    //     icon: 'shield-checkmark',
    //     color: '#DC2626',
    //     onPress: () => Alert.alert('Security', 'Navigate to Security settings'),
    // },
    // {
    //     id: '7',
    //     title: 'Notifications',
    //     subtitle: 'Configure app notifications',
    //     icon: 'notifications',
    //     color: '#7C3AED',
    //     onPress: () => Alert.alert('Notifications', 'Navigate to Notification settings'),
    // },
    // {
    //     id: '8',
    //     title: 'Help & Support',
    //     subtitle: 'Get help and contact support',
    //     icon: 'help-circle',
    //     color: '#059669',
    //     onPress: () => Alert.alert('Help', 'Navigate to Help center'),
    // },
];

const profileItems = [
    {
        id: 'profile',
        title: 'Profile Settings',
        subtitle: 'Update your personal information',
        icon: 'person-circle',
        color: '#6366F1',
        onPress: () => Alert.alert('Profile', 'Navigate to Profile settings'),
    },
    {
        id: 'preferences',
        title: 'App Preferences',
        subtitle: 'Customize app behavior',
        icon: 'settings',
        color: '#6B7280',
        onPress: () => Alert.alert('Preferences', 'Navigate to App preferences'),
    },
];

function MenuItem({ item }: { item: any }) {
    return (
        <TouchableOpacity style={styles.menuItem} onPress={item.onPress}>
            <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon} size={24} color="#FFFFFF" />
            </View>
            <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
    );
}

export default function MoreScreen() {
    // If you need navigation, uncomment the import above and use the hook here:
    const navigation = useNavigation();
    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* User Profile Section */}
            <View style={styles.profileSection}>
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        <Ionicons name="person" size={32} color="#6366F1" />
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>John Doe</Text>
                        <Text style={styles.profileEmail}>john.doe@email.com</Text>
                    </View>
                </View>
            </View>

            {/* Profile Settings */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account</Text>
                {profileItems.map((item) => (
                    <MenuItem key={item.id} item={item} />
                ))}
            </View>

            {/* Tools & Features */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tools & Features</Text>
                {menuItems.map((item) => (
                    <MenuItem key={item.id} item={item} />
                ))}
            </View>

            {/* App Info */}
            <View style={styles.appInfo}>
                <TouchableOpacity onPress={() => navigation.navigate('VersionLogScreen' as never)}>
                    <Text style={styles.appVersion}>
                        Version {appConfig.expo.version}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => Alert.alert('About', 'Finance App v1.0.0')}>
                    <Text style={styles.aboutLink}>About Finance App</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    profileSection: {
        backgroundColor: '#FFFFFF',
        marginBottom: 16,
        paddingVertical: 24,
        paddingHorizontal: 20,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 4,
    },
    profileEmail: {
        fontSize: 14,
        color: '#6B7280',
    },
    section: {
        backgroundColor: '#FFFFFF',
        marginBottom: 16,
        paddingVertical: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#F9FAFB',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    menuContent: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 2,
    },
    menuSubtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    appInfo: {
        alignItems: 'center',
        paddingVertical: 24,
        paddingHorizontal: 20,
    },
    appVersion: {
        fontSize: 14,
        color: '#9CA3AF',
        marginBottom: 8,
    },
    aboutLink: {
        fontSize: 14,
        color: '#6366F1',
        fontWeight: '600',
    },
});