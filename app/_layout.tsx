import { SplashScreenController } from "@/components/splash";
import { queryClient } from "@/constants/query";
import { SessionProvider, useSession } from "@/stores/auth.store";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import React from "react";
import Toast from "react-native-toast-message";
export default function Layout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <InnerLayout />
      </SessionProvider>
    </QueryClientProvider>
  );
}

const InnerLayout = () => {
  const session = useSession();

  return (
    <>
      <SplashScreenController />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!!session.user}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>

        <Stack.Protected guard={!session.user}>
          <Stack.Screen name="sign-in" />
        </Stack.Protected>
      </Stack>
      <Toast />
    </>
  );
};
