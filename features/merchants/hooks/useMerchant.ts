import { useMutation, useQuery, useQueryClient, UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useEnvironment } from '@/core/environment/EnvironmentContext';
import {
    createMerchant,
    getUserMerchants,
    getMerchant,
    getFirstMerchant,
    updateMerchant,
    updateMerchantProfile,
    uploadMerchantLogo,
    submitProfileUpdateRequest,
    submitKYB,
    approveKYB,
    rejectKYB,
    requestProduction,
    approveProduction,
    suspendSandbox,
    reactivateSandbox,
    suspendProduction,
    reactivateProduction,
    regenerateSandboxCredentials,
    regenerateProductionCredentials,
    getPendingKYBSubmissions,
    getPendingProductionSummary,
    getDashboardStats,
    getRecentTransactions,
    topUpWallet,
    withdrawFromWallet,
    getWalletOperations,
    listBankTopupAccounts,
    createBankTopupRequest,
    uploadBankTopupReceipt,
    listMerchantBankTopups,
    getMerchantBankTopup,
} from '../api/index';
import type {
    CreateMerchantRequest,
    CreateMerchantResponse,
    GetMerchantResponse,
    GetFirstMerchantResponse,
    GetUserMerchantsResponse,
    UpdateMerchantRequest,
    UpdateMerchantResponse,
    UpdateMerchantProfileRequest,
    UpdateMerchantProfileResponse,
    SubmitProfileUpdateRequestBody,
    SubmitProfileUpdateResponse,
    SubmitKYBResponse,
    ApproveKYBResponse,
    RejectKYBResponse,
    RequestProductionResponse,
    ApproveProductionResponse,
    SuspendSandboxResponse,
    ReactivateSandboxResponse,
    SuspendProductionResponse,
    ReactivateProductionResponse,
    RegenerateSandboxCredentialsResponse,
    RegenerateProductionCredentialsResponse,
    GetPendingKYBSubmissionsResponse,
    GetPendingProductionSummaryResponse,
    DashboardStatsResponse,
    RecentTransactionsResponse,
    TopUpRequest,
    TopUpResponse,
    WithdrawRequest,
    WithdrawResponse,
    WalletOperationsResponse,
    BankTopupAccountsResponse,
    CreateBankTopupRequestPayload,
    CreateBankTopupRequestResponse,
    UploadBankTopupReceiptPayload,
    UploadBankTopupReceiptResponse,
    MerchantBankTopupRequestsResponse,
    MerchantBankTopupRequestResponse,
} from '../types/index';

/**
 * Hook for creating a new merchant account
 * Automatically creates sandbox credentials
 */
export const useCreateMerchant = (): UseMutationResult<
    CreateMerchantResponse,
    Error,
    CreateMerchantRequest
> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateMerchantRequest) => createMerchant(data),
        onSuccess: () => {
            // Invalidate merchant queries to ensure fresh data is fetched
            queryClient.invalidateQueries({ queryKey: ['merchant'] });
            queryClient.invalidateQueries({ queryKey: ['merchants'] });
        },
    });
};

/**
 * Hook for fetching all merchants that the authenticated user has access to
 */
export const useGetUserMerchants = (
    enabled: boolean = true
): UseQueryResult<GetUserMerchantsResponse, Error> => {
    return useQuery({
        queryKey: ['merchants'],
        queryFn: () => getUserMerchants(),
        enabled: enabled,
    });
};

/**
 * Hook for fetching merchant profile details
 */
export const useGetMerchant = (
    merchantId: string,
    enabled: boolean = true
): UseQueryResult<GetMerchantResponse, Error> => {
    return useQuery({
        queryKey: ['merchant', merchantId],
        queryFn: () => getMerchant(merchantId),
        enabled: enabled && !!merchantId,
    });
};

/**
 * Hook for fetching the first merchant account associated with the authenticated user
 * Returns 404 if user has no merchant accounts
 * Refetches on mount and when enabled state changes to ensure fresh data
 */
export const useGetFirstMerchant = (
    enabled: boolean = true
): UseQueryResult<GetFirstMerchantResponse, Error> => {
    return useQuery({
        queryKey: ['merchant', 'first'],
        queryFn: () => getFirstMerchant(),
        enabled: enabled,
        refetchOnMount: true, // Always refetch when component mounts
        staleTime: 0, // Consider data stale immediately to ensure fresh fetch on app load
    });
};

/**
 * Hook for updating merchant profile information
 */
export const useUpdateMerchant = (
    merchantId: string
): UseMutationResult<UpdateMerchantResponse, Error, UpdateMerchantRequest> => {
    return useMutation({
        mutationFn: (data: UpdateMerchantRequest) => updateMerchant(merchantId, data),
    });
};

/**
 * Hook for submitting KYB documents for verification
 */
export const useSubmitKYB = (
    merchantId: string
): UseMutationResult<SubmitKYBResponse, Error, void> => {
    return useMutation({
        mutationFn: () => submitKYB(merchantId),
    });
};

/**
 * Hook for approving merchant's KYB submission (Admin only)
 */
export const useApproveKYB = (
    merchantId: string
): UseMutationResult<ApproveKYBResponse, Error, void> => {
    return useMutation({
        mutationFn: () => approveKYB(merchantId),
    });
};

/**
 * Hook for rejecting merchant's KYB submission (Admin only)
 */
export const useRejectKYB = (
    merchantId: string
): UseMutationResult<RejectKYBResponse, Error, void> => {
    return useMutation({
        mutationFn: () => rejectKYB(merchantId),
    });
};

/**
 * Hook for requesting production environment access
 */
export const useRequestProduction = (
    merchantId: string
): UseMutationResult<RequestProductionResponse, Error, void> => {
    return useMutation({
        mutationFn: () => requestProduction(merchantId),
    });
};

/**
 * Hook for approving production access (Admin only)
 * Generates production credentials
 */
export const useApproveProduction = (
    merchantId: string
): UseMutationResult<ApproveProductionResponse, Error, void> => {
    return useMutation({
        mutationFn: () => approveProduction(merchantId),
    });
};

/**
 * Hook for suspending merchant's sandbox environment (Admin only)
 */
export const useSuspendSandbox = (
    merchantId: string
): UseMutationResult<SuspendSandboxResponse, Error, void> => {
    return useMutation({
        mutationFn: () => suspendSandbox(merchantId),
    });
};

/**
 * Hook for reactivating merchant's sandbox environment (Admin only)
 */
export const useReactivateSandbox = (
    merchantId: string
): UseMutationResult<ReactivateSandboxResponse, Error, void> => {
    return useMutation({
        mutationFn: () => reactivateSandbox(merchantId),
    });
};

/**
 * Hook for suspending merchant's production environment (Admin only)
 */
export const useSuspendProduction = (
    merchantId: string
): UseMutationResult<SuspendProductionResponse, Error, void> => {
    return useMutation({
        mutationFn: () => suspendProduction(merchantId),
    });
};

/**
 * Hook for reactivating merchant's production environment (Admin only)
 */
export const useReactivateProduction = (
    merchantId: string
): UseMutationResult<ReactivateProductionResponse, Error, void> => {
    return useMutation({
        mutationFn: () => reactivateProduction(merchantId),
    });
};

/**
 * Hook for regenerating sandbox API credentials
 * WARNING: Old credentials will be invalidated immediately
 */
export const useRegenerateSandboxCredentials = (
    merchantId: string
): UseMutationResult<RegenerateSandboxCredentialsResponse, Error, void> => {
    return useMutation({
        mutationFn: () => regenerateSandboxCredentials(merchantId),
    });
};

/**
 * Hook for regenerating production API credentials
 * WARNING: Old credentials will be invalidated immediately
 * Requires production environment to be ACTIVE
 */
export const useRegenerateProductionCredentials = (
    merchantId: string
): UseMutationResult<RegenerateProductionCredentialsResponse, Error, void> => {
    return useMutation({
        mutationFn: () => regenerateProductionCredentials(merchantId),
    });
};

/**
 * Hook for fetching pending KYB submissions (Admin only)
 * Returns all merchants with kycStatus = 'PENDING'
 */
export const useGetPendingKYBSubmissions = (): UseQueryResult<GetPendingKYBSubmissionsResponse, Error> => {
    return useQuery({
        queryKey: ['pending-kyb-submissions'],
        queryFn: getPendingKYBSubmissions,
    });
};

/**
 * Hook for fetching pending production summary (Admin only)
 * Returns merchants with approved KYB awaiting production access
 */
export const useGetPendingProductionSummary = (): UseQueryResult<GetPendingProductionSummaryResponse, Error> => {
    return useQuery({
        queryKey: ['pending-production-summary'],
        queryFn: getPendingProductionSummary,
    });
};

/**
 * Hook for fetching dashboard overview stats
 * Returns 5 key metric cards for the dashboard
 */
export const useDashboardStats = (
    merchantId: string,
    period: '7d' | '30d' | '90d' | 'all' = '30d',
    enabled: boolean = true
): UseQueryResult<DashboardStatsResponse, Error> => {
    const { environment } = useEnvironment();
    
    console.log('[merchants/useDashboardStats] Hook called - environment:', environment, 'merchantId:', merchantId, 'period:', period);
    
    return useQuery({
        queryKey: ['dashboard', 'stats', merchantId, period, environment],
        queryFn: () => {
            console.log('[merchants/useDashboardStats] queryFn executing - environment:', environment, 'merchantId:', merchantId);
            return getDashboardStats(merchantId, period, environment);
        },
        enabled: enabled && !!merchantId && !!environment, // Only run when merchantId and environment are available
        refetchInterval: 30000, // Refetch every 30 seconds
        staleTime: 0, // No cache - always fetch fresh data when environment changes
        refetchOnMount: true,
    });
};

/**
 * Hook for fetching recent transactions
 * Returns the most recent transactions for dashboard display
 */
export const useRecentTransactions = (
    merchantId: string,
    limit: number = 10,
    type?: 'collection' | 'payout' | 'refund',
    enabled: boolean = true
): UseQueryResult<RecentTransactionsResponse, Error> => {
    const { environment } = useEnvironment();
    
    console.log('[merchants/useRecentTransactions] Hook called - environment:', environment, 'merchantId:', merchantId, 'limit:', limit, 'type:', type);
    
    return useQuery({
        queryKey: ['dashboard', 'transactions', 'recent', merchantId, limit, type, environment],
        queryFn: () => {
            console.log('[merchants/useRecentTransactions] queryFn executing - environment:', environment, 'merchantId:', merchantId);
            return getRecentTransactions(merchantId, limit, type, environment);
        },
        enabled: enabled && !!merchantId && !!environment, // Only run when merchantId and environment are available
        refetchInterval: 60000, // Refetch every 60 seconds
        staleTime: 0, // No cache - always fetch fresh data when environment changes
        refetchOnMount: true,
    });
};

/**
 * Hook for topping up wallet
 * Adds money to merchant wallet via mobile money
 */
export const useTopUpWallet = (
    merchantId: string
): UseMutationResult<TopUpResponse, Error, TopUpRequest> => {
    return useMutation({
        mutationFn: (data: TopUpRequest) => topUpWallet(merchantId, data),
    });
};

/**
 * Hook for withdrawing from wallet
 * Withdraws money from merchant wallet to a mobile number
 */
export const useWithdrawFromWallet = (
    merchantId: string
): UseMutationResult<WithdrawResponse, Error, WithdrawRequest> => {
    return useMutation({
        mutationFn: (data: WithdrawRequest) => withdrawFromWallet(merchantId, data),
    });
};

/**
 * Hook for fetching wallet operation history
 * Returns history of all top-ups and withdrawals
 */
export const useWalletOperations = (
    merchantId: string,
    environment?: 'sandbox' | 'production',
    limit: number = 50,
    enabled: boolean = true
): UseQueryResult<WalletOperationsResponse, Error> => {
    return useQuery({
        queryKey: ['wallet', 'operations', merchantId, environment, limit],
        queryFn: () => getWalletOperations(merchantId, environment, limit),
        enabled: enabled && !!merchantId,
    });
};

export const useBankTopupAccounts = (
    enabled: boolean = true
): UseQueryResult<BankTopupAccountsResponse, Error> => {
    return useQuery({
        queryKey: ['wallet', 'bank-topup-accounts'],
        queryFn: () => listBankTopupAccounts(),
        enabled,
        staleTime: 60 * 1000,
    });
};

export const useCreateBankTopupRequest = (): UseMutationResult<
    CreateBankTopupRequestResponse,
    Error,
    CreateBankTopupRequestPayload
> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => createBankTopupRequest(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wallet', 'bank-topups'] });
            queryClient.invalidateQueries({ queryKey: ['wallet', 'summary'] });
            queryClient.invalidateQueries({ queryKey: ['wallet', 'activity'] });
        },
    });
};

export const useUploadBankTopupReceipt = (): UseMutationResult<
    UploadBankTopupReceiptResponse,
    Error,
    { requestId: string; payload: UploadBankTopupReceiptPayload }
> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ requestId, payload }) => uploadBankTopupReceipt(requestId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wallet', 'bank-topups'] });
        },
    });
};

export const useMerchantBankTopups = (
    enabled: boolean = true
): UseQueryResult<MerchantBankTopupRequestsResponse, Error> => {
    return useQuery({
        queryKey: ['wallet', 'bank-topups'],
        queryFn: () => listMerchantBankTopups(),
        enabled,
        staleTime: 30 * 1000,
    });
};

export const useMerchantBankTopup = (
    requestId: string,
    enabled: boolean = true
): UseQueryResult<MerchantBankTopupRequestResponse, Error> => {
    return useQuery({
        queryKey: ['wallet', 'bank-topups', requestId],
        queryFn: () => getMerchantBankTopup(requestId),
        enabled: enabled && !!requestId,
    });
};

/**
 * Hook for updating merchant profile
 * Updates the first merchant account linked to the authenticated user
 * All fields are optional - only provided fields will be updated
 */
export const useUpdateMerchantProfile = (): UseMutationResult<UpdateMerchantProfileResponse, Error, UpdateMerchantProfileRequest> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (updates: UpdateMerchantProfileRequest) => updateMerchantProfile(updates),
        onSuccess: () => {
            // Invalidate merchant queries to refresh data
            queryClient.invalidateQueries({ queryKey: ['merchant', 'first'] });
            queryClient.invalidateQueries({ queryKey: ['merchant'] });
        },
    });
};

/**
 * Hook for submitting merchant profile updates for admin review.
 * Merchants cannot directly edit profile/account fields anymore.
 */
export const useSubmitProfileUpdateRequest = (): UseMutationResult<
    SubmitProfileUpdateResponse,
    Error,
    SubmitProfileUpdateRequestBody
> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (body: SubmitProfileUpdateRequestBody) => submitProfileUpdateRequest(body),
        onSuccess: () => {
            // Refresh merchant data so the UI reflects any changes (or at least refetch status fields).
            queryClient.invalidateQueries({ queryKey: ['merchant', 'first'] });
            queryClient.invalidateQueries({ queryKey: ['merchant'] });
        },
    });
};

/**
 * Hook for uploading a merchant logo and saving the file id to the merchant profile.
 * 1. Uploads the file to /files/v1/upload?type=MERCHANT_LOGO
 * 2. PUTs the returned file id to /merchant/v1/profile as logoFileId
 */
export const useUploadMerchantLogo = (): UseMutationResult<UpdateMerchantProfileResponse, Error, File> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (file: File) => {
            const uploaded = await uploadMerchantLogo(file);
            return updateMerchantProfile({ logoFileId: uploaded.id });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['merchant', 'first'] });
            queryClient.invalidateQueries({ queryKey: ['merchant'] });
        },
    });
};

/**
 * Hook for removing the merchant logo (sets logoFileId to null).
 */
export const useRemoveMerchantLogo = (): UseMutationResult<UpdateMerchantProfileResponse, Error, void> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => updateMerchantProfile({ logoFileId: null }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['merchant', 'first'] });
            queryClient.invalidateQueries({ queryKey: ['merchant'] });
        },
    });
};
