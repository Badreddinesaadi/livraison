import { client, Pagination } from "@/constants/client";

export type QualityReportImage = {
  id: number;
  idRapportQualite: number;
  nom_fichier: string;
  chemin_fichier: string;
  date_upload: string;
  idCreate: number | null;
};

export type QualityReport = {
  id: number;
  dum: string | null;
  dossier: string | null;
  commentaire: string | null;
  user_id: number | null;
  date: string | undefined;
  idCreate: number | null;
  idModif: number | null;
  dateCreate: string | null;
  dateModif: string | null;
  images: QualityReportImage[] | null;
};

export type UploadQualityReportFile = {
  uri: string;
  name: string;
  type: string;
};

export type CreateQualityReportRequest = {
  dum?: string;
  dossier?: string;
  commentaire?: string;
  files: UploadQualityReportFile[];
};

export const listQualityReports = async ({ page }: { page: number }) => {
  const result = await client.request<QualityReport[]>({
    pathname: "/sdkboard/api/homescreen/rapport_qualite.php",
    method: "GET",
    searchParams: { page },
    isDebug: false,
    withPagination: true,
  });

  return {
    data: result.data,
    pagination: result.pagination as Pagination | null,
  };
};

export const getQualityReportById = async ({ id }: { id: string }) => {
  const result = await client.request<QualityReport[]>({
    pathname: `/sdkboard/api/homescreen/rapport_qualite.php?id=${id}`,
    method: "GET",
    isDebug: false,
  });

  return result?.[0] ?? null;
};

export const createQualityReport = async (
  request: CreateQualityReportRequest,
) => {
  const dum = request.dum?.trim() ?? "";
  const dossier = request.dossier?.trim() ?? "";

  if (!dum && !dossier) {
    throw new Error("Au moins un champ entre DUM et dossier est requis.");
  }

  const formData = new FormData();

  if (dum) {
    formData.append("dum", dum);
  }

  if (dossier) {
    formData.append("dossier", dossier);
  }

  const commentaire = request.commentaire?.trim();
  if (commentaire) {
    formData.append("commentaire", commentaire);
  }

  request.files.forEach((file) => {
    formData.append("images[]", {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as any);
  });

  return client.request({
    pathname: "/sdkboard/api/homescreen/rapport_qualite.php",
    method: "POST",
    body: formData,
    isDebug: true,
  });
};

export const deleteQualityReport = async (qualityReportId: number) => {
  const data = await client.request({
    pathname: "/sdkboard/api/homescreen/rapport_qualite.php",
    method: "DELETE",
    body: { id: qualityReportId },
    isDebug: true,
  });

  return data;
};
