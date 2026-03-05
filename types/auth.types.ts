export type User = {
  user_id: number;
  token: string;
  idDepartement: number;
  telephone: string;
  fonction: string;
  role:
    | "admin"
    | "user"
    | "parc"
    | "dg"
    | "rh"
    | "admin"
    | "tresorier"
    | "comptable"
    | "rstock"
    | "rreception"
    | "adv"
    | "daf"
    | "dc"
    | "chauffeur"
    | "commercial";
  name: string;
};

export type AuthLoginResponse = {
  status: boolean;
  message: string;
  data?: User | null;
};
