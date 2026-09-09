import { listRounds } from "@/api/rounds.api";
import { hasRapportVisitePermission } from "@/constants/permissions";
import { PRIMARY } from "@/constants/theme";
import RvtAnalyticsScreen from "@/screens/RvtAnalyticsScreen";
import RvtRoundsScreen from "@/screens/RvtRoundsScreen";
import { useSession } from "@/stores/auth.store";
import { useCreateVisitStore } from "@/stores/create-visit.store";
import { FontAwesome5 } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type RvtTab = "tours" | "analytics";

const TABS: { key: RvtTab; label: string; icon: string }[] = [
  { key: "tours", label: "Tournées", icon: "route" },
  { key: "analytics", label: "Analytique", icon: "chart-bar" },
];

export default function RvtScreen() {
  const { user } = useSession();
  const canList = hasRapportVisitePermission(user, "LIST");
  const store = useCreateVisitStore();
  const [tab, setTab] = useState<RvtTab>("tours");

  const { data: openRound } = useQuery({
    queryKey: ["rounds", "open"],
    queryFn: async () => {
      const result = await listRounds({ status: "open", page: 1, perPage: 1 });
      return result.data?.[0] ?? null;
    },
    enabled: canList,
  });

  useEffect(() => {
    if (openRound?.id && !store.roundId) {
      store.setRoundId(openRound.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openRound?.id]);

  if (!canList) {
    return (
      <View style={styles.lockScreen}>
        <FontAwesome5 name="lock" size={34} color="#bbb" />
        <Text style={styles.lockText}>
          {
            "Vous n'avez pas la permission d'accéder au module Rapport de visite."
          }
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.tabsBar}>
        {TABS.map((item) => {
          const active = tab === item.key;
          return (
            <Pressable
              key={item.key}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setTab(item.key)}
            >
              <FontAwesome5
                name={item.icon}
                size={12}
                color={active ? "#fff" : "#7a8496"}
                solid
              />
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {tab === "tours" ? <RvtRoundsScreen /> : <RvtAnalyticsScreen />}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 14,
    marginTop: 4,
    backgroundColor: "#f7f8fa",
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
  tabsBar: {
    flexDirection: "row",
    backgroundColor: "#eceef2",
    borderRadius: 10,
    padding: 3,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 9,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: PRIMARY,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#7a8496",
  },
  tabLabelActive: {
    color: "#fff",
  },
  roundBanner: {
    backgroundColor: PRIMARY + "10",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PRIMARY + "33",
    padding: 14,
    marginBottom: 12,
  },
  roundBannerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  roundBannerTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: PRIMARY,
  },
  roundBannerSubtitle: {
    color: "#666",
    fontSize: 12,
    marginTop: 4,
  },
});
