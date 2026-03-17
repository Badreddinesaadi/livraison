import { ListDepots } from "@/api/depots.api";
import { ListChauffeurs } from "@/api/users.api";
import { ListVehicles } from "@/api/vehicle.api";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Colors } from "@/constants/theme";
import { useCloseBLStore } from "@/stores/close-bl.store";
import { useCreateVoyageStore } from "@/stores/voyage.store";
import { FontAwesome6 } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
export const SelectChauffeurScreen = () => {
  const { data: chauffersList, isLoading: isChauffeursLoading } = useQuery({
    queryKey: ["chauffeurs", "full-list"],
    queryFn: ListChauffeurs,
  });
  const { data: vehiclesList, isLoading: isVehiclesLoading } = useQuery({
    queryKey: ["vehicles", "full-list"],
    queryFn: ListVehicles,
  });
  const { data: depotsList, isLoading: isDepotsLoading } = useQuery({
    queryKey: ["depots", "full-list"],
    queryFn: ListDepots,
  });
  const createVoyageStore = useCreateVoyageStore();
  const openSelectorOptions = useCloseBLStore((s) => s.openSelectorOptions);
  const router = useRouter();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const chauffeurOptions = useMemo(
    () =>
      (chauffersList ?? []).map((chauffeur) => ({
        id: chauffeur.id,
        label: chauffeur.name,
        subLabel: chauffeur.telephone || undefined,
      })),
    [chauffersList],
  );

  const vehicleOptions = useMemo(
    () =>
      (vehiclesList ?? []).map((vehicle) => ({
        id: vehicle.id,
        label: `${vehicle.immatriculation} (${vehicle.vehiculeMarque})`,
        subLabel: vehicle.vehiculeMarque || undefined,
      })),
    [vehiclesList],
  );

  const depotOptions = useMemo(
    () =>
      (depotsList ?? []).map((depot) => ({
        id: depot.id,
        label: depot.code,
        subLabel: depot.nom || undefined,
      })),
    [depotsList],
  );

  const openChauffeurSelector = useCallback(() => {
    openSelectorOptions({
      title: "Sélectionner un chauffeur",
      options: chauffeurOptions,
      selectedId: createVoyageStore.selectedChauffeur?.id,
      onSelect: (id: number) => {
        const selectedChauffeur = chauffersList?.find(
          (chauffeur) => chauffeur.id === id,
        );
        if (selectedChauffeur) {
          createVoyageStore.setSelectedChauffeur(selectedChauffeur);
        }
      },
    });
  }, [openSelectorOptions, chauffeurOptions, chauffersList, createVoyageStore]);

  const openVehicleSelector = useCallback(() => {
    openSelectorOptions({
      title: "Sélectionner un véhicule",
      options: vehicleOptions,
      selectedId: createVoyageStore.selectedVehicle?.id,
      onSelect: (id: number) => {
        const selectedVehicle = vehiclesList?.find(
          (vehicle) => vehicle.id === id,
        );
        if (selectedVehicle) {
          createVoyageStore.setSelectedVehicle(selectedVehicle);
        }
      },
    });
  }, [openSelectorOptions, vehicleOptions, vehiclesList, createVoyageStore]);

  const openDepotSelector = useCallback(() => {
    openSelectorOptions({
      title: "Sélectionner un dépôt",
      options: depotOptions,
      selectedId: createVoyageStore.selectedDepot?.id,
      onSelect: (id: number) => {
        const selectedDepot = depotsList?.find((depot) => depot.id === id);
        if (selectedDepot) {
          createVoyageStore.setSelectedDepot(selectedDepot);
        }
      },
    });
  }, [openSelectorOptions, depotOptions, depotsList, createVoyageStore]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>
            Veuillez sélectionner le chauffeur pour ce voyage
          </Text>
        </View>

        {isChauffeursLoading || isVehiclesLoading || isDepotsLoading ? (
          <Loader />
        ) : (
          <ScrollView
            style={styles.formScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.formContent}
          >
            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <FontAwesome6
                  name="drivers-license"
                  size={18}
                  color={Colors.light.primary}
                />
                <Text style={styles.sectionTitle}>Chauffeur</Text>
              </View>
              <Pressable
                style={styles.dateButton}
                onPress={openChauffeurSelector}
              >
                <Text style={styles.dateButtonText}>
                  {createVoyageStore.selectedChauffeur?.name ||
                    "Sélectionner un chauffeur"}
                </Text>
                <FontAwesome6 name="chevron-right" size={14} color="#888" />
              </Pressable>
            </View>

            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <FontAwesome6
                  name="truck"
                  size={18}
                  color={Colors.light.primary}
                />
                <Text style={styles.sectionTitle}>Véhicule</Text>
              </View>
              <Pressable
                style={styles.dateButton}
                onPress={openVehicleSelector}
              >
                <Text style={styles.dateButtonText}>
                  {createVoyageStore.selectedVehicle
                    ? `${createVoyageStore.selectedVehicle.immatriculation} (${createVoyageStore.selectedVehicle.vehiculeMarque})`
                    : "Sélectionner un véhicule"}
                </Text>
                <FontAwesome6 name="chevron-right" size={14} color="#888" />
              </Pressable>
            </View>

            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <FontAwesome6
                  name="location-dot"
                  size={18}
                  color={Colors.light.primary}
                />
                <Text style={styles.sectionTitle}>Depot de depart</Text>
              </View>
              <Pressable style={styles.dateButton} onPress={openDepotSelector}>
                <Text style={styles.dateButtonText}>
                  {createVoyageStore.selectedDepot
                    ? `${createVoyageStore.selectedDepot.code} — ${createVoyageStore.selectedDepot.nom}`
                    : "Sélectionner un dépôt"}
                </Text>
                <FontAwesome6 name="chevron-right" size={14} color="#888" />
              </Pressable>
            </View>

            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <FontAwesome6
                  name="road"
                  size={18}
                  color={Colors.light.primary}
                />
                <Text style={styles.sectionTitle}>
                  Km départ (min:{" "}
                  {createVoyageStore.selectedVehicle?.km_reel + " km" || 0})
                </Text>
              </View>
              <TextInput
                style={[
                  styles.kmInput,
                  !createVoyageStore.selectedVehicle && { opacity: 0.6 },
                ]}
                keyboardType="numeric"
                placeholder={
                  createVoyageStore.selectedVehicle
                    ? "Kilométrage au départ..."
                    : "Sélectionnez d'abord un véhicule"
                }
                placeholderTextColor="#999"
                editable={Boolean(createVoyageStore.selectedVehicle)}
                value={
                  createVoyageStore.kmDepart
                    ? String(createVoyageStore.kmDepart)
                    : ""
                }
                onChangeText={(val) => {
                  if (val === "") {
                    createVoyageStore.setKmDepart(0);
                    return;
                  }

                  const parsed = parseInt(val, 10);
                  if (isNaN(parsed)) return;

                  createVoyageStore.setKmDepart(parsed);
                }}
              />
            </View>

            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <FontAwesome6
                  name="calendar"
                  size={18}
                  color={Colors.light.primary}
                />
                <Text style={styles.sectionTitle}>Date et heure de départ</Text>
              </View>
              <Pressable
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  {createVoyageStore.dateDepart
                    ? createVoyageStore.dateDepart.toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Sélectionner la date et l'heure"}
                </Text>
                <FontAwesome6 name="chevron-right" size={14} color="#888" />
              </Pressable>
              {showDatePicker && (
                <DateTimePicker
                  value={createVoyageStore.dateDepart || new Date()}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(Platform.OS === "ios");
                    if (selectedDate) {
                      const currentDate =
                        createVoyageStore.dateDepart || new Date();
                      selectedDate.setHours(currentDate.getHours());
                      selectedDate.setMinutes(currentDate.getMinutes());
                      createVoyageStore.setDateDepart(selectedDate);
                      if (Platform.OS !== "ios") {
                        setShowTimePicker(true);
                      }
                    }
                  }}
                />
              )}
              {showTimePicker && (
                <DateTimePicker
                  value={createVoyageStore.dateDepart || new Date()}
                  mode="time"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(event, selectedTime) => {
                    setShowTimePicker(Platform.OS === "ios");
                    if (selectedTime) {
                      createVoyageStore.setDateDepart(selectedTime);
                    }
                  }}
                />
              )}
            </View>
          </ScrollView>
        )}
        <View style={styles.footer}>
          <Button
            disabled={
              !createVoyageStore.selectedDepot ||
              !createVoyageStore.selectedChauffeur ||
              !createVoyageStore.kmDepart ||
              !createVoyageStore.dateDepart
            }
            preset="filled"
            text="Suivant"
            onPress={() => {
              const vehicle = createVoyageStore.selectedVehicle;
              const kmDepart = createVoyageStore.kmDepart;

              if (!vehicle) {
                Toast.show({
                  type: "error",
                  text1: "Véhicule manquant",
                  text2:
                    "Veuillez sélectionner un véhicule avant de poursuivre.",
                });
                return;
              }

              const vehicleKmRaw = vehicle.km_reel;
              const vehicleKm = vehicleKmRaw ? parseInt(vehicleKmRaw, 10) : NaN;

              if (!isNaN(vehicleKm) && kmDepart < vehicleKm) {
                Toast.show({
                  type: "error",
                  text1: "Kilométrage invalide",
                  text2: `Le kilométrage doit être supérieur au kilométrage réel du véhicule (${vehicleKm}).`,
                });
                return;
              }

              router.navigate("/voyages/create/select-bls");
            }}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 14,
    backgroundColor: "#f7f8fa",
  },
  content: {
    flex: 1,
  },
  header: {
    marginTop: 6,
    marginBottom: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#11181C",
  },
  formScroll: {
    flex: 1,
  },
  formContent: {
    gap: 12,
    paddingBottom: 14,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#efefef",
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a2e",
  },
  kmInput: {
    height: 48,
    borderColor: "#e8e8e8",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 14,
    color: "#11181C",
    backgroundColor: "#fff",
  },
  dateButton: {
    height: 48,
    borderColor: "#e8e8e8",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  dateButtonText: {
    fontSize: 14,
    color: "#333",
  },
  footer: {
    marginBottom: 10,
    marginTop: 8,
  },
});
