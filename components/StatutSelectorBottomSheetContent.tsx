import { PRIMARY, SUCCESS } from "@/constants/theme";
import { FontAwesome5 } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

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
    <View style={styles.container}>
      <Text style={styles.title}>Changer le statut</Text>
      <Text style={styles.subtitle}>
        Statut actuel :{" "}
        <Text style={styles.currentStatut}>
          {STATUTS.find((s) => s.key === currentStatut)?.label ?? currentStatut}
        </Text>
      </Text>

      {STATUTS.map((statut) => {
        const isCurrent = statut.key === currentStatut;
        return (
          <Pressable
            key={statut.key}
            onPress={() => onSelect(statut.key)}
            style={[
              styles.option,
              isCurrent && styles.optionSelected,
            ]}
          >
            <View
              style={[
                styles.checkbox,
                isCurrent && styles.checkboxSelected,
              ]}
            >
              {isCurrent && (
                <Text style={styles.checkText}>✓</Text>
              )}
            </View>
            <View
              style={[
                styles.badge,
                { backgroundColor: statut.color + "18" },
              ]}
            >
              <Text style={[styles.badgeText, { color: statut.color }]}>
                {statut.label}
              </Text>
            </View>
            <View style={styles.spacer} />
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

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: "#888",
    marginBottom: 14,
  },
  currentStatut: {
    fontWeight: "600",
    color: "#1a1a2e",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  optionSelected: {
    borderColor: PRIMARY,
    backgroundColor: PRIMARY + "08",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#ccc",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checkboxSelected: {
    borderColor: PRIMARY,
    backgroundColor: PRIMARY,
  },
  checkText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "700",
  },
  spacer: {
    flex: 1,
  },
});
