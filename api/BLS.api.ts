import { client } from "@/constants/client";
import { BL } from "@/types/bl.types";

export const listBLSEnCours = async (): Promise<BL[] | null> => {
  const data = await client.request<BL[]>({
    pathname: "/sdkboard/api/homescreen/bl_voyage_list.php",
    method: "GET",
  });
  return data;
};
