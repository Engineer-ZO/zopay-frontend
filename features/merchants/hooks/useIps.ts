import { useMutation, useQuery, UseMutationResult, UseQueryResult, useQueryClient } from '@tanstack/react-query';
import { addIp, deleteIp, getIps } from '../api/index';
import type {
    AddIpRequest,
    AddIpResponse,
    DeleteIpResponse,
    GetIpsResponse,
} from '../types/index';

/**
 * Hook for adding an IP address for admin approval
 */
export const useAddIp = (
    merchantId: string
): UseMutationResult<AddIpResponse, Error, AddIpRequest> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AddIpRequest) => addIp(merchantId, data),
        onSuccess: () => {
            // Invalidate IPs query to refetch the list
            queryClient.invalidateQueries({ queryKey: ['ips', merchantId] });
        },
    });
};

/**
 * Hook for deleting an IP address (only PENDING or REJECTED)
 */
export const useDeleteIp = (
    merchantId: string
): UseMutationResult<DeleteIpResponse, Error, string> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (ipId: string) => deleteIp(merchantId, ipId),
        onSuccess: () => {
            // Invalidate IPs query to refetch the list
            queryClient.invalidateQueries({ queryKey: ['ips', merchantId] });
        },
    });
};

/**
 * Hook for fetching all IP addresses for a merchant
 */
export const useGetIps = (
    merchantId: string,
    enabled: boolean = true
): UseQueryResult<GetIpsResponse, Error> => {
    return useQuery({
        queryKey: ['ips', merchantId],
        queryFn: () => getIps(merchantId),
        enabled: enabled && !!merchantId,
    });
};
