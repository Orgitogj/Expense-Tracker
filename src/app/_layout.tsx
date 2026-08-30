import { Stack } from "expo-router";
import React, { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { AuthProvider, useAuth } from "@/context/authContext";
SplashScreen.preventAutoHideAsync().catch(() => {

});
SplashScreen.setOptions({ fade: true, duration: 300 });

const StackLayout = () => {
  const { isAuthReady } = useAuth();
  useEffect(() => {
    if (isAuthReady) SplashScreen.hide();
  }, [isAuthReady]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>

      <Stack.Screen name="(modals)/profileModal" options={{
         presentation:'modal',
      }}
      />
    </Stack>
  );
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <StackLayout />
    </AuthProvider>
  );
}