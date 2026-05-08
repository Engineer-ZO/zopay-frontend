"use client";

import { useQuery } from '@tanstack/react-query';
import {
  listAuditLogs,
  getAuditLogFilterOptions,
} from './api';
import type { ListAuditLogsResponse, GetFilterOptionsResponse, ListAuditLogsParams } from './types';

/**
 * Hook to list audit logs (Admin only)
 */
export const useAuditLogs = (
  params: ListAuditLogsParams,
  enabled: boolean = true
) => {
  return useQuery<ListAuditLogsResponse>({
    queryKey: ['admin', 'audit-logs', params],
    queryFn: () => listAuditLogs(params),
    enabled: enabled,
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Hook to get filter options for audit logs (Admin only)
 */
export const useAuditLogFilterOptions = (enabled: boolean = true) => {
  return useQuery<GetFilterOptionsResponse>({
    queryKey: ['admin', 'audit-logs', 'filter-options'],
    queryFn: () => getAuditLogFilterOptions(),
    enabled: enabled,
    staleTime: 300000, // 5 minutes - filter options don't change often
  });
};
