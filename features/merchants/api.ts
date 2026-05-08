import { Merchant } from "./types";
import { GetPendingProductionSummaryResponse } from "./types/index";
import { getAccessToken } from "@/features/auth/utils/storage";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export const merchantsApi = {
  getProfile: async (): Promise<Merchant> => {
    const response = await fetch(`${API_BASE_URL}/merchants/profile`);

    if (!response.ok) {
      throw new Error("Failed to fetch merchant profile");
    }

    return response.json();
  },

  updateProfile: async (data: Partial<Merchant>): Promise<Merchant> => {
    const response = await fetch(`${API_BASE_URL}/merchants/profile`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to update merchant profile");
    }

    return response.json();
  },

  getPendingProductionSummary: async (): Promise<GetPendingProductionSummaryResponse> => {
    const token = getAccessToken();
    const response = await fetch(`${API_BASE_URL}/merchant/v1/admin/pending-production-summary`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch pending production summary");
    }

    return response.json();
  },

  // Legacy alias for backward compatibility (deprecated)
  /** @deprecated Use getPendingProductionSummary instead */
  getPendingKYBSummary: async (): Promise<GetPendingProductionSummaryResponse> => {
    return merchantsApi.getPendingProductionSummary();
  },
};
