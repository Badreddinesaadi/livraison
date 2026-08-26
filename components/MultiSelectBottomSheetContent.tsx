import { PRIMARY } from "@/constants/theme";
import { RvtOption } from "@/stores/rvt-sheet.store";
import {
  BottomSheetFlatList,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  ListRenderItem,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type MultiSelectItem = RvtOption & { selected?: boolean };

type MultiSelectBottomSheetContentProps = {
  title: string;
  items: MultiSelectItem[];
  onToggle: (id: string) => void;
  onConfirm: () => void;
  enableSearch?: boolean;
  searchPlaceholder?: string;
  confirmLabel?: string;
};

const MultiSelectRowItem = memo(function MultiSelectRowItem({
  item,
  onToggle,
}: {
  item: MultiSelectItem;
  onToggle: (id: string) => void;
}) {
  const selected = item.selected === true;
  return (
    <Pressable
      onPress={() => onToggle(item.id)}
      style={[styles.item, selected && styles.itemSelected]}
    >
      <View style={styles.itemTextWrap}>
        <Text style={[styles.itemLabel, selected && styles.itemLabelSelected]}>
          {item.label}
        </Text>
        {item.subLabel ? (
          <Text style={styles.itemSubLabel}>{item.subLabel}</Text>
        ) : null}
      </View>
      <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
        {selected ? <Text style={styles.checkmark}>✓</Text> : null}
      </View>
    </Pressable>
  );
});

export default function MultiSelectBottomSheetContent({
  title,
  items,
  onToggle,
  onConfirm,
  enableSearch = false,
  searchPlaceholder = "Rechercher...",
  confirmLabel = "Valider",
}: MultiSelectBottomSheetContentProps) {
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const shouldShowSearch = enableSearch || items.length > 5;
  const selectedCount = useMemo(
    () => items.filter((i) => i.selected).length,
    [items],
  );

  useEffect(() => {
    if (!shouldShowSearch) return;
    const timeout = setTimeout(
      () => setDebouncedSearch(searchText.trim().toLowerCase()),
      300,
    );
    return () => clearTimeout(timeout);
  }, [searchText, shouldShowSearch]);

  const filteredItems = useMemo(() => {
    if (!shouldShowSearch || !debouncedSearch) return items;
    return items.filter((item) => {
      const label = item.label.toLowerCase();
      const subLabel = (item.subLabel || "").toLowerCase();
      return (
        label.includes(debouncedSearch) || subLabel.includes(debouncedSearch)
      );
    });
  }, [items, shouldShowSearch, debouncedSearch]);

  const keyExtractor = useCallback((item: MultiSelectItem) => item.id, []);

  const renderItem = useCallback<ListRenderItem<MultiSelectItem>>(
    ({ item }) => <MultiSelectRowItem item={item} onToggle={onToggle} />,
    [onToggle],
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.counterPill}>
          <Text style={styles.counterText}>
            {selectedCount} sélectionné{selectedCount > 1 ? "s" : ""}
          </Text>
        </View>
      </View>

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

      <BottomSheetFlatList<MultiSelectItem>
        data={filteredItems}
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
              : "Aucune option disponible"}
          </Text>
        }
      />

      <Pressable onPress={onConfirm} style={styles.confirmButton}>
        <Text style={styles.confirmText}>
          {confirmLabel} ({selectedCount})
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a2e",
  },
  counterPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: PRIMARY + "18",
  },
  counterText: {
    fontSize: 12,
    fontWeight: "700",
    color: PRIMARY,
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
    paddingBottom: 16,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemSelected: {
    borderColor: PRIMARY,
    backgroundColor: PRIMARY + "08",
  },
  itemTextWrap: {
    flex: 1,
    paddingRight: 10,
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
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    borderColor: PRIMARY,
    backgroundColor: PRIMARY,
  },
  checkmark: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  empty: {
    color: "#aaa",
  },
  confirmButton: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmText: {
    color: "#fff",
    fontWeight: "700",
  },
});
