"use client";

import { useSession, useLogin, useLogout } from "@/features/auth/queries";
import { User } from "@/features/auth/types";

export function useAuth() {
  const { data: session, isLoading } = useSession();
  const login = useLogin();
  const logout = useLogout();

  return {
    user: session?.user || null,
    isAuthenticated: !!session?.user,
    isLoading,
    login: login.mutate,
    logout: logout.mutate,
    isLoggingIn: login.isPending,
    isLoggingOut: logout.isPending,
  };
}
