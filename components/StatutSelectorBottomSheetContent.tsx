import { PRIMARY, SUCCESS } from "@/constants/theme";
import { FontAwesome5 } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

const STATUTS = [
  { key: "Brouillon", label: "Brouillon", color: "#f59e0b" },
  { key: "Encours", label: "Encours", color: "#3b82f6" },
  { key: "Envoye", label: "Envoyé", color: "#8b5cf6" },
  { key: "Reçue", label: "Reçue", color: SUCCESS },
];

type StatutSelectorBottomSheetContentProps = {
  currentStatut: string;
  onSelect: (statut: string) => void;
};

export default function StatutSelectorBottomSheetContent({
  currentStatut,
  onSelect,
}: StatutSelectorBottomSheetContentProps) {
  return (
    <View style={{ paddingHorizontal: 16, paddingBottom: 10 }}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: "700",
          color: "#1a1a2e",
          marginBottom: 4,
        }}
      >
        Changer le statut
      </Text>
      <Text style={{ fontSize: 12, color: "#888", marginBottom: 14 }}>
        Statut actuel :{" "}
        <Text style={{ fontWeight: "600", color: "#1a1a2e" }}>
          {STATUTS.find((s) => s.key === currentStatut)?.label ?? currentStatut}
        </Text>
      </Text>

      {STATUTS.map((statut) => {
        const isCurrent = statut.key === currentStatut;
        return (
          <Pressable
            key={statut.key}
            onPress={() => onSelect(statut.key)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 12,
              paddingHorizontal: 12,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: isCurrent ? PRIMARY : "#eee",
              backgroundColor: isCurrent ? PRIMARY + "08" : "#fff",
              marginBottom: 8,
            }}
          >
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 4,
                borderWidth: 2,
                borderColor: isCurrent ? PRIMARY : "#ccc",
                backgroundColor: isCurrent ? PRIMARY : "transparent",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              {isCurrent && (
                <Text
                  style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}
                >
                  ✓
                </Text>
              )}
            </View>
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 6,
                backgroundColor: statut.color + "18",
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: statut.color,
                }}
              >
                {statut.label}
              </Text>
            </View>
            <View style={{ flex: 1 }} />
            <FontAwesome5
              name="chevron-right"
              size={12}
              color="#ccc"
            />
          </Pressable>
        );
      })}
    </View>
  );
}
