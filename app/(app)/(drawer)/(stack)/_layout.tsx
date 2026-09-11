import { Stack } from "expo-router";

export default function StackLayout() {
  return <Stack screenOptions={{ animation: "flip", headerShown: false }} />;
}
