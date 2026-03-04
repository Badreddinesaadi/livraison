import { Colors } from "@/constants/theme";
import { useBlsStore } from "@/stores/bls.store";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Image } from "expo-image";
import { useRef, useState } from "react";
import {
  Button,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const TakePhotosScreen = () => {
  const bls = useBlsStore();
  const [permission] = useCameraPermissions();
  const ref = useRef<CameraView>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const takePicture = async () => {
    const photo = await ref.current?.takePictureAsync();
    if (photo?.uri) {
      setPhotos((prev) => [...prev, photo.uri]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const renderPicture = (uri: string, index: number) => {
    return (
      <View style={styles.photoContainer}>
        <TouchableOpacity onPress={() => setPreviewUri(uri)}>
          <Image source={{ uri }} contentFit="cover" style={styles.thumbnail} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.removeBtn}
          onPress={() => removePhoto(index)}
        >
          <Text style={styles.removeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1, rowGap: 10 }}>
          {!permission?.granted && (
            <Text style={{ color: "red" }}>
              Veuillez autoriser l&apos;accès à la caméra
            </Text>
          )}
          <CameraView
            mute={false}
            responsiveOrientationWhenOrientationLocked
            ref={ref}
            style={{ flex: 1 }}
            facing={"back"}
          />

          <View style={styles.photosContainer}>
            <Text style={styles.photosCount}>
              {photos.length > 0 &&
                `${photos.length} photo${photos.length > 1 ? "s" : ""} taken`}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.photosList}>
                {photos.map((uri, index) => (
                  <View key={index}>{renderPicture(uri, index)}</View>
                ))}
              </View>
            </ScrollView>
          </View>
          <Button onPress={takePicture} title="Take picture" />
        </View>
      </View>

      {/* Preview Modal */}
      <Modal
        visible={previewUri !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewUri(null)}
      >
        <Pressable
          style={styles.previewModal}
          onPress={() => setPreviewUri(null)}
        >
          <View style={styles.previewContainer}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setPreviewUri(null)}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
            {previewUri && (
              <Image
                source={{ uri: previewUri }}
                contentFit="contain"
                style={styles.previewImage}
              />
            )}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 14,
    backgroundColor: "white",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
  },
  card: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  selectedCard: {
    backgroundColor: Colors.light.primary,
    color: "white",
  },
  shutterBtn: {
    backgroundColor: "transparent",
    borderWidth: 5,
    borderColor: "white",
    width: 85,
    height: 85,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterBtnInner: {
    width: 70,
    height: 70,
    borderRadius: 50,
  },
  photosContainer: {
    maxHeight: 140,
    paddingVertical: 10,
  },
  photosCount: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  photosList: {
    flexDirection: "row",
    gap: 10,
  },
  photoContainer: {
    position: "relative",
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  removeBtn: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "red",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  removeBtnText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  previewModal: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  previewContainer: {
    width: "90%",
    height: "80%",
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  closeBtn: {
    position: "absolute",
    top: -50,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  closeBtnText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
