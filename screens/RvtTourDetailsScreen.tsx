import {
  closeRound,
  deleteRound,
  getRoundById,
  reopenRound,
  updateRound,
} from "@/api/rounds.api";
import { deleteVisit, listVisits } from "@/api/visits.api";
import Loader from "@/components/Loader";
import { RvtCard } from "@/components/RvtCard";
import {
  hasRapportVisitePermission,
} from "@/constants/permissions";
import { PRIMARY } from "@/constants/theme";
import { useCreateVisitStore } from "@/stores/create-visit.store";
import { useRvtSheetStore } from "@/stores/rvt-sheet.store";
import { useSession } from "@/stores/auth.store";
import { formatDateLabel } from "@/utils/rvt-format";
import { downloadPdf } from "@/utils/pdf-download";
import { apiUrl } from "@/constants/query";
import { FontAwesome5 } from "@expo/vector-icons";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function RvtTourDetailsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const { roundId } = useLocalSearchParams<{ roundId: string }>();
  const canList = hasRapportVisitePermission(user, "LIST");
  const canUpdate = hasRapportVisitePermission(user, "UPDATE");
  const canDelete = hasRapportVisitePermission(user, "DELETE");
  const canCreate = hasRapportVisitePermission(user, "CREATE");
  const canAchever = hasRapportVisitePermission(user, "ACHEVER_BL");

  const store = useCreateVisitStore();
  const openVisitDeleteConfirm = useRvtSheetStore(
    (s) => s.openVisitDeleteConfirm,
  );
  const finishVisitDelete = useRvtSheetStore((s) => s.finishVisitDelete);
  const openRoundEdit = useRvtSheetStore((s) => s.openRoundEdit);
  const openRoundDeleteConfirm = useRvtSheetStore(
    (s) => s.openRoundDeleteConfirm,
  );
  const openRoundToggleConfirm = useRvtSheetStore(
    (s) => s.openRoundToggleConfirm,
  );
  const finishRoundDelete = useRvtSheetStore((s) => s.finishRoundDelete);

  const {
    data: round,
    isLoading: roundLoading,
    isError: roundError,
  } = useQuery({
    queryKey: ["rounds", "details", roundId],
    queryFn: () => getRoundById({ id: String(roundId) }),
    enabled: canList && Boolean(roundId),
  });

  const {
    data,
    isLoading: visitsLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["visits", "list", { roundId }],
    queryFn: ({ pageParam }) =>
      listVisits({ roundId: roundId ? String(roundId) : undefined, page: pageParam, perPage: 20 }),
    enabled: canList && Boolean(roundId),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const pagination = lastPage.pagination;
      if (!pagination || pagination.page >= pagination.totalPages) {
        return undefined;
      }
      return pagination.page + 1;
    },
  });

  const visits = useMemo(
    () => data?.pages.flatMap((page) => page.data ?? []) ?? [],
    [data],
  );

  const isOpen = round?.status === "open";

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["rounds"] });
    queryClient.invalidateQueries({ queryKey: ["visits"] });
  }, [queryClient]);

  const { mutate: deleteVisitMutate, isPending: isDeletingVisit } =
    useMutation({
      mutationFn: deleteVisit,
      onSuccess: () => {
        invalidateAll();
        Toast.show({
          type: "success",
          text1: "Visite supprimée",
          text2: "La visite a été supprimée de la tournée.",
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

  const { mutate: roundStatusMutate, isPending: isStatusPending } =
    useMutation({
      mutationFn: async ({ action }: { action: "close" | "open" }) =>
        action === "close"
          ? closeRound({ id: String(roundId) })
          : reopenRound({ id: String(roundId) }),
      onSuccess: (updated) => {
        invalidateAll();
        Toast.show({
          type: "success",
          text1:
            updated?.status === "open" ? "Tournée rouverte" : "Tournée clôturée",
        });
      },
      onError: (error: any) =>
        Toast.show({
          type: "error",
          text1: "Action impossible",
          text2: error?.message || "Une erreur est survenue.",
        }),
    });

  const { mutate: deleteRoundMutate, isPending: isDeletingRound } =
    useMutation({
      mutationFn: () => deleteRound({ id: String(roundId) }),
      onSuccess: () => {
        invalidateAll();
        Toast.show({
          type: "success",
          text1: "Tournée supprimée",
        });
        router.back();
      },
      onError: (error: any) =>
        Toast.show({
          type: "error",
          text1: "Suppression impossible",
          text2: error?.message || "Une erreur est survenue.",
        }),
      onSettled: finishRoundDelete,
    });

  const { mutate: updateRoundMutate, isPending: isUpdatingRound } =
    useMutation({
      mutationFn: ({
        nom,
        startedAt,
        closedAt,
      }: {
        nom: string;
        startedAt: Date;
        closedAt: Date | null;
      }) =>
        updateRound({
          id: String(roundId),
          nom: nom.trim(),
          startedAt: `${startedAt.getFullYear()}-${String(
            startedAt.getMonth() + 1,
          ).padStart(2, "0")}-${String(startedAt.getDate()).padStart(2, "0")}`,
          closedAt: closedAt
            ? `${closedAt.getFullYear()}-${String(
                closedAt.getMonth() + 1,
              ).padStart(2, "0")}-${String(closedAt.getDate()).padStart(2, "0")}`
            : null,
        }),
      onSuccess: () => {
        invalidateAll();
        Toast.show({
          type: "success",
          text1: "Tournée modifiée",
        });
      },
      onError: (error: any) =>
        Toast.show({
          type: "error",
          text1: "Modification impossible",
          text2: error?.message || "Une erreur est survenue.",
        }),
    });

  const handleDeleteVisit = useCallback(
    (visitId: string) => {
      if (!canDelete) {
        Toast.show({
          type: "error",
          text1: "Accès refusé",
          text2: "Permission de suppression requise.",
        });
        return;
      }
      if (isDeletingVisit) return;
      openVisitDeleteConfirm(visitId, (targetId) =>
        deleteVisitMutate({ id: targetId }),
      );
    },
    [canDelete, isDeletingVisit, openVisitDeleteConfirm, deleteVisitMutate],
  );

  const handleEditRound = useCallback(() => {
    if (!round || !canUpdate) {
      Toast.show({
        type: "error",
        text1: "Accès refusé",
        text2: "Permission de modification requise.",
      });
      return;
    }
    if (!isOpen) {
      Toast.show({
        type: "info",
        text1: "Tournée clôturée",
        text2: "Rouvrez la tournée pour la modifier.",
      });
      return;
    }
    openRoundEdit({
      roundId: String(roundId),
      nom: round.nom ?? "",
      startedAt: new Date(round.startedAt),
      closedAt: round.closedAt ? new Date(round.closedAt) : null,
      onConfirm: (nom, startedAt, closedAt) =>
        updateRoundMutate({ nom, startedAt, closedAt }),
    });
  }, [round, canUpdate, isOpen, openRoundEdit, updateRoundMutate, roundId]);

  const handleDeleteRound = useCallback(() => {
    if (!round || !canDelete) {
      Toast.show({
        type: "error",
        text1: "Accès refusé",
        text2: "Permission de suppression requise.",
      });
      return;
    }
    openRoundDeleteConfirm({
      roundId: String(roundId),
      nom: round.nom,
      onConfirm: () => deleteRoundMutate(),
    });
  }, [round, canDelete, openRoundDeleteConfirm, deleteRoundMutate, roundId]);

  const handleToggleStatus = useCallback(() => {
    if (!round) return;
    if (!canAchever) {
      Toast.show({
        type: "error",
        text1: "Accès refusé",
        text2: "Permission ACHEVER requise.",
      });
      return;
    }
    openRoundToggleConfirm({
      roundId: String(roundId),
      nom: round.nom,
      isOpen,
      onConfirm: () => {
        if (isStatusPending) return;
        roundStatusMutate({ action: isOpen ? "close" : "open" });
      },
    });
  }, [
    round,
    canAchever,
    isStatusPending,
    isOpen,
    openRoundToggleConfirm,
    roundStatusMutate,
    roundId,
  ]);

  const handleAddVisit = useCallback(() => {
    if (!canCreate) {
      Toast.show({
        type: "error",
        text1: "Accès refusé",
        text2: "Permission de création requise.",
      });
      return;
    }
    if (!isOpen) {
      Toast.show({
        type: "info",
        text1: "Tournée clôturée",
        text2: "Rouvrez la tournée pour ajouter une visite.",
      });
      return;
    }
    store.resetVisitFields();
    store.setRoundId(String(roundId));
    store.setOriginTourId(String(roundId));
    store.setStartedAt(new Date());
    router.navigate("/rvt/create/client");
  }, [canCreate, isOpen, store, roundId, router]);

  const [isPdfPending, setIsPdfPending] = useState(false);

  const handleDownloadPdf = useCallback(() => {
    downloadPdf(
      `${apiUrl}/sdkboard/api/rounds/round_pdf.php?id=${roundId}`,
      `tournee-${round?.nom || roundId}`,
      setIsPdfPending,
    );
  }, [round, roundId]);

  if (!canList) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <FontAwesome5 name="lock" size={34} color="#bbb" />
          <Text style={styles.centeredText}>
            {"Vous n'avez pas la permission d'accéder aux tournées."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (roundLoading) {
    return (
      <SafeAreaView style={styles.safeCentered}>
        <FontAwesome5 name="spinner" size={30} color={PRIMARY} />
      </SafeAreaView>
    );
  }

  if (roundError || !round) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <FontAwesome5 name="exclamation-circle" size={34} color="#bbb" />
          <Text style={styles.centeredText}>
            Impossible de charger cette tournée.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.iconBubble}>
              <FontAwesome5 name="route" size={16} color={PRIMARY} />
            </View>
            <View style={styles.summaryTitleWrap}>
              <Text style={styles.summaryTitle} numberOfLines={1}>
                {round.nom || "Tournée sans nom"}
              </Text>
              <Text style={styles.summarySubtitle}>
                {formatDateLabel(round.startedAt)} · {round.visitCount} visite
                {round.visitCount > 1 ? "s" : ""}
              </Text>
              {round.closedAt ? (
                <Text style={styles.summaryClosedAt}>
                  Clôturée le {formatDateLabel(round.closedAt)}
                </Text>
              ) : null}
            </View>
            <View
              style={[
                styles.statusPill,
                isOpen ? styles.statusPillOpen : styles.statusPillClosed,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  isOpen ? styles.statusPillTextOpen : styles.statusPillTextClosed,
                ]}
              >
                {isOpen ? "En cours" : "Clôturée"}
              </Text>
            </View>
          </View>

          <View style={styles.actionsRow}>
            {canUpdate ? (
              <Pressable
                onPress={handleEditRound}
                disabled={isUpdatingRound}
                style={styles.actionButton}
              >
                <FontAwesome5 name="edit" size={12} color={PRIMARY} />
                <Text style={styles.actionButtonTextPrimary}>Modifier</Text>
              </Pressable>
            ) : null}
            {canDelete ? (
              <Pressable
                onPress={handleDeleteRound}
                disabled={isDeletingRound}
                style={styles.actionButton}
              >
                <FontAwesome5 name="trash" size={12} color="#ff4d4f" />
                <Text style={styles.actionButtonTextDanger}>Supprimer</Text>
              </Pressable>
            ) : null}
            {canAchever ? (
              <Pressable
                onPress={handleToggleStatus}
                disabled={isStatusPending}
                style={styles.actionButton}
              >
                <FontAwesome5
                  name={isOpen ? "lock" : "lock-open"}
                  size={12}
                  color={PRIMARY}
                />
                <Text style={styles.actionButtonTextPrimary}>
                  {isOpen ? "Clôturer" : "Rouvrir"}
                </Text>
              </Pressable>
            ) : null}
            {isPdfPending ? (
              <View style={styles.actionButton}>
                <FontAwesome5 name="spinner" size={12} color={PRIMARY} />
                <Text style={styles.actionButtonTextPrimary}>Génération...</Text>
              </View>
            ) : (
              <Pressable
                onPress={handleDownloadPdf}
                style={styles.actionButton}
              >
                <FontAwesome5 name="file-pdf" size={12} color={PRIMARY} />
                <Text style={styles.actionButtonTextPrimary}>PDF</Text>
              </Pressable>
            )}
          </View>
        </View>

        {isOpen && canCreate ? (
          <Pressable onPress={handleAddVisit} style={styles.addVisitButton}>
            <FontAwesome5 name="plus" size={14} color="#fff" />
            <Text style={styles.addVisitButtonText}>Ajouter une visite</Text>
          </Pressable>
        ) : null}

        <Text style={styles.visitsHeader}>
          {visits.length} visite{visits.length > 1 ? "s" : ""}
        </Text>

        {visitsLoading ? (
          <Loader />
        ) : visits.length === 0 ? (
          <View style={styles.empty}>
            <FontAwesome5 name="clipboard-list" size={40} color="#ddd" />
            <Text style={styles.emptyText}>
              Aucune visite dans cette tournée
            </Text>
          </View>
        ) : (
          <>
            {visits.map((item) => (
              <RvtCard
                key={String(item.id)}
                item={item}
                canDelete={canDelete}
                onShowDetails={() =>
                  router.navigate({
                    pathname: "/rvt/details/[visitId]",
                    params: { visitId: item.visitId || item.id },
                  })
                }
                onDelete={() => handleDeleteVisit(item.visitId || item.id)}
              />
            ))}
            {hasNextPage ? (
              <Pressable
                onPress={() => {
                  if (!isFetchingNextPage) fetchNextPage();
                }}
                style={styles.loadMore}
              >
                <Text style={styles.loadMoreText}>
                  {isFetchingNextPage ? "Chargement..." : "Charger plus"}
                </Text>
              </Pressable>
            ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f7f8fa",
  },
  safeCentered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f7f8fa",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  centeredText: {
    marginTop: 12,
    color: "#666",
    fontSize: 14,
    textAlign: "center",
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 24,
    rowGap: 12,
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#efefef",
    padding: 14,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
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
  summaryTitleWrap: {
    flex: 1,
  },
  summaryTitle: {
    fontWeight: "700",
    fontSize: 16,
    color: "#1a1a2e",
  },
  summarySubtitle: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  summaryClosedAt: {
    fontSize: 12,
    color: "#f59e0b",
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginLeft: 8,
  },
  statusPillOpen: {
    backgroundColor: "#f59e0b18",
  },
  statusPillClosed: {
    backgroundColor: "#64748b18",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  statusPillTextOpen: {
    color: "#f59e0b",
  },
  statusPillTextClosed: {
    color: "#64748b",
  },
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f2f2f2",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: PRIMARY + "10",
    flexGrow: 1,
    flexBasis: "48%",
  },
  actionButtonTextPrimary: {
    color: PRIMARY,
    fontWeight: "600",
    fontSize: 12,
  },
  actionButtonTextDanger: {
    color: "#ff4d4f",
    fontWeight: "600",
    fontSize: 12,
  },
  addVisitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: PRIMARY,
  },
  addVisitButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  visitsHeader: {
    fontSize: 13,
    color: "#888",
    paddingHorizontal: 4,
  },
  empty: {
    alignItems: "center",
    marginTop: 30,
  },
  emptyText: {
    color: "#ccc",
    marginTop: 14,
    fontSize: 14,
  },
  loadMore: {
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e2e2",
    backgroundColor: "#fff",
  },
  loadMoreText: {
    color: PRIMARY,
    fontWeight: "600",
    fontSize: 13,
  },
});
