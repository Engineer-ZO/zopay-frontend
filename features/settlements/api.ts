import { apiClient } from '@/lib/apiClient';
import type {
  Settlement,
  SettlementDetails,
  ListSettlementsResponse,
  GenerateSettlementRequest,
  GenerateSettlementResponse,
  GetSettlementDetailsResponse,
  GetStatementResponse,
  SetSettlementFrequencyRequest,
  SetSettlementFrequencyResponse,
  CompleteSettlementRequest,
  CompleteSettlementResponse,
  ListReconciliationQueueResponse,
  LinkTransactionRequest,
  LinkTransactionResponse,
  MarkResolvedRequest,
  MarkResolvedResponse,
  ReconcileFileResponse,
} from './types';

// Merchant Settlement API Functions
// These use JWT Bearer Token for authentication (via apiClient)

/**
 * Set merchant's settlement frequency preference
 * Uses JWT Bearer Token
 */
export const setSettlementFrequency = async (
  data: SetSettlementFrequencyRequest
): Promise<SetSettlementFrequencyResponse> => {
  const response = await apiClient.put<SetSettlementFrequencyResponse>(
    '/merchant/v1/settlement-frequency',
    data
  );
  return response.data;
};

/**
 * Generate a settlement manually
 * Uses JWT Bearer Token
 */
export const generateSettlement = async (
  data: GenerateSettlementRequest
): Promise<GenerateSettlementResponse> => {
  const response = await apiClient.post<GenerateSettlementResponse>(
    '/settlements/generate',
    data
  );
  return response.data;
};

/**
 * List all settlements for the merchant
 * Uses JWT Bearer Token
 */
export const listSettlements = async (
  params: {
    startDate?: string;
    endDate?: string;
    status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    page?: number;
    limit?: number;
  }
): Promise<ListSettlementsResponse> => {
  const queryParams = new URLSearchParams();
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  if (params.status) queryParams.append('status', params.status);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());

  const response = await apiClient.get<ListSettlementsResponse>(
    `/settlements?${queryParams.toString()}`
  );
  return response.data;
};

/**
 * Get settlement details
 * Uses JWT Bearer Token
 */
export const getSettlementDetails = async (
  id: string
): Promise<GetSettlementDetailsResponse> => {
  const response = await apiClient.get<GetSettlementDetailsResponse>(
    `/settlements/${id}`
  );
  return response.data;
};

/**
 * Get signed URL for settlement statement PDF
 * Uses JWT Bearer Token
 */
export const getSettlementStatement = async (
  id: string
): Promise<GetStatementResponse> => {
  const response = await apiClient.get<GetStatementResponse>(
    `/settlements/${id}/statement`
  );
  return response.data;
};

// Admin Settlement API Functions
// These use JWT Bearer Token for authentication

/**
 * List all settlements across all merchants (Admin only)
 * Uses JWT Bearer Token
 */
export const listAllSettlements = async (
  params: {
    merchantId?: string;
    startDate?: string;
    endDate?: string;
    status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    page?: number;
    limit?: number;
  }
): Promise<ListSettlementsResponse & { settlements: Array<Settlement & { merchantName?: string; merchantBusinessName?: string }> }> => {
  const queryParams = new URLSearchParams();
  if (params.merchantId) queryParams.append('merchantId', params.merchantId);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  if (params.status) queryParams.append('status', params.status);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());

  const response = await apiClient.get<ListSettlementsResponse & { settlements: Array<Settlement & { merchantName?: string; merchantBusinessName?: string }> }>(
    `/admin/settlements?${queryParams.toString()}`
  );
  return response.data;
};

/**
 * Get settlement details (Admin - can access any merchant's settlement)
 * Uses JWT Bearer Token
 */
export const getAdminSettlementDetails = async (
  id: string
): Promise<GetSettlementDetailsResponse & { merchantName?: string; merchantBusinessName?: string }> => {
  const response = await apiClient.get<GetSettlementDetailsResponse & { merchantName?: string; merchantBusinessName?: string }>(
    `/admin/settlements/${id}`
  );
  return response.data;
};

/**
 * Complete a settlement (mark as completed after payment)
 * Admin only
 */
export const completeSettlement = async (
  id: string,
  data: CompleteSettlementRequest
): Promise<CompleteSettlementResponse> => {
  const response = await apiClient.post<CompleteSettlementResponse>(
    `/settlements/${id}/complete`,
    data
  );
  return response.data;
};

// Reconciliation API Functions
// These use JWT Bearer Token for authentication (Admin only)

/**
 * Reconcile a gateway settlement file
 * Admin only
 */
export const reconcileFile = async (
  fileId: string
): Promise<ReconcileFileResponse> => {
  const response = await apiClient.post<ReconcileFileResponse>(
    `/reconciliation/files/${fileId}/reconcile`
  );
  return response.data;
};

/**
 * List reconciliation queue items
 * Admin only
 */
export const listReconciliationQueue = async (params: {
  gateway?: 'MTN_MOMO' | 'ORANGE_MONEY';
  matchStatus?: 'MISSING_IN_ZITOPAY' | 'MISSING_IN_GATEWAY' | 'AMOUNT_MISMATCH';
  resolved?: boolean;
  assignedTo?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}): Promise<ListReconciliationQueueResponse> => {
  const queryParams = new URLSearchParams();
  if (params.gateway) queryParams.append('gateway', params.gateway);
  if (params.matchStatus) queryParams.append('matchStatus', params.matchStatus);
  if (params.resolved !== undefined) queryParams.append('resolved', params.resolved.toString());
  if (params.assignedTo) queryParams.append('assignedTo', params.assignedTo);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());

  const response = await apiClient.get<ListReconciliationQueueResponse>(
    `/reconciliation/queue?${queryParams.toString()}`
  );
  return response.data;
};

/**
 * Manually link a transaction to a reconciliation queue item
 * Admin only
 */
export const linkTransaction = async (
  queueItemId: string,
  data: LinkTransactionRequest
): Promise<LinkTransactionResponse> => {
  const response = await apiClient.post<LinkTransactionResponse>(
    `/reconciliation/queue/${queueItemId}/link`,
    data
  );
  return response.data;
};

/**
 * Mark a reconciliation queue item as resolved
 * Admin only
 */
export const markResolved = async (
  queueItemId: string,
  data: MarkResolvedRequest
): Promise<MarkResolvedResponse> => {
  const response = await apiClient.post<MarkResolvedResponse>(
    `/reconciliation/queue/${queueItemId}/resolve`,
    data
  );
  return response.data;
};
