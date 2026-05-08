"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { paymentsApi } from "./api";
import { PaymentRequest } from "./types";

export function useInitiatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: PaymentRequest) => paymentsApi.initiate(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });
}

export function usePaymentStatus(paymentId: string | null) {
  return useQuery({
    queryKey: ["payments", paymentId],
    queryFn: () => (paymentId ? paymentsApi.getStatus(paymentId) : null),
    enabled: !!paymentId,
  });
}

export function usePayments(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  return useQuery({
    queryKey: ["payments", params],
    queryFn: () => paymentsApi.list(params),
  });
}
