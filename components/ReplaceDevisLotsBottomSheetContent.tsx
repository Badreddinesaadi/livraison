import { DevisProduitLot, remplacerDevisLot } from "@/api/preparation-devis.api";
import { getProductLots, ProduitLot } from "@/api/produit.api";
import { PRIMARY, SUCCESS } from "@/constants/theme";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Toast from "react-native-toast-message";

type ReplaceDevisLotsBottomSheetContentProps = {
  idDevis: number;
  idProduit: number;
  productName: string;
  currentLots: DevisProduitLot[];
  onClose: () => void;
};

type LotSwap = { idLot: string; idNouveauLot: string };

export default function ReplaceDevisLotsBottomSheetContent({
  idDevis,
  idProduit,
  productName,
  currentLots,
  onClose,
}: ReplaceDevisLotsBottomSheetContentProps) {
  const queryClient = useQueryClient();

  const { data: availableLots, isLoading } = useQuery({
    queryKey: ["produits", "lots", idProduit],
    queryFn: () => getProductLots({ idProduit }),
  });

  const [selectedLotNumbers, setSelectedLotNumbers] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSelectedLotNumbers(
        new Set((currentLots ?? []).map((l) => l.id ?? l.code)),
      );
    }, 0);
    return () => clearTimeout(timeout);
  }, [currentLots]);

  const currentLotSet = useMemo(
    () => new Set((currentLots ?? []).map((l) => l.id ?? l.code)),
    [currentLots],
  );

  const preparedLotSet = useMemo(
    () =>
      new Set(
        (currentLots ?? [])
          .filter((l) => l.preparation)
          .map((l) => l.id ?? l.code),
      ),
    [currentLots],
  );

  const toggleLot = (lotNum: string) => {
    if (preparedLotSet.has(lotNum)) return;
    setSelectedLotNumbers((prev) => {
      const next = new Set(prev);
      if (next.has(lotNum)) {
        next.delete(lotNum);
      } else {
        next.add(lotNum);
      }
      return next;
    });
  };

  const { mutate, isPending } = useMutation({
    mutationFn: async (swaps: LotSwap[]) => {
      for (const swap of swaps) {
        await remplacerDevisLot({
          type: "remplacer_lot",
          idDevis,
          idProduit,
          idLot: swap.idLot,
          idNouveauLot: swap.idNouveauLot,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["preparation-devis", "produits"],
      });
      queryClient.invalidateQueries({
        queryKey: ["preparation-devis", "list"],
      });
      Toast.show({
        type: "success",
        text1: "Lots remplacés",
        text2: "Les lots ont été remplacés avec succès.",
      });
      onClose();
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Échec",
        text2: error.message || "Impossible de remplacer les lots.",
      });
    },
  });

  const handleSave = () => {
    const toDelete: string[] = [];
    const toInsert: string[] = [];

    (currentLots ?? []).forEach((lot) => {
      const lotNum = lot.id ?? lot.code;
      const isSelected = selectedLotNumbers.has(lotNum);
      if (lot.preparation) return;
      if (!isSelected) {
        toDelete.push(lotNum);
      }
    });

    selectedLotNumbers.forEach((lotNum) => {
      if (!currentLotSet.has(lotNum)) {
        toInsert.push(lotNum);
      }
    });

    if (toDelete.length === 0 && toInsert.length === 0) {
      Toast.show({
        type: "info",
        text1: "Aucun changement",
        text2: "Aucune modification détectée.",
      });
      onClose();
      return;
    }

    if (toDelete.length !== toInsert.length) {
      Toast.show({
        type: "info",
        text1: "Nombre de lots différent",
        text2: "Sélectionnez autant de nouveaux lots que de lots à remplacer.",
      });
      return;
    }

    const swaps: LotSwap[] = toDelete.map((idLot, index) => ({
      idLot,
      idNouveauLot: toInsert[index],
    }));

    mutate(swaps);
  };

  const formatLotDate = (value?: string | null) => {
    if (!value) return "-";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const renderItem = ({ item }: { item: ProduitLot }) => {
    const isSelected = selectedLotNumbers.has(item.num_lot);
    const isCurrent = currentLotSet.has(item.num_lot);
    const isPrepared = preparedLotSet.has(item.num_lot);

    const content = (
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          paddingVertical: 10,
          paddingHorizontal: 12,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: isPrepared
            ? "#d1d5db"
            : isSelected
              ? PRIMARY
              : "#eee",
          backgroundColor: isPrepared
            ? "#f3f4f6"
            : isSelected
              ? PRIMARY + "08"
              : "#fff",
          marginBottom: 8,
          opacity: isPrepared ? 0.55 : 1,
        }}
      >
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 4,
            borderWidth: 2,
            borderColor: isPrepared
              ? "#d1d5db"
              : isSelected
                ? PRIMARY
                : "#ccc",
            backgroundColor: isPrepared
              ? "#d1d5db"
              : isSelected
                ? PRIMARY
                : "transparent",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 10,
            marginTop: 2,
          }}
        >
          {(isSelected || isPrepared) && (
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>
              ✓
            </Text>
          )}
        </View>

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text
              style={{ fontSize: 13, fontWeight: "600", color: "#1a1a2e" }}
              numberOfLines={1}
            >
              {item.num_lot}
            </Text>
            {isPrepared && (
              <View
                style={{
                  paddingHorizontal: 5,
                  paddingVertical: 1,
                  borderRadius: 4,
                  backgroundColor: SUCCESS + "18",
                }}
              >
                <Text
                  style={{ fontSize: 10, fontWeight: "600", color: SUCCESS }}
                >
                  Préparé
                </Text>
              </View>
            )}
            {isCurrent && !isPrepared && (
              <View
                style={{
                  paddingHorizontal: 5,
                  paddingVertical: 1,
                  borderRadius: 4,
                  backgroundColor: PRIMARY + "18",
                }}
              >
                <Text
                  style={{ fontSize: 10, fontWeight: "600", color: PRIMARY }}
                >
                  Actuel
                </Text>
              </View>
            )}
          </View>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              marginTop: 4,
              gap: 6,
            }}
          >
            <Text style={{ fontSize: 11, color: "#666" }}>
              Qte: {item.qte_uv ?? item.solde} {item.unite_v}
            </Text>
            <Text style={{ fontSize: 11, color: "#666" }}>
              PCE: {item.nbrePiece ?? "-"}
            </Text>
            <Text style={{ fontSize: 11, color: "#666" }}>
              Long: {item.longueur ?? "-"}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              marginTop: 2,
              gap: 6,
            }}
          >
            <Text style={{ fontSize: 11, color: "#888" }}>
              {item.depot ?? "-"}
            </Text>
            <Text style={{ fontSize: 11, color: "#888" }}>
              {formatLotDate(item.date)}
            </Text>
          </View>
        </View>
      </View>
    );

    if (isPrepared) {
      return content;
    }

    return (
      <Pressable onPress={() => toggleLot(item.num_lot)}>{content}</Pressable>
    );
  };

  const changedCount = useMemo(() => {
    let removed = 0;
    (currentLots ?? []).forEach((lot) => {
      if (lot.preparation) return;
      if (!selectedLotNumbers.has(lot.id ?? lot.code)) removed += 1;
    });
    let added = 0;
    selectedLotNumbers.forEach((lotNum) => {
      if (!currentLotSet.has(lotNum)) added += 1;
    });
    return Math.max(removed, added);
  }, [currentLots, selectedLotNumbers, currentLotSet]);

  return (
    <View style={{ flex: 1, paddingHorizontal: 16 }}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: "700",
          color: "#1a1a2e",
          marginBottom: 4,
        }}
      >
        Remplacer les lots
      </Text>
      <Text
        style={{ fontSize: 12, color: "#888", marginBottom: 10 }}
        numberOfLines={2}
      >
        {productName}
      </Text>

      <BottomSheetFlatList<ProduitLot>
        data={availableLots ?? []}
        keyExtractor={(item: ProduitLot) => item.num_lot}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 12 }}
        renderItem={renderItem}
        ListEmptyComponent={
          isLoading ? (
            <Text style={{ color: "#aaa" }}>Chargement des lots...</Text>
          ) : (
            <Text style={{ color: "#aaa" }}>Aucun lot disponible</Text>
          )
        }
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        windowSize={8}
        removeClippedSubviews
      />

      <View
        style={{
          backgroundColor: "#fff",
          paddingTop: 10,
          paddingBottom: 12,
          borderTopWidth: 1,
          borderTopColor: "#eee",
        }}
      >
        <Text style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>
          {changedCount} remplacement{changedCount !== 1 ? "s" : ""}
        </Text>
        <Pressable
          onPress={handleSave}
          disabled={isPending}
          style={{
            paddingVertical: 12,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: PRIMARY,
            opacity: isPending ? 0.7 : 1,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
            {isPending ? "Enregistrement..." : "Enregistrer"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
