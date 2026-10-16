import { client, Pagination } from "@/constants/client";

export type NamedRef = {
  id: number;
  name: string;
};

export type DevisPreparation = {
  id: number;
  document: string;
  date: string;
  client: NamedRef;
  ville: NamedRef;
  modeLivraison: string;
  commercial: NamedRef;
  statut: string;
  statutLabel: string;
  createdby: NamedRef;
  nbLignes: number;
};

export type DevisProduitLot = {
  preparation: boolean;
  id: string;
  code: string;
  qte: number;
  nbrePce: number;
  long: string;
  observ: string;
  dateEntree: string;
  depot: NamedRef;
  createdby: NamedRef;
};

export type DevisProduit = {
  preparation: boolean;
  id: number;
  name: string;
  stock: number;
  qteResa: number;
  qtecmde: number;
  unite: string;
  restealivre: number;
  lots: DevisProduitLot[];
};

export type DevisPreparationFilters = {
  document?: string;
  clientId?: number;
  statut?: string;
  villeId?: number;
  commercialId?: number;
  dateFrom?: string;
  dateTo?: string;
};

export const listPreparationsDevis = async ({
  page,
  perPage,
  ...filters
}: { page: number; perPage?: number } & DevisPreparationFilters) => {
  const result = await client.request<DevisPreparation[]>({
    pathname: "/api/homescreen/prepaption_devis.php",
    method: "GET",
    searchParams: { page, perPage, ...filters },
    withPagination: true,
    isDebug: true,
  });

  return {
    data: result.data,
    pagination: result.pagination as Pagination | null,
  };
};

export const getDevisProduits = async ({
  idDevis,
}: {
  idDevis: string | number;
}) => {
  const result = await client.request<DevisProduit[]>({
    pathname: "/api/homescreen/preparation_devis_produits.php",
    method: "GET",
    searchParams: { idDevis },
    isDebug: true,
  });

  return result ?? [];
};

export type PreparerDevisProduitRequest = {
  type: "preparer_produit";
  idDevis: number;
  idProduit: number;
};

export type PreparerDevisLotRequest = {
  type: "preparer_lot";
  idDevis: number;
  idProduit: number;
  idLot: string;
};

export const preparerDevisProduit = async (
  request: PreparerDevisProduitRequest,
) => {
  return client.request({
    pathname: "/api/homescreen/preparation_devis_produits.php",
    method: "POST",
    body: request,
    isDebug: true,
  });
};

export const preparerDevisLot = async (request: PreparerDevisLotRequest) => {
  return client.request({
    pathname: "/api/homescreen/preparation_devis_produits.php",
    method: "POST",
    body: request,
    isDebug: true,
  });
};

export type RemplacerDevisLotRequest = {
  type: "remplacer_lot";
  idDevis: number;
  idProduit: number;
  idLot: string;
  idNouveauLot: string;
};

export const remplacerDevisLot = async (request: RemplacerDevisLotRequest) => {
  return client.request({
    pathname: "/api/homescreen/preparation_devis_produits.php",
    method: "PUT",
    body: request,
    isDebug: true,
  });
};
