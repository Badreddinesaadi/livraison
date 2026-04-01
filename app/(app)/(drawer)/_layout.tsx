import { AppDrawerContent } from "@/components/AppDrawerContent";
import { Drawer } from "expo-router/drawer";

export default function Layout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerType: "front",
        drawerStyle: {
          width: 300,
          backgroundColor: "#F8FAFC",
        },
      }}
      drawerContent={(props) => <AppDrawerContent {...props} />}
    />
  );
}
