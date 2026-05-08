"use client";

import { useQuery } from '@tanstack/react-query';
import {
  listMerchantRefunds,
  getMerchantRefundDetails,
  listAllRefunds,
  getAdminRefundDetails,
} from './api';
import type { ListRefundsResponse, GetRefundDetailsResponse } from './types';

// Merchant Refund Hooks

/**
 * Hook to list refunds for a merchant
 */
export const useMerchantRefunds = (
  merchantId: string | null,
  params: {
    environment?: 'sandbox' | 'production';
    status?: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  },
  enabled: boolean = true
) => {
  return useQuery<ListRefundsResponse>({
    queryKey: ['merchant', 'refunds', merchantId, params],
    queryFn: () => {
      if (!merchantId) {
        throw new Error('Merchant ID is required');
      }
      return listMerchantRefunds(merchantId, params);
    },
    enabled: enabled && !!merchantId,
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Hook to get refund details for a merchant
 */
export const useMerchantRefundDetails = (
  merchantId: string | null,
  refundId: string | null
) => {
  return useQuery<GetRefundDetailsResponse>({
    queryKey: ['merchant', 'refunds', merchantId, refundId],
    queryFn: () => {
      if (!merchantId || !refundId) {
        throw new Error('Merchant ID and Refund ID are required');
      }
      return getMerchantRefundDetails(merchantId, refundId);
    },
    enabled: !!merchantId && !!refundId,
  });
};

// Admin Refund Hooks

/**
 * Hook to list all refunds (Admin - across all merchants)
 */
export const useAllRefunds = (
  params: {
    merchantId?: string;
    environment?: 'sandbox' | 'production';
    status?: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  },
  enabled: boolean = true
) => {
  return useQuery<ListRefundsResponse>({
    queryKey: ['admin', 'refunds', params],
    queryFn: () => listAllRefunds(params),
    enabled: enabled,
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Hook to get refund details (Admin - can access any merchant's refund)
 */
export const useAdminRefundDetails = (refundId: string | null) => {
  return useQuery<GetRefundDetailsResponse>({
    queryKey: ['admin', 'refunds', refundId],
    queryFn: () => {
      if (!refundId) {
        throw new Error('Refund ID is required');
      }
      return getAdminRefundDetails(refundId);
    },
    enabled: !!refundId,
  });
};
