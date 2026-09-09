import {
  RoundFiltersStatus,
  useRvtSheetStore,
} from "@/stores/rvt-sheet.store";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { FontAwesome5 } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const STATUS_LABELS: Record<RoundFiltersStatus, string> = {
  all: "Toutes",
  open: "Ouvertes",
  closed: "Fermées",
};

const STATUS_OPTIONS: { id: string; label: string }[] = [
  { id: "all", label: "Toutes" },
  { id: "open", label: "Ouvertes" },
  { id: "closed", label: "Fermées" },
];

const formatDate = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
};

export default function RvtRoundFiltersBottomSheetContent() {
  const config = useRvtSheetStore((s) => s.roundFiltersConfig);
  const applyRoundFilters = useRvtSheetStore((s) => s.applyRoundFilters);
  const resetRoundFilters = useRvtSheetStore((s) => s.resetRoundFilters);
  const openSelect = useRvtSheetStore((s) => s.openSelect);

  const [status, setStatus] = useState<RoundFiltersStatus>(
    config?.initialStatus ?? "all",
  );
  const [from, setFrom] = useState<Date | null>(config?.initialFrom ?? null);
  const [to, setTo] = useState<Date | null>(config?.initialTo ?? null);

  if (!config) return null;

  const openStatusSelector = () => {
    openSelect({
      title: "Filtrer par statut",
      options: STATUS_OPTIONS,
      selectedId: status,
      onSelect: (id) => {
        const next = (id as RoundFiltersStatus) ?? "all";
        setStatus(next);
        applyRoundFilters(next, from, to);
      },
    });
  };

  const pickDate = (mode: "from" | "to") => {
    const current = mode === "from" ? from : to;
    DateTimePickerAndroid.open({
      value: current ?? new Date(),
      mode: "date",
      display: "default",
      onValueChange: (_event, date) => {
        if (!date) return;
        if (mode === "from") {
          setFrom(date);
          if (to && date > to) {
            setTo(date);
            applyRoundFilters(status, date, date);
          } else {
            applyRoundFilters(status, date, to);
          }
        } else {
          setTo(date);
          if (from && date < from) {
            setFrom(date);
            applyRoundFilters(status, date, date);
          } else {
            applyRoundFilters(status, from, date);
          }
        }
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Filtrer les tournées</Text>

      <Pressable onPress={openStatusSelector} style={styles.row}>
        <View style={styles.rowLabelWrap}>
          <Text style={styles.rowLabel}>Statut</Text>
          <Text style={styles.rowValue}>{STATUS_LABELS[status]}</Text>
        </View>
        <FontAwesome5 name="chevron-right" size={12} color="#98a1b0" />
      </Pressable>

      <Pressable onPress={() => pickDate("from")} style={styles.row}>
        <View style={styles.rowLabelWrap}>
          <Text style={styles.rowLabel}>Du</Text>
          <Text style={styles.rowValue}>
            {from ? formatDate(from) : "Aucune date"}
          </Text>
        </View>
        <FontAwesome5 name="calendar-alt" size={13} color="#98a1b0" solid />
      </Pressable>

      <Pressable onPress={() => pickDate("to")} style={styles.row}>
        <View style={styles.rowLabelWrap}>
          <Text style={styles.rowLabel}>Au</Text>
          <Text style={styles.rowValue}>
            {to ? formatDate(to) : "Aucune date"}
          </Text>
        </View>
        <FontAwesome5 name="calendar-alt" size={13} color="#98a1b0" solid />
      </Pressable>

      <Pressable
        onPress={() => {
          setStatus("all");
          setFrom(null);
          setTo(null);
          resetRoundFilters();
        }}
        style={styles.resetRow}
      >
        <Text style={styles.resetText}>Réinitialiser les filtres</Text>
      </Pressable>
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  rowLabelWrap: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
  },
  rowValue: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  resetRow: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
    marginTop: 2,
  },
  resetText: {
    fontWeight: "600",
    color: "#222",
  },
});
