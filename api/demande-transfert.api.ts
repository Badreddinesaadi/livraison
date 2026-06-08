import { client, Pagination } from "@/constants/client";

export type DemandeTransfert = {
  id: number;
  id_ancien: number;
  reference: string;
  dum: string;
  transporteur: string;
  matricule: string;
  date: string;
  idDepotSource: number;
  idDepotDestination: number;
  idCreate: number;
  idModif: number;
  observation: string;
  statut: string;
  idValider: string | null;
  dateValider: string | null;
  datePreparation: string | null;
  dateValidation: string | null;
  validate_by: string | null;
  idSigneDemamdeur: number;
  dateSingeDemandeur: string;
  idEnvoie: number;
  dateEnvoie: string;
  idRecu: number;
  dateRecu: string;
  depot_source: string | null;
  depot_destination: string | null;
  createur: string;
};

export type CreateDemandeTransfertRequest = {
  idDepotSource: number;
  idDepotDestination: number;
  dum: string;
  transporteur: string;
  matricule: string;
  observation?: string;
};

export const listDemandeTransfert = async ({ page }: { page: number }) => {
  const result = await client.request<DemandeTransfert[]>({
    pathname: "/sdkboard/api/homescreen/demande_transfert.php",
    method: "GET",
    searchParams: { page },
    isDebug: true,
    withPagination: true,
  });

  return {
    data: result.data,
    pagination: result.pagination as Pagination | null,
  };
};

export const createDemandeTransfert = async (
  request: CreateDemandeTransfertRequest,
) => {
  return client.request({
    pathname: "/sdkboard/api/homescreen/demande_transfert.php",
    method: "POST",
    body: request,
    isDebug: true,
  });
};
