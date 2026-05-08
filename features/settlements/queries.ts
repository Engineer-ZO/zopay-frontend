"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  setSettlementFrequency,
  generateSettlement,
  listSettlements,
  getSettlementDetails,
  getSettlementStatement,
  listAllSettlements,
  getAdminSettlementDetails,
  completeSettlement,
  reconcileFile,
  listReconciliationQueue,
  linkTransaction,
  markResolved,
} from './api';
import type {
  SetSettlementFrequencyRequest,
  GenerateSettlementRequest,
  CompleteSettlementRequest,
  LinkTransactionRequest,
  MarkResolvedRequest,
} from './types';

// Merchant Settlement Hooks

/**
 * Hook to set settlement frequency preference
 */
export const useSetSettlementFrequency = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SetSettlementFrequencyRequest) => setSettlementFrequency(data),
    onSuccess: () => {
      toast.success('Settlement frequency updated successfully');
      queryClient.invalidateQueries({ queryKey: ['merchant', 'settlement-frequency'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update settlement frequency');
    },
  });
};

/**
 * Hook to generate a settlement manually
 */
export const useGenerateSettlement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GenerateSettlementRequest) => generateSettlement(data),
    onSuccess: () => {
      toast.success('Settlement generated successfully');
      queryClient.invalidateQueries({ queryKey: ['settlements'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to generate settlement');
    },
  });
};

/**
 * Hook to list settlements
 */
export const useListSettlements = (
  params: {
    startDate?: string;
    endDate?: string;
    status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    page?: number;
    limit?: number;
  },
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['settlements', params],
    queryFn: () => listSettlements(params),
    enabled: enabled,
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Hook to get settlement details
 */
export const useSettlementDetails = (id: string | null) => {
  return useQuery({
    queryKey: ['settlements', id],
    queryFn: () => {
      if (!id) {
        throw new Error('Settlement ID is required');
      }
      return getSettlementDetails(id);
    },
    enabled: !!id,
  });
};

/**
 * Hook to get settlement statement URL
 */
export const useSettlementStatement = (id: string | null) => {
  return useMutation({
    mutationFn: () => {
      if (!id) {
        throw new Error('Settlement ID is required');
      }
      return getSettlementStatement(id);
    },
    onSuccess: (data) => {
      // Open PDF in new tab
      if (data.statementUrl) {
        window.open(data.statementUrl, '_blank');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to download statement');
    },
  });
};

// Admin Settlement Hooks

/**
 * Hook to list all settlements (Admin - across all merchants)
 */
export const useListAllSettlements = (
  params: {
    merchantId?: string;
    startDate?: string;
    endDate?: string;
    status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    page?: number;
    limit?: number;
  },
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['admin', 'settlements', params],
    queryFn: () => listAllSettlements(params),
    enabled: enabled,
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Hook to get settlement details (Admin - can access any merchant's settlement)
 */
export const useAdminSettlementDetails = (id: string | null) => {
  return useQuery({
    queryKey: ['admin', 'settlements', id],
    queryFn: () => {
      if (!id) {
        throw new Error('Settlement ID is required');
      }
      return getAdminSettlementDetails(id);
    },
    enabled: !!id,
  });
};

/**
 * Hook to complete a settlement
 */
export const useCompleteSettlement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CompleteSettlementRequest }) =>
      completeSettlement(id, data),
    onSuccess: () => {
      toast.success('Settlement marked as completed');
      queryClient.invalidateQueries({ queryKey: ['settlements'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'settlements'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to complete settlement');
    },
  });
};

// Reconciliation Hooks

/**
 * Hook to reconcile a gateway file
 */
export const useReconcileFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) => reconcileFile(fileId),
    onSuccess: (data) => {
      toast.success(
        `Reconciliation complete: ${data.matched} matched, ${data.missingInZitopay} missing in Zitopay`
      );
      queryClient.invalidateQueries({ queryKey: ['reconciliation', 'queue'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reconcile file');
    },
  });
};

/**
 * Hook to list reconciliation queue
 */
export const useReconciliationQueue = (params: {
  gateway?: 'MTN_MOMO' | 'ORANGE_MONEY';
  matchStatus?: 'MISSING_IN_ZITOPAY' | 'MISSING_IN_GATEWAY' | 'AMOUNT_MISMATCH';
  resolved?: boolean;
  assignedTo?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['reconciliation', 'queue', params],
    queryFn: () => listReconciliationQueue(params),
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Hook to link a transaction manually
 */
export const useLinkTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ queueItemId, data }: { queueItemId: string; data: LinkTransactionRequest }) =>
      linkTransaction(queueItemId, data),
    onSuccess: () => {
      toast.success('Transaction linked successfully');
      queryClient.invalidateQueries({ queryKey: ['reconciliation', 'queue'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to link transaction');
    },
  });
};

/**
 * Hook to mark a queue item as resolved
 */
export const useMarkResolved = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ queueItemId, data }: { queueItemId: string; data: MarkResolvedRequest }) =>
      markResolved(queueItemId, data),
    onSuccess: () => {
      toast.success('Item marked as resolved');
      queryClient.invalidateQueries({ queryKey: ['reconciliation', 'queue'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to mark as resolved');
    },
  });
};
