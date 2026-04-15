import {
  createQualityReport,
  UploadQualityReportFile,
} from "@/api/quality-report.api";
import { Button } from "@/components/ui/button";
import { hasRapportQualitePermission } from "@/constants/permissions";
import { PRIMARY } from "@/constants/theme";
import { useSession } from "@/stores/auth.store";
import { FontAwesome5 } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as DocumentPicker from "expo-document-picker";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
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

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024;

export const CreateQualityReportScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const canCreateQualityReport = hasRapportQualitePermission(user, "CREATE");
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const [dum, setDum] = useState("");
  const [dossier, setDossier] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [files, setFiles] = useState<UploadQualityReportFile[]>([]);
  const [isFileCooldown, setIsFileCooldown] = useState(false);
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const hasCameraPermission = permission?.granted === true;

  const { mutate: createQualityReportMutate, isPending } = useMutation({
    mutationFn: createQualityReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quality-reports"] });
      Toast.show({
        type: "success",
        text1: "Rapport créé",
        text2: "Le rapport qualité a été envoyé avec succès.",
      });
      router.back();
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Échec de création",
        text2: error.message || "Impossible de créer ce rapport.",
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
            "Vous pouvez continuer en choisissant des fichiers depuis l'appareil.",
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
      const photo: UploadQualityReportFile = {
        uri: picture.uri,
        name: `quality-${Date.now()}.jpg`,
        type: "image/jpeg",
      };
      setFiles((prev) => [...prev, photo]);
      setIsFileCooldown(true);
      setTimeout(() => setIsFileCooldown(false), 800);
    }
  };

  const pickFromDeviceStorage = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
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

    const oversizedFileNames: string[] = [];
    const selectedFiles = result.assets
      .slice(0, remainingSlots)
      .reduce((acc, asset) => {
        if (
          typeof asset.size === "number" &&
          asset.size > MAX_FILE_SIZE_BYTES
        ) {
          oversizedFileNames.push(asset.name);
          return acc;
        }

        acc.push({
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType ?? "application/octet-stream",
        });

        return acc;
      }, [] as UploadQualityReportFile[]);

    if (result.assets.length > remainingSlots) {
      Toast.show({
        type: "info",
        text1: "Fichiers limités",
        text2: `Seuls ${remainingSlots} fichiers ont été pris en compte.`,
      });
    }

    if (oversizedFileNames.length > 0) {
      Toast.show({
        type: "error",
        text1: "Fichiers trop volumineux",
        text2: `${oversizedFileNames.length} fichier(s) dépasse(nt) 15 Mo.`,
      });
    }

    if (selectedFiles.length === 0) {
      return;
    }

    setFiles((prev) => [...prev, ...selectedFiles]);
    setIsFileCooldown(true);
    setTimeout(() => setIsFileCooldown(false), 800);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const submit = () => {
    if (!canCreateQualityReport) {
      Toast.show({
        type: "error",
        text1: "Accès refusé",
        text2: "Vous n'avez pas la permission de créer un rapport qualité.",
      });
      return;
    }

    const trimmedDum = dum.trim();
    const trimmedDossier = dossier.trim();
    const trimmedCommentaire = commentaire.trim();

    if (!trimmedDum && !trimmedDossier) {
      Toast.show({
        type: "error",
        text1: "Champs requis",
        text2: "Veuillez renseigner au moins DUM ou Dossier.",
      });
      return;
    }

    if (files.length === 0) {
      Toast.show({
        type: "error",
        text1: "Fichier requis",
        text2: "Veuillez joindre au moins un fichier.",
      });
      return;
    }

    createQualityReportMutate({
      dum: trimmedDum || undefined,
      dossier: trimmedDossier || undefined,
      commentaire: trimmedCommentaire || undefined,
      files,
    });
  };

  if (!canCreateQualityReport) {
    return (
      <View style={styles.centered}>
        <Text style={styles.infoText}>
          Vous n'avez pas la permission de créer un rapport qualité.
        </Text>
      </View>
    );
  }

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
            <Text style={styles.sectionTitle}>Informations du rapport</Text>
          </View>
          <Text style={styles.sectionHint}>
            DUM et dossier sont optionnels individuellement, mais au moins un
            des deux doit être renseigné.
          </Text>

          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>DUM</Text>
            <TextInput
              value={dum}
              onChangeText={setDum}
              placeholder="Ex: DUM-001"
              placeholderTextColor="#999"
              style={styles.textInput}
            />
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Dossier</Text>
            <TextInput
              value={dossier}
              onChangeText={setDossier}
              placeholder="Ex: Dossier principal"
              placeholderTextColor="#999"
              style={styles.textInput}
            />
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Commentaire (optionnel)</Text>
            <TextInput
              value={commentaire}
              onChangeText={setCommentaire}
              placeholder="Ajouter un commentaire"
              placeholderTextColor="#999"
              style={[styles.textInput, styles.multilineInput]}
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.cameraCard}>
          <View style={styles.sectionHeader}>
            <FontAwesome5 name="paperclip" size={14} color={PRIMARY} />
            <Text style={styles.sectionTitle}>Fichiers du rapport</Text>
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
                    : "Caméra non autorisée (fichiers depuis l'appareil)"}
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
                text="Choisir des fichiers"
                onPress={pickFromDeviceStorage}
              />
            </View>
          </View>

          <FlatList
            data={files}
            horizontal
            keyExtractor={(item, index) => `${item.uri}-${item.name}-${index}`}
            contentContainerStyle={styles.previewList}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <View style={styles.previewItemWrap}>
                {item.type.startsWith("image/") ? (
                  <Image
                    source={{ uri: item.uri }}
                    style={styles.previewImage}
                  />
                ) : (
                  <View style={styles.previewFilePlaceholder}>
                    <FontAwesome5 name="file-alt" size={20} color="#555" />
                    <Text numberOfLines={2} style={styles.previewFileName}>
                      {item.name}
                    </Text>
                  </View>
                )}
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
                Aucun fichier sélectionné
              </Text>
            }
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          preset="filled"
          text="Créer le rapport"
          disabled={isFileCooldown || !canCreateQualityReport}
          isLoading={isPending || isFileCooldown}
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
  infoText: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
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
  sectionHint: {
    fontSize: 12,
    color: "#666",
    marginBottom: 10,
  },
  fieldWrap: {
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  textInput: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#e8e8e8",
    borderRadius: 10,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#11181C",
  },
  multilineInput: {
    minHeight: 92,
    paddingTop: 12,
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
    textAlign: "center",
    paddingHorizontal: 12,
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
  },
  previewFilePlaceholder: {
    flex: 1,
    backgroundColor: "#f0f1f2",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    rowGap: 6,
  },
  previewFileName: {
    color: "#4d4d4d",
    fontSize: 11,
    textAlign: "center",
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
