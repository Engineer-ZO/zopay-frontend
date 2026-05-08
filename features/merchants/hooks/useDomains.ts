import { useMutation, useQuery, UseMutationResult, UseQueryResult, useQueryClient } from '@tanstack/react-query';
import { addDomain, deleteDomain, getDomains } from '../api/index';
import type {
    AddDomainRequest,
    AddDomainResponse,
    DeleteDomainResponse,
    GetDomainsResponse,
} from '../types/index';

/**
 * Hook for adding a domain for admin approval
 */
export const useAddDomain = (
    merchantId: string
): UseMutationResult<AddDomainResponse, Error, AddDomainRequest> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AddDomainRequest) => addDomain(merchantId, data),
        onSuccess: () => {
            // Invalidate domains query to refetch the list
            queryClient.invalidateQueries({ queryKey: ['domains', merchantId] });
        },
    });
};

/**
 * Hook for deleting a domain (only PENDING or REJECTED)
 */
export const useDeleteDomain = (
    merchantId: string
): UseMutationResult<DeleteDomainResponse, Error, string> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (domainId: string) => deleteDomain(merchantId, domainId),
        onSuccess: () => {
            // Invalidate domains query to refetch the list
            queryClient.invalidateQueries({ queryKey: ['domains', merchantId] });
        },
    });
};

/**
 * Hook for fetching all domains for a merchant
 */
export const useGetDomains = (
    merchantId: string,
    enabled: boolean = true
): UseQueryResult<GetDomainsResponse, Error> => {
    return useQuery({
        queryKey: ['domains', merchantId],
        queryFn: () => getDomains(merchantId),
        enabled: enabled && !!merchantId,
    });
};
