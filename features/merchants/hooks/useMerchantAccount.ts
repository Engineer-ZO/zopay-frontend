import { useGetUserMerchants } from './useMerchant';
import type { Merchant } from '../types/index';

/**
 * Convenience hook to get the authenticated user's merchant account
 * Since each user has exactly one merchant account, this extracts it from the array
 * @param enabled - Whether to enable the query (default: true)
 */
export const useMerchantAccount = (enabled: boolean = true) => {
    const { data, isLoading, error, refetch } = useGetUserMerchants(enabled);

    return {
        merchant: data?.merchants[0] as Merchant | undefined,
        isLoading,
        error,
        refetch,
    };
};
