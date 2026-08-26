import { PRIMARY } from "@/constants/theme";
import { VisitReport } from "@/types/rvt.types";
import { FontAwesome5 } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { LayoutAnimation, Pressable, StyleSheet, Text, View } from "react-native";
import {
  formatDateLabel,
  formatDuration,
  syncStatusUi,
} from "@/utils/rvt-format";

export const RvtCard = ({
  item,
  canDelete = true,
  onShowDetails,
  onDelete,
}: {
  item: VisitReport;
  canDelete?: boolean;
  onShowDetails: () => void;
  onDelete: () => void;
}) => {
  const [expanded, setExpanded] = useState(false);

  const dateLabel = useMemo(
    () => formatDateLabel(item.completedAt || item.createdAt),
    [item.completedAt, item.createdAt],
  );
  const status = useMemo(() => syncStatusUi(item.syncStatus), [item.syncStatus]);
  const productCount = item.products?.length ?? 0;
  const brandCount = item.brands?.length ?? 0;
  const photoCount = item.photos?.length ?? 0;

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((v) => !v);
  };

  return (
    <Pressable onPress={toggle} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBubble}>
          <FontAwesome5 name="clipboard-list" size={16} color={PRIMARY} />
        </View>

        <View style={styles.titleWrap}>
          <Text style={styles.title}>
            {item.client?.name || "Client inconnu"}
          </Text>
          <Text style={styles.subtitle}>
            {item.client?.city || "-"}
            {item.visitId ? ` · #${item.visitId}` : ""}
          </Text>
        </View>

        <View style={styles.meta}>
          <Text style={styles.date}>{dateLabel}</Text>
          <View style={[styles.statusPill, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.label}
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
          <DetailText icon="clock" label="Durée" value={formatDuration(item.durationSeconds)} />
          <DetailText
            icon="map-marker-alt"
            label="Ville"
            value={item.client?.city || "-"}
          />
          <DetailText
            icon="boxes"
            label="Produits"
            value={`${productCount} produit${productCount > 1 ? "s" : ""} · ${brandCount} marque${brandCount > 1 ? "s" : ""}`}
          />
          <DetailText
            icon="camera"
            label="Photos"
            value={`${photoCount} photo${photoCount > 1 ? "s" : ""}`}
          />
          {item.results?.length ? (
            <DetailText
              icon="check-circle"
              label="Résultats"
              value={item.results.join(", ")}
            />
          ) : null}
          {item.note ? (
            <DetailText
              icon="comment-dots"
              label="Note"
              value={item.note.length > 120 ? `${item.note.slice(0, 120)}…` : item.note}
            />
          ) : null}

          <View style={styles.actionRow}>
            <Pressable onPress={onShowDetails} style={styles.detailsButton}>
              <FontAwesome5 name="eye" size={14} color={PRIMARY} />
              <Text style={styles.detailsButtonText}>Détails</Text>
            </Pressable>

            {canDelete && (
              <Pressable onPress={onDelete} style={styles.deleteButton}>
                <FontAwesome5 name="trash" size={14} color="#fff" />
              </Pressable>
            )}
          </View>
        </View>
      )}
    </Pressable>
  );
};

const DetailText = ({
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
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  meta: {
    alignItems: "flex-end",
    marginRight: 10,
  },
  date: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "600",
    marginBottom: 2,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
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
  deleteButton: {
    width: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#ff4d4f",
  },
});
