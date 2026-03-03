import { getCurrentUser, signInWithEmailAndPassword } from "@/api/auth.api";
import { useStorageState } from "@/hooks/use-storage-state";
import { User } from "@/types/auth.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, use, type PropsWithChildren } from "react";

const AuthContext = createContext<{
  signIn: (
    email: string,
    password: string,
    onErrorCallback?: () => void,
  ) => void;
  signOut: () => void;
  user?: User | null;
  isLoading: boolean;
}>({
  signIn: () => null,
  signOut: () => null,
  user: null,
  isLoading: false,
});

// Use this hook to access the user info.
export function useSession() {
  const value = use(AuthContext);
  if (!value) {
    throw new Error("useSession must be wrapped in a <SessionProvider />");
  }

  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const [[, session], setSession] = useStorageState("sessionToken");
  const { data, isLoading } = useQuery({
    queryFn: () => (session ? getCurrentUser(session) : null),
    queryKey: ["currentUser"],
    initialData: null,
  });

  const signInMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      signInWithEmailAndPassword(email, password),

    onSuccess: (data) => {
      queryClient.setQueryData(["currentUser"], data);
      setSession(data?.token || null);
    },
  });

  return (
    <AuthContext.Provider
      value={{
        signIn: (
          email: string,
          password: string,
          onErrorCallback?: () => void,
        ) => {
          // Perform sign-in logic here
          signInMutation.mutate(
            { email, password },
            {
              onError: () => {
                if (onErrorCallback) {
                  onErrorCallback();
                }
              },
            },
          );
        },
        signOut: () => {
          queryClient.setQueryData(["currentUser"], null);
        },
        user: data,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
