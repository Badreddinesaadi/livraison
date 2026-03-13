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
import { DetailRow } from "@/components/voyageCard";
import { Colors, PRIMARY, SUCCESS } from "@/constants/theme";
import { useSession } from "@/stores/auth.store";
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
  LayoutAnimation,
  Platform,
  Pressable,
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

const VoyageCard = ({
  item,
  onDelete,
  onUpdate,
  onOpenCloseBL,
  onAcheveVoyage,
}: {
  item: VoyageListItem;
  onDelete: () => void;
  onUpdate: () => void;
  onOpenCloseBL: () => void;
  onAcheveVoyage: () => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const { user } = useSession();
  const isAdminOrAdv = user?.role === "adv" || user?.role === "admin";
  // const isAdminOrAdv = false;
  const bls = item.bl_list;
  // opened bls count
  const blsEncoursCount = useMemo(() => {
    return bls?.filter((bl) => bl.statut === "Encours").length ?? 0;
  }, [bls]);
  const departDate = item.date_depart
    ? new Date(item.date_depart).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((v) => !v);
  };

  return (
    <Pressable
      onPress={toggle}
      style={{
        backgroundColor: "#fff",
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.07,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: "#efefef",
        overflow: "hidden",
      }}
    >
      {/* ── Header row ── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 14,
        }}
      >
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor:
              item.statut === "terminer" ? SUCCESS + "33" : PRIMARY + "33",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <FontAwesome5
            name="truck"
            size={16}
            color={item.statut === "terminer" ? SUCCESS : PRIMARY}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: "700", fontSize: 15, color: "#1a1a2e" }}>
            Voyage #{item.id}
          </Text>
          <Text style={{ fontSize: 13, color: "#666", marginTop: 2 }}>
            {item.nomChauffeur}
          </Text>
        </View>

        <View style={{ alignItems: "flex-end", marginRight: 10 }}>
          <Text style={{ fontSize: 12, color: "#aaa" }}>{departDate}</Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: PRIMARY,
                fontWeight: "600",
                marginTop: 2,
              }}
            >
              {blsEncoursCount !== 0 &&
                `${blsEncoursCount} ${blsEncoursCount > 1 ? "BLs" : "BL"} en cours`}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: SUCCESS,
                fontWeight: "600",
                marginTop: 2,
              }}
            >
              {bls?.length && bls?.length - blsEncoursCount !== 0
                ? bls?.length - blsEncoursCount
                : ""}{" "}
              {bls?.length && bls?.length - blsEncoursCount !== 0
                ? "Livré"
                : ""}
            </Text>
          </View>
        </View>

        <FontAwesome5
          name={expanded ? "chevron-up" : "chevron-down"}
          size={12}
          color="#bbb"
        />
      </View>

      {/* ── Expanded details ── */}
      {expanded && (
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: "#f2f2f2",
            paddingHorizontal: 14,
            paddingVertical: 12,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              marginBottom: 6,
            }}
          >
            <FontAwesome5
              name="file-alt"
              size={13}
              color={PRIMARY}
              style={{ width: 18, marginTop: 1 }}
            />
            <Text style={{ fontSize: 13, color: "#888", width: 96 }}>BLs</Text>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                flexWrap: "wrap",
                columnGap: 10,
                rowGap: 6,
              }}
            >
              {bls?.length ? (
                bls.map((bl) => {
                  const isDelivered = bl.statut === "Livré";
                  return (
                    <View
                      key={bl.id}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          color: isDelivered ? SUCCESS : "#222",
                          fontWeight: isDelivered ? "700" : "400",
                        }}
                      >
                        {bl.code}
                      </Text>
                      {isDelivered && (
                        <FontAwesome5
                          name="check-circle"
                          size={12}
                          color={SUCCESS}
                        />
                      )}
                    </View>
                  );
                })
              ) : (
                <Text style={{ fontSize: 13, color: "#222" }}>—</Text>
              )}
            </View>
          </View>
          <DetailRow
            icon="map-marker-alt"
            label="Dépôt départ"
            value={item.depot_nom || "—"}
          />
          <DetailRow
            icon="car"
            label="Véhicule"
            value={item.idVehicule ? String(item.idVehicule) : "—"}
          />
          <DetailRow
            icon="tachometer-alt"
            label="Km départ"
            value={item.km_depart ? `${item.km_depart} km` : "—"}
          />

          {/* Action buttons */}
          <View
            style={{
              flexDirection: "row",
              gap: 10,
              marginTop: 10,
              paddingTop: 10,
              borderTopWidth: 1,
              borderTopColor: "#f2f2f2",
            }}
          >
            {isAdminOrAdv && item.statut !== "terminer" && (
              <Pressable
                onPress={onUpdate}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 10,
                  borderRadius: 8,
                  backgroundColor: PRIMARY + "18",
                  gap: 6,
                }}
              >
                <FontAwesome5 name="edit" size={14} color={PRIMARY} />
                <Text
                  style={{ color: PRIMARY, fontWeight: "600", fontSize: 13 }}
                >
                  Modifier
                </Text>
              </Pressable>
            )}
            {item.statut !== "terminer" &&
              !isAdminOrAdv &&
              blsEncoursCount > 0 && (
                <Pressable
                  onPress={onOpenCloseBL}
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingVertical: 10,
                    borderRadius: 8,
                    backgroundColor: "#25f27079",
                    gap: 6,
                  }}
                >
                  <FontAwesome5
                    name={"check-circle"}
                    size={14}
                    color={"#0c5c2a"}
                  />
                  <Text
                    style={{
                      color: "#0c5c2a",
                      fontWeight: "600",
                      fontSize: 13,
                    }}
                  >
                    Clôturer BL
                  </Text>
                </Pressable>
              )}
            {isAdminOrAdv && item.statut !== "terminer" && (
              <Pressable
                onPress={onAcheveVoyage}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 10,
                  borderRadius: 8,
                  backgroundColor:
                    blsEncoursCount > 0 ? PRIMARY + "18" : "#25f27079",
                  gap: 6,
                }}
              >
                <FontAwesome5
                  name="check-circle"
                  size={14}
                  color={blsEncoursCount > 0 ? PRIMARY : "#0c5c2a"}
                />
                <Text
                  style={{
                    color: blsEncoursCount > 0 ? PRIMARY : "#0c5c2a",
                    fontWeight: "600",
                    fontSize: 13,
                  }}
                >
                  Achever
                </Text>
              </Pressable>
            )}
            {isAdminOrAdv && (
              <Pressable
                onPress={onDelete}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 10,
                  borderRadius: 8,
                  backgroundColor: "#ff4d4f18",
                  gap: 6,
                }}
              >
                <FontAwesome5 name="trash-alt" size={14} color="#ff4d4f" />
                <Text
                  style={{
                    color: "#ff4d4f",
                    fontWeight: "600",
                    fontSize: 13,
                  }}
                >
                  Supprimer
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      )}
    </Pressable>
  );
};

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
        status: "terminer",
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

  const handleUpdate = (item: VoyageListItem) => {
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
      const foundedDepot = depotsList?.find((d) => d.id === item.depot_depart);
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
  };

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
              onUpdate={() => handleUpdate(item)}
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
