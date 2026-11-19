import { DemandeTransfert } from "@/api/demande-transfert.api";
import { PRIMARY, SUCCESS } from "@/constants/theme";
import { FontAwesome5 } from "@expo/vector-icons";
import { useState } from "react";
import {
  LayoutAnimation,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type DemandeTransfertCardProps = {
  item: DemandeTransfert;
  onViewDetails: () => void;
};

const STATUT_STYLE: Record<
  string,
  { bg: string; text: string }
> = (() => {
  const map: Record<string, { bg: string; text: string }> = {};

  return new Proxy(map, {
    get(target, key: string) {
      if (key in target) return target[key];
      const lower = key.toLowerCase();
      if (
        lower.includes("valid") ||
        lower.includes("valider") ||
        lower.includes("terminer")
      ) {
        return { bg: SUCCESS + "18", text: SUCCESS };
      }
      if (
        lower.includes("brouillon") ||
        lower.includes("encours")
      ) {
        return { bg: "#f59e0b18", text: "#f59e0b" };
      }
      if (lower.includes("refus") || lower.includes("annul")) {
        return { bg: "#ef444418", text: "#ef4444" };
      }
      return { bg: "#9ca3af18", text: "#9ca3af" };
    },
  }) as Record<string, { bg: string; text: string }>;
})();

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const DemandeTransfertCard = ({ item, onViewDetails }: DemandeTransfertCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const statutStyle = STATUT_STYLE[item.statut] ?? {
    bg: "#9ca3af18",
    text: "#9ca3af",
  };

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((v) => !v);
  };

  return (
    <Pressable onPress={toggle} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBubble}>
          <FontAwesome5 name="exchange-alt" size={15} color={PRIMARY} />
        </View>

        <View style={styles.titleWrap}>
          <Text style={styles.title}>{item.reference}</Text>
          <Text style={styles.subtitle}>
            {item.transporteur || item.createur}
          </Text>
        </View>

        <View style={styles.meta}>
          <View
            style={[styles.statusBadge, { backgroundColor: statutStyle.bg }]}
          >
            <Text style={[styles.statusText, { color: statutStyle.text }]}>
              {item.statut}
            </Text>
          </View>
          <Text style={styles.date}>{formatDate(item.date)}</Text>
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
            icon="truck"
            label="Transporteur"
            value={item.transporteur || "-"}
          />
          <DetailText
            icon="hashtag"
            label="Matricule"
            value={item.matricule || "-"}
          />
          <DetailText
            icon="barcode"
            label="DUM"
            value={item.dum || "-"}
          />
          <DetailText
            icon="warehouse"
            label="Dépôt source"
            value={
              item.depot_source
                ? `${item.depot_source}`
                : `ID ${item.idDepotSource}`
            }
          />
          <DetailText
            icon="warehouse"
            label="Dépôt dest."
            value={
              item.depot_destination
                ? `${item.depot_destination}`
                : `ID ${item.idDepotDestination}`
            }
          />
          <DetailText
            icon="calendar"
            label="Date"
            value={formatDateTime(item.date)}
          />
          <DetailText
            icon="comment"
            label="Observation"
            value={item.observation || "-"}
          />
          <DetailText
            icon="user-check"
            label="Créé par"
            value={item.createur || "-"}
          />

          <View style={styles.actionRow}>
            <Pressable onPress={onViewDetails} style={styles.detailsButton}>
              <FontAwesome5 name="eye" size={14} color={PRIMARY} />
              <Text style={styles.detailsButtonText}>Détails</Text>
            </Pressable>
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
    backgroundColor: PRIMARY + "22",
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
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  date: {
    fontSize: 11,
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
