import { apiUrl } from "@/constants/query";
import { User } from "@/types/auth.types";

export const signInWithEmailAndPassword = async (
  username: string,
  password: string,
): Promise<User | null> => {
  const res = await fetch(apiUrl + "/sdkboard/api/users/authentification.php", {
    method: "POST",
    body: JSON.stringify({ username, password }),
    headers: {
      "Content-Type": "application/json",
      login_token: "SDKWOOD",
      code_token: "SDKWOOD/2026@!!",
    },
  });
  const data = (await res.json()) as User | null;
  return data;
};

export const getCurrentUser = async (
  sessionToken: string,
): Promise<User | null> => {
  const res = await fetch(apiUrl + "/sdkboard/api/users/getCurrentUser.php", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      login_token: "SDKWOOD",
      code_token: "SDKWOOD/2026@!!",
      session_token: sessionToken,
    },
  });
  const data = (await res.json()) as User | null;
  return data;
};
