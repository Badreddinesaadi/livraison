import { client, Pagination } from "@/constants/client";

export type VehicleMode = "societe" | "location";

export type CreateVoyageRequest = {
  date_depart: string;
  depot_depart: number;
  idVille: number;
  type_vehicule: VehicleMode;
  idChauffeur?: number | null;
  idVehicule?: number | null;
  km_depart?: number | null;
  chauffeur_externe_nom?: string | null;
  societe_location_nom?: string | null;
  bl_list: { id: number }[];
};

export const createVoyage = async (request: CreateVoyageRequest) => {
  //log body
  const data = await client.request({
    pathname: "/api/homescreen/voyage.php",
    method: "POST",
    body: request,
    isDebug: true,
  });
  return data;
};

export type BLItem = {
  idVoyageBL: number;
  id: number;
  code: string;
  nomClient: string;
  datetime_document: string;
  images: Image[] | null;
  statut: "Livré" | "Encours";
  /** Locally closed offline — waiting to sync. */
  _pendingSync?: boolean;
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
  km_depart: number | null;
  statut: "encours" | "terminer";
  depot_depart: number;
  depot_nom: string;
  bl_list: BLItem[];
  km_retour: number | null;
  date_retour: string | null;
  date_create: string | null;
  idCreate: number | null;
  vehicule_nom: string | null;
  vehicule_immatriculation: string | null;
  idVille: number | null;
  ville_nom: string | null;
  type_vehicule: VehicleMode;
  chauffeur_externe_nom: string | null;
  societe_location_nom: string | null;
};
export const listVoyage = async ({
  page,
  codeQuery,
  idVehicule,
  idChauffeur,
  idDepot,
  idVille,
  idClient,
  typeVehicule,
}: {
  page: number;
  codeQuery?: string;
  idVehicule?: number;
  idChauffeur?: number;
  idDepot?: number;
  idVille?: number;
  idClient?: number;
  typeVehicule?: VehicleMode;
}) => {
  const result = await client.request<VoyageListItem[]>({
    pathname: `/api/homescreen/voyage.php`,
    method: "GET",
    searchParams: {
      page,
      ...(codeQuery ? { codeQuery } : {}),
      ...(idVehicule ? { idVehicule } : {}),
      ...(idChauffeur ? { idChauffeur } : {}),
      ...(idDepot ? { idDepot } : {}),
      ...(idVille ? { idVille } : {}),
      ...(idClient ? { idClient } : {}),
      ...(typeVehicule ? { typeVehicule } : {}),
    },
    isDebug: true,
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
    pathname: "/api/homescreen/voyage.php",
    method: "PUT",
    body: request,
    isDebug: true,
  });
  return data;
};

export const deleteVoyage = async (idVoyage: number) => {
  const data = await client.request({
    pathname: "/api/homescreen/voyage.php",
    method: "DELETE",
    body: { id: idVoyage },
    isDebug: true,
  });
  return data;
};

export const changeVoyageStatus = async (request: {
  statut: VoyageListItem["statut"];
  id: number;
  km_retour?: number;
  date_retour: string;
}) => {
  //log body
  const data = await client.request({
    pathname: "/api/homescreen/voyage.php",
    method: "PUT",
    body: request,
    isDebug: true,
  });
  return data;
};

export const getVoyageById = async ({ id }: { id: number }) => {
  const result = await client.request<VoyageListItem[]>({
    pathname: `/api/homescreen/voyage.php?id=${id}`,
    method: "GET",
    isDebug: false,
  });

  return result?.[0] ?? null;
};
