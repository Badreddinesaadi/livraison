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
      "/sdkboard/api/homescreen/bl_voyage_list.php?page=" +
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
}: {
  idVoyage: number;
  idBL: number;
  images: {
    uri: string;
    name: string;
    type: string;
  }[];
  status: string;
  coordinates: { x: number; y: number };
}) => {
  const formdata = new FormData();
  formdata.append("idBL", idBL.toString());
  formdata.append("idVoyage", idVoyage.toString());
  formdata.append("status", status);
  images.forEach((image, index) => {
    formdata.append("images[]", image as any);
    if (index === 0) {
      formdata.append("image", image as any);
    }
  });
  formdata.append("coordinates", JSON.stringify(coordinates));

  const data = await client.request({
    pathname: "/sdkboard/api/homescreen/voyage_chauffeur.php",
    method: "POST",
    body: formdata,
    isDebug: true,
  });
  return data;
};
