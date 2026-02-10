import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation';
import { initDatabase } from './src/database/db';
import { View, ActivityIndicator } from 'react-native';
import { colors } from './src/constants/theme';
import { registerForPushNotificationsAsync } from './src/services/notifications';

export default function App() {
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    const setup = async () => {
        await initDatabase();
        await registerForPushNotificationsAsync();
        setDbInitialized(true);
    };
    setup();
  }, []);

  if (!dbInitialized) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={colors.background} />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
