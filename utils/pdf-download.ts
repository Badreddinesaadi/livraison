import { Directory, File, Paths } from "expo-file-system";
import * as IntentLauncher from "expo-intent-launcher";
import * as SecureStore from "expo-secure-store";
import {
  Alert,
  Linking,
  Platform,
} from "react-native";
import Toast from "react-native-toast-message";

const isNameConflictError = (err: unknown) => {
  const message =
    err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
  return (
    message.includes("already exists") ||
    message.includes("same name") ||
    message.includes("file location")
  );
};

const sanitizeFileName = (name: string) =>
  name.replace(/[<>:"/\\|?*]/g, "_").trim().replace(/\s+/g, "-") || "fichier";

const getDisplayNameWithoutExtension = (name: string) => {
  const dotIndex = name.lastIndexOf(".");
  if (dotIndex < 0 || dotIndex === name.length - 1) return name;
  return name.slice(0, dotIndex);
};

const buildUniqueFileName = (name: string) => {
  const dotIndex = name.lastIndexOf(".");
  if (dotIndex < 0 || dotIndex === name.length - 1) {
    return `${name}-${Date.now()}`;
  }
  return `${name.slice(0, dotIndex)}-${Date.now()}${name.slice(dotIndex)}`;
};

const getOpenUriCandidates = (uri: string) => {
  const candidates = [uri];
  const normalizedUri = uri.replace(/\/tree\/[^/]+\/document\//, "/document/");
  if (normalizedUri !== uri) candidates.push(normalizedUri);
  return Array.from(new Set(candidates));
};

const getAuthFileHeaders = async () => {
  const headers: Record<string, string> = {
    login_token: "SDKWOOD",
    code_token: "SDKWOOD/2026@!!",
  };
  try {
    const sessionToken = await SecureStore.getItemAsync("sessionToken");
    if (sessionToken) {
      headers["auth_token"] = sessionToken;
    }
  } catch {
    // token unavailable: request may fail with its own error
  }
  return headers;
};

const openSavedFile = async (fileUri: string, fileName: string) => {
  const openCandidates = getOpenUriCandidates(fileUri);
  for (const uriCandidate of openCandidates) {
    try {
      if (Platform.OS === "android") {
        try {
          await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
            data: uriCandidate,
            flags: 1,
            type: "application/pdf",
          });
        } catch {
          await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
            data: uriCandidate,
            flags: 1,
          });
        }
      } else {
        const canOpen = await Linking.canOpenURL(uriCandidate);
        if (!canOpen) continue;
        await Linking.openURL(uriCandidate);
      }
      return true;
    } catch {
      // try next candidate
    }
  }
  Toast.show({
    type: "info",
    text1: "Fichier enregistré",
    text2: "Impossible d'ouvrir automatiquement ce fichier." + (fileName ? ` (${fileName})` : ""),
  });
  return false;
};

export const downloadPdf = async (
  fileUrl: string,
  baseName: string,
  onBusyChange?: (isBusy: boolean) => void,
) => {
  const safeName = sanitizeFileName(
    baseName.toLowerCase().endsWith(".pdf") ? baseName : `${baseName}.pdf`,
  );

  try {
    onBusyChange?.(true);

    const selectedDirectory = await Directory.pickDirectoryAsync();
    const tempDownloadsDir = new Directory(Paths.cache, "downloads");
    if (!tempDownloadsDir.exists) {
      tempDownloadsDir.create({ idempotent: true, intermediates: true });
    }

    const tempFileName = `${Date.now()}-${safeName}`;
    const tempDestination = new File(tempDownloadsDir, tempFileName);
    const headers = await getAuthFileHeaders();

    const downloadedTempFile = await File.downloadFileAsync(
      fileUrl,
      tempDestination,
      { idempotent: true, headers },
    );

    let savedFile: File | null = null;
    const maxAttempts = 6;

    if (selectedDirectory.uri.startsWith("content://")) {
      const fileBytes = await downloadedTempFile.bytes();
      let lastConflictError: unknown = null;

      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        const candidateName =
          attempt === 0 ? safeName : buildUniqueFileName(safeName);
        const displayName =
          getDisplayNameWithoutExtension(candidateName) || `fichier-${Date.now()}`;

        try {
          const candidateFile = selectedDirectory.createFile(
            displayName,
            "application/pdf",
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
        throw lastConflictError ?? new Error("Impossible de sauvegarder le fichier.");
      }

      if (downloadedTempFile.exists) {
        downloadedTempFile.delete();
      }
    } else {
      let lastConflictError: unknown = null;

      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        const candidateName = attempt === 0 ? safeName : buildUniqueFileName(safeName);
        const candidateDestination = new File(selectedDirectory, candidateName);

        if (candidateDestination.exists) {
          try {
            candidateDestination.delete();
          } catch {
            // Could be a folder or protected file: treat as conflict and retry.
          }
        }

        if (candidateDestination.exists) continue;

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
        throw lastConflictError ?? new Error("Impossible de sauvegarder le fichier.");
      }
    }

    const persistedFile = savedFile as File;

    Toast.show({
      text1: "Téléchargement réussi",
      text2: persistedFile.name,
      type: "success",
    });

    await openSavedFile(persistedFile.uri, persistedFile.name);
  } catch (err) {
    const message =
      err instanceof Error ? err.message.toLowerCase() : String(err);
    if (message.includes("cancel")) return;

    console.error("Error downloading PDF:", err);
    console.log("PDF URL:", fileUrl);
    Alert.alert(
      "Erreur",
      "Impossible de télécharger ce PDF pour le moment.",
    );
  } finally {
    onBusyChange?.(false);
  }
};
