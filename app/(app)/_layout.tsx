import { Stack } from "expo-router";

export default function StackLayout() {
  return (
    <Stack
      screenOptions={{ animation: "fade_from_bottom", headerShown: false }}
    />
  );
}
