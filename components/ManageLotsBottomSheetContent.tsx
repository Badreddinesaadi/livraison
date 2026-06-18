import {
  DemandeTransfertLot,
  updateProductLots,
} from "@/api/demande-transfert.api";
import { getProductLots, ProduitLot } from "@/api/produit.api";
import { PRIMARY, SUCCESS } from "@/constants/theme";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Toast from "react-native-toast-message";

type ManageLotsBottomSheetContentProps = {
  idDT: number;
  idProduit: string;
  productDetailId: string;
  productName: string;
  currentLots: DemandeTransfertLot[];
  onClose: () => void;
};

export default function ManageLotsBottomSheetContent({
  idDT,
  idProduit,
  productDetailId,
  productName,
  currentLots,
  onClose,
}: ManageLotsBottomSheetContentProps) {
  const queryClient = useQueryClient();

  const { data: availableLots, isLoading } = useQuery({
    queryKey: ["produits", "lots", idProduit],
    queryFn: () => getProductLots({ idProduit }),
  });

  const [selectedLotNumbers, setSelectedLotNumbers] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    if (currentLots) {
      const initial = new Set(currentLots.map((l) => l.Lot));
      setSelectedLotNumbers(initial);
    }
  }, [currentLots]);

  const currentLotSet = useMemo(
    () => new Set(currentLots.map((l) => l.Lot)),
    [currentLots],
  );

  const preparedLotSet = useMemo(
    () =>
      new Set(
        currentLots
          .filter((l) => (l.preparer ?? "").toLowerCase() === "oui")
          .map((l) => l.Lot),
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
    mutationFn: updateProductLots,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["demande-transferts", "details"],
      });
      queryClient.invalidateQueries({
        queryKey: ["demande-transferts", "list"],
      });
      Toast.show({
        type: "success",
        text1: "Lots mis à jour",
        text2: "Les lots ont été mis à jour avec succès.",
      });
      onClose();
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Échec",
        text2: error.message || "Impossible de mettre à jour les lots.",
      });
    },
  });

  const handleSave = () => {
    const idItem = currentLots[0]?.idItem || productDetailId;

    const lotsUpdate: {
      idItem: string;
      idProduit: number;
      old_lot: string;
      new_lot: string;
      qte: number;
    }[] = [];
    const lotsInsert: {
      idItem: string;
      idProduit: number;
      Lot: string;
      qte: number;
    }[] = [];
    const lotsDelete: {
      idItem: string;
      idProduit: string;
      Lot: string;
    }[] = [];

    const toDelete: { idItem: string; idProduit: string; Lot: string }[] = [];
    const toInsert: { Lot: string; qte: number }[] = [];

    currentLots.forEach((lot) => {
      const isSelected = selectedLotNumbers.has(lot.Lot);
      const isPrepared = (lot.preparer ?? "").toLowerCase() === "oui";

      if (isPrepared) return;

      if (isSelected) {
        const availableLot = availableLots?.find(
          (al) => al.num_lot === lot.Lot,
        );
        lotsUpdate.push({
          idItem: lot.idItem,
          idProduit: Number(lot.idProduit),
          old_lot: lot.Lot,
          new_lot: lot.Lot,
          qte: availableLot ? Number(availableLot.solde) || Number(lot.qte) || 1 : Number(lot.qte) || 1,
        });
      } else {
        toDelete.push({
          idItem: lot.idItem,
          idProduit: lot.idProduit,
          Lot: lot.Lot,
        });
      }
    });

    selectedLotNumbers.forEach((lotNum) => {
      if (!currentLotSet.has(lotNum)) {
        const availableLot = availableLots?.find((al) => al.num_lot === lotNum);
        toInsert.push({
          Lot: lotNum,
          qte: availableLot ? Number(availableLot.solde) || 1 : 1,
        });
      }
    });

    const pairCount = Math.min(toDelete.length, toInsert.length);
    for (let i = 0; i < pairCount; i++) {
      lotsUpdate.push({
        idItem: toDelete[i].idItem,
        idProduit: Number(toDelete[i].idProduit),
        old_lot: toDelete[i].Lot,
        new_lot: toInsert[i].Lot,
        qte: toInsert[i].qte,
      });
    }
    for (let i = pairCount; i < toDelete.length; i++) {
      lotsDelete.push(toDelete[i]);
    }
    for (let i = pairCount; i < toInsert.length; i++) {
      lotsInsert.push({
        idProduit: Number(idProduit),
        Lot: toInsert[i].Lot,
        qte: toInsert[i].qte,
        idItem,
      });
    }

    if (lotsUpdate.length === 0 && lotsInsert.length === 0 && lotsDelete.length === 0) {
      Toast.show({
        type: "info",
        text1: "Aucun changement",
        text2: "Aucune modification détectée.",
      });
      onClose();
      return;
    }

    mutate({
      type: "update_lot",
      lots_update: lotsUpdate,
      lots_insert: lotsInsert,
      lots_delete: lotsDelete,
    });
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
        Gérer les lots
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
          {selectedLotNumbers.size} lot
          {selectedLotNumbers.size !== 1 ? "s" : ""} sélectionné
          {selectedLotNumbers.size !== 1 ? "s" : ""}
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
