import { listBLSEnCours } from "@/api/BLS.api";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Colors } from "@/constants/theme";
import { useCreateVoyageStore } from "@/stores/voyage.store";
import { BL } from "@/types/bl.types";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const CreateVoyageScreen = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["bls", "list"],
    queryFn: listBLSEnCours,
    select: (data) => {
      return data?.map((bl) => ({
        id: bl.id,
        num_bl: bl.code,
        datetime_document: bl.datetime_document,
        nomClient: bl.nomClient,
      }));
    },
  });
  const store = useCreateVoyageStore();
  const router = useRouter();

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
    const apiBls = data ?? [];
    const mergedData =
      store.type === "update"
        ? (() => {
            const apiIds = new Set(apiBls.map((bl) => bl.id));
            const oldMissingBls = (store.bls ?? []).filter(
              (bl) => !apiIds.has(bl.id),
            );

            // Keep API order stable, then append old BLs not returned by API.
            return [...apiBls, ...oldMissingBls];
          })()
        : apiBls;

    if (!debouncedSearch) return mergedData;

    return mergedData.filter((bl) =>
      bl.num_bl.toLowerCase().includes(debouncedSearch.toLowerCase()),
    );
  }, [data, debouncedSearch, store.type, store.bls]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>
            Veuillez sélectionner les BLS à inclure dans le voyage
          </Text>
        </View>
        <View style={styles.searchContainer}>
          <FontAwesome5
            name="search"
            size={16}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Rechercher par N° BL..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
            clearButtonMode="while-editing"
          />
          {!!store.bls && store.bls.length > 0 && (
            <Button
              size="sm"
              preset="ghost"
              text="Tout désélectionner"
              onPress={store.removeAllBls}
              textStyle={styles.deselectText}
            />
          )}
        </View>
        <TextInput style={styles.input} placeholder="Nom du voyage" />
        {isLoading ? (
          <Loader />
        ) : (
          <FlatList
            data={filteredData}
            keyExtractor={(bl, i) => bl.id.toString()}
            renderItem={({ item: bl }) => (
              <BLCard
                key={bl.id}
                bl={bl}
                selected={store.bls?.some((b) => b.id === bl.id)}
                addBls={store.addBls}
                removeBL={store.removeBL}
              />
            )}
          />
        )}
        <View style={{ marginBottom: 10 }}>
          <Button
            preset="filled"
            disabled={!store.bls || store.bls.length === 0}
            text={`Suivant (${store.bls?.length || 0})`}
            onPress={() => {
              router.push("/voyages/create/photo");
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const BLCard = ({
  bl,
  selected,
  addBls,
  removeBL,
}: {
  bl: BL;
  selected: boolean | undefined;
  addBls: (newBls: BL[]) => void;
  removeBL: (blId: number) => void;
}) => {
  const blDate = new Date(bl.datetime_document);
  return (
    <View style={[styles.card]}>
      <View style={{ marginBottom: 10 }}>
        <Text style={styles.cardTitle}>{bl.num_bl}</Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            marginTop: 4,
          }}
        >
          <FontAwesome5 name="clock" size={12} color={Colors.light.primary} />
          <Text>
            {blDate.toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "2-digit",
              year: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            marginTop: 4,
          }}
        >
          <FontAwesome5
            name="user-tag"
            size={12}
            color={Colors.light.primary}
          />
          <Text>{bl.nomClient}</Text>
        </View>
      </View>
      <Button
        size="sm"
        preset={selected ? "filled" : "ghost"}
        text={selected ? "Désélectionner" : "Sélectionner"}
        onPress={() => {
          if (selected) {
            removeBL(bl.id);
          } else {
            addBls([bl]);
          }
        }}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 14,
    backgroundColor: "white",
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
  },
  deselectText: {
    color: "#ED5623",
    fontSize: 13,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 0,
  },
  card: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 5,
    borderLeftColor: Colors.light.primary,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  selectedCard: {
    backgroundColor: Colors.light.primary,
    color: "white",
  },
});
