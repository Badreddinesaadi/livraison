import { ListDepots } from "@/api/depots.api";
import { ListChauffeurs } from "@/api/users.api";
import { ListVehicles } from "@/api/vehicle.api";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Colors } from "@/constants/theme";
import { useCreateVoyageStore } from "@/stores/voyage.store";
import { FontAwesome6 } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
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
  const router = useRouter();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

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
              <View style={styles.pickerWrapper}>
                <Picker
                  dropdownIconColor={Colors.light.primary}
                  selectedValue={createVoyageStore.selectedChauffeur?.id}
                  onValueChange={(itemValue) => {
                    const selectedChauffeur = chauffersList?.find(
                      (chauffeur) => chauffeur.id === itemValue,
                    );
                    if (selectedChauffeur) {
                      createVoyageStore.setSelectedChauffeur(selectedChauffeur);
                    }
                  }}
                >
                  <Picker.Item
                    label="Sélectionner un chauffeur"
                    value={undefined}
                  />
                  {chauffersList?.map((chauffeur) => (
                    <Picker.Item
                      key={chauffeur.id}
                      label={chauffeur.name}
                      value={chauffeur.id}
                    />
                  ))}
                </Picker>
              </View>
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
              <View style={styles.pickerWrapper}>
                <Picker
                  dropdownIconColor={Colors.light.primary}
                  selectedValue={createVoyageStore.selectedVehicle?.id}
                  onValueChange={(itemValue) => {
                    const selectedVehicle = vehiclesList?.find(
                      (vehicle) => vehicle.id === itemValue,
                    );
                    if (selectedVehicle) {
                      createVoyageStore.setSelectedVehicle(selectedVehicle);
                    }
                  }}
                >
                  <Picker.Item
                    label="Sélectionner un véhicule"
                    value={undefined}
                  />
                  {vehiclesList?.map((vehicle) => (
                    <Picker.Item
                      key={vehicle.id}
                      label={`${vehicle.immatriculation} (${vehicle.vehiculeMarque})`}
                      value={vehicle.id}
                    />
                  ))}
                </Picker>
              </View>
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
              <View style={styles.pickerWrapper}>
                <Picker
                  dropdownIconColor={Colors.light.primary}
                  selectedValue={createVoyageStore.selectedDepot?.id}
                  onValueChange={(itemValue) => {
                    const selectedDepot = depotsList?.find(
                      (depot) => depot.id === itemValue,
                    );
                    if (selectedDepot) {
                      createVoyageStore.setSelectedDepot(selectedDepot);
                    }
                  }}
                >
                  <Picker.Item
                    label="Sélectionner un dépôt"
                    value={undefined}
                  />
                  {depotsList?.map((depot) => (
                    <Picker.Item
                      key={depot.id}
                      label={depot.code}
                      value={depot.id}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <FontAwesome6
                  name="road"
                  size={18}
                  color={Colors.light.primary}
                />
                <Text style={styles.sectionTitle}>Km départ</Text>
              </View>
              <TextInput
                style={styles.kmInput}
                keyboardType="numeric"
                placeholder="Kilométrage au départ..."
                placeholderTextColor="#999"
                value={
                  createVoyageStore.kmDepart
                    ? String(createVoyageStore.kmDepart)
                    : ""
                }
                onChangeText={(val) => {
                  const parsed = parseInt(val, 10);
                  createVoyageStore.setKmDepart(isNaN(parsed) ? 0 : parsed);
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
              router.push("/voyages/create/select-bls");
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
  pickerWrapper: {
    borderColor: "#e8e8e8",
    borderWidth: 1,
    borderRadius: 10,
    overflow: "hidden",
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
