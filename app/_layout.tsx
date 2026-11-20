import OfflineNotice from "@/components/OfflineNotice";
import { SplashScreenController } from "@/components/splash";
import { queryClient } from "@/constants/query";
import { useApiUrlStore } from "@/stores/api-url.store";
import { SessionProvider, useSession } from "@/stores/auth.store";
import { initOfflineSync } from "@/stores/offline-sync.store";
import { setupOnlineManager } from "@/utils/offline/network";
import { queryPersister, shouldPersistQuery } from "@/utils/offline/persister";
import { useIsRestoring } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PostHogProvider } from "posthog-react-native";
import { useEffect } from "react";
import Toast from "react-native-toast-message";

setupOnlineManager();
export default function Layout() {
  return (
    <PostHogProvider
      projectToken={process.env.EXPO_PUBLIC_API_URL}
      options={{
        host: "https://us.i.posthog.com",

        // Enable session recording. Requires enabling in your project settings as well.
        // Default is false.
        enableSessionReplay: true,

        sessionReplayConfig: {
          // Whether text inputs are masked. Default is true.
          // Password inputs are always masked regardless
          maskAllTextInputs: true,

          // Whether images are masked. Default is true.
          maskAllImages: true,

          // Experimental screenshot settings (Android only, requires @posthog/react-native-plugin).
          // We recommend these values to balance performance and image quality.
          // Lower resolution and RGB_565 reduce capture time and memory use.

          // Scale each screenshot dimension from 0.1 to 1.0. Default is 1.0.
          // A scale of 0.5 captures one quarter of the pixels, with less image detail.
          screenshotScale: 0.5,

          // RGB_565 uses two bytes per pixel instead of four, with lower color precision
          // and no transparency. Transparent window regions appear black. Default is ARGB_8888.
          screenshotColorMode: "RGB_565",

          // WebP compression quality from 0 to 100. Default is 30.
          // Lower quality reduces payload size at the cost of image detail.
          screenshotCompressionQuality: 30,

          // Capture logs automatically. Default is true.
          // Android only (Native Logcat only)
          //
          // Support for remote configuration
          // in the [session replay settings](https://app.posthog.com/settings/project-replay#replay-log-capture)
          // requires SDK version 4.35.0 or higher.
          captureLog: true,

          // Whether network requests are captured in recordings. Default is true
          // Only metric-like data like speed, size, and response code are captured.
          // No data is captured from the request or response body.
          // iOS only
          //
          // Support for remote configuration
          // in the [session replay settings](https://app.posthog.com/settings/project-replay#replay-network)
          // requires SDK version 4.35.0 or higher.
          captureNetworkTelemetry: true,

          // Sample rate for session recordings. A value between 0.0 and 1.0.
          // 1.0 means 100% of sessions will be recorded. 0.5 means 50%, and so on.
          // Local config has precedence over remote config when both are set.
          // Default is undefined (all sessions are recorded).
          sampleRate: undefined,

          // Throttling delay used to reduce the number of snapshots captured
          // and reduce performance impact. Default is 1000ms
          throttleDelayMs: 1000,
        },
      }}
    >
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister: queryPersister,
          maxAge: 1000 * 60 * 60 * 24,
          dehydrateOptions: {
            shouldDehydrateQuery: (query) => shouldPersistQuery(query.queryKey),
          },
        }}
      >
        <SessionProvider>
          <InnerLayout />
        </SessionProvider>
      </PersistQueryClientProvider>
    </PostHogProvider>
  );
}

const InnerLayout = () => {
  const session = useSession();
  const apiUrl = useApiUrlStore((s) => s.apiUrl);
  const isApiUrlLoaded = useApiUrlStore((s) => s.isLoaded);
  const initApiUrl = useApiUrlStore((s) => s.initApiUrl);
  const isRestoring = useIsRestoring();

  useEffect(() => {
    initApiUrl();
  }, [initApiUrl]);

  useEffect(() => {
    initOfflineSync();
  }, []);

  const isReady = isApiUrlLoaded && !session.isLoading && !isRestoring;

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
      <OfflineNotice />
      <Toast visibilityTime={2000} />
    </>
  );
};
