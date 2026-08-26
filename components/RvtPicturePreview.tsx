import { FontAwesome5 } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Modal, Pressable, StyleSheet, View } from "react-native";

type RvtPicturePreviewProps = {
  uri: string | null;
  onClose: () => void;
};

export default function RvtPicturePreview({
  uri,
  onClose,
}: RvtPicturePreviewProps) {
  return (
    <Modal
      visible={Boolean(uri)}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable onPress={onClose} style={styles.backdrop}>
        <View style={styles.frame}>
          {uri ? (
            <Image
              source={{ uri }}
              style={styles.image}
              contentFit="contain"
            />
          ) : null}
          <View style={styles.closeBox}>
            <Pressable onPress={onClose} hitSlop={12}>
              <FontAwesome5 name="times" size={16} color="#fff" />
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  frame: {
    width: "100%",
    maxWidth: 420,
    aspectRatio: 3 / 4,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#111",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  closeBox: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
});
