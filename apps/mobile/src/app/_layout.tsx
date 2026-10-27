import "../../global.css";

import { AuthProvider, useAuth } from "@/features/auth/context/authContext";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync().catch(() => {});

SplashScreen.setOptions({
  fade: true,
  duration: 300,
});

function StackLayout() {
  const { isAuthReady, isSignedIn } = useAuth();

  useEffect(() => {
    if (isAuthReady) {
      SplashScreen.hide();
    }
  }, [isAuthReady]);

  if (!isAuthReady) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isSignedIn}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="(modals)/profileModal"
          options={{ presentation: "modal" }}
        />
      </Stack.Protected>

      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="(auth)/welcome" />
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/register" />
        <Stack.Screen name="(auth)/forgotPassword" />
      </Stack.Protected>

      <Stack.Protected guard={false}>
        <Stack.Screen name="index" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StackLayout />
    </AuthProvider>
  );
}