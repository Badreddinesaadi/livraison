import {
  DemandeTransfertLot,
  remplacerDemandeTransfertLot,
} from "@/api/demande-transfert.api";
import { getReplaceableTransferLots, ProduitLot } from "@/api/produit.api";
import { PRIMARY } from "@/constants/theme";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
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
          style={[
            styles.lotCard,
            isSelected && styles.lotCardSelected,
          ]}
        >
          <View
            style={[
              styles.checkbox,
              isSelected && styles.checkboxSelected,
            ]}
          >
            {isSelected && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </View>

          <View style={styles.flexOne}>
            <View style={styles.titleRow}>
              <Text style={styles.lotTitle} numberOfLines={1}>
                {item.num_lot}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>
                Qte: {item.qte_uv ?? item.solde} {item.unite_v}
              </Text>
              <Text style={styles.metaText}>
                PCE: {item.nbrePiece ?? "-"}
              </Text>
              <Text style={styles.metaText}>
                Long: {item.longueur ?? "-"}
              </Text>
            </View>
            <View style={styles.metaRowSub}>
              <Text style={styles.metaTextMuted}>
                {item.depot ?? "-"}
              </Text>
              <Text style={styles.metaTextMuted}>
                {formatLotDate(item.date)}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Remplacer le lot</Text>
      <Text style={styles.subtitle}>
        {currentLotCode} · {productName}
      </Text>

      <BottomSheetFlatList<ProduitLot>
        data={availableLots ?? []}
        keyExtractor={(item: ProduitLot) => item.num_lot}
        showsVerticalScrollIndicator={false}
        style={styles.flexOne}
        contentContainerStyle={styles.listContent}
        renderItem={renderItem}
        ListEmptyComponent={
          isLoading ? (
            <Text style={styles.emptyText}>Chargement des lots...</Text>
          ) : isError ? (
            <Text style={styles.errorText}>
              Impossible de charger les lots remplaçables.
            </Text>
          ) : (
            <Text style={styles.emptyText}>
              Aucun lot remplaçable pour ce lot.
            </Text>
          )
        }
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        windowSize={8}
        removeClippedSubviews
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {selected ? `Remplacer par : ${selected}` : "Sélectionnez un lot"}
        </Text>
        <Pressable
          onPress={handleSave}
          disabled={isPending || !selected}
          style={[
            styles.submitButton,
            (isPending || !selected) && styles.submitButtonDisabled,
          ]}
        >
          <Text style={styles.submitButtonText}>
            {isPending ? "Enregistrement..." : "Remplacer"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: "#888",
    marginBottom: 10,
  },
  flexOne: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 12,
  },
  lotCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  lotCardSelected: {
    borderColor: PRIMARY,
    backgroundColor: PRIMARY + "08",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#ccc",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    marginTop: 2,
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
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  lotTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1a1a2e",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
    gap: 6,
  },
  metaRowSub: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 2,
    gap: 6,
  },
  metaText: {
    fontSize: 11,
    color: "#666",
  },
  metaTextMuted: {
    fontSize: 11,
    color: "#888",
  },
  emptyText: {
    color: "#aaa",
  },
  errorText: {
    color: "#ef4444",
  },
  footer: {
    backgroundColor: "#fff",
    paddingTop: 10,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  footerText: {
    fontSize: 12,
    color: "#888",
    marginBottom: 8,
  },
  submitButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PRIMARY,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
