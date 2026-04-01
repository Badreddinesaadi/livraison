import OfflineNotice from "@/components/OfflineNotice";
import { SplashScreenController } from "@/components/splash";
import { queryClient } from "@/constants/query";
import { SessionProvider, useSession } from "@/stores/auth.store";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
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
      <StatusBar style="dark" />
      <SplashScreenController />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!!session.user}>
          <Stack.Screen name="(app)/(drawer)" />
        </Stack.Protected>
        {/* <Stack.Protected guard={!!session.user}>
          <Stack.Screen name="(driver)/index" />
        </Stack.Protected> */}

        <Stack.Protected guard={!session.user}>
          <Stack.Screen name="sign-in" />
        </Stack.Protected>
      </Stack>
      <OfflineNotice />
      <Toast visibilityTime={2000} />
    </>
  );
};
