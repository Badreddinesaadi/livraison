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

type VoyageListItem = {
  //  "idVoyage": 29,
  //           "num_bl": "BDC2300047,BDC2300035,BDC2300025,BDC2300036",
  //           "idClient": 1390,
  //           "dateBL": "2023-07-17 14:20:50",
  //           "montant_ttc": "16368.00",
  //           "idVehicule": 6,
  //           "date_depart": "2026-03-10 03:38:00",
  //           "depot_depart": "",
  //           "idChauffeur": 91,
  //           "nomChauffeur": "AYOUB ORKHIS"

  idVoyage: number;
  num_bl: string;
  idClient: number;
  dateBL: string;
  montant_ttc: string;
  idVehicule: number;
  date_depart: string;
  depot_depart: string;
  idChauffeur: number;
  nomChauffeur: string;
};
export const listVoyage = async () => {
  //log body
  const data = await client.request<VoyageListItem[]>({
    pathname: "/sdkboard/api/homescreen/bl_voyage_list.php",
    method: "GET",
    isDebug: true,
  });
  return data;
};
