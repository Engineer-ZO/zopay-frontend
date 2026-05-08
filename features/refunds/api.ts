import { apiClient } from '@/lib/apiClient';
import type {
  ListRefundsResponse,
  GetRefundDetailsResponse,
} from './types';

// Merchant Refund API Functions
// These use JWT Bearer Token for authentication

/**
 * List refunds for a merchant
 * Uses JWT Bearer Token
 */
export const listMerchantRefunds = async (
  merchantId: string,
  params: {
    environment?: 'sandbox' | 'production';
    status?: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }
): Promise<ListRefundsResponse> => {
  const queryParams = new URLSearchParams();
  if (params.environment) queryParams.append('environment', params.environment);
  if (params.status) queryParams.append('status', params.status);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());

  const response = await apiClient.get<ListRefundsResponse>(
    `/merchant/v1/merchants/${merchantId}/refunds?${queryParams.toString()}`
  );
  return response.data;
};

/**
 * Get refund details for a merchant
 * Uses JWT Bearer Token
 */
export const getMerchantRefundDetails = async (
  merchantId: string,
  refundId: string
): Promise<GetRefundDetailsResponse> => {
  const response = await apiClient.get<GetRefundDetailsResponse>(
    `/merchant/v1/merchants/${merchantId}/refunds/${refundId}`
  );
  return response.data;
};

// Admin Refund API Functions
// These use JWT Bearer Token for authentication (Admin only)

/**
 * List all refunds across all merchants (Admin only)
 * Uses JWT Bearer Token
 */
export const listAllRefunds = async (
  params: {
    merchantId?: string;
    environment?: 'sandbox' | 'production';
    status?: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }
): Promise<ListRefundsResponse> => {
  const queryParams = new URLSearchParams();
  if (params.merchantId) queryParams.append('merchantId', params.merchantId);
  if (params.environment) queryParams.append('environment', params.environment);
  if (params.status) queryParams.append('status', params.status);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());

  const response = await apiClient.get<ListRefundsResponse>(
    `/admin/v1/refunds?${queryParams.toString()}`
  );
  return response.data;
};

/**
 * Get refund details (Admin - can access any merchant's refund)
 * Uses JWT Bearer Token
 */
export const getAdminRefundDetails = async (
  refundId: string
): Promise<GetRefundDetailsResponse> => {
  const response = await apiClient.get<GetRefundDetailsResponse>(
    `/admin/v1/refunds/${refundId}`
  );
  return response.data;
};
