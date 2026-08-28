import {
  RvtFooterButton,
  RvtPresenceLevels,
  RvtSelectorField,
  SectionCard,
} from "@/components/RvtFormFields";
import { hasRapportVisitePermission } from "@/constants/permissions";
import { useReferenceData } from "@/hooks/use-reference-data";
import { useSession } from "@/stores/auth.store";
import { useCreateVisitStore } from "@/stores/create-visit.store";
import { useRvtSheetStore } from "@/stores/rvt-sheet.store";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";

export default function CreateRvtMarcheScreen() {
  const router = useRouter();
  const { user } = useSession();
  const canCreate = hasRapportVisitePermission(user, "CREATE");
  const store = useCreateVisitStore();
  const openSelect = useRvtSheetStore((s) => s.openSelect);
  const openMultiSelect = useRvtSheetStore((s) => s.openMultiSelect);
  const { data: refData } = useReferenceData();

  const categories1 = refData?.productCategories ?? [];
  const categories2 = refData?.productCategoriesLevel2 ?? [];
  const categories3 = refData?.productCategoriesLevel3 ?? [];
  const marques = refData?.marques ?? [];

  const selectedCat1 = categories1.find((c) => c.id === store.categorie1Id);
  const selectedCat2 = categories2.find((c) => c.id === store.categorie2Id);
  const selectedCat3 = categories3.find((c) => c.id === store.categorie3Id);

  const cat3Options = categories3.filter(
    (c) => c.idCategorie2 === store.categorie2Id,
  );

  const handleSelectCategorie1 = () => {
    if (!categories1.length) {
      Toast.show({
        type: "error",
        text1: "Aucune catégorie",
        text2: "Le référentiel des catégories est indisponible.",
      });
      return;
    }
    openSelect({
      title: "Catégorie 1",
      options: categories1.map((c) => ({
        id: String(c.id),
        label: c.designation,
      })),
      selectedId:
        store.categorie1Id != null ? String(store.categorie1Id) : undefined,
      onSelect: (id) => {
        store.setCategorie1Id(Number(id));
        store.setCategorie2Id(null);
        store.setCategorie3Id(null);
      },
    });
  };

  const handleSelectCategorie2 = () => {
    if (!categories2.length) {
      Toast.show({
        type: "error",
        text1: "Aucune catégorie",
        text2: "Le référentiel des catégories est indisponible.",
      });
      return;
    }
    openSelect({
      title: "Catégorie 2",
      options: categories2.map((c) => ({
        id: String(c.id),
        label: c.designation,
      })),
      selectedId:
        store.categorie2Id != null ? String(store.categorie2Id) : undefined,
      enableSearch: true,
      searchPlaceholder: "Rechercher une catégorie...",
      onSelect: (id) => {
        store.setCategorie2Id(Number(id));
        store.setCategorie3Id(null);
      },
    });
  };

  const handleSelectCategorie3 = () => {
    if (!cat3Options.length) {
      Toast.show({
        type: "error",
        text1: "Aucune catégorie",
        text2: "Sélectionnez d'abord une catégorie 2.",
      });
      return;
    }
    openSelect({
      title: "Catégorie 3",
      options: cat3Options.map((c) => ({
        id: String(c.id),
        label: c.designation,
      })),
      selectedId:
        store.categorie3Id != null ? String(store.categorie3Id) : undefined,
      onSelect: (id) => store.setCategorie3Id(Number(id)),
    });
  };

  const handleOpenMarques = () => {
    if (!marques.length) {
      Toast.show({
        type: "error",
        text1: "Aucune marque",
        text2: "Le référentiel des marques est vide.",
      });
      return;
    }
    openMultiSelect({
      title: "Marques observées",
      items: marques.map((m) => ({
        id: String(m.id),
        label: m.designation,
      })),
      getSelectedIds: () =>
        useCreateVisitStore.getState().brands.map((b) => String(b.brandId)),
      enableSearch: true,
      searchPlaceholder: "Rechercher une marque...",
      onToggle: (id) => {
        const state = useCreateVisitStore.getState();
        const brandId = Number(id);
        if (state.brands.some((b) => b.brandId === brandId)) {
          state.removeBrand(brandId);
        } else {
          state.addBrand(brandId);
        }
      },
      onConfirm: () => {},
    });
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
        <SectionCard title="Produits observés" icon="boxes">
          <RvtSelectorField
            label="Catégorie 1"
            value={selectedCat1?.designation}
            placeholder="Sélectionner"
            onPress={handleSelectCategorie1}
            required
          />
          <RvtSelectorField
            label="Catégorie 2"
            value={selectedCat2?.designation}
            placeholder="Sélectionner"
            onPress={handleSelectCategorie2}
          />
          <RvtSelectorField
            label="Catégorie 3"
            value={selectedCat3?.designation}
            placeholder="Sélectionner"
            onPress={handleSelectCategorie3}
          />
        </SectionCard>

        <SectionCard title="Marques observées" icon="trademark">
          <RvtSelectorField
            label="Marques"
            value={
              totalBrands
                ? `${totalBrands} marque${totalBrands > 1 ? "s" : ""} sélectionnée${totalBrands > 1 ? "s" : ""}`
                : undefined
            }
            placeholder="Sélectionner les marques"
            onPress={handleOpenMarques}
          />
          {store.brands.length > 0 ? (
            <View style={styles.brandList}>
              {store.brands.map((brand) => {
                const info = marques.find((m) => m.id === brand.brandId);
                return (
                  <View key={brand.brandId} style={styles.brandLine}>
                    <View style={styles.brandLineHeader}>
                      <Text style={styles.brandLineTitle}>
                        {info?.designation ?? brand.brandId}
                      </Text>
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
  brandLineTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#222",
  },
  footer: {
    paddingBottom: 14,
  },
});
