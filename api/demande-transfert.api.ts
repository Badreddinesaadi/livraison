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

export const listDemandeTransfert = async ({
  page,
  searchquery,
}: {
  page: number;
  searchquery?: string;
}) => {
  const result = await client.request<DemandeTransfert[]>({
    pathname: "/sdkboard/api/homescreen/demande_transfert.php",
    method: "GET",
    searchParams: {
      page,
      ...(searchquery ? { searchquery } : {}),
    },
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

export type DemandeTransfertLot = {
  idItem: string;
  idProduit: string;
  Lot: string;
  preparer: string;
  qte: string;
  qte_uv: string;
  idModif: string;
  old_lot: string;
  depotName?: string;
  depotId?: number;
  long?: string;
  date_entree?: string;
  nbre_pce?: string;
};

export type DemandeTransfertProduct = {
  id: string;
  idDT: string;
  idSource: string;
  idProduit: string;
  nbrFDX: string;
  Qte: string;
  Unite: string;
  preparer: string;
  produit: string;
  unite_v: string;
  lots: DemandeTransfertLot[];
};

export type DemandeTransfertDetails = {
  idDT: number;
  count: number;
  details: DemandeTransfertProduct[];
};

export const getDemandeTransfertDetails = async ({ id }: { id: string }) => {
  const result = await client.request<DemandeTransfertDetails>({
    pathname: "/sdkboard/api/homescreen/details_demande_transfert.php",
    method: "GET",
    searchParams: { idDT: id, details: 1 },
    isDebug: true,
  });

  return result;
};

export type AddProductToDTRequest = {
  type: "detail";
  idDT: number;
  idProduit: number;
  qte: number;
  nbrFDX: number;
  unite: string;
};

export type DeleteProductFromDTRequest = {
  type: "detail";
  id: string | number;
};

export type LotInsertItem = {
  idItem: string;
  idProduit: number;
  Lot: string;
  qte: number;
};

export type LotDeleteItem = {
  idItem: string;
  idProduit: string;
  Lot: string;
};

export type UpdateLotsRequest = {
  type: "update_lot";
  lots_update: never[];
  lots_insert: LotInsertItem[];
  lots_delete: LotDeleteItem[];
};

export const addProductToDT = async (request: AddProductToDTRequest) => {
  return client.request({
    pathname: "/sdkboard/api/homescreen/details_demande_transfert.php",
    method: "POST",
    body: request,
    isDebug: true,
  });
};

export const deleteProductFromDT = async (
  request: DeleteProductFromDTRequest,
) => {
  return client.request({
    pathname: "/sdkboard/api/homescreen/details_demande_transfert.php",
    method: "DELETE",
    body: request,
    isDebug: true,
  });
};

export const updateProductLots = async (request: UpdateLotsRequest) => {
  return client.request({
    pathname: "/sdkboard/api/homescreen/details_demande_transfert.php",
    method: "PUT",
    body: request,
    isDebug: true,
  });
};
