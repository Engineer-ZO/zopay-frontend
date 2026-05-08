import { useMutation, useQuery, UseMutationResult, UseQueryResult, useQueryClient } from '@tanstack/react-query';
import {
    getPendingDomainRequests,
    getAllDomainRequests,
    approveDomain,
    rejectDomain,
    adminDeleteDomain
} from '../api/index';
import type {
    GetPendingDomainRequestsResponse,
    GetAllDomainRequestsResponse,
    ApproveDomainResponse,
    RejectDomainRequest,
    RejectDomainResponse,
    DeleteDomainResponse,
} from '../types/index';

/**
 * Hook for getting pending domain requests (Admin only)
 */
export const useGetPendingDomainRequests = (): UseQueryResult<GetPendingDomainRequestsResponse, Error> => {
    return useQuery({
        queryKey: ['admin', 'domains', 'pending'],
        queryFn: () => getPendingDomainRequests(),
    });
};

/**
 * Hook for getting all domain requests with optional filter (Admin only)
 */
export const useGetAllDomainRequests = (
    status?: 'PENDING' | 'APPROVED' | 'REJECTED'
): UseQueryResult<GetAllDomainRequestsResponse, Error> => {
    return useQuery({
        queryKey: ['admin', 'domains', 'all', status],
        queryFn: () => getAllDomainRequests(status),
    });
};

/**
 * Hook for approving a domain request (Admin only)
 */
export const useApproveDomain = (): UseMutationResult<ApproveDomainResponse, Error, string> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (domainId: string) => approveDomain(domainId),
        onSuccess: () => {
            // Invalidate all domain queries to refetch
            queryClient.invalidateQueries({ queryKey: ['admin', 'domains'] });
        },
    });
};

/**
 * Hook for rejecting a domain request (Admin only)
 */
export const useRejectDomain = (): UseMutationResult<
    RejectDomainResponse,
    Error,
    { domainId: string; data: RejectDomainRequest }
> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ domainId, data }) => rejectDomain(domainId, data),
        onSuccess: () => {
            // Invalidate all domain queries to refetch
            queryClient.invalidateQueries({ queryKey: ['admin', 'domains'] });
        },
    });
};

/**
 * Hook for deleting a domain (Admin only)
 */
export const useAdminDeleteDomain = (): UseMutationResult<DeleteDomainResponse, Error, string> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (domainId: string) => adminDeleteDomain(domainId),
        onSuccess: () => {
            // Invalidate all domain queries to refetch
            queryClient.invalidateQueries({ queryKey: ['admin', 'domains'] });
        },
    });
};
