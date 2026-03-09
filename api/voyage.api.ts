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

export type BLItem = {
  id: number;
  code: string;
  nomClient: string;
  datetime_document: string;
  images: string[];
};

export type VoyageListItem = {
  id: number;
  date_depart: string;
  idChauffeur: number;
  idVehicule: number;
  km_depart: number;
  depot_depart: string;
  bl_list: BLItem[];
};
export const listVoyage = async () => {
  //log body
  const data = await client.request<VoyageListItem[]>({
    pathname: "/sdkboard/api/homescreen/voyage.php",
    method: "GET",
    isDebug: true,
  });
  return data;
};

export const updateVoyage = async (
  request: CreateVoyageRequest & { idVoyage: number },
) => {
  //log body
  const data = await client.request({
    pathname: "/sdkboard/api/homescreen/voyage.php",
    method: "PUT",
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
