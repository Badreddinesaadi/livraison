import { closeBL } from "@/api/BLS.api";
import { Button } from "@/components/ui/button";
import { useCloseBLStore } from "@/stores/close-bl.store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

type UploadPhoto = {
  uri: string;
  name: string;
  type: string;
};

export const CloseBLScreen = () => {
  const router = useRouter();
  const { blId } = useLocalSearchParams<{ blId?: string }>();
  const cameraRef = useRef<CameraView>(null);
  const closeBLStore = useCloseBLStore();
  const [permission, requestPermission] = useCameraPermissions();
  const [photos, setPhotos] = useState<UploadPhoto[]>([]);
  const queryClient = useQueryClient();
  const selectedBL = closeBLStore.selectedBL;
  const voyageId = closeBLStore.voyageId;
  const targetBLId = Number(blId ?? selectedBL?.id);

  const { mutate: closeBLMutate, isPending } = useMutation({
    mutationFn: closeBL,
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "BL clôturé",
        text2: `Le BL ${selectedBL?.code ?? `#${targetBLId}`} est marqué comme livré.`,
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
    const picture = await cameraRef.current?.takePictureAsync({ quality: 0.7 });
    if (picture?.uri) {
      const photo: UploadPhoto = {
        uri: picture.uri,
        name: `bl-${targetBLId}-${Date.now()}.jpg`,
        type: "image/jpeg",
      };
      setPhotos((prev) => [...prev, photo]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMarkAsDelivered = () => {
    if (photos.length === 0) {
      Toast.show({
        type: "error",
        text1: "Photo requise",
        text2: "Veuillez prendre au moins une photo du BL livré.",
      });
      return;
    }

    if (!voyageId || !targetBLId) {
      Toast.show({
        type: "error",
        text1: "Contexte BL invalide",
        text2: "Impossible de retrouver le voyage ou le BL sélectionné.",
      });
      return;
    }

    closeBLMutate({
      idVoyage: voyageId,
      idBL: targetBLId,
      status: "livre",
      images: photos,
    });
  };

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
            Photo de livraison du BL {selectedBL?.code ?? `#${targetBLId}`}
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
            text="Marquer comme livré"
            disabled={photos.length === 0}
            isLoading={isPending}
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
