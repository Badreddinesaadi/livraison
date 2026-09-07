import { listRounds } from "@/api/rounds.api";
import RvtRoundsScreen from "@/screens/RvtRoundsScreen";
import { hasRapportVisitePermission } from "@/constants/permissions";
import { PRIMARY } from "@/constants/theme";
import { useCreateVisitStore } from "@/stores/create-visit.store";
import { useSession } from "@/stores/auth.store";
import { FontAwesome5 } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function RvtScreen() {
  const { user } = useSession();
  const canList = hasRapportVisitePermission(user, "LIST");
  const store = useCreateVisitStore();

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
      {openRound ? (
        <View style={styles.roundBanner}>
          <View style={styles.roundBannerHeader}>
            <FontAwesome5 name="route" size={14} color={PRIMARY} />
            <Text style={styles.roundBannerTitle}>Tournée en cours</Text>
          </View>
          <Text style={styles.roundBannerSubtitle}>
            {openRound.nom || "Sans nom"} · {openRound.visitCount} visite
            {openRound.visitCount > 1 ? "s" : ""} enregistrée
            {openRound.visitCount > 1 ? "s" : ""}
          </Text>
        </View>
      ) : null}

      <RvtRoundsScreen />
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
