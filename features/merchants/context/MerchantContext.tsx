"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useGetFirstMerchant } from '../hooks/useMerchant';
import { useAuthContext } from '@/features/auth/context/AuthContext';
import type { Merchant } from '../types/index';

// Context type definition
interface MerchantContextType {
    merchant: Merchant | null;
    merchantId: string | null;
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<unknown>;
}

// Create context with undefined default
const MerchantContext = createContext<MerchantContextType | undefined>(undefined);

/**
 * Merchant Provider Component
 * Manages merchant account data globally across the app
 * Fetches fresh merchant data on mount if user is authenticated
 */
export function MerchantProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading: isAuthLoading, user } = useAuthContext();

    // Users blocked on first-login password change cannot access merchant endpoints yet.
    const requiresPasswordChange = Boolean(user?.mustChangePassword);

    // Only fetch merchant data if user is authenticated, is not an admin,
    // and is allowed to access merchant resources.
    const isMerchantUser = isAuthenticated && user?.role !== 'admin' && !requiresPasswordChange;
    const { data, isLoading: isMerchantLoading, error, refetch: refetchMerchant } = useGetFirstMerchant(isMerchantUser);

    // Extract merchant from response
    const merchant = data?.merchant || null;
    const merchantId = merchant?.id || null;

    // Combined loading state - true if auth is loading or (merchant user is authenticated AND merchant is loading)
    // We don't want to show merchant loading if we aren't even checking for a merchant yet (not authenticated or is admin)
    const isLoading = isAuthLoading || (isMerchantUser && isMerchantLoading);

    const value: MerchantContextType = {
        merchant,
        merchantId,
        isLoading,
        error: error as Error | null,
        refetch: async () => {
            if (isAuthenticated) {
                return refetchMerchant();
            }
            return Promise.resolve();
        },
    };

    return <MerchantContext.Provider value={value}>{children}</MerchantContext.Provider>;
}

/**
 * Hook to access merchant context
 * Must be used within MerchantProvider
 * 
 * @example
 * ```tsx
 * const { merchant, merchantId, isLoading } = useUserMerchantData();
 * ```
 */
export function useUserMerchantData(): MerchantContextType {
    const context = useContext(MerchantContext);

    if (context === undefined) {
        throw new Error('useUserMerchantData must be used within MerchantProvider');
    }

    return context;
}
