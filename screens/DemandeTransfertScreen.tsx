import { listDemandeTransfert } from "@/api/demande-transfert.api";
import { DemandeTransfertCard } from "@/components/DemandeTransfertCard";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { hasDemandeTransfertPermission } from "@/constants/permissions";
import { Colors } from "@/constants/theme";
import { useSession } from "@/stores/auth.store";
import { FontAwesome5 } from "@expo/vector-icons";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";

export const DemandeTransfertScreen = () => {
  const router = useRouter();
  const { user } = useSession();
  const canList = hasDemandeTransfertPermission(user, "LIST");
  const canCreate = hasDemandeTransfertPermission(user, "CREATE");

  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchText.trim().toLowerCase());
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchText]);

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["demande-transferts", "list", debouncedSearch],
      queryFn: ({ pageParam }) =>
        listDemandeTransfert({
          page: pageParam,
          searchquery: debouncedSearch || undefined,
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

  if (!canList) {
    return (
      <View style={styles.lockScreen}>
        <FontAwesome5 name="lock" size={34} color="#bbb" />
        <Text style={styles.lockText}>
          Vous n'avez pas la permission d'acceder au module Demande de
          transfert.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.flex}>
        <View style={styles.searchRow}>
          <View style={styles.searchInputWrap}>
            <FontAwesome5 name="search" size={14} color="#bbb" />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher..."
              placeholderTextColor="#bbb"
              value={searchText}
              onChangeText={setSearchText}
              clearButtonMode="while-editing"
            />
          </View>

          {canCreate && (
            <View>
              <Button
                preset="filled"
                LeftAccessory={() => (
                  <FontAwesome5
                    name="plus"
                    size={22}
                    color={Colors.light.background}
                  />
                )}
                size="md"
                onPress={() => {
                  router.navigate(
                    "/(app)/(drawer)/(stack)/demande-transferts/create",
                  );
                }}
              />
            </View>
          )}
        </View>

        <Text style={styles.resultCount}>
          {listData.length} demande{listData.length !== 1 ? "s" : ""}
        </Text>

        <FlatList
          data={listData}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <DemandeTransfertCard
              item={item}
              onViewDetails={() => {
                router.navigate({
                  pathname:
                    "/(app)/(drawer)/(stack)/demande-transferts/details/[demandeTransfertId]",
                  params: { demandeTransfertId: String(item.id) },
                });
              }}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
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
              <View style={styles.emptyState}>
                <FontAwesome5 name="exchange-alt" size={40} color="#ddd" />
                <Text style={styles.emptyText}>
                  Aucune demande trouvee
                </Text>
              </View>
            )
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  screen: {
    flex: 1,
    paddingHorizontal: 14,
    marginTop: 4,
    backgroundColor: "#f7f8fa",
  },
  flex: {
    flex: 1,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    columnGap: 8,
    marginBottom: 12,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: "#e8e8e8",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    height: 46,
    paddingHorizontal: 10,
    fontSize: 14,
    color: "#222",
  },
  resultCount: {
    fontSize: 13,
    color: "#aaa",
    marginBottom: 8,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  emptyState: {
    alignItems: "center",
    marginTop: 60,
  },
  emptyText: {
    color: "#ccc",
    marginTop: 14,
    fontSize: 14,
  },
});
