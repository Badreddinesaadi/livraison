import { DevisProduitLot, remplacerDevisLot } from "@/api/preparation-devis.api";
import { getProductLots, ProduitLot } from "@/api/produit.api";
import { PRIMARY } from "@/constants/theme";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Toast from "react-native-toast-message";

type ReplaceDevisLotsBottomSheetContentProps = {
  idDevis: number;
  idProduit: number;
  productName: string;
  currentLot: DevisProduitLot;
  currentLots: DevisProduitLot[];
  onClose: () => void;
};

export default function ReplaceDevisLotsBottomSheetContent({
  idDevis,
  idProduit,
  productName,
  currentLot,
  currentLots,
  onClose,
}: ReplaceDevisLotsBottomSheetContentProps) {
  const queryClient = useQueryClient();

  const { data: availableLots, isLoading } = useQuery({
    queryKey: ["produits", "lots", idProduit],
    queryFn: () => getProductLots({ idProduit }),
  });

  const [selected, setSelected] = useState<string | null>(null);

  const currentLotCode = currentLot.id ?? currentLot.code;

  // Lots already on the devis line (other than the one being replaced) cannot be
  // chosen again — the server rejects a replacement already present on the line.
  const lineLotSet = useMemo(
    () =>
      new Set(
        (currentLots ?? [])
          .map((l) => l.id ?? l.code)
          .filter((code) => code !== currentLotCode),
      ),
    [currentLots, currentLotCode],
  );

  const { mutate, isPending } = useMutation({
    mutationFn: (idNouveauLot: string) =>
      remplacerDevisLot({
        type: "remplacer_lot",
        idDevis,
        idProduit,
        idLot: currentLotCode,
        idNouveauLot,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["preparation-devis", "produits"],
      });
      queryClient.invalidateQueries({
        queryKey: ["preparation-devis", "list"],
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
    const isCurrentLot = item.num_lot === currentLotCode;
    const isOnLine = lineLotSet.has(item.num_lot);
    const isUnavailable = isCurrentLot || isOnLine;
    const isSelected = selected === item.num_lot;

    const content = (
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          paddingVertical: 10,
          paddingHorizontal: 12,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: isUnavailable
            ? "#e5e7eb"
            : isSelected
              ? PRIMARY
              : "#eee",
          backgroundColor: isUnavailable
            ? "#f9fafb"
            : isSelected
              ? PRIMARY + "08"
              : "#fff",
          marginBottom: 8,
          opacity: isUnavailable ? 0.55 : 1,
        }}
      >
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 11,
            borderWidth: 2,
            borderColor: isUnavailable
              ? "#d1d5db"
              : isSelected
                ? PRIMARY
                : "#ccc",
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
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text
              style={{ fontSize: 13, fontWeight: "600", color: "#1a1a2e" }}
              numberOfLines={1}
            >
              {item.num_lot}
            </Text>
            {isCurrentLot && (
              <View
                style={{
                  paddingHorizontal: 5,
                  paddingVertical: 1,
                  borderRadius: 4,
                  backgroundColor: "#f59e0b18",
                }}
              >
                <Text
                  style={{ fontSize: 10, fontWeight: "600", color: "#b45309" }}
                >
                  À remplacer
                </Text>
              </View>
            )}
            {isOnLine && (
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
                  Sur la ligne
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

    if (isUnavailable) {
      return content;
    }

    return (
      <Pressable onPress={() => setSelected(item.num_lot)}>{content}</Pressable>
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
