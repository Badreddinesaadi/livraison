import { getAnalytics } from "@/api/rvt-analytics.api";
import Loader from "@/components/Loader";
import { hasRapportVisitePermission } from "@/constants/permissions";
import { PRIMARY } from "@/constants/theme";
import { formatDuration } from "@/utils/rvt-format";
import { DashboardRanking } from "@/types/rvt.types";
import { useSession } from "@/stores/auth.store";
import { FontAwesome5 } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { ScrollView, StyleSheet, Text, View } from "react-native";

type KpiKey = "totalReports" | "uniqueClients" | "orders" | "opportunities";

const KPI_TILES: {
  key: KpiKey;
  label: string;
  icon: string;
}[] = [
  { key: "totalReports", label: "Rapports", icon: "clipboard-list" },
  { key: "uniqueClients", label: "Clients visités", icon: "store" },
  { key: "orders", label: "Commandes", icon: "shopping-cart" },
  { key: "opportunities", label: "Opportunités", icon: "lightbulb" },
];

const RANKING_SECTIONS: {
  title: string;
  key: "resultRanking" | "sdkPositionRanking" | "productRanking" | "competitorRanking" | "cityRanking";
  icon: string;
}[] = [
  { title: "Résultats des visites", key: "resultRanking", icon: "flag-checkered" },
  { title: "Position SDK", key: "sdkPositionRanking", icon: "map-marker-alt" },
  { title: "Produits les plus observés", key: "productRanking", icon: "tag" },
  { title: "Concurrents", key: "competitorRanking", icon: "users" },
  { title: "Villes", key: "cityRanking", icon: "city" },
];

const RANKBAR_MAX_ROWS = 10;

function KpiTile({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <View style={styles.kpiTile}>
      <View style={styles.kpiIconWrap}>
        <FontAwesome5 name={icon} size={13} color={PRIMARY} solid />
      </View>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
}

function RateBar({ label, rate }: { label: string; rate: number }) {
  const clamped = Math.max(0, Math.min(100, rate));
  return (
    <View style={styles.rateRow}>
      <View style={styles.rateHeader}>
        <Text style={styles.rateLabel}>{label}</Text>
        <Text style={styles.rateValue}>{clamped}%</Text>
      </View>
      <View style={styles.rateTrack}>
        <View style={[styles.rateFill, { width: `${clamped}%` as `${number}%` }]} />
      </View>
    </View>
  );
}

function MiniBar({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const ratio = max > 0 ? value / max : 0;
  return (
    <View style={styles.rankRow}>
      <Text style={styles.rankLabel} numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.rankTrack}>
        <View style={[styles.rankFill, { width: `${ratio * 100}%` as `${number}%` }]} />
      </View>
      <Text style={styles.rankValue}>{value}</Text>
    </View>
  );
}

function RankingBlock({ title, icon, rows }: { title: string; icon: string; rows: DashboardRanking[] }) {
  if (!rows.length) return null;
  const top = rows.slice(0, RANKBAR_MAX_ROWS);
  const max = Math.max(...top.map((row) => row.value), 1);
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <FontAwesome5 name={icon} size={12} color={PRIMARY} solid />
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      {top.map((row) => (
        <MiniBar key={row.label} label={row.label || "—"} value={row.value} max={max} />
      ))}
    </View>
  );
}

export default function RvtAnalyticsScreen() {
  const { user } = useSession();
  const canList = hasRapportVisitePermission(user, "LIST");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["rvt-analytics"],
    queryFn: () => getAnalytics(),
    enabled: canList,
    staleTime: 60_000,
  });

  if (!canList) {
    return (
      <View style={styles.lockScreen}>
        <FontAwesome5 name="lock" size={34} color="#bbb" />
        <Text style={styles.lockText}>
          {"Vous n'avez pas la permission d'accéder aux statistiques."}
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !data) {
    return (
      <View style={styles.stateScreen}>
        <FontAwesome5 name="chart-line" size={30} color="#c3c9d4" />
        <Text style={styles.stateText}>Statistiques indisponibles pour le moment.</Text>
      </View>
    );
  }

  const hasData = data.totalReports > 0;

  if (!hasData) {
    return (
      <View style={styles.stateScreen}>
        <FontAwesome5 name="chart-line" size={30} color="#c3c9d4" />
        <Text style={styles.stateText}>Aucune donnée disponible. Lancez une visite pour générer des statistiques.</Text>
      </View>
    );
  }

  const activityEntries = Object.entries(data.activityCounts ?? {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.screenContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.kpiGrid}>
        {KPI_TILES.map((tile) => (
          <KpiTile key={tile.key} label={tile.label} value={data[tile.key]} icon={tile.icon} />
        ))}
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <FontAwesome5 name="chart-pie" size={12} color={PRIMARY} solid />
          <Text style={styles.cardTitle}>Performance</Text>
        </View>
        <RateBar label="Taux de commande" rate={data.orderRate ?? 0} />
        <RateBar label="Taux d'opportunité" rate={data.opportunityRate ?? 0} />
      </View>

      <View style={styles.quantityGrid}>
        <View style={styles.quantityTile}>
          <Text style={styles.quantityValue}>{data.soloQuantity ?? 0}</Text>
          <Text style={styles.quantityLabel}>Quantité Solo</Text>
        </View>
        <View style={styles.quantityTile}>
          <Text style={styles.quantityValue}>{data.semiCombinedQuantity ?? 0}</Text>
          <Text style={styles.quantityLabel}>Semi-combiné</Text>
        </View>
        <View style={styles.quantityTile}>
          <Text style={styles.quantityValue}>{formatDuration(data.averageDurationSeconds)}</Text>
          <Text style={styles.quantityLabel}>Durée moyenne</Text>
        </View>
        <View style={styles.quantityTile}>
          <Text
            style={[
              styles.quantityValue,
              (data.pendingSync ?? 0) > 0 ? styles.quantityValueAccent : null,
            ]}
          >
            {data.pendingSync ?? 0}
          </Text>
          <Text style={styles.quantityLabel}>En attente de sync</Text>
        </View>
      </View>

      {activityEntries.length ? (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <FontAwesome5 name="comments" size={12} color={PRIMARY} solid />
            <Text style={styles.cardTitle}>Profils clients observés</Text>
          </View>
          <View style={styles.chipWrap}>
            {activityEntries.map(([label, count]) => (
              <View key={label} style={styles.chip}>
                <Text style={styles.chipText} numberOfLines={1}>
                  {label}
                </Text>
                <Text style={styles.chipCount}>{count}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {RANKING_SECTIONS.map((section) => (
        <RankingBlock
          key={section.key}
          title={section.title}
          icon={section.icon}
          rows={data[section.key] ?? []}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f7f8fa",
  },
  screenContent: {
    paddingVertical: 12,
    paddingBottom: 32,
    gap: 12,
  },
  lockScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "#f7f8fa",
  },
  lockText: {
    marginTop: 12,
    color: "#666",
    fontSize: 14,
    textAlign: "center",
  },
  stateScreen: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    backgroundColor: "#f7f8fa",
    gap: 12,
  },
  stateText: {
    color: "#8a92a3",
    fontSize: 14,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#eef0f4",
    padding: 14,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1f2733",
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  kpiTile: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#eef0f4",
    padding: 14,
    width: "48%" as `${number}%`,
    flexGrow: 1,
  },
  kpiIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: PRIMARY + "18",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1f2733",
  },
  kpiLabel: {
    fontSize: 12,
    color: "#8a92a3",
    marginTop: 2,
  },
  rateRow: {
    marginBottom: 12,
  },
  rateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  rateLabel: {
    fontSize: 13,
    color: "#5b6472",
  },
  rateValue: {
    fontSize: 13,
    fontWeight: "700",
    color: PRIMARY,
  },
  rateTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#eceef2",
    overflow: "hidden",
  },
  rateFill: {
    height: "100%" as `${number}%`,
    borderRadius: 4,
    backgroundColor: PRIMARY,
  },
  quantityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  quantityTile: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#eef0f4",
    paddingHorizontal: 14,
    paddingVertical: 12,
    width: "48%" as `${number}%`,
    flexGrow: 1,
  },
  quantityValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1f2733",
  },
  quantityValueAccent: {
    color: "#d97706",
  },
  quantityLabel: {
    fontSize: 12,
    color: "#8a92a3",
    marginTop: 2,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: PRIMARY + "12",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    maxWidth: "100%" as `${number}%`,
  },
  chipText: {
    fontSize: 12,
    color: PRIMARY,
    fontWeight: "600",
    flexShrink: 1,
  },
  chipCount: {
    fontSize: 12,
    fontWeight: "800",
    color: PRIMARY,
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 1,
    overflow: "hidden",
  },
  rankRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 9,
  },
  rankLabel: {
    fontSize: 12,
    color: "#5b6472",
    width: 110,
    flexShrink: 1,
  },
  rankTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#eceef2",
    overflow: "hidden",
  },
  rankFill: {
    height: "100%" as `${number}%`,
    borderRadius: 3,
    backgroundColor: PRIMARY,
  },
  rankValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1f2733",
    width: 30,
    textAlign: "right",
  },
});
