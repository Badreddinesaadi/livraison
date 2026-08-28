import {
  RvtFooterButton,
  RvtSelectorField,
  SectionCard,
} from "@/components/RvtFormFields";
import { hasRapportVisitePermission } from "@/constants/permissions";
import { useReferenceData } from "@/hooks/use-reference-data";
import { useSession } from "@/stores/auth.store";
import { useCreateVisitStore } from "@/stores/create-visit.store";
import { useRvtSheetStore } from "@/stores/rvt-sheet.store";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";

export default function CreateRvtProfilScreen() {
  const router = useRouter();
  const { user } = useSession();
  const canCreate = hasRapportVisitePermission(user, "CREATE");
  const store = useCreateVisitStore();
  const openSelect = useRvtSheetStore((s) => s.openSelect);
  const { data: refData } = useReferenceData();

  const observedActivities = refData?.observedActivities ?? [];

  const selectedActivity = observedActivities.find(
    (a) => a.id === store.observedActivity,
  );

  const handleSelectActivity = () => {
    if (!observedActivities.length) {
      Toast.show({
        type: "error",
        text1: "Aucune activité",
        text2: "La liste des activités observées est indisponible.",
      });
      return;
    }
    openSelect({
      title: "Activité observée",
      options: observedActivities.map((a) => ({
        id: String(a.id),
        label: a.designation,
      })),
      selectedId:
        store.observedActivity != null
          ? String(store.observedActivity)
          : undefined,
      onSelect: (id) => store.setObservedActivity(Number(id)),
    });
  };

  const handleNext = () => {
    if (store.observedActivity == null) {
      Toast.show({
        type: "error",
        text1: "Activité requise",
        text2: "Sélectionnez l'activité observée.",
      });
      return;
    }
    router.navigate("/rvt/create/marche");
  };

  if (!canCreate) {
    return (
      <View style={styles.lockScreen}>
        <FontAwesome5 name="lock" size={34} color="#bbb" />
        <Text style={styles.lockText}>Accès refusé.</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SectionCard title="Activité observée" icon="industry">
          <RvtSelectorField
            label="Activité du site"
            value={selectedActivity?.designation}
            placeholder="Sélectionner"
            onPress={handleSelectActivity}
            required
          />
        </SectionCard>
      </ScrollView>

      <View style={styles.footer}>
        <RvtFooterButton label="Suivant" onPress={handleNext} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  screen: {
    flex: 1,
    paddingHorizontal: 14,
    backgroundColor: "#f7f8fa",
    paddingTop: 6,
  },
  scrollContent: {
    paddingBottom: 14,
    gap: 12,
  },
  lockScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f7f8fa",
  },
  lockText: {
    marginTop: 12,
    color: "#666",
    fontSize: 14,
  },
  footer: {
    paddingBottom: 14,
  },
});
