import { useSession } from "@/stores/auth.store";
import { MaterialIcons } from "@expo/vector-icons";
import { useNetInfo } from "@react-native-community/netinfo";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { signIn, signInIsPending } = useSession();
  const netInfo = useNetInfo(); // Hook pour l'état Internet

  const handleLogin = () => {
    setError("");

    if (!netInfo.isConnected) {
      setError("Pas de connexion Internet");
      return;
    }

    if (!email || !password) {
      setError("Tous les champs sont obligatoires");
      return;
    }
    //validate email format

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Format d'email invalide");
      return;
    }

    signIn(email, password, (message) => {
      setError(message);
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={[styles.settingsButton, { top: insets.top + 8 }]}
            onPress={() => router.push("/api-url")}
            hitSlop={8}
          >
            <MaterialIcons name="settings" size={22} color="#ED5623" />
          </TouchableOpacity>

          <Image
            source={require("../assets/images/logo.jpeg")}
            style={styles.logo}
            contentFit="contain"
          />

          {/* Email */}
          <TextInput
            placeholder="Email"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          {/* Mot de passe + œil */}
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Mot de passe"
              style={styles.passwordInput}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />

            <TouchableWithoutFeedback
              onPress={() => setShowPassword(!showPassword)}
            >
              <MaterialIcons
                name={showPassword ? "visibility" : "visibility-off"}
                size={24}
                color="#888"
              />
            </TouchableWithoutFeedback>
          </View>

          <Text style={styles.error}>{error}</Text>

          <TouchableOpacity
            style={styles.button}
            disabled={signInIsPending}
            onPress={handleLogin}
          >
            {signInIsPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Se connecter</Text>
            )}
          </TouchableOpacity>
          <Text>0.0.3</Text>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "white",
    justifyContent: "center",
    padding: 20,
  },
  settingsButton: {
    position: "absolute",
    right: 16,
    padding: 4,
  },
  logo: {
    width: 220,
    height: 130,
    alignSelf: "center",
    marginBottom: 40,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 14,
    borderRadius: 6,
    marginBottom: 15,
    color: "#11181C",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 14,
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    color: "#11181C",
  },
  button: {
    backgroundColor: "#ED5623",
    padding: 15,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
});
