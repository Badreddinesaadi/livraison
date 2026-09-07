import { client, Pagination } from "@/constants/client";
import { apiUrl } from "@/constants/query";
import {
  VisitCreate,
  VisitPatch,
  VisitPhoto,
  VisitReport,
} from "@/types/rvt.types";
import { File, UploadType } from "expo-file-system";
import * as SecureStore from "expo-secure-store";

export type UploadVisitFile = {
  uri: string;
  name: string;
  type: string;
};

export const generateIdempotencyKey = () => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const listVisits = async ({
  roundId,
  page,
  perPage = 20,
  sort = "-completedAt",
}: {
  roundId?: string;
  page: number;
  perPage?: number;
  sort?: "completedAt" | "-completedAt" | "createdAt" | "-createdAt";
}) => {
  const result = await client.request<VisitReport[]>({
    pathname: "/sdkboard/api/rounds/visits.php",
    method: "GET",
    searchParams: { roundId, page, perPage, sort },
    isDebug: false,
    withPagination: true,
  });

  return {
    data: result.data,
    pagination: result.pagination as Pagination | null,
  };
};

export const getVisitById = async ({ id }: { id: string }) => {
  return client.request<VisitReport>({
    pathname: "/sdkboard/api/rounds/visits.php",
    method: "GET",
    searchParams: { id },
    isDebug: false,
  });
};

export const createVisit = async (request: VisitCreate) => {
  return client.request<VisitReport>({
    pathname: "/sdkboard/api/rounds/visits.php",
    method: "POST",
    searchParams: { idempotencyKey: generateIdempotencyKey() },
    body: request,
    isDebug: true,
  });
};

export const updateVisit = async ({
  id,
  version,
  patch,
}: {
  id: string;
  version: number;
  patch: VisitPatch;
}) => {
  return client.request<VisitReport>({
    pathname: "/sdkboard/api/rounds/visits.php",
    method: "PUT",
    searchParams: { id },
    headers: { "If-Match": String(version) },
    body: patch,
    isDebug: true,
  });
};

export const deleteVisit = async ({ id }: { id: string }) => {
  return client.request<null>({
    pathname: "/sdkboard/api/rounds/visits.php",
    method: "DELETE",
    searchParams: { id },
    isDebug: true,
  });
};

export const uploadVisitPhoto = async ({
  visitId,
  file,
}: {
  visitId: string;
  file: UploadVisitFile;
}): Promise<VisitPhoto[] | null> => {
  const base = (apiUrl ?? "").replace(/\/+$/, "");
  const url = `${
    base
  }/sdkboard/api/rounds/visits.php?action=addPhoto&id=${encodeURIComponent(
    String(visitId),
  )}`;
  const auth_token = (await SecureStore.getItemAsync("sessionToken")) ?? "";

  const fileToUpload = new File(file.uri);
  if (__DEV__) {
    console.log("\n====== UPLOAD PHOTO DEBUG ======");
    console.log("URL:", url);
    console.log("visitId:", visitId);
    console.log("fileUri:", file.uri);
    console.log("fileName:", file.name, "| mimeType:", file.type);
    console.log("fieldName: images[]");
    console.log("===============================\n");
  }

  let result;
  try {
    result = await fileToUpload.upload(url, {
      httpMethod: "POST",
      uploadType: UploadType.MULTIPART,
      fieldName: "images[]",
      mimeType: file.type,
      headers: {
        login_token: "SDKWOOD",
        code_token: "SDKWOOD/2026@!!",
        auth_token,
      },
    });
  } catch (error: any) {
    if (__DEV__) {
      console.log("\n====== UPLOAD PHOTO ERROR ======");
      console.log("message:", error?.message ?? error);
      console.log("===============================\n");
    }
    throw error;
  }

  if (__DEV__) {
    console.log("\n====== UPLOAD PHOTO RESPONSE ======");
    console.log("HTTP status:", result.status);
    console.log("Body:", (result.body ?? "").slice(0, 500));
    console.log("==================================\n");
  }

  const text = result.body ?? "";
  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(
      `Réponse non-JSON (HTTP ${result.status}): ${text.slice(0, 200)}`,
    );
  }

  if (parsed.status === false) {
    throw new Error(parsed.message || "Erreur lors de l'envoi de la photo");
  }

  return (parsed.data as VisitPhoto[]) ?? null;
};

export const deleteVisitPhotos = async ({
  visitId,
  photoIds,
}: {
  visitId: string;
  photoIds: string[];
}) => {
  return client.request<null>({
    pathname: "/sdkboard/api/rounds/visits.php",
    method: "DELETE",
    searchParams: {
      action: "deletePhoto",
      id: visitId,
      photoIds: photoIds.join(","),
    },
    isDebug: true,
  });
};

export const deletePanneauChantierPhoto = async ({
  visitId,
}: {
  visitId: string;
}) => {
  return client.request<null>({
    pathname: "/sdkboard/api/rounds/panneau_chantier.php",
    method: "DELETE",
    searchParams: { id: visitId },
    isDebug: true,
  });
};

export const uploadPanneauChantierPhoto = async ({
  visitId,
  file,
}: {
  visitId: string;
  file: UploadVisitFile;
}) => {
  const base = (apiUrl ?? "").replace(/\/+$/, "");
  const url = `${base}/sdkboard/api/rounds/panneau_chantier.php?id=${encodeURIComponent(
    String(visitId),
  )}`;
  const auth_token = (await SecureStore.getItemAsync("sessionToken")) ?? "";

  if (__DEV__) {
    console.log("\n====== UPLOAD PANNEAU CHANTIER DEBUG ======");
    console.log("URL:", url);
    console.log("fileUri:", file.uri);
    console.log("fileName:", file.name, "| mimeType:", file.type);
    console.log("fieldName: image");
    console.log("===========================================\n");
  }

  let result;
  try {
    result = await new File(file.uri).upload(url, {
      httpMethod: "POST",
      uploadType: UploadType.MULTIPART,
      fieldName: "image",
      mimeType: file.type,
      headers: {
        login_token: "SDKWOOD",
        code_token: "SDKWOOD/2026@!!",
        auth_token,
      },
    });
  } catch (error: any) {
    if (__DEV__) {
      console.log("\n====== UPLOAD PANNEAU CHANTIER ERROR ======");
      console.log("message:", error?.message ?? error);
      console.log("===========================================\n");
    }
    throw error;
  }

  if (__DEV__) {
    console.log("\n====== UPLOAD PANNEAU CHANTIER RESPONSE ======");
    console.log("HTTP status:", result.status);
    console.log("Body:", (result.body ?? "").slice(0, 500));
    console.log("==============================================\n");
  }

  const text = result.body ?? "";
  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(
      `Réponse non-JSON (HTTP ${result.status}): ${text.slice(0, 200)}`,
    );
  }

  if (parsed.status === false) {
    throw new Error(
      parsed.message || "Erreur lors de l'envoi de la photo du panneau",
    );
  }

  return parsed.data ?? null;
};
