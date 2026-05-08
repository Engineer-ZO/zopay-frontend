"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { merchantsApi } from "./api";
import { Merchant } from "./types";


export function useMerchantProfile() {
  return useQuery({
    queryKey: ["merchant", "profile"],
    queryFn: () => merchantsApi.getProfile(),
  });
}

export function useUpdateMerchantProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Merchant>) => merchantsApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchant", "profile"] });
    },
  });
}

export function useGetPendingProductionSummary() {
  return useQuery({
    queryKey: ["admin", "pending-production-summary"],
    queryFn: () => merchantsApi.getPendingProductionSummary(),
  });
}

// Legacy alias for backward compatibility (deprecated)
/** @deprecated Use useGetPendingProductionSummary instead */
export function useGetPendingKYBSummary() {
  return useGetPendingProductionSummary();
}
