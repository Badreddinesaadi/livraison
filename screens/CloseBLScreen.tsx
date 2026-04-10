import { closeBL } from "@/api/BLS.api";
import { Button } from "@/components/ui/button";
import { hasVoyagePermission } from "@/constants/permissions";
import { useSession } from "@/stores/auth.store";
import { useCloseBLStore } from "@/stores/close-bl.store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Image } from "expo-image";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";

type UploadPhoto = {
  uri: string;
  name: string;
  type: string;
};

export const CloseBLScreen = () => {
  const { user } = useSession();
  const canUpdateVoyages = hasVoyagePermission(user, "UPDATE");
  const router = useRouter();
  const { blId } = useLocalSearchParams<{ blId?: string }>();
  const cameraRef = useRef<CameraView>(null);
  const closeBLStore = useCloseBLStore();
  const [permission, requestPermission] = useCameraPermissions();
  const [photos, setPhotos] = useState<UploadPhoto[]>([]);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const [isPhotoCooldown, setIsPhotoCooldown] = useState(false);
  const queryClient = useQueryClient();
  const mode = closeBLStore.mode;
  const selectedBL = closeBLStore.selectedBL;
  const allOpenBls = closeBLStore.bls;
  const voyageId = closeBLStore.voyageId;
  const paramBLId = blId ? Number(blId) : null;
  const targetBLId =
    typeof paramBLId === "number" && Number.isFinite(paramBLId)
      ? paramBLId
      : (selectedBL?.id ?? null);
  const targetBLIds = useMemo(() => {
    if (mode === "all") {
      return allOpenBls
        .map((bl) => bl.id)
        .filter((id): id is number => Number.isFinite(id));
    }

    if (typeof targetBLId === "number" && Number.isFinite(targetBLId)) {
      return [targetBLId];
    }

    return [];
  }, [mode, allOpenBls, targetBLId]);
  const isCloseAllMode = mode === "all";

  const { mutate: closeBLMutate, isPending } = useMutation({
    mutationFn: async ({
      idVoyage,
      idsBL,
      images,
      coordinates,
    }: {
      idVoyage: number;
      idsBL: number[];
      images: UploadPhoto[];
      coordinates: { x: number; y: number };
    }) => {
      await Promise.all(
        idsBL.map((idBL) =>
          closeBL({
            idVoyage,
            idBL,
            images,
            status: "livre",
            coordinates,
          }),
        ),
      );

      return idsBL.length;
    },
    onSuccess: (closedCount) => {
      Toast.show({
        type: "success",
        text1: closedCount > 1 ? "BLs clôturés" : "BL clôturé",
        text2:
          closedCount > 1
            ? `${closedCount} BLs sont marqués comme livrés.`
            : `Le BL ${selectedBL?.code ?? (targetBLId ? `#${targetBLId}` : "")} est marqué comme livré.`,
      });
      closeBLStore.reset();
      queryClient.invalidateQueries({ queryKey: ["voyages"] });
      router.back();
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Échec de clôture",
        text2: error.message || "Impossible de clôturer ce BL.",
      });
    },
  });

  const takePhoto = async () => {
    if (photos.length >= 10) {
      Toast.show({
        type: "error",
        text1: "Limite atteinte",
        text2: "Vous ne pouvez pas ajouter plus de 10 photos.",
      });
      return;
    }

    const picture = await cameraRef.current?.takePictureAsync({ quality: 0.7 });
    if (picture?.uri) {
      const photoNameBase = isCloseAllMode
        ? `voyage-${voyageId ?? "unknown"}`
        : `bl-${targetBLId ?? "unknown"}`;
      const photo: UploadPhoto = {
        uri: picture.uri,
        name: `${photoNameBase}-${Date.now()}.jpg`,
        type: "image/jpeg",
      };
      setPhotos((prev) => [...prev, photo]);

      // Start a short cooldown where the "Marquer comme livré" button shows loading
      setIsPhotoCooldown(true);
      setTimeout(() => setIsPhotoCooldown(false), 1500);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMarkAsDelivered = async () => {
    if (!canUpdateVoyages) {
      Toast.show({
        type: "error",
        text1: "Permission refusée",
        text2: "Vous n'avez pas la permission de modifier les voyages.",
      });
      return;
    }

    if (photos.length === 0) {
      Toast.show({
        type: "error",
        text1: "Photo requise",
        text2: "Veuillez prendre au moins une photo du BL livré.",
      });
      return;
    }

    if (!voyageId || targetBLIds.length === 0) {
      Toast.show({
        type: "error",
        text1: "Contexte BL invalide",
        text2: "Impossible de retrouver le voyage ou les BLs sélectionnés.",
      });
      return;
    }

    setIsCapturingLocation(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Toast.show({
          type: "error",
          text1: "Localisation requise",
          text2: "Veuillez autoriser la localisation pour clôturer le BL.",
        });
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = position.coords;

      closeBLMutate({
        idVoyage: voyageId,
        idsBL: targetBLIds,
        coordinates: { x: longitude, y: latitude },
        images: photos,
      });
    } catch {
      Toast.show({
        type: "error",
        text1: "Position indisponible",
        text2: "Impossible de récupérer votre position actuelle.",
      });
    } finally {
      setIsCapturingLocation(false);
    }
  };

  if (!canUpdateVoyages) {
    return (
      <View style={styles.centered}>
        <Text style={styles.infoText}>
          Vous n'avez pas la permission de clôturer un BL.
        </Text>
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={styles.centered}>
        <Text style={styles.infoText}>
          Vérification de la permission caméra…
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Accès caméra requis</Text>
          <Text style={styles.subtitle}>
            Autorisez la caméra pour prendre la photo de livraison du BL.
          </Text>
          <View style={styles.footer}>
            <Button
              preset="filled"
              text="Autoriser la caméra"
              onPress={requestPermission}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {isCloseAllMode
              ? `Photo de livraison pour ${targetBLIds.length} BLs`
              : `Photo de livraison du BL ${selectedBL?.code ?? (targetBLId ? `#${targetBLId}` : "")}`}
          </Text>
          <Text style={styles.subtitle}>Voyage #{voyageId ?? "-"}</Text>
        </View>

        <View style={styles.cameraContainer}>
          <CameraView ref={cameraRef} style={styles.camera} facing="back" />
        </View>

        <View style={styles.actionRow}>
          <Button
            preset="default"
            text={`Prendre une photo (${photos.length})`}
            onPress={takePhoto}
          />
        </View>

        <FlatList
          data={photos}
          horizontal
          keyExtractor={(item, index) => `${item.uri}-${index}`}
          contentContainerStyle={styles.previewList}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <View style={styles.previewItemWrap}>
              <Image source={{ uri: item.uri }} style={styles.previewImage} />
              <Pressable
                onPress={() => removePhoto(index)}
                style={styles.deleteBadge}
              >
                <Text style={styles.deleteBadgeText}>×</Text>
              </Pressable>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyPreviewText}>Aucune photo capturée</Text>
          }
        />

        <View style={styles.footer}>
          <Button
            preset="filled"
            text={
              isCloseAllMode
                ? "Marquer tous comme livrés"
                : "Marquer comme livré"
            }
            disabled={photos.length === 0 || isPhotoCooldown}
            isLoading={isPending || isCapturingLocation || isPhotoCooldown}
            onPress={handleMarkAsDelivered}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 14,
    backgroundColor: "#f7f8fa",
  },
  content: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "#f7f8fa",
  },
  infoText: {
    color: "#666",
    fontSize: 14,
  },
  header: {
    marginTop: 6,
    marginBottom: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#11181C",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: "#666",
  },
  cameraContainer: {
    flex: 1,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#ddd",
  },
  camera: {
    width: "100%",
    height: "100%",
  },
  actionRow: {
    marginTop: 10,
    marginBottom: 4,
  },
  previewList: {
    paddingVertical: 8,
    gap: 10,
  },
  previewItemWrap: {
    width: 90,
    height: 90,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#e5e5e5",
    marginRight: 10,
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  deleteBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBadgeText: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 18,
    fontWeight: "700",
  },
  emptyPreviewText: {
    color: "#777",
    fontSize: 13,
    paddingVertical: 6,
  },
  formScroll: {
    flex: 1,
  },
  formContent: {
    gap: 12,
    paddingBottom: 14,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#efefef",
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a2e",
  },
  pickerWrapper: {
    borderColor: "#e8e8e8",
    borderWidth: 1,
    borderRadius: 10,
    overflow: "hidden",
  },
  kmInput: {
    height: 48,
    borderColor: "#e8e8e8",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 14,
    color: "#11181C",
    backgroundColor: "#fff",
  },
  dateButton: {
    height: 48,
    borderColor: "#e8e8e8",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  dateButtonText: {
    fontSize: 14,
    color: "#333",
  },
  footer: {
    marginBottom: 10,
    marginTop: 8,
  },
});
