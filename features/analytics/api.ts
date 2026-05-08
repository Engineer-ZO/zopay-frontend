import { AnalyticsData, AnalyticsFilters } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export const analyticsApi = {
  getDashboard: async (filters?: AnalyticsFilters): Promise<AnalyticsData> => {
    const queryParams = new URLSearchParams();
    if (filters?.startDate) queryParams.append("startDate", filters.startDate);
    if (filters?.endDate) queryParams.append("endDate", filters.endDate);
    if (filters?.provider) queryParams.append("provider", filters.provider);

    const response = await fetch(
      `${API_BASE_URL}/analytics/dashboard?${queryParams.toString()}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch analytics");
    }

    return response.json();
  },
};
