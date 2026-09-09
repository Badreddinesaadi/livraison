import { createRound, listRounds } from "@/api/rounds.api";
import { RvtRoundCard } from "@/components/RvtRoundCard";
import Loader from "@/components/Loader";
import { hasRapportVisitePermission } from "@/constants/permissions";
import { PRIMARY } from "@/constants/theme";
import { useSession } from "@/stores/auth.store";
import { useRvtSheetStore } from "@/stores/rvt-sheet.store";
import { Round } from "@/types/rvt.types";
import { FontAwesome5 } from "@expo/vector-icons";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

type RoundStatusFilter = "all" | "open" | "closed";

const formatDateFilter = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const formatCreateDate = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
};

export default function RvtRoundsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const canList = hasRapportVisitePermission(user, "LIST");
  const canCreate = hasRapportVisitePermission(user, "CREATE");

  const [createVisible, setCreateVisible] = useState(false);
  const [nom, setNom] = useState("");
  const [startedAt, setStartedAt] = useState<Date | null>(new Date());
  const [closedAt, setClosedAt] = useState<Date | null>(null);

  const [searchText, setSearchText] = useState("");
  const [searchNom, setSearchNom] = useState("");
  const [statusFilter, setStatusFilter] = useState<RoundStatusFilter>("all");
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchNom(searchText.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchText]);

  const filters = useMemo(
    () => ({
      nom: searchNom || undefined,
      status: statusFilter === "all" ? undefined : statusFilter,
      from: fromDate ? formatDateFilter(fromDate) : undefined,
      to: toDate ? formatDateFilter(toDate) : undefined,
    }),
    [searchNom, statusFilter, fromDate, toDate],
  );

  const hasActiveFilters =
    !!filters.nom || !!filters.status || !!filters.from || !!filters.to;

  const filtersCount = useMemo(
    () =>
      (filters.status ? 1 : 0) + (filters.from ? 1 : 0) + (filters.to ? 1 : 0),
    [filters],
  );

  const openRoundFiltersSheet = useRvtSheetStore((s) => s.openRoundFilters);

  const openFiltersSheet = () =>
    openRoundFiltersSheet({
      initialStatus: statusFilter,
      initialFrom: fromDate,
      initialTo: toDate,
      onApply: (status, from, to) => {
        setStatusFilter(status);
        setFromDate(from);
        setToDate(to);
      },
      onReset: resetFilters,
    });

  const resetFilters = () => {
    setSearchText("");
    setSearchNom("");
    setStatusFilter("all");
    setFromDate(null);
    setToDate(null);
  };

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isFetching,
  } = useInfiniteQuery({
    queryKey: ["rounds", "list", filters],
    queryFn: ({ pageParam }) =>
      listRounds({ ...filters, page: pageParam, perPage: 20 }),
    enabled: canList,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const pagination = lastPage.pagination;
      if (!pagination || pagination.page >= pagination.totalPages) {
        return undefined;
      }
      return pagination.page + 1;
    },
  });

  const listData = data?.pages.flatMap((page) => page.data ?? []) ?? [];

  const { mutate: createRoundMutate, isPending } = useMutation({
    mutationFn: () =>
      createRound({
        nom: nom.trim(),
        startedAt: startedAt ? formatDateFilter(startedAt) : undefined,
        closedAt: closedAt ? formatDateFilter(closedAt) : undefined,
      }),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["rounds"] });
      Toast.show({
        type: "success",
        text1: "Tournée créée",
        text2: "La tournée a été ouverte avec succès.",
      });
      setCreateVisible(false);
      setNom("");
      setStartedAt(new Date());
      setClosedAt(null);
      if (created?.id) {
        router.replace({
          pathname: "/rvt/tours/[roundId]",
          params: { roundId: created.id },
        });
      }
    },
    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "Création impossible",
        text2: error?.message || "Une erreur est survenue.",
      });
    },
  });

  const handleCreate = () => {
    if (!nom.trim()) {
      Toast.show({
        type: "error",
        text1: "Nom requis",
        text2: "Saisissez un nom pour la tournée.",
      });
      return;
    }
    if (closedAt && startedAt && closedAt < startedAt) {
      Toast.show({
        type: "error",
        text1: "Dates invalides",
        text2: "La date de clôture doit être après la date de début.",
      });
      return;
    }
    createRoundMutate();
  };

  const openCreateDatePicker = (mode: "startedAt" | "closedAt") => {
    const current = mode === "startedAt" ? startedAt : closedAt;
    DateTimePickerAndroid.open({
      value: current ?? new Date(),
      mode: "date",
      display: "default",
      onValueChange: (_event, date) => {
        if (!date) return;
        if (mode === "startedAt") {
          setStartedAt(date);
          if (closedAt && date > closedAt) setClosedAt(date);
        } else {
          setClosedAt(date);
          if (startedAt && date < startedAt) setStartedAt(date);
        }
      },
    });
  };

  if (!canList) {
    return (
      <View style={styles.lockScreen}>
        <FontAwesome5 name="lock" size={34} color="#bbb" />
        <Text style={styles.lockText}>Accès refusé.</Text>
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <View style={styles.searchRow}>
        <View style={styles.searchInputWrap}>
          <FontAwesome5 name="search" size={13} color="#9aa3b2" solid />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Rechercher une tournée..."
            placeholderTextColor="#bbb"
            style={styles.searchInput}
            returnKeyType="search"
          />
          {searchText.length ? (
            <Pressable
              onPress={() => {
                setSearchText("");
                setSearchNom("");
              }}
              style={styles.searchClear}
              hitSlop={8}
            >
              <FontAwesome5 name="times" size={12} color="#9aa3b2" solid />
            </Pressable>
          ) : null}
          <Pressable
            onPress={openFiltersSheet}
            style={styles.filterButton}
            hitSlop={6}
          >
            {filtersCount > 0 ? (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{filtersCount}</Text>
              </View>
            ) : null}
            <FontAwesome5
              name="filter"
              size={15}
              color={filtersCount > 0 ? PRIMARY : "#7a8496"}
            />
          </Pressable>
        </View>
      </View>

      <View style={styles.toolbar}>
        <Text style={styles.count}>
          {isFetching && !isFetchingNextPage ? "Chargement..." : `${listData.length} tournée${listData.length > 1 ? "s" : ""}`}
        </Text>
        {canCreate ? (
          <Pressable
            onPress={() => setCreateVisible(true)}
            style={styles.createButton}
          >
            <FontAwesome5 name="plus" size={12} color="#fff" />
            <Text style={styles.createButtonText}>Nouvelle tournée</Text>
          </Pressable>
        ) : null}
      </View>

      <FlatList
        data={listData}
        keyExtractor={(item: Round) => String(item.id)}
        renderItem={({ item }) => (
          <RvtRoundCard
            item={item}
            onShowDetails={() =>
              router.navigate({
                pathname: "/rvt/tours/[roundId]",
                params: { roundId: String(item.id) },
              })
            }
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
              <FontAwesome5 name="route" size={40} color="#ddd" />
              <Text style={styles.emptyText}>
                {hasActiveFilters
                  ? "Aucune tournée trouvée. Ajustez ou réinitialisez les filtres."
                  : "Aucune tournée trouvée"}
              </Text>
            </View>
          )
        }
      />

      <Modal
        visible={createVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCreateVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setCreateVisible(false)}
        >
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Nouvelle tournée</Text>
            <Text style={styles.modalLabel}>Nom de la tournée</Text>
            <TextInput
              value={nom}
              onChangeText={setNom}
              placeholder="Ex. Tournée Casablanca"
              placeholderTextColor="#bbb"
              style={styles.modalInput}
            />
            <Text style={styles.modalLabel}>Date de début</Text>
            <Pressable
              onPress={() => openCreateDatePicker("startedAt")}
              style={styles.modalDateButton}
            >
              <FontAwesome5 name="calendar-alt" size={13} color="#555" solid />
              <Text style={styles.modalDateText}>
                {startedAt ? formatCreateDate(startedAt) : "Choisir une date"}
              </Text>
            </Pressable>
            <Text style={styles.modalLabel}>Date de clôture (optionnelle)</Text>
            <Pressable
              onPress={() => openCreateDatePicker("closedAt")}
              style={styles.modalDateButton}
            >
              <View style={styles.modalDateButtonInner}>
                <View style={styles.modalDateButtonLeft}>
                  <FontAwesome5 name="calendar-check" size={13} color="#555" solid />
                  <Text style={styles.modalDateText}>
                    {closedAt
                      ? formatCreateDate(closedAt)
                      : "Non définie"}
                  </Text>
                </View>
                {closedAt ? (
                  <Pressable
                    onPress={() => setClosedAt(null)}
                    hitSlop={8}
                  >
                    <FontAwesome5 name="times" size={12} color="#ff4d4f" solid />
                  </Pressable>
                ) : null}
              </View>
            </Pressable>
            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setCreateVisible(false)}
                style={styles.modalCancel}
              >
                <Text style={styles.modalCancelText}>Annuler</Text>
              </Pressable>
              <Pressable
                onPress={handleCreate}
                disabled={isPending || !nom.trim()}
                style={[
                  styles.modalConfirm,
                  (isPending || !nom.trim()) && styles.modalDisabled,
                ]}
              >
                <Text style={styles.modalConfirmText}>
                  {isPending ? "Création..." : "Créer"}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  lockScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f7f8fa",
  },
  lockText: {
    marginTop: 12,
    color: "#666",
    fontSize: 14,
  },
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  searchRow: {
    marginBottom: 10,
  },
  searchInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e8eaee",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1f2733",
    padding: 0,
  },
  searchClear: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#eceef2",
    alignItems: "center",
    justifyContent: "center",
  },
  filterButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#eceef2",
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadge: {
    position: "absolute",
    top: -5,
    right: -6,
    backgroundColor: PRIMARY,
    width: 15,
    height: 15,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  filterBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
  },
  count: {
    color: "#888",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: PRIMARY,
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: 14,
  },
  modalLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#e8e8e8",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: "#222",
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  modalDateButton: {
    borderWidth: 1,
    borderColor: "#e8e8e8",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  modalDateButtonInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalDateButtonLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modalDateText: {
    fontSize: 14,
    color: "#222",
    marginLeft: 8,
  },
  modalButtons: {
    flexDirection: "row",
    columnGap: 10,
  },
  modalCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  modalConfirm: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PRIMARY,
  },
  modalDisabled: {
    opacity: 0.6,
  },
  modalCancelText: {
    color: "#555",
    fontWeight: "700",
  },
  modalConfirmText: {
    color: "#fff",
    fontWeight: "700",
  },
});
