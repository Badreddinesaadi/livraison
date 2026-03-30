import { client, Pagination } from "@/constants/client";

export type OUINon = "oui" | "non";
export type Reclamation =
  | "Retard de livraison"
  | "Prix incorrect"
  | "Qte incorrecte"
  | "Mauvaise qualité"
  | null;
type Image = {
  id: string;
  nom_fichier: string;
  chemin_fichier: string;
  date_upload: string;
};
export type Return = {
  id: number;
  Bl_cachetet: OUINon;
  reglement: OUINon;
  retour_Mse: OUINon;
  date: string | undefined;
  reclamation: Reclamation;
  commentaire: string | null | undefined;
  statut: "terminer" | "envoyer" | "refuser" | "";
  nomChauffeur: string | null;
  chauffeur_id: number | null;
  client_id: number | null;
  client: string | null;
  images: Image[] | null;
};

export type UploadReturnFile = {
  uri: string;
  name: string;
  type: string;
};

export type CreateReturnRequest = {
  Bl_cachetet: OUINon;
  reglement: OUINon;
  retour_Mse: OUINon;
  reclamation?: Reclamation;
  client_id: string;
  files: UploadReturnFile[];
};

export const listReturn = async ({
  page,
  chauffeur_id,
  client_id,
}: {
  page: number;
  chauffeur_id?: number;
  client_id?: number;
}) => {
  const result = await client.request<Return[]>({
    pathname: `/sdkboard/api/homescreen/retour_chauffeur.php`,
    method: "GET",
    searchParams: {
      page,
      ...(chauffeur_id ? { chauffeur_id } : {}),
      ...(client_id ? { client_id } : {}),
    },
    isDebug: false,
    withPagination: true,
  });

  return {
    data: result.data,
    pagination: result.pagination as Pagination | null,
  };
};

export const getReturnById = async ({ id }: { id: string }) => {
  const result = await client.request<Return[]>({
    pathname: `/sdkboard/api/homescreen/retour_chauffeur.php?id=${id}`,
    method: "GET",
    isDebug: false,
  });

  return result?.[0] ?? null;
};

export const createReturn = async (request: CreateReturnRequest) => {
  const formData = new FormData();

  formData.append("Bl_cachetet", request.Bl_cachetet);
  formData.append("reglement", request.reglement);
  formData.append("retour_Mse", request.retour_Mse);
  if (request.reclamation) {
    formData.append("reclamation", request.reclamation);
  }
  formData.append("client_id", request.client_id);

  request.files.forEach((file) => {
    formData.append("images[]", {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as any);
  });

  return client.request({
    pathname: `/sdkboard/api/homescreen/retour_chauffeur.php`,
    method: "POST",
    body: formData,
    isDebug: true,
  });
};

export const deleteReturn = async (returnId: number) => {
  const data = await client.request({
    pathname: "/sdkboard/api/homescreen/retour_chauffeur.php",
    method: "DELETE",
    body: { id: returnId },
    isDebug: true,
  });
  return data;
};

export const ValidateReturn = async ({
  id,
  statut,
  commentaire,
}: {
  id: string;
  statut: "terminer" | "refuser";
  commentaire: string;
}) => {
  return client.request({
    pathname: `/sdkboard/api/homescreen/retour_chauffeur.php`,
    method: "PUT",
    body: {
      id,
      statut,
      commentaire,
    },
    isDebug: true,
  });
};
