import {
  updateDemandeTransfert,
  listDemandeTransfert,
} from "@/api/demande-transfert.api";
import { Button } from "@/components/ui/button";
import { hasDemandeTransfertPermission } from "@/constants/permissions";
import { PRIMARY } from "@/constants/theme";
import { useSession } from "@/stores/auth.store";
import { FontAwesome5 } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) => (
  <View style={styles.fieldWrap}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#bbb"
      multiline={multiline}
      textAlignVertical={multiline ? "top" : "center"}
      style={[styles.input, multiline && styles.inputMultiline]}
    />
  </View>
);

export const EditDemandeTransfertScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const canUpdate = hasDemandeTransfertPermission(user, "UPDATE");
  const { demandeTransfertId } = useLocalSearchParams<{
    demandeTransfertId: string;
  }>();

  const { data: listData } = useQuery({
    queryKey: ["demande-transferts", "list"],
    queryFn: () => listDemandeTransfert({ page: 1 }),
    enabled: Boolean(demandeTransfertId),
  });

  const transfertItem = useMemo(() => {
    if (!listData?.data) return null;
    return (
      listData.data.find(
        (item) => String(item.id) === String(demandeTransfertId),
      ) ?? null
    );
  }, [listData, demandeTransfertId]);

  const [transporteur, setTransporteur] = useState(
    transfertItem?.transporteur ?? "",
  );
  const [matricule, setMatricule] = useState(transfertItem?.matricule ?? "");
  const [observation, setObservation] = useState(
    transfertItem?.observation ?? "",
  );

  const { mutate, isPending } = useMutation({
    mutationFn: updateDemandeTransfert,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["demande-transferts"],
      });
      Toast.show({
        type: "success",
        text1: "Demande modifiée",
        text2: "La demande de transfert a été mise à jour avec succès.",
      });
      router.back();
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Échec de modification",
        text2:
          error.message || "Impossible de modifier la demande de transfert.",
      });
    },
  });

  const handleSubmit = () => {
    if (!canUpdate) {
      Toast.show({
        type: "error",
        text1: "Accès refusé",
        text2:
          "Vous n'avez pas la permission de modifier une demande de transfert.",
      });
      return;
    }

    if (!transfertItem) return;

    mutate({
      id: Number(demandeTransfertId),
      statut: transfertItem.statut,
      transporteur: transporteur.trim(),
      observation: observation.trim(),
      matricule: matricule.trim(),
    });
  };

  if (!canUpdate) {
    return (
      <View style={styles.centered}>
        <Text style={styles.infoText}>
          Vous n'avez pas la permission de modifier une demande de transfert.
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
            <FontAwesome5 name="edit" size={14} color={PRIMARY} />
            <Text style={styles.sectionTitle}>
              Modifier {transfertItem?.reference ?? ""}
            </Text>
          </View>

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
            placeholder="Observation"
            multiline
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          preset="filled"
          text="Modifier la demande"
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
