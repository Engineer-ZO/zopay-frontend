import { apiClient } from '@/lib/apiClient';
import type {
  DashboardSummaryResponse,
  DashboardStatsResponse,
  RecentTransactionsResponse,
  VolumeOverTimeResponse,
  SuccessVsFailedResponse,
  GatewayBreakdownResponse,
  CollectionsVsPayoutsResponse,
  TransactionReportResponse,
  TransactionReportFilters,
  SettlementReportResponse,
  SettlementReportFilters,
  RevenueReportResponse,
  RevenueReportFilters,
  ScheduledReportsResponse,
  ScheduledReportResponse,
  CreateScheduledReportRequest,
  UpdateScheduledReportRequest,
  PlatformSummaryResponse,
  TopMerchantByVolume,
  TopMerchantByRevenue,
  RecentlyOnboardedMerchant,
} from '../types/index';
import type { Environment } from '@/core/environment/EnvironmentContext';

const REPORTS_BASE_URL = '/reports';
const MERCHANT_BASE_URL = '/merchant/v1/merchants';

// Dashboard Summary
export const getDashboardSummary = async (environment: Environment): Promise<DashboardSummaryResponse> => {
  const params: Record<string, string> = {
    environment, // ALWAYS pass environment - REQUIRED
  };

  console.log('[getDashboardSummary] Called with environment:', environment);
  console.log('[getDashboardSummary] Params being sent:', params);

  const response = await apiClient.get<DashboardSummaryResponse>(
    `${REPORTS_BASE_URL}/dashboard/summary`,
    { params }
  );
  return response.data;
};

// Dashboard Stats (Spec-Compliant)
export const getDashboardStats = async (
  merchantId: string,
  period: '7d' | '30d' | '90d' | 'all' = '30d',
  environment: Environment
): Promise<DashboardStatsResponse> => {
  const params: Record<string, string> = {
    period,
    environment, // ALWAYS pass environment
  };

  // Debug logging - ALWAYS log
  console.log('[getDashboardStats] Called with environment:', environment);
  console.log('[getDashboardStats] merchantId:', merchantId, 'period:', period);
  console.log('[getDashboardStats] Params being sent:', params);

  const response = await apiClient.get<DashboardStatsResponse>(
    `${MERCHANT_BASE_URL}/${merchantId}/dashboard/stats`,
    { params }
  );
  return response.data;
};

// Recent Transactions
export const getRecentTransactions = async (
  merchantId: string,
  limit: number = 10,
  type: 'collection' | 'payout' | 'refund' | undefined,
  environment: Environment
): Promise<RecentTransactionsResponse> => {
  const params: Record<string, string | number> = {
    limit,
    environment, // ALWAYS pass environment
  };
  if (type) params.type = type;

  // Debug logging - ALWAYS log
  console.log('[getRecentTransactions] Called with environment:', environment);
  console.log('[getRecentTransactions] merchantId:', merchantId, 'limit:', limit, 'type:', type);
  console.log('[getRecentTransactions] Params being sent:', params);

  const response = await apiClient.get<RecentTransactionsResponse>(
    `${MERCHANT_BASE_URL}/${merchantId}/dashboard/transactions/recent`,
    { params }
  );
  return response.data;
};

// Chart Data Endpoints
export const getVolumeOverTime = async (days: number = 30, environment: Environment): Promise<VolumeOverTimeResponse> => {
  const params: Record<string, string | number> = {
    days,
    environment, // ALWAYS pass environment
  };

  const response = await apiClient.get<VolumeOverTimeResponse>(
    `${REPORTS_BASE_URL}/dashboard/volume-over-time`,
    { params }
  );
  return response.data;
};

export const getSuccessVsFailed = async (environment: Environment): Promise<SuccessVsFailedResponse> => {
  const params: Record<string, string> = {
    environment, // ALWAYS pass environment
  };

  const response = await apiClient.get<SuccessVsFailedResponse>(
    `${REPORTS_BASE_URL}/dashboard/success-vs-failed`,
    { params }
  );
  return response.data;
};

export const getGatewayBreakdown = async (environment: Environment): Promise<GatewayBreakdownResponse> => {
  const params: Record<string, string> = {
    environment, // ALWAYS pass environment
  };

  const response = await apiClient.get<GatewayBreakdownResponse>(
    `${REPORTS_BASE_URL}/dashboard/gateway-breakdown`,
    { params }
  );
  return response.data;
};

export const getCollectionsVsPayouts = async (environment: Environment): Promise<CollectionsVsPayoutsResponse> => {
  const params: Record<string, string> = {
    environment, // ALWAYS pass environment
  };

  const response = await apiClient.get<CollectionsVsPayoutsResponse>(
    `${REPORTS_BASE_URL}/dashboard/collections-vs-payouts`,
    { params }
  );
  return response.data;
};

// Transaction Reports
export const getTransactionReport = async (
  filters: TransactionReportFilters,
  environment: Environment
): Promise<TransactionReportResponse> => {
  const params: Record<string, string | number | undefined> = {
    ...filters,
    environment, // ALWAYS pass environment
  };

  const response = await apiClient.get<TransactionReportResponse>(
    `${REPORTS_BASE_URL}/transactions`,
    { params }
  );
  return response.data;
};

export const exportTransactions = async (
  format: 'CSV' | 'EXCEL' = 'CSV',
  filters: Omit<TransactionReportFilters, 'page' | 'limit'>,
  environment: Environment
): Promise<Blob> => {
  const response = await apiClient.get(
    `${REPORTS_BASE_URL}/transactions/export`,
    {
      params: {
        format,
        ...filters,
        environment, // ALWAYS pass environment
      },
      responseType: 'blob',
    }
  );
  return response.data;
};

// Settlement Reports
export const getSettlementReport = async (
  filters: SettlementReportFilters,
  environment: Environment
): Promise<SettlementReportResponse> => {
  const params: Record<string, string | undefined> = {
    ...filters,
    environment, // ALWAYS pass environment
  };

  const response = await apiClient.get<SettlementReportResponse>(
    `${REPORTS_BASE_URL}/settlements`,
    { params }
  );
  return response.data;
};

// Revenue Reports
export const getRevenueReport = async (
  filters: RevenueReportFilters,
  environment: Environment
): Promise<RevenueReportResponse> => {
  const params: Record<string, string | undefined> = {
    ...filters,
    environment, // ALWAYS pass environment
  };

  const response = await apiClient.get<RevenueReportResponse>(
    `${REPORTS_BASE_URL}/revenue`,
    { params }
  );
  return response.data;
};

// Scheduled Reports
export const getScheduledReports = async (): Promise<ScheduledReportsResponse> => {
  const response = await apiClient.get<ScheduledReportsResponse>(
    `${REPORTS_BASE_URL}/scheduled`
  );
  return response.data;
};

export const getScheduledReport = async (id: string): Promise<ScheduledReportResponse> => {
  const response = await apiClient.get<ScheduledReportResponse>(
    `${REPORTS_BASE_URL}/scheduled/${id}`
  );
  return response.data;
};

export const createScheduledReport = async (
  data: CreateScheduledReportRequest
): Promise<ScheduledReportResponse> => {
  const response = await apiClient.post<ScheduledReportResponse>(
    `${REPORTS_BASE_URL}/scheduled`,
    data
  );
  return response.data;
};

export const updateScheduledReport = async (
  id: string,
  data: UpdateScheduledReportRequest
): Promise<ScheduledReportResponse> => {
  const response = await apiClient.patch<ScheduledReportResponse>(
    `${REPORTS_BASE_URL}/scheduled/${id}`,
    data
  );
  return response.data;
};

export const deleteScheduledReport = async (id: string): Promise<void> => {
  await apiClient.delete(`${REPORTS_BASE_URL}/scheduled/${id}`);
};

// Admin Routes
const ADMIN_REPORTS_BASE_URL = '/admin/reports';

export const getPlatformSummary = async (
  environment: Environment
): Promise<PlatformSummaryResponse> => {
  const response = await apiClient.get<PlatformSummaryResponse>(
    `${ADMIN_REPORTS_BASE_URL}/platform-summary`,
    { params: { environment } }
  );
  return response.data;
};

export const getTopMerchantsByVolume = async (
  limit: number = 10,
  environment: Environment
): Promise<TopMerchantByVolume[]> => {
  const response = await apiClient.get<TopMerchantByVolume[]>(
    `${ADMIN_REPORTS_BASE_URL}/merchants/top-by-volume`,
    { params: { limit, environment } }
  );
  return response.data;
};

export const getTopMerchantsByRevenue = async (
  limit: number = 10,
  environment: Environment
): Promise<TopMerchantByRevenue[]> => {
  const response = await apiClient.get<TopMerchantByRevenue[]>(
    `${ADMIN_REPORTS_BASE_URL}/merchants/top-by-revenue`,
    { params: { limit, environment } }
  );
  return response.data;
};

export const getRecentlyOnboardedMerchants = async (
  limit: number = 10,
  environment: Environment
): Promise<RecentlyOnboardedMerchant[]> => {
  const response = await apiClient.get<RecentlyOnboardedMerchant[]>(
    `${ADMIN_REPORTS_BASE_URL}/merchants/recently-onboarded`,
    { params: { limit, environment } }
  );
  return response.data;
};
