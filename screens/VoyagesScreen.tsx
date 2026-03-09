import { deleteVoyage, listVoyage, VoyageListItem } from "@/api/voyage.api";
import { Button } from "@/components/ui/button";
import { Colors } from "@/constants/theme";
import { useCreateVoyageStore } from "@/stores/voyage.store";
import { FontAwesome5 } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  LayoutAnimation,
  Platform,
  Pressable,
  Text,
  TextInput,
  UIManager,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const PRIMARY = "#ED5623";

const DetailRow = ({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 6,
    }}
  >
    <FontAwesome5
      name={icon as any}
      size={13}
      color={PRIMARY}
      style={{ width: 18, marginTop: 1 }}
    />
    <Text style={{ fontSize: 13, color: "#888", width: 96 }}>{label}</Text>
    <Text style={{ fontSize: 13, color: "#222", flex: 1, flexWrap: "wrap" }}>
      {value}
    </Text>
  </View>
);

const VoyageCard = ({
  item,
  onDelete,
  onUpdate,
}: {
  item: VoyageListItem;
  onDelete: () => void;
  onUpdate: () => void;
}) => {
  const [expanded, setExpanded] = useState(false);

  const bls = item.bl_list;
  const departDate = item.date_depart
    ? new Date(item.date_depart).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

  const blDate = item.dateBL
    ? new Date(item.dateBL).toLocaleDateString("fr-FR")
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
            backgroundColor: PRIMARY + "1a",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <FontAwesome5 name="truck" size={16} color={PRIMARY} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: "700", fontSize: 15, color: "#1a1a2e" }}>
            Voyage #{item.idVoyage}
          </Text>
          <Text style={{ fontSize: 13, color: "#666", marginTop: 2 }}>
            {item.nomChauffeur || "—"}
          </Text>
        </View>

        <View style={{ alignItems: "flex-end", marginRight: 10 }}>
          <Text style={{ fontSize: 12, color: "#aaa" }}>{departDate}</Text>
          <Text
            style={{
              fontSize: 12,
              color: PRIMARY,
              fontWeight: "600",
              marginTop: 2,
            }}
          >
            {bls?.length ?? 0} BL{bls?.length !== 1 ? "s" : ""}
          </Text>
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
          <DetailRow
            icon="file-alt"
            label="BLs"
            value={bls?.map((b) => b.code).join("  •  ") ?? "—"}
          />
          <DetailRow
            icon="map-marker-alt"
            label="Dépôt départ"
            value={item.depot_depart || "—"}
          />
          <DetailRow
            icon="car"
            label="Véhicule"
            value={item.immatriculation !== null ? item.immatriculation : "—"}
          />
          <DetailRow icon="calendar-alt" label="Date BL" value={blDate} />

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
              <Text style={{ color: PRIMARY, fontWeight: "600", fontSize: 13 }}>
                Modifier
              </Text>
            </Pressable>

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
                style={{ color: "#ff4d4f", fontWeight: "600", fontSize: 13 }}
              >
                Supprimer
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </Pressable>
  );
};

export const VoyagesScreen = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["voyages", "list"],
    queryFn: listVoyage,
  });

  const router = useRouter();
  const store = useCreateVoyageStore();
  const queryClient = useQueryClient();

  const { mutate: deleteMutate } = useMutation({
    mutationFn: deleteVoyage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voyages", "list"] });
    },
  });

  const handleDelete = (idVoyage: number) => {
    Alert.alert(
      "Supprimer le voyage",
      `Êtes-vous sûr de vouloir supprimer le voyage #${idVoyage} ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => deleteMutate(idVoyage),
        },
      ],
    );
  };

  const handleUpdate = (item: VoyageListItem) => {
    store.resetAll();
    store.setIdVoyage(item.idVoyage);

    if (item.idChauffeur && item.nomChauffeur) {
      store.setSelectedChauffeur({
        id: item.idChauffeur,
        name: item.nomChauffeur,
        idDepartement: 0,
        telephone: "",
        fonction: "Chauffeur",
        role: "",
        photoIdentite: "",
        photo: "",
      });
    }

    store.removeAllBls();
    if (item.bl_list) {
      const blIds = item.bl_list
        .filter(
          (bl): bl is { id: number; code: string } => !!bl.id && !!bl.code,
        )
        .map((bl) => ({ id: bl.id, num_bl: bl.code }));
      console.log("BLs à ajouter au store :", blIds);
      store.addBls(blIds);
    }

    if (item.idVehicule !== null) {
      store.setSelectedVehicle({
        id: item.idVehicule,
        immatriculation: "",
        nameVehicule: "",
        vehiculeType: "",
        vehiculeMarque: "",
        km_reel: null,
      });
    }
    if (item.km_depart) {
      store.setKmDepart(item.km_depart);
    }
    if (item.date_depart) {
      store.setDateDepart(new Date(item.date_depart));
    }

    store.setType("update");
    router.push("/voyages/create/chauffeur");
  };

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

  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!debouncedSearch) return data;
    const q = debouncedSearch.toLowerCase();
    return data.filter(
      (v) =>
        v.bl_list?.some((bl) => bl.code?.toLowerCase().includes(q)) ||
        v.nomChauffeur?.toLowerCase().includes(q),
    );
  }, [data, debouncedSearch]);

  return (
    <SafeAreaView
      style={{ flex: 1, paddingHorizontal: 14, backgroundColor: "#f7f8fa" }}
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
              placeholder="Rechercher par N° BL ou chauffeur..."
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
                router.push("/voyages/create/chauffeur");
              }}
            />
          </View>
        </View>

        {/* Result count */}
        <Text style={{ fontSize: 13, color: "#aaa", marginBottom: 8 }}>
          {filteredData.length} voyage{filteredData.length !== 1 ? "s" : ""}
        </Text>

        <FlatList
          data={filteredData}
          keyExtractor={(item) => String(item.idVoyage)}
          renderItem={({ item }) => (
            <VoyageCard
              item={item}
              onDelete={() => handleDelete(item.idVoyage)}
              onUpdate={() => handleUpdate(item)}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
          ListEmptyComponent={
            isLoading ? null : (
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
    </SafeAreaView>
  );
};
