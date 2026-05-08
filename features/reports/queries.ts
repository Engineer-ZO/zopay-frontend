"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDashboardSummary,
  getDashboardStats,
  getRecentTransactions,
  getVolumeOverTime,
  getSuccessVsFailed,
  getGatewayBreakdown,
  getCollectionsVsPayouts,
  getTransactionReport,
  exportTransactions,
  getSettlementReport,
  getRevenueReport,
  getScheduledReports,
  getScheduledReport,
  createScheduledReport,
  updateScheduledReport,
  deleteScheduledReport,
  getPlatformSummary,
  getTopMerchantsByVolume,
  getTopMerchantsByRevenue,
  getRecentlyOnboardedMerchants,
} from './api/index';
import type {
  TransactionReportFilters,
  SettlementReportFilters,
  RevenueReportFilters,
  CreateScheduledReportRequest,
  UpdateScheduledReportRequest,
} from './types/index';
import { useEnvironment } from '@/core/environment/EnvironmentContext';

// Dashboard Summary
export const useDashboardSummary = () => {
  const { environment } = useEnvironment();
  
  console.log('[useDashboardSummary] Hook called - environment:', environment);
  
  return useQuery({
    queryKey: ['reports', 'dashboard', 'summary', environment],
    queryFn: () => {
      console.log('[useDashboardSummary] queryFn executing - environment:', environment);
      return getDashboardSummary(environment);
    },
    enabled: !!environment, // ALWAYS wait for environment
    staleTime: 0, // No cache - always fetch fresh data when environment changes
    refetchOnMount: true, // Refetch when component mounts
  });
};

// Dashboard Stats
export const useDashboardStats = (
  merchantId: string,
  period: '7d' | '30d' | '90d' | 'all' = '30d'
) => {
  const { environment } = useEnvironment();
  
  // Debug logging - ALWAYS log
  console.log('[useDashboardStats] Hook called - environment:', environment, 'merchantId:', merchantId, 'period:', period);
  
  return useQuery({
    queryKey: ['reports', 'dashboard', 'stats', merchantId, period, environment],
    queryFn: () => {
      console.log('[useDashboardStats] queryFn executing - environment:', environment, 'merchantId:', merchantId);
      return getDashboardStats(merchantId, period, environment);
    },
    enabled: !!merchantId && !!environment, // Only run when both merchantId and environment are available
    staleTime: 0, // No cache - always fetch fresh data when environment changes
    refetchOnMount: true, // Refetch when component mounts
  });
};

// Recent Transactions
export const useRecentTransactions = (
  merchantId: string,
  limit: number = 10,
  type?: 'collection' | 'payout' | 'refund'
) => {
  const { environment } = useEnvironment();
  
  // Debug logging - ALWAYS log
  console.log('[useRecentTransactions] Hook called - environment:', environment, 'merchantId:', merchantId, 'limit:', limit, 'type:', type);
  
  return useQuery({
    queryKey: ['reports', 'dashboard', 'recent-transactions', merchantId, limit, type, environment],
    queryFn: () => {
      console.log('[useRecentTransactions] queryFn executing - environment:', environment, 'merchantId:', merchantId);
      return getRecentTransactions(merchantId, limit, type, environment);
    },
    enabled: !!merchantId && !!environment, // Only run when both merchantId and environment are available
    staleTime: 0, // No cache - always fetch fresh data when environment changes
    refetchOnMount: true, // Refetch when component mounts
  });
};

// Chart Data
export const useVolumeOverTime = (days: number = 30) => {
  const { environment } = useEnvironment();
  return useQuery({
    queryKey: ['reports', 'dashboard', 'volume-over-time', days, environment],
    queryFn: () => getVolumeOverTime(days, environment),
    enabled: !!environment, // ALWAYS wait for environment
    staleTime: 0, // No cache - always fetch fresh data when environment changes
    refetchOnMount: true,
  });
};

export const useSuccessVsFailed = () => {
  const { environment } = useEnvironment();
  return useQuery({
    queryKey: ['reports', 'dashboard', 'success-vs-failed', environment],
    queryFn: () => getSuccessVsFailed(environment),
    enabled: !!environment, // ALWAYS wait for environment
    staleTime: 0, // No cache - always fetch fresh data when environment changes
    refetchOnMount: true,
  });
};

export const useGatewayBreakdown = () => {
  const { environment } = useEnvironment();
  return useQuery({
    queryKey: ['reports', 'dashboard', 'gateway-breakdown', environment],
    queryFn: () => getGatewayBreakdown(environment),
    enabled: !!environment, // ALWAYS wait for environment
    staleTime: 0, // No cache - always fetch fresh data when environment changes
    refetchOnMount: true,
  });
};

export const useCollectionsVsPayouts = () => {
  const { environment } = useEnvironment();
  return useQuery({
    queryKey: ['reports', 'dashboard', 'collections-vs-payouts', environment],
    queryFn: () => getCollectionsVsPayouts(environment),
    enabled: !!environment, // ALWAYS wait for environment
    staleTime: 0, // No cache - always fetch fresh data when environment changes
    refetchOnMount: true,
  });
};

// Transaction Reports
export const useTransactionReport = (filters: TransactionReportFilters = {}) => {
  const { environment } = useEnvironment();
  return useQuery({
    queryKey: ['reports', 'transactions', filters, environment],
    queryFn: () => getTransactionReport(filters, environment),
    enabled: !!environment, // Only run when environment is available
    staleTime: 0, // No cache - always fetch fresh data when environment changes
    refetchOnMount: true,
  });
};

export const useExportTransactions = () => {
  const { environment } = useEnvironment();
  return useMutation({
    mutationFn: ({
      format,
      filters,
    }: {
      format: 'CSV' | 'EXCEL';
      filters: Omit<TransactionReportFilters, 'page' | 'limit'>;
    }) => exportTransactions(format, filters, environment),
  });
};

// Settlement Reports
export const useSettlementReport = (filters: SettlementReportFilters = {}) => {
  const { environment } = useEnvironment();
  return useQuery({
    queryKey: ['reports', 'settlements', filters, environment],
    queryFn: () => getSettlementReport(filters, environment),
    enabled: !!environment, // Only run when environment is available
    staleTime: 0, // No cache - always fetch fresh data when environment changes
    refetchOnMount: true,
  });
};

// Revenue Reports
export const useRevenueReport = (filters: RevenueReportFilters = {}) => {
  const { environment } = useEnvironment();
  return useQuery({
    queryKey: ['reports', 'revenue', filters, environment],
    queryFn: () => getRevenueReport(filters, environment),
    enabled: !!environment, // Only run when environment is available
    staleTime: 0, // No cache - always fetch fresh data when environment changes
    refetchOnMount: true,
  });
};

// Scheduled Reports
export const useScheduledReports = () => {
  return useQuery({
    queryKey: ['reports', 'scheduled'],
    queryFn: getScheduledReports,
  });
};

export const useScheduledReport = (id: string) => {
  return useQuery({
    queryKey: ['reports', 'scheduled', id],
    queryFn: () => getScheduledReport(id),
    enabled: !!id,
  });
};

export const useCreateScheduledReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateScheduledReportRequest) => createScheduledReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', 'scheduled'] });
    },
  });
};

export const useUpdateScheduledReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateScheduledReportRequest }) =>
      updateScheduledReport(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reports', 'scheduled'] });
      queryClient.invalidateQueries({ queryKey: ['reports', 'scheduled', variables.id] });
    },
  });
};

export const useDeleteScheduledReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteScheduledReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', 'scheduled'] });
    },
  });
};

// Admin Routes
export const usePlatformSummary = () => {
  const { environment } = useEnvironment();
  
  return useQuery({
    queryKey: ['admin', 'reports', 'platform-summary', environment],
    queryFn: () => getPlatformSummary(environment || 'sandbox'),
    enabled: !!environment,
    staleTime: 2000,
  });
};

export const useTopMerchantsByVolume = (limit: number = 10) => {
  const { environment } = useEnvironment();
  
  return useQuery({
    queryKey: ['admin', 'reports', 'merchants', 'top-by-volume', limit, environment],
    queryFn: () => getTopMerchantsByVolume(limit, environment || 'sandbox'),
    enabled: !!environment,
    staleTime: 2000,
  });
};

export const useTopMerchantsByRevenue = (limit: number = 10) => {
  const { environment } = useEnvironment();
  
  return useQuery({
    queryKey: ['admin', 'reports', 'merchants', 'top-by-revenue', limit, environment],
    queryFn: () => getTopMerchantsByRevenue(limit, environment || 'sandbox'),
    enabled: !!environment,
    staleTime: 2000,
  });
};

export const useRecentlyOnboardedMerchants = (limit: number = 10) => {
  const { environment } = useEnvironment();
  
  return useQuery({
    queryKey: ['admin', 'reports', 'merchants', 'recently-onboarded', limit, environment],
    queryFn: () => getRecentlyOnboardedMerchants(limit, environment || 'sandbox'),
    enabled: !!environment,
    staleTime: 2000,
  });
};
