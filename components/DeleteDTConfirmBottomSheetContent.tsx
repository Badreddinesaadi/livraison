import { Pressable, Text, View } from "react-native";

type DeleteDTConfirmBottomSheetContentProps = {
  reference: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const DANGER = "#ff4d4f";

export default function DeleteDTConfirmBottomSheetContent({
  reference,
  isLoading = false,
  onConfirm,
  onCancel,
}: DeleteDTConfirmBottomSheetContentProps) {
  return (
    <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: "700",
          color: "#1a1a2e",
          marginBottom: 10,
        }}
      >
        Supprimer la demande
      </Text>

      <Text
        style={{
          fontSize: 14,
          color: "#444",
          lineHeight: 22,
          marginBottom: 16,
        }}
      >
        La demande de transfert "{reference}" sera définitivement supprimée.
        Voulez-vous continuer ?
      </Text>

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
          onPress={onConfirm}
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
          <Text style={{ color: "#fff", fontWeight: "700" }}>
            {isLoading ? "Suppression..." : "Supprimer"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
