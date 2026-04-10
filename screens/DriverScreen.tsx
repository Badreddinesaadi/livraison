import { useSession } from "@/stores/auth.store";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function DriverScreen() {
  const [menuVisible, setMenuVisible] = useState(false);
  const router = useRouter();
  const { signOut, user } = useSession();
  const toggleMenu = () => setMenuVisible(!menuVisible);
  const closeMenu = () => setMenuVisible(false);

  const handleLogout = () => {
    closeMenu(); // ferme le menu
    Alert.alert(
      "Déconnexion",
      "Voulez-vous vraiment vous déconnecter ?",
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Oui",
          onPress: signOut,
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <TouchableWithoutFeedback onPress={closeMenu}>
      <View style={styles.container}>
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

            {menuVisible && (
              <View style={styles.menu}>
                <TouchableOpacity style={styles.menuItem}>
                  <MaterialIcons name="person" size={20} color="white" />
                  <Text style={styles.menuText} numberOfLines={1}>
                    {user?.name}
                  </Text>
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleLogout}
                >
                  <MaterialIcons name="logout" size={20} color="white" />
                  <Text style={styles.menuText}>Déconnexion</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* CONTENT */}
        <View style={styles.content}>
          <Button
            color={"#ED5623"}
            title="Demarrez un nouvelle voyage"
            onPress={() => {
              router.navigate("/voyages/create/chauffeur");
            }}
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
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
    width: 220,
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
