import { useMutation, useQuery, UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import {
  getCheckoutSession,
  getCheckoutSessionStatus,
  payCheckoutSession,
} from "../api";
import type {
  CheckoutStatus,
  GetCheckoutSessionResponse,
  GetCheckoutSessionStatusResponse,
  PayCheckoutSessionRequest,
  PayCheckoutSessionResponse,
} from "../types";

const isFinalCheckoutStatus = (status?: CheckoutStatus | string | null) =>
  status === "PAID" || status === "FAILED" || status === "EXPIRED" || status === "CANCELLED";

export const useCheckoutSession = (
  id: string,
  enabled: boolean = true
): UseQueryResult<GetCheckoutSessionResponse, Error> =>
  useQuery({
    queryKey: ["checkout-session", id],
    queryFn: () => getCheckoutSession(id),
    enabled: enabled && !!id,
    retry: false,
  });

export const usePayCheckoutSession = (): UseMutationResult<
  PayCheckoutSessionResponse,
  Error,
  { id: string; payload: PayCheckoutSessionRequest }
> =>
  useMutation({
    mutationFn: ({ id, payload }) => payCheckoutSession(id, payload),
  });

export const useCheckoutSessionStatus = (
  id: string,
  enabled: boolean = true
): UseQueryResult<GetCheckoutSessionStatusResponse, Error> =>
  useQuery({
    queryKey: ["checkout-session", id, "status"],
    queryFn: () => getCheckoutSessionStatus(id),
    enabled: enabled && !!id,
    retry: false,
    refetchInterval: (query) => {
      const status = query.state.data?.checkoutSession.status;
      if (!status || isFinalCheckoutStatus(status)) return false;
      return 4000;
    },
  });
