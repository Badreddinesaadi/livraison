import { ListRotations } from "@/api/rotation-chauffeur.api";
import { ListChauffeurs } from "@/api/users.api";
import { ListVehicles } from "@/api/vehicle.api";
import Loader from "@/components/Loader";
import { RotationChauffeurCard } from "@/components/RotationChauffeurCard";
import { Button } from "@/components/ui/button";
import { hasRotationPermission } from "@/constants/permissions";
import { PRIMARY } from "@/constants/theme";
import { useSession } from "@/stores/auth.store";
import { useCloseBLStore, VoyageFilterItem } from "@/stores/close-bl.store";
import { FontAwesome5 } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { FlatList, Text, View } from "react-native";

const formatDateForApi = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const startOfDay = (date: Date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const formatDateLabel = (date?: Date | null) => {
  if (!date) {
    return "Non definie";
  }

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const RotationChauffeurScreen = () => {
  const { user } = useSession();
  const canListRotations = hasRotationPermission(user, "LIST");
  const openSelectorOptionsSheet = useCloseBLStore(
    (state) => state.openSelectorOptions,
  );
  const openVoyageFiltersSheet = useCloseBLStore(
    (state) => state.openVoyageFilters,
  );
  const closeBottomSheet = useCloseBLStore((state) => state.closeSheet);

  const [selectedVehiculeId, setSelectedVehiculeId] = useState<
    number | undefined
  >(undefined);
  const [selectedChauffeurId, setSelectedChauffeurId] = useState<
    number | undefined
  >(undefined);
  const [selectedDisponibilite, setSelectedDisponibilite] = useState<
    boolean | undefined
  >(undefined);
  const [dateDu, setDateDu] = useState<Date | null>(null);
  const [dateAu, setDateAu] = useState<Date | null>(null);
  const [showDateDuPicker, setShowDateDuPicker] = useState(false);
  const [showDateAuPicker, setShowDateAuPicker] = useState(false);

  const { data: chauffeursList } = useQuery({
    queryKey: ["chauffeurs", "full-list", "rotation"],
    queryFn: ListChauffeurs,
    enabled: canListRotations,
  });

  const { data: vehiclesList } = useQuery({
    queryKey: ["vehicles", "full-list"],
    queryFn: ListVehicles,
    enabled: canListRotations,
  });

  const intervalRange = useMemo(() => {
    return {
      date_du: dateDu ? formatDateForApi(startOfDay(dateDu)) : undefined,
      date_au: dateAu ? formatDateForApi(startOfDay(dateAu)) : undefined,
    };
  }, [dateDu, dateAu]);

  const filtersCount = useMemo(() => {
    return (
      (selectedVehiculeId ? 1 : 0) +
      (selectedChauffeurId ? 1 : 0) +
      (typeof selectedDisponibilite === "boolean" ? 1 : 0) +
      (dateDu || dateAu ? 1 : 0)
    );
  }, [
    selectedVehiculeId,
    selectedChauffeurId,
    selectedDisponibilite,
    dateDu,
    dateAu,
  ]);

  const selectedVehiculeLabel = useMemo(() => {
    const selectedVehicule = vehiclesList?.find(
      (vehicle) => vehicle.id === selectedVehiculeId,
    );

    if (!selectedVehicule) {
      return "Tous";
    }

    return (
      [selectedVehicule.vehiculeMarque, selectedVehicule.immatriculation]
        .filter(Boolean)
        .join(" - ") || "Tous"
    );
  }, [vehiclesList, selectedVehiculeId]);

  const selectedChauffeurLabel = useMemo(() => {
    const selectedChauffeur = chauffeursList?.find(
      (chauffeur) => chauffeur.id === selectedChauffeurId,
    );

    if (!selectedChauffeur) {
      return "Tous";
    }

    return selectedChauffeur.name || "Tous";
  }, [chauffeursList, selectedChauffeurId]);

  const selectedDisponibiliteLabel = useMemo(() => {
    if (typeof selectedDisponibilite !== "boolean") {
      return "Tous";
    }

    return selectedDisponibilite ? "Disponible" : "Reserve";
  }, [selectedDisponibilite]);

  const selectedIntervalLabel = useMemo(() => {
    if (!dateDu && !dateAu) {
      return "Tous";
    }

    if (dateDu && dateAu) {
      return `${formatDateLabel(dateDu)} -> ${formatDateLabel(dateAu)}`;
    }

    if (dateDu) {
      return `Depuis ${formatDateLabel(dateDu)}`;
    }

    return `Jusqu'au ${formatDateLabel(dateAu)}`;
  }, [dateDu, dateAu]);

  const handleOpenVehiculeSelector = useCallback(() => {
    openSelectorOptionsSheet({
      title: "Filtrer par vehicule",
      options: [
        { id: 0, label: "Tous" },
        ...(vehiclesList ?? []).map((vehicle) => ({
          id: vehicle.id,
          label: vehicle.vehiculeMarque || vehicle.immatriculation,
          subLabel: vehicle.immatriculation,
        })),
      ],
      selectedId: selectedVehiculeId ?? 0,
      onSelect: (id) => {
        setSelectedVehiculeId(id === 0 ? undefined : id);
      },
    });
  }, [openSelectorOptionsSheet, vehiclesList, selectedVehiculeId]);

  const handleOpenChauffeurSelector = useCallback(() => {
    openSelectorOptionsSheet({
      title: "Filtrer par chauffeur",
      options: [
        { id: 0, label: "Tous" },
        ...(chauffeursList ?? []).map((chauffeur) => ({
          id: chauffeur.id,
          label: chauffeur.name,
          subLabel: chauffeur.telephone || undefined,
        })),
      ],
      selectedId: selectedChauffeurId ?? 0,
      enableSearch: true,
      searchPlaceholder: "Rechercher un chauffeur",
      onSelect: (id) => {
        setSelectedChauffeurId(id === 0 ? undefined : id);
      },
    });
  }, [openSelectorOptionsSheet, chauffeursList, selectedChauffeurId]);

  const handleOpenDisponibiliteSelector = useCallback(() => {
    openSelectorOptionsSheet({
      title: "Filtrer par disponibilite",
      options: [
        { id: 0, label: "Tous" },
        { id: 1, label: "Disponible" },
        { id: 2, label: "Reserve" },
      ],
      selectedId:
        typeof selectedDisponibilite === "boolean"
          ? selectedDisponibilite
            ? 1
            : 2
          : 0,
      onSelect: (id) => {
        if (id === 0) {
          setSelectedDisponibilite(undefined);
          return;
        }

        setSelectedDisponibilite(id === 1);
      },
    });
  }, [openSelectorOptionsSheet, selectedDisponibilite]);

  const handleOpenIntervalSelector = useCallback(() => {
    openSelectorOptionsSheet({
      title: "Intervalle personnalise",
      options: [
        {
          id: 1,
          label: `Date du: ${formatDateLabel(dateDu)}`,
        },
        {
          id: 2,
          label: `Date au: ${formatDateLabel(dateAu)}`,
        },
        {
          id: 3,
          label: "Reinitialiser l'intervalle",
        },
      ],
      onSelect: (id) => {
        if (id === 1) {
          setShowDateDuPicker(true);
          return;
        }

        if (id === 2) {
          setShowDateAuPicker(true);
          return;
        }

        if (id === 3) {
          setDateDu(null);
          setDateAu(null);
        }
      },
    });
  }, [openSelectorOptionsSheet, dateDu, dateAu]);

  const handleOpenFiltersSheet = useCallback(() => {
    const items: VoyageFilterItem[] = [
      {
        key: "rotation-chauffeur",
        label: "Chauffeur",
        valueLabel: selectedChauffeurLabel,
      },
      {
        key: "rotation-vehicule",
        label: "Vehicule",
        valueLabel: selectedVehiculeLabel,
      },
      {
        key: "rotation-disponibilite",
        label: "Disponibilite",
        valueLabel: selectedDisponibiliteLabel,
      },
    ];

    openVoyageFiltersSheet({
      title: "Filtrer les rotations",
      items,
      onPressItem: (key) => {
        if (key === "rotation-chauffeur") {
          handleOpenChauffeurSelector();
          return;
        }

        if (key === "rotation-vehicule") {
          handleOpenVehiculeSelector();
          return;
        }

        if (key === "rotation-disponibilite") {
          handleOpenDisponibiliteSelector();
          return;
        }

        if (key === "rotation-interval") {
          handleOpenIntervalSelector();
        }
      },
      onReset: () => {
        setSelectedChauffeurId(undefined);
        setSelectedVehiculeId(undefined);
        setSelectedDisponibilite(undefined);
        setDateDu(null);
        setDateAu(null);
        closeBottomSheet();
      },
    });
  }, [
    selectedChauffeurLabel,
    selectedVehiculeLabel,
    selectedDisponibiliteLabel,
    selectedIntervalLabel,
    openVoyageFiltersSheet,
    handleOpenChauffeurSelector,
    handleOpenVehiculeSelector,
    handleOpenDisponibiliteSelector,
    handleOpenIntervalSelector,
    closeBottomSheet,
  ]);

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: [
        "rotations",
        "chauffeur",
        "list",
        {
          chauffeur_id: selectedChauffeurId,
          vehicule_id: selectedVehiculeId,
          disponibilite: selectedDisponibilite,
          date_du: intervalRange.date_du,
          date_au: intervalRange.date_au,
        },
      ],
      queryFn: ({ pageParam }) =>
        ListRotations({
          page: pageParam,
          chauffeur_id: selectedChauffeurId,
          vehicule_id: selectedVehiculeId,
          disponibilite: selectedDisponibilite,
          date_du: intervalRange.date_du,
          date_au: intervalRange.date_au,
        }),
      enabled: canListRotations,
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

  if (!canListRotations) {
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
          Vous n'avez pas la permission d'acceder au module Rotation.
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
            justifyContent: "flex-end",
            alignItems: "center",
            marginTop: 4,
            marginBottom: 12,
          }}
        >
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
        </View>

        <Text style={{ fontSize: 13, color: "#aaa", marginBottom: 8 }}>
          {listData.length} rotation{listData.length > 1 ? "s" : ""}
          {dateDu || dateAu ? ` · ${selectedIntervalLabel}` : ""}
        </Text>

        <FlatList
          data={listData}
          keyExtractor={(item) =>
            `${item.vehicule}-${item.chauffeur}-${item.km_parcourus}`
          }
          renderItem={({ item }) => <RotationChauffeurCard item={item} />}
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
                <FontAwesome5 name="route" size={40} color="#ddd" />
                <Text style={{ color: "#ccc", marginTop: 14, fontSize: 14 }}>
                  Aucune rotation trouvee
                </Text>
              </View>
            )
          }
        />

        {showDateDuPicker ? (
          <DateTimePicker
            value={dateDu || dateAu || new Date()}
            mode="date"
            display="default"
            maximumDate={dateAu || undefined}
            onChange={(event, selectedDate) => {
              setShowDateDuPicker(false);

              if (event.type === "set" && selectedDate) {
                const nextDateDu = startOfDay(selectedDate);
                setDateDu(nextDateDu);

                if (dateAu && nextDateDu.getTime() > dateAu.getTime()) {
                  setDateAu(nextDateDu);
                }
              }
            }}
          />
        ) : null}

        {showDateAuPicker ? (
          <DateTimePicker
            value={dateAu || dateDu || new Date()}
            mode="date"
            display="default"
            minimumDate={dateDu || undefined}
            onChange={(event, selectedDate) => {
              setShowDateAuPicker(false);

              if (event.type === "set" && selectedDate) {
                const nextDateAu = startOfDay(selectedDate);
                setDateAu(nextDateAu);

                if (dateDu && nextDateAu.getTime() < dateDu.getTime()) {
                  setDateDu(nextDateAu);
                }
              }
            }}
          />
        ) : null}
      </View>
    </View>
  );
};
