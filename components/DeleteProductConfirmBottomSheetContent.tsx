import { Pressable, StyleSheet, Text, View } from "react-native";

type DeleteProductConfirmBottomSheetContentProps = {
  productDetailId: string | null;
  productName?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const DANGER = "#ff4d4f";

export default function DeleteProductConfirmBottomSheetContent({
  productDetailId,
  productName,
  isLoading = false,
  onConfirm,
  onCancel,
}: DeleteProductConfirmBottomSheetContentProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Supprimer le produit</Text>

      <Text style={styles.message}>
        {productName
          ? `Le produit "${productName}" (ID: ${productDetailId ?? "-"}) sera supprimé de cette demande. Voulez-vous continuer ?`
          : `Le produit #${productDetailId ?? "-"} sera supprimé de cette demande. Voulez-vous continuer ?`}
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
            styles.confirmButtonDanger,
            isLoading && styles.buttonDisabled,
          ]}
        >
          <Text style={styles.confirmButtonText}>
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
  confirmButtonDanger: {
    backgroundColor: DANGER,
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
