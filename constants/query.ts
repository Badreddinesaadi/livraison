import { QueryClient } from "@tanstack/react-query";
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
          text1: "An error occurred",
          text2: error instanceof Error ? error.message : "Unknown error",
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
window.__TANSTACK_QUERY_CLIENT__ = queryClient;
