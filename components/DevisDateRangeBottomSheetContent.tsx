import { PRIMARY } from "@/constants/theme";
import { FontAwesome5 } from "@expo/vector-icons";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type DevisDateRangeBottomSheetContentProps = {
  from?: string;
  to?: string;
  onApply: (from?: string, to?: string) => void;
  onClose: () => void;
};

const toDate = (value?: string) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDisplay = (value: Date | null) =>
  value ? format(value, "dd/MM/yyyy") : "Aucune date";

export default function DevisDateRangeBottomSheetContent({
  from,
  to,
  onApply,
  onClose,
}: DevisDateRangeBottomSheetContentProps) {
  const [fromDate, setFromDate] = useState<Date | null>(toDate(from));
  const [toDateValue, setToDateValue] = useState<Date | null>(toDate(to));

  const pickDate = (mode: "from" | "to") => {
    const current = mode === "from" ? fromDate : toDateValue;
    DateTimePickerAndroid.open({
      value: current ?? new Date(),
      mode: "date",
      display: "default",
      onValueChange: (_event, date) => {
        if (!date) return;
        if (mode === "from") setFromDate(date);
        else setToDateValue(date);
      },
    });
  };

  const apply = () => {
    onApply(
      fromDate ? format(fromDate, "yyyy-MM-dd") : undefined,
      toDateValue ? format(toDateValue, "yyyy-MM-dd") : undefined,
    );
  };

  const reset = () => {
    setFromDate(null);
    setToDateValue(null);
    onApply(undefined, undefined);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Filtrer par date</Text>

      <Pressable
        onPress={() => pickDate("from")}
        style={[styles.dateButton, styles.dateButtonFrom]}
      >
        <View style={styles.dateTextWrap}>
          <Text style={styles.dateLabel}>Du</Text>
          <Text style={styles.dateValue}>{formatDisplay(fromDate)}</Text>
        </View>
        <FontAwesome5 name="calendar-alt" size={13} color="#98a1b0" />
      </Pressable>

      <Pressable
        onPress={() => pickDate("to")}
        style={[styles.dateButton, styles.dateButtonTo]}
      >
        <View style={styles.dateTextWrap}>
          <Text style={styles.dateLabel}>Au</Text>
          <Text style={styles.dateValue}>{formatDisplay(toDateValue)}</Text>
        </View>
        <FontAwesome5 name="calendar-alt" size={13} color="#98a1b0" />
      </Pressable>

      <View style={styles.actionsRow}>
        <Pressable onPress={onClose} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Annuler</Text>
        </Pressable>
        <Pressable onPress={reset} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Réinitialiser</Text>
        </Pressable>
        <Pressable onPress={apply} style={styles.applyButton}>
          <Text style={styles.applyButtonText}>Appliquer</Text>
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
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  dateButtonFrom: {
    marginBottom: 10,
  },
  dateButtonTo: {
    marginBottom: 14,
  },
  dateTextWrap: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
  },
  dateValue: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: "row",
    columnGap: 10,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  secondaryButtonText: {
    color: "#555",
    fontWeight: "700",
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: PRIMARY,
  },
  applyButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
