import { createRound, listRounds } from "@/api/rounds.api";
import {
  createVisit,
  updateVisit,
  uploadVisitPhoto,
} from "@/api/visits.api";
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
import { useCreateVisitStore, PendingVisitPhoto } from "@/stores/create-visit.store";
import { useRvtSheetStore } from "@/stores/rvt-sheet.store";
import { VisitCreate, VisitPatch } from "@/types/rvt.types";
import { FontAwesome5 } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as DocumentPicker from "expo-document-picker";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";

const MAX_PHOTOS = 5;

export default function CreateRvtActionScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const canCreate = hasRapportVisitePermission(user, "CREATE");
  const store = useCreateVisitStore();
  const openSelect = useRvtSheetStore((s) => s.openSelect);
  const openMultiSelect = useRvtSheetStore((s) => s.openMultiSelect);
  const { data: refData } = useReferenceData();

  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [isFileCooldown, setIsFileCooldown] = useState(false);

  const visitResults = refData?.visitResults ?? [];
  const nextActions = refData?.nextActions ?? [];
  const actionDateOptions = refData?.actionDateOptions ?? [];

  const hasCommande = store.results.includes("Commande");
  const isEdit = store.type === "update";

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const roundId = await ensureRound();
      const base = buildVisitPayload(roundId);
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
      if (report?.id && store.photos.length > 0) {
        const visitId = report.visitId || report.id;
        await Promise.allSettled(
          store.photos.map((photo) =>
            uploadVisitPhoto({
              visitId,
              file: { uri: photo.uri, name: photo.name, type: photo.type },
              capturedAt: photo.capturedAt,
            }),
          ),
        );
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
      store.resetVisitFields();
      router.dismissAll();
      router.replace("/rvt");
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

  const ensureRound = async (): Promise<string> => {
    if (store.roundId) return store.roundId;
    const open = await listRounds({ status: "open", page: 1, perPage: 1 });
    if (open.data?.[0]) {
      store.setRoundId(open.data[0].id);
      return open.data[0].id;
    }
    const created = await createRound(new Date().toISOString().slice(0, 10));
    if (created?.id) {
      store.setRoundId(created.id);
      return created.id;
    }
    throw new Error("Impossible d'ouvrir une tournée.");
  };

  const buildVisitPayload = (roundId: string): VisitCreate => {
    const opportunityDetected = store.opportunityDetected === true;

    return {
      roundId: Number(roundId),
      clientId: store.client ? store.client.id : 0,
      startedAt: store.startedAt?.toISOString() ?? new Date().toISOString(),
      completedAt: new Date().toISOString(),
      location: store.location ?? { status: "GPS_UNAVAILABLE" },
      contactRole: store.contactRole ?? undefined,
      contactOther: store.contactOther.trim() || undefined,
      activityLevel: store.activityLevel ?? undefined,
      observedActivities:
        store.observedActivity != null ? [store.observedActivity] : [],
      categorie1: store.categorie1Id ?? undefined,
      categorie2: store.categorie2Id ?? undefined,
      categorie3: store.categorie3Id ?? undefined,
      equipment: store.equipment,
      equipmentQuantities: store.equipmentQuantities,
      siteSize: store.siteSize ?? undefined,
      products: store.products.map(({ lineId, productId, category2, presence, details }) => ({
        lineId,
        productId,
        category2,
        presence,
        details,
      })),
      otherProduct: store.otherProduct.trim() || undefined,
      brands: store.brands,
      competitors: store.competitors,
      sdkPosition: store.sdkPosition ?? undefined,
      opportunity: {
        detected: store.opportunityDetected,
        productId: opportunityDetected ? store.oppProductId ?? undefined : undefined,
        potential: opportunityDetected ? store.oppPotential ?? undefined : undefined,
        horizon: opportunityDetected ? store.oppHorizon ?? undefined : undefined,
        estimatedAmount:
          opportunityDetected && store.oppAmount.trim()
            ? Number(store.oppAmount)
            : undefined,
        competitorId: opportunityDetected ? store.oppCompetitorId ?? undefined : undefined,
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
      note: store.note.trim() || undefined,
    };
  };

  const handleSubmit = () => {
    if (!store.client) {
      Toast.show({ type: "error", text1: "Client requis", text2: "Sélectionnez un client." });
      return;
    }
    if (store.results.length === 0) {
      Toast.show({ type: "error", text1: "Résultat requis", text2: "Sélectionnez au moins un résultat de visite." });
      return;
    }
    if (store.opportunityDetected === true && !store.oppProductId) {
      Toast.show({ type: "error", text1: "Opportunité incomplète", text2: "Précisez le produit concerné." });
      return;
    }
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

  const takePhoto = async () => {
    const hasPermission = permission?.granted === true;
    if (!hasPermission) {
      const req = await requestPermission();
      if (!req.granted) {
        Toast.show({
          type: "error",
          text1: "Caméra non autorisée",
          text2: "Ajoutez des photos depuis la galerie.",
        });
        return;
      }
    }
    if (!isCameraVisible) {
      setIsCameraVisible(true);
      return;
    }
    if (store.photos.length >= MAX_PHOTOS) {
      Toast.show({ type: "error", text1: "Limite atteinte", text2: `Maximum ${MAX_PHOTOS} photos.` });
      return;
    }
    const picture = await cameraRef.current?.takePictureAsync({ quality: 0.7 });
    if (picture?.uri) {
      const photo: PendingVisitPhoto = {
        uri: picture.uri,
        name: `visite-${Date.now()}.jpg`,
        type: "image/jpeg",
        capturedAt: new Date().toISOString(),
      };
      store.addPhoto(photo);
      setIsFileCooldown(true);
      setTimeout(() => setIsFileCooldown(false), 800);
    }
  };

  const pickFromGallery = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "image/*",
      multiple: true,
      copyToCacheDirectory: true,
    });
    if (result.canceled || result.assets.length === 0) return;
    const remaining = MAX_PHOTOS - store.photos.length;
    if (remaining <= 0) {
      Toast.show({ type: "error", text1: "Limite atteinte", text2: `Maximum ${MAX_PHOTOS} photos.` });
      return;
    }
    const selected = result.assets.slice(0, remaining).map((asset) => ({
      uri: asset.uri,
      name: asset.name || `photo-${Date.now()}.jpg`,
      type: asset.mimeType ?? "image/jpeg",
      capturedAt: new Date().toISOString(),
    }));
    selected.forEach((p) => store.addPhoto(p));
    if (result.assets.length > remaining) {
      Toast.show({ type: "info", text1: "Photos limitées", text2: `Seules ${remaining} photos ont été ajoutées.` });
    }
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
                  ? actionDateOptions.find(
                      (o) =>
                        new Date(
                          new Date().getTime() + o.days * 86400000,
                        ).toDateString() === store.nextActionDueAt?.toDateString(),
                    )?.label ?? null
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

        <SectionCard title="Photos" icon="camera">
          <View style={styles.photoActions}>
            <Pressable
              onPress={takePhoto}
              disabled={isFileCooldown}
              style={[styles.photoActionPrimary, isFileCooldown && styles.photoActionDisabled]}
            >
              <FontAwesome5 name="camera" size={14} color="#fff" />
              <Text style={styles.photoActionPrimaryText}>
                {isCameraVisible ? "Prendre" : "Caméra"}
              </Text>
            </Pressable>
            <Pressable onPress={pickFromGallery} style={styles.photoActionGhost}>
              <FontAwesome5 name="images" size={14} color={PRIMARY} />
              <Text style={styles.photoActionGhostText}>Galerie</Text>
            </Pressable>
          </View>

          {isCameraVisible && permission?.granted ? (
            <View style={styles.cameraWrap}>
              <CameraView ref={cameraRef} style={styles.camera} facing="back" />
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
            {store.photos.length}/{MAX_PHOTOS} photo
            {store.photos.length > 1 ? "s" : ""}
          </Text>
        </SectionCard>
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
  photoActions: {
    flexDirection: "row",
    gap: 10,
  },
  photoActionPrimary: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  photoActionPrimaryText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  photoActionGhost: {
    flex: 1,
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
  photoActionGhostText: {
    color: PRIMARY,
    fontWeight: "700",
    fontSize: 13,
  },
  photoActionDisabled: {
    opacity: 0.6,
  },
  cameraWrap: {
    marginTop: 12,
  },
  camera: {
    height: 220,
    borderRadius: 10,
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
