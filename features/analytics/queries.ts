"use client";

import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "./api";
import { AnalyticsFilters } from "./types";

export function useAnalytics(filters?: AnalyticsFilters) {
  return useQuery({
    queryKey: ["analytics", filters],
    queryFn: () => analyticsApi.getDashboard(filters),
  });
}
