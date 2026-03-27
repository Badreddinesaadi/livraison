import {
  createReturn,
  OUINon,
  Reclamation,
  UploadReturnPhoto,
} from "@/api/return.api";
import { ListClients } from "@/api/users.api";
import { Button } from "@/components/ui/button";
import { PRIMARY } from "@/constants/theme";
import { useSession } from "@/stores/auth.store";
import { useCloseBLStore } from "@/stores/close-bl.store";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

const reclamationOptions: { id: number; label: string; value: Reclamation }[] =
  [
    { id: 0, label: "Aucune", value: null },
    { id: 1, label: "Prix incorrect", value: "Prix incorrect" },
    { id: 2, label: "Qte incorrecte", value: "Qte incorrecte" },
    { id: 3, label: "Mauvaise qualité", value: "Mauvaise qualité" },
    { id: 4, label: "Retard de livraison", value: "Retard de livraison" },
  ];

const ouiNonOptions = [
  { id: 1, label: "Oui", value: "oui" as const },
  { id: 0, label: "Non", value: "non" as const },
];

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

export const CreateReturnScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const openSelectorOptionsSheet = useCloseBLStore(
    (s) => s.openSelectorOptions,
  );

  const { data: clientsList } = useQuery({
    queryKey: ["clients", "full-list"],
    queryFn: ListClients,
  });

  const [clientId, setClientId] = useState<number | undefined>(undefined);
  const [blCachetet, setBlCachetet] = useState<OUINon>("non");
  const [reglement, setReglement] = useState<OUINon>("non");
  const [retourMse, setRetourMse] = useState<OUINon>("non");
  const [reclamation, setReclamation] = useState<Reclamation | null>(null);
  const [photos, setPhotos] = useState<UploadReturnPhoto[]>([]);
  const [isPhotoCooldown, setIsPhotoCooldown] = useState(false);
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const hasCameraPermission = permission?.granted === true;

  const selectedClient = clientsList?.find((item) => item.id === clientId);

  const { mutate: createReturnMutate, isPending } = useMutation({
    mutationFn: createReturn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["returns"] });
      Toast.show({
        type: "success",
        text1: "Retour créé",
        text2: "Le retour a été envoyé avec succès.",
      });
      router.back();
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Échec de création",
        text2: error.message || "Impossible de créer ce retour.",
      });
    },
  });

  const takePhoto = async () => {
    if (!hasCameraPermission) {
      const cameraPermission = await requestPermission();
      if (!cameraPermission.granted) {
        Toast.show({
          type: "error",
          text1: "Caméra non autorisée",
          text2:
            "Vous pouvez continuer en choisissant des photos depuis la galerie.",
        });
        return;
      }
    }

    if (!isCameraVisible) {
      setIsCameraVisible(true);
      return;
    }

    if (photos.length >= 10) {
      Toast.show({
        type: "error",
        text1: "Limite atteinte",
        text2: "Vous ne pouvez pas ajouter plus de 10 photos.",
      });
      return;
    }

    const picture = await cameraRef.current?.takePictureAsync({ quality: 0.7 });
    if (picture?.uri) {
      const photo: UploadReturnPhoto = {
        uri: picture.uri,
        name: `return-${Date.now()}.jpg`,
        type: "image/jpeg",
      };
      setPhotos((prev) => [...prev, photo]);
      setIsPhotoCooldown(true);
      setTimeout(() => setIsPhotoCooldown(false), 800);
    }
  };

  const pickFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Toast.show({
        type: "error",
        text1: "Accès galerie refusé",
        text2:
          "Veuillez autoriser l'accès à la galerie pour joindre des photos.",
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
      selectionLimit: 0,
    });

    if (result.canceled || result.assets.length === 0) {
      return;
    }

    const pickedPhotos: UploadReturnPhoto[] = result.assets.map(
      (asset, index) => ({
        uri: asset.uri,
        name: asset.fileName ?? `return-gallery-${Date.now()}-${index}.jpg`,
        type: asset.mimeType ?? "image/jpeg",
      }),
    );

    setPhotos((prev) => [...prev, ...pickedPhotos]);
    setIsPhotoCooldown(true);
    setTimeout(() => setIsPhotoCooldown(false), 800);
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const openYesNoSelector = (
    title: string,
    selectedValue: OUINon,
    onSelectValue: (v: OUINon) => void,
  ) => {
    openSelectorOptionsSheet({
      title,
      options: ouiNonOptions.map((item) => ({
        id: item.id,
        label: item.label,
      })),
      selectedId: selectedValue === "oui" ? 1 : 0,
      onSelect: (id) => onSelectValue(id === 1 ? "oui" : "non"),
    });
  };

  const submit = () => {
    if (user?.role !== "chauffeur") {
      Toast.show({
        type: "error",
        text1: "Accès refusé",
        text2: "Seuls les chauffeurs peuvent créer un retour.",
      });
      return;
    }

    if (!clientId) {
      Toast.show({
        type: "error",
        text1: "Client requis",
        text2: "Veuillez sélectionner un client.",
      });
      return;
    }

    if (photos.length === 0) {
      Toast.show({
        type: "error",
        text1: "Photo requise",
        text2: "Veuillez prendre au moins une photo.",
      });
      return;
    }

    if (retourMse === "oui" && !reclamation) {
      Toast.show({
        type: "error",
        text1: "Réclamation requise",
        text2: "Veuillez sélectionner un motif de réclamation.",
      });
      return;
    }
    const requestData = {
      Bl_cachetet: blCachetet,
      reglement,
      retour_Mse: retourMse,
      client_id: String(clientId),
      images: photos,
    };
    if (reclamation) {
      //@ts-expect-error
      requestData["reclamation"] = reclamation;
    }
    createReturnMutate(requestData);
  };

  if (!permission) {
    return (
      <View style={styles.centered}>
        <Text style={styles.infoText}>
          Vérification de la permission caméra...
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
            <FontAwesome5 name="clipboard-list" size={14} color={PRIMARY} />
            <Text style={styles.sectionTitle}>Informations du retour</Text>
          </View>

          <SelectorField
            label="Client"
            value={selectedClient?.societe || "Sélectionner un client"}
            onPress={() => {
              openSelectorOptionsSheet({
                title: "Sélectionner un client",
                options: [
                  ...(clientsList ?? []).map((item) => ({
                    id: item.id,
                    label: item.societe,
                    subLabel: item.ville,
                  })),
                ],
                selectedId: clientId,
                enableSearch: true,
                searchPlaceholder: "Rechercher un client",
                onSelect: (id) => setClientId(id),
              });
            }}
          />

          <SelectorField
            label="BL cacheté"
            value={blCachetet === "oui" ? "Oui" : "Non"}
            onPress={() =>
              openYesNoSelector("BL cacheté", blCachetet, setBlCachetet)
            }
          />

          <SelectorField
            label="Règlement"
            value={reglement === "oui" ? "Oui" : "Non"}
            onPress={() =>
              openYesNoSelector("Règlement", reglement, setReglement)
            }
          />

          <SelectorField
            label="Retour MSE"
            value={retourMse === "oui" ? "Oui" : "Non"}
            onPress={() =>
              openYesNoSelector("Retour MSE", retourMse, (value) => {
                setRetourMse(value);
                if (value === "non") {
                  setReclamation(null);
                }
              })
            }
          />

          <SelectorField
            label="Réclamation"
            value={
              reclamation
                ? reclamation
                : retourMse === "oui"
                  ? "Sélectionner une réclamation"
                  : "Aucune"
            }
            onPress={() => {
              openSelectorOptionsSheet({
                title: "Motif de réclamation",
                options: reclamationOptions.map((item) => ({
                  id: item.id,
                  label: item.label,
                })),
                selectedId: reclamationOptions.find(
                  (i) => i.value === reclamation,
                )?.id,
                onSelect: (id) => {
                  const selected = reclamationOptions.find((i) => i.id === id);
                  if (selected) {
                    setReclamation(selected?.value);
                  }
                },
              });
            }}
          />
        </View>

        <View style={styles.cameraCard}>
          <View style={styles.sectionHeader}>
            <FontAwesome5 name="camera" size={14} color={PRIMARY} />
            <Text style={styles.sectionTitle}>Photos du retour</Text>
          </View>

          <View style={styles.cameraContainer}>
            {isCameraVisible && hasCameraPermission ? (
              <CameraView ref={cameraRef} style={styles.camera} facing="back" />
            ) : (
              <View style={styles.cameraPlaceholder}>
                <FontAwesome5 name="camera" size={26} color="#777" />
                <Text style={styles.cameraPlaceholderText}>
                  {hasCameraPermission
                    ? "Caméra masquée"
                    : "Caméra non autorisée (galerie disponible)"}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.actionRow}>
            <View style={styles.actionButtonWrap}>
              <Button
                preset="default"
                text={
                  isCameraVisible
                    ? `Prendre une photo (${photos.length})`
                    : "Prendre une photo"
                }
                onPress={takePhoto}
              />
            </View>
            <View style={styles.actionButtonWrap}>
              <Button
                preset="default"
                textStyle={{ fontSize: 13 }}
                text="Choisir depuis l'appareil"
                onPress={pickFromLibrary}
              />
            </View>
          </View>

          <FlatList
            data={photos}
            horizontal
            keyExtractor={(item, index) => `${item.uri}-${index}`}
            contentContainerStyle={styles.previewList}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <View style={styles.previewItemWrap}>
                <Image source={{ uri: item.uri }} style={styles.previewImage} />
                <Pressable
                  onPress={() => removePhoto(index)}
                  style={styles.deleteBadge}
                >
                  <Text style={styles.deleteBadgeText}>x</Text>
                </Pressable>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyPreviewText}>Aucune photo capturée</Text>
            }
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          preset="filled"
          text="Créer le retour"
          disabled={isPhotoCooldown || user?.role !== "chauffeur"}
          isLoading={isPending || isPhotoCooldown}
          onPress={submit}
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
  centeredCard: {
    marginTop: 24,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#efefef",
    padding: 14,
  },
  infoText: {
    color: "#666",
    fontSize: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#11181C",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: "#666",
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
  cameraCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#efefef",
    padding: 12,
    marginBottom: 4,
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
  cameraContainer: {
    height: 260,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#ddd",
  },
  camera: {
    width: "100%",
    height: "100%",
  },
  cameraPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    rowGap: 8,
    backgroundColor: "#f1f2f4",
  },
  cameraPlaceholderText: {
    color: "#777",
    fontSize: 13,
    fontWeight: "600",
  },
  actionRow: {
    flexDirection: "row",
    columnGap: 8,
    marginTop: 10,
    marginBottom: 2,
  },
  actionButtonWrap: {
    flex: 1,
  },
  previewList: {
    paddingVertical: 8,
    gap: 10,
  },
  previewItemWrap: {
    width: 90,
    height: 90,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#e5e5e5",
    marginRight: 10,
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  deleteBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBadgeText: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 18,
    fontWeight: "700",
  },
  emptyPreviewText: {
    color: "#777",
    fontSize: 13,
    paddingVertical: 6,
  },
  footer: {
    marginBottom: 10,
    marginTop: 8,
  },
});
