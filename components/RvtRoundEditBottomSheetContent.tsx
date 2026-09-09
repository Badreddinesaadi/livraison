import { PRIMARY } from "@/constants/theme";
import {
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { FontAwesome5 } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

type RvtRoundEditBottomSheetContentProps = {
  nom: string;
  startedAt: Date;
  closedAt: Date | null;
  isLoading?: boolean;
  onNomChange: (nom: string) => void;
  onStartedAtChange: (date: Date) => void;
  onClosedAtChange: (date: Date | null) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

const formatDate = (d: Date) =>
  `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;

export default function RvtRoundEditBottomSheetContent({
  nom,
  startedAt,
  closedAt,
  isLoading = false,
  onNomChange,
  onStartedAtChange,
  onClosedAtChange,
  onConfirm,
  onCancel,
}: RvtRoundEditBottomSheetContentProps) {
  const pickDate = (mode: "startedAt" | "closedAt") => {
    const current = mode === "startedAt" ? startedAt : (closedAt ?? new Date());
    DateTimePickerAndroid.open({
      value: current,
      mode: "date",
      display: "default",
      onValueChange: (_event, date) => {
        if (!date) return;
        if (mode === "startedAt") {
          onStartedAtChange(date);
          if (closedAt && date > closedAt) onClosedAtChange(date);
        } else {
          onClosedAtChange(date);
          if (date < startedAt) onStartedAtChange(date);
        }
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Modifier la tournée</Text>

      <Text style={styles.label}>Nom de la tournée</Text>
      <BottomSheetTextInput
        value={nom}
        onChangeText={onNomChange}
        placeholder="Ex. Tournée Casablanca"
        placeholderTextColor="#bbb"
        style={styles.input}
      />

      <Text style={styles.label}>Date de début</Text>
      <Pressable onPress={() => pickDate("startedAt")} style={styles.dateButton}>
        <Text style={styles.dateText}>{formatDate(startedAt)}</Text>
      </Pressable>

      <Text style={styles.label}>Date de clôture (optionnelle)</Text>
      <Pressable onPress={() => pickDate("closedAt")} style={styles.dateButton}>
        <View style={styles.dateButtonInner}>
          <Text
            style={[
              styles.dateText,
              !closedAt && styles.dateTextPlaceholder,
            ]}
          >
            {closedAt ? formatDate(closedAt) : "Non définie"}
          </Text>
          {closedAt ? (
            <Pressable
              onPress={() => onClosedAtChange(null)}
              hitSlop={8}
            >
              <FontAwesome5 name="times" size={12} color="#ff4d4f" />
            </Pressable>
          ) : null}
        </View>
      </Pressable>

      <View style={styles.buttonRow}>
        <Pressable
          onPress={onCancel}
          disabled={isLoading}
          style={[styles.cancelButton, isLoading && styles.disabled]}
        >
          <Text style={styles.cancelText}>Annuler</Text>
        </Pressable>
        <Pressable
          onPress={onConfirm}
          disabled={isLoading || !nom.trim()}
          style={[
            styles.confirmButton,
            (isLoading || !nom.trim()) && styles.disabled,
          ]}
        >
          <Text style={styles.confirmText}>
            {isLoading ? "Enregistrement..." : "Enregistrer"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e8e8e8",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: "#222",
    backgroundColor: "#fff",
    marginBottom: 14,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#e8e8e8",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fff",
    marginBottom: 14,
  },
  dateButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateText: {
    fontSize: 14,
    color: "#222",
  },
  dateTextPlaceholder: {
    color: "#999",
  },
  buttonRow: {
    flexDirection: "row",
    columnGap: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PRIMARY,
  },
  disabled: {
    opacity: 0.6,
  },
  cancelText: {
    color: "#555",
    fontWeight: "700",
  },
  confirmText: {
    color: "#fff",
    fontWeight: "700",
  },
});
