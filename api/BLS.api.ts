import { client, Pagination } from "@/constants/client";

type BLResponse = {
  id: number;
  code: string;
  id_entreprise: number;
  datetime_document: string;
  nomClient: string;
};
export const listBLSEnCours = async ({
  page,
  codeQuery,
}: {
  page: number;
  codeQuery?: string;
}): Promise<{
  data: BLResponse[] | null;
  pagination: Pagination | null;
}> => {
  const data = await client.request<BLResponse[]>({
    pathname:
      "/api/homescreen/bl_voyage_list.php?page=" +
      page +
      (codeQuery ? "&codeQuery=" + codeQuery : ""),
    method: "GET",
    withPagination: true,
    isDebug: false,
  });
  return {
    data: data.data,
    pagination: data.pagination as Pagination | null,
  };
};

export const closeBL = async ({
  idVoyage,
  images,
  status,
  idBL,
  coordinates,
  offline,
}: {
  idVoyage: number;
  idBL: number;
  images: {
    uri: string;
    name: string;
    type: string;
  }[];
  status: string;
  coordinates: { x: number; y: number } | null;
  offline?: boolean;
}) => {
  const formdata = new FormData();
  formdata.append("idBL", idBL.toString());
  formdata.append("idVoyage", idVoyage.toString());
  formdata.append("status", status);
  images.forEach((image) => {
    formdata.append("images[]", image as any);
  });
  if (coordinates) {
    formdata.append("coordinates", JSON.stringify(coordinates));
  }
  if (offline) {
    formdata.append("offline", "1");
  }

  return await client.request({
    pathname: "/api/homescreen/voyage_chauffeur.php",
    method: "POST",
    body: formdata,
    isDebug: true,
  });
};
