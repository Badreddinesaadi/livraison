import {
  DemandeTransfertLot,
  remplacerDemandeTransfertLot,
} from "@/api/demande-transfert.api";
import { getReplaceableTransferLots, ProduitLot } from "@/api/produit.api";
import { PRIMARY } from "@/constants/theme";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import Toast from "react-native-toast-message";

type ReplaceTransfertLotBottomSheetContentProps = {
  idDT: number;
  idProduit: string;
  productDetailId: string;
  productName: string;
  currentLot: DemandeTransfertLot;
  onClose: () => void;
};

export default function ReplaceTransfertLotBottomSheetContent({
  idDT,
  idProduit,
  productDetailId,
  productName,
  currentLot,
  onClose,
}: ReplaceTransfertLotBottomSheetContentProps) {
  const queryClient = useQueryClient();

  const currentLotCode = currentLot.Lot;

  const {
    data: availableLots,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      "produits",
      "lots",
      "remplacable",
      idDT,
      idProduit,
      currentLotCode,
    ],
    queryFn: () =>
      getReplaceableTransferLots({
        idProduit,
        idLot: currentLotCode,
        idDT,
      }),
  });

  const [selected, setSelected] = useState<string | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: (newLot: string) =>
      remplacerDemandeTransfertLot({
        type: "modifier_lot",
        idDT,
        idItem: productDetailId,
        idProduit,
        oldLot: currentLotCode,
        newLot,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["demande-transferts", "details"],
      });
      queryClient.invalidateQueries({
        queryKey: ["demande-transferts", "list"],
      });
      queryClient.invalidateQueries({
        queryKey: ["produits", "lots", "remplacable"],
      });
      Toast.show({
        type: "success",
        text1: "Lot remplacé",
        text2: "Le lot a été remplacé avec succès.",
      });
      onClose();
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Échec",
        text2: error.message || "Impossible de remplacer le lot.",
      });
    },
  });

  const handleSave = () => {
    if (!selected) {
      Toast.show({
        type: "info",
        text1: "Aucun lot sélectionné",
        text2: "Sélectionnez le lot de remplacement.",
      });
      return;
    }
    mutate(selected);
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
    const isSelected = selected === item.num_lot;

    return (
      <Pressable onPress={() => setSelected(item.num_lot)}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            paddingVertical: 10,
            paddingHorizontal: 12,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: isSelected ? PRIMARY : "#eee",
            backgroundColor: isSelected ? PRIMARY + "08" : "#fff",
            marginBottom: 8,
          }}
        >
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              borderWidth: 2,
              borderColor: isSelected ? PRIMARY : "#ccc",
              backgroundColor: isSelected ? PRIMARY : "transparent",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 10,
              marginTop: 2,
            }}
          >
            {isSelected && (
              <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>
                ✓
              </Text>
            )}
          </View>

          <View style={{ flex: 1 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Text
                style={{ fontSize: 13, fontWeight: "600", color: "#1a1a2e" }}
                numberOfLines={1}
              >
                {item.num_lot}
              </Text>
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
      </Pressable>
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
        Remplacer le lot
      </Text>
      <Text style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>
        {currentLotCode} · {productName}
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
          ) : isError ? (
            <Text style={{ color: "#ef4444" }}>
              Impossible de charger les lots remplaçables.
            </Text>
          ) : (
            <Text style={{ color: "#aaa" }}>
              Aucun lot remplaçable pour ce lot.
            </Text>
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
          {selected ? `Remplacer par : ${selected}` : "Sélectionnez un lot"}
        </Text>
        <Pressable
          onPress={handleSave}
          disabled={isPending || !selected}
          style={{
            paddingVertical: 12,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: PRIMARY,
            opacity: isPending || !selected ? 0.5 : 1,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
            {isPending ? "Enregistrement..." : "Remplacer"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
