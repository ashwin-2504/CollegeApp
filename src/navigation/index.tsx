import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeScreen } from '../screens/HomeScreen';
import { ActionListScreen } from '../screens/ActionListScreen';
import { AddActionScreen } from '../screens/AddActionScreen';
import { TimetableSetupScreen } from '../screens/TimetableSetupScreen';
import { colors, typography } from '../constants/theme';
import { Home, ListTodo, Calendar, Plus } from 'lucide-react-native';
import { View, Text } from 'react-native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Placeholder for Timetable Screen (Module 2) - Not needed in Tab if accessed via Home, 
// BUT spec says "College Timetable Calendar – for passive, real-time academic context".
// The Home Screen IS the main view for this. 
// "Timetable" tab might show the full list or be the Setup entry point?
// "No calendar grid... The user should always know: What lecture is happening now / next".
// "This setup happens once per semester". 
// "Runtime Behavior... Displays this in: App home view".
// So no separate Tab needed necessarily, but I put one as a placeholder.
// I'll keep the Timetable tab as a "Full Schedule View" (read-only list) for v2 or just remove it for MVP to stick to "No feature overlap".
// Spec: "No calendar grid".
// So I will remove the Timetable Tab for MVP to be strict.
// Access setup via Home Screen.

const TabNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          tabBarLabel: 'Home'
        }}
      />
      <Tab.Screen 
        name="Plan" 
        component={ActionListScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <ListTodo color={color} size={size} />,
          tabBarLabel: 'Plan'
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen 
            name="AddAction" 
            component={AddActionScreen} 
            options={{ 
                presentation: 'modal',
                animation: 'slide_from_bottom' 
            }}
        />
        <Stack.Screen 
            name="TimetableSetup" 
            component={TimetableSetupScreen} 
            options={{ 
                presentation: 'modal',
                animation: 'slide_from_bottom' 
            }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
