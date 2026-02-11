import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SQLiteProvider } from "expo-sqlite";
import { Suspense, useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";

import { Colors, DB_NAME } from "@/lib/constants";
import { initializeDatabase } from "@/lib/db/database";
import { configureNotifications } from "@/lib/notifications/scheduler";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Configure notifications once on app start
  useEffect(() => {
    configureNotifications();
  }, []);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function LoadingFallback() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.dark.background,
      }}
    >
      <ActivityIndicator size="large" color={Colors.dark.primary} />
    </View>
  );
}

function RootLayoutNav() {
  // Dark theme customized with our colors
  const theme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: Colors.dark.background,
      card: Colors.dark.surface,
      text: Colors.dark.text,
      border: Colors.dark.border,
      primary: Colors.dark.primary,
    },
  };

  return (
    <ThemeProvider value={theme}>
      {/* Loading gate: SQLiteProvider renders null/fallback until DB is ready */}
      <Suspense fallback={<LoadingFallback />}>
        <SQLiteProvider
          databaseName={DB_NAME}
          onInit={initializeDatabase}
          useSuspense
        >
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="task/create"
              options={{
                title: "New Task",
                presentation: "modal",
                headerStyle: { backgroundColor: Colors.dark.surface },
                headerTintColor: Colors.dark.text,
              }}
            />
            <Stack.Screen
              name="task/[id]"
              options={{
                title: "Task Details",
                headerStyle: { backgroundColor: Colors.dark.surface },
                headerTintColor: Colors.dark.text,
              }}
            />
            <Stack.Screen
              name="timetable/setup"
              options={{
                title: "Setup Timetable",
                presentation: "modal",
                headerStyle: { backgroundColor: Colors.dark.surface },
                headerTintColor: Colors.dark.text,
              }}
            />
          </Stack>
        </SQLiteProvider>
      </Suspense>
    </ThemeProvider>
  );
}
