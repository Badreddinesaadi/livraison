import { client } from "@/constants/client";

export type Produit = {
  produit_id: number;
  type_stock: string;
  reference: string;
  produit: string;
  id_categ: number;
  id_scateg: number;
  categorie: string;
  scategorie: string;
  long: string;
  larg: string;
  epai: string;
  categ2: string;
  section: string;
  qualite: string;
  av_plot: string;
  ad_kd: string;
  ess_coul: string;
  finition: string;
  f1_2f: string;
  fournisseur: string;
  pays: string;
  marque: string;
  idUniteP: number;
  unite: string;
  unite_v: string;
  id_marque: number;
  longueur: string;
  largeur: string;
  epaisseur: string;
  vente_budget: string;
  alert_stock: string;
  idCouleur: number;
  couleur: string;
  colorCode: string;
};

export type ProduitLot = {
  id_depot: number;
  product_id: number;
  color_id: number;
  couleur: string;
  colorCode: string;
  num_lot: string;
  longueur: string;
  nbrePiece: string;
  observation: string;
  date: string;
  nbreJrs: number;
  solde: string;
  qte_uv: number;
  depot: string;
  unite_v: string;
  tarif: string;
};

export const listProduits = async () => {
  const data = await client.request<Produit[]>({
    pathname: "/sdkboard/api/produit/produits.php",
    method: "GET",
    isDebug: true,
  });
  return data ?? [];
};

export const getProductLots = async ({
  idProduit,
}: {
  idProduit: number | string;
}) => {
  const data = await client.request<ProduitLot[]>({
    pathname: "/sdkboard/api/produit/lots_produits.php",
    method: "GET",
    searchParams: { idProduit },
    isDebug: true,
  });
  return data ?? [];
};