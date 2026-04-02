import { client } from "@/constants/client";

export type Ville = {
  id: number;
  designation: string; //name
};

export const ListVilles = async (): Promise<Ville[] | null> => {
  const data = await client.request<Ville[]>({
    pathname: "/sdkboard/api/ville/ville.php",
    method: "GET",
  });
  return data;
};
