"use client";

import { useQuery } from "@tanstack/react-query";
import { walletApi } from "../api";
import { WalletActivityParams } from "../types";
import { useEnvironment } from "@/core/environment/EnvironmentContext";

/**
 * Hook to fetch wallet balance summary
 * 
 * @returns Query result with wallet summary data
 * 
 * @example
 * ```tsx
 * const { data: summary, isLoading, error } = useWalletSummary();
 * 
 * if (isLoading) return <div>Loading...</div>;
 * if (error) return <div>Error loading wallet</div>;
 * 
 * return <div>Available: {summary.available}</div>;
 * ```
 */
export function useWalletSummary() {
    const { environment } = useEnvironment();
    
    console.log('[useWalletSummary] Hook called - environment:', environment);
    
    return useQuery({
        queryKey: ["wallet", "summary", environment],
        queryFn: () => {
            console.log('[useWalletSummary] queryFn executing - environment:', environment);
            return walletApi.getSummary(environment);
        },
        enabled: !!environment, // Only run when environment is available
        // Refetch every 30 seconds to keep balance updated
        refetchInterval: 30000,
        // Keep previous data while refetching
        placeholderData: (previousData) => previousData,
    });
}

/**
 * Hook to fetch wallet activity
 * 
 * @param params - Query parameters (limit)
 * @returns Query result with wallet activity data
 * 
 * @example
 * ```tsx
 * const { data: activities, isLoading, error } = useWalletActivity({ limit: 20 });
 * 
 * if (isLoading) return <div>Loading...</div>;
 * if (error) return <div>Error loading activity</div>;
 * 
 * return (
 *   <ul>
 *     {activities.map((activity, i) => (
 *       <li key={i}>{activity.label}: {activity.amount}</li>
 *     ))}
 *   </ul>
 * );
 * ```
 */
export function useWalletActivity(params?: WalletActivityParams) {
    const { environment } = useEnvironment();
    
    console.log('[useWalletActivity] Hook called - environment:', environment, 'params:', params);
    
    return useQuery({
        queryKey: ["wallet", "activity", params, environment],
        queryFn: () => {
            console.log('[useWalletActivity] queryFn executing - environment:', environment, 'params:', params);
            return walletApi.getActivity(params, environment);
        },
        enabled: !!environment, // Only run when environment is available
        // Refetch every minute to keep activity updated
        refetchInterval: 60000,
        // Keep previous data while refetching
        placeholderData: (previousData) => previousData,
    });
}
