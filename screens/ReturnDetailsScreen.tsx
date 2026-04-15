import { getReturnById } from "@/api/return.api";
import Loader from "@/components/Loader";
import { hasRetourPermission } from "@/constants/permissions";
import { apiUrl } from "@/constants/query";
import { PRIMARY, SUCCESS } from "@/constants/theme";
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

const buildFileUrl = (cheminFichier?: string) => {
  if (!cheminFichier) {
    return null;
  }

  return `${apiUrl}/sdkboard/${cheminFichier}`;
};

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "heic"];

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

const isImageFile = (name?: string | null) => {
  const extension = getFileExtension(name);
  return IMAGE_EXTENSIONS.includes(extension);
};

const getFileIcon = (name?: string | null) => {
  const extension = getFileExtension(name);

  if (extension === "pdf") return "file-pdf";
  if (["xls", "xlsx", "csv"].includes(extension)) return "file-excel";
  if (["doc", "docx", "txt", "rtf"].includes(extension)) return "file-word";
  if (["zip", "rar", "7z", "tar", "gz"].includes(extension))
    return "file-archive";
  return "file-alt";
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

export const ReturnDetailsScreen = () => {
  const { user } = useSession();
  const canListReturns = hasRetourPermission(user, "LIST");
  const { returnId } = useLocalSearchParams<{ returnId: string }>();
  const [previewImage, setPreviewImage] = useState<{
    uri: string;
    dateUpload: string | null;
  } | null>(null);
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(
    null,
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ["returns", "details", returnId],
    queryFn: () => getReturnById({ id: String(returnId) }),
    enabled: canListReturns && Boolean(returnId),
  });

  const statusUi = useMemo(() => {
    if (data?.statut === "terminer") {
      return {
        label: "Terminé",
        bg: SUCCESS + "22",
        color: SUCCESS,
      };
    } else if (data?.statut === "refuser") {
      return {
        label: "Refusé",
        bg: "#ff4d4d" + "22",
        color: "#ff4d4d",
      };
    } else {
      return {
        label: data?.statut === "envoyer" ? "Envoyé" : "En cours",
        bg: PRIMARY + "22",
        color: PRIMARY,
      };
    }
  }, [data?.statut]);

  const retourDate = useMemo(
    () => (data?.date ? new Date(data.date) : null),
    [data?.date],
  );

  if (!canListReturns) {
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
          Vous n'avez pas la permission de consulter les retours.
        </Text>
      </SafeAreaView>
    );
  }

  const handleDownloadFile = useCallback(
    async (fileUrl: string, sourceName?: string | null, fileId?: string) => {
      const fallbackName = `retour-${returnId ?? "fichier"}-${Date.now()}`;
      const baseName = getFileName(sourceName, fallbackName);
      const safeName = sanitizeFileName(baseName);

      try {
        if (fileId) {
          setDownloadingFileId(fileId);
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

        Toast.show({
          text1: "Téléchargement réussi",
          text2: persistedFile.name,
          type: "success",
        });

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
      } catch (err) {
        const message =
          err instanceof Error ? err.message.toLowerCase() : String(err);
        if (message.includes("cancel")) {
          return;
        }

        console.error("Error downloading file:", err);
        console.log("File URL:", fileUrl);
        Alert.alert(
          "Erreur",
          "Impossible de télécharger ce fichier pour le moment.",
        );
      } finally {
        setDownloadingFileId(null);
      }
    },
    [returnId],
  );

  const downloadFileToCache = useCallback(
    async (fileUrl: string, sourceName?: string | null, fileId?: string) => {
      const fallbackName = `retour-${returnId ?? "fichier"}-${Date.now()}`;
      const baseName = getFileName(sourceName, fallbackName);
      const safeName = sanitizeFileName(baseName);

      try {
        if (fileId) {
          setDownloadingFileId(fileId);
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
        setDownloadingFileId(null);
      }
    },
    [returnId],
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
    async (fileUrl: string, sourceName?: string | null, fileId?: string) => {
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

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingHorizontal: 14,
        // marginTop: 4,
        backgroundColor: "#f7f8fa",
      }}
    >
      {isLoading ? (
        <Loader />
      ) : isError || !data ? (
        <View
          style={{
            marginTop: 40,
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            backgroundColor: "#fff",
            borderRadius: 10,
            borderWidth: 1,
            borderColor: "#eee",
          }}
        >
          <Text style={{ color: "#888", fontSize: 14 }}>
            Impossible de charger les détails du retour.
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View
            style={{
              padding: 16,
              backgroundColor: "#fff",
              borderRadius: 10,
              borderWidth: 1,
              borderColor: "#efefef",
              marginBottom: 12,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <Text
                style={{ fontSize: 18, fontWeight: "700", color: "#1a1a2e" }}
              >
                R{data?.id}-{data?.date ? format(data?.date, "yyMMdd") : "—"}
              </Text>
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 999,
                  backgroundColor: statusUi.bg,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: statusUi.color,
                  }}
                >
                  {statusUi.label}
                </Text>
              </View>
            </View>

            <DetailRow
              icon="building"
              label="Client"
              value={data.client || "—"}
            />
            <DetailRow
              icon="exclamation-triangle"
              label="Motif du retour"
              value={data.reclamation || "—"}
            />
            <DetailRow
              icon="exclamation-triangle"
              label="Retour MSE"
              value={data.retour_Mse === "oui" ? "Oui" : "Non"}
            />
            <DetailRow
              icon="file-signature"
              label="BL cacheté"
              value={data.Bl_cachetet === "oui" ? "Oui" : "Non"}
            />
            <DetailRow
              icon="money-check-alt"
              label="Règlement"
              value={data.reglement === "oui" ? "Oui" : "Non"}
            />
            {data.commentaire && (
              <View
                style={{
                  marginTop: 8,
                  borderWidth: 1,
                  borderColor:
                    data.statut === "refuser" ? "#ffd6d6" : "#ffe2d7",
                  backgroundColor:
                    data.statut === "refuser" ? "#fff6f6" : "#fff8f4",
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    columnGap: 8,
                    marginBottom: 6,
                  }}
                >
                  <FontAwesome5
                    name="comment-alt"
                    size={13}
                    color={data.statut === "refuser" ? "#ff4d4d" : PRIMARY}
                  />
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "700",
                      color: "#1a1a2e",
                    }}
                  >
                    Commentaire
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 13,
                    color: "#333",
                    lineHeight: 20,
                  }}
                >
                  {data.commentaire?.trim() || "Aucun commentaire renseigné"}
                </Text>
              </View>
            )}
          </View>

          <View
            style={{
              padding: 16,
              backgroundColor: "#fff",
              borderRadius: 10,
              borderWidth: 1,
              borderColor: "#efefef",
              marginBottom: 20,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
                columnGap: 8,
              }}
            >
              <FontAwesome5 name="file-image" size={14} color={PRIMARY} />
              <Text
                style={{ fontSize: 15, fontWeight: "700", color: "#1a1a2e" }}
              >
                Fichiers ({data.images?.length ?? 0})
              </Text>
            </View>

            {data.images && data.images.length > 0 ? (
              <View style={{ rowGap: 10 }}>
                {data.images.map((file, index) => {
                  const fileUrl = buildFileUrl(file.chemin_fichier);
                  if (!fileUrl) {
                    return null;
                  }

                  const fallbackName = `Fichier ${index + 1}`;
                  const fileName = getFileName(file.nom_fichier, fallbackName);
                  const fileIsImage = isImageFile(fileName);
                  const fileIcon = getFileIcon(fileName);
                  const isDownloading = downloadingFileId === file.id;

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
                            )
                          }
                          disabled={isDownloading}
                          style={{
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            borderRadius: 8,
                            backgroundColor: PRIMARY,
                            opacity: isDownloading ? 0.7 : 1,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 12,
                              color: "#fff",
                              fontWeight: "700",
                            }}
                          >
                            {isDownloading
                              ? "Téléchargement..."
                              : "Télécharger"}
                          </Text>
                        </Pressable>

                        <Pressable
                          onPress={() =>
                            handleShareFile(fileUrl, file.nom_fichier, file.id)
                          }
                          disabled={isDownloading}
                          style={{
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            borderRadius: 8,
                            backgroundColor: "#334155",
                            opacity: isDownloading ? 0.7 : 1,
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
            ) : (
              <Text style={{ fontSize: 13, color: "#888" }}>Aucun fichier</Text>
            )}
          </View>
        </ScrollView>
      )}

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

const DetailRow = ({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 6,
    }}
  >
    <FontAwesome5
      name={icon as any}
      size={13}
      color={PRIMARY}
      style={{ width: 18, marginTop: 1 }}
    />
    <Text style={{ fontSize: 13, color: "#888", width: 110 }}>{label}</Text>
    <Text style={{ fontSize: 13, color: "#222", flex: 1, flexWrap: "wrap" }}>
      {value}
    </Text>
  </View>
);
