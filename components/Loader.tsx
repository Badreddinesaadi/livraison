import LottieView from "lottie-react-native";
import React from "react";
import { StyleSheet, View } from "react-native";

export default function Loader() {
  return (
    <View style={styles.container}>
      <LottieView
        source={require("../assets/lottie/loader.json")}
        autoPlay
        loop
        style={styles.lottie}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  lottie: {
    width: 160,
    height: 160,
  },
});
