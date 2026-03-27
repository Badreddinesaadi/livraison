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
  reclamation: Reclamation;
  statut: "terminer" | "envoyer" | "";
  nomChauffeur: string | null;
  chauffeur_id: number | null;
  client_id: number | null;
  client: string | null;
  images: Image[] | null;
};

export type UploadReturnPhoto = {
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
  images: UploadReturnPhoto[];
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

  request.images.forEach((image) => {
    formData.append("images[]", {
      uri: image.uri,
      name: image.name,
      type: image.type,
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

export const ValidateReturn = async ({ id }: { id: string }) => {
  return client.request({
    pathname: `/sdkboard/api/homescreen/retour_chauffeur.php`,
    method: "PUT",
    body: {
      id,
      statut: "terminer",
    },
    isDebug: true,
  });
};
