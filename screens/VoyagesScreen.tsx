import { ListDepots } from "@/api/depots.api";
import { ListChauffeurs } from "@/api/users.api";
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
import { Colors } from "@/constants/theme";
import { useCloseBLStore } from "@/stores/close-bl.store";
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
  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["voyages", "list"],
      queryFn: ({ pageParam }) => listVoyage({ page: pageParam }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        const pagination = lastPage.pagination;
        if (!pagination || pagination.page >= pagination.totalPages) {
          return undefined;
        }
        return pagination.page + 1;
      },
    });
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
  const router = useRouter();
  const store = useCreateVoyageStore();
  const setCloseBLContext = useCloseBLStore((s) => s.setContext);
  const openCloseBLSheet = useCloseBLStore((s) => s.openSheet);
  const openAcheveConfirmSheet = useCloseBLStore((s) => s.openAcheveConfirm);
  const openDeleteConfirmSheet = useCloseBLStore((s) => s.openDeleteConfirm);
  const openMoreActionsSheet = useCloseBLStore((s) => s.openMoreActions);
  const confirmedVoyageAction = useCloseBLStore((s) => s.confirmedVoyageAction);
  const clearConfirmedVoyageAction = useCloseBLStore(
    (s) => s.clearConfirmedVoyageAction,
  );
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
      queryClient.invalidateQueries({ queryKey: ["voyages", "list"] });
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
      queryClient.invalidateQueries({ queryKey: ["voyages", "list"] });
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
      acheveVoyageMutate({
        statut: "terminer",
        id: confirmedVoyageAction.voyageId,
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
        console.log("BLs à ajouter au store :", blIds);
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

      openAcheveConfirmSheet(item.id, blsEncoursCount);
    },
    [openAcheveConfirmSheet],
  );

  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchText.trim());
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchText]);

  const listData = useMemo(() => {
    const flattenedData = data?.pages.flatMap((page) => page.data ?? []) ?? [];
    if (!debouncedSearch) return flattenedData;

    const q = debouncedSearch.toLowerCase();
    return flattenedData.filter(
      (v) =>
        v.bl_list?.some((bl) => bl.code?.toLowerCase().includes(q)) ||
        v.nomChauffeur?.toLowerCase().includes(q),
    );
  }, [data, debouncedSearch]);

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
              placeholder="Rechercher par N° voyage"
              placeholderTextColor="#bbb"
              value={searchText}
              onChangeText={setSearchText}
              clearButtonMode="while-editing"
            />
          </View>
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
