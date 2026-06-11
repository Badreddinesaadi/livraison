import {
  canAccessDemandeTransfertModule,
  canAccessProjetModule,
  canAccessRapportQualiteModule,
  canAccessRetourModule,
  canAccessRotationModule,
  canAccessVoyageModule,
} from "@/constants/permissions";
import { PRIMARY } from "@/constants/theme";
import { useSession } from "@/stores/auth.store";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useNavigation, useRouter } from "expo-router";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type User = ReturnType<typeof useSession>["user"];

interface ModuleItem {
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  route:
    | "/voyages"
    | "/returns"
    | "/quality-reports"
    | "/rotation-chauffeur"
    | "/projet-locations"
    | "/demande-transferts";
  canAccess: (user: User) => boolean;
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { user } = useSession();

  const toggleMenu = () =>
    navigation.dispatch({ type: "OPEN_DRAWER" } as never);

  const MODULES: ModuleItem[] = [
    {
      label: "Voyages",
      icon: "truck-fast",
      route: "/voyages",
      canAccess: canAccessVoyageModule,
    },
    {
      label: "Retours",
      icon: "backup-restore",
      route: "/returns",
      canAccess: canAccessRetourModule,
    },
    {
      label: "Rapports qualité",
      icon: "file-document-multiple-outline",
      route: "/quality-reports",
      canAccess: canAccessRapportQualiteModule,
    },
    {
      label: "Rotation chauffeur",
      icon: "cached",
      route: "/rotation-chauffeur",
      canAccess: canAccessRotationModule,
    },
    {
      label: "Lieux de projets",
      icon: "map-marker-radius",
      route: "/projet-locations",
      canAccess: canAccessProjetModule,
    },
    {
      label: "Demande de transfert",
      icon: "swap-horizontal",
      route: "/demande-transferts",
      canAccess: canAccessDemandeTransfertModule,
    },
  ];

  const accessibleModules = MODULES.filter((m) => m.canAccess(user));

  const renderCard = ({ item }: { item: ModuleItem }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => router.navigate(item.route)}
    >
      <View style={styles.iconCircle}>
        <MaterialCommunityIcons name={item.icon} size={26} color={PRIMARY} />
      </View>
      <Text style={styles.cardLabel} numberOfLines={2}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
          contentFit="contain"
        />
        <TouchableOpacity onPress={toggleMenu}>
          <MaterialIcons name="account-circle" size={34} color={PRIMARY} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={accessibleModules}
        renderItem={renderCard}
        keyExtractor={(item) => item.route}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.greeting}>
            <Text style={styles.greetingTitle}>
              Bonjour, {user?.name || "Utilisateur"}
            </Text>
            <Text style={styles.greetingSubtitle}>Choisissez un module</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 16,
  },
  header: {
    height: 64,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    width: 140,
    height: 45,
  },

  greeting: {
    marginTop: 20,
    marginBottom: 24,
  },
  greetingTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
  },
  greetingSubtitle: {
    marginTop: 6,
    fontSize: 15,
    color: "#64748B",
    fontWeight: "500",
  },
  grid: {
    paddingBottom: 24,
  },
  row: {
    gap: 12,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 22,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 140,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(237, 86, 35, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
    textAlign: "center",
  },
});
