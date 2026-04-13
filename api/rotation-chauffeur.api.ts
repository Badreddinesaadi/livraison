import { client, Pagination } from "@/constants/client";

export type Rotation = {
  id: number;
  vehicule: string;
  vehicule_id: number;
  chauffeur: string; // name
  chauffeur_id: number; // id
  km_parcourus: number;
  disponibilite: boolean;
  date_depart: string | null;
  date_retour: string | null;
  ville: string; //vile d'arrivée
};

export const ListRotations = async ({
  page,
  date_au,
  date_du,
  vehicule_id,
  chauffeur_id,
  disponibilite,
}: {
  page?: number;
  date_du?: string; // yyyy-mm-dd
  date_au?: string; // yyyy-mm-dd
  vehicule_id?: number;
  chauffeur_id?: number;
  disponibilite?: boolean;
}): Promise<{
  data: Rotation[] | null;
  pagination: Pagination | null;
}> => {
  const searchParams = {
    ...(page ? { page } : {}),
    ...(date_du ? { date_du } : {}),
    ...(date_au ? { date_au } : {}),
    ...(vehicule_id ? { vehicule_id } : {}),
    ...(chauffeur_id ? { chauffeur_id } : {}),
    ...(typeof disponibilite === "boolean"
      ? { disponibilite: disponibilite }
      : {}),
  };
  const res = await client.request<Rotation[]>({
    pathname: "/sdkboard/api/homescreen/rotation_chauffeur.php",
    method: "GET",
    withPagination: true,
    isDebug: true,
    searchParams: searchParams,
  });
  console.log("RotationChauffeur search:", searchParams);
  return {
    data: res.data,
    pagination: res.pagination as Pagination | null,
  };
};
