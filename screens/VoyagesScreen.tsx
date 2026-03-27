import { ListDepots } from "@/api/depots.api";
import { ListChauffeurs, ListClients } from "@/api/users.api";
import { ListVehicles } from "@/api/vehicle.api";
import {
  changeVoyageStatus,
  deleteVoyage,
  listVoyage,
  VoyageListItem,
} from "@/api/voyage.api";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { VoyageCard } from "@/components/voyageCard";
import { Colors, PRIMARY } from "@/constants/theme";
import { useSession } from "@/stores/auth.store";
import { useCloseBLStore, VoyageFilterItem } from "@/stores/close-bl.store";
import { useCreateVoyageStore } from "@/stores/voyage.store";
import { BL } from "@/types/bl.types";
import { FontAwesome5 } from "@expo/vector-icons";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Platform,
  Text,
  TextInput,
  UIManager,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const VoyagesScreen = () => {
  const { user } = useSession();
  const { data: chauffersList } = useQuery({
    queryKey: ["chauffeurs", "full-list"],
    queryFn: ListChauffeurs,
  });
  const { data: vehiclesList } = useQuery({
    queryKey: ["vehicles", "full-list"],
    queryFn: ListVehicles,
  });
  const { data: depotsList } = useQuery({
    queryKey: ["depots", "full-list"],
    queryFn: ListDepots,
  });
  const { data: clientsList } = useQuery({
    queryKey: ["clients", "full-list"],
    queryFn: ListClients,
  });
  const router = useRouter();
  const store = useCreateVoyageStore();
  const setCloseBLContext = useCloseBLStore((s) => s.setContext);
  const openCloseBLSheet = useCloseBLStore((s) => s.openSheet);
  const openAcheveConfirmSheet = useCloseBLStore((s) => s.openAcheveConfirm);
  const openDeleteConfirmSheet = useCloseBLStore((s) => s.openDeleteConfirm);
  const openMoreActionsSheet = useCloseBLStore((s) => s.openMoreActions);
  const openSelectorOptionsSheet = useCloseBLStore(
    (s) => s.openSelectorOptions,
  );
  const openVoyageFiltersSheet = useCloseBLStore((s) => s.openVoyageFilters);
  const closeBottomSheet = useCloseBLStore((s) => s.closeSheet);
  const confirmedVoyageAction = useCloseBLStore((s) => s.confirmedVoyageAction);
  const clearConfirmedVoyageAction = useCloseBLStore(
    (s) => s.clearConfirmedVoyageAction,
  );
  const isAdminOrAdv = user?.role === "adv" || user?.role === "admin";

  const finishVoyageAction = useCloseBLStore((s) => s.finishVoyageAction);
  const queryClient = useQueryClient();

  const finishVoyageActionIfPending = useCallback(() => {
    if (useCloseBLStore.getState().isVoyageActionPending) {
      finishVoyageAction();
    }
  }, [finishVoyageAction]);

  const { mutate: deleteMutate } = useMutation({
    mutationFn: deleteVoyage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voyages"] });
      queryClient.invalidateQueries({ queryKey: ["bls"] });
      Toast.show({
        type: "success",
        text1: "Voyage supprimé",
        text2: "Le voyage a été supprimé avec succès.",
      });
    },
    onSettled: finishVoyageActionIfPending,
  });
  const { mutate: acheveVoyageMutate } = useMutation({
    mutationFn: changeVoyageStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voyages"] });
      queryClient.invalidateQueries({ queryKey: ["bls"] });
      Toast.show({
        type: "success",
        text1: "Voyage achevé",
        text2: "Le voyage a été achevé avec succès.",
      });
    },
    onSettled: finishVoyageActionIfPending,
  });

  useEffect(() => {
    if (!confirmedVoyageAction) {
      return;
    }

    if (confirmedVoyageAction.action === "achever") {
      if (
        typeof confirmedVoyageAction.kmRetour !== "number" ||
        !confirmedVoyageAction.dateRetour
      ) {
        finishVoyageActionIfPending();
        clearConfirmedVoyageAction();
        return;
      }

      acheveVoyageMutate({
        statut: "terminer",
        id: confirmedVoyageAction.voyageId,
        km_retour: confirmedVoyageAction.kmRetour,
        date_retour: confirmedVoyageAction.dateRetour,
      });
    }

    if (confirmedVoyageAction.action === "supprimer") {
      deleteMutate(confirmedVoyageAction.voyageId);
    }

    clearConfirmedVoyageAction();
  }, [
    confirmedVoyageAction,
    acheveVoyageMutate,
    deleteMutate,
    clearConfirmedVoyageAction,
    finishVoyageActionIfPending,
  ]);

  const handleDelete = (idVoyage: number) => {
    openDeleteConfirmSheet(idVoyage);
  };

  const handleUpdate = useCallback(
    (item: VoyageListItem) => {
      store.resetAll();
      store.setIdVoyage(item.id);

      if (item.idChauffeur) {
        const foundedChauffeur = chauffersList?.find(
          (c) => c.id === item.idChauffeur,
        );
        if (foundedChauffeur) {
          store.setSelectedChauffeur(foundedChauffeur);
        }
      }

      if (item.bl_list) {
        const blIds: BL[] = item.bl_list.map((bl) => ({
          id: bl.id,
          num_bl: bl.code,
          datetime_document: bl.datetime_document,
          nomClient: bl.nomClient,
        }));
        store.setBls(blIds);
      }

      if (item.idVehicule !== null) {
        const foundedVehicle = vehiclesList?.find(
          (v) => v.id === item.idVehicule,
        );

        if (foundedVehicle) {
          store.setSelectedVehicle(foundedVehicle);
        }
      }

      if (item.depot_depart) {
        const foundedDepot = depotsList?.find(
          (d) => d.id === item.depot_depart,
        );
        if (foundedDepot) {
          store.setSelectedDepot(foundedDepot);
        }
      }
      if (item.km_depart) {
        store.setKmDepart(item.km_depart);
      }
      if (item.date_depart) {
        store.setDateDepart(new Date(item.date_depart));
      }

      store.setType("update");
      router.navigate("/voyages/create/chauffeur");
    },
    [store, chauffersList, vehiclesList, depotsList, router],
  );

  const handleOpenCloseBLSheet = useCallback(
    (item: VoyageListItem) => {
      // only send opened bls
      setCloseBLContext(
        item.id,
        item.bl_list.filter((bl) => bl.statut === "Encours") ?? [],
      );
      openCloseBLSheet();
    },
    [setCloseBLContext, openCloseBLSheet],
  );

  const handleAchevingVoyage = useCallback(
    (item: VoyageListItem) => {
      const blsEncoursCount =
        item.bl_list?.filter((bl) => bl.statut === "Encours").length ?? 0;

      openAcheveConfirmSheet(
        item.id,
        blsEncoursCount,
        item.km_depart,
        item.date_depart,
      );
    },
    [openAcheveConfirmSheet],
  );

  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedChauffeurId, setSelectedChauffeurId] = useState<
    number | undefined
  >(undefined);
  const [selectedVehiculeId, setSelectedVehiculeId] = useState<
    number | undefined
  >(undefined);
  const [selectedDepotId, setSelectedDepotId] = useState<number | undefined>(
    undefined,
  );
  const [selectedClientId, setSelectedClientId] = useState<number | undefined>(
    undefined,
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filtersCount = useMemo(() => {
    return (
      (selectedChauffeurId ? 1 : 0) +
      (selectedVehiculeId ? 1 : 0) +
      (selectedDepotId ? 1 : 0) +
      (selectedClientId ? 1 : 0)
    );
  }, [
    selectedChauffeurId,
    selectedVehiculeId,
    selectedDepotId,
    selectedClientId,
  ]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchText.trim());
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchText]);

  const selectedChauffeurLabel = useMemo(() => {
    return (
      chauffersList?.find((chauffeur) => chauffeur.id === selectedChauffeurId)
        ?.name ?? "Tous"
    );
  }, [chauffersList, selectedChauffeurId]);

  const selectedVehiculeLabel = useMemo(() => {
    const vehicle = vehiclesList?.find((v) => v.id === selectedVehiculeId);
    if (!vehicle) return "Tous";

    return [vehicle.vehiculeMarque, vehicle.immatriculation]
      .filter(Boolean)
      .join(" - ");
  }, [vehiclesList, selectedVehiculeId]);

  const selectedDepotLabel = useMemo(() => {
    return (
      depotsList?.find((depot) => depot.id === selectedDepotId)?.nom ?? "Tous"
    );
  }, [depotsList, selectedDepotId]);

  const selectedClientLabel = useMemo(() => {
    return (
      clientsList?.find((client) => client.id === selectedClientId)?.societe ??
      "Tous"
    );
  }, [clientsList, selectedClientId]);

  const handleOpenFilterSelector = useCallback(
    (key: "chauffeur" | "vehicule" | "depot" | "client") => {
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

      if (key === "vehicule") {
        openSelectorOptionsSheet({
          title: "Filtrer par véhicule",
          options: [
            { id: 0, label: "Tous" },
            ...(vehiclesList ?? []).map((item) => ({
              id: item.id,
              label: item.vehiculeMarque || item.immatriculation,
              subLabel: item.immatriculation,
            })),
          ],
          selectedId: selectedVehiculeId ?? 0,
          onSelect: (id) => {
            setSelectedVehiculeId(id === 0 ? undefined : id);
          },
        });
        return;
      }

      if (key === "client") {
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
        return;
      }

      openSelectorOptionsSheet({
        title: "Filtrer par dépôt",
        options: [
          { id: 0, label: "Tous" },
          ...(depotsList ?? []).map((item) => ({
            id: item.id,
            label: item.nom,
            subLabel: item.code,
          })),
        ],
        selectedId: selectedDepotId ?? 0,
        onSelect: (id) => {
          setSelectedDepotId(id === 0 ? undefined : id);
        },
      });
    },
    [
      openSelectorOptionsSheet,
      chauffersList,
      selectedChauffeurId,
      vehiclesList,
      selectedVehiculeId,
      clientsList,
      selectedClientId,
      depotsList,
      selectedDepotId,
    ],
  );

  const handleOpenFiltersSheet = useCallback(() => {
    const isAdminOrAdvisory = user?.role === "admin" || user?.role === "adv";
    const items: VoyageFilterItem[] = [
      {
        key: "chauffeur",
        label: "Chauffeur",
        valueLabel: selectedChauffeurLabel,
      },
      {
        key: "vehicule",
        label: "Véhicule",
        valueLabel: selectedVehiculeLabel,
      },
      {
        key: "depot",
        label: "Dépôt",
        valueLabel: selectedDepotLabel,
      },
      {
        key: "client",
        label: "Client",
        valueLabel: selectedClientLabel,
      },
    ];
    if (!isAdminOrAdvisory) {
      items.splice(0, 1); // remove chauffeur filter for non admin/adv users
    }
    openVoyageFiltersSheet({
      title: "Filtrer les voyages",
      items,
      onPressItem: handleOpenFilterSelector,
      onReset: () => {
        setSelectedChauffeurId(undefined);
        setSelectedVehiculeId(undefined);
        setSelectedDepotId(undefined);
        setSelectedClientId(undefined);
        closeBottomSheet();
      },
    });
  }, [
    openVoyageFiltersSheet,
    selectedChauffeurLabel,
    selectedVehiculeLabel,
    selectedDepotLabel,
    selectedClientLabel,
    handleOpenFilterSelector,
    closeBottomSheet,
    user?.role,
  ]);

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: [
        "voyages",
        "list",
        {
          codeQuery: debouncedSearch || undefined,
          idChauffeur: selectedChauffeurId,
          idVehicule: selectedVehiculeId,
          idDepot: selectedDepotId,
          idClient: selectedClientId,
        },
      ],
      queryFn: ({ pageParam }) =>
        listVoyage({
          page: pageParam,
          codeQuery: debouncedSearch || undefined,
          idChauffeur: selectedChauffeurId,
          idVehicule: selectedVehiculeId,
          idDepot: selectedDepotId,
          idClient: selectedClientId,
        }),
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
    return data?.pages.flatMap((page) => page.data ?? []) ?? [];
  }, [data]);

  const handleMoreAction = useCallback(
    (action: "modifier" | "details", voyageId: number) => {
      if (action === "details") {
        router.navigate({
          pathname: "/voyages/details/[voyageId]",
          params: { voyageId: String(voyageId) },
        });
        return;
      }

      const selectedVoyage = listData.find((voyage) => voyage.id === voyageId);

      if (selectedVoyage) {
        handleUpdate(selectedVoyage);
      } else {
        Toast.show({
          type: "error",
          text1: "Voyage introuvable",
          text2: "Impossible d’ouvrir la modification pour ce voyage.",
        });
      }
    },
    [listData, router, handleUpdate],
  );

  const handleOpenMoreSheet = useCallback(
    (item: VoyageListItem) => {
      openMoreActionsSheet(item.id, handleMoreAction);
    },
    [openMoreActionsSheet, handleMoreAction],
  );

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
        {/* Search bar */}
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
              placeholder="Rechercher..."
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
          {isAdminOrAdv && (
            <View>
              <Button
                preset="filled"
                LeftAccessory={() => (
                  <FontAwesome5
                    name="plus"
                    size={24}
                    color={Colors.light.background}
                  />
                )}
                size="md"
                onPress={() => {
                  store.resetAll();
                  store.setType("create");
                  router.navigate("/voyages/create/chauffeur");
                }}
              />
            </View>
          )}
        </View>

        {/* Result count */}
        <Text style={{ fontSize: 13, color: "#aaa", marginBottom: 8 }}>
          {listData.length} voyage{listData.length !== 1 ? "s" : ""}
        </Text>

        <FlatList
          data={listData}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <VoyageCard
              item={item}
              onDelete={() => handleDelete(item.id)}
              onMore={() => handleOpenMoreSheet(item)}
              onOpenCloseBL={() => handleOpenCloseBLSheet(item)}
              onAcheveVoyage={() => handleAchevingVoyage(item)}
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
                <FontAwesome5 name="truck" size={40} color="#ddd" />
                <Text style={{ color: "#ccc", marginTop: 14, fontSize: 14 }}>
                  Aucun voyage trouvé
                </Text>
              </View>
            )
          }
        />
      </View>
    </View>
  );
};
