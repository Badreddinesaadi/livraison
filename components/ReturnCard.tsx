import { Return } from "@/api/return.api";
import { PRIMARY, SUCCESS } from "@/constants/theme";
import { FontAwesome5 } from "@expo/vector-icons";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import {
  LayoutAnimation,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
const getReturnStatusUi = (status: Return["statut"]) => {
  if (status === "terminer") {
    return {
      label: "Terminé",
      color: SUCCESS,
      bg: SUCCESS + "22",
      icon: "check-circle" as const,
    };
  }
  if (status === "refuser") {
    return {
      label: "Refusé",
      color: "#ff4d4d",
      bg: "#ff4d4d" + "22",
      icon: "times-circle" as const,
    };
  } else {
    return {
      label: "En cours",
      color: PRIMARY,
      bg: PRIMARY + "22",
      icon: "clock" as const,
    };
  }
};

export const ReturnCard = ({
  item,
  canManageReturn = true,
  onShowDetails,
  onMore,
}: {
  item: Return;
  canManageReturn?: boolean;
  onShowDetails: () => void;
  onMore: () => void;
}) => {
  const [expanded, setExpanded] = useState(false);

  const imageCount = item.images?.length ?? 0;

  const statusUi = useMemo(() => getReturnStatusUi(item.statut), [item.statut]);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((v) => !v);
  };

  return (
    <Pressable onPress={toggle} style={styles.card}>
      <View style={styles.header}>
        <View
          style={[styles.iconBubble, { backgroundColor: statusUi.bg }]}
        >
          <FontAwesome5 name={statusUi.icon} size={16} color={statusUi.color} />
        </View>

        <View style={styles.titleWrap}>
          <Text style={styles.title}>
            R{item.id}-{item?.date ? format(item?.date, "yyMMdd") : "—"}
          </Text>
          <Text style={styles.subtitle}>
            {item.nomChauffeur || "Chauffeur inconnu"}
          </Text>
        </View>

        <View style={styles.meta}>
          <Text style={[styles.statusLabel, { color: statusUi.color }]}>
            {statusUi.label}
          </Text>
          <Text style={styles.imageCount}>
            {imageCount} image{imageCount > 1 ? "s" : ""}
          </Text>
        </View>

        <FontAwesome5
          name={expanded ? "chevron-up" : "chevron-down"}
          size={12}
          color="#bbb"
        />
      </View>

      {expanded && (
        <View style={styles.body}>
          <DetailText
            icon="building"
            label="Client"
            value={item.client || "—"}
          />
          <DetailText
            icon="exclamation-triangle"
            label="Motif"
            value={item.reclamation || "—"}
          />
          <DetailText
            icon="exclamation-triangle"
            label="Retour MSE"
            value={item.retour_Mse === "oui" ? "Oui" : "Non"}
          />
          <DetailText
            icon="file-signature"
            label="BL cacheté"
            value={item.Bl_cachetet === "oui" ? "Oui" : "Non"}
          />
          <DetailText
            icon="money-check-alt"
            label="Règlement"
            value={item.reglement === "oui" ? "Oui" : "Non"}
          />

          <View style={styles.actionRow}>
            <Pressable onPress={onShowDetails} style={styles.detailsButton}>
              <FontAwesome5 name="eye" size={14} color={PRIMARY} />
              <Text style={styles.detailsButtonText}>Détails</Text>
            </Pressable>
            {canManageReturn && (
              <Pressable onPress={onMore} style={styles.moreButton}>
                <FontAwesome5 name="ellipsis-h" size={14} color={PRIMARY} />
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
  statusLabel: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 2,
  },
  imageCount: {
    fontSize: 12,
    color: "#aaa",
  },
  body: {
    borderTopWidth: 1,
    borderTopColor: "#f2f2f2",
    paddingHorizontal: 14,
    paddingVertical: 12,
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
  moreButton: {
    width: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: PRIMARY + "12",
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
});
