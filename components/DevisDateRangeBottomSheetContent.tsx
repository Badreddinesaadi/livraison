import { PRIMARY } from "@/constants/theme";
import { FontAwesome5 } from "@expo/vector-icons";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

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
    <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: "700",
          color: "#1a1a2e",
          marginBottom: 14,
        }}
      >
        Filtrer par date
      </Text>

      <Pressable
        onPress={() => pickDate("from")}
        style={{
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
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: "#222" }}>
            Du
          </Text>
          <Text style={{ fontSize: 13, color: "#888", marginTop: 2 }}>
            {formatDisplay(fromDate)}
          </Text>
        </View>
        <FontAwesome5 name="calendar-alt" size={13} color="#98a1b0" />
      </Pressable>

      <Pressable
        onPress={() => pickDate("to")}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: 12,
          paddingHorizontal: 12,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: "#eee",
          backgroundColor: "#fff",
          marginBottom: 14,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: "#222" }}>
            Au
          </Text>
          <Text style={{ fontSize: 13, color: "#888", marginTop: 2 }}>
            {formatDisplay(toDateValue)}
          </Text>
        </View>
        <FontAwesome5 name="calendar-alt" size={13} color="#98a1b0" />
      </Pressable>

      <View style={{ flexDirection: "row", columnGap: 10 }}>
        <Pressable
          onPress={onClose}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: "#ddd",
            alignItems: "center",
            backgroundColor: "#fff",
          }}
        >
          <Text style={{ color: "#555", fontWeight: "700" }}>Annuler</Text>
        </Pressable>
        <Pressable
          onPress={reset}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: "#ddd",
            alignItems: "center",
            backgroundColor: "#fff",
          }}
        >
          <Text style={{ color: "#555", fontWeight: "700" }}>
            Réinitialiser
          </Text>
        </Pressable>
        <Pressable
          onPress={apply}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 10,
            alignItems: "center",
            backgroundColor: PRIMARY,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Appliquer</Text>
        </Pressable>
      </View>
    </View>
  );
}
