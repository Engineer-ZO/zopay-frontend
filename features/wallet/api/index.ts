import { apiClient } from "@/lib/apiClient";
import { WalletSummary, WalletActivity, WalletActivityParams } from "../types";
import type { Environment } from "@/core/environment/EnvironmentContext";

const WALLET_BASE_URL = "/wallet";

/**
 * Wallet API Client
 * Provides methods to interact with the Wallet API endpoints
 */
export const walletApi = {
    /**
     * Get Wallet Balance Summary
     * Fetches comprehensive balance overview for dashboard display
     * 
     * @param environment - Required environment parameter ('sandbox' | 'production')
     * @returns Promise<WalletSummary> - Balance summary data
     */
    getSummary: async (environment: Environment): Promise<WalletSummary> => {
        const params: Record<string, string> = {
            environment, // ALWAYS pass environment
        };

        console.log('[walletApi.getSummary] Called with environment:', environment);
        console.log('[walletApi.getSummary] Params being sent:', params);

        const response = await apiClient.get<WalletSummary>(`${WALLET_BASE_URL}/summary`, { params });
        return response.data;
    },

    /**
     * Get Recent Wallet Activity
     * Fetches chronological list of recent transactions for activity feed
     * 
     * @param params - Query parameters (limit)
     * @param environment - Required environment parameter ('sandbox' | 'production')
     * @returns Promise<WalletActivity[]> - Array of wallet activities
     */
    getActivity: async (params: WalletActivityParams | undefined, environment: Environment): Promise<WalletActivity[]> => {
        const queryParams: Record<string, string | number> = {
            environment, // ALWAYS pass environment
        };

        if (params?.limit) {
            queryParams.limit = params.limit;
        }

        console.log('[walletApi.getActivity] Called with environment:', environment);
        console.log('[walletApi.getActivity] Params being sent:', queryParams);

        const response = await apiClient.get<WalletActivity[]>(`${WALLET_BASE_URL}/activity`, { params: queryParams });
        return response.data;
    },
};
