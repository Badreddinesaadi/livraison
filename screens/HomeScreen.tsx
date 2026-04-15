import { Button } from "@/components/ui/button";
import { hasRapportQualitePermission } from "@/constants/permissions";
import { Colors } from "@/constants/theme";
import { useSession } from "@/stores/auth.store";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useNavigation, useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { user } = useSession();
  const canListQualityReports = hasRapportQualitePermission(user, "LIST");
  const toggleMenu = () =>
    navigation.dispatch({ type: "OPEN_DRAWER" } as never);

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
          contentFit="contain"
        />

        <View>
          <TouchableOpacity onPress={toggleMenu}>
            <MaterialIcons name="account-circle" size={32} color="#ED5623" />
          </TouchableOpacity>
        </View>
      </View>

      {/* CONTENT */}
      <View style={styles.content}>
        <Button
          preset="filled"
          text="Voyages"
          LeftAccessory={() => (
            <View>
              <MaterialCommunityIcons
                name="truck-fast"
                size={24}
                color={Colors.light.background}
              />
            </View>
          )}
          onPress={() => {
            router.navigate("/voyages");
          }}
        />
        <Button
          preset="filled"
          text="Retours chauffeur"
          LeftAccessory={() => (
            <View>
              <MaterialCommunityIcons
                name="backup-restore"
                size={24}
                color={Colors.light.background}
              />
            </View>
          )}
          onPress={() => {
            router.navigate("/returns");
          }}
        />
        {canListQualityReports && (
          <Button
            preset="filled"
            text="Rapports qualite"
            LeftAccessory={() => (
              <View>
                <MaterialCommunityIcons
                  name="file-document-multiple-outline"
                  size={24}
                  color={Colors.light.background}
                />
              </View>
            )}
            onPress={() => {
              router.navigate("/quality-reports" as any);
            }}
          />
        )}
        <Button
          preset="filled"
          text="Rotation chauffeur"
          LeftAccessory={() => (
            <View>
              <MaterialCommunityIcons
                name="cached"
                size={24}
                color={Colors.light.background}
              />
            </View>
          )}
          onPress={() => {
            router.navigate("/rotation-chauffeur");
          }}
        />
        <Button
          preset="filled"
          text="Lieux de projets"
          LeftAccessory={() => (
            <View>
              <MaterialCommunityIcons
                name="map-marker-radius"
                size={24}
                color={Colors.light.background}
              />
            </View>
          )}
          onPress={() => {
            router.navigate("/projet-locations");
          }}
        />
        {/* <Button
            preset="filled"
            text="Demarrez un nouvelle voyage"
            LeftAccessory={() => (
              <View>
                <MaterialCommunityIcons
                  name="truck-fast"
                  size={24}
                  color={Colors.light.background}
                />
              </View>
            )}
            onPress={() => {
              router.navigate("/voyages/create/chauffeur");
            }}
          /> */}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 14,
    backgroundColor: "white",
  },

  header: {
    height: 70,
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },

  logo: {
    width: 140,
    height: 45,
  },

  menu: {
    position: "absolute",
    top: 42,
    right: 0,
    width: 180,
    backgroundColor: "#ED5623",
    borderRadius: 10,
    paddingVertical: 6,
    elevation: 6,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
  },

  menuText: {
    color: "white",
    marginLeft: 10,
    fontSize: 15,
    fontWeight: "600",
    textOverflow: "ellipsis",
    overflow: "hidden",
    maxWidth: 100,
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginHorizontal: 10,
  },
  content: {
    flex: 1,
    rowGap: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  item: {
    fontSize: 26,
    fontWeight: "600",
    color: "white",
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
  },
});
