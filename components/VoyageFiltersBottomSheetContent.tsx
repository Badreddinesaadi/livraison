import { PRIMARY } from "@/constants/theme";
import { VoyageFilterKey } from "@/stores/close-bl.store";
import { Pressable, StyleSheet, Text, View } from "react-native";

type VoyageFilterItem = {
  key: VoyageFilterKey;
  label: string;
  valueLabel?: string;
};

type VoyageFiltersBottomSheetContentProps = {
  title: string;
  items: VoyageFilterItem[];
  onSelectItem: (key: VoyageFilterKey) => void;
  onReset?: () => void;
};

export default function VoyageFiltersBottomSheetContent({
  title,
  items,
  onSelectItem,
  onReset,
}: VoyageFiltersBottomSheetContentProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      {items.map((item) => (
        <Pressable
          key={item.key}
          onPress={() => onSelectItem(item.key)}
          style={[
            styles.item,
            item.valueLabel !== "Tous"
              ? styles.itemBorderActive
              : styles.itemBorderInactive,
          ]}
        >
          <Text style={styles.itemLabel}>{item.label}</Text>
          <Text style={styles.itemValue}>{item.valueLabel || "Tous"}</Text>
        </Pressable>
      ))}

      {onReset ? (
        <Pressable onPress={onReset} style={styles.resetButton}>
          <Text style={styles.resetText}>Réinitialiser les filtres</Text>
        </Pressable>
      ) : null}
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
  item: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  itemBorderActive: {
    borderColor: PRIMARY,
  },
  itemBorderInactive: {
    borderColor: "#eee",
  },
  itemLabel: {
    fontWeight: "600",
    color: "#222",
  },
  itemValue: {
    color: "#888",
    marginTop: 2,
  },
  resetButton: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
    marginTop: 2,
  },
  resetText: {
    fontWeight: "600",
    color: "#222",
  },
});
