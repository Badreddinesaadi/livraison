import {
  createVisit,
  deletePanneauChantierPhoto,
  deleteVisitPhotos,
  updateVisit,
  uploadPanneauChantierPhoto,
  uploadVisitPhoto,
} from "@/api/visits.api";
import {
  RvtChipRow,
  RvtFooterButton,
  RvtSelectorField,
  RvtTextInput,
  SectionCard,
} from "@/components/RvtFormFields";
import RvtPicturePreview from "@/components/RvtPicturePreview";
import { hasRapportVisitePermission } from "@/constants/permissions";
import { PRIMARY } from "@/constants/theme";
import { useReferenceData } from "@/hooks/use-reference-data";
import { useSession } from "@/stores/auth.store";
import { useCreateVisitStore } from "@/stores/create-visit.store";
import { useRvtCameraStore } from "@/stores/rvt-camera.store";
import { useRvtSheetStore } from "@/stores/rvt-sheet.store";
import { VisitCreate, VisitPatch } from "@/types/rvt.types";
import { rvtPhotoUrl } from "@/utils/rvt-format";
import { FontAwesome5 } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";

const MAX_PHOTOS = 5;
const CAPTURE_TIMEOUT_MS = 15000;

export default function CreateRvtActionScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const canCreate = hasRapportVisitePermission(user, "CREATE");
  const store = useCreateVisitStore();
  const openSelect = useRvtSheetStore((s) => s.openSelect);
  const openMultiSelect = useRvtSheetStore((s) => s.openMultiSelect);
  const openCamera = useRvtCameraStore((s) => s.open);
  const { data: refData } = useReferenceData();

  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const keptExistingPhotos = store.existingPhotos.filter(
    (p) => !store.deletedVisitPhotoIds.includes(String(p.id)),
  );
  const totalPhotoCount = keptExistingPhotos.length + store.photos.length;

  const handleOpenPhotoPicker = useCallback(() => {
    openCamera({
      maxPhotos: Math.max(
        1,
        MAX_PHOTOS - (keptExistingPhotos.length + store.photos.length),
      ),
      multiple: true,
      onConfirm: (photos) => {
        photos.forEach((p) => store.addPhoto(p));
      },
    });
    router.navigate("/rvt/camera");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    openCamera,
    router,
    keptExistingPhotos.length,
    store.photos.length,
  ]);

  const captureLocationIfMissing = useCallback(async () => {
    if (store.location?.status === "GPS_VALIDATED") return;
    setIsCapturingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        store.setLocation({
          status: "GPS_UNAVAILABLE",
          capturedAt: new Date().toISOString(),
        });
        return;
      }
      const timeout = setTimeout(() => {
        store.setLocation({
          status: "GPS_UNAVAILABLE",
          capturedAt: new Date().toISOString(),
        });
      }, CAPTURE_TIMEOUT_MS);
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      clearTimeout(timeout);
      const { latitude, longitude, accuracy } = position.coords;
      store.setLocation({
        status: "GPS_VALIDATED",
        latitude,
        longitude,
        accuracy: accuracy ?? undefined,
        capturedAt: new Date().toISOString(),
      });
    } catch {
      store.setLocation({
        status: "GPS_UNAVAILABLE",
        capturedAt: new Date().toISOString(),
      });
    } finally {
      setIsCapturingLocation(false);
    }
  }, [store]);

  const visitResults = refData?.visitResults ?? [];
  const nextActions = refData?.nextActions ?? [];
  const actionDateOptions = refData?.actionDateOptions ?? [];

  const hasCommande = store.results.includes("Commande");
  const isEdit = store.type === "update";

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!store.roundId) {
        throw new Error(
          "Aucune tournée sélectionnée. Choisissez une tournée dans l'onglet Tournées.",
        );
      }
      const base = buildVisitPayload(store.roundId);
      if (isEdit && store.visitId && store.version) {
        const patch: VisitPatch = { ...base };
        delete (patch as any).roundId;
        return updateVisit({
          id: store.visitId,
          version: store.version,
          patch,
        });
      }
      return createVisit(base);
    },
    onSuccess: async (report) => {
      const visitId = report?.visitId || report?.id;

      if (visitId && isEdit && store.deletedVisitPhotoIds.length > 0) {
        try {
          await deleteVisitPhotos({
            visitId,
            photoIds: store.deletedVisitPhotoIds,
          });
        } catch (error: any) {
          Toast.show({
            type: "error",
            text1: "Photos non supprimées",
            text2: error?.message || "Une erreur est survenue.",
          });
        }
      }

      if (visitId && store.photos.length > 0) {
        const results = await Promise.allSettled(
          store.photos.map((photo) =>
            uploadVisitPhoto({
              visitId,
              file: { uri: photo.uri, name: photo.name, type: photo.type },
            }),
          ),
        );
        const failedCount = results.filter(
          (r) => r.status === "rejected",
        ).length;
        if (failedCount > 0) {
          Toast.show({
            type: "error",
            text1: "Photos non envoyées",
            text2: `${failedCount} photo${failedCount > 1 ? "s" : ""} n'a pas pu être envoyée.`,
          });
        }
      }

      const isChantier =
        refData?.activite_observee_v2?.find(
          (a) => a.id === store.activiteObserveeId,
        )?.code === "chantier";
      if (visitId && isChantier && isEdit && store.signPhotoDeleted) {
        try {
          await deletePanneauChantierPhoto({ visitId });
        } catch (error: any) {
          Toast.show({
            type: "error",
            text1: "Photo du panneau non supprimée",
            text2: error?.message || "Une erreur est survenue.",
          });
        }
      }
      if (visitId && isChantier && store.signPhoto) {
        const wp = store.signPhoto;
        try {
          await uploadPanneauChantierPhoto({
            visitId,
            file: { uri: wp.uri, name: wp.name, type: wp.type },
          });
        } catch (error: any) {
          Toast.show({
            type: "error",
            text1: "Photo du panneau non envoyée",
            text2: error?.message || "Une erreur est survenue.",
          });
        }
      }
      queryClient.invalidateQueries({ queryKey: ["visits"] });
      queryClient.invalidateQueries({ queryKey: ["rounds"] });
      Toast.show({
        type: "success",
        text1: isEdit ? "Rapport modifié" : "Visite validée",
        text2: isEdit
          ? "Les modifications ont été enregistrées."
          : "Le rapport de visite a été envoyé.",
      });
      const originTourId = store.originTourId;
      store.resetVisitFields();
      router.dismissAll();
      if (isEdit || !originTourId) {
        router.replace("/rvt");
      } else {
        router.replace({
          pathname: "/rvt/tours/[roundId]",
          params: { roundId: originTourId },
        });
      }
    },
    onError: (error: any) => {
      if (
        typeof error?.message === "string" &&
        error.message.includes("VERSION_MISMATCH")
      ) {
        Toast.show({
          type: "error",
          text1: "Version expirée",
          text2: "Le rapport a été modifié ailleurs. Rechargez-le.",
        });
        return;
      }
      Toast.show({
        type: "error",
        text1: isEdit ? "Échec de modification" : "Échec de validation",
        text2: error?.message || "Une erreur est survenue.",
      });
    },
  });

  const buildVisitPayload = (roundId: string): VisitCreate => {
    const opportunityDetected = store.opportunityDetected === true;
    const activityCode = refData?.activite_observee_v2?.find(
      (a) => a.id === store.activiteObserveeId,
    )?.code;

    return {
      roundId: Number(roundId),
      clientId: store.client ? store.client.id : 0,
      startedAt: store.startedAt?.toISOString() ?? new Date().toISOString(),
      completedAt: new Date().toISOString(),
      location: store.location ?? { status: "GPS_UNAVAILABLE" },
      contactRole: store.contactRole ?? undefined,
      contactOther: (store.contactOther ?? "").trim() || undefined,
      activityLevel: store.activityLevel ?? undefined,
      activiteObserveeId: store.activiteObserveeId ?? undefined,
      equipementIds: store.equipementIds.length
        ? store.equipementIds
        : undefined,
      equipementQuantites: Object.keys(store.equipementQuantites).length
        ? store.equipementQuantites
        : undefined,
      serviceDecoupe:
        activityCode === "revendeur" ? store.serviceDecoupe : undefined,
      chantierTypeId:
        activityCode === "chantier"
          ? (store.chantierTypeId ?? undefined)
          : undefined,
      chantierPhaseId:
        activityCode === "chantier"
          ? (store.chantierPhaseId ?? undefined)
          : undefined,
      activitesIndustriellesIds:
        activityCode === "industriel" && store.activitesIndustriellesIds.length
          ? store.activitesIndustriellesIds
          : undefined,
      autreActiviteIndustrielle:
        activityCode === "industriel" && (store.industrialOther ?? "").trim()
          ? store.industrialOther.trim()
          : undefined,
      siteSize: store.siteSize ?? undefined,
      categorie1: 171,
      categorie2: store.categorie2Id ?? undefined,
      categorie3: store.categorie3Id ?? undefined,
      products: store.products.map(
        ({ lineId, productId, category2, presence, details }) => ({
          lineId,
          productId,
          category2,
          presence,
          details,
        }),
      ),
      otherProduct: (store.otherProduct ?? "").trim() || undefined,
      brands: store.brands,
      competitors: store.competitors,
      sdkPosition: store.sdkPosition ?? undefined,
      opportunity: {
        detected: store.opportunityDetected,
        productId: opportunityDetected
          ? (store.oppProductId ?? undefined)
          : undefined,
        potential: opportunityDetected
          ? (store.oppPotential ?? undefined)
          : undefined,
        horizon: opportunityDetected
          ? (store.oppHorizon ?? undefined)
          : undefined,
        estimatedAmount:
          opportunityDetected && store.oppAmount.trim()
            ? Number(store.oppAmount)
            : undefined,
        competitorId: opportunityDetected
          ? (store.oppCompetitorId ?? undefined)
          : undefined,
      },
      results: store.results,
      orderQuantities: hasCommande
        ? {
            solo: Number(store.orderSolo) || 0,
            semiCombined: Number(store.orderSemiCombined) || 0,
          }
        : undefined,
      nextAction: store.nextAction ?? undefined,
      nextActionDueAt: store.nextActionDueAt?.toISOString(),
      note: (store.note ?? "").trim() || undefined,
    };
  };

  const handleSubmit = async () => {
    if (!store.client) {
      Toast.show({
        type: "error",
        text1: "Client requis",
        text2: "Sélectionnez un client.",
      });
      return;
    }
    if (!isEdit && !store.roundId) {
      Toast.show({
        type: "error",
        text1: "Aucune tournée sélectionnée",
        text2: "Choisissez une tournée dans l'onglet Tournées.",
      });
      return;
    }
    if (store.results.length === 0) {
      Toast.show({
        type: "error",
        text1: "Résultat requis",
        text2: "Sélectionnez au moins un résultat de visite.",
      });
      return;
    }
    await captureLocationIfMissing();
    mutate();
  };

  const handleOpenResults = () => {
    openMultiSelect({
      title: "Résultats de la visite",
      items: visitResults.map((r) => ({
        id: r,
        label: r,
      })),
      getSelectedIds: () => useCreateVisitStore.getState().results,
      onToggle: (id) => useCreateVisitStore.getState().toggleResult(id as any),
      onConfirm: () => {},
    });
  };

  const handleSelectNextAction = () => {
    openSelect({
      title: "Prochaine action",
      options: nextActions.map((a) => ({ id: a, label: a })),
      selectedId: store.nextAction ?? undefined,
      onSelect: (id) => store.setNextAction(id as any),
    });
  };

  const handleSelectDateOption = (id: string) => {
    const option = actionDateOptions.find((o) => o.id === id);
    if (!option) return;
    const due = new Date();
    due.setDate(due.getDate() + option.days);
    store.setNextActionDueAt(due);
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
        <SectionCard title="Résultats de la visite" icon="check-circle">
          <RvtSelectorField
            label="Résultats"
            value={
              store.results.length
                ? `${store.results.length} résultat${store.results.length > 1 ? "s" : ""}`
                : undefined
            }
            placeholder="Sélectionner les résultats"
            onPress={handleOpenResults}
            required
          />
          {store.results.length > 0 ? (
            <View style={styles.resultChips}>
              {store.results.map((r) => (
                <Pressable
                  key={r}
                  onPress={() => store.toggleResult(r)}
                  style={styles.resultChip}
                >
                  <Text style={styles.resultChipText}>{r} ✕</Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          {hasCommande ? (
            <View style={styles.twoCol}>
              <View style={styles.col}>
                <RvtTextInput
                  label="Quantité Solo"
                  value={store.orderSolo}
                  onChangeText={store.setOrderSolo}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
              <View style={styles.col}>
                <RvtTextInput
                  label="Quantité Semi-combiné"
                  value={store.orderSemiCombined}
                  onChangeText={store.setOrderSemiCombined}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
            </View>
          ) : null}
        </SectionCard>

        <SectionCard title="Prochaine action" icon="calendar-check">
          <RvtSelectorField
            label="Action à réaliser"
            value={store.nextAction ?? undefined}
            placeholder="Sélectionner"
            onPress={handleSelectNextAction}
          />
          {actionDateOptions.length > 0 ? (
            <RvtChipRow
              label="Échéance"
              options={actionDateOptions.map((o) => o.label)}
              selected={
                store.nextActionDueAt
                  ? (actionDateOptions.find(
                      (o) =>
                        new Date(
                          new Date().getTime() + o.days * 86400000,
                        ).toDateString() ===
                        store.nextActionDueAt?.toDateString(),
                    )?.label ?? null)
                  : null
              }
              onSelect={(v) => {
                const option = actionDateOptions.find((o) => o.label === v);
                if (option) handleSelectDateOption(option.id);
              }}
            />
          ) : null}
          {store.nextActionDueAt ? (
            <Text style={styles.dueText}>
              {`Échéance : ${store.nextActionDueAt.toLocaleDateString("fr-FR")}`}
            </Text>
          ) : null}
        </SectionCard>

        <SectionCard title="Note de visite" icon="comment-dots">
          <RvtTextInput
            label="Note"
            value={store.note}
            onChangeText={store.setNote}
            placeholder="Note libre..."
            multiline
            maxLength={10000}
          />
        </SectionCard>

        <SectionCard title="Localisation" icon="map-marker-alt">
          {store.location?.status === "GPS_VALIDATED" ? (
            <Text style={styles.gpsStatus}>Position validée</Text>
          ) : store.location?.status === "GPS_APPROXIMATE" ? (
            <Text style={styles.gpsStatus}>
              Position approximative capturée.
            </Text>
          ) : (
            <Text style={styles.gpsStatusMuted}>Aucune position capturée.</Text>
          )}
          <Pressable
            onPress={() => captureLocationIfMissing()}
            disabled={isCapturingLocation}
            style={[
              styles.gpsButton,
              isCapturingLocation && styles.gpsDisabled,
            ]}
          >
            <FontAwesome5
              name={isCapturingLocation ? "spinner" : "crosshairs"}
              size={14}
              color={PRIMARY}
            />
            <Text style={styles.gpsButtonText}>
              {isCapturingLocation
                ? "Capture en cours..."
                : "Capturer la position"}
            </Text>
          </Pressable>
        </SectionCard>

        <SectionCard title="Photos" icon="camera">
          <Pressable
            onPress={handleOpenPhotoPicker}
            disabled={totalPhotoCount >= MAX_PHOTOS}
            style={[
              styles.photoActionPrimary,
              totalPhotoCount >= MAX_PHOTOS && styles.photoActionDisabled,
            ]}
          >
            <FontAwesome5 name="camera" size={14} color="#fff" />
            <Text style={styles.photoActionPrimaryText}>
              Ajouter des photos
            </Text>
          </Pressable>

          {keptExistingPhotos.length > 0 ? (
            <View style={styles.photoGrid}>
              {keptExistingPhotos.map((photo) => {
                const uri = rvtPhotoUrl(photo);
                return (
                  <View key={photo.id}>
                    <Pressable onPress={() => uri && setPreviewUri(uri)}>
                      <Image
                        source={{ uri: uri ?? undefined }}
                        style={styles.photoThumb}
                        contentFit="cover"
                      />
                    </Pressable>
                    <Pressable
                      onPress={() => store.removeExistingPhoto(String(photo.id))}
                      style={styles.photoRemove}
                    >
                      <FontAwesome5 name="times" size={10} color="#fff" />
                    </Pressable>
                  </View>
                );
              })}
            </View>
          ) : null}

          {store.photos.length > 0 ? (
            <View style={styles.photoGrid}>
              {store.photos.map((photo) => (
                <View key={photo.uri}>
                  <Image
                    source={{ uri: photo.uri }}
                    style={styles.photoThumb}
                    contentFit="cover"
                  />
                  <Pressable
                    onPress={() => store.removePhoto(photo.uri)}
                    style={styles.photoRemove}
                  >
                    <FontAwesome5 name="times" size={10} color="#fff" />
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null}

          <Text style={styles.photoCount}>
            {totalPhotoCount}/{MAX_PHOTOS} photo
            {totalPhotoCount > 1 ? "s" : ""}
          </Text>
        </SectionCard>

        <RvtPicturePreview
          uri={previewUri}
          onClose={() => setPreviewUri(null)}
        />
      </ScrollView>

      <View style={styles.footer}>
        <RvtFooterButton
          label={isEdit ? "Enregistrer les modifications" : "VALIDER LA VISITE"}
          onPress={handleSubmit}
          isLoading={isPending}
          disabled={isPending}
        />
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
  resultChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  resultChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: PRIMARY + "18",
  },
  resultChipText: {
    color: PRIMARY,
    fontWeight: "600",
    fontSize: 12,
  },
  twoCol: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  col: {
    flex: 1,
  },
  dueText: {
    fontSize: 12,
    color: "#888",
  },
  gpsHint: {
    fontSize: 12,
    color: "#888",
    marginBottom: 8,
  },
  gpsStatus: {
    fontSize: 13,
    color: "#16a34a",
    marginBottom: 10,
  },
  gpsStatusMuted: {
    fontSize: 13,
    color: "#999",
    marginBottom: 10,
  },
  gpsButton: {
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: PRIMARY,
    backgroundColor: PRIMARY + "10",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  gpsButtonText: {
    color: PRIMARY,
    fontWeight: "700",
    fontSize: 14,
  },
  gpsDisabled: {
    opacity: 0.6,
  },
  photoActionPrimary: {
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  photoActionDisabled: {
    opacity: 0.6,
  },
  photoActionPrimaryText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  photoThumb: {
    width: 84,
    height: 84,
    borderRadius: 8,
  },
  photoRemove: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  photoCount: {
    color: "#aaa",
    fontSize: 12,
    marginTop: 8,
  },
  footer: {
    paddingBottom: 14,
  },
});
