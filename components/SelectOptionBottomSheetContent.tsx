import { PRIMARY } from "@/constants/theme";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { ListRenderItem, Pressable, Text, TextInput, View } from "react-native";

type SelectOption = {
  id: number;
  label: string;
  valueLabel?: string;
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

type SelectOptionItemProps = {
  item: SelectOption;
  isSelected: boolean;
  onSelect: (id: number) => void;
};

const SelectOptionItem = memo(function SelectOptionItem({
  item,
  isSelected,
  onSelect,
}: SelectOptionItemProps) {
  const onPressItem = useCallback(() => {
    onSelect(item.id);
  }, [onSelect, item.id]);

  return (
    <Pressable
      onPress={onPressItem}
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
      {item.valueLabel || item.subLabel ? (
        <Text style={{ color: "#888", marginTop: 2 }}>
          {item.valueLabel || item.subLabel}
        </Text>
      ) : null}
    </Pressable>
  );
});

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
  const shouldShowSearch = enableSearch || options.length > 5;

  useEffect(() => {
    if (!shouldShowSearch) {
      setDebouncedSearch("");
      return;
    }

    const timeout = setTimeout(() => {
      setDebouncedSearch(searchText.trim().toLowerCase());
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchText, shouldShowSearch]);

  const filteredOptions = useMemo(() => {
    if (!shouldShowSearch || !debouncedSearch) {
      return options;
    }

    return options.filter((item) => {
      const label = item.label.toLowerCase();
      const valueLabel = (item.valueLabel || "").toLowerCase();
      const subLabel = (item.subLabel || "").toLowerCase();

      return (
        label.includes(debouncedSearch) ||
        valueLabel.includes(debouncedSearch) ||
        subLabel.includes(debouncedSearch)
      );
    });
  }, [options, shouldShowSearch, debouncedSearch]);

  const clearSearch = useCallback(() => {
    setSearchText("");
  }, []);

  const keyExtractor = useCallback((item: SelectOption) => String(item.id), []);

  const renderItem = useCallback<ListRenderItem<SelectOption>>(
    ({ item }) => (
      <SelectOptionItem
        item={item}
        isSelected={selectedId === item.id}
        onSelect={onSelect}
      />
    ),
    [selectedId, onSelect],
  );

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

      {shouldShowSearch ? (
        <View
          style={{
            marginBottom: 12,
            borderWidth: 1,
            borderColor: "#e8e8e8",
            borderRadius: 10,
            backgroundColor: "#fff",
            paddingHorizontal: 12,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder={searchPlaceholder}
            placeholderTextColor="#bbb"
            style={{
              flex: 1,
              height: 42,
              fontSize: 14,
              color: "#222",
            }}
          />
          {searchText ? (
            <Pressable onPress={clearSearch} hitSlop={8}>
              <Text style={{ color: "#888", fontSize: 16, fontWeight: "700" }}>
                ✕
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <BottomSheetFlatList<SelectOption>
        data={filteredOptions}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={renderItem}
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        windowSize={8}
        removeClippedSubviews
        ListEmptyComponent={
          <Text style={{ color: "#aaa" }}>
            {shouldShowSearch && debouncedSearch
              ? "Aucune option trouvée"
              : emptyLabel}
          </Text>
        }
      />
    </View>
  );
}
