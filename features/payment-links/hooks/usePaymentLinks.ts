import { useMutation, useQuery, useQueryClient, UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import {
  createPaymentLink,
  getPaymentLink,
  getPublicPaymentLink,
  getPublicPaymentLinkTransactionStatus,
  listPartialPlans,
  listPaymentLinkTransactions,
  listPaymentLinks,
  payPublicPaymentLink,
  updatePaymentLink,
} from "../api";
import type {
  CreatePaymentLinkRequest,
  CreatePaymentLinkResponse,
  GetPaymentLinkResponse,
  GetPublicPaymentLinkResponse,
  GetPublicPaymentLinkTransactionStatusResponse,
  ListPartialPlansResponse,
  ListPaymentLinksResponse,
  ListPaymentLinkTransactionsResponse,
  PayPublicPaymentLinkRequest,
  PayPublicPaymentLinkResponse,
  UpdatePaymentLinkRequest,
  UpdatePaymentLinkResponse,
} from "../types";

export const usePaymentLinks = (): UseQueryResult<ListPaymentLinksResponse, Error> =>
  useQuery({
    queryKey: ["payment-links"],
    queryFn: listPaymentLinks,
  });

export const usePaymentLink = (
  id: string,
  enabled: boolean = true
): UseQueryResult<GetPaymentLinkResponse, Error> =>
  useQuery({
    queryKey: ["payment-links", id],
    queryFn: () => getPaymentLink(id),
    enabled: enabled && !!id,
  });

export const useCreatePaymentLink = (): UseMutationResult<
  CreatePaymentLinkResponse,
  Error,
  CreatePaymentLinkRequest
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPaymentLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-links"] });
    },
  });
};

export const useUpdatePaymentLink = (): UseMutationResult<
  UpdatePaymentLinkResponse,
  Error,
  { id: string; payload: UpdatePaymentLinkRequest }
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updatePaymentLink(id, payload),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["payment-links"] });
      queryClient.invalidateQueries({ queryKey: ["payment-links", vars.id] });
      queryClient.invalidateQueries({ queryKey: ["payment-link-transactions", vars.id] });
      queryClient.invalidateQueries({ queryKey: ["payment-links", vars.id, "partial-plans"] });
    },
  });
};

export const usePaymentLinkTransactions = (
  id: string,
  enabled: boolean = true
): UseQueryResult<ListPaymentLinkTransactionsResponse, Error> =>
  useQuery({
    queryKey: ["payment-link-transactions", id],
    queryFn: () => listPaymentLinkTransactions(id),
    enabled: enabled && !!id,
  });

export const usePublicPaymentLink = (
  slug: string,
  enabled: boolean = true
): UseQueryResult<GetPublicPaymentLinkResponse, Error> =>
  useQuery({
    queryKey: ["public-payment-link", slug],
    queryFn: () => getPublicPaymentLink(slug),
    enabled: enabled && !!slug,
    retry: false,
  });

export const usePayPublicPaymentLink = (): UseMutationResult<
  PayPublicPaymentLinkResponse,
  Error,
  { slug: string; payload: PayPublicPaymentLinkRequest }
> =>
  useMutation({
    mutationFn: ({ slug, payload }) => payPublicPaymentLink(slug, payload),
  });

export const usePublicPaymentLinkTransactionStatus = (
  slug: string,
  transactionId: string,
  enabled: boolean = true
): UseQueryResult<GetPublicPaymentLinkTransactionStatusResponse, Error> =>
  useQuery({
    queryKey: ["public-payment-link", slug, "transaction", transactionId],
    queryFn: () => getPublicPaymentLinkTransactionStatus(slug, transactionId),
    enabled: enabled && !!slug && !!transactionId,
    retry: false,
  });

export const usePartialPlans = (
  paymentLinkId: string,
  enabled: boolean = true
): UseQueryResult<ListPartialPlansResponse, Error> =>
  useQuery({
    queryKey: ["payment-links", paymentLinkId, "partial-plans"],
    queryFn: () => listPartialPlans(paymentLinkId),
    enabled: enabled && !!paymentLinkId,
    retry: false,
  });