import { client } from "@/constants/client";

type BLResponse = {
  id: number;
  code: string;
  id_entreprise: number;
  datetime_document: string;
  nomClient: string;
};
export const listBLSEnCours = async (): Promise<BLResponse[] | null> => {
  const data = await client.request<BLResponse[]>({
    pathname: "/sdkboard/api/homescreen/bl_voyage_list.php",
    method: "GET",
  });
  return data;
};
