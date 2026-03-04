import { Tabs } from 'expo-router';
import React from 'react';
import { Colors } from '@/constants/Colors';
import { Package } from 'lucide-react-native';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors.primary,
                headerShown: false,
            }}>
            <Tabs.Screen
                name="store"
                options={{
                    title: 'Store',
                    tabBarIcon: ({ color }) => <Package size={28} color={color} />,
                }}
            />
        </Tabs>
    );
}
