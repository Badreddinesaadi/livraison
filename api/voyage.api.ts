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
    isDebug: true,
  });
  return data;
};
