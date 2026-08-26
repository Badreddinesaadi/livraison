import {
  RvtChipRow,
  RvtFooterButton,
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
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";

const INDUSTRIAL_OTHER = "Autre";

export default function CreateRvtProfilScreen() {
  const router = useRouter();
  const { user } = useSession();
  const canCreate = hasRapportVisitePermission(user, "CREATE");
  const store = useCreateVisitStore();
  const openSelect = useRvtSheetStore((s) => s.openSelect);
  const { data: refData } = useReferenceData();

  const observedActivities = refData?.observedActivities ?? [];
  const equipmentForActivity = store.observedActivity
    ? (refData?.equipmentByActivity?.[store.observedActivity] ?? [])
    : [];
  const constructionTypes = refData?.constructionTypes ?? [];
  const constructionPhases = refData?.constructionPhases ?? [];
  const industrialActivities = refData?.industrialActivities ?? [];
  const siteSizes = refData?.siteSizes ?? [];

  const isRevendeur = store.observedActivity === "Revendeur";
  const isChantier = store.observedActivity === "Chantier";
  const isIndustriel = store.observedActivity === "Industriel";

  const handleSelectConstructionType = () => {
    openSelect({
      title: "Type de chantier",
      options: constructionTypes.map((t) => ({ id: t, label: t })),
      selectedId: store.constructionType ?? undefined,
      onSelect: (id) => store.setConstructionType(id),
    });
  };

  const handleSelectConstructionPhase = () => {
    openSelect({
      title: "Phase d'avancement",
      options: constructionPhases.map((t) => ({ id: t, label: t })),
      selectedId: store.constructionPhase ?? undefined,
      onSelect: (id) => store.setConstructionPhase(id),
    });
  };

  const handleToggleIndustrial = (activity: string) => {
    const current = store.industrialActivities;
    if (current.includes(activity)) {
      store.setIndustrialActivities(current.filter((a) => a !== activity));
    } else {
      store.setIndustrialActivities([...current, activity]);
    }
  };

  const handleNext = () => {
    if (!store.observedActivity) {
      Toast.show({
        type: "error",
        text1: "Activité requise",
        text2: "Sélectionnez l'activité observée.",
      });
      return;
    }
    if (isIndustriel && store.industrialActivities.length === 0) {
      Toast.show({
        type: "error",
        text1: "Spécialité requise",
        text2: "Sélectionnez au moins une spécialité industrielle.",
      });
      return;
    }
    if (
      isIndustriel &&
      store.industrialActivities.includes(INDUSTRIAL_OTHER) &&
      !store.industrialOther.trim()
    ) {
      Toast.show({
        type: "error",
        text1: "Précision requise",
        text2: "Précisez l'autre activité industrielle.",
      });
      return;
    }
    router.navigate("/rvt/create/marche");
  };

  if (!canCreate) {
    return (
      <View style={styles.lockScreen}>
        <FontAwesome5 name="lock" size={34} color="#bbb" />
        <Text style={styles.lockText}>Accès refusé.</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SectionCard title="Activité observée" icon="industry">
          <RvtChipRow
            label="Activité du site"
            options={observedActivities}
            selected={store.observedActivity}
            onSelect={(v) => store.setObservedActivity(v as any)}
            required
          />
        </SectionCard>

        {isRevendeur ? (
          <SectionCard title="Revendeur" icon="store">
            <RvtChipRow
              label="Service de découpe"
              options={["Oui", "Non"]}
              selected={
                store.offersCutting === null
                  ? null
                  : store.offersCutting
                    ? "Oui"
                    : "Non"
              }
              onSelect={(v) =>
                store.setOffersCutting(v === null ? null : v === "Oui")
              }
              allowNull
              required
            />
          </SectionCard>
        ) : null}

        {isChantier ? (
          <SectionCard title="Chantier" icon="hard-hat">
            <RvtSelectorField
              label="Type de chantier"
              value={store.constructionType ?? undefined}
              placeholder="Sélectionner"
              onPress={handleSelectConstructionType}
              required
            />
            <RvtSelectorField
              label="Phase d'avancement"
              value={store.constructionPhase ?? undefined}
              placeholder="Sélectionner"
              onPress={handleSelectConstructionPhase}
              required
            />
            <Text style={styles.photoLabel}>
              Photo du panneau (facultative)
            </Text>
            <Pressable
              onPress={() => {
                Toast.show({
                  type: "info",
                  text1: "Bientôt disponible",
                  text2: "La photo du panneau sera disponible ici.",
                });
              }}
              style={styles.photoButton}
            >
              <FontAwesome5 name="camera" size={14} color={PRIMARY} />
              <Text style={styles.photoButtonText}>Ajouter une photo</Text>
            </Pressable>
          </SectionCard>
        ) : null}

        {isIndustriel ? (
          <SectionCard title="Activités industrielles" icon="industry">
            <View style={styles.chipRow}>
              {industrialActivities.map((activity) => {
                const isSelected =
                  store.industrialActivities.includes(activity);
                return (
                  <Pressable
                    key={activity}
                    onPress={() => handleToggleIndustrial(activity)}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextSelected,
                      ]}
                    >
                      {activity}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {store.industrialActivities.includes(INDUSTRIAL_OTHER) ? (
              <View style={styles.otherWrap}>
                <RvtTextInput
                  label="Préciser l'autre activité"
                  value={store.industrialOther}
                  onChangeText={store.setIndustrialOther}
                  placeholder="Ex. scierie, palettes..."
                  required
                />
              </View>
            ) : null}
          </SectionCard>
        ) : null}

        {equipmentForActivity.length > 0 ? (
          <SectionCard title="Équipements" icon="wrench">
            <Text style={styles.equipmentLabel}>
              Équipements observés avec quantité
            </Text>
            <View style={styles.equipmentList}>
              {equipmentForActivity.map((eq) => {
                const isSelected = store.equipment.includes(eq);
                const qty = store.equipmentQuantities[eq] ?? 1;
                return (
                  <View
                    key={eq}
                    style={[
                      styles.equipmentRow,
                      isSelected && styles.equipmentRowSelected,
                    ]}
                  >
                    <Pressable
                      style={styles.equipmentNameWrap}
                      onPress={() => store.toggleEquipment(eq)}
                    >
                      <Text
                        style={[
                          styles.equipmentName,
                          isSelected && styles.equipmentNameSelected,
                        ]}
                      >
                        {eq}
                      </Text>
                    </Pressable>
                    {isSelected ? (
                      <View style={styles.stepper}>
                        <Pressable
                          onPress={() =>
                            store.setEquipmentQuantity(eq, Math.max(1, qty - 1))
                          }
                          style={styles.stepperMinus}
                        >
                          <Text style={styles.stepperSign}>−</Text>
                        </Pressable>
                        <Text style={styles.stepperValue}>{qty}</Text>
                        <Pressable
                          onPress={() =>
                            store.setEquipmentQuantity(
                              eq,
                              Math.min(999, qty + 1),
                            )
                          }
                          style={styles.stepperPlus}
                        >
                          <Text style={styles.stepperPlusSign}>+</Text>
                        </Pressable>
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          </SectionCard>
        ) : null}

        <SectionCard title="Site" icon="vector-square">
          <RvtChipRow
            label="Taille / importance"
            options={siteSizes}
            selected={store.siteSize}
            onSelect={(v) => store.setSiteSize(v as any)}
            required
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
  photoLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
  },
  photoButton: {
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: PRIMARY,
    backgroundColor: PRIMARY + "08",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  photoButtonText: {
    color: PRIMARY,
    fontWeight: "700",
    fontSize: 14,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e8e8e8",
    backgroundColor: "#fff",
  },
  chipSelected: {
    borderColor: PRIMARY,
    backgroundColor: PRIMARY + "18",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
  },
  chipTextSelected: {
    color: PRIMARY,
  },
  otherWrap: {
    marginTop: 10,
  },
  equipmentLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
  },
  equipmentList: {
    rowGap: 8,
  },
  equipmentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e8e8e8",
    backgroundColor: "#fff",
  },
  equipmentRowSelected: {
    borderColor: PRIMARY,
    backgroundColor: PRIMARY + "08",
  },
  equipmentNameWrap: {
    flex: 1,
  },
  equipmentName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
  },
  equipmentNameSelected: {
    color: PRIMARY,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  stepperMinus: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperSign: {
    color: PRIMARY,
    fontWeight: "700",
  },
  stepperValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#222",
  },
  stepperPlus: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperPlusSign: {
    color: "#fff",
    fontWeight: "700",
  },
  footer: {
    paddingBottom: 14,
  },
});
