import { client } from "@/constants/client";
import { Chauffeur, Client, Commercial } from "@/types/user.types";

export const ListChauffeurs = async (): Promise<Chauffeur[] | null> => {
  const data = await client.request<Chauffeur[]>({
    pathname: "/api/users/chauffeur.php",
    method: "GET",
  });
  return data;
};
export const ListClients = async (): Promise<Client[] | null> => {
  const data = await client.request<Client[]>({
    pathname: "/api/users/clients.php",
    method: "GET",
  });
  return data;
};
export const ListCommerciaux = async (): Promise<Commercial[] | null> => {
  const data = await client.request<Commercial[]>({
    pathname: "/api/users/commercials.php",
    method: "GET",
  });
  return data;
};
