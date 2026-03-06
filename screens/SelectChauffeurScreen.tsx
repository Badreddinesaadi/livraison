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
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export const SelectChauffeurScreen = () => {
  const { data: chauffersList, isLoading: isChauffeursLoading } = useQuery({
    queryKey: ["chauffeurs", "full-list"],
    queryFn: ListChauffeurs,
    select: (data) =>
      data
        ?.map((chauffeur) => ({
          ...chauffeur,
          name: chauffeur.name.trim(),
        }))
        .filter((chauffeur) => chauffeur.fonction === "Chauffeur")
        .sort((a, b) => a.name.localeCompare(b.name)),
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
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.title}>
            Veuillez sélectionner le chauffeur pour ce voyage
          </Text>
        </View>
        {/* <TextInput style={styles.input} placeholder="Nom du voyage" /> */}
        {isChauffeursLoading || isVehiclesLoading || isDepotsLoading ? (
          <Loader />
        ) : (
          <View style={{ flex: 1, rowGap: 10 }}>
            <View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 10,
                  gap: 8,
                }}
              >
                <FontAwesome6
                  name="drivers-license"
                  size={24}
                  color={Colors.light.primary}
                />
                <Text style={{ fontSize: 20, fontWeight: "700" }}>
                  Chauffeur:
                </Text>
              </View>

              <Picker
                dropdownIconColor={Colors.light.primary}
                selectedValue={createVoyageStore.selectedChauffeur?.id}
                onValueChange={(itemValue, itemIndex) => {
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
            <View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 10,
                  gap: 8,
                }}
              >
                <FontAwesome6
                  name="truck"
                  size={24}
                  color={Colors.light.primary}
                />
                <Text style={{ fontSize: 20, fontWeight: "700" }}>
                  Véhicule:
                </Text>
              </View>

              <Picker
                dropdownIconColor={Colors.light.primary}
                selectedValue={createVoyageStore.selectedVehicle?.id}
                onValueChange={(itemValue, itemIndex) => {
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
                    label={
                      vehicle.immatriculation +
                      " (" +
                      vehicle.vehiculeMarque +
                      ")"
                    }
                    value={vehicle.id}
                  />
                ))}
              </Picker>
            </View>
            <View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 10,
                  gap: 8,
                }}
              >
                <FontAwesome6
                  name="location-dot"
                  size={24}
                  color={Colors.light.primary}
                />
                <Text style={{ fontSize: 20, fontWeight: "700" }}>
                  Dépôt de depart:
                </Text>
              </View>
              <Picker
                dropdownIconColor={Colors.light.primary}
                selectedValue={createVoyageStore.selectedDepot?.id}
                onValueChange={(itemValue, itemIndex) => {
                  const selectedDepot = depotsList?.find(
                    (depot) => depot.id === itemValue,
                  );
                  if (selectedDepot) {
                    createVoyageStore.setSelectedDepot(selectedDepot);
                  }
                }}
              >
                <Picker.Item label="Sélectionner un dépôt" value={undefined} />
                {depotsList?.map((depot) => (
                  <Picker.Item
                    key={depot.id}
                    label={depot.code}
                    value={depot.id}
                  />
                ))}
              </Picker>
            </View>
            <View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 10,
                  gap: 8,
                }}
              >
                <FontAwesome6
                  name="road"
                  size={24}
                  color={Colors.light.primary}
                />
                <Text style={{ fontSize: 20, fontWeight: "700" }}>
                  Km départ:
                </Text>
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
            <View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 10,
                  gap: 8,
                }}
              >
                <FontAwesome6
                  name="calendar"
                  size={24}
                  color={Colors.light.primary}
                />
                <Text style={{ fontSize: 20, fontWeight: "700" }}>
                  Date et heure de départ:
                </Text>
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
                <FontAwesome6 name="chevron-right" size={16} color="#666" />
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
          </View>
        )}
        <View style={{ marginBottom: 10 }}>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 14,
    backgroundColor: "white",
  },

  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  kmInput: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 10,
  },
  dateButton: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  dateButtonText: {
    fontSize: 16,
    color: "#333",
  },
  card: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
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
