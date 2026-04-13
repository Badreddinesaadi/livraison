import { Rotation } from "@/api/rotation-chauffeur.api";
import { PRIMARY } from "@/constants/theme";
import { FontAwesome5 } from "@expo/vector-icons";
import { Text, View } from "react-native";

const formatKm = (value: number) => {
  if (!Number.isFinite(value)) {
    return "-";
  }

  return `${new Intl.NumberFormat("fr-FR").format(value)} km`;
};

const formatStatusDate = (value?: string | null) => {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const RotationChauffeurCard = ({ item }: { item: Rotation }) => {
  const vehiculeLabel = item.vehicule?.trim() || "Vehicule non renseigne";
  const chauffeurLabel = item.chauffeur?.trim() || "Chauffeur non renseigne";
  const isAvailable = item.disponibilite === true;
  const statusLabel = isAvailable ? "Disponible" : "Reserve";
  const statusBackgroundColor = isAvailable ? "#1F9D55" : "#D14343";
  const statusDateLabel = isAvailable ? "Disponible depuis" : "Reserve depuis";
  const statusDateValue = isAvailable
    ? formatStatusDate(item.date_retour)
    : formatStatusDate(item.date_depart);
  const villeLabel = item.ville?.trim() || "Ville non renseignee";

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
            marginRight: 8,
          }}
        >
          <Text style={{ color: PRIMARY, fontWeight: "700", fontSize: 12 }}>
            {formatKm(Number(item.km_parcourus))}
          </Text>
        </View>

        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 999,
            backgroundColor: statusBackgroundColor + "22",
          }}
        >
          <Text
            style={{
              color: statusBackgroundColor,
              fontWeight: "700",
              fontSize: 12,
            }}
          >
            {statusLabel}
          </Text>
        </View>
      </View>

      <View
        style={{
          marginTop: 12,
          borderTopWidth: 1,
          borderTopColor: "#efefef",
          paddingTop: 10,
          rowGap: 6,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <FontAwesome5 name="calendar-alt" size={12} color="#666" />
          <Text style={{ color: "#555", fontSize: 12 }}>
            {statusDateLabel}: {statusDateValue}
          </Text>
        </View>

        {!isAvailable ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <FontAwesome5 name="map-marker-alt" size={12} color="#666" />
            <Text style={{ color: "#555", fontSize: 12 }}>
              Ville d'arrivee: {villeLabel}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};
