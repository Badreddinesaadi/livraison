import {
  createProjetLocation,
  getProjetLocationById,
  Projet,
  updateProjetLocation,
  UploadProjetLocationFile,
} from "@/api/projet-location.api";
import { Button } from "@/components/ui/button";
import { hasProjetPermission } from "@/constants/permissions";
import { apiUrl } from "@/constants/query";
import { PRIMARY } from "@/constants/theme";
import { useSession } from "@/stores/auth.store";
import { useProjetLocationSheetStore } from "@/stores/projet-location.store";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as DocumentPicker from "expo-document-picker";
import { Image } from "expo-image";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

type ParsedLocation = {
  x: number;
  y: number;
};

const parseLocation = (value?: string | null): ParsedLocation | null => {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value);
    if (
      typeof parsed?.x === "number" &&
      Number.isFinite(parsed.x) &&
      typeof parsed?.y === "number" &&
      Number.isFinite(parsed.y)
    ) {
      return { x: parsed.x, y: parsed.y };
    }
  } catch {
    return null;
  }

  return null;
};

const projetOptions: { id: number; label: string; value: Projet }[] = [
  { id: 1, label: "Chantier", value: "chantier" },
  { id: 2, label: "Depot", value: "depot" },
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
const buildFileUrl = (cheminFichier?: string) => {
  if (!cheminFichier) {
    return null;
  }

  return `${apiUrl}/sdkboard/${cheminFichier}`;
};

export const CreateProjetLocationScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const { projetId } = useLocalSearchParams<{ projetId?: string }>();
  const isEditing = Boolean(projetId);
  const canCreateProjetLocation = hasProjetPermission(user, "CREATE");
  const canUpdateProjetLocation = hasProjetPermission(user, "UPDATE");
  const canEditProjetLocation = isEditing
    ? canUpdateProjetLocation
    : canCreateProjetLocation;
  const actionType = isEditing ? "update" : "create";
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const openSelectorOptionsSheet = useProjetLocationSheetStore(
    (s) => s.openSelectorOptions,
  );

  const [projet, setProjet] = useState<Projet | null>(null);
  const [contactNom, setContactNom] = useState("");
  const [contactTelephone, setContactTelephone] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [coordX, setCoordX] = useState("");
  const [coordY, setCoordY] = useState("");
  const [files, setFiles] = useState<UploadProjetLocationFile[]>([]);
  const [isFileCooldown, setIsFileCooldown] = useState(false);
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const hasCameraPermission = permission?.granted === true;

  const { data: existingData, isLoading: isLoadingExisting } = useQuery({
    queryKey: ["projet-locations", "details", projetId],
    queryFn: () => getProjetLocationById({ id: String(projetId) }),
    enabled: Boolean(projetId) && canUpdateProjetLocation,
  });

  useEffect(() => {
    if (!isEditing || !existingData || isPrefilled) {
      return;
    }

    setProjet(existingData.projet);
    setContactNom(existingData.contact_nom || "");
    setContactTelephone(existingData.contact_telephone || "");
    setCommentaire(existingData.commentaire || "");

    const location = parseLocation(existingData.localisation);
    if (location) {
      setCoordX(String(location.x));
      setCoordY(String(location.y));
    }

    setIsPrefilled(true);
  }, [existingData, isEditing, isPrefilled]);

  const existingImages = useMemo(() => {
    if (!existingData?.images?.length) {
      return [];
    }

    return existingData.images
      .map((img) => ({
        id: img.id,
        uri: buildFileUrl(img.chemin_fichier),
      }))
      .filter((img) => Boolean(img.uri)) as { id: string; uri: string }[];
  }, [existingData?.images]);

  const { mutate: createProjetLocationMutate, isPending: isCreating } =
    useMutation({
      mutationFn: createProjetLocation,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["projet-locations"] });
        Toast.show({
          type: "success",
          text1: "Lieu cree",
          text2: "Le lieu a ete cree avec succes.",
        });
        router.back();
      },
      onError: (error) => {
        Toast.show({
          type: "error",
          text1: "Echec de creation",
          text2: error.message || "Impossible de creer ce lieu.",
        });
      },
    });

  const { mutate: updateProjetLocationMutate, isPending: isUpdating } =
    useMutation({
      mutationFn: updateProjetLocation,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["projet-locations"] });
        Toast.show({
          type: "success",
          text1: "Lieu mis a jour",
          text2: "Le lieu a ete mis a jour avec succes.",
        });
        router.back();
      },
      onError: (error) => {
        Toast.show({
          type: "error",
          text1: "Mise a jour impossible",
          text2: error.message || "Impossible de mettre a jour ce lieu.",
        });
      },
    });

  const takePhoto = async () => {
    if (!hasCameraPermission) {
      const cameraPermission = await requestPermission();
      if (!cameraPermission.granted) {
        Toast.show({
          type: "error",
          text1: "Camera non autorisee",
          text2: "Vous pouvez choisir des photos depuis l'appareil.",
        });
        return;
      }
    }

    if (!isCameraVisible) {
      setIsCameraVisible(true);
      return;
    }

    if (files.length >= 10) {
      Toast.show({
        type: "error",
        text1: "Limite atteinte",
        text2: "Vous ne pouvez pas ajouter plus de 10 fichiers.",
      });
      return;
    }

    const picture = await cameraRef.current?.takePictureAsync({ quality: 0.7 });
    if (picture?.uri) {
      const photo: UploadProjetLocationFile = {
        uri: picture.uri,
        name: `projet-${Date.now()}.jpg`,
        type: "image/jpeg",
      };
      setFiles((prev) => [...prev, photo]);
      setIsFileCooldown(true);
      setTimeout(() => setIsFileCooldown(false), 800);
    }
  };

  const pickFromDeviceStorage = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "image/*",
      multiple: true,
      copyToCacheDirectory: true,
    });

    if (result.canceled || result.assets.length === 0) {
      return;
    }

    const remainingSlots = Math.max(0, 10 - files.length);
    if (remainingSlots === 0) {
      Toast.show({
        type: "error",
        text1: "Limite atteinte",
        text2: "Vous ne pouvez pas ajouter plus de 10 fichiers.",
      });
      return;
    }

    const selectedFiles = result.assets
      .slice(0, remainingSlots)
      .map((asset) => ({
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType ?? "image/jpeg",
      }));

    if (result.assets.length > remainingSlots) {
      Toast.show({
        type: "info",
        text1: "Fichiers limites",
        text2: `Seuls ${remainingSlots} fichiers ont ete ajoutes.`,
      });
    }

    setFiles((prev) => [...prev, ...selectedFiles]);
    setIsFileCooldown(true);
    setTimeout(() => setIsFileCooldown(false), 800);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const captureCurrentLocation = async () => {
    if (isCapturingLocation) {
      return null;
    }

    setIsCapturingLocation(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Toast.show({
          type: "error",
          text1: "Localisation requise",
          text2: "Veuillez autoriser la localisation.",
        });
        return null;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = position.coords;
      return { x: longitude, y: latitude };
    } catch {
      Toast.show({
        type: "error",
        text1: "Position indisponible",
        text2: "Impossible de recuperer votre position.",
      });
      return null;
    } finally {
      setIsCapturingLocation(false);
    }
  };

  const handleCaptureLocation = async () => {
    const coordinates = await captureCurrentLocation();
    if (!coordinates) {
      return;
    }
    Toast.show({
      type: "success",
      text1: "Position capturee",
      text2: "Votre position a été capturee avec succes.",
    });
    setCoordX(String(coordinates.x));
    setCoordY(String(coordinates.y));
  };

  const handleSelectProjet = () => {
    openSelectorOptionsSheet({
      title: "Type de projet",
      options: projetOptions.map((option) => ({
        id: option.id,
        label: option.label,
      })),
      selectedId: projetOptions.find((option) => option.value === projet)?.id,
      onSelect: (id) => {
        const selected = projetOptions.find((option) => option.id === id);
        if (selected) {
          setProjet(selected.value);
        }
      },
    });
  };

  const handleSubmit = async () => {
    if (!canEditProjetLocation) {
      Toast.show({
        type: "error",
        text1: "Acces refuse",
        text2: isEditing
          ? "Vous n'avez pas la permission de modifier un lieu."
          : "Vous n'avez pas la permission de creer un lieu.",
      });
      return;
    }

    if (!projet) {
      Toast.show({
        type: "error",
        text1: "Type requis",
        text2: "Veuillez selectionner un type de projet.",
      });
      return;
    }

    let coordinates: ParsedLocation | null = null;

    if (isEditing) {
      const parsedX = Number(coordX.replace(",", "."));
      const parsedY = Number(coordY.replace(",", "."));

      if (!Number.isFinite(parsedX) || !Number.isFinite(parsedY)) {
        Toast.show({
          type: "error",
          text1: "Coordonnees requises",
          text2: "Veuillez saisir des coordonnees valides.",
        });
        return;
      }

      coordinates = { x: parsedX, y: parsedY };
    } else {
      coordinates = await captureCurrentLocation();
      if (!coordinates) {
        return;
      }

      setCoordX(String(coordinates.x));
      setCoordY(String(coordinates.y));
    }

    const basePayload = {
      projet,
      localisation: { x: coordinates.x, y: coordinates.y },
      commentaire: commentaire.trim() || undefined,
      contact_nom: contactNom.trim() || undefined,
      contact_telephone: contactTelephone.trim() || undefined,
    };

    if (isEditing && projetId) {
      updateProjetLocationMutate({
        id: Number(projetId),
        ...basePayload,
      });
      return;
    }

    createProjetLocationMutate({
      ...basePayload,
      files,
    });
  };

  if (!canEditProjetLocation) {
    return (
      <View style={styles.centered}>
        <Text style={styles.infoText}>
          {isEditing
            ? "Vous n'avez pas la permission de modifier un lieu."
            : "Vous n'avez pas la permission de creer un lieu."}
        </Text>
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={styles.centered}>
        <Text style={styles.infoText}>
          Verification de la permission camera...
        </Text>
      </View>
    );
  }

  if (isEditing && isLoadingExisting) {
    return (
      <View style={styles.centered}>
        <Text style={styles.infoText}>Chargement du lieu...</Text>
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
            <FontAwesome5 name="map-marked-alt" size={14} color={PRIMARY} />
            <Text style={styles.sectionTitle}>Informations du lieu</Text>
          </View>

          <SelectorField
            label="Type de projet"
            value={
              projetOptions.find((option) => option.value === projet)?.label ||
              "Selectionner un type"
            }
            onPress={handleSelectProjet}
          />

          <InputField
            label="Contact"
            value={contactNom}
            onChangeText={setContactNom}
            placeholder="Nom du contact"
          />

          <InputField
            label="Telephone"
            value={contactTelephone}
            onChangeText={setContactTelephone}
            placeholder="Numero de telephone"
            keyboardType="phone-pad"
          />

          <InputField
            label="Commentaire"
            value={commentaire}
            onChangeText={setCommentaire}
            placeholder="Commentaire"
            multiline
          />

          {actionType === "update" && (
            <Button
              preset="default"
              text={
                isCapturingLocation
                  ? "Recuperation en cours..."
                  : "Recapturer ma position"
              }
              onPress={handleCaptureLocation}
              isLoading={isCapturingLocation}
            />
          )}
        </View>

        {isEditing ? (
          <View style={styles.cameraCard}>
            <View style={styles.sectionHeader}>
              <FontAwesome5 name="images" size={14} color={PRIMARY} />
              <Text style={styles.sectionTitle}>Images existantes</Text>
            </View>

            {existingImages.length > 0 ? (
              <FlatList
                data={existingImages}
                horizontal
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.previewList}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <Image
                    source={{ uri: item.uri }}
                    style={styles.previewEditImage}
                  />
                )}
              />
            ) : (
              <Text style={styles.emptyPreviewText}>Aucune image</Text>
            )}
          </View>
        ) : (
          <View style={styles.cameraCard}>
            <View style={styles.sectionHeader}>
              <FontAwesome5 name="camera" size={14} color={PRIMARY} />
              <Text style={styles.sectionTitle}>Fichiers du lieu</Text>
            </View>

            <View style={styles.cameraContainer}>
              {isCameraVisible && hasCameraPermission ? (
                <CameraView
                  ref={cameraRef}
                  style={styles.camera}
                  facing="back"
                />
              ) : (
                <View style={styles.cameraPlaceholder}>
                  <FontAwesome5 name="camera" size={26} color="#777" />
                  <Text style={styles.cameraPlaceholderText}>
                    {hasCameraPermission
                      ? "Camera masquee"
                      : "Camera non autorisee (fichiers depuis l'appareil)"}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.actionRow}>
              <View style={styles.actionButtonWrap}>
                <Button
                  preset="default"
                  textStyle={{ fontSize: 13 }}
                  text={
                    isCameraVisible
                      ? `Prendre une photo (${files.length})`
                      : "Prendre une photo"
                  }
                  onPress={takePhoto}
                />
              </View>
              <View style={styles.actionButtonWrap}>
                <Button
                  preset="default"
                  textStyle={{ fontSize: 13 }}
                  text="Choisir des photos"
                  onPress={pickFromDeviceStorage}
                />
              </View>
            </View>

            <FlatList
              data={files}
              horizontal
              keyExtractor={(item, index) =>
                `${item.uri}-${item.name}-${index}`
              }
              contentContainerStyle={styles.previewList}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item, index }) => (
                <View style={styles.previewItemWrap}>
                  <Image
                    source={{ uri: item.uri }}
                    style={styles.previewImage}
                  />
                  <Pressable
                    onPress={() => removeFile(index)}
                    style={styles.deleteBadge}
                  >
                    <Text style={styles.deleteBadgeText}>x</Text>
                  </Pressable>
                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyPreviewText}>
                  Aucun fichier selectionne
                </Text>
              }
            />
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          preset="filled"
          text={isEditing ? "Mettre a jour" : "Creer le lieu"}
          disabled={isFileCooldown || isCapturingLocation}
          isLoading={
            isCreating || isUpdating || isFileCooldown || isCapturingLocation
          }
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
  coordRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  coordField: {
    flex: 1,
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
    width: 108,
    height: 90,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#e5e5e5",
    marginRight: 10,
  },
  previewImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    marginRight: 10,
  },
  previewEditImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 10,
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
