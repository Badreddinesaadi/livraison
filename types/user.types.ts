export type Chauffeur = {
  id: number;
  name: string;
  idDepartement: number;
  telephone: string;
  fonction: string;
  role: string;
  photoIdentite: string;
  photo: string;
};

export type Vehicle = {
  id: number;
  immatriculation: string;
  vehiculeType: string;
  vehiculeMarque: string;
  km_reel: string | null;
  compteurActuel: number | null;
};
export type Depot = {
  id: number;
  code: string;
  active: "y" | "n";
  nom: string;
  enable_stock: "y" | "n";
};
