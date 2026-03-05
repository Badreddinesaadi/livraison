import { client } from "@/constants/client";
import { Depot } from "@/types/user.types";

export const ListDepots = async (): Promise<Depot[] | null> => {
  const data = await client.request<Depot[]>({
    pathname: "/sdkboard/api/depots/depots.php",
    method: "GET",
  });
  return data;
};
