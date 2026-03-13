import { QueryClient } from "@tanstack/react-query";
import { Platform } from "react-native";
import Toast from "react-native-toast-message";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
    mutations: {
      onError: (error) => {
        Toast.show({
          type: "error",
          text1: "Erreur lors de la requête",
          text2:
            error instanceof Error ? error.message : "Une erreur est survenue",
        });
      },
    },
  },
});
export const apiUrl = process.env.EXPO_PUBLIC_API_URL;
// This code is only for TypeScript
declare global {
  interface Window {
    //@ts-ignore
    __TANSTACK_QUERY_CLIENT__: import("@tanstack/query-core").QueryClient;
  }
}

// This code is for all users

if (Platform.OS !== "web") {
  window.__TANSTACK_QUERY_CLIENT__ = queryClient;
}
