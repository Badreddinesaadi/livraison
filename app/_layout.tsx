import Loader from "@/components/Loader";
import { SplashScreenController } from "@/components/splash";
import { queryClient } from "@/constants/query";
import { SessionProvider, useSession } from "@/stores/auth.store";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import React from "react";
import Toast from "react-native-toast-message";
export default function Layout() {
  const session = useSession();
  if (session.isLoading) {
    return <Loader />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <SplashScreenController />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Protected guard={!!session.user?.token}>
            <Stack.Screen name="(app)" />
          </Stack.Protected>

          <Stack.Protected guard={!session.user?.token}>
            <Stack.Screen name="sign-in" />
          </Stack.Protected>
        </Stack>
        <Toast />
      </SessionProvider>
    </QueryClientProvider>
  );
}
