import { getCurrentUser, signInWithEmailAndPassword } from "@/api/auth.api";
import { useStorageState } from "@/hooks/use-storage-state";
import { User } from "@/types/auth.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, use, useEffect, type PropsWithChildren } from "react";

const AuthContext = createContext<{
  signIn: (
    email: string,
    password: string,
    onErrorCallback?: (message: string) => void,
  ) => void;
  signInIsPending: boolean;
  signOut: () => void;
  user?: User | null;
  isLoading: boolean;
}>({
  signIn: () => null,
  signOut: () => null,
  user: null,
  isLoading: false,
  signInIsPending: false,
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
  const [[isFinished, session], setSession] = useStorageState("sessionToken");

  // console.log(
  //   "SessionProvider render - isFinished:",
  //   isFinished,
  //   "session:",
  //   session,
  //   "hasSession:",
  //   !!session,
  // );

  const { data, isLoading, refetch } = useQuery({
    queryFn: () => {
      // console.log("getCurrentUser queryFn called with session:", session);
      return getCurrentUser(session!);
    },
    queryKey: ["currentUser"],
    initialData: null,
    enabled: !isFinished && !!session,
  });

  const signInMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      signInWithEmailAndPassword(email, password),

    onSuccess: (data) => {
      queryClient.setQueryData(["currentUser"], data || null);
      setSession(data?.token || null);
    },
  });

  useEffect(() => {
    // console.log("SessionProvider - currentUser:", data);
  }, [data]);

  useEffect(() => {
    // console.log(
    //   "Session effect - isFinished:",
    //   isFinished,
    //   "session:",
    //   session,
    // );
    if (!isFinished && session) {
      // console.log("Session loaded, refetching user data");
      refetch();
    }
  }, [isFinished, session, refetch]);

  return (
    <AuthContext.Provider
      value={{
        signIn: (
          email: string,
          password: string,
          onErrorCallback?: (message: string) => void,
        ) => {
          // Perform sign-in logic here
          signInMutation.mutate(
            { email, password },
            {
              onError: (error) => {
                if (onErrorCallback) {
                  onErrorCallback(
                    error.message || "Erreur lors de la connexion",
                  );
                }
              },
            },
          );
        },
        signOut: () => {
          queryClient.setQueryData(["currentUser"], null);
          setSession(null);
        },
        user: data,
        isLoading: isFinished || isLoading,
        signInIsPending: signInMutation.isPending,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
