import axios from "axios";
import { API_BASE_URL } from "@/constants/api";
import type {
  GetCheckoutSessionResponse,
  GetCheckoutSessionStatusResponse,
  PayCheckoutSessionRequest,
  PayCheckoutSessionResponse,
} from "./types";

const PUBLIC_CHECKOUT_BASE = "/public/v1/checkout/sessions";

const publicCheckoutClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

publicCheckoutClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data;
    if (data && typeof data === "object") {
      error.message = data.message || data.error || error.message;
    }
    return Promise.reject(error);
  }
);

export const getCheckoutSession = async (id: string): Promise<GetCheckoutSessionResponse> => {
  const response = await publicCheckoutClient.get<GetCheckoutSessionResponse>(`${PUBLIC_CHECKOUT_BASE}/${id}`);
  return response.data;
};

export const payCheckoutSession = async (
  id: string,
  payload: PayCheckoutSessionRequest
): Promise<PayCheckoutSessionResponse> => {
  const response = await publicCheckoutClient.post<PayCheckoutSessionResponse>(
    `${PUBLIC_CHECKOUT_BASE}/${id}/pay`,
    payload
  );
  return response.data;
};

export const getCheckoutSessionStatus = async (
  id: string
): Promise<GetCheckoutSessionStatusResponse> => {
  const response = await publicCheckoutClient.get<GetCheckoutSessionStatusResponse>(
    `${PUBLIC_CHECKOUT_BASE}/${id}/status`
  );
  return response.data;
};
