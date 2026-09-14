import { useSession } from "@/stores/auth.store";
import { useApiUrlStore } from "@/stores/api-url.store";
import { SplashScreen } from "expo-router";

SplashScreen.preventAutoHideAsync();

export function SplashScreenController() {
  const { isLoading } = useSession();
  const isApiUrlLoaded = useApiUrlStore((s) => s.isLoaded);

  if (!isLoading && isApiUrlLoaded) {
    SplashScreen.hide();
  }

  return null;
}