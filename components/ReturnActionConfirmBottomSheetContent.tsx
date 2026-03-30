import { SUCCESS } from "@/constants/theme";
import { FontAwesome } from "@expo/vector-icons";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

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
    <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
      {selectedAction ? (
        <>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Pressable
              onPress={handleBackToForm}
              disabled={isLoading}
              hitSlop={8}
              style={{ paddingRight: 10, paddingVertical: 4 }}
            >
              <FontAwesome name="arrow-left" size={18} color="#1a1a2e" />
            </Pressable>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#1a1a2e",
              }}
            >
              Confirmation finale
            </Text>
          </View>

          <Text
            style={{
              fontSize: 14,
              color: "#444",
              lineHeight: 22,
              marginBottom: 12,
            }}
          >
            {`Vous allez ${selectedAction === "refuser" ? "refuser" : "accepter"} le retour #${
              returnId ?? "—"
            }.`}
          </Text>

          <View
            style={{
              borderWidth: 1,
              borderColor: "#eee",
              borderRadius: 10,
              backgroundColor: "#fff",
              paddingHorizontal: 12,
              paddingVertical: 10,
              marginBottom: 14,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: "#888",
                marginBottom: 4,
                fontWeight: "600",
              }}
            >
              Commentaire saisi
            </Text>
            <Text style={{ fontSize: 14, color: "#333", lineHeight: 20 }}>
              {commentaire.trim() || "Aucun commentaire"}
            </Text>
          </View>

          <View style={{ flexDirection: "row", columnGap: 10 }}>
            <Pressable
              onPress={onCancel}
              disabled={isLoading}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "#ddd",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#fff",
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              <Text style={{ color: "#555", fontWeight: "700" }}>Annuler</Text>
            </Pressable>

            <Pressable
              onPress={handleConfirmAction}
              disabled={isLoading}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: actionColor,
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>
                {isLoading ? "Traitement..." : `Confirmer ${actionLabel}`}
              </Text>
            </Pressable>
          </View>
        </>
      ) : (
        <>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: "#1a1a2e",
              marginBottom: 10,
            }}
          >
            Confirmer la validation du retour
          </Text>

          <Text
            style={{
              fontSize: 14,
              color: "#444",
              lineHeight: 22,
              marginBottom: 14,
            }}
          >
            {`Retour #${returnId ?? "—"}. Ajoutez un commentaire puis choisissez l'action.`}
          </Text>

          <Text
            style={{
              fontSize: 13,
              color: "#444",
              marginBottom: 8,
              fontWeight: "600",
            }}
          >
            Commentaire
          </Text>

          <BottomSheetTextInput
            value={commentaire}
            onChangeText={setCommentaire}
            editable={!isLoading}
            placeholder="Saisir un commentaire..."
            placeholderTextColor="#999"
            multiline
            textAlignVertical="top"
            style={{
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
            }}
          />

          <View style={{ flexDirection: "row", columnGap: 10 }}>
            <Pressable
              onPress={onCancel}
              disabled={isLoading}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "#ddd",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#fff",
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              <Text style={{ color: "#555", fontWeight: "700" }}>Annuler</Text>
            </Pressable>

            <Pressable
              onPress={() => handleChooseAction("refuser")}
              disabled={isLoading}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: DANGER,
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Refuser</Text>
            </Pressable>
            <Pressable
              onPress={() => handleChooseAction("terminer")}
              disabled={isLoading}
              style={{
                paddingVertical: 12,
                borderRadius: 10,
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: SUCCESS,
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Accepter</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}
