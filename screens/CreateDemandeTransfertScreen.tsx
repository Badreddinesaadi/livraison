import {
  createDemandeTransfert,
  CreateDemandeTransfertRequest,
} from "@/api/demande-transfert.api";
import { ListDepots } from "@/api/depots.api";
import { Button } from "@/components/ui/button";
import { hasDemandeTransfertPermission } from "@/constants/permissions";
import { PRIMARY } from "@/constants/theme";
import { useSession } from "@/stores/auth.store";
import { useDemandeTransfertSheetStore } from "@/stores/demande-transfert.store";
import { Depot } from "@/types/user.types";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

const SelectorField = ({
  label,
  value,
  onPress,
  disabled,
}: {
  label: string;
  value: string;
  onPress: () => void;
  disabled?: boolean;
}) => (
  <View style={styles.fieldWrap}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.fieldButton, disabled && { opacity: 0.5 }]}
    >
      <Text style={styles.fieldValue}>{value}</Text>
      <MaterialIcons name="keyboard-arrow-down" size={22} color="#666" />
    </Pressable>
  </View>
);

const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric" | "phone-pad" | "decimal-pad";
  multiline?: boolean;
}) => (
  <View style={styles.fieldWrap}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#bbb"
      keyboardType={keyboardType}
      multiline={multiline}
      textAlignVertical={multiline ? "top" : "center"}
      style={[styles.input, multiline && styles.inputMultiline]}
    />
  </View>
);

export const CreateDemandeTransfertScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const canCreate = hasDemandeTransfertPermission(user, "CREATE");
  const openSelectorOptionsSheet = useDemandeTransfertSheetStore(
    (s) => s.openSelectorOptions,
  );

  const [idDepotSource, setIdDepotSource] = useState<number | null>(null);
  const [idDepotDestination, setIdDepotDestination] = useState<number | null>(
    null,
  );
  const [dum, setDum] = useState("");
  const [transporteur, setTransporteur] = useState("");
  const [matricule, setMatricule] = useState("");
  const [observation, setObservation] = useState("");

  const { data: depots } = useQuery({
    queryKey: ["depots", "list"],
    queryFn: ListDepots,
  });

  const depotOptions = useMemo(() => {
    if (!depots) return [];
    return depots.map((depot: Depot) => ({
      id: depot.id,
      label: depot.nom,
      subLabel: depot.code,
    }));
  }, [depots]);

  const selectedDepotSourceLabel = useMemo(() => {
    if (idDepotSource === null) return "Sélectionner un dépôt";
    const found = depots?.find((d) => d.id === idDepotSource);
    return found ? `${found.nom} (${found.code})` : `Dépôt #${idDepotSource}`;
  }, [depots, idDepotSource]);

  const selectedDepotDestinationLabel = useMemo(() => {
    if (idDepotDestination === null) return "Sélectionner un dépôt";
    const found = depots?.find((d) => d.id === idDepotDestination);
    return found
      ? `${found.nom} (${found.code})`
      : `Dépôt #${idDepotDestination}`;
  }, [depots, idDepotDestination]);

  const handleSelectDepotSource = () => {
    openSelectorOptionsSheet({
      title: "Dépôt source",
      options: depotOptions,
      selectedId: idDepotSource ?? undefined,
      onSelect: (id) => setIdDepotSource(id),
    });
  };

  const handleSelectDepotDestination = () => {
    openSelectorOptionsSheet({
      title: "Dépôt destination",
      options: depotOptions,
      selectedId: idDepotDestination ?? undefined,
      onSelect: (id) => setIdDepotDestination(id),
    });
  };

  const { mutate, isPending } = useMutation({
    mutationFn: createDemandeTransfert,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["demande-transferts"],
      });
      Toast.show({
        type: "success",
        text1: "Demande créée",
        text2: "La demande de transfert a été créée avec succès.",
      });
      router.back();
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Échec de création",
        text2: error.message || "Impossible de créer la demande de transfert.",
      });
    },
  });

  const handleSubmit = () => {
    if (!canCreate) {
      Toast.show({
        type: "error",
        text1: "Accès refusé",
        text2: "Vous n'avez pas la permission de créer une demande de transfert.",
      });
      return;
    }

    if (idDepotSource === null) {
      Toast.show({
        type: "error",
        text1: "Dépôt source requis",
        text2: "Veuillez sélectionner un dépôt source.",
      });
      return;
    }

    if (idDepotDestination === null) {
      Toast.show({
        type: "error",
        text1: "Dépôt destination requis",
        text2: "Veuillez sélectionner un dépôt de destination.",
      });
      return;
    }

    if (!dum.trim()) {
      Toast.show({
        type: "error",
        text1: "DUM requis",
        text2: "Veuillez saisir un DUM.",
      });
      return;
    }

    if (!transporteur.trim()) {
      Toast.show({
        type: "error",
        text1: "Transporteur requis",
        text2: "Veuillez saisir un transporteur.",
      });
      return;
    }

    if (!matricule.trim()) {
      Toast.show({
        type: "error",
        text1: "Matricule requis",
        text2: "Veuillez saisir un matricule.",
      });
      return;
    }

    const payload: CreateDemandeTransfertRequest = {
      idDepotSource,
      idDepotDestination,
      dum: dum.trim(),
      transporteur: transporteur.trim(),
      matricule: matricule.trim(),
      observation: observation.trim() || undefined,
    };

    mutate(payload);
  };

  if (!canCreate) {
    return (
      <View style={styles.centered}>
        <Text style={styles.infoText}>
          Vous n'avez pas la permission de créer une demande de transfert.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <FontAwesome5 name="exchange-alt" size={14} color={PRIMARY} />
            <Text style={styles.sectionTitle}>Demande de transfert</Text>
          </View>

          <SelectorField
            label="Dépôt source"
            value={selectedDepotSourceLabel}
            onPress={handleSelectDepotSource}
          />

          <SelectorField
            label="Dépôt destination"
            value={selectedDepotDestinationLabel}
            onPress={handleSelectDepotDestination}
          />

          <InputField
            label="DUM"
            value={dum}
            onChangeText={setDum}
            placeholder="Numéro DUM"
          />

          <InputField
            label="Transporteur"
            value={transporteur}
            onChangeText={setTransporteur}
            placeholder="Nom du transporteur"
          />

          <InputField
            label="Matricule"
            value={matricule}
            onChangeText={setMatricule}
            placeholder="Numéro de matricule"
          />

          <InputField
            label="Observation"
            value={observation}
            onChangeText={setObservation}
            placeholder="Observation (optionnel)"
            multiline
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          preset="filled"
          text="Créer la demande"
          isLoading={isPending}
          onPress={handleSubmit}
        />
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 6,
    paddingBottom: 14,
    gap: 12,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "#f7f8fa",
  },
  infoText: {
    color: "#666",
    fontSize: 14,
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
  fieldWrap: {
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  fieldButton: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#e8e8e8",
    borderRadius: 10,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fieldValue: {
    fontSize: 14,
    color: "#11181C",
    flex: 1,
    marginRight: 8,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#e8e8e8",
    borderRadius: 10,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#11181C",
  },
  inputMultiline: {
    minHeight: 90,
    paddingVertical: 10,
  },
  footer: {
    marginBottom: 10,
    marginTop: 8,
  },
});
