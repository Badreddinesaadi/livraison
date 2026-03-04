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
  });
  console.log("API response:", data);
  return data;
};

export const getCurrentUser = async (
  sessionToken: string,
): Promise<User | null> => {
  const data = await client.request<User>({
    method: "GET",
    headers: {
      session_token: sessionToken,
    },
    pathname: "/sdkboard/api/users/getCurrentUser.php",
  });
  return data;
};
