import { deleteReturn, listReturn, ValidateReturn } from "@/api/return.api";
import { ListChauffeurs, ListClients } from "@/api/users.api";
import Loader from "@/components/Loader";
import { ReturnCard } from "@/components/ReturnCard";
import { Button } from "@/components/ui/button";
import { hasRetourPermission } from "@/constants/permissions";
import { Colors, PRIMARY } from "@/constants/theme";
import { useSession } from "@/stores/auth.store";
import { useCloseBLStore, VoyageFilterItem } from "@/stores/close-bl.store";
import { FontAwesome5 } from "@expo/vector-icons";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Text, TextInput, View } from "react-native";
import Toast from "react-native-toast-message";

export const ReturnsScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const canListReturns = hasRetourPermission(user, "LIST");
  const canCreateReturn = hasRetourPermission(user, "CREATE");
  const canUpdateReturn = hasRetourPermission(user, "UPDATE");
  const canDeleteReturn = hasRetourPermission(user, "DELETE");
  const canManageReturns = canUpdateReturn || canDeleteReturn;
  const { data: chauffersList } = useQuery({
    queryKey: ["chauffeurs", "full-list"],
    queryFn: ListChauffeurs,
    enabled: canListReturns,
  });
  const { data: clientsList } = useQuery({
    queryKey: ["clients", "full-list"],
    queryFn: ListClients,
    enabled: canListReturns,
  });
  const openSelectorOptionsSheet = useCloseBLStore(
    (s) => s.openSelectorOptions,
  );
  const openVoyageFiltersSheet = useCloseBLStore((s) => s.openVoyageFilters);
  const closeBottomSheet = useCloseBLStore((s) => s.closeSheet);
  const openReturnValidateConfirm = useCloseBLStore(
    (s) => s.openReturnValidateConfirm,
  );
  const openReturnDeleteConfirm = useCloseBLStore(
    (s) => s.openReturnDeleteConfirm,
  );
  const finishReturnAction = useCloseBLStore((s) => s.finishReturnAction);
  const finishReturnDelete = useCloseBLStore((s) => s.finishReturnDelete);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedChauffeurId, setSelectedChauffeurId] = useState<
    number | undefined
  >(undefined);
  const [selectedClientId, setSelectedClientId] = useState<number | undefined>(
    undefined,
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filtersCount = useMemo(() => {
    return (selectedChauffeurId ? 1 : 0) + (selectedClientId ? 1 : 0);
  }, [selectedChauffeurId, selectedClientId]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchText.trim().toLowerCase());
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchText]);

  const { mutate: deleteReturnMutate, isPending: isDeleting } = useMutation({
    mutationFn: deleteReturn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["returns"] });
      Toast.show({
        type: "success",
        text1: "Retour supprimé",
        text2: "Le retour a été supprimé avec succès.",
      });
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Suppression impossible",
        text2: error.message || "Impossible de supprimer ce retour.",
      });
    },
    onSettled: finishReturnDelete,
  });

  const { mutate: validateReturnMutate, isPending: isValidatingReturn } =
    useMutation({
      mutationFn: ValidateReturn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["returns"] });
        Toast.show({
          type: "success",
          text1: "Retour mis à jour",
          text2: "Le statut du retour a été mis à jour.",
        });
      },
      onError: (error) => {
        Toast.show({
          type: "error",
          text1: "Validation impossible",
          text2: error.message || "Impossible de valider ce retour.",
        });
      },
      onSettled: finishReturnAction,
    });

  const openMoreOptions = useCallback(
    (item: { id: string; statut: string }) => {
      if (!canManageReturns) {
        Toast.show({
          type: "error",
          text1: "Permission refusée",
          text2: "Vous n'avez pas la permission de modifier ce retour.",
        });
        return;
      }

      const parsedId = Number(item.id);
      if (!Number.isFinite(parsedId)) {
        Toast.show({
          type: "error",
          text1: "Retour invalide",
          text2: "Impossible de traiter cette action.",
        });
        return;
      }

      const options: { id: number; label: string; type?: "highlight" }[] = [];
      const canValidate =
        canUpdateReturn &&
        item.statut !== "terminer" &&
        item.statut !== "refuser";

      if (canValidate) {
        options.unshift({
          id: 2,
          label: "Traiter le retour",
          type: "highlight",
        });
      }

      if (canDeleteReturn) {
        options.push({ id: 1, label: "Supprimer le retour" });
      }

      if (options.length === 0) {
        Toast.show({
          type: "info",
          text1: "Aucune action",
          text2: "Aucune action n'est disponible pour ce retour.",
        });
        return;
      }

      openSelectorOptionsSheet({
        title: "Actions disponibles",
        options,
        onSelect: (id) => {
          if (id === 2 && !isValidatingReturn) {
            openReturnValidateConfirm(parsedId, (targetId, payload) => {
              validateReturnMutate({
                id: String(targetId),
                statut: payload.statut,
                commentaire: payload.commentaire,
              });
            });
            return;
          }

          if (id === 1 && canDeleteReturn && !isDeleting) {
            openReturnDeleteConfirm(parsedId, (targetId) => {
              deleteReturnMutate(targetId);
            });
          }
        },
      });
    },
    [
      canManageReturns,
      canUpdateReturn,
      canDeleteReturn,
      openSelectorOptionsSheet,
      isValidatingReturn,
      openReturnValidateConfirm,
      validateReturnMutate,
      isDeleting,
      openReturnDeleteConfirm,
      deleteReturnMutate,
    ],
  );

  const selectedChauffeurLabel = useMemo(() => {
    return (
      chauffersList?.find((chauffeur) => chauffeur.id === selectedChauffeurId)
        ?.name ?? "Tous"
    );
  }, [chauffersList, selectedChauffeurId]);

  const selectedClientLabel = useMemo(() => {
    return (
      clientsList?.find((client) => client.id === selectedClientId)?.societe ??
      "Tous"
    );
  }, [clientsList, selectedClientId]);

  const handleOpenFilterSelector = useCallback(
    (key: "chauffeur" | "client") => {
      if (key === "chauffeur") {
        openSelectorOptionsSheet({
          title: "Filtrer par chauffeur",
          options: [
            { id: 0, label: "Tous" },
            ...(chauffersList ?? []).map((item) => ({
              id: item.id,
              label: item.name,
            })),
          ],
          selectedId: selectedChauffeurId ?? 0,
          onSelect: (id) => {
            setSelectedChauffeurId(id === 0 ? undefined : id);
          },
        });
        return;
      }

      openSelectorOptionsSheet({
        title: "Filtrer par client",
        options: [
          { id: 0, label: "Tous" },
          ...(clientsList ?? []).map((item) => ({
            id: item.id,
            label: item.societe,
            subLabel: item.ville,
          })),
        ],
        selectedId: selectedClientId ?? 0,
        enableSearch: true,
        searchPlaceholder: "Rechercher un client par société",
        onSelect: (id) => {
          setSelectedClientId(id === 0 ? undefined : id);
        },
      });
    },
    [
      openSelectorOptionsSheet,
      chauffersList,
      selectedChauffeurId,
      clientsList,
      selectedClientId,
    ],
  );

  const handleOpenFiltersSheet = useCallback(() => {
    const items: VoyageFilterItem[] = [
      {
        key: "chauffeur",
        label: "Chauffeur",
        valueLabel: selectedChauffeurLabel,
      },
      {
        key: "client",
        label: "Client",
        valueLabel: selectedClientLabel,
      },
    ];

    if (!canManageReturns) {
      items.splice(0, 1);
    }

    openVoyageFiltersSheet({
      title: "Filtrer les retours",
      items,
      onPressItem: (key) => {
        if (key === "chauffeur" || key === "client") {
          handleOpenFilterSelector(key);
        }
      },
      onReset: () => {
        setSelectedChauffeurId(undefined);
        setSelectedClientId(undefined);
        closeBottomSheet();
      },
    });
  }, [
    selectedChauffeurLabel,
    selectedClientLabel,
    canManageReturns,
    openVoyageFiltersSheet,
    handleOpenFilterSelector,
    closeBottomSheet,
  ]);

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: [
        "returns",
        "list",
        {
          chauffeur_id: selectedChauffeurId,
          client_id: selectedClientId,
        },
      ],
      queryFn: ({ pageParam }) =>
        listReturn({
          page: pageParam,
          chauffeur_id: selectedChauffeurId,
          client_id: selectedClientId,
        }),
      enabled: canListReturns,
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        const pagination = lastPage.pagination;
        if (!pagination || pagination.page >= pagination.totalPages) {
          return undefined;
        }

        return pagination.page + 1;
      },
    });

  const listData = useMemo(() => {
    const allItems = data?.pages.flatMap((page) => page.data ?? []) ?? [];

    if (!debouncedSearch) {
      return allItems;
    }

    return allItems.filter((item) => {
      const searchIn = [
        String(item.id),
        item.client,
        item.retour_Mse,
        item.reclamation,
        item.statut,
        item.Bl_cachetet,
        item.reglement,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchIn.includes(debouncedSearch);
    });
  }, [data, debouncedSearch]);

  if (!canListReturns) {
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
          Vous n'avez pas la permission d'accéder au module Retour.
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
              placeholder="Rechercher un retour..."
              placeholderTextColor="#bbb"
              value={searchText}
              onChangeText={setSearchText}
              clearButtonMode="while-editing"
            />
          </View>
          <Button
            preset="ghost"
            LeftAccessory={() => (
              <View>
                {filtersCount > 0 && (
                  <View
                    style={{
                      backgroundColor: PRIMARY,
                      width: 15,
                      height: 15,
                      borderRadius: 10,
                      position: "absolute",
                      top: -5,
                      right: -5,
                      justifyContent: "center",
                      alignItems: "center",
                      zIndex: 1,
                    }}
                  >
                    <Text style={{ color: "#fff", fontSize: 12 }}>
                      {filtersCount}
                    </Text>
                  </View>
                )}
                <FontAwesome5 name="filter" size={20} color="#222" />
              </View>
            )}
            size="md"
            onPress={handleOpenFiltersSheet}
          />
          {canCreateReturn && (
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
                  router.navigate("/(app)/(drawer)/(stack)/returns/create");
                }}
              />
            </View>
          )}
        </View>

        <Text style={{ fontSize: 13, color: "#aaa", marginBottom: 8 }}>
          {listData.length} retour{listData.length !== 1 ? "s" : ""}
        </Text>

        <FlatList
          data={listData}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <ReturnCard
              item={item}
              canManageReturn={canManageReturns}
              onShowDetails={() => {
                router.navigate({
                  pathname: "/returns/details/[returnId]",
                  params: { returnId: String(item.id) },
                });
              }}
              onMore={() =>
                openMoreOptions({ id: String(item.id), statut: item.statut })
              }
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
                <FontAwesome5 name="undo-alt" size={40} color="#ddd" />
                <Text style={{ color: "#ccc", marginTop: 14, fontSize: 14 }}>
                  Aucun retour trouvé
                </Text>
              </View>
            )
          }
        />
      </View>
    </View>
  );
};
