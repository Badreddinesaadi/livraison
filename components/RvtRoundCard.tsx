import { PRIMARY } from "@/constants/theme";
import { Round } from "@/types/rvt.types";
import { FontAwesome5 } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { LayoutAnimation, Pressable, StyleSheet, Text, View } from "react-native";
import { formatDateLabel } from "@/utils/rvt-format";

export const RvtRoundCard = ({
  item,
  onShowDetails,
}: {
  item: Round;
  onShowDetails: () => void;
}) => {
  const [expanded, setExpanded] = useState(false);

  const startedLabel = useMemo(
    () => formatDateLabel(item.startedAt),
    [item.startedAt],
  );
  const isOpen = item.status === "open";
  const statusUi = isOpen
    ? { bg: "#f59e0b18", color: "#f59e0b", label: "En cours" }
    : { bg: "#64748b18", color: "#64748b", label: "Clôturée" };

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((v) => !v);
  };

  return (
    <Pressable onPress={toggle} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBubble}>
          <FontAwesome5 name="route" size={16} color={PRIMARY} />
        </View>

        <View style={styles.titleWrap}>
          <Text style={styles.title} numberOfLines={1}>
            {item.nom || "Tournée sans nom"}
          </Text>
          <Text style={styles.subtitle}>
            {startedLabel} · {item.visitCount} visite
            {item.visitCount > 1 ? "s" : ""}
          </Text>        </View>

        <View style={styles.meta}>
          <View style={[styles.statusPill, { backgroundColor: statusUi.bg }]}>
            <Text style={[styles.statusText, { color: statusUi.color }]}>
              {statusUi.label}
            </Text>
          </View>
        </View>

        <FontAwesome5
          name={expanded ? "chevron-up" : "chevron-down"}
          size={12}
          color="#bbb"
        />
      </View>

      {expanded && (
        <View style={styles.body}>
          <DetailRow icon="hashtag" label="ID" value={`#${item.id}`} />
          <DetailRow
            icon="calendar-alt"
            label="Début"
            value={startedLabel}
          />
          {item.closedAt ? (
            <DetailRow
              icon="calendar-check"
              label="Clôture"
              value={formatDateLabel(item.closedAt)}
            />
          ) : null}
          <DetailRow
            icon="clipboard-list"
            label="Visites"
            value={String(item.visitCount)}
          />

          <View style={styles.actionRow}>
            <Pressable onPress={onShowDetails} style={styles.detailsButton}>
              <FontAwesome5 name="eye" size={14} color={PRIMARY} />
              <Text style={styles.detailsButtonText}>Voir la tournée</Text>
            </Pressable>
          </View>
        </View>
      )}
    </Pressable>
  );
};

const DetailRow = ({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) => (
  <View style={styles.detailRow}>
    <FontAwesome5
      name={icon as any}
      size={13}
      color={PRIMARY}
      style={styles.detailIcon}
    />
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
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
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  iconBubble: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: PRIMARY + "18",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    fontWeight: "700",
    fontSize: 15,
    color: "#1a1a2e",
  },
  subtitle: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
  },
  meta: {
    marginRight: 10,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  body: {
    borderTopWidth: 1,
    borderTopColor: "#f2f2f2",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  detailIcon: {
    width: 18,
    marginTop: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: "#888",
    width: 96,
  },
  detailValue: {
    fontSize: 13,
    color: "#222",
    flex: 1,
    flexWrap: "wrap",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f2f2f2",
  },
  detailsButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: PRIMARY + "18",
    gap: 6,
  },
  detailsButtonText: {
    color: PRIMARY,
    fontWeight: "600",
    fontSize: 13,
  },
});
