import { client, Pagination } from "@/constants/client";

export type CreateVoyageRequest = {
  date_depart: string;
  idChauffeur: number;
  idVehicule: number;
  depot_depart: number;
  km_depart: number;
  bl_list: { id: number }[];
};

export const createVoyage = async (request: CreateVoyageRequest) => {
  //log body
  const data = await client.request({
    pathname: "/sdkboard/api/homescreen/voyage.php",
    method: "POST",
    body: request,
    isDebug: false,
  });
  return data;
};

export type BLItem = {
  id: number;
  code: string;
  nomClient: string;
  datetime_document: string;
  images: Image[] | null;
  statut: "Livré" | "Encours";
};

type Image = {
  id: number;
  nom_fichier: string;
  chemin_fichier: string;
  date_upload: string;
};
export type VoyageListItem = {
  id: number;
  date_depart: string | null;
  idChauffeur: number | null;
  nomChauffeur: string | null;
  idVehicule: number | null;
  km_depart: number;
  statut: "encours" | "terminer";
  depot_depart: number;
  depot_nom: string;
  bl_list: BLItem[];
  km_retour: number;
  date_retour: string | null;
  date_create: string | null;
  idCreate: number | null;
  vehicule_nom: string | null;
  vehicule_immatriculation: string | null;
};
export const listVoyage = async ({
  page,
  codeQuery,
}: {
  page: number;
  codeQuery?: string;
}) => {
  const result = await client.request<VoyageListItem[]>({
    pathname: `/sdkboard/api/homescreen/voyage.php?page=${page}${codeQuery ? `&code=${codeQuery}` : ""}`,
    method: "GET",
    isDebug: false,
    withPagination: true,
  });

  return {
    data: result.data,
    pagination: result.pagination as Pagination | null,
  };
};

export const updateVoyage = async (
  request: CreateVoyageRequest & { id: number },
) => {
  //log body
  const data = await client.request({
    pathname: "/sdkboard/api/homescreen/voyage.php",
    method: "PUT",
    body: request,
    isDebug: false,
  });
  return data;
};

export const deleteVoyage = async (idVoyage: number) => {
  const data = await client.request({
    pathname: "/sdkboard/api/homescreen/voyage.php",
    method: "DELETE",
    body: { id: idVoyage },
    isDebug: false,
  });
  return data;
};

export const changeVoyageStatus = async (
  request: {
    statut: VoyageListItem["statut"];
  } & { id: number },
) => {
  //log body
  const data = await client.request({
    pathname: "/sdkboard/api/homescreen/voyage.php",
    method: "PUT",
    body: request,
    isDebug: true,
  });
  return data;
};

export const getVoyageById = async ({ id }: { id: number }) => {
  const result = await client.request<VoyageListItem>({
    pathname: `/sdkboard/api/homescreen/voyage.php?idVoyage=${id}`,
    method: "GET",
    isDebug: false,
  });

  return result;
};
