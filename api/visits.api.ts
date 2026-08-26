import { client, Pagination } from "@/constants/client";
import {
  VisitCreate,
  VisitPatch,
  VisitPhoto,
  VisitReport,
} from "@/types/rvt.types";

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
    method: "PATCH",
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
  capturedAt,
}: {
  visitId: string;
  file: UploadVisitFile;
  capturedAt: string;
}) => {
  const formData = new FormData();
  formData.append("images", {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as any);
  formData.append("capturedAt", capturedAt);

  return client.request<VisitPhoto>({
    pathname: "/sdkboard/api/rounds/visits.php",
    method: "POST",
    searchParams: { action: "addPhoto", id: visitId },
    body: formData,
    isDebug: true,
  });
};

export const deleteVisitPhoto = async ({
  visitId,
  photoId,
}: {
  visitId: string;
  photoId: string;
}) => {
  return client.request<null>({
    pathname: "/sdkboard/api/rounds/visits.php",
    method: "DELETE",
    searchParams: { action: "deletePhoto", id: visitId, photoId },
    isDebug: true,
  });
};
