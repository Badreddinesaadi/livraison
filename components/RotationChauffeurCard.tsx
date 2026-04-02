import { Rotation } from "@/api/rotation-chauffeur";
import { PRIMARY } from "@/constants/theme";
import { FontAwesome5 } from "@expo/vector-icons";
import { Text, View } from "react-native";

const formatKm = (value: number) => {
  if (!Number.isFinite(value)) {
    return "-";
  }

  return `${new Intl.NumberFormat("fr-FR").format(value)} km`;
};

export const RotationChauffeurCard = ({ item }: { item: Rotation }) => {
  const vehiculeLabel = item.vehicule?.trim() || "Vehicule non renseigne";
  const chauffeurLabel = item.chauffeur?.trim() || "Chauffeur non renseigne";

  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.07,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: "#efefef",
        padding: 14,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: PRIMARY + "22",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <FontAwesome5 name="route" size={16} color={PRIMARY} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: "700", fontSize: 15, color: "#1a1a2e" }}>
            {vehiculeLabel}
          </Text>
          <Text style={{ fontSize: 13, color: "#666", marginTop: 2 }}>
            {chauffeurLabel}
          </Text>
        </View>

        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 999,
            backgroundColor: PRIMARY + "12",
          }}
        >
          <Text style={{ color: PRIMARY, fontWeight: "700", fontSize: 12 }}>
            {formatKm(Number(item.km_parcourus))}
          </Text>
        </View>
      </View>
    </View>
  );
};
