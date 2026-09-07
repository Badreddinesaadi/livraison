import { PRIMARY } from "@/constants/theme";
import {
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

type RvtRoundEditBottomSheetContentProps = {
  nom: string;
  startedAt: Date;
  isLoading?: boolean;
  onNomChange: (nom: string) => void;
  onStartedAtChange: (date: Date) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

const formatDate = (d: Date) =>
  `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;

export default function RvtRoundEditBottomSheetContent({
  nom,
  startedAt,
  isLoading = false,
  onNomChange,
  onStartedAtChange,
  onConfirm,
  onCancel,
}: RvtRoundEditBottomSheetContentProps) {
  const showCalendar = () => {
    const show = (event: any, date?: Date) => {
      if (date) onStartedAtChange(date);
      if (Platform.OS === "android") return;
    };
    DateTimePickerAndroid.open({
      value: startedAt,
      mode: "date",
      display: "default",
      onChange: show,
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
      <Pressable onPress={showCalendar} style={styles.dateButton}>
        <Text style={styles.dateText}>{formatDate(startedAt)}</Text>
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
    marginBottom: 16,
  },
  dateText: {
    fontSize: 14,
    color: "#222",
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
