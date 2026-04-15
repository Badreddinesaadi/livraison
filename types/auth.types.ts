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
  permission: Permissions;
};
type Permissions = {
  [key in "voyage" | "retour" | "rotation" | "projet" | "rapport qualite"]: (
    | "CREATE"
    | "UPDATE"
    | "LIST"
    | "DELETE"
    | "TAKE_PICTURE_BL"
    | "CLOSE_BL"
    | "ACHEVER_BL"
  )[];
};
export type AuthLoginResponse = {
  status: boolean;
  message: string;
  data?: User | null;
};
