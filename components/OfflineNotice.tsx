import { Colors } from "@/constants/theme";
import { FontAwesome5 } from "@expo/vector-icons";
import * as Network from "expo-network";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";

export default function OfflineNotice() {
  const networkState = Network.useNetworkState();
  const isOffline =
    networkState.isConnected === false ||
    networkState.isInternetReachable === false;

  return (
    <View pointerEvents="none" style={styles.container}>
      {isOffline ? (
        <Animated.View
          entering={FadeInDown.duration(260)}
          exiting={FadeOutUp.duration(220)}
          style={styles.banner}
        >
          <FontAwesome5 name="wifi" size={14} color={Colors.light.background} />
          <Text style={styles.text}>Vous êtes hors ligne</Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 12,
    left: 14,
    right: 14,
    zIndex: 1000,
  },
  banner: {
    backgroundColor: Colors.light.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    columnGap: 8,
  },
  text: {
    color: Colors.light.background,
    fontSize: 13,
    fontWeight: "600",
  },
});
