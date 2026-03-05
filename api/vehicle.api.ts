import { client } from "@/constants/client";
import { Vehicle } from "@/types/user.types";

export const ListVehicles = async (): Promise<Vehicle[] | null> => {
  const data = await client.request<Vehicle[]>({
    pathname: "/sdkboard/api/vehicule/vehicule.php",
    method: "GET",
  });
  return data;
};
