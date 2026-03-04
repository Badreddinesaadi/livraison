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
  // console.log("API response:", data);
  return data;
};

export const getCurrentUser = async (
  sessionToken: string,
): Promise<User | null> => {
  // console.log("getCurrentUser called with token:", sessionToken);
  const data = await client.request<User>({
    method: "GET",
    pathname: "/sdkboard/api/users/users.php",
    headers: {
      session_token: sessionToken,
    },
  });
  // console.log("getCurrentUser API response:", data);

  return data;
};
