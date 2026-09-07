import {
  RvtFooterButton,
  RvtTextInput,
  SectionCard,
} from "@/components/RvtFormFields";
import { hasRapportVisitePermission } from "@/constants/permissions";
import { PRIMARY, SUCCESS } from "@/constants/theme";
import { useReferenceData } from "@/hooks/use-reference-data";
import { useSession } from "@/stores/auth.store";
import { useCreateVisitStore } from "@/stores/create-visit.store";
import { useRvtCameraStore } from "@/stores/rvt-camera.store";
import { ActiviteObserveeCode, ActiviteObserveeV2 } from "@/types/rvt.types";
import { rvtPhotoUrl } from "@/utils/rvt-format";
import { FontAwesome5 } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";

export default function CreateRvtProfilScreen() {
  const router = useRouter();
  const { user } = useSession();
  const canCreate = hasRapportVisitePermission(user, "CREATE");
  const store = useCreateVisitStore();
  const { data: refData } = useReferenceData();

  const activities = useMemo(
    () => refData?.activite_observee_v2 ?? [],
    [refData?.activite_observee_v2],
  );

  const selectedActivity: ActiviteObserveeV2 | undefined = useMemo(
    () => activities.find((a) => a.id === store.activiteObserveeId),
    [activities, store.activiteObserveeId],
  );

  const code: ActiviteObserveeCode | null = selectedActivity?.code ?? null;

  const isRevendeur = code === "revendeur";
  const isChantier = code === "chantier";
  const isIndustriel = code === "industriel";

  const chantierTypes = selectedActivity?.chantierTypes ?? [];
  const chantierPhases = selectedActivity?.chantierPhases ?? [];
  const activitesIndustrielles = selectedActivity?.activitesIndustrielles ?? [];
  const equipements = selectedActivity?.equipements ?? [];

  const selectedIndustrielle = activitesIndustrielles.filter((a) =>
    store.activitesIndustriellesIds.includes(a.id),
  );
  const hasAutreIndustrielle = selectedIndustrielle.some((a) => a.estAutre);

  const selectedEquipements = equipements.filter((e) =>
    store.equipementIds.includes(e.id),
  );

  const isRevendeurNoDecoupe =
    isRevendeur && store.serviceDecoupe === false;

  const openCamera = useRvtCameraStore((s) => s.open);

  const handleOpenSignPhotoPicker = useCallback(() => {
    openCamera({
      maxPhotos: 1,
      multiple: false,
      onConfirm: (photos) => {
        if (photos[0]) {
          store.setSignPhoto({
            ...photos[0],
            name: `panneau-${Date.now()}.jpg`,
          });
        }
      },
    });
    router.navigate("/rvt/camera");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openCamera, router]);

  const handleSelectActivity = (activity: ActiviteObserveeV2) => {
    if (store.activiteObserveeId === activity.id) return;
    store.setActiviteObserveeId(activity.id);
    if (activity.code === "revendeur") {
      store.setServiceDecoupe(false);
    }
  };

  const handleNext = () => {
    if (store.activiteObserveeId == null) {
      Toast.show({
        type: "error",
        text1: "Activité requise",
        text2: "Sélectionnez l'activité observée.",
      });
      return;
    }
    if (isIndustriel && store.activitesIndustriellesIds.length === 0) {
      Toast.show({
        type: "error",
        text1: "Spécialité requise",
        text2: "Sélectionnez au moins une activité industrielle.",
      });
      return;
    }
    if (isIndustriel && hasAutreIndustrielle && !store.industrialOther.trim()) {
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
        <SectionCard title="Activités observées" icon="chart-line">
          <Text style={styles.hint}>
            Un choix adapte automatiquement les équipements proposés.
          </Text>
          <View style={styles.grid}>
            {activities.map((activity) => {
              const isSelected = store.activiteObserveeId === activity.id;
              return (
                <Pressable
                  key={activity.id}
                  onPress={() => handleSelectActivity(activity)}
                  style={[
                    styles.gridButton,
                    isSelected && styles.gridButtonPrimary,
                  ]}
                >
                  <Text
                    style={[
                      styles.gridButtonText,
                      isSelected && styles.gridButtonTextLight,
                    ]}
                  >
                    {activity.libelle}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </SectionCard>

        {isRevendeur ? (
          <SectionCard title="Service de découpe" icon="cut">
            <Text style={styles.hint}>
              Est-ce que ce revendeur réalise la découpe des panneaux ?
            </Text>
            <View style={styles.grid}>
              {[
                { label: "NON", value: false },
                { label: "OUI", value: true },
              ].map((option) => {
                const isSelected = store.serviceDecoupe === option.value;
                return (
                  <Pressable
                    key={option.label}
                    onPress={() => {
                      if (option.value === false) {
                        store.setServiceDecoupe(false);
                        store.clearEquipements();
                      } else {
                        store.setServiceDecoupe(true);
                      }
                    }}
                    style={[
                      styles.gridButton,
                      isSelected && styles.gridButtonSuccess,
                    ]}
                  >
                    <Text
                      style={[
                        styles.gridButtonText,
                        isSelected && styles.gridButtonTextLight,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </SectionCard>
        ) : null}

        {isChantier ? (
          <SectionCard title="Informations du chantier" icon="hard-hat">
            <Text style={styles.fieldLabel}>Type du chantier</Text>
            <View style={styles.grid}>
              {chantierTypes.map((type) => {
                const isSelected = store.chantierTypeId === type.id;
                return (
                  <Pressable
                    key={type.id}
                    onPress={() => store.setChantierTypeId(type.id)}
                    style={[
                      styles.gridButton,
                      isSelected && styles.gridButtonPrimary,
                    ]}
                  >
                    <Text
                      style={[
                        styles.gridButtonText,
                        isSelected && styles.gridButtonTextLight,
                      ]}
                    >
                      {type.libelle}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.fieldLabel, styles.fieldLabelSpaced]}>
              {"Phase d'avancement"}
            </Text>
            <View style={styles.grid}>
              {chantierPhases.map((phase) => {
                const isSelected = store.chantierPhaseId === phase.id;
                return (
                  <Pressable
                    key={phase.id}
                    onPress={() => store.setChantierPhaseId(phase.id)}
                    style={[
                      styles.gridButton,
                      isSelected && styles.gridButtonSuccess,
                    ]}
                  >
                    <Text
                      style={[
                        styles.gridButtonText,
                        isSelected && styles.gridButtonTextLight,
                      ]}
                    >
                      {phase.libelle}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

<Text style={[styles.fieldLabel, styles.fieldLabelSpaced]}>
              {"Photo du panneau (facultative)"}
            </Text>

            {store.signPhoto ? (
              <View style={styles.signPhotoRow}>
                <Image
                  source={{ uri: store.signPhoto.uri }}
                  style={styles.signPhotoThumb}
                  contentFit="cover"
                />
                <Pressable
                  onPress={() => store.setSignPhoto(null)}
                  style={styles.signPhotoRemove}
                >
                  <FontAwesome5 name="times" size={10} color="#fff" />
                </Pressable>
                <Text style={styles.signPhotoName} numberOfLines={1}>
                  {store.signPhoto.name}
                </Text>
              </View>
            ) : null}

            {!store.signPhoto &&
            store.existingSignPhoto?.remoteUrl &&
            !store.signPhotoDeleted ? (
              <View style={styles.signPhotoRow}>
                <Image
                  source={{ uri: rvtPhotoUrl(store.existingSignPhoto) ?? "" }}
                  style={styles.signPhotoThumb}
                  contentFit="cover"
                />
                <Pressable
                  onPress={() => store.setSignPhotoDeleted(true)}
                  style={styles.signPhotoRemove}
                >
                  <FontAwesome5 name="times" size={10} color="#fff" />
                </Pressable>
                <Text style={styles.signPhotoName} numberOfLines={1}>
                  {store.existingSignPhoto.name ?? "Photo du panneau"}
                </Text>
              </View>
            ) : null}

            <Pressable
              onPress={handleOpenSignPhotoPicker}
              style={styles.signPhotoButton}
            >
              <FontAwesome5 name="camera" size={14} color="#fff" />
              <Text style={styles.signPhotoButtonText}>
                {store.signPhoto
                  ? "Reprendre la photo"
                  : "Ajouter une photo"}
              </Text>
            </Pressable>
          </SectionCard>
        ) : null}

        {isIndustriel ? (
          <SectionCard title="Activités industrielles" icon="industry">
            <Text style={styles.hint}>
              Plusieurs spécialités peuvent être sélectionnées pour un même
              client.
            </Text>
            <View style={styles.grid}>
              {activitesIndustrielles.map((activity) => {
                const isSelected = store.activitesIndustriellesIds.includes(
                  activity.id,
                );
                return (
                  <Pressable
                    key={activity.id}
                    onPress={() =>
                      store.toggleActiviteIndustrielle(activity.id)
                    }
                    style={[
                      styles.gridButton,
                      isSelected && styles.gridButtonSuccess,
                    ]}
                  >
                    <Text
                      style={[
                        styles.gridButtonText,
                        isSelected && styles.gridButtonTextLight,
                      ]}
                    >
                      {activity.libelle}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {hasAutreIndustrielle ? (
              <View style={styles.otherWrap}>
                <RvtTextInput
                  label="Préciser l'autre activité"
                  value={store.industrialOther}
                  onChangeText={store.setIndustrialOther}
                  placeholder="Ex. fabrication de charpentes métalliques"
                  required
                />
              </View>
            ) : null}
          </SectionCard>
        ) : null}

        {selectedActivity && equipements.length > 0 ? (
          <SectionCard title="Équipements / services" icon="wrench">
            {isRevendeurNoDecoupe ? (
              <Text style={styles.noDecoupeText}>
                Ce revendeur ne réalise pas de découpe.
              </Text>
            ) : (
              <>
                <Text style={styles.hint}>
                  {`Liste adaptée au profil ${selectedActivity.libelle}. Sélectionnez les équipements présents.`}
                </Text>
                <View style={styles.grid}>
                  {equipements.map((equipement) => {
                    const isSelected = store.equipementIds.includes(
                      equipement.id,
                    );
                    return (
                      <Pressable
                        key={equipement.id}
                        onPress={() => store.toggleEquipement(equipement.id)}
                        style={[
                          styles.gridButton,
                          isSelected && styles.gridButtonSuccess,
                        ]}
                      >
                        <Text
                          style={[
                            styles.gridButtonText,
                            isSelected && styles.gridButtonTextLight,
                          ]}
                        >
                          {equipement.libelle}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {selectedEquipements.length > 0 ? (
                  <>
                    <Text style={[styles.fieldLabel, styles.fieldLabelSpaced]}>
                      Quantités observées
                    </Text>
                    <View style={styles.stepperList}>
                      {selectedEquipements.map((equipement) => {
                        const qty =
                          store.equipementQuantites[String(equipement.id)] ?? 1;
                        return (
                          <View key={equipement.id} style={styles.stepperRow}>
                            <Text style={styles.stepperLabel} numberOfLines={1}>
                              {equipement.libelle}
                            </Text>
                            <View style={styles.stepper}>
                              <Pressable
                                onPress={() =>
                                  store.setEquipementQuantity(
                                    equipement.id,
                                    Math.max(1, qty - 1),
                                  )
                                }
                                style={styles.stepperMinus}
                              >
                                <Text style={styles.stepperSign}>−</Text>
                              </Pressable>
                              <Text style={styles.stepperValue}>{qty}</Text>
                              <Pressable
                                onPress={() =>
                                  store.setEquipementQuantity(
                                    equipement.id,
                                    Math.min(999, qty + 1),
                                  )
                                }
                                style={styles.stepperPlus}
                              >
                                <Text style={styles.stepperPlusSign}>+</Text>
                              </Pressable>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </>
                ) : null}
              </>
            )}
          </SectionCard>
        ) : null}
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
  hint: {
    fontSize: 12,
    color: "#888",
    marginBottom: 10,
  },
  noDecoupeText: {
    fontSize: 13,
    color: "#666",
    fontStyle: "italic",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
  },
  gridButton: {
    width: "47.5%",
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e8e8e8",
    backgroundColor: "#f7f8fa",
    alignItems: "center",
    justifyContent: "center",
  },
  gridButtonPrimary: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  gridButtonSuccess: {
    backgroundColor: SUCCESS,
    borderColor: SUCCESS,
  },
  gridButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
  },
  gridButtonTextLight: {
    color: "#fff",
  },
  fieldLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
    fontWeight: "600",
  },
  fieldLabelSpaced: {
    marginTop: 12,
  },
  signPhotoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  signPhotoThumb: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: "#f2f2f2",
  },
  signPhotoRemove: {
    position: "absolute",
    left: 46,
    top: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  signPhotoName: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    color: "#444",
  },
  signPhotoButton: {
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  signPhotoButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  otherWrap: {
    marginTop: 10,
  },
  stepperList: {
    rowGap: 8,
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    backgroundColor: "#fafbfc",
  },
  stepperLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#222",
    paddingRight: 8,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  stepperMinus: {
    width: 30,
    height: 30,
    borderRadius: 8,
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
    minWidth: 20,
    textAlign: "center",
  },
  stepperPlus: {
    width: 30,
    height: 30,
    borderRadius: 8,
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
