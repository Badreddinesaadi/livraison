import { listPreparationsDevis } from "@/api/preparation-devis.api";
import { ListClients, ListCommerciaux } from "@/api/users.api";
import { ListVilles } from "@/api/villes.api";
import { PreparationDevisCard } from "@/components/PreparationDevisCard";
import Loader from "@/components/Loader";
import { hasPreparationDevisPermission } from "@/constants/permissions";
import { Colors } from "@/constants/theme";
import { useSession } from "@/stores/auth.store";
import {
  DevisFilterItem,
  DevisFilterKey,
  usePreparationDevisSheetStore,
} from "@/stores/preparation-devis.store";
import { FontAwesome5 } from "@expo/vector-icons";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";

const DEVIS_STATUTS = ["encours", "valider", "refuser", "livrer", "livrer part."];

export const PreparationDevisScreen = () => {
  const router = useRouter();
  const { user } = useSession();
  const canList = hasPreparationDevisPermission(user, "LIST");

  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filters = usePreparationDevisSheetStore((s) => s.filters);
  const setFilters = usePreparationDevisSheetStore((s) => s.setFilters);
  const resetFilters = usePreparationDevisSheetStore((s) => s.resetFilters);
  const openFiltersSheet = usePreparationDevisSheetStore(
    (s) => s.openFiltersSheet,
  );
  const openFilterOptionsSheet = usePreparationDevisSheetStore(
    (s) => s.openFilterOptionsSheet,
  );
  const openDateRangeSheet = usePreparationDevisSheetStore(
    (s) => s.openDateRangeSheet,
  );
  const closeSheet = usePreparationDevisSheetStore((s) => s.closeSheet);

  const { data: clientsList } = useQuery({
    queryKey: ["clients", "full-list"],
    queryFn: ListClients,
    enabled: canList,
  });
  const { data: villesList } = useQuery({
    queryKey: ["villes", "full-list"],
    queryFn: ListVilles,
    enabled: canList,
  });
  const { data: commerciauxList } = useQuery({
    queryKey: ["commerciaux", "full-list"],
    queryFn: ListCommerciaux,
    enabled: canList,
  });

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchText.trim());
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchText]);

  const filtersCount = useMemo(
    () =>
      Object.values(filters).filter(
        (value) => value !== undefined && value !== null && value !== "",
      ).length,
    [filters],
  );

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["preparation-devis", "list", debouncedSearch, filters],
      queryFn: ({ pageParam }) =>
        listPreparationsDevis({
          page: pageParam,
          document: debouncedSearch || undefined,
          ...filters,
        }),
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

  const listData = useMemo(
    () => data?.pages.flatMap((page) => page.data ?? []) ?? [],
    [data],
  );

  const clientLabel = useMemo(
    () =>
      filters.clientId
        ? clientsList?.find((c) => c.id === filters.clientId)?.societe
        : undefined,
    [clientsList, filters.clientId],
  );
  const villeLabel = useMemo(
    () =>
      filters.villeId
        ? villesList?.find((v) => v.id === filters.villeId)?.designation
        : undefined,
    [villesList, filters.villeId],
  );
  const commercialLabel = useMemo(
    () =>
      filters.commercialId
        ? commerciauxList?.find((c) => c.id === filters.commercialId)?.name
        : undefined,
    [commerciauxList, filters.commercialId],
  );
  const dateLabel = useMemo(
    () =>
      filters.dateFrom || filters.dateTo
        ? `${filters.dateFrom || "…"} → ${filters.dateTo || "…"}`
        : undefined,
    [filters.dateFrom, filters.dateTo],
  );

  const handleSelectFilterItem = (key: DevisFilterKey) => {
    if (key === "client") {
      openFilterOptionsSheet({
        title: "Filtrer par client",
        options: [
          { id: -1, label: "Tous les clients" },
          ...(clientsList ?? []).map((c) => ({
            id: c.id,
            label: c.societe,
            subLabel: c.ville,
          })),
        ],
        selectedId: filters.clientId ?? -1,
        enableSearch: true,
        searchPlaceholder: "Rechercher un client...",
        onSelect: (id) =>
          setFilters({ clientId: id === -1 ? undefined : id }),
      });
      return;
    }

    if (key === "ville") {
      openFilterOptionsSheet({
        title: "Filtrer par ville",
        options: [
          { id: -1, label: "Toutes les villes" },
          ...(villesList ?? []).map((v) => ({
            id: v.id,
            label: v.designation,
          })),
        ],
        selectedId: filters.villeId ?? -1,
        enableSearch: true,
        searchPlaceholder: "Rechercher une ville...",
        onSelect: (id) => setFilters({ villeId: id === -1 ? undefined : id }),
      });
      return;
    }

    if (key === "commercial") {
      openFilterOptionsSheet({
        title: "Filtrer par commercial",
        options: [
          { id: -1, label: "Tous les commerciaux" },
          ...(commerciauxList ?? []).map((c) => ({
            id: c.id,
            label: c.name,
          })),
        ],
        selectedId: filters.commercialId ?? -1,
        enableSearch: true,
        searchPlaceholder: "Rechercher un commercial...",
        onSelect: (id) =>
          setFilters({ commercialId: id === -1 ? undefined : id }),
      });
      return;
    }

    if (key === "statut") {
      const selectedIndex = filters.statut
        ? DEVIS_STATUTS.indexOf(filters.statut)
        : -1;
      openFilterOptionsSheet({
        title: "Filtrer par statut",
        options: [
          { id: -1, label: "Tous les statuts" },
          ...DEVIS_STATUTS.map((s, index) => ({ id: index, label: s })),
        ],
        selectedId: selectedIndex,
        onSelect: (id) =>
          setFilters({ statut: id === -1 ? undefined : DEVIS_STATUTS[id] }),
      });
      return;
    }

    openDateRangeSheet({
      from: filters.dateFrom,
      to: filters.dateTo,
      onApply: (from, to) => setFilters({ dateFrom: from, dateTo: to }),
    });
  };

  const handleOpenFiltersSheet = () => {
    const items: DevisFilterItem[] = [
      { key: "client", label: "Client", valueLabel: clientLabel },
      { key: "ville", label: "Ville", valueLabel: villeLabel },
      { key: "commercial", label: "Commercial", valueLabel: commercialLabel },
      { key: "statut", label: "Statut", valueLabel: filters.statut },
      { key: "date", label: "Période", valueLabel: dateLabel },
    ];

    openFiltersSheet({
      title: "Filtrer les devis",
      items,
      onSelectItem: handleSelectFilterItem,
      onReset: () => {
        resetFilters();
        closeSheet();
      },
    });
  };

  if (!canList) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 20,
          backgroundColor: "#f7f8fa",
        }}
      >
        <FontAwesome5 name="lock" size={34} color="#bbb" />
        <Text
          style={{
            marginTop: 12,
            color: "#666",
            fontSize: 14,
            textAlign: "center",
          }}
        >
          Vous n'avez pas la permission d'accéder au module Préparation devis.
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 14,
        marginTop: 4,
        backgroundColor: "#f7f8fa",
      }}
    >
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 4,
            columnGap: 8,
            marginBottom: 12,
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#fff",
              borderColor: "#e8e8e8",
              borderWidth: 1,
              borderRadius: 10,
              paddingHorizontal: 12,
            }}
          >
            <FontAwesome5 name="search" size={14} color="#bbb" />
            <TextInput
              style={{
                flex: 1,
                height: 46,
                paddingHorizontal: 10,
                fontSize: 14,
                color: "#222",
              }}
              placeholder="Rechercher par document..."
              placeholderTextColor="#bbb"
              value={searchText}
              onChangeText={setSearchText}
              clearButtonMode="while-editing"
            />
          </View>

          <Pressable
            onPress={handleOpenFiltersSheet}
            style={{
              width: 46,
              height: 46,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: filtersCount > 0 ? Colors.light.primary : "#e8e8e8",
              backgroundColor: "#fff",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FontAwesome5
              name="filter"
              size={18}
              color={filtersCount > 0 ? Colors.light.primary : "#222"}
            />
            {filtersCount > 0 && (
              <View
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  minWidth: 16,
                  height: 16,
                  borderRadius: 8,
                  paddingHorizontal: 3,
                  backgroundColor: Colors.light.primary,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}
                >
                  {filtersCount}
                </Text>
              </View>
            )}
          </Pressable>
        </View>

        <Text style={{ fontSize: 13, color: "#aaa", marginBottom: 8 }}>
          {listData.length} devis
        </Text>

        <FlatList
          data={listData}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <PreparationDevisCard
              item={item}
              onViewDetails={() => {
                router.navigate({
                  pathname:
                    "/(app)/(drawer)/(stack)/preparation-devis/details/[devisId]",
                  params: { devisId: String(item.id) },
                });
              }}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
          onEndReachedThreshold={0.3}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          ListFooterComponent={isFetchingNextPage ? <Loader /> : null}
          ListEmptyComponent={
            isLoading ? (
              <Loader />
            ) : (
              <View style={{ alignItems: "center", marginTop: 60 }}>
                <FontAwesome5 name="file-invoice" size={40} color="#ddd" />
                <Text style={{ color: "#ccc", marginTop: 14, fontSize: 14 }}>
                  Aucun devis trouvé
                </Text>
              </View>
            )
          }
        />
      </View>
    </View>
  );
};
