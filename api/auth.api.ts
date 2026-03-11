import { client } from "@/constants/client";
import { User } from "@/types/auth.types";
import * as SecureStore from "expo-secure-store";

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

export const getCurrentUser = async (): Promise<User | null> => {
  let sessionToken = await SecureStore.getItemAsync("sessionToken");
  // console.log("getCurrentUser called with token:", sessionToken);
  const data = await client.request<User>({
    method: "GET",
    pathname: "/sdkboard/api/users/users.php",
    headers: {
      auth_token: sessionToken!,
    },
  });
  // console.log("getCurrentUser API response:", data);

  return data;
};
