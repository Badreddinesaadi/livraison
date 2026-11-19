import {
  addProductToDT,
  AddProductToDTRequest,
} from "@/api/demande-transfert.api";
import { listProduits, Produit } from "@/api/produit.api";
import { PRIMARY } from "@/constants/theme";
import {
  BottomSheetFlatList,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";

type AddProductBottomSheetContentProps = {
  idDT: number;
  onClose: () => void;
};

const UNITE_OPTIONS: { id: number; label: string; value: string }[] = [
  { id: 1, label: "Pièces (pcs)", value: "pcs" },
  { id: 2, label: "FDX", value: "fdx" },
];

export default function AddProductBottomSheetContent({
  idDT,
  onClose,
}: AddProductBottomSheetContentProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedProduct, setSelectedProduct] = useState<Produit | null>(null);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [nbrFDX, setNbrFDX] = useState("");
  const [qte, setQte] = useState("");
  const [unite, setUnite] = useState("pcs");

  const { data: produits, isLoading } = useQuery({
    queryKey: ["produits", "list"],
    queryFn: listProduits,
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchText.trim().toLowerCase());
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchText]);

  const filteredProduits = useMemo(() => {
    if (!produits) return [];
    if (!debouncedSearch) return produits;
    return produits.filter((p) => {
      const s = [
        p.produit,
        p.reference,
        p.categorie,
        p.scategorie,
        p.marque,
        p.fournisseur,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return s.includes(debouncedSearch);
    });
  }, [produits, debouncedSearch]);

  const { mutate, isPending } = useMutation({
    mutationFn: addProductToDT,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["demande-transferts", "details"],
      });
      queryClient.invalidateQueries({
        queryKey: ["demande-transferts", "list"],
      });
      Toast.show({
        type: "success",
        text1: "Produit ajouté",
        text2: "Le produit a été ajouté avec succès.",
      });
      onClose();
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Échec",
        text2: error.message || "Impossible d'ajouter le produit.",
      });
    },
  });

  const handleSelectProduct = useCallback((product: Produit) => {
    setSelectedProduct(product);
    setStep(2);
  }, []);

  const handleSubmit = () => {
    if (!selectedProduct) {
      Toast.show({
        type: "error",
        text1: "Produit requis",
        text2: "Veuillez sélectionner un produit.",
      });
      return;
    }
    if (!nbrFDX.trim() || Number(nbrFDX) <= 0) {
      Toast.show({
        type: "error",
        text1: "Nombre FDX requis",
        text2: "Veuillez saisir un nombre valide.",
      });
      return;
    }
    if (!qte.trim() || Number(qte) <= 0) {
      Toast.show({
        type: "error",
        text1: "Quantité requise",
        text2: "Veuillez saisir une quantité valide.",
      });
      return;
    }

    const payload: AddProductToDTRequest = {
      type: "detail",
      idDT,
      idProduit: selectedProduct.produit_id,
      nbrFDX: Number(nbrFDX),
      qte: Number(qte),
      unite,
      lots: [],
    };
    mutate(payload);
  };

  const handleBack = () => {
    setStep(1);
    setSelectedProduct(null);
  };

  if (step === 2 && selectedProduct) {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.title}>Ajouter un produit</Text>

        <View style={styles.productCard}>
          <Text style={styles.productName} numberOfLines={2}>
            {selectedProduct.produit}
          </Text>
          <Text style={styles.productMeta}>
            {selectedProduct.reference} · {selectedProduct.categorie}
          </Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Nombre FDX</Text>
          <BottomSheetTextInput
            value={nbrFDX}
            onChangeText={setNbrFDX}
            placeholder="Nombre de FDX"
            placeholderTextColor="#bbb"
            keyboardType="decimal-pad"
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Quantité</Text>
          <BottomSheetTextInput
            value={qte}
            onChangeText={setQte}
            placeholder="Quantité"
            placeholderTextColor="#bbb"
            keyboardType="decimal-pad"
            style={styles.input}
          />
        </View>

        <View style={styles.fieldLast}>
          <Text style={styles.label}>Unité</Text>
          <View style={styles.unitRow}>
            {UNITE_OPTIONS.map((opt) => (
              <Pressable
                key={opt.id}
                onPress={() => setUnite(opt.value)}
                style={[
                  styles.unitOption,
                  unite === opt.value && styles.unitOptionSelected,
                ]}
              >
                <Text
                  style={[
                    styles.unitOptionText,
                    unite === opt.value && styles.unitOptionTextSelected,
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.actionRow}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>Retour</Text>
          </Pressable>
          <Pressable
            onPress={handleSubmit}
            disabled={isPending}
            style={[
              styles.submitButton,
              isPending && styles.submitButtonPending,
            ]}
          >
            <Text style={styles.submitButtonText}>
              {isPending ? "Ajout..." : "Ajouter"}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ajouter un produit</Text>

      <View style={styles.searchBar}>
        <BottomSheetTextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Rechercher un produit..."
          placeholderTextColor="#bbb"
          style={styles.searchInput}
        />
        {searchText ? (
          <Pressable onPress={() => setSearchText("")} hitSlop={8}>
            <Text style={styles.clearText}>✕</Text>
          </Pressable>
        ) : null}
      </View>

      <BottomSheetFlatList<Produit>
        data={filteredProduits}
        keyExtractor={(item: Produit) => String(item.produit_id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }: { item: Produit }) => (
          <Pressable
            onPress={() => handleSelectProduct(item)}
            style={styles.item}
          >
            <Text style={styles.itemTitle} numberOfLines={2}>
              {item.produit}
            </Text>
            <Text style={styles.itemMeta}>
              {item.reference} · {item.categorie} · {item.unite_v}
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={
          isLoading ? (
            <Text style={styles.emptyText}>Chargement...</Text>
          ) : (
            <Text style={styles.emptyText}>
              {debouncedSearch
                ? "Aucun produit trouvé"
                : "Aucun produit disponible"}
            </Text>
          )
        }
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        windowSize={8}
        removeClippedSubviews
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  stepContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: 14,
  },
  productCard: {
    backgroundColor: "#f7f8fa",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a2e",
  },
  productMeta: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  field: {
    marginBottom: 10,
  },
  fieldLast: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#e8e8e8",
    borderRadius: 10,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#11181C",
  },
  unitRow: {
    flexDirection: "row",
    gap: 8,
  },
  unitOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e8e8e8",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  unitOptionSelected: {
    borderColor: PRIMARY,
    backgroundColor: PRIMARY + "18",
  },
  unitOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
  },
  unitOptionTextSelected: {
    color: PRIMARY,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
  },
  backButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  backButtonText: {
    color: "#555",
    fontWeight: "700",
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PRIMARY,
  },
  submitButtonPending: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "700",
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
  item: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  itemTitle: {
    fontWeight: "600",
    color: "#222",
    fontSize: 14,
  },
  itemMeta: {
    color: "#888",
    marginTop: 2,
    fontSize: 12,
  },
  emptyText: {
    color: "#aaa",
  },
});
