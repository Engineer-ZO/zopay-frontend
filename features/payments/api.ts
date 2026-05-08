import { PaymentRequest, PaymentResponse, PaymentStatusResponse } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export const paymentsApi = {
  initiate: async (request: PaymentRequest): Promise<PaymentResponse> => {
    const response = await fetch(`${API_BASE_URL}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error("Payment initiation failed");
    }

    return response.json();
  },

  getStatus: async (paymentId: string): Promise<PaymentStatusResponse> => {
    const response = await fetch(`${API_BASE_URL}/payments/${paymentId}`);

    if (!response.ok) {
      throw new Error("Failed to get payment status");
    }

    return response.json();
  },

  list: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{ data: PaymentResponse[]; total: number }> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.status) queryParams.append("status", params.status);

    const response = await fetch(
      `${API_BASE_URL}/payments?${queryParams.toString()}`
    );

    if (!response.ok) {
      throw new Error("Failed to list payments");
    }

    return response.json();
  },
};
