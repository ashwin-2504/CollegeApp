import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { PersonalActionManagerScreen } from './src/modules/actions/PersonalActionManagerScreen';
import { CollegeTimetableCalendarScreen } from './src/modules/timetable/CollegeTimetableCalendarScreen';
import { initializeOfflineStorage } from './src/storage/bootstrap';
import { configureNotifications } from './src/notifications/configureNotifications';

const Tab = createBottomTabNavigator();

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      await initializeOfflineStorage();
      await configureNotifications();
      setReady(true);
    };

    bootstrap();
  }, []);

  if (!ready) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Tab.Navigator
        initialRouteName="Personal Action Manager"
        screenOptions={{
          headerShown: true,
          tabBarLabelStyle: styles.tabLabel,
        }}
      >
        <Tab.Screen
          name="Personal Action Manager"
          component={PersonalActionManagerScreen}
        />
        <Tab.Screen
          name="College Timetable Calendar"
          component={CollegeTimetableCalendarScreen}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});
