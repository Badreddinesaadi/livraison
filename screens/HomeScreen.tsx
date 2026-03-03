import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import React, { useState } from "react";
import {
  Alert,
  Button,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../firebase";

export default function HomeScreen() {
  const [menuVisible, setMenuVisible] = useState(false);
  const router = useRouter();
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
          onPress: () => signOut(auth),
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <TouchableWithoutFeedback onPress={closeMenu}>
      <SafeAreaView style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <View>
            <TouchableOpacity onPress={toggleMenu}>
              <MaterialIcons name="account-circle" size={32} color="#ED5623" />
            </TouchableOpacity>

            {menuVisible && (
              <View style={styles.menu}>
                <TouchableOpacity style={styles.menuItem}>
                  <MaterialIcons name="person" size={20} color="white" />
                  <Text style={styles.menuText}>Mon compte</Text>
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
            title="Demarrez une nouvelle voyage"
            onPress={() => {
              router.navigate("/voyages/create");
            }}
          />
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },

  header: {
    height: 70,
    paddingHorizontal: 20,
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
