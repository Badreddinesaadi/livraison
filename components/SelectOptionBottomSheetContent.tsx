import { PRIMARY } from "@/constants/theme";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

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
  enableSearch?: boolean;
  searchPlaceholder?: string;
};

export default function SelectOptionBottomSheetContent({
  title,
  options,
  onSelect,
  selectedId,
  emptyLabel = "Aucune option disponible",
  enableSearch = false,
  searchPlaceholder = "Rechercher...",
}: SelectOptionBottomSheetContentProps) {
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enableSearch) {
      setDebouncedSearch("");
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchText.trim().toLowerCase());
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchText, enableSearch]);

  const filteredOptions = useMemo(() => {
    if (!enableSearch || !debouncedSearch) {
      return options;
    }

    return options.filter((item) =>
      item.label.toLowerCase().includes(debouncedSearch),
    );
  }, [options, enableSearch, debouncedSearch]);

  return (
    <BottomSheetFlatList<SelectOption>
      data={filteredOptions}
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

          {enableSearch ? (
            <View
              style={{
                marginBottom: 12,
                borderWidth: 1,
                borderColor: "#e8e8e8",
                borderRadius: 10,
                backgroundColor: "#fff",
                paddingHorizontal: 12,
              }}
            >
              <TextInput
                value={searchText}
                onChangeText={setSearchText}
                placeholder={searchPlaceholder}
                placeholderTextColor="#bbb"
                style={{
                  height: 42,
                  fontSize: 14,
                  color: "#222",
                }}
              />
            </View>
          ) : null}
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
      ListEmptyComponent={
        <Text style={{ color: "#aaa" }}>
          {enableSearch && debouncedSearch ? "Aucun client trouvé" : emptyLabel}
        </Text>
      }
    />
  );
}
