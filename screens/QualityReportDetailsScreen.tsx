import { getQualityReportById } from "@/api/quality-report.api";
import Loader from "@/components/Loader";
import { hasRapportQualitePermission } from "@/constants/permissions";
import { apiUrl } from "@/constants/query";
import { PRIMARY } from "@/constants/theme";
import { useSession } from "@/stores/auth.store";
import { FontAwesome5 } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Directory, File, Paths } from "expo-file-system";
import { Image } from "expo-image";
import * as IntentLauncher from "expo-intent-launcher";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const IMAGE_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "bmp",
  "heic",
  "avif",
];

const getFileExtension = (name?: string | null) => {
  if (!name) {
    return "";
  }

  const dotIndex = name.lastIndexOf(".");
  if (dotIndex < 0 || dotIndex === name.length - 1) {
    return "";
  }

  return name.slice(dotIndex + 1).toLowerCase();
};

const isImageFile = (name?: string | null, path?: string | null) => {
  const extension = getFileExtension(name) || getFileExtension(path);
  return IMAGE_EXTENSIONS.includes(extension);
};

const buildFileUrl = (cheminFichier?: string | null) => {
  if (!cheminFichier) {
    return null;
  }

  const normalizedBaseUrl = (apiUrl ?? "").replace(/\/$/, "");
  const normalizedPath = cheminFichier.replace(/^\/+/, "");

  if (!normalizedBaseUrl) {
    return `/sdkboard/${normalizedPath}`;
  }

  return `${normalizedBaseUrl}/sdkboard/${normalizedPath}`;
};

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return format(parsed, "dd/MM/yyyy HH:mm");
};

const formatUploadDate = (value?: string | null) => {
  if (!value) {
    return "Date inconnue";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getFileName = (path?: string | null, fallback = "Fichier") => {
  if (!path) {
    return fallback;
  }

  const normalized = path.replace(/\\/g, "/");
  const segments = normalized.split("/").filter(Boolean);
  return segments[segments.length - 1] || fallback;
};

const sanitizeFileName = (name: string) =>
  name.replace(/[<>:"/\\|?*]/g, "_").trim() || "fichier";

const isNameConflictError = (err: unknown) => {
  const message =
    err instanceof Error
      ? err.message.toLowerCase()
      : String(err).toLowerCase();

  return (
    message.includes("already exists") ||
    message.includes("same name") ||
    message.includes("file location")
  );
};

const buildUniqueFileName = (name: string) => {
  const extension = getFileExtension(name);
  const baseName = extension
    ? name.slice(0, Math.max(0, name.length - extension.length - 1))
    : name;

  return `${baseName}-${Date.now()}${extension ? `.${extension}` : ""}`;
};

const getMimeTypeFromFileName = (name: string) => {
  const extension = getFileExtension(name);

  const mimeByExtension: Record<string, string> = {
    pdf: "application/pdf",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    csv: "text/csv",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    txt: "text/plain",
    rtf: "application/rtf",
    zip: "application/zip",
    rar: "application/vnd.rar",
    "7z": "application/x-7z-compressed",
    tar: "application/x-tar",
    gz: "application/gzip",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    bmp: "image/bmp",
    heic: "image/heic",
    avif: "image/avif",
  };

  return mimeByExtension[extension] ?? "application/octet-stream";
};

const getDisplayNameWithoutExtension = (name: string) => {
  const extension = getFileExtension(name);
  if (!extension) {
    return name;
  }

  return name.slice(0, Math.max(0, name.length - extension.length - 1));
};

const getOpenUriCandidates = (uri: string) => {
  const candidates = [uri];

  // SAF URIs with /tree/.../document/... can fail with some open handlers.
  const normalizedUri = uri.replace(/\/tree\/[^/]+\/document\//, "/document/");
  if (normalizedUri !== uri) {
    candidates.push(normalizedUri);
  }

  return Array.from(new Set(candidates));
};

const getFileIcon = (name?: string | null) => {
  const extension = getFileExtension(name);

  if (extension === "pdf") return "file-pdf";
  if (["xls", "xlsx", "csv"].includes(extension)) return "file-excel";
  if (["doc", "docx", "txt", "rtf"].includes(extension)) return "file-word";
  if (["zip", "rar", "7z", "tar", "gz"].includes(extension)) {
    return "file-archive";
  }

  return "file-alt";
};

export const QualityReportDetailsScreen = () => {
  const { user } = useSession();
  const { qualityReportId } = useLocalSearchParams<{
    qualityReportId: string;
  }>();
  const [previewImage, setPreviewImage] = useState<{
    uri: string;
    dateUpload: string | null;
  } | null>(null);
  const [processingFileId, setProcessingFileId] = useState<number | null>(null);
  const canListQualityReports = hasRapportQualitePermission(user, "LIST");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["quality-reports", "details", qualityReportId],
    queryFn: () => getQualityReportById({ id: String(qualityReportId) }),
    enabled: canListQualityReports && Boolean(qualityReportId),
  });

  const fileCount = useMemo(() => data?.images?.length ?? 0, [data?.images]);

  const downloadFileToCache = useCallback(
    async (fileUrl: string, sourceName?: string | null, fileId?: number) => {
      const fallbackName = `rapport-${qualityReportId ?? "fichier"}-${Date.now()}`;
      const baseName = getFileName(sourceName, fallbackName);
      const safeName = sanitizeFileName(baseName);

      try {
        if (typeof fileId === "number") {
          setProcessingFileId(fileId);
        }

        const tempDownloadsDir = new Directory(Paths.cache, "downloads-share");
        if (!tempDownloadsDir.exists) {
          tempDownloadsDir.create({ idempotent: true, intermediates: true });
        }

        const tempFileName = `${Date.now()}-${safeName}`;
        const tempDestination = new File(tempDownloadsDir, tempFileName);
        return await File.downloadFileAsync(fileUrl, tempDestination, {
          idempotent: true,
        });
      } catch (error) {
        console.error("Error downloading file for sharing:", error);
        Toast.show({
          type: "error",
          text1: "Partage impossible",
          text2: "Impossible de préparer ce fichier pour le partage.",
        });
        return null;
      } finally {
        setProcessingFileId(null);
      }
    },
    [qualityReportId],
  );

  const handleDownloadFile = useCallback(
    async (
      fileUrl: string,
      sourceName?: string | null,
      fileId?: number,
      options?: {
        openAfterDownload?: boolean;
        showSuccessToast?: boolean;
      },
    ) => {
      const fallbackName = `rapport-${qualityReportId ?? "fichier"}-${Date.now()}`;
      const baseName = getFileName(sourceName, fallbackName);
      const safeName = sanitizeFileName(baseName);
      const openAfterDownload = options?.openAfterDownload === true;
      const showSuccessToast = options?.showSuccessToast !== false;

      try {
        if (typeof fileId === "number") {
          setProcessingFileId(fileId);
        }

        const selectedDirectory = await Directory.pickDirectoryAsync();
        const tempDownloadsDir = new Directory(Paths.cache, "downloads");
        if (!tempDownloadsDir.exists) {
          tempDownloadsDir.create({ idempotent: true, intermediates: true });
        }

        const tempFileName = `${Date.now()}-${safeName}`;
        const tempDestination = new File(tempDownloadsDir, tempFileName);
        const downloadedTempFile = await File.downloadFileAsync(
          fileUrl,
          tempDestination,
          {
            idempotent: true,
          },
        );
        let savedFile: File | null = null;
        const maxAttempts = 6;

        if (selectedDirectory.uri.startsWith("content://")) {
          const fileBytes = await downloadedTempFile.bytes();
          let lastConflictError: unknown = null;

          for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
            const candidateName =
              attempt === 0 ? safeName : buildUniqueFileName(safeName);

            try {
              const mimeType = getMimeTypeFromFileName(candidateName);
              const displayName =
                getDisplayNameWithoutExtension(candidateName).trim() ||
                `fichier-${Date.now()}`;

              const candidateFile = selectedDirectory.createFile(
                displayName,
                mimeType,
              );
              candidateFile.write(fileBytes);
              savedFile = candidateFile;
              lastConflictError = null;
              break;
            } catch (createErr) {
              if (isNameConflictError(createErr)) {
                lastConflictError = createErr;
                continue;
              }

              throw createErr;
            }
          }

          if (!savedFile) {
            throw (
              lastConflictError ??
              new Error("Impossible de sauvegarder le fichier.")
            );
          }

          if (downloadedTempFile.exists) {
            downloadedTempFile.delete();
          }
        } else {
          let lastConflictError: unknown = null;

          for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
            const candidateName =
              attempt === 0 ? safeName : buildUniqueFileName(safeName);
            const candidateDestination = new File(
              selectedDirectory,
              candidateName,
            );

            if (candidateDestination.exists) {
              try {
                candidateDestination.delete();
              } catch {
                // Could be a folder or protected file: treat as conflict and retry with another name.
              }
            }

            if (candidateDestination.exists) {
              continue;
            }

            try {
              downloadedTempFile.move(candidateDestination);
              savedFile = candidateDestination;
              lastConflictError = null;
              break;
            } catch (moveErr) {
              if (isNameConflictError(moveErr)) {
                lastConflictError = moveErr;
                continue;
              }

              throw moveErr;
            }
          }

          if (!savedFile) {
            throw (
              lastConflictError ??
              new Error("Impossible de sauvegarder le fichier.")
            );
          }
        }

        const persistedFile = savedFile as File;

        if (showSuccessToast) {
          Toast.show({
            text1: "Téléchargement réussi",
            text2: persistedFile.name,
            type: "success",
          });
        }

        if (openAfterDownload) {
          const openCandidates = getOpenUriCandidates(persistedFile.uri);
          const mimeType = getMimeTypeFromFileName(persistedFile.name);
          let isOpened = false;
          let openError: unknown = null;

          for (const uriCandidate of openCandidates) {
            try {
              if (Platform.OS === "android") {
                try {
                  await IntentLauncher.startActivityAsync(
                    "android.intent.action.VIEW",
                    {
                      data: uriCandidate,
                      flags: 1,
                      type: mimeType,
                    },
                  );
                } catch {
                  await IntentLauncher.startActivityAsync(
                    "android.intent.action.VIEW",
                    {
                      data: uriCandidate,
                      flags: 1,
                    },
                  );
                }
              } else {
                const canOpen = await Linking.canOpenURL(uriCandidate);
                if (!canOpen) {
                  continue;
                }

                await Linking.openURL(uriCandidate);
              }

              isOpened = true;
              break;
            } catch (candidateErr) {
              openError = candidateErr;
            }
          }

          if (!isOpened) {
            console.error("Error opening saved file:", {
              candidates: openCandidates,
              error: openError,
            });
            Toast.show({
              text1: "Fichier enregistré",
              text2: "Impossible d'ouvrir automatiquement ce fichier.",
              type: "info",
            });
          }
        }

        return persistedFile;
      } catch (err) {
        const message =
          err instanceof Error ? err.message.toLowerCase() : String(err);
        if (message.includes("cancel")) {
          return null;
        }

        console.error("Error downloading file:", err);
        console.log("File URL:", fileUrl);
        Alert.alert(
          "Erreur",
          "Impossible de télécharger ce fichier pour le moment.",
        );
        return null;
      } finally {
        setProcessingFileId(null);
      }
    },
    [qualityReportId],
  );

  const handlePreviewFile = useCallback(
    async (fileUrl: string, fileName: string) => {
      const mimeType = getMimeTypeFromFileName(fileName);

      try {
        if (Platform.OS === "android") {
          try {
            await IntentLauncher.startActivityAsync(
              "android.intent.action.VIEW",
              {
                data: fileUrl,
                flags: 1,
                type: mimeType,
              },
            );
          } catch {
            await IntentLauncher.startActivityAsync(
              "android.intent.action.VIEW",
              {
                data: fileUrl,
                flags: 1,
              },
            );
          }

          return;
        }

        const canOpen = await Linking.canOpenURL(fileUrl);
        if (!canOpen) {
          Toast.show({
            type: "error",
            text1: "Ouverture impossible",
            text2: "Impossible d'ouvrir ce fichier.",
          });
          return;
        }

        await Linking.openURL(fileUrl);
      } catch (error) {
        console.error("Error previewing file:", error);
        Toast.show({
          type: "error",
          text1: "Aperçu impossible",
          text2: "Impossible d'ouvrir ce fichier.",
        });
      }
    },
    [],
  );

  const handleShareFile = useCallback(
    async (fileUrl: string, sourceName?: string | null, fileId?: number) => {
      const downloadedFile = await downloadFileToCache(
        fileUrl,
        sourceName,
        fileId,
      );

      if (!downloadedFile) {
        return;
      }

      try {
        await Share.share({
          title: downloadedFile.name,
          message: downloadedFile.name,
          url: downloadedFile.uri,
        });
      } catch (error) {
        console.error("Error sharing file:", error);
        Toast.show({
          type: "error",
          text1: "Partage impossible",
          text2: "Impossible de partager ce fichier.",
        });
      }
    },
    [downloadFileToCache],
  );

  if (!canListQualityReports) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 20,
          backgroundColor: "#f7f8fa",
        }}
      >
        <FontAwesome5 name="lock" size={34} color="#bbb" />
        <Text
          style={{
            marginTop: 12,
            color: "#666",
            fontSize: 14,
            textAlign: "center",
          }}
        >
          Vous n'avez pas la permission de consulter les rapports qualité.
        </Text>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f8fa" }}>
        <Loader />
      </SafeAreaView>
    );
  }

  if (isError || !data) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 20,
          backgroundColor: "#f7f8fa",
        }}
      >
        <FontAwesome5 name="exclamation-circle" size={36} color="#bbb" />
        <Text
          style={{
            marginTop: 12,
            color: "#666",
            fontSize: 14,
            textAlign: "center",
          }}
        >
          Impossible de charger les détails de ce rapport.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f8fa" }}>
      <ScrollView
        contentContainerStyle={{ padding: 14, paddingBottom: 24, rowGap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#efefef",
            padding: 14,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#11181C" }}>
            Rapport qualité #{data.id}
          </Text>
          <Text style={{ marginTop: 4, color: "#64748B", fontSize: 13 }}>
            {fileCount} fichier{fileCount > 1 ? "s" : ""}
          </Text>

          <View style={{ marginTop: 12, rowGap: 8 }}>
            <Field label="DUM" value={data.dum || "-"} />
            <Field label="Dossier" value={data.dossier || "-"} />
            <Field label="Commentaire" value={data.commentaire || "-"} />
            <Field label="Date" value={formatDateTime(data.date)} />
            <Field label="Créé le" value={formatDateTime(data.dateCreate)} />
            <Field label="Modifié le" value={formatDateTime(data.dateModif)} />
          </View>
        </View>

        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#efefef",
            padding: 14,
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: "700", color: "#1a1a2e" }}>
            Pièces jointes
          </Text>

          {fileCount === 0 ? (
            <Text style={{ marginTop: 10, color: "#94a3b8", fontSize: 13 }}>
              Aucun fichier joint.
            </Text>
          ) : (
            <View style={{ marginTop: 10, rowGap: 10 }}>
              {(data.images ?? []).map((file, index) => {
                const fileUrl = buildFileUrl(file.chemin_fichier);
                if (!fileUrl) {
                  return null;
                }

                const fallbackName = `Fichier ${index + 1}`;
                const fileName = getFileName(file.nom_fichier, fallbackName);
                const fileIsImage = isImageFile(fileName, file.chemin_fichier);
                const fileIcon = getFileIcon(fileName);
                const isProcessing = processingFileId === file.id;

                return (
                  <View
                    key={file.id}
                    style={{
                      borderWidth: 1,
                      borderColor: "#eee",
                      backgroundColor: "#fff",
                      borderRadius: 10,
                      padding: 10,
                    }}
                  >
                    {fileIsImage ? (
                      <Pressable
                        onPress={() =>
                          setPreviewImage({
                            uri: fileUrl,
                            dateUpload: file.date_upload ?? null,
                          })
                        }
                        style={{ marginBottom: 10 }}
                      >
                        <Image
                          source={{ uri: fileUrl }}
                          style={{
                            width: "100%",
                            height: 180,
                            borderRadius: 8,
                            backgroundColor: "#f2f2f2",
                          }}
                          contentFit="cover"
                          transition={120}
                        />
                      </Pressable>
                    ) : (
                      <View
                        style={{
                          height: 56,
                          borderRadius: 8,
                          backgroundColor: "#f7f8fa",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: 10,
                        }}
                      >
                        <FontAwesome5
                          name={fileIcon as any}
                          size={20}
                          color={PRIMARY}
                        />
                      </View>
                    )}

                    <Text
                      style={{
                        fontSize: 13,
                        color: "#1a1a2e",
                        fontWeight: "700",
                      }}
                      numberOfLines={2}
                    >
                      {fileName}
                    </Text>

                    <Text
                      style={{
                        marginTop: 6,
                        fontSize: 12,
                        color: "#777",
                        fontWeight: "500",
                      }}
                    >
                      Upload: {formatUploadDate(file.date_upload)}
                    </Text>

                    <View
                      style={{
                        flexDirection: "row",
                        marginTop: 10,
                        columnGap: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      <Pressable
                        onPress={async () => {
                          if (fileIsImage) {
                            setPreviewImage({
                              uri: fileUrl,
                              dateUpload: file.date_upload ?? null,
                            });
                            return;
                          }

                          await handlePreviewFile(fileUrl, fileName);
                        }}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: "#ddd",
                          backgroundColor: "#fff",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            color: "#555",
                            fontWeight: "700",
                          }}
                        >
                          Aperçu
                        </Text>
                      </Pressable>

                      <Pressable
                        onPress={() =>
                          handleDownloadFile(
                            fileUrl,
                            file.nom_fichier,
                            file.id,
                            {
                              openAfterDownload: false,
                              showSuccessToast: true,
                            },
                          )
                        }
                        disabled={isProcessing}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 8,
                          backgroundColor: PRIMARY,
                          opacity: isProcessing ? 0.7 : 1,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            color: "#fff",
                            fontWeight: "700",
                          }}
                        >
                          {isProcessing ? "Téléchargement..." : "Télécharger"}
                        </Text>
                      </Pressable>

                      <Pressable
                        onPress={() =>
                          handleShareFile(fileUrl, file.nom_fichier, file.id)
                        }
                        disabled={isProcessing}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 8,
                          backgroundColor: "#334155",
                          opacity: isProcessing ? 0.7 : 1,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            color: "#fff",
                            fontWeight: "700",
                          }}
                        >
                          Partager
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={Boolean(previewImage)}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewImage(null)}
      >
        <Pressable
          onPress={() => setPreviewImage(null)}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.85)",
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 16,
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 420,
              aspectRatio: 3 / 4,
              borderRadius: 12,
              overflow: "hidden",
              backgroundColor: "#111",
            }}
          >
            {previewImage?.uri ? (
              <Image
                source={{ uri: previewImage.uri }}
                style={{ width: "100%", height: "100%" }}
                contentFit="contain"
              />
            ) : null}

            <View
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                backgroundColor: "rgba(0,0,0,0.65)",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 11, fontWeight: "600" }}>
                {formatUploadDate(previewImage?.dateUpload)}
              </Text>
            </View>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const Field = ({ label, value }: { label: string; value: string }) => (
  <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
    <Text style={{ width: 92, color: "#64748B", fontSize: 13 }}>{label}</Text>
    <Text
      style={{
        flex: 1,
        color: "#0f172a",
        fontSize: 13,
        fontWeight: "500",
      }}
    >
      {value}
    </Text>
  </View>
);
