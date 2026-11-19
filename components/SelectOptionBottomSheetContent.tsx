import { PRIMARY, SUCCESS } from "@/constants/theme";
import {
  BottomSheetFlatList,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { ListRenderItem, Pressable, StyleSheet, Text, View } from "react-native";

type SelectOption = {
  id: number;
  label: string;
  valueLabel?: string;
  subLabel?: string;
  type?: "highlight";
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
      style={[
        styles.option,
        isSelected && styles.optionSelected,
        item.type === "highlight" && styles.optionHighlight,
      ]}
    >
      <Text
        style={[
          styles.optionLabel,
          isSelected && styles.optionLabelSelected,
          item.type === "highlight" && styles.optionLabelHighlight,
        ]}
      >
        {item.label}
      </Text>
      {item.valueLabel || item.subLabel ? (
        <Text style={styles.optionSubLabel}>
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
    if (!shouldShowSearch) return;
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
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      {shouldShowSearch ? (
        <View style={styles.searchBar}>
          <BottomSheetTextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder={searchPlaceholder}
            placeholderTextColor="#bbb"
            style={styles.searchInput}
          />
          {searchText ? (
            <Pressable onPress={clearSearch} hitSlop={8}>
              <Text style={styles.clearText}>✕</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <BottomSheetFlatList<SelectOption>
        data={filteredOptions}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={renderItem}
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        windowSize={8}
        removeClippedSubviews
        ListEmptyComponent={
          <Text style={styles.emptyText}>
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
  option: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  optionSelected: {
    borderColor: PRIMARY,
  },
  optionHighlight: {
    borderColor: SUCCESS,
  },
  optionLabel: {
    fontWeight: "600",
    color: "#222",
  },
  optionLabelSelected: {
    color: PRIMARY,
  },
  optionLabelHighlight: {
    color: SUCCESS,
  },
  optionSubLabel: {
    color: "#888",
    marginTop: 2,
  },
  searchBar: {
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
  clearText: {
    color: "#888",
    fontSize: 16,
    fontWeight: "700",
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyText: {
    color: "#aaa",
  },
});
