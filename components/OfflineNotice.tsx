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
          <FontAwesome5 name="wifi" size={12} color={Colors.light.background} />
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
    left: 0,
    right: 0,
    zIndex: 1000,
    alignItems: "center",
  },
  banner: {
    backgroundColor: Colors.light.primary,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    columnGap: 6,
  },
  text: {
    color: Colors.light.background,
    fontSize: 11,
    fontWeight: "600",
  },
});
