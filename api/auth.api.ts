export const login = async (
  username: string,
  password: string,
): Promise<string> => {
  const res = await fetch(
    "192.168.1.111:8075/sdkboard/api/users/authentification.php",
    {
      method: "POST",
      body: JSON.stringify({ username, password }),
      headers: {
        "Content-Type": "application/json",
        login_token: "SDKWOOD",
        code_token: "SDKWOOD/2026@!!",
      },
    },
  );
  const data = await res.json();
  return data;
};
