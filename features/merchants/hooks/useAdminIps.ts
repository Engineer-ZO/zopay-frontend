import { useMutation, useQuery, UseMutationResult, UseQueryResult, useQueryClient } from '@tanstack/react-query';
import {
    getPendingIpRequests,
    getAllIpRequests,
    approveIp,
    rejectIp,
    adminDeleteIp
} from '../api/index';
import type {
    GetPendingIpRequestsResponse,
    GetAllIpRequestsResponse,
    ApproveIpResponse,
    RejectIpRequest,
    RejectIpResponse,
    DeleteIpResponse,
} from '../types/index';

/**
 * Hook for getting pending IP requests (Admin only)
 */
export const useGetPendingIpRequests = (): UseQueryResult<GetPendingIpRequestsResponse, Error> => {
    return useQuery({
        queryKey: ['admin', 'ips', 'pending'],
        queryFn: () => getPendingIpRequests(),
    });
};

/**
 * Hook for getting all IP requests with optional filter (Admin only)
 */
export const useGetAllIpRequests = (
    status?: 'PENDING' | 'APPROVED' | 'REJECTED'
): UseQueryResult<GetAllIpRequestsResponse, Error> => {
    return useQuery({
        queryKey: ['admin', 'ips', 'all', status],
        queryFn: () => getAllIpRequests(status),
    });
};

/**
 * Hook for approving an IP request (Admin only)
 */
export const useApproveIp = (): UseMutationResult<ApproveIpResponse, Error, string> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (ipId: string) => approveIp(ipId),
        onSuccess: () => {
            // Invalidate all IP queries to refetch
            queryClient.invalidateQueries({ queryKey: ['admin', 'ips'] });
        },
    });
};

/**
 * Hook for rejecting an IP request (Admin only)
 */
export const useRejectIp = (): UseMutationResult<
    RejectIpResponse,
    Error,
    { ipId: string; data: RejectIpRequest }
> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ ipId, data }) => rejectIp(ipId, data),
        onSuccess: () => {
            // Invalidate all IP queries to refetch
            queryClient.invalidateQueries({ queryKey: ['admin', 'ips'] });
        },
    });
};

/**
 * Hook for deleting an IP (Admin only)
 */
export const useAdminDeleteIp = (): UseMutationResult<DeleteIpResponse, Error, string> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (ipId: string) => adminDeleteIp(ipId),
        onSuccess: () => {
            // Invalidate all IP queries to refetch
            queryClient.invalidateQueries({ queryKey: ['admin', 'ips'] });
        },
    });
};
