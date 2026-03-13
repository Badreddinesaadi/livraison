import { Pressable, Text, View } from "react-native";

type VoyageActionConfirmVariant = "achever" | "supprimer";

type VoyageActionConfirmBottomSheetContentProps = {
  variant: VoyageActionConfirmVariant;
  voyageId: number | null;
  pendingUndeliveredCount?: number;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const PRIMARY = "#ED5623";
const DANGER = "#ff4d4f";

type ContentConfig = {
  title: string;
  message: string;
  confirmLabel: string;
  confirmBackgroundColor: string;
};

function buildContentConfig(
  variant: VoyageActionConfirmVariant,
  voyageId: number | null,
  pendingUndeliveredCount: number,
): ContentConfig {
  if (variant === "supprimer") {
    return {
      title: "Confirmer la suppression du voyage",
      message: `Le voyage #${voyageId ?? "—"} sera supprimé définitivement. Voulez-vous continuer ?`,
      confirmLabel: "Supprimer",
      confirmBackgroundColor: DANGER,
    };
  }

  if (pendingUndeliveredCount <= 0) {
    return {
      title: "Confirmer l’achèvement du voyage",
      message: `Voulez-vous vraiment l’achever ?`,
      confirmLabel: "Confirmer",
      confirmBackgroundColor: PRIMARY,
    };
  }

  return {
    title: "Confirmer l’achèvement du voyage",
    message: `Le voyage #${voyageId ?? "—"} contient encore ${pendingUndeliveredCount} ${
      pendingUndeliveredCount > 1 ? "BLs non livrés" : "BL non livré"
    }. Voulez-vous vraiment l’achever ?`,
    confirmLabel: "Confirmer",
    confirmBackgroundColor: PRIMARY,
  };
}

export default function VoyageActionConfirmBottomSheetContent({
  variant,
  voyageId,
  pendingUndeliveredCount = 0,
  isLoading = false,
  onConfirm,
  onCancel,
}: VoyageActionConfirmBottomSheetContentProps) {
  const content = buildContentConfig(
    variant,
    voyageId,
    pendingUndeliveredCount,
  );

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
        {content.title}
      </Text>

      <Text
        style={{
          fontSize: 14,
          color: "#444",
          lineHeight: 22,
          marginBottom: 16,
        }}
      >
        {content.message}
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
          <Text style={{ color: "#444", fontWeight: "600", fontSize: 14 }}>
            Annuler
          </Text>
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
            backgroundColor: content.confirmBackgroundColor,
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>
            {isLoading ? "Traitement..." : content.confirmLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
