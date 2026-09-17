import { normalizeApiUrl, useApiUrlStore } from "@/stores/api-url.store";
import { FontAwesome } from "@expo/vector-icons";
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
import { SafeAreaView } from "react-native-safe-area-context";

export default function OnboardingUrlScreen({
  canGoBack = false,
}: {
  canGoBack?: boolean;
}) {
  const router = useRouter();
  const saveApiUrl = useApiUrlStore((s) => s.saveApiUrl);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setError("");
    const normalized = normalizeApiUrl(url);
    if (!normalized) {
      setError(
        "URL invalide. Exemples : http://192.168.1.128:8075 ou https://exemple.com",
      );
      return;
    }
    setIsSaving(true);
    try {
      await saveApiUrl(normalized);
      router.replace("/sign-in");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.flex}>
      {canGoBack ? (
        <View style={styles.header}>
          <TouchableWithoutFeedback onPress={() => router.back()}>
            <FontAwesome name="arrow-left" size={24} color="black" />
          </TouchableWithoutFeedback>
          <Text style={styles.headerTitle}>Adresse du serveur</Text>
          <View style={styles.headerSpacer} />
        </View>
      ) : null}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
          >
            <Image
              source={require("../assets/images/logo.jpeg")}
              style={styles.logo}
              contentFit="contain"
            />

            <Text style={styles.title}>Bienvenue sur SDK Wood</Text>
            <Text style={styles.subtitle}>
              {
                "Pour commencer, veuillez saisir l'adresse complète du serveur de l'application (IP ou URL http/https)"
              }
              {}
            </Text>

            <TextInput
              placeholder="http://192.168.1.128:8075"
              style={styles.input}
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />

            <Text style={styles.error}>{error}</Text>

            <TouchableOpacity
              style={[styles.button, !url && styles.buttonDisabled]}
              disabled={isSaving || !url}
              onPress={handleSave}
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {canGoBack ? "Enregistrer" : "Continuer"}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  headerSpacer: {
    width: 24,
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: "center",
    borderRadius: 24,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },
  input: {
    marginTop: 28,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#0F172A",
    backgroundColor: "#F8FAFC",
  },
  error: {
    marginTop: 10,
    color: "#DC2626",
    fontSize: 13,
    textAlign: "center",
    minHeight: 18,
  },
  button: {
    marginTop: 8,
    backgroundColor: "#ED5623",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
