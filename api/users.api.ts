import { client } from "@/constants/client";
import { Chauffeur, Client } from "@/types/user.types";

export const ListChauffeurs = async (): Promise<Chauffeur[] | null> => {
  const data = await client.request<Chauffeur[]>({
    pathname: "/sdkboard/api/users/chauffeur.php",
    method: "GET",
  });
  return data;
};
export const ListClients = async (): Promise<Client[] | null> => {
  const data = await client.request<Client[]>({
    pathname: "/sdkboard/api/users/clients.php",
    method: "GET",
  });
  return data;
};
