import { PendingVisitPhoto, useRvtCameraStore } from "@/stores/rvt-camera.store";
import RvtPicturePreview from "@/components/RvtPicturePreview";
import { PRIMARY } from "@/constants/theme";
import { FontAwesome5 } from "@expo/vector-icons";
import { useCameraPermissions, CameraView } from "expo-camera";
import * as DocumentPicker from "expo-document-picker";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

const CAPTURE_COOLDOWN_MS = 700;

const ThumbItem = memo(function ThumbItem({
  item,
  onRemove,
  onPreview,
}: {
  item: PendingVisitPhoto;
  onRemove: (uri: string) => void;
  onPreview: (uri: string) => void;
}) {
  return (
    <View style={styles.thumbWrap}>
      <Pressable onPress={() => onPreview(item.uri)}>
        <Image
          source={{ uri: item.uri }}
          style={styles.thumb}
          contentFit="cover"
          transition={80}
        />
      </Pressable>
      <Pressable
        onPress={() => onRemove(item.uri)}
        style={styles.thumbRemove}
        hitSlop={6}
      >
        <FontAwesome5 name="times" size={10} color="#fff" />
      </Pressable>
    </View>
  );
});

export default function RvtCameraScreen() {
  const router = useRouter();
  const store = useRvtCameraStore();

  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      store.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const photos = store.photos;
  const remaining = store.maxPhotos - photos.length;
  const canCapture = store.multiple || photos.length === 0;
  const hasCameraPermission = permission?.granted === true;

  const handleCapture = useCallback(async () => {
    if (isCapturing) return;
    if (!canCapture) {
      Toast.show({
        type: "error",
        text1: "Limite atteinte",
        text2: `Maximum ${store.maxPhotos} photo${store.maxPhotos > 1 ? "s" : ""}.`,
      });
      return;
    }
    const hasPermission = permission?.granted === true;
    if (!hasPermission) {
      const req = await requestPermission();
      if (!req.granted) {
        Toast.show({
          type: "error",
          text1: "Caméra non autorisée",
          text2: "Utilisez la galerie pour ajouter des photos.",
        });
        return;
      }
    }
    setIsCapturing(true);
    try {
      const picture = await cameraRef.current?.takePictureAsync({
        quality: 0.7,
      });
      if (picture?.uri) {
        store.addPhoto({
          uri: picture.uri,
          name: `photo-${Date.now()}.jpg`,
          type: "image/jpeg",
          capturedAt: new Date().toISOString(),
        });
      }
    } finally {
      setTimeout(() => setIsCapturing(false), CAPTURE_COOLDOWN_MS);
    }
  }, [isCapturing, canCapture, permission, requestPermission, store]);

  const pickFromGallery = useCallback(async () => {
    if (remaining <= 0) {
      Toast.show({
        type: "error",
        text1: "Limite atteinte",
        text2: `Maximum ${store.maxPhotos} photo${store.maxPhotos > 1 ? "s" : ""}.`,
      });
      return;
    }
    const result = await DocumentPicker.getDocumentAsync({
      type: "image/*",
      multiple: store.multiple,
      copyToCacheDirectory: true,
    });
    if (result.canceled || result.assets.length === 0) return;
    const selected = result.assets
      .slice(0, remaining)
      .map((asset) => ({
        uri: asset.uri,
        name: asset.name || `photo-${Date.now()}.jpg`,
        type: asset.mimeType ?? "image/jpeg",
        capturedAt: new Date().toISOString(),
      }));
    selected.forEach((p) => store.addPhoto(p));
    if (result.assets.length > remaining) {
      Toast.show({
        type: "info",
        text1: "Photos limitées",
        text2: `Seules ${remaining} photo${remaining > 1 ? "s" : ""} ont été ajoutées.`,
      });
    }
  }, [remaining, store]);

  const handleValidate = useCallback(() => {
    if (photos.length === 0) {
      Toast.show({
        type: "error",
        text1: "Aucune photo",
        text2: "Prenez ou sélectionnez au moins une photo.",
      });
      return;
    }
    store.confirm();
    router.back();
  }, [photos.length, store, router]);

  const handleCancel = useCallback(() => {
    store.cancel();
    router.back();
  }, [store, router]);

  const handleRemove = useCallback(
    (uri: string) => store.removePhoto(uri),
    [store],
  );

  const keyExtractor = useCallback(
    (item: PendingVisitPhoto) => item.uri,
    [],
  );

  const renderItem = useCallback(
    ({ item }: { item: PendingVisitPhoto }) => (
      <ThumbItem
        item={item}
        onRemove={handleRemove}
        onPreview={setPreviewUri}
      />
    ),
    [handleRemove],
  );

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable onPress={handleCancel} hitSlop={10} style={styles.topButton}>
          <FontAwesome5 name="times" size={18} color="#fff" />
        </Pressable>
        <Text style={styles.counter}>
          {photos.length}/{store.maxPhotos}
        </Text>
        <View style={styles.topButton} />
      </View>

      {hasCameraPermission ? (
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
          mute={true}
        />
      ) : (
        <View style={styles.permissionBox}>
          <FontAwesome5 name="camera" size={40} color="#666" />
          <Text style={styles.permissionText}>
            {permission === null
              ? "Vérification de la permission caméra..."
              : "La caméra n'est pas autorisée. Utilisez la galerie ou autorisez la caméra."}
          </Text>
          {!hasCameraPermission && permission !== null ? (
            <Pressable
              onPress={() => requestPermission()}
              style={styles.permissionButton}
            >
              <Text style={styles.permissionButtonText}>
                Autoriser la caméra
              </Text>
            </Pressable>
          ) : null}
        </View>
      )}

      <View style={styles.bottomBar}>
        <FlatList
          data={photos}
          keyExtractor={keyExtractor}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={renderItem}
          contentContainerStyle={styles.thumbList}
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          windowSize={5}
          removeClippedSubviews
          ListEmptyComponent={
            <Text style={styles.emptyThumbs}>
              Aucune photo pour le moment
            </Text>
          }
        />

        <View style={styles.controls}>
          <Pressable
            onPress={pickFromGallery}
            style={styles.galleryButton}
            hitSlop={6}
          >
            <FontAwesome5 name="images" size={22} color="#fff" />
          </Pressable>

          <Pressable
            onPress={handleCapture}
            disabled={isCapturing || !canCapture}
            style={[
              styles.captureButton,
              (isCapturing || !canCapture) && styles.captureDisabled,
            ]}
          >
            <View style={styles.captureInner} />
          </Pressable>

          <Pressable
            onPress={handleValidate}
            disabled={photos.length === 0}
            style={[
              styles.validateButton,
              photos.length === 0 && styles.validateDisabled,
            ]}
          >
            <Text style={styles.validateText}>
              Valider ({photos.length})
            </Text>
          </Pressable>
        </View>
      </View>

      <RvtPicturePreview
        uri={previewUri}
        onClose={() => setPreviewUri(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#000",
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  topButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  counter: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  camera: {
    flex: 1,
  },
  permissionBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  permissionText: {
    color: "#999",
    fontSize: 14,
    textAlign: "center",
    marginTop: 14,
    lineHeight: 20,
  },
  permissionButton: {
    marginTop: 18,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 10,
    backgroundColor: PRIMARY,
  },
  permissionButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  bottomBar: {
    backgroundColor: "#0d0d0d",
    paddingTop: 12,
    paddingBottom: 24,
  },
  thumbList: {
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  thumbWrap: {
    marginRight: 10,
  },
  thumb: {
    width: 68,
    height: 68,
    borderRadius: 8,
    backgroundColor: "#1a1a1a",
  },
  thumbRemove: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#ff4d4f",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyThumbs: {
    color: "#666",
    fontSize: 13,
    paddingVertical: 24,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginTop: 10,
  },
  galleryButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#444",
    alignItems: "center",
    justifyContent: "center",
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  captureInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
  },
  captureDisabled: {
    opacity: 0.4,
  },
  validateButton: {
    minWidth: 96,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },
  validateDisabled: {
    opacity: 0.4,
  },
  validateText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});
