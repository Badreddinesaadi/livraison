import { Pressable, StyleSheet, Text, View } from "react-native";
import { PRIMARY } from "@/constants/theme";

type RvtRoundToggleConfirmBottomSheetContentProps = {
  nom: string | null;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function RvtRoundToggleConfirmBottomSheetContent({
  nom,
  isOpen,
  onConfirm,
  onCancel,
}: RvtRoundToggleConfirmBottomSheetContentProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isOpen ? "Clôturer la tournée" : "Rouvrir la tournée"}
      </Text>

      <Text style={styles.message}>
        {isOpen
          ? `La tournée "${nom ?? "sans nom"}" sera clôturée. Vous ne pourrez plus y ajouter de visites. Continuer ?`
          : `La tournée "${nom ?? "sans nom"}" sera rouverte. Vous pourrez à nouveau y ajouter des visites. Voulez-vous continuer ?`}
      </Text>

      <View style={styles.buttonRow}>
        <Pressable onPress={onCancel} style={styles.cancelButton}>
          <Text style={styles.cancelText}>Annuler</Text>
        </Pressable>

        <Pressable
          onPress={onConfirm}
          style={[
            styles.confirmButton,
            !isOpen && styles.confirmButtonReopen,
          ]}
        >
          <Text style={styles.confirmText}>
            {isOpen ? "Clôturer" : "Rouvrir"}
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
    backgroundColor: PRIMARY,
  },
  confirmButtonReopen: {
    backgroundColor: PRIMARY,
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
