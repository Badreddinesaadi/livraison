import { PRIMARY } from "@/constants/theme";
import {
  BottomSheetFlatList,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { ListRenderItem, Pressable, StyleSheet, Text, View } from "react-native";
import { RvtOption } from "@/stores/rvt-sheet.store";

type RvtSelectOptionBottomSheetContentProps = {
  title: string;
  options: RvtOption[];
  onSelect: (id: string) => void;
  selectedId?: string;
  emptyLabel?: string;
  enableSearch?: boolean;
  searchPlaceholder?: string;
};

const SelectOptionItem = memo(function SelectOptionItem({
  item,
  isSelected,
  onSelect,
}: {
  item: RvtOption;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const onPressItem = useCallback(() => onSelect(item.id), [onSelect, item.id]);

  return (
    <Pressable
      onPress={onPressItem}
      style={[styles.item, isSelected && styles.itemSelected]}
    >
      <Text style={[styles.itemLabel, isSelected && styles.itemLabelSelected]}>
        {item.label}
      </Text>
      {item.subLabel ? (
        <Text style={styles.itemSubLabel}>{item.subLabel}</Text>
      ) : null}
    </Pressable>
  );
});

export default function RvtSelectOptionBottomSheetContent({
  title,
  options,
  onSelect,
  selectedId,
  emptyLabel = "Aucune option disponible",
  enableSearch = false,
  searchPlaceholder = "Rechercher...",
}: RvtSelectOptionBottomSheetContentProps) {
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const shouldShowSearch = enableSearch || options.length > 5;

  useEffect(() => {
    if (!shouldShowSearch) return;
    const timeout = setTimeout(
      () => setDebouncedSearch(searchText.trim().toLowerCase()),
      300,
    );
    return () => clearTimeout(timeout);
  }, [searchText, shouldShowSearch]);

  const filteredOptions = useMemo(() => {
    if (!shouldShowSearch || !debouncedSearch) return options;
    return options.filter((item) => {
      const label = item.label.toLowerCase();
      const subLabel = (item.subLabel || "").toLowerCase();
      return label.includes(debouncedSearch) || subLabel.includes(debouncedSearch);
    });
  }, [options, shouldShowSearch, debouncedSearch]);

  const keyExtractor = useCallback((item: RvtOption) => item.id, []);

  const renderItem = useCallback<ListRenderItem<RvtOption>>(
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
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      {shouldShowSearch ? (
        <View style={styles.searchBox}>
          <BottomSheetTextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder={searchPlaceholder}
            placeholderTextColor="#bbb"
            style={styles.searchInput}
          />
          {searchText ? (
            <Pressable onPress={() => setSearchText("")} hitSlop={8}>
              <Text style={styles.clear}>✕</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <BottomSheetFlatList<RvtOption>
        data={filteredOptions}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={renderItem}
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        windowSize={8}
        removeClippedSubviews
        ListEmptyComponent={
          <Text style={styles.empty}>
            {shouldShowSearch && debouncedSearch
              ? "Aucune option trouvée"
              : emptyLabel}
          </Text>
        }
      />
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
  searchBox: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e8e8e8",
    borderRadius: 10,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    height: 42,
    fontSize: 14,
    color: "#222",
  },
  clear: {
    color: "#888",
    fontSize: 16,
    fontWeight: "700",
  },
  list: {
    paddingBottom: 100,
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
  itemSelected: {
    borderColor: PRIMARY,
  },
  itemLabel: {
    fontWeight: "600",
    color: "#222",
  },
  itemLabelSelected: {
    color: PRIMARY,
  },
  itemSubLabel: {
    color: "#888",
    marginTop: 2,
  },
  empty: {
    color: "#aaa",
  },
});
