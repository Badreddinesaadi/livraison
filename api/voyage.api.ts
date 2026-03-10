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
    isDebug: true,
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
  nomChauffeur: string;
  idVehicule: number;
  km_depart: number;
  depot_depart: number;
  depot_nom: string;
  bl_list: BLItem[];
};
export const listVoyage = async ({ page }: { page: number }) => {
  const result = await client.request<VoyageListItem[]>({
    pathname: `/sdkboard/api/homescreen/voyage.php?page=${page}`,
    method: "GET",
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
    pathname: "/sdkboard/api/homescreen/voyage.php",
    method: "PUT",
    body: request,
    isDebug: true,
  });
  return data;
};

export const deleteVoyage = async (idVoyage: number) => {
  const data = await client.request({
    pathname: "/sdkboard/api/homescreen/voyage.php",
    method: "DELETE",
    body: { id: idVoyage },
    isDebug: true,
  });
  return data;
};
