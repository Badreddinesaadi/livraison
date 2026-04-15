import { client } from "@/constants/client";
import { User } from "@/types/auth.types";

export const signInWithEmailAndPassword = async (
  username: string,
  password: string,
): Promise<User | null> => {
  const data = await client.request<User>({
    method: "POST",
    body: { username, password },
    pathname: "/sdkboard/api/users/authentification.php",
    isDebug: true,
  });
  return data;
};

export const getCurrentUser = async (): Promise<User | null> => {
  const data = await client.request<User>({
    method: "GET",
    pathname: "/sdkboard/api/users/users.php",
  });

  return data;
};
