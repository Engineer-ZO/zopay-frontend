import { Transaction, TransactionFilters } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export const transactionsApi = {
  list: async (
    filters?: TransactionFilters
  ): Promise<{ data: Transaction[]; total: number; page: number; limit: number }> => {
    const queryParams = new URLSearchParams();
    if (filters?.page) queryParams.append("page", filters.page.toString());
    if (filters?.limit) queryParams.append("limit", filters.limit.toString());
    if (filters?.status) queryParams.append("status", filters.status);
    if (filters?.provider) queryParams.append("provider", filters.provider);
    if (filters?.startDate) queryParams.append("startDate", filters.startDate);
    if (filters?.endDate) queryParams.append("endDate", filters.endDate);

    const response = await fetch(
      `${API_BASE_URL}/transactions?${queryParams.toString()}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch transactions");
    }

    return response.json();
  },

  getById: async (id: string): Promise<Transaction> => {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`);

    if (!response.ok) {
      throw new Error("Failed to fetch transaction");
    }

    return response.json();
  },
};
