import { apiClient } from '@/lib/apiClient';
import type {
  ListAuditLogsResponse,
  GetFilterOptionsResponse,
  ListAuditLogsParams,
} from './types';

/**
 * List audit logs (Admin only)
 * Uses JWT Bearer Token
 */
export const listAuditLogs = async (
  params: ListAuditLogsParams
): Promise<ListAuditLogsResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params.actorType) queryParams.append('actorType', params.actorType);
  if (params.action) queryParams.append('action', params.action);
  if (params.entityType) queryParams.append('entityType', params.entityType);
  if (params.entityId) queryParams.append('entityId', params.entityId);
  if (params.actorId) queryParams.append('actorId', params.actorId);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  if (params.search) queryParams.append('search', params.search);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const response = await apiClient.get<ListAuditLogsResponse>(
    `/admin/v1/audit-logs?${queryParams.toString()}`
  );
  return response.data;
};

/**
 * Get filter options for audit logs (Admin only)
 * Uses JWT Bearer Token
 */
export const getAuditLogFilterOptions = async (): Promise<GetFilterOptionsResponse> => {
  const response = await apiClient.get<GetFilterOptionsResponse>(
    `/admin/v1/audit-logs/filter-options`
  );
  return response.data;
};
