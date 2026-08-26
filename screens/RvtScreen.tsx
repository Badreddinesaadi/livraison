import { listRounds } from "@/api/rounds.api";
import { deleteVisit, listVisits } from "@/api/visits.api";
import { RvtCard } from "@/components/RvtCard";
import Loader from "@/components/Loader";
import { hasRapportVisitePermission } from "@/constants/permissions";
import { PRIMARY } from "@/constants/theme";
import { useCreateVisitStore } from "@/stores/create-visit.store";
import { useRvtSheetStore } from "@/stores/rvt-sheet.store";
import { useSession } from "@/stores/auth.store";
import { VisitReport } from "@/types/rvt.types";
import { FontAwesome5 } from "@expo/vector-icons";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

type Tab = "ajouter" | "rapports";

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "ajouter", label: "AJOUTER RAPPORT", icon: "plus-circle" },
  { key: "rapports", label: "RAPPORTS", icon: "list-alt" },
];

export default function RvtScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const canList = hasRapportVisitePermission(user, "LIST");
  const canCreate = hasRapportVisitePermission(user, "CREATE");
  const canDelete = hasRapportVisitePermission(user, "DELETE");

  const store = useCreateVisitStore();
  const openVisitDeleteConfirm = useRvtSheetStore((s) => s.openVisitDeleteConfirm);
  const finishVisitDelete = useRvtSheetStore((s) => s.finishVisitDelete);

  const [tab, setTab] = useState<Tab>("ajouter");
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchText.trim().toLowerCase());
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchText]);

  const effectiveRoundId = openRound?.id ?? store.roundId;

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["visits", "list", { roundId: effectiveRoundId }],
    queryFn: ({ pageParam }) =>
      listVisits({ roundId: effectiveRoundId ?? undefined, page: pageParam, perPage: 20 }),
    enabled: canList && Boolean(effectiveRoundId),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const pagination = lastPage.pagination;
      if (!pagination || pagination.page >= pagination.totalPages) return undefined;
      return pagination.page + 1;
    },
  });

  const listData = useMemo(() => {
    const all = data?.pages.flatMap((page) => page.data ?? []) ?? [];
    if (!debouncedSearch) return all;
    return all.filter((item: VisitReport) => {
      const haystack = [
        item.client?.name ?? "",
        item.client?.city ?? "",
        item.client?.code ?? "",
        item.visitId ?? "",
        item.id ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(debouncedSearch);
    });
  }, [data, debouncedSearch]);

  const { mutate: deleteVisitMutate, isPending: isDeleting } = useMutation({
    mutationFn: deleteVisit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visits"] });
      queryClient.invalidateQueries({ queryKey: ["rounds"] });
      Toast.show({
        type: "success",
        text1: "Rapport supprimé",
        text2: "Le rapport de visite a été supprimé.",
      });
    },
    onError: (error: any) =>
      Toast.show({
        type: "error",
        text1: "Suppression impossible",
        text2: error?.message || "Une erreur est survenue.",
      }),
    onSettled: finishVisitDelete,
  });

  const handleDelete = (visitId: string) => {
    if (!canDelete) {
      Toast.show({ type: "error", text1: "Accès refusé", text2: "Permission de suppression requise." });
      return;
    }
    if (isDeleting) return;
    openVisitDeleteConfirm(visitId, (targetId) => deleteVisitMutate({ id: targetId }));
  };

  const handleNewVisit = () => {
    if (!canCreate) {
      Toast.show({ type: "error", text1: "Accès refusé", text2: "Permission de création requise." });
      return;
    }
    store.resetVisitFields();
    if (!store.startedAt) store.setStartedAt(new Date());
    router.navigate("/rvt/create/client");
  };

  if (!canList && !canCreate) {
    return (
      <View style={styles.lockScreen}>
        <FontAwesome5 name="lock" size={34} color="#bbb" />
        <Text style={styles.lockText}>
          {"Vous n'avez pas la permission d'accéder au module Rapport de visite."}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.segment}>
        {TABS.map((item) => {
          const active = tab === item.key;
          return (
            <Pressable
              key={item.key}
              onPress={() => setTab(item.key)}
              style={[styles.segmentItem, active && styles.segmentItemActive]}
            >
              <FontAwesome5
                name={item.icon as any}
                size={13}
                color={active ? "#fff" : "#666"}
              />
              <Text style={[styles.segmentLabel, active && styles.segmentLabelActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {tab === "ajouter" ? (
        <View style={styles.flex}>
          {openRound ? (
            <View style={styles.roundBanner}>
              <View style={styles.roundBannerHeader}>
                <FontAwesome5 name="route" size={14} color={PRIMARY} />
                <Text style={styles.roundBannerTitle}>Tournée en cours</Text>
              </View>
              <Text style={styles.roundBannerSubtitle}>
                {openRound.visitCount} client{openRound.visitCount > 1 ? "s" : ""} enregistré{openRound.visitCount > 1 ? "s" : ""}
              </Text>
            </View>
          ) : null}

          <View style={styles.hero}>
            <View style={styles.heroIcon}>
              <FontAwesome5 name="clipboard-list" size={36} color={PRIMARY} />
            </View>
            <Text style={styles.heroTitle}>Rapport de visite terrain</Text>
            <Text style={styles.heroSubtitle}>
              {"Enregistrez une visite en moins de 5 minutes : client, profil, marché, opportunité et action."}
            </Text>
            <Pressable onPress={handleNewVisit} style={styles.heroButton}>
              <FontAwesome5 name="plus" size={16} color="#fff" />
              <Text style={styles.heroButtonText}>AJOUTER RAPPORT</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.flex}>
          <View style={styles.searchBox}>
            <FontAwesome5 name="search" size={14} color="#bbb" />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher (client, ville, code...)"
              placeholderTextColor="#bbb"
              value={searchText}
              onChangeText={setSearchText}
              clearButtonMode="while-editing"
            />
          </View>

          <Text style={styles.count}>
            {listData.length} rapport{listData.length !== 1 ? "s" : ""}
          </Text>

          <FlatList
            data={listData}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <RvtCard
                item={item}
                canDelete={canDelete}
                onShowDetails={() =>
                  router.navigate({
                    pathname: "/rvt/details/[visitId]",
                    params: { visitId: item.visitId || item.id },
                  })
                }
                onDelete={() => handleDelete(item.visitId || item.id)}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            onEndReachedThreshold={0.3}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) fetchNextPage();
            }}
            ListFooterComponent={isFetchingNextPage ? <Loader /> : null}
            ListEmptyComponent={
              isLoading ? (
                <Loader />
              ) : (
                <View style={styles.empty}>
                  <FontAwesome5 name="clipboard-list" size={40} color="#ddd" />
                  <Text style={styles.emptyText}>
                    {effectiveRoundId ? "Aucun rapport trouvé" : "Aucune tournée en cours"}
                  </Text>
                </View>
              )
            }
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
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
  segment: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: "#e8e8e8",
    marginBottom: 12,
  },
  segmentItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 9,
    backgroundColor: "transparent",
  },
  segmentItemActive: {
    backgroundColor: PRIMARY,
  },
  segmentLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#666",
  },
  segmentLabelActive: {
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
  hero: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  heroIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: PRIMARY + "18",
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a2e",
    marginTop: 18,
    textAlign: "center",
  },
  heroSubtitle: {
    color: "#888",
    fontSize: 13,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 19,
  },
  heroButton: {
    marginTop: 24,
    alignSelf: "stretch",
    paddingVertical: 15,
    borderRadius: 12,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  heroButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: "#e8e8e8",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    height: 46,
    paddingHorizontal: 10,
    fontSize: 14,
    color: "#222",
  },
  count: {
    fontSize: 13,
    color: "#aaa",
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 24,
  },
  empty: {
    alignItems: "center",
    marginTop: 60,
  },
  emptyText: {
    color: "#ccc",
    marginTop: 14,
    fontSize: 14,
  },
});
