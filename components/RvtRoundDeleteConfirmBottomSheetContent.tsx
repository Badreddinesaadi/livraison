import { Pressable, StyleSheet, Text, View } from "react-native";

type RvtRoundDeleteConfirmBottomSheetContentProps = {
  nom: string | null;
  visitCount?: number;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const DANGER = "#ff4d4f";

export default function RvtRoundDeleteConfirmBottomSheetContent({
  nom,
  visitCount,
  isLoading = false,
  onConfirm,
  onCancel,
}: RvtRoundDeleteConfirmBottomSheetContentProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirmer la suppression de la tournée</Text>

      <Text style={styles.message}>
        {`La tournée "${nom ?? "sans nom"}"${
          visitCount != null && visitCount > 0
            ? ` (${visitCount} visite${visitCount > 1 ? "s" : ""})`
            : ""
        } sera supprimée définitivement. Voulez-vous continuer ?`}
      </Text>

      <View style={styles.buttonRow}>
        <Pressable
          onPress={onCancel}
          disabled={isLoading}
          style={[styles.cancelButton, isLoading && styles.disabled]}
        >
          <Text style={styles.cancelText}>Annuler</Text>
        </Pressable>

        <Pressable
          onPress={onConfirm}
          disabled={isLoading}
          style={[styles.confirmButton, isLoading && styles.disabled]}
        >
          <Text style={styles.confirmText}>
            {isLoading ? "Suppression..." : "Supprimer"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    color: "#444",
    lineHeight: 22,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: "row",
    columnGap: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DANGER,
  },
  disabled: {
    opacity: 0.7,
  },
  cancelText: {
    color: "#555",
    fontWeight: "700",
  },
  confirmText: {
    color: "#fff",
    fontWeight: "700",
  },
});
