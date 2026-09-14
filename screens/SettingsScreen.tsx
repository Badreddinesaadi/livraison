import { queryClient } from "@/constants/query";
import { normalizeApiUrl, useApiUrlStore } from "@/stores/api-url.store";
import { useSession } from "@/stores/auth.store";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import {
  ActivityIndicator,
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
import Toast from "react-native-toast-message";

export default function SettingsScreen() {
  const router = useRouter();
  const saveApiUrl = useApiUrlStore((s) => s.saveApiUrl);
  const { signOut } = useSession();

  const [isEditing, setIsEditing] = useState(false);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const maskedUrl = "•".repeat(12);

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
      await SecureStore.deleteItemAsync("sessionToken");
      queryClient.invalidateQueries();
      signOut();
      Toast.show({
        type: "success",
        text1: "Adresse mise à jour",
        text2: "Veuillez vous reconnecter",
      });
      router.replace("/sign-in");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setUrl("");
    setError("");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableWithoutFeedback onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={24} color="black" />
        </TouchableWithoutFeedback>
        <Text style={styles.headerTitle}>Paramètres</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Adresse du serveur</Text>
            <Text style={styles.cardCaption}>
              {"L'adresse est masquée par sécurité."}
            </Text>

            {isEditing ? (
              <TextInput
                placeholder="http://192.168.1.128:8075"
                style={styles.input}
                value={url}
                onChangeText={setUrl}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                autoFocus
              />
            ) : (
              <View style={styles.maskedRow}>
                <MaterialIcons name="lock" size={18} color="#64748B" />
                <Text style={styles.maskedText}>{maskedUrl}</Text>
              </View>
            )}

            <Text style={styles.error}>{error}</Text>

            {isEditing ? (
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonSecondary]}
                  onPress={handleCancelEdit}
                >
                  <Text style={styles.buttonSecondaryText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.buttonPrimary,
                    !url && styles.buttonDisabled,
                  ]}
                  disabled={isSaving || !url}
                  onPress={handleSave}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonPrimaryText}>Enregistrer</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary]}
                onPress={() => setIsEditing(true)}
              >
                <Text style={styles.buttonPrimaryText}>Modifier</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.hint}>
            Après modification, vous serez déconnecté et devrez vous reconnecter
            avec le nouveau serveur.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  flex: {
    flex: 1,
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
  content: {
    padding: 16,
    paddingTop: 8,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 18,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },
  cardCaption: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748B",
  },
  maskedRow: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  maskedText: {
    fontSize: 18,
    letterSpacing: 2,
    color: "#334155",
  },
  input: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: "#0F172A",
    backgroundColor: "#F8FAFC",
  },
  error: {
    marginTop: 8,
    color: "#DC2626",
    fontSize: 13,
    minHeight: 18,
  },
  actionsRow: {
    marginTop: 8,
    flexDirection: "row",
    gap: 10,
  },
  button: {
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPrimary: {
    backgroundColor: "#ED5623",
    flex: 1,
    marginTop: 8,
  },
  buttonSecondary: {
    backgroundColor: "#F1F5F9",
    flex: 1,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPrimaryText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  buttonSecondaryText: {
    color: "#334155",
    fontSize: 15,
    fontWeight: "700",
  },
  hint: {
    marginTop: 14,
    fontSize: 12,
    color: "#94A3B8",
    lineHeight: 18,
  },
});
