import { createVoyage } from "@/api/voyage.api";
import { Button } from "@/components/ui/button";
import { Colors } from "@/constants/theme";
import { useCreateVoyageStore } from "@/stores/voyage.store";
import { FontAwesome6 } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export const VoyageSummaryScreen = () => {
  const store = useCreateVoyageStore();
  const router = useRouter();
  const createVoyageMutation = useMutation({
    mutationFn: createVoyage,
    mutationKey: ["createVoyage"],
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Voyage créé avec succès",
      });
      // reset store
      router.replace("/(app)");
      setTimeout(() => {
        store.resetAll();
      }, 2000);
    },
  });
  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
        <Text style={styles.pageTitle}>Récapitulatif du voyage</Text>

        <FlatList
          data={[]}
          keyExtractor={() => ""}
          renderItem={null}
          ListHeaderComponent={
            <View style={{ gap: 16 }}>
              {/* Chauffeur */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <FontAwesome6
                    name="drivers-license"
                    size={18}
                    color={Colors.light.primary}
                  />
                  <Text style={styles.cardLabel}>Chauffeur</Text>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => router.replace("/voyages/create/chauffeur")}
                  >
                    <FontAwesome6
                      name="pen"
                      size={14}
                      color={Colors.light.primary}
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.cardValue}>
                  {store.selectedChauffeur?.name ?? "—"}
                </Text>
                {store?.selectedChauffeur?.telephone ? (
                  <Text style={styles.cardSub}>
                    {store?.selectedChauffeur.telephone}
                  </Text>
                ) : null}
              </View>

              {/* Véhicule */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <FontAwesome6
                    name="truck"
                    size={18}
                    color={Colors.light.primary}
                  />
                  <Text style={styles.cardLabel}>Véhicule</Text>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => router.replace("/voyages/create/chauffeur")}
                  >
                    <FontAwesome6
                      name="pen"
                      size={14}
                      color={Colors.light.primary}
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.cardValue}>
                  {store.selectedVehicle
                    ? `${store.selectedVehicle.immatriculation} (${store.selectedVehicle.vehiculeMarque})`
                    : "—"}
                </Text>
                {store.selectedVehicle?.nameVehicule ? (
                  <Text style={styles.cardSub}>
                    {store.selectedVehicle.nameVehicule}
                  </Text>
                ) : null}
              </View>

              {/* Dépôt */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <FontAwesome6
                    name="location-dot"
                    size={18}
                    color={Colors.light.primary}
                  />
                  <Text style={styles.cardLabel}>Dépôt</Text>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => router.replace("/voyages/create/chauffeur")}
                  >
                    <FontAwesome6
                      name="pen"
                      size={14}
                      color={Colors.light.primary}
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.cardValue}>
                  {store.selectedDepot
                    ? `${store.selectedDepot.code} — ${store.selectedDepot.nom}`
                    : "—"}
                </Text>
              </View>

              {/* Km départ */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <FontAwesome6
                    name="road"
                    size={18}
                    color={Colors.light.primary}
                  />
                  <Text style={styles.cardLabel}>Km départ</Text>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => router.replace("/voyages/create/chauffeur")}
                  >
                    <FontAwesome6
                      name="pen"
                      size={14}
                      color={Colors.light.primary}
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.cardValue}>
                  {store.kmDepart ? `${store.kmDepart} km` : "—"}
                </Text>
              </View>

              {/* Date départ */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <FontAwesome6
                    name="calendar"
                    size={18}
                    color={Colors.light.primary}
                  />
                  <Text style={styles.cardLabel}>Date et heure de départ</Text>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => router.replace("/voyages/create/chauffeur")}
                  >
                    <FontAwesome6
                      name="pen"
                      size={14}
                      color={Colors.light.primary}
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.cardValue}>
                  {store.dateDepart
                    ? store.dateDepart.toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </Text>
              </View>

              {/* BLs */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <FontAwesome6
                    name="file-lines"
                    size={18}
                    color={Colors.light.primary}
                  />
                  <Text style={styles.cardLabel}>
                    BLs sélectionnés ({store.bls?.length ?? 0})
                  </Text>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => router.replace("/voyages/create")}
                  >
                    <FontAwesome6
                      name="pen"
                      size={14}
                      color={Colors.light.primary}
                    />
                  </TouchableOpacity>
                </View>
                {store.bls && store.bls.length > 0 ? (
                  <View style={styles.blsList}>
                    {store.bls.map((bl) => (
                      <View key={bl.id} style={styles.blChip}>
                        <Text style={styles.blChipText}>{bl.num_bl}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.cardSub}>Aucun BL sélectionné</Text>
                )}
              </View>
            </View>
          }
        />

        <View style={{ marginBottom: 10, gap: 10, marginTop: 5 }}>
          <Button
            preset="filled"
            text="Confirmer le voyage"
            isLoading={createVoyageMutation.isPending}
            disabled={
              !store.selectedChauffeur ||
              !store.selectedVehicle ||
              !store.selectedDepot ||
              !store.kmDepart ||
              !store.dateDepart ||
              !store.bls ||
              store.bls.length === 0
            }
            onPress={() => {
              createVoyageMutation.mutate({
                bl_list: store.bls!.map((bl) => bl.id),
                idChauffeur: store.selectedChauffeur!.id,
                idVehicule: store.selectedVehicle!.id,
                depot_depart: store.selectedDepot!.code,
                km_depart: store.kmDepart,
                date_depart: store.dateDepart!.toISOString(),
              });
            }}
          />
          <Button
            preset="ghost"
            text="Retour"
            onPress={() => router.replace("/(app)")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 14,
    backgroundColor: "white",
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#eee",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  editBtn: {
    marginLeft: "auto",
    padding: 8,
    backgroundColor: Colors.light.primary + "15",
    borderRadius: 6,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#11181C",
  },
  cardSub: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  blsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  blChip: {
    backgroundColor: Colors.light.primary + "20",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.light.primary + "60",
  },
  blChipText: {
    fontSize: 13,
    color: Colors.light.primary,
    fontWeight: "600",
  },
});
