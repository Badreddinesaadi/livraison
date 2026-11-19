import { hasVoyagePermission } from "@/constants/permissions";
import { useSession } from "@/stores/auth.store";
import { Pressable, StyleSheet, Text, View } from "react-native";

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
  const canUpdateVoyage = hasVoyagePermission(user, "UPDATE");
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sélectionner une action</Text>

      <Text style={styles.subtitle}>Voyage #{voyageId ?? "—"}</Text>
      {canUpdateVoyage && (
        <Pressable onPress={onUpdate} style={styles.item}>
          <Text style={styles.itemText}>Modifier</Text>
        </Pressable>
      )}
      <Pressable onPress={onShowDetails} style={styles.item}>
        <Text style={styles.itemTextStrong}>Voir les détails</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 13,
    color: "#888",
    marginBottom: 8,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  itemText: {
    fontWeight: "600",
  },
  itemTextStrong: {
    fontWeight: "600",
    color: "#222",
  },
});
