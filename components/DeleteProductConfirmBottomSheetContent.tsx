import { Pressable, Text, View } from "react-native";

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
    <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: "700",
          color: "#1a1a2e",
          marginBottom: 10,
        }}
      >
        Supprimer le produit
      </Text>

      <Text
        style={{
          fontSize: 14,
          color: "#444",
          lineHeight: 22,
          marginBottom: 16,
        }}
      >
        {productName
          ? `Le produit "${productName}" (ID: ${productDetailId ?? "-"}) sera supprimé de cette demande. Voulez-vous continuer ?`
          : `Le produit #${productDetailId ?? "-"} sera supprimé de cette demande. Voulez-vous continuer ?`}
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