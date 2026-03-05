import { client } from "@/constants/client";
import { Chauffeur } from "@/types/user.types";

export const ListChauffeurs = async (): Promise<Chauffeur[] | null> => {
  const data = await client.request<Chauffeur[]>({
    pathname: "/sdkboard/api/users/chauffeur.php",
    method: "GET",
  });
  return data;
};
