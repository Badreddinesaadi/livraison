import { useSession } from "@/stores/auth.store";
import { Pressable, Text, View } from "react-native";

type VoyageMoreActionsBottomSheetContentProps = {
  voyageId: number | null;
  onUpdate: () => void;
  onShowDetails: () => void;
};

// const PRIMARY = "#ED5623";

export default function VoyageMoreActionsBottomSheetContent({
  voyageId,
  onUpdate,
  onShowDetails,
}: VoyageMoreActionsBottomSheetContentProps) {
  const { user } = useSession();
  return (
    <View style={{ paddingHorizontal: 16, paddingBottom: 10 }}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: "700",
          color: "#1a1a2e",
          marginBottom: 14,
        }}
      >
        Sélectionner une action
      </Text>

      <Text
        style={{
          fontSize: 13,
          color: "#888",
          marginBottom: 8,
        }}
      >
        Voyage #{voyageId ?? "—"}
      </Text>
      {(user?.role === "admin" || user?.role === "adv") && (
        <Pressable
          onPress={onUpdate}
          style={{
            paddingVertical: 12,
            paddingHorizontal: 12,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: "#eee",
            backgroundColor: "#fff",
            marginBottom: 10,
          }}
        >
          <Text style={{ fontWeight: "600" }}>Modifier</Text>
        </Pressable>
      )}
      <Pressable
        onPress={onShowDetails}
        style={{
          paddingVertical: 12,
          paddingHorizontal: 12,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: "#eee",
          backgroundColor: "#fff",
          marginBottom: 10,
        }}
      >
        <Text style={{ fontWeight: "600", color: "#222" }}>
          Voir les détails
        </Text>
      </Pressable>
    </View>
  );
}
