export type User = {
  user_id: number;
  token: string;
  name: string;
};

export type AuthLoginResponse = {
  status: boolean;
  message: string;
  data?: User | null;
};
