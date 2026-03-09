import { client } from "@/constants/client";

export type CreateVoyageRequest = {
  date_depart: string;
  idChauffeur: number;
  idVehicule: number;
  depot_depart: string;
  km_depart: number;
  bl_list: number[];
};

export const createVoyage = async (request: CreateVoyageRequest) => {
  //log body
  const data = await client.request({
    pathname: "/sdkboard/api/homescreen/voyage.php",
    method: "POST",
    body: request,
  });
  return data;
};

export type VoyageListItem = {
  idVoyage: number;
  num_bl: string | null;
  idClient: number | null;
  dateBL: string | null;
  montant_ttc: string | null;
  idVehicule: number | null;
  date_depart: string | null;
  depot_depart: string | null;
  idChauffeur: number | null;
  immatriculation: string | null;
  nomChauffeur: string | null;
  km_depart: number | null;
};
export const listVoyage = async () => {
  //log body
  const data = await client.request<VoyageListItem[]>({
    pathname: "/sdkboard/api/homescreen/bl_voyage_list.php",
    method: "GET",
  });
  return data;
};

export const updateVoyage = async (
  request: Omit<CreateVoyageRequest, "idVoyage">,
) => {
  //log body
  const data = await client.request({
    pathname: "/sdkboard/api/homescreen/voyage.php",
    method: "DELETE",
    body: request,
  });
  return data;
};

export const deleteVoyage = async (idVoyage: number) => {
  const data = await client.request({
    pathname: "/sdkboard/api/homescreen/voyage.php",
    method: "DELETE",
    body: { idVoyage },
  });
  return data;
};
