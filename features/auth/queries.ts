"use client";

// Note: Install @tanstack/react-query package first
// npm install @tanstack/react-query

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "./api";
import { LoginRequest, LoginResponse } from "./types";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
    onSuccess: (data: LoginResponse) => {
      queryClient.setQueryData(["session"], data);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: () => authApi.getSession(),
  });
}
