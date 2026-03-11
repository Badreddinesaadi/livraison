import { Colors } from "@/constants/theme";
import { useCreateVoyageStore } from "@/stores/voyage.store";
import { FontAwesome5 } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { Text, TouchableWithoutFeedback, View } from "react-native";

export default function StackLayout() {
  const Type = useCreateVoyageStore((state) => state.type);
  const idVoyage = useCreateVoyageStore((state) => state.idVoyage);
  return (
    <Stack
      screenOptions={{
        animation: "ios_from_right",
        header: (s) => (
          <View
            style={{
              height: 80,
              backgroundColor: Colors.light.background,
              padding: 16,
              alignItems: "flex-end",
              flexDirection: "row",
              columnGap: 16,
            }}
          >
            <TouchableWithoutFeedback
              onPress={() => {
                if (s.route.name === "index") {
                  s.navigation.replace("(app)", {});
                } else {
                  s.navigation.goBack();
                }
              }}
            >
              <FontAwesome5 name="arrow-left" size={24} color="black" />
            </TouchableWithoutFeedback>
            <Text style={{ fontSize: 20, fontWeight: "700" }}>
              {headerTitles[s.route.name] ??
                (Type === "create"
                  ? "Créer un voyage"
                  : "Modifier le voyage #" + idVoyage)}
            </Text>
            {/* <Text style={{ fontSize: 8 }}>{"DEBUG: " + s.route.name}</Text> */}
          </View>
        ),
      }}
    />
  );
}

const headerTitles: Record<string, string> = {
  chauffeur: "Remplir les donnes du voyage",
  "select-bls": "Sélectionner les BLs",
  photo: "Récapitulatif du voyage",
  index: "List des voyages",
};
