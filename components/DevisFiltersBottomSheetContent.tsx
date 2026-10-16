import { PRIMARY } from "@/constants/theme";
import { DevisFilterItem, DevisFilterKey } from "@/stores/preparation-devis.store";
import { Pressable, Text, View } from "react-native";

type DevisFiltersBottomSheetContentProps = {
  title: string;
  items: DevisFilterItem[];
  onSelectItem: (key: DevisFilterKey) => void;
  onReset?: () => void;
};

export default function DevisFiltersBottomSheetContent({
  title,
  items,
  onSelectItem,
  onReset,
}: DevisFiltersBottomSheetContentProps) {
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
        {title}
      </Text>

      {items.map((item) => (
        <Pressable
          key={item.key}
          onPress={() => onSelectItem(item.key)}
          style={{
            paddingVertical: 12,
            paddingHorizontal: 12,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: item.valueLabel ? PRIMARY : "#eee",
            backgroundColor: "#fff",
            marginBottom: 10,
          }}
        >
          <Text style={{ fontWeight: "600", color: "#222" }}>{item.label}</Text>
          <Text style={{ color: "#888", marginTop: 2 }}>
            {item.valueLabel || "Tous"}
          </Text>
        </Pressable>
      ))}

      {onReset ? (
        <Pressable
          onPress={onReset}
          style={{
            paddingVertical: 12,
            paddingHorizontal: 12,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: "#eee",
            backgroundColor: "#fff",
            marginTop: 2,
          }}
        >
          <Text style={{ fontWeight: "600", color: "#222" }}>
            Réinitialiser les filtres
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
