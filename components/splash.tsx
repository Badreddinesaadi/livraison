import { useApiUrlStore } from "@/stores/api-url.store";
import { useSession } from "@/stores/auth.store";
import { SplashScreen } from "expo-router";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

export function SplashScreenController() {
  const { isLoading } = useSession();
  const isApiUrlLoaded = useApiUrlStore((s) => s.isLoaded);

  useEffect(() => {
    if (isApiUrlLoaded && !isLoading) {
      SplashScreen.hide();
    }
  }, [isApiUrlLoaded, isLoading]);

  return null;
}