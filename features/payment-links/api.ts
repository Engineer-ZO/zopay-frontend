import axios from "axios";
import { apiClient } from "@/lib/apiClient";
import { API_BASE_URL } from "@/constants/api";
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
} from "./types";

const MERCHANT_PAYMENT_LINKS_BASE = "/merchant/v1/payment-links";
const PUBLIC_PAYMENT_LINKS_BASE = "/public/v1/payment-links";

const publicApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

export const createPaymentLink = async (
  payload: CreatePaymentLinkRequest
): Promise<CreatePaymentLinkResponse> => {
  const response = await apiClient.post<CreatePaymentLinkResponse>(MERCHANT_PAYMENT_LINKS_BASE, payload);
  return response.data;
};

export const listPaymentLinks = async (): Promise<ListPaymentLinksResponse> => {
  const response = await apiClient.get<ListPaymentLinksResponse>(MERCHANT_PAYMENT_LINKS_BASE);
  return response.data;
};

export const getPaymentLink = async (id: string): Promise<GetPaymentLinkResponse> => {
  const response = await apiClient.get<GetPaymentLinkResponse>(`${MERCHANT_PAYMENT_LINKS_BASE}/${id}`);
  return response.data;
};

export const updatePaymentLink = async (
  id: string,
  payload: UpdatePaymentLinkRequest
): Promise<UpdatePaymentLinkResponse> => {
  const response = await apiClient.patch<UpdatePaymentLinkResponse>(`${MERCHANT_PAYMENT_LINKS_BASE}/${id}`, payload);
  return response.data;
};

export const listPaymentLinkTransactions = async (
  id: string
): Promise<ListPaymentLinkTransactionsResponse> => {
  const response = await apiClient.get<ListPaymentLinkTransactionsResponse>(
    `${MERCHANT_PAYMENT_LINKS_BASE}/${id}/transactions`
  );
  return response.data;
};

export const getPublicPaymentLink = async (slug: string): Promise<GetPublicPaymentLinkResponse> => {
  const response = await publicApiClient.get<GetPublicPaymentLinkResponse>(`${PUBLIC_PAYMENT_LINKS_BASE}/${slug}`);
  return response.data;
};

export const payPublicPaymentLink = async (
  slug: string,
  payload: PayPublicPaymentLinkRequest
): Promise<PayPublicPaymentLinkResponse> => {
  const response = await publicApiClient.post<PayPublicPaymentLinkResponse>(
    `${PUBLIC_PAYMENT_LINKS_BASE}/${slug}/pay`,
    payload
  );
  return response.data;
};

export const getPublicPaymentLinkTransactionStatus = async (
  slug: string,
  transactionId: string
): Promise<GetPublicPaymentLinkTransactionStatusResponse> => {
  const response = await publicApiClient.get<GetPublicPaymentLinkTransactionStatusResponse>(
    `${PUBLIC_PAYMENT_LINKS_BASE}/${slug}/transactions/${transactionId}`
  );
  return response.data;
};

export const listPartialPlans = async (paymentLinkId: string): Promise<ListPartialPlansResponse> => {
  const response = await apiClient.get<ListPartialPlansResponse>(
    `${MERCHANT_PAYMENT_LINKS_BASE}/${paymentLinkId}/partial-plans`
  );
  return response.data;
};