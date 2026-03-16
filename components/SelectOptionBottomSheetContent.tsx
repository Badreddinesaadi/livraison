import { PRIMARY } from "@/constants/theme";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { Pressable, Text, View } from "react-native";

type SelectOption = {
  id: number;
  label: string;
  subLabel?: string;
};

type SelectOptionBottomSheetContentProps = {
  title: string;
  options: SelectOption[];
  onSelect: (id: number) => void;
  selectedId?: number;
  emptyLabel?: string;
};

export default function SelectOptionBottomSheetContent({
  title,
  options,
  onSelect,
  selectedId,
  emptyLabel = "Aucune option disponible",
}: SelectOptionBottomSheetContentProps) {
  return (
    <BottomSheetFlatList<SelectOption>
      data={options}
      keyExtractor={(item: SelectOption) => String(item.id)}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 10 }}
      ListHeaderComponent={
        <View>
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
        </View>
      }
      renderItem={({ item }: { item: SelectOption }) => {
        const isSelected = selectedId === item.id;
        return (
          <Pressable
            onPress={() => onSelect(item.id)}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 12,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: isSelected ? PRIMARY : "#eee",
              backgroundColor: "#fff",
              marginBottom: 10,
            }}
          >
            <Text
              style={{
                fontWeight: "600",
                color: isSelected ? PRIMARY : "#222",
              }}
            >
              {item.label}
            </Text>
            {item.subLabel ? (
              <Text style={{ color: "#888", marginTop: 2 }}>
                {item.subLabel}
              </Text>
            ) : null}
          </Pressable>
        );
      }}
      ListEmptyComponent={<Text style={{ color: "#aaa" }}>{emptyLabel}</Text>}
    />
  );
}
