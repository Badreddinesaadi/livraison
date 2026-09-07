import { client } from "@/constants/client";
import { ReferenceData } from "@/types/rvt.types";

export const getReferenceData = async (): Promise<ReferenceData | null> => {
  return client.request<ReferenceData>({
    pathname: "/sdkboard/api/homescreen/rapport_terrain.php",
    method: "GET",
    isDebug: true,
  });
};
