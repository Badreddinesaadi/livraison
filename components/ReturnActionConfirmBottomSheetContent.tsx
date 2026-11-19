import { SUCCESS } from "@/constants/theme";
import { FontAwesome } from "@expo/vector-icons";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type ReturnActionConfirmBottomSheetContentProps = {
  returnId: number | null;
  isLoading?: boolean;
  onConfirm: (payload: {
    statut: "terminer" | "refuser";
    commentaire: string;
  }) => void;
  onCancel: () => void;
};

const PRIMARY = "#ED5623";
const DANGER = "#ff4d4f";

export default function ReturnActionConfirmBottomSheetContent({
  returnId,
  isLoading = false,
  onConfirm,
  onCancel,
}: ReturnActionConfirmBottomSheetContentProps) {
  const [commentaire, setCommentaire] = useState("");
  const [selectedAction, setSelectedAction] = useState<
    "terminer" | "refuser" | null
  >(null);

  const handleChooseAction = (action: "terminer" | "refuser") => {
    if (isLoading) {
      return;
    }

    setSelectedAction(action);
  };

  const handleBackToForm = () => {
    if (isLoading) {
      return;
    }

    setSelectedAction(null);
  };

  const handleConfirmAction = () => {
    if (isLoading || !selectedAction) {
      return;
    }

    onConfirm({
      statut: selectedAction,
      commentaire: commentaire.trim(),
    });
  };

  const actionLabel = selectedAction === "refuser" ? "Refuser" : "Accepter";
  const actionColor = selectedAction === "refuser" ? DANGER : PRIMARY;

  return (
    <View style={styles.container}>
      {selectedAction ? (
        <>
          <View style={styles.headerRow}>
            <Pressable
              onPress={handleBackToForm}
              disabled={isLoading}
              hitSlop={8}
              style={styles.backButton}
            >
              <FontAwesome name="arrow-left" size={18} color="#1a1a2e" />
            </Pressable>
            <Text style={styles.headerTitle}>Confirmation finale</Text>
          </View>

          <Text style={styles.finalDescription}>
            {`Vous allez ${selectedAction === "refuser" ? "refuser" : "accepter"} le retour #${
              returnId ?? "—"
            }.`}
          </Text>

          <View style={styles.commentCard}>
            <Text style={styles.commentCardLabel}>Commentaire saisi</Text>
            <Text style={styles.commentCardText}>
              {commentaire.trim() || "Aucun commentaire"}
            </Text>
          </View>

          <View style={styles.actionRow}>
            <Pressable
              onPress={onCancel}
              disabled={isLoading}
              style={[styles.cancelButton, isLoading && styles.buttonDisabled]}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </Pressable>

            <Pressable
              onPress={handleConfirmAction}
              disabled={isLoading}
              style={[
                styles.confirmButton,
                { backgroundColor: actionColor },
                isLoading && styles.buttonDisabled,
              ]}
            >
              <Text style={styles.confirmButtonText}>
                {isLoading ? "Traitement..." : `Confirmer ${actionLabel}`}
              </Text>
            </Pressable>
          </View>
        </>
      ) : (
        <>
          <Text style={styles.formTitle}>
            Confirmer la validation du retour
          </Text>

          <Text style={styles.formDescription}>
            {`Retour #${returnId ?? "—"}. Ajoutez un commentaire puis choisissez l'action.`}
          </Text>

          <Text style={styles.formLabel}>Commentaire</Text>

          <BottomSheetTextInput
            value={commentaire}
            onChangeText={setCommentaire}
            editable={!isLoading}
            placeholder="Saisir un commentaire..."
            placeholderTextColor="#999"
            multiline
            textAlignVertical="top"
            style={styles.input}
          />

          <View style={styles.actionRow}>
            <Pressable
              onPress={onCancel}
              disabled={isLoading}
              style={[styles.cancelButton, isLoading && styles.buttonDisabled]}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </Pressable>

            <Pressable
              onPress={() => handleChooseAction("refuser")}
              disabled={isLoading}
              style={[
                styles.confirmButton,
                styles.confirmButtonDanger,
                isLoading && styles.buttonDisabled,
              ]}
            >
              <Text style={styles.confirmButtonText}>Refuser</Text>
            </Pressable>
            <Pressable
              onPress={() => handleChooseAction("terminer")}
              disabled={isLoading}
              style={[
                styles.confirmButton,
                styles.confirmButtonSuccess,
                isLoading && styles.buttonDisabled,
              ]}
            >
              <Text style={styles.confirmButtonText}>Accepter</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  backButton: {
    paddingRight: 10,
    paddingVertical: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a2e",
  },
  finalDescription: {
    fontSize: 14,
    color: "#444",
    lineHeight: 22,
    marginBottom: 12,
  },
  commentCard: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  commentCardLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
    fontWeight: "600",
  },
  commentCardText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
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
  confirmButtonSuccess: {
    backgroundColor: SUCCESS,
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  formTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: 10,
  },
  formDescription: {
    fontSize: 14,
    color: "#444",
    lineHeight: 22,
    marginBottom: 14,
  },
  formLabel: {
    fontSize: 13,
    color: "#444",
    marginBottom: 8,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 90,
    fontSize: 14,
    color: "#1a1a2e",
    backgroundColor: "#fff",
    marginBottom: 14,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
