import React from 'react';
import { SafeAreaView, View, Image, Text, StyleSheet } from 'react-native';

export default function Header({ title }: { title: string }) {
    return (
        <SafeAreaView>
            <View style={styles.container}>
                <Image
                    source={require('../assets/BUDGET.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={styles.text}>{title}</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    logo: {
        width: 124,
        height: 64,
        marginRight: 8,
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
});
