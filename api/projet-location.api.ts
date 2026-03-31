import { client, Pagination } from "@/constants/client";

export type Projet = "chantier" | "depot";

type Image = {
  id: string;
  idProjet: number;
  nom_fichier: string;
  chemin_fichier: string;
  date_upload: string;
};
export type ProjetLocation = {
  id: number;
  projet: Projet;
  localisation: string; // json containing x , y coordinates
  commentaire: string;
  contact_nom: string;
  contact_telephone: string;
  date: string;
  idCreate: number | null;
  createur: string | null; // name of the creator
  chauffeur_id: number | null;
  client_id: number | null;
  images: Image[] | null;
};

export type UploadProjetLocationFile = {
  uri: string;
  name: string;
  type: string;
};

export type UploadReturnFile = UploadProjetLocationFile;

export type CreateProjetLocationRequest = {
  projet: Projet;
  localisation: { x: number; y: number };
  commentaire: string | undefined;
  contact_nom: string | undefined;
  contact_telephone: string | undefined;
  files: UploadProjetLocationFile[];
};

export const listProjetLocation = async ({
  page,
  createId,
}: {
  page: number;
  createId?: number;
}) => {
  const result = await client.request<ProjetLocation[]>({
    pathname: `/sdkboard/api/homescreen/projet.php`,
    method: "GET",
    searchParams: {
      page,
      ...(createId ? { createId } : {}),
    },
    isDebug: true,
    withPagination: true,
  });

  return {
    data: result.data,
    pagination: result.pagination as Pagination | null,
  };
};

export const getProjetLocationById = async ({ id }: { id: string }) => {
  const result = await client.request<ProjetLocation[]>({
    pathname: `/sdkboard/api/homescreen/projet.php?id=${id}`,
    method: "GET",
    isDebug: true,
  });

  return result?.[0] ?? null;
};

export const getReturnById = getProjetLocationById;

export const createProjetLocation = async (
  request: CreateProjetLocationRequest,
) => {
  const formData = new FormData();

  formData.append("projet", request.projet);
  formData.append("localisation", JSON.stringify(request.localisation));
  if (request.commentaire) {
    formData.append("commentaire", request.commentaire);
  }
  if (request.contact_nom) {
    formData.append("contact_nom", request.contact_nom);
  }
  if (request.contact_telephone) {
    formData.append("contact_telephone", request.contact_telephone);
  }

  request.files.forEach((file) => {
    formData.append("images[]", {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as any);
  });

  return client.request({
    pathname: `/sdkboard/api/homescreen/projet.php`,
    method: "POST",
    body: formData,
    isDebug: true,
  });
};
export const updateProjetLocation = async (
  request: { id: number } & Partial<Omit<CreateProjetLocationRequest, "files">>,
) => {
  return client.request({
    pathname: `/sdkboard/api/homescreen/projet.php`,
    method: "PUT",
    body: request,
    isDebug: true,
  });
};

export const deleteProjetLocation = async (projetId: number) => {
  const data = await client.request({
    pathname: "/sdkboard/api/homescreen/projet.php",
    method: "DELETE",
    body: { id: projetId },
    isDebug: true,
  });
  return data;
};

// export const ValidateReturn = async ({
//   id,
//   statut,
//   commentaire,
// }: {
//   id: string;
//   statut: "terminer" | "refuser";
//   commentaire: string;
// }) => {
//   return client.request({
//     pathname: `/sdkboard/api/homescreen/projet.php`,
//     method: "PUT",
//     body: {
//       id,
//       statut,
//       commentaire,
//     },
//     isDebug: true,
//   });
// };
