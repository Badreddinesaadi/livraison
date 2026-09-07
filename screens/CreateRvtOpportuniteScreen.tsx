import {
  RvtChipRow,
  RvtFooterButton,
  RvtPresenceLevels,
  RvtSelectorField,
  RvtTextInput,
  SectionCard,
} from "@/components/RvtFormFields";
import { hasRapportVisitePermission } from "@/constants/permissions";
import { useReferenceData } from "@/hooks/use-reference-data";
import { useSession } from "@/stores/auth.store";
import { useCreateVisitStore } from "@/stores/create-visit.store";
import { useRvtSheetStore } from "@/stores/rvt-sheet.store";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";

export default function CreateRvtOpportuniteScreen() {
  const router = useRouter();
  const { user } = useSession();
  const canCreate = hasRapportVisitePermission(user, "CREATE");
  const store = useCreateVisitStore();
  const openSelect = useRvtSheetStore((s) => s.openSelect);
  const openMultiSelect = useRvtSheetStore((s) => s.openMultiSelect);
  const { data: refData } = useReferenceData();

  const sdkPositions = refData?.sdkPositions ?? [];
  const competitors = refData?.competitors ?? [];
  const potentials = refData?.opportunityPotentials ?? [];
  const horizons = refData?.opportunityHorizons ?? [];

  const productOptions = useMemo(() => {
    const productSuggestions = refData?.productSuggestions ?? {};
    const result: { id: string; label: string; subLabel?: string }[] = [];
    Object.entries(productSuggestions).forEach(([category, suggestions]) => {
      suggestions.forEach((label) =>
        result.push({ id: label, label, subLabel: category }),
      );
    });
    return result;
  }, [refData?.productSuggestions]);

  const handleOpenCompetitors = () => {
    if (!competitors.length) {
      Toast.show({
        type: "error",
        text1: "Aucun concurrent",
        text2: "Le référentiel des concurrents est vide.",
      });
      return;
    }
    openMultiSelect({
      title: "Concurrents présents",
      items: competitors.map((c) => ({
        id: String(c.id),
        label: c.designation,
      })),
      getSelectedIds: () =>
        useCreateVisitStore
          .getState()
          .competitors.map((x) => String(x.competitorId)),
      enableSearch: true,
      searchPlaceholder: "Rechercher un concurrent...",
      onToggle: (id) =>
        useCreateVisitStore.getState().toggleCompetitor(Number(id)),
      onConfirm: () => {},
    });
  };

  const handleSelectOppProduct = () => {
    if (!productOptions.length) {
      Toast.show({
        type: "error",
        text1: "Catalogue vide",
        text2: "Impossible de charger les produits.",
      });
      return;
    }
    openSelect({
      title: "Produit concerné",
      options: productOptions,
      enableSearch: true,
      searchPlaceholder: "Rechercher un produit...",
      onSelect: (id) => store.setOppProductId(id),
    });
  };

  const handleSelectOppCompetitor = () => {
    openSelect({
      title: "Concurrent principal",
      options: competitors.map((c) => ({
        id: String(c.id),
        label: c.designation,
      })),
      selectedId:
        store.oppCompetitorId != null
          ? String(store.oppCompetitorId)
          : undefined,
      onSelect: (id) => store.setOppCompetitorId(Number(id)),
    });
  };

  const handleNext = () => {
    if (store.opportunityDetected === true && !store.oppProductId) {
      Toast.show({
        type: "error",
        text1: "Opportunité incomplète",
        text2: "Précisez le produit concerné.",
      });
      return;
    }
    router.navigate("/rvt/create/action");
  };

  if (!canCreate) {
    return (
      <View style={styles.lockScreen}>
        <FontAwesome5 name="lock" size={34} color="#bbb" />
        <Text style={styles.lockText}>Accès refusé.</Text>
      </View>
    );
  }

  const oppProduct = productOptions.find((p) => p.id === store.oppProductId);

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SectionCard title="Position SDK WOOD" icon="chart-line">
          <RvtChipRow
            label="Position chez ce client"
            options={sdkPositions}
            selected={store.sdkPosition}
            onSelect={(v) => store.setSdkPosition(v as any)}
            allowNull
          />
        </SectionCard>

        <SectionCard title="Concurrence" icon="users">
          <RvtSelectorField
            label="Concurrents présents"
            value={
              store.competitors.length
                ? `${store.competitors.length} concurrent${store.competitors.length > 1 ? "s" : ""}`
                : undefined
            }
            placeholder="Sélectionner les concurrents"
            onPress={handleOpenCompetitors}
          />
          {store.competitors.length > 0 ? (
            <View style={styles.competitorList}>
              {store.competitors.map((comp) => {
                const info = competitors.find((c) => c.id === comp.competitorId);
                return (
                  <View key={comp.competitorId} style={styles.competitorLine}>
                    <View style={styles.competitorHeader}>
                      <Text style={styles.competitorName}>
                        {info?.designation ?? comp.competitorId}
                      </Text>
                      <Pressable
                        onPress={() => store.removeCompetitor(comp.competitorId)}
                        hitSlop={8}
                      >
                        <FontAwesome5 name="trash" size={12} color="#ff4d4f" />
                      </Pressable>
                    </View>
                    <RvtPresenceLevels
                      value={comp.presence}
                      onChange={(v) =>
                        store.setCompetitorPresence(comp.competitorId, v)
                      }
                    />
                  </View>
                );
              })}
            </View>
          ) : null}
        </SectionCard>

        <SectionCard title="Opportunité" icon="lightbulb">
          <RvtChipRow
            label="Opportunité détectée"
            options={["Oui", "Non"]}
            selected={
              store.opportunityDetected === null
                ? null
                : store.opportunityDetected
                  ? "Oui"
                  : "Non"
            }
            onSelect={(v) =>
              store.setOpportunityDetected(v === null ? null : v === "Oui")
            }
            allowNull
          />

          {store.opportunityDetected ? (
            <View style={styles.oppBlock}>
              <RvtSelectorField
                label="Produit / famille concerné"
                value={oppProduct?.label}
                placeholder="Sélectionner"
                onPress={handleSelectOppProduct}
                required
              />
              <RvtChipRow
                label="Potentiel"
                options={potentials}
                selected={store.oppPotential}
                onSelect={(v) => store.setOppPotential(v as any)}
              />
              <RvtChipRow
                label="Horizon"
                options={horizons}
                selected={store.oppHorizon}
                onSelect={(v) => store.setOppHorizon(v as any)}
              />
              <RvtTextInput
                label="Montant estimé (DH)"
                value={store.oppAmount}
                onChangeText={store.setOppAmount}
                keyboardType="numeric"
                placeholder="Facultatif"
              />
              <RvtSelectorField
                label="Concurrent principal"
                value={
                  competitors.find((c) => c.id === store.oppCompetitorId)
                    ?.designation
                }
                placeholder="Facultatif"
                onPress={handleSelectOppCompetitor}
              />
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
  competitorList: {
    rowGap: 8,
    marginTop: 4,
  },
  competitorLine: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    backgroundColor: "#fafbfc",
  },
  competitorHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  competitorName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#222",
  },
  oppBlock: {
    marginTop: 6,
  },
  footer: {
    paddingBottom: 14,
  },
});
