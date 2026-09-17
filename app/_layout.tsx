import { SplashScreenController } from "@/components/splash";
import { queryClient } from "@/constants/query";
import { useApiUrlStore } from "@/stores/api-url.store";
import { SessionProvider, useSession } from "@/stores/auth.store";
import * as Sentry from "@sentry/react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import Toast from "react-native-toast-message";
Sentry.init({
  dsn: "https://db4c2b3e4c28ab5e373dad6c73917a13@o4510540277612544.ingest.de.sentry.io/4512067805773904",

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});
export default Sentry.wrap(function Layout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <InnerLayout />
      </SessionProvider>
    </QueryClientProvider>
  );
});

const InnerLayout = () => {
  const session = useSession();
  const apiUrl = useApiUrlStore((s) => s.apiUrl);
  const isApiUrlLoaded = useApiUrlStore((s) => s.isLoaded);
  const initApiUrl = useApiUrlStore((s) => s.initApiUrl);

  useEffect(() => {
    initApiUrl();
  }, [initApiUrl]);

  const isReady = isApiUrlLoaded && !session.isLoading;

  return (
    <>
      <StatusBar style="light" />
      <SplashScreenController />
      {isReady ? (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Protected guard={!apiUrl}>
            <Stack.Screen name="onboarding" />
          </Stack.Protected>
          <Stack.Protected guard={!!session.user}>
            <Stack.Screen name="(app)/(drawer)" />
          </Stack.Protected>
          {/* <Stack.Protected guard={!!session.user}>
            <Stack.Screen name="(driver)/index" />
          </Stack.Protected> */}

          <Stack.Protected guard={!!apiUrl && !session.user}>
            <Stack.Screen name="sign-in" />
          </Stack.Protected>
        </Stack>
      ) : null}
      <Toast visibilityTime={2000} />
    </>
  );
};
