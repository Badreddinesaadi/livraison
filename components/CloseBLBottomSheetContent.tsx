import { BLItem } from "@/api/voyage.api";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { Pressable, StyleSheet, Text, View } from "react-native";

const PRIMARY = "#ED5623";

type CloseBLBottomSheetContentProps = {
  bls: BLItem[];
  onSelectAll: () => void;
  onSelectBL: (blId: number) => void;
};

export default function CloseBLBottomSheetContent({
  bls,
  onSelectAll,
  onSelectBL,
}: CloseBLBottomSheetContentProps) {
  const isBlsHaveSameClient = bls.every(
    (bl) => bl.nomClient === bls[0].nomClient,
  );

  return (
    <BottomSheetFlatList<BLItem>
      data={bls}
      keyExtractor={(item: BLItem, i: number) => String(item.id) + i}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={
        <View>
          <Text style={styles.title}>Sélectionner une action BL</Text>

          {bls.length > 0 && (
            <>
              {isBlsHaveSameClient && bls.length > 1 && (
                <Pressable onPress={onSelectAll} style={styles.selectAllButton}>
                  <Text style={styles.selectAllText}>
                    Clôturer tous les BLs
                  </Text>
                </Pressable>
              )}
              <Text style={styles.hintText}>
                {isBlsHaveSameClient && bls.length > 1 ? "Ou c" : "C"}hoisir un
                BL
              </Text>
            </>
          )}
        </View>
      }
      renderItem={({ item }: { item: BLItem }) => (
        <Pressable
          onPress={() => onSelectBL(item.id)}
          style={styles.item}
        >
          <Text style={styles.itemCode}>{item.code}</Text>
          <Text style={styles.itemClient}>
            {item.nomClient || "Client inconnu"}
          </Text>
        </Pressable>
      )}
      ListEmptyComponent={
        <Text style={styles.emptyText}>Aucun BL disponible</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: 14,
  },
  selectAllButton: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff7f3",
    marginBottom: 12,
  },
  selectAllText: {
    fontWeight: "600",
    color: PRIMARY,
  },
  hintText: {
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
  itemCode: {
    fontWeight: "600",
    color: "#222",
  },
  itemClient: {
    color: "#888",
    marginTop: 2,
  },
  emptyText: {
    color: "#aaa",
  },
});
