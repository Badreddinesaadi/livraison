import { client, Pagination } from "@/constants/client";

export type Rotation = {
  vehicule: string;
  chauffeur: string; //name
  km_parcourus: number;
};

export const ListRotations = async ({
  page,
  date_au,
  date_du,
  vehicule_id,
}: {
  page?: number;
  date_du?: string; // yyyy-mm-dd
  date_au?: string; // yyyy-mm-dd
  vehicule_id?: number;
}): Promise<{
  data: Rotation[] | null;
  pagination: Pagination | null;
}> => {
  const res = await client.request<Rotation[]>({
    pathname: "/sdkboard/api/homescreen/rotation_chauffeur.php",
    method: "GET",
    withPagination: true,
    searchParams: {
      ...(page ? { page } : {}),
      ...(date_du ? { date_du } : {}),
      ...(date_au ? { date_au } : {}),
      ...(vehicule_id ? { vehicule_id } : {}),
    },
  });
  return {
    data: res.data,
    pagination: res.pagination as Pagination | null,
  };
};
