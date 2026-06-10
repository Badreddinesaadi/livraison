import { SUCCESS } from "@/constants/theme";
import { Pressable, Text, View } from "react-native";

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
    <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: "700",
          color: "#1a1a2e",
          marginBottom: 10,
        }}
      >
        {isProduit ? "Préparer le produit" : "Préparer le lot"}
      </Text>

      <Text
        style={{
          fontSize: 14,
          color: "#444",
          lineHeight: 22,
          marginBottom: 16,
        }}
      >
        {isProduit
          ? `Le produit "${label}" sera marqué comme préparé. Voulez-vous continuer ?`
          : `Le lot "${label}" sera marqué comme préparé. Voulez-vous continuer ?`}
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
            backgroundColor: SUCCESS,
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>
            {isLoading ? "Préparation..." : "Confirmer"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
