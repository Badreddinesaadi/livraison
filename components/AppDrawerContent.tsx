import {
  canAccessProjetModule,
  canAccessRetourModule,
  canAccessRotationModule,
  canAccessVoyageModule,
} from "@/constants/permissions";
import { Colors } from "@/constants/theme";
import { useSession } from "@/stores/auth.store";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import { usePathname, useRouter } from "expo-router";
import { type ComponentProps } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type DrawerIconName = ComponentProps<typeof MaterialCommunityIcons>["name"];
type DrawerRoute =
  | "/voyages"
  | "/returns"
  | "/rotation-chauffeur"
  | "/projet-locations";

type DrawerMenuItem = {
  label: string;
  route: DrawerRoute;
  icon: DrawerIconName;
};

const DRAWER_ITEMS: DrawerMenuItem[] = [
  { label: "Voyages", route: "/voyages", icon: "truck-fast" },
  { label: "Retours", route: "/returns", icon: "backup-restore" },
  {
    label: "Rotation chauffeur",
    route: "/rotation-chauffeur",
    icon: "cached",
  },
  {
    label: "Projet locations",
    route: "/projet-locations",
    icon: "map-marker-radius",
  },
];

function isRouteActive(pathname: string, route: DrawerRoute) {
  const normalizedRoute = route.endsWith("/index")
    ? route.slice(0, -"/index".length)
    : route;

  return (
    pathname === route ||
    pathname === normalizedRoute ||
    pathname.startsWith(`${normalizedRoute}/`)
  );
}

export function AppDrawerContent(props: DrawerContentComponentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { user, signOut } = useSession();
  const canShowVoyageModule = canAccessVoyageModule(user);
  const canShowRetourModule = canAccessRetourModule(user);
  const canShowProjetModule = canAccessProjetModule(user);
  const canShowRotationModule = canAccessRotationModule(user);

  const handleNavigate = (route: DrawerRoute) => {
    router.navigate(route);
    props.navigation.closeDrawer();
  };

  const handleSignOut = () => {
    Alert.alert(
      "Déconnexion",
      "Voulez-vous vraiment vous déconnecter ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Oui",
          style: "destructive",
          onPress: signOut,
        },
      ],
      { cancelable: true },
    );
  };

  const initials = user?.name?.trim().charAt(0).toUpperCase() || "U";

  return (
    <View style={styles.container}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(insets.top, 14) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.name || "Utilisateur"}
            </Text>
            <Text style={styles.userRole} numberOfLines={1}>
              {user?.role || "user"}
            </Text>
          </View>
        </View>

        <View style={styles.itemsContainer}>
          {DRAWER_ITEMS.filter((item) => {
            if (item.route === "/voyages") {
              return canShowVoyageModule;
            }

            if (item.route === "/returns") {
              return canShowRetourModule;
            }

            if (item.route === "/projet-locations") {
              return canShowProjetModule;
            }

            if (item.route === "/rotation-chauffeur") {
              return canShowRotationModule;
            }

            return true;
          }).map((item) => {
            const isActive = isRouteActive(pathname, item.route);

            return (
              <Pressable
                key={item.route}
                onPress={() => handleNavigate(item.route)}
                style={({ pressed }) => [
                  styles.item,
                  isActive && styles.itemActive,
                  pressed && styles.itemPressed,
                ]}
              >
                <View
                  style={[styles.iconContainer, isActive && styles.iconActive]}
                >
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={20}
                    color={isActive ? Colors.light.primary : "#475569"}
                  />
                </View>

                <Text
                  style={[styles.itemLabel, isActive && styles.itemLabelActive]}
                >
                  {item.label}
                </Text>

                <MaterialIcons
                  name={isActive ? "radio-button-checked" : "chevron-right"}
                  size={18}
                  color={isActive ? Colors.light.primary : "#94a3b8"}
                />
              </Pressable>
            );
          })}
        </View>
      </DrawerContentScrollView>

      <View
        style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 14) }]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.signOutButton,
            pressed && styles.signOutButtonPressed,
          ]}
          onPress={handleSignOut}
        >
          <MaterialIcons name="logout" size={20} color="#B91C1C" />
          <Text style={styles.signOutText}>Se déconnecter</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  userCard: {
    backgroundColor: Colors.light.background,
    // borderRadius: 22,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    // borderWidth: 1,
    // borderColor: "#E2E8F0",
    // shadowColor: "#0F172A",
    // shadowOffset: { width: 0, height: 8 },
    // shadowOpacity: 0.06,
    // shadowRadius: 12,
    // elevation: 4,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(237, 86, 35, 0.14)",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.light.primary,
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  subtitle: {
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: "#64748B",
    fontWeight: "600",
  },
  userName: {
    marginTop: 3,
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  userRole: {
    marginTop: 4,
    alignSelf: "flex-start",
    backgroundColor: "#F1F5F9",
    color: "#334155",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  itemsContainer: {
    marginTop: 20,
    rowGap: 10,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: Colors.light.background,
  },
  itemActive: {
    borderColor: "rgba(237, 86, 35, 0.35)",
    backgroundColor: "rgba(237, 86, 35, 0.08)",
  },
  itemPressed: {
    opacity: 0.85,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
  },
  iconActive: {
    backgroundColor: "rgba(237, 86, 35, 0.15)",
  },
  itemLabel: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
  },
  itemLabelActive: {
    color: Colors.light.primary,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#CBD5E1",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    // borderRadius: 14,
    // borderWidth: 1,
    // borderColor: "#FECACA",
    backgroundColor: "#FFF1F2",
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  signOutButtonPressed: {
    opacity: 0.8,
  },
  signOutText: {
    marginLeft: 10,
    color: "#B91C1C",
    fontWeight: "700",
    fontSize: 15,
  },
});
