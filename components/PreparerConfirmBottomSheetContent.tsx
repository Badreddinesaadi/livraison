import { SUCCESS } from "@/constants/theme";
import { Pressable, StyleSheet, Text, View } from "react-native";

type PreparerConfirmBottomSheetContentProps = {
  label: string;
  type: "preparer_produit" | "preparer_lot";
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function PreparerConfirmBottomSheetContent({
  label,
  type,
  isLoading = false,
  onConfirm,
  onCancel,
}: PreparerConfirmBottomSheetContentProps) {
  const isProduit = type === "preparer_produit";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isProduit ? "Préparer le produit" : "Préparer le lot"}
      </Text>

      <Text style={styles.message}>
        {isProduit
          ? `Le produit "${label}" sera marqué comme préparé. Voulez-vous continuer ?`
          : `Le lot "${label}" sera marqué comme préparé. Voulez-vous continuer ?`}
      </Text>

      <View style={styles.actionRow}>
        <Pressable
          onPress={onCancel}
          disabled={isLoading}
          style={[styles.cancelButton, isLoading && styles.buttonDisabled]}
        >
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </Pressable>

        <Pressable
          onPress={onConfirm}
          disabled={isLoading}
          style={[
            styles.confirmButton,
            styles.confirmButtonSuccess,
            isLoading && styles.buttonDisabled,
          ]}
        >
          <Text style={styles.confirmButtonText}>
            {isLoading ? "Préparation..." : "Confirmer"}
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
  actionRow: {
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
  cancelButtonText: {
    color: "#555",
    fontWeight: "700",
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonSuccess: {
    backgroundColor: SUCCESS,
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
