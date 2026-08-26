import { PRIMARY } from "@/constants/theme";
import { PresenceLevel } from "@/types/rvt.types";
import { FontAwesome5 } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export const SectionCard = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: string;
  children: React.ReactNode;
}) => (
  <View style={styles.card}>
    <View style={styles.sectionHeader}>
      {icon ? (
        <FontAwesome5 name={icon as any} size={14} color={PRIMARY} />
      ) : null}
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

export const RvtSelectorField = ({
  label,
  value,
  placeholder = "Sélectionner",
  onPress,
  required = false,
}: {
  label: string;
  value?: string | null;
  placeholder?: string;
  onPress: () => void;
  required?: boolean;
}) => (
  <View style={styles.fieldWrap}>
    <Text style={styles.fieldLabel}>
      {label} {required ? <Text style={styles.required}>*</Text> : null}
    </Text>
    <Pressable onPress={onPress} style={styles.fieldButton}>
      <Text
        style={[styles.fieldValue, !value && styles.fieldPlaceholder]}
        numberOfLines={1}
      >
        {value || placeholder}
      </Text>
      <FontAwesome5 name="chevron-down" size={12} color="#888" />
    </Pressable>
  </View>
);

export const RvtTextInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  keyboardType,
  maxLength,
  required = false,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: "numeric" | "decimal-pad" | "default";
  maxLength?: number;
  required?: boolean;
}) => (
  <View style={styles.fieldWrap}>
    <Text style={styles.fieldLabel}>
      {label} {required ? <Text style={styles.required}>*</Text> : null}
    </Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#bbb"
      multiline={multiline}
      keyboardType={keyboardType}
      maxLength={maxLength}
      textAlignVertical={multiline ? "top" : "center"}
      style={[styles.input, multiline && styles.inputMultiline]}
    />
  </View>
);

export const RvtChipRow = ({
  label,
  options,
  selected,
  onSelect,
  allowNull = false,
  required = false,
}: {
  label: string;
  options: string[];
  selected: string | null;
  onSelect: (value: string | null) => void;
  allowNull?: boolean;
  required?: boolean;
}) => (
  <View style={styles.fieldWrap}>
    <Text style={styles.fieldLabel}>
      {label} {required ? <Text style={styles.required}>*</Text> : null}
    </Text>
    <View style={styles.chipRow}>
      {options.map((option) => {
        const isSelected = selected === option;
        return (
          <Pressable
            key={option}
            onPress={() => {
              if (allowNull && isSelected) {
                onSelect(null);
              } else {
                onSelect(option);
              }
            }}
            style={[styles.chip, isSelected && styles.chipSelected]}
          >
            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  </View>
);

export const RvtPresenceLevels = ({
  value,
  onChange,
  label = "Niveau de présence",
}: {
  value: PresenceLevel | undefined;
  onChange: (value: PresenceLevel) => void;
  label?: string;
}) => (
  <RvtChipRow
    label={label}
    options={["Faible", "Moyen", "Important"]}
    selected={value ?? null}
    onSelect={(v) => v && onChange(v as PresenceLevel)}
  />
);

export const RvtFooterButton = ({
  label,
  onPress,
  isLoading = false,
  disabled = false,
  danger = false,
}: {
  label: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  danger?: boolean;
}) => (
  <Pressable
    onPress={onPress}
    disabled={disabled || isLoading}
    style={[
      styles.footerButton,
      danger && styles.footerButtonDanger,
      (disabled || isLoading) && styles.footerButtonDisabled,
    ]}
  >
    <Text style={styles.footerButtonText}>
      {isLoading ? "Chargement..." : label}
    </Text>
  </Pressable>
);

export const RvtChipsMulti = ({
  label,
  options,
  selected,
  onToggle,
  required = false,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  required?: boolean;
}) => (
  <View style={styles.fieldWrap}>
    <Text style={styles.fieldLabel}>
      {label} {required ? <Text style={styles.required}>*</Text> : null}
    </Text>
    <View style={styles.chipRow}>
      {options.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <Pressable
            key={option}
            onPress={() => onToggle(option)}
            style={[styles.chip, isSelected && styles.chipSelected]}
          >
            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#efefef",
    padding: 14,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a2e",
  },
  fieldWrap: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
  },
  required: {
    color: PRIMARY,
  },
  fieldButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e8e8e8",
    backgroundColor: "#fff",
  },
  fieldValue: {
    fontSize: 14,
    color: "#222",
    flex: 1,
  },
  fieldPlaceholder: {
    color: "#bbb",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e8e8e8",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 44,
    fontSize: 14,
    color: "#222",
    backgroundColor: "#fff",
  },
  inputMultiline: {
    paddingVertical: 10,
    minHeight: 90,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e8e8e8",
    backgroundColor: "#fff",
  },
  chipSelected: {
    borderColor: PRIMARY,
    backgroundColor: PRIMARY + "18",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
  },
  chipTextSelected: {
    color: PRIMARY,
  },
  footerButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PRIMARY,
  },
  footerButtonDanger: {
    backgroundColor: "#ff4d4f",
  },
  footerButtonDisabled: {
    opacity: 0.6,
  },
  footerButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
