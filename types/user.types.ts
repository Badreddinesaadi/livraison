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
  nameVehicule: string;
  vehiculeType: string;
  vehiculeMarque: string;
};
export type Depot = {
  id: number;
  code: string;
  active: "y" | "n";
  nom: "string";
  enable_stock: "y" | "n";
};
