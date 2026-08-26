import {
  RvtFooterButton,
  RvtPresenceLevels,
  RvtSelectorField,
  RvtTextInput,
  SectionCard,
} from "@/components/RvtFormFields";
import { hasRapportVisitePermission } from "@/constants/permissions";
import { PRIMARY } from "@/constants/theme";
import { useReferenceData } from "@/hooks/use-reference-data";
import { useSession } from "@/stores/auth.store";
import { useCreateVisitStore } from "@/stores/create-visit.store";
import { useRvtSheetStore } from "@/stores/rvt-sheet.store";
import { PresenceLevel } from "@/types/rvt.types";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";

type DetailKey =
  | "quality"
  | "essence"
  | "decor"
  | "finish"
  | "thickness"
  | "section"
  | "dimensions"
  | "quantity"
  | "price";

const newLineId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export default function CreateRvtMarcheScreen() {
  const router = useRouter();
  const { user } = useSession();
  const canCreate = hasRapportVisitePermission(user, "CREATE");
  const store = useCreateVisitStore();
  const openSelect = useRvtSheetStore((s) => s.openSelect);
  const openMultiSelect = useRvtSheetStore((s) => s.openMultiSelect);
  const { data: refData } = useReferenceData();

  const categories = refData?.categories ?? [];
  const productSuggestions = refData?.productSuggestions ?? {};
  const subCategories = refData?.subCategories ?? {};
  const allQualityOptions = refData?.allQualityOptions ?? [];
  const qualityTags = refData?.qualityTags ?? [];
  const hardwoodEssences = refData?.hardwoodEssences ?? [];
  const panelThicknesses = refData?.panelThicknesses ?? [];
  const panelDimensions = refData?.panelDimensions ?? [];
  const panelDecors = refData?.panelDecors ?? [];
  const panelFinitions = refData?.panelFinitions ?? [];
  const boisSections = refData?.boisSections ?? [];
  const poutreH20Lengths = refData?.poutreH20Lengths ?? [];
  const madrierLengths = refData?.madrierLengths ?? [];
  const madrierThicknesses = refData?.madrierThicknesses ?? [];
  const btpCraneOptions = refData?.btpCraneOptions ?? [];

  const allProductSuggestions = useMemo(() => {
    const suggestions = refData?.productSuggestions ?? {};
    const result: { id: string; label: string; category: string }[] = [];
    Object.entries(suggestions).forEach(([category, list]) => {
      list.forEach((label) =>
        result.push({ id: label, label, category }),
      );
    });
    return result;
  }, [refData?.productSuggestions]);

  const allBrands = useMemo(() => {
    const byCategory = refData?.brandsByCategory ?? {};
    const extra = refData?.extraPanelBrands ?? [];
    const result: { id: string; label: string; category?: string }[] = [];
    Object.entries(byCategory).forEach(([category, brands]) => {
      brands.forEach((brand) =>
        result.push({ id: brand, label: brand, category }),
      );
    });
    extra.forEach((brand) => result.push({ id: brand, label: brand }));
    return result;
  }, [refData?.brandsByCategory, refData?.extraPanelBrands]);

  const selectedProductsByCategory = store.products.reduce<
    Record<string, typeof store.products>
  >((acc, product) => {
    const category = findCategory(product.productId);
    const categoryLabel = category ?? "Autres";
    if (!acc[categoryLabel]) acc[categoryLabel] = [];
    acc[categoryLabel].push(product);
    return acc;
  }, {});

  function findCategory(productId: string): string | null {
    for (const category of categories) {
      if ((productSuggestions[category] ?? []).includes(productId)) {
        return category;
      }
    }
    return null;
  }

  const handleAddProduct = () => {
    if (!allProductSuggestions.length) {
      Toast.show({
        type: "error",
        text1: "Catalogue vide",
        text2: "Impossible de charger le catalogue produits.",
      });
      return;
    }
    openSelect({
      title: "Ajouter un produit",
      options: allProductSuggestions.map((p) => ({
        id: p.id,
        label: p.label,
        subLabel: p.category,
      })),
      enableSearch: true,
      searchPlaceholder: "Rechercher un produit...",
      onSelect: (id) => {
        if (store.products.some((p) => p.productId === id)) {
          Toast.show({
            type: "info",
            text1: "Déjà ajouté",
            text2: "Ce produit est déjà dans la liste.",
          });
          return;
        }
        store.addProduct({ lineId: newLineId(), productId: id });
      },
    });
  };

  const handleOpenBrandsSheet = () => {
    if (!allBrands.length) {
      Toast.show({
        type: "error",
        text1: "Aucune marque",
        text2: "Le référentiel des marques est vide.",
      });
      return;
    }
    openMultiSelect({
      title: "Marques observées",
      items: allBrands.map((b) => ({
        id: b.id,
        label: b.label,
        subLabel: b.category,
      })),
      getSelectedIds: () =>
        useCreateVisitStore.getState().brands.map((b) => b.brandId),
      enableSearch: true,
      searchPlaceholder: "Rechercher une marque...",
      onToggle: (id) => {
        const state = useCreateVisitStore.getState();
        if (state.brands.some((b) => b.brandId === id)) {
          state.removeBrand(id);
        } else {
          state.addBrand(id);
        }
      },
      onConfirm: () => {},
    });
  };

  const updateProductPresence = (lineId: string, presence: PresenceLevel) => {
    store.updateProduct(lineId, { presence });
  };

  const updateProductDetail = (
    lineId: string,
    key: DetailKey,
    value: string,
  ) => {
    store.updateProduct(lineId, {
      details: {
        ...(store.products.find((p) => p.lineId === lineId)?.details ?? {}),
        [key]: value,
      },
    });
  };

  const renderDetailOptions = (lineId: string, category: string | null) => {
    const line = store.products.find((p) => p.lineId === lineId);
    const details = line?.details ?? {};

    const pick = (
      title: string,
      options: string[],
      current: string | undefined,
      key: DetailKey,
    ) => {
      if (!options.length) return null;
      return (
        <RvtSelectorField
          label={title}
          value={current}
          placeholder="Sélectionner"
          onPress={() =>
            openSelect({
              title,
              options: options.map((o) => ({ id: o, label: o })),
              selectedId: current,
              onSelect: (v) => updateProductDetail(lineId, key, v),
            })
          }
        />
      );
    };

    let hasOptions = false;

    const optionsByCategory = (
      title: string,
      options: string[],
      key: DetailKey,
    ) => {
      if (!options.length) return null;
      hasOptions = true;
      return pick(title, options, details[key], key);
    };

    const subCategoryOptions = category ? (subCategories[category] ?? []) : [];

    return (
      <View style={styles.productDetails}>
        {category === "BOIS" ? (
          <>
            {optionsByCategory("Qualité / choix", allQualityOptions, "quality")}
            {optionsByCategory("Section", boisSections, "section")}
          </>
        ) : category === "BOIS DUR" ? (
          <>
            {optionsByCategory("Essence", hardwoodEssences, "essence")}
            {optionsByCategory("Qualité", qualityTags, "quality")}
          </>
        ) : category === "PANNEAUX" ? (
          <>
            {optionsByCategory("Épaisseur", panelThicknesses, "thickness")}
            {optionsByCategory("Dimension", panelDimensions, "dimensions")}
            {optionsByCategory("Décor", panelDecors, "decor")}
            {optionsByCategory("Finition", panelFinitions, "finish")}
          </>
        ) : category === "BTP" ? (
          <>
            {optionsByCategory(
              "Longueur madrier",
              madrierLengths,
              "dimensions",
            )}
            {optionsByCategory(
              "Épaisseur madrier",
              madrierThicknesses,
              "thickness",
            )}
            {optionsByCategory(
              "Longueur poutre H20",
              poutreH20Lengths,
              "dimensions",
            )}
            {optionsByCategory("Grues", btpCraneOptions, "quantity")}
          </>
        ) : null}

        {subCategoryOptions.length ? (
          <RvtSelectorField
            label="Sous-type"
            value={line?.category2}
            placeholder="Sélectionner"
            onPress={() =>
              openSelect({
                title: "Sous-type",
                options: subCategoryOptions.map((o) => ({ id: o, label: o })),
                selectedId: line?.category2,
                onSelect: (v) => store.updateProduct(lineId, { category2: v }),
              })
            }
          />
        ) : null}

        {!hasOptions && !subCategoryOptions.length ? (
          <Text style={styles.noOptionsText}>
            Aucune option de détail disponible pour ce produit.
          </Text>
        ) : null}

        <View style={styles.twoCol}>
          <View style={styles.col}>
            <RvtTextInput
              label="Quantité"
              value={details.quantity ?? ""}
              onChangeText={(v) => updateProductDetail(lineId, "quantity", v)}
              keyboardType="numeric"
              placeholder="Ex. 20"
            />
          </View>
          <View style={styles.col}>
            <RvtTextInput
              label="Prix (DH)"
              value={details.price ?? ""}
              onChangeText={(v) => updateProductDetail(lineId, "price", v)}
              keyboardType="numeric"
              placeholder="Ex. 150"
            />
          </View>
        </View>
        <RvtPresenceLevels
          value={line?.presence}
          onChange={(v) => updateProductPresence(lineId, v)}
        />
      </View>
    );
  };

  const handleNext = () => {
    router.navigate("/rvt/create/opportunite");
  };

  if (!canCreate) {
    return (
      <View style={styles.lockScreen}>
        <FontAwesome5 name="lock" size={34} color="#bbb" />
        <Text style={styles.lockText}>Accès refusé.</Text>
      </View>
    );
  }

  const totalBrands = store.brands.length;

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.toolbar}>
          <Text style={styles.toolbarCount}>
            {store.products.length} produit
            {store.products.length > 1 ? "s" : ""} · {totalBrands} marque
            {totalBrands > 1 ? "s" : ""}
          </Text>
          <Pressable onPress={handleAddProduct} style={styles.addProductButton}>
            <FontAwesome5 name="plus" size={12} color="#fff" />
            <Text style={styles.addProductButtonText}>Produit</Text>
          </Pressable>
        </View>

        {Object.keys(selectedProductsByCategory).length === 0 ? (
          <View style={styles.emptyProducts}>
            <FontAwesome5 name="boxes" size={34} color="#ddd" />
            <Text style={styles.emptyProductsText}>Aucun produit relevé</Text>
          </View>
        ) : (
          Object.entries(selectedProductsByCategory).map(
            ([categoryLabel, lines]) => (
              <SectionCard
                key={categoryLabel}
                title={categoryLabel}
                icon="box-open"
              >
                {lines.map((line) => {
                  const category = findCategory(line.productId);
                  return (
                    <View key={line.lineId} style={styles.productLine}>
                      <View style={styles.productLineHeader}>
                        <Text style={styles.productLineTitle}>
                          {line.productId}
                        </Text>
                        <Pressable
                          onPress={() => store.removeProduct(line.lineId)}
                          hitSlop={8}
                          style={styles.trashWrap}
                        >
                          <FontAwesome5
                            name="trash"
                            size={13}
                            color="#ff4d4f"
                          />
                        </Pressable>
                      </View>
                      {renderDetailOptions(line.lineId, category)}
                    </View>
                  );
                })}
              </SectionCard>
            ),
          )
        )}

        <SectionCard title="Marques observées" icon="trademark">
          <RvtSelectorField
            label="Marques"
            value={
              totalBrands
                ? `${totalBrands} marque${totalBrands > 1 ? "s" : ""} sélectionnée${totalBrands > 1 ? "s" : ""}`
                : undefined
            }
            placeholder="Sélectionner les marques"
            onPress={handleOpenBrandsSheet}
          />
          {store.brands.length > 0 ? (
            <View style={styles.brandList}>
              {store.brands.map((brand) => {
                const info = allBrands.find((b) => b.id === brand.brandId);
                return (
                  <View key={brand.brandId} style={styles.brandLine}>
                    <View style={styles.brandLineHeader}>
                      <View style={styles.brandTitleWrap}>
                        <Text style={styles.brandLineTitle}>
                          {brand.brandId}
                        </Text>
                        {info?.category ? (
                          <Text style={styles.brandCategory}>
                            {info.category}
                          </Text>
                        ) : null}
                      </View>
                      <Pressable
                        onPress={() => store.removeBrand(brand.brandId)}
                        hitSlop={8}
                      >
                        <FontAwesome5 name="trash" size={12} color="#ff4d4f" />
                      </Pressable>
                    </View>
                    <RvtPresenceLevels
                      value={brand.presence}
                      onChange={(v) => store.setBrandPresence(brand.brandId, v)}
                    />
                  </View>
                );
              })}
            </View>
          ) : null}
        </SectionCard>

        <SectionCard title="Autre produit" icon="pen">
          <RvtTextInput
            label="Produit non référencé"
            value={store.otherProduct}
            onChangeText={store.setOtherProduct}
            placeholder="Libellé libre"
            maxLength={500}
          />
        </SectionCard>
      </ScrollView>

      <View style={styles.footer}>
        <RvtFooterButton label="Suivant" onPress={handleNext} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  screen: {
    flex: 1,
    paddingHorizontal: 14,
    backgroundColor: "#f7f8fa",
    paddingTop: 6,
  },
  scrollContent: {
    paddingBottom: 14,
    gap: 12,
  },
  lockScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f7f8fa",
  },
  lockText: {
    marginTop: 12,
    color: "#666",
    fontSize: 14,
  },
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  toolbarCount: {
    fontSize: 13,
    color: "#888",
  },
  addProductButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: PRIMARY,
  },
  addProductButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  emptyProducts: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#efefef",
  },
  emptyProductsText: {
    color: "#aaa",
    marginTop: 10,
    fontSize: 13,
  },
  productLine: {
    marginBottom: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    backgroundColor: "#fafbfc",
  },
  productLineHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  productLineTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a1a2e",
    flex: 1,
  },
  trashWrap: {
    marginLeft: 8,
  },
  productDetails: {
    marginTop: 6,
  },
  noOptionsText: {
    color: "#aaa",
    fontSize: 12,
    marginBottom: 8,
  },
  twoCol: {
    flexDirection: "row",
    gap: 10,
  },
  col: {
    flex: 1,
  },
  brandList: {
    rowGap: 8,
    marginTop: 4,
  },
  brandLine: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    backgroundColor: "#fafbfc",
  },
  brandLineHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  brandTitleWrap: {
    flex: 1,
  },
  brandLineTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#222",
  },
  brandCategory: {
    fontSize: 11,
    color: "#999",
    marginTop: 1,
  },
  footer: {
    paddingBottom: 14,
  },
});
