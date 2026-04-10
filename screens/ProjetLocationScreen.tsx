import {
  deleteProjetLocation,
  listProjetLocation,
  Projet,
  ProjetLocation,
} from "@/api/projet-location.api";
import Loader from "@/components/Loader";
import { ProjetLocationCard } from "@/components/ProjetLocationCard";
import { Button } from "@/components/ui/button";
import { hasProjetPermission } from "@/constants/permissions";
import { Colors } from "@/constants/theme";
import { useSession } from "@/stores/auth.store";
import { useProjetLocationSheetStore } from "@/stores/projet-location.store";
import { FontAwesome5 } from "@expo/vector-icons";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Text, TextInput, View } from "react-native";
import Toast from "react-native-toast-message";

const PROJET_OPTIONS: { id: number; label: string; value?: Projet }[] = [
  { id: 0, label: "Tous", value: undefined },
  { id: 1, label: "Chantier", value: "chantier" },
  { id: 2, label: "Depot", value: "depot" },
];

export const ProjetLocationScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const canListProjetLocation = hasProjetPermission(user, "LIST");
  const canCreateProjetLocation = hasProjetPermission(user, "CREATE");
  const canUpdateProjetLocation = hasProjetPermission(user, "UPDATE");
  const canDeleteProjetLocation = hasProjetPermission(user, "DELETE");
  const canManageProjetLocation =
    canUpdateProjetLocation || canDeleteProjetLocation;
  const openSelectorOptionsSheet = useProjetLocationSheetStore(
    (s) => s.openSelectorOptions,
  );
  const openDeleteConfirm = useProjetLocationSheetStore(
    (s) => s.openProjetLocationDeleteConfirm,
  );
  const finishDelete = useProjetLocationSheetStore(
    (s) => s.finishProjetLocationDelete,
  );

  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedProjet, setSelectedProjet] = useState<Projet | undefined>(
    undefined,
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filtersCount = useMemo(() => {
    return selectedProjet ? 1 : 0;
  }, [selectedProjet]);

  const selectedProjetLabel = useMemo(() => {
    return (
      PROJET_OPTIONS.find((option) => option.value === selectedProjet)?.label ??
      "Tous"
    );
  }, [selectedProjet]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchText.trim().toLowerCase());
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchText]);

  const { mutate: deleteProjetLocationMutate, isPending: isDeleting } =
    useMutation({
      mutationFn: deleteProjetLocation,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["projet-locations"] });
        Toast.show({
          type: "success",
          text1: "Lieu supprime",
          text2: "Le lieu a ete supprime avec succes.",
        });
      },
      onError: (error) => {
        Toast.show({
          type: "error",
          text1: "Suppression impossible",
          text2: error.message || "Impossible de supprimer ce lieu.",
        });
      },
      onSettled: finishDelete,
    });

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["projet-locations", "list"],
      queryFn: ({ pageParam }) =>
        listProjetLocation({
          page: pageParam,
        }),
      enabled: canListProjetLocation,
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

    const filteredByProjet = selectedProjet
      ? allItems.filter((item) => item.projet === selectedProjet)
      : allItems;

    if (!debouncedSearch) {
      return filteredByProjet;
    }

    return filteredByProjet.filter((item) => {
      const searchIn = [
        String(item.id),
        item.projet,
        item.contact_nom,
        item.contact_telephone,
        item.commentaire,
        item.createur,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchIn.includes(debouncedSearch);
    });
  }, [data, debouncedSearch, selectedProjet]);

  const handleOpenTypeFilter = useCallback(() => {
    openSelectorOptionsSheet({
      title: "Filtrer par type",
      options: PROJET_OPTIONS.map((option) => ({
        id: option.id,
        label: option.label,
      })),
      selectedId:
        PROJET_OPTIONS.find((option) => option.value === selectedProjet)?.id ??
        0,
      onSelect: (id) => {
        const selected = PROJET_OPTIONS.find((option) => option.id === id);
        setSelectedProjet(selected?.value);
      },
    });
  }, [openSelectorOptionsSheet, selectedProjet]);

  const handleOpenMoreOptions = useCallback(
    (item: ProjetLocation) => {
      if (!canManageProjetLocation) {
        Toast.show({
          type: "error",
          text1: "Permission refusee",
          text2: "Vous n'avez pas la permission de modifier ce lieu.",
        });
        return;
      }

      const options: { id: number; label: string }[] = [];

      if (canUpdateProjetLocation) {
        options.push({ id: 1, label: "Modifier" });
      }

      if (canDeleteProjetLocation) {
        options.push({ id: 2, label: "Supprimer" });
      }

      if (options.length === 0) {
        Toast.show({
          type: "info",
          text1: "Aucune action",
          text2: "Aucune action n'est disponible pour ce lieu.",
        });
        return;
      }

      openSelectorOptionsSheet({
        title: "Actions disponibles",
        options,
        onSelect: (id) => {
          if (id === 1 && canUpdateProjetLocation) {
            router.navigate({
              pathname: "/(app)/(drawer)/(stack)/projet-locations/create",
              params: { projetId: String(item.id) },
            });
            return;
          }

          if (id === 2 && canDeleteProjetLocation && !isDeleting) {
            openDeleteConfirm(item.id, (targetId) => {
              deleteProjetLocationMutate(targetId);
            });
          }
        },
      });
    },
    [
      canManageProjetLocation,
      canUpdateProjetLocation,
      canDeleteProjetLocation,
      openSelectorOptionsSheet,
      router,
      isDeleting,
      openDeleteConfirm,
      deleteProjetLocationMutate,
    ],
  );

  if (!canListProjetLocation) {
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
          Vous n'avez pas la permission d'acceder au module Projet.
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
              placeholder="Rechercher un lieu..."
              placeholderTextColor="#bbb"
              value={searchText}
              onChangeText={setSearchText}
              clearButtonMode="while-editing"
            />
          </View>

          {canCreateProjetLocation && (
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
                    "/(app)/(drawer)/(stack)/projet-locations/create",
                  );
                }}
              />
            </View>
          )}
        </View>

        <Text style={{ fontSize: 13, color: "#aaa", marginBottom: 8 }}>
          {listData.length} lieu{listData.length !== 1 ? "x" : ""}
          {selectedProjet ? ` · ${selectedProjetLabel}` : ""}
        </Text>

        <FlatList
          data={listData}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <ProjetLocationCard
              item={item}
              canManageProjetLocation={canManageProjetLocation}
              onMore={() => handleOpenMoreOptions(item)}
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
                <FontAwesome5 name="map-marker-alt" size={40} color="#ddd" />
                <Text style={{ color: "#ccc", marginTop: 14, fontSize: 14 }}>
                  Aucun lieu trouve
                </Text>
              </View>
            )
          }
        />
      </View>
    </View>
  );
};
