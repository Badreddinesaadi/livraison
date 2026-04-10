import { useSession } from "@/stores/auth.store";
import { MaterialIcons } from "@expo/vector-icons";
import { useNetInfo } from "@react-native-community/netinfo";
import { Image } from "expo-image";
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

export default function LoginScreen() {
  const [email, setEmail] = useState("rachid.aitbouhou@sdkwood.ma");
  const [password, setPassword] = useState("Sdk@2025");
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
          <Image
            source={require("../assets/images/logo.png")}
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
