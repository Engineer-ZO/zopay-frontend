"use client";

import { useQuery, useMutation, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import {
    adminApi,
    adminListWithdrawalMethods,
    adminAddMobileMoney,
    adminApproveWithdrawalMethod,
    adminRejectWithdrawalMethod,
    adminDisableWithdrawalMethod,
    adminDeleteWithdrawalMethod,
    adminGetPendingBatches,
    adminApproveBatch,
    adminRejectBatch,
    adminGetApprovalThreshold,
    adminSetApprovalThreshold,
    getPlatformMetrics,
    getHealthMetrics,
    getGatewayPerformance,
    getAllMerchantUsers,
    getAdminMerchantDetail,
    forceLogoutMerchant,
    createMerchantAccount,
    createIndividualMerchantAccount,
    createCompanyMerchantAccount,
    createAssociationMerchantAccount,
    createGroupMerchantAccount,
    updateMerchant,
    generateBypassPassword,
    getAllTransactions,
    reconcileTransaction,
    getPlatformSettings,
    getNotificationSettings,
    updateMerchantRegistrationSettings,
    updatePlatformWithdrawals,
    updateNotificationSettings,
    getFeeVersions,
    createFeeVersion,
    activateFeeVersion,
    getFeeRules,
    getFeeRule,
    createFeeRule,
    updateFeeRule,
    activateFeeRule,
    deactivateFeeRule,
    getFeeTiers,
    createFeeTier,
    updateFeeTier,
    getMerchantFeeOverrides,
    createMerchantFeeOverride,
    updateMerchantFeeOverride,
    deactivateMerchantFeeOverride,
    getPlatformWalletFeeSettings,
    updatePlatformWalletFeeSettings,
    listTopupFeeRules,
    upsertTopupFeeRule,
    deleteTopupFeeRule,
    listAdminBankTopupAccounts,
    createAdminBankTopupAccount,
    updateAdminBankTopupAccount,
    deleteAdminBankTopupAccount,
    listAdminBankTopupRequests,
    approveAdminBankTopupRequest,
    rejectAdminBankTopupRequest,
    createMerchantWalletAdjustment,
    listMerchantWalletAdjustments,
    deleteMerchant,
    getGlobalGateways,
    updateGlobalGateway,
    updateMerchantStatus,
    updateMerchantCapabilities,
    getMerchantGatewayConfigs,
    updateMerchantGatewayConfig,
    adminVerifyMsisdn,
    adminVerifyMsisdnBulk,
    // Support API
    getAdminTickets,
    getAdminTicketDetails,
    replyAsAdmin,
    updateTicketAttributes,
} from "./api";
import {
    PlatformMetricsResponse,
    HealthMetricsResponse,
    GatewayPerformanceResponse,
    MerchantUsersResponse,
    AdminMerchantDetailResponse,
    ForceLogoutMerchantResponse,
    CreateMerchantRequest,
    UpdateMerchantRequest,
    CreateIndividualMerchantRequest,
    CreateCompanyMerchantRequest,
    CreateAssociationMerchantRequest,
    CreateGroupMerchantRequest,
    AdminTransactionsResponse,
    AdminTransactionFilters,
    ReconcileTransactionRequest,
    GetPlatformSettingsResponse,
    GetNotificationSettingsResponse,
    UpdateNotificationSettingsRequest,
    UpdateNotificationSettingsResponse,
    UpdateMerchantRegistrationSettingsRequest,
    UpdatePlatformWithdrawalsRequest,
    UpdatePlatformWithdrawalsResponse,
    FeeVersionsResponse,
    CreateFeeVersionRequest,
    CreateFeeVersionResponse,
    ActivateFeeVersionResponse,
    FeeRulesResponse,
    FeeRuleResponse,
    FeeRuleFilters,
    CreateFeeRuleRequest,
    CreateFeeRuleResponse,
    UpdateFeeRuleRequest,
    ActivateFeeRuleResponse,
    DeactivateFeeRuleResponse,
    FeeTiersResponse,
    CreateFeeTierRequest,
    CreateFeeTierResponse,
    UpdateFeeTierRequest,
    UpdateFeeTierResponse,
    MerchantFeeOverridesResponse,
    MerchantFeeOverrideResponse,
    MerchantFeeOverrideFilters,
    CreateMerchantFeeOverrideRequest,
    UpdateMerchantFeeOverrideRequest,
    DeactivateMerchantFeeOverrideResponse,
    PlatformWalletFeeSettingsResponse,
    UpdatePlatformWalletFeeSettingsRequest,
    ListTopupFeeRulesResponse,
    UpsertTopupFeeRuleRequest,
    UpsertTopupFeeRuleResponse,
    ListAdminBankTopupAccountsResponse,
    CreateAdminBankTopupAccountRequest,
    UpdateAdminBankTopupAccountRequest,
    UpsertAdminBankTopupAccountResponse,
    ListAdminBankTopupRequestsResponse,
    ReviewAdminBankTopupRequestPayload,
    ReviewAdminBankTopupRequestResponse,
    CreateMerchantWalletAdjustmentRequest,
    CreateMerchantWalletAdjustmentResponse,
    ListMerchantWalletAdjustmentsResponse,
    DeleteMerchantResponse,
    GenerateBypassPasswordRequest,
    GenerateBypassPasswordResponse,
    GetGlobalGatewaysResponse,
    UpdateGlobalGatewayRequest,
    MerchantStatusUpdate,
    MerchantCapabilitiesUpdate,
    GetMerchantGatewayConfigsResponse,
    MerchantGatewayConfigUpdate,
    AdminMsisdnVerifyRequest,
    AdminMsisdnVerifyResponse,
    AdminMsisdnVerifyBulkRequest,
    AdminMsisdnVerifyBulkResponse,
    SupportTicketFilters
} from "./types";
import {
    GetAdminTicketsResponse,
    AdminReplyTicketRequest,
    UpdateTicketAttributesRequest
} from "@/features/support/types";

// ----------------------------------------------------------------------
// ADMIN SUPPORT TICKET HOOKS
// ----------------------------------------------------------------------

export function useAdminTickets(filters?: SupportTicketFilters): UseQueryResult<GetAdminTicketsResponse, Error> {
    return useQuery({
        queryKey: ["admin", "support", "tickets", filters],
        queryFn: () => getAdminTickets(filters),
        staleTime: 30000,
    });
}

export function useAdminTicketDetails(ticketId: string) {
    return useQuery({
        queryKey: ["admin", "support", "ticket", ticketId],
        queryFn: () => getAdminTicketDetails(ticketId),
        enabled: !!ticketId,
    });
}

export function useReplyAsAdmin() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ ticketId, data }: { ticketId: string; data: AdminReplyTicketRequest }) =>
            replyAsAdmin(ticketId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["admin", "support", "ticket", variables.ticketId] });
            queryClient.invalidateQueries({ queryKey: ["admin", "support", "tickets"] });
        },
    });
}

export function useUpdateTicketAttributes() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ ticketId, data }: { ticketId: string; data: UpdateTicketAttributesRequest }) =>
            updateTicketAttributes(ticketId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["admin", "support", "ticket", variables.ticketId] });
            queryClient.invalidateQueries({ queryKey: ["admin", "support", "tickets"] });
        },
    });
}

/**
 * Legacy hook for admin stats (keeping for backward compatibility)
 */
export function useAdminStats() {
    return useQuery({
        queryKey: ["admin", "stats"],
        queryFn: () => adminApi.getStats(),
    });
}

/**
 * Hook for fetching platform metrics
 * Returns total merchants, active merchants, platform revenue, and total volume
 */
export function usePlatformMetrics(): UseQueryResult<PlatformMetricsResponse, Error> {
    return useQuery({
        queryKey: ["admin", "dashboard", "platform-metrics"],
        queryFn: () => getPlatformMetrics(),
        refetchInterval: 30000, // Refetch every 30 seconds (matches backend cache TTL)
        staleTime: 30000, // Consider data stale after 30 seconds
    });
}

/**
 * Hook for fetching health metrics
 * Returns success rate, failed transactions, pending KYB, and recon issues
 */
export function useHealthMetrics(): UseQueryResult<HealthMetricsResponse, Error> {
    return useQuery({
        queryKey: ["admin", "dashboard", "health-metrics"],
        queryFn: () => getHealthMetrics(),
        refetchInterval: 30000, // Refetch every 30 seconds (matches backend cache TTL)
        staleTime: 30000, // Consider data stale after 30 seconds
    });
}

/**
 * Hook for fetching gateway performance metrics
 * Returns performance data for each gateway (MTN, Orange, etc.)
 */
export function useGatewayPerformance(): UseQueryResult<GatewayPerformanceResponse, Error> {
    return useQuery({
        queryKey: ["admin", "dashboard", "gateway-performance"],
        queryFn: () => getGatewayPerformance(),
        refetchInterval: 30000, // Refetch every 30 seconds (matches backend cache TTL)
        staleTime: 30000, // Consider data stale after 30 seconds
    });
}

/**
 * Hook for fetching all merchant users
 * Returns comprehensive list of all merchant-user relationships
 */
export function useMerchantUsers(): UseQueryResult<MerchantUsersResponse, Error> {
    return useQuery({
        queryKey: ["admin", "merchant-users"],
        queryFn: () => getAllMerchantUsers(),
        refetchInterval: 60000, // Refetch every 60 seconds
        staleTime: 30000, // Consider data stale after 30 seconds
    });
}

export function useAdminMerchantDetail(
    merchantId: string,
    enabled: boolean = true
): UseQueryResult<AdminMerchantDetailResponse, Error> {
    return useQuery({
        queryKey: ["admin", "merchant-detail", merchantId],
        queryFn: () => getAdminMerchantDetail(merchantId),
        enabled: enabled && !!merchantId,
        staleTime: 30000,
    });
}

export function useCreateMerchantAccount() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateMerchantRequest) => createMerchantAccount(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "merchant-users"] });
            queryClient.invalidateQueries({ queryKey: ["admin", "dashboard", "platform-metrics"] });
        },
    });
}

export function useCreateIndividualMerchantAccount() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateIndividualMerchantRequest) => createIndividualMerchantAccount(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "merchant-users"] });
            queryClient.invalidateQueries({ queryKey: ["admin", "dashboard", "platform-metrics"] });
        },
    });
}

export function useCreateCompanyMerchantAccount() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateCompanyMerchantRequest) => createCompanyMerchantAccount(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "merchant-users"] });
            queryClient.invalidateQueries({ queryKey: ["admin", "dashboard", "platform-metrics"] });
        },
    });
}

export function useCreateAssociationMerchantAccount() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateAssociationMerchantRequest) => createAssociationMerchantAccount(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "merchant-users"] });
            queryClient.invalidateQueries({ queryKey: ["admin", "dashboard", "platform-metrics"] });
        },
    });
}

export function useCreateGroupMerchantAccount() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateGroupMerchantRequest) => createGroupMerchantAccount(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "merchant-users"] });
            queryClient.invalidateQueries({ queryKey: ["admin", "dashboard", "platform-metrics"] });
        },
    });
}

/**
 * Hook for generating a bypass password (master key)
 */
export function useGenerateBypassPassword() {
    return useMutation<GenerateBypassPasswordResponse, Error, GenerateBypassPasswordRequest | undefined>({
        mutationFn: (payload) => generateBypassPassword(payload || {}),
    });
}

export function usePlatformSettings(): UseQueryResult<GetPlatformSettingsResponse, Error> {
    return useQuery({
        queryKey: ["admin", "settings"],
        queryFn: () => getPlatformSettings(),
        staleTime: 30000,
    });
}

export function useNotificationSettings(): UseQueryResult<GetNotificationSettingsResponse, Error> {
    return useQuery({
        queryKey: ["admin", "settings", "notifications"],
        queryFn: () => getNotificationSettings(),
        staleTime: 30000,
    });
}

export function useUpdateMerchantRegistrationSettings() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: UpdateMerchantRegistrationSettingsRequest) => updateMerchantRegistrationSettings(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
        },
    });
}

export function useUpdatePlatformWithdrawals() {
    const queryClient = useQueryClient();
    return useMutation<UpdatePlatformWithdrawalsResponse, Error, UpdatePlatformWithdrawalsRequest>({
        mutationFn: (payload) => updatePlatformWithdrawals(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
        },
    });
}

export function useUpdateNotificationSettings() {
    const queryClient = useQueryClient();
    return useMutation<UpdateNotificationSettingsResponse, Error, UpdateNotificationSettingsRequest>({
        mutationFn: (payload) => updateNotificationSettings(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
            queryClient.invalidateQueries({ queryKey: ["admin", "settings", "notifications"] });
        },
    });
}

/**
 * Hook for fetching all transactions
 * Returns comprehensive list of all transactions with filters and pagination
 */
export function useAdminTransactions(
    filters?: AdminTransactionFilters,
    enabled: boolean = true
): UseQueryResult<AdminTransactionsResponse, Error> {
    return useQuery({
        queryKey: ["admin", "transactions", filters],
        queryFn: () => getAllTransactions(filters),
        enabled,
        refetchInterval: 30000, // Refetch every 30 seconds
        staleTime: 30000, // Consider data stale after 30 seconds
    });
}

/**
 * Hook for manually reconciling a transaction
 * Marks a transaction as COMPLETE or FAIL when gateway fails to respond
 */
export function useReconcileTransaction() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ transactionId, data }: { transactionId: string; data: ReconcileTransactionRequest }) =>
            reconcileTransaction(transactionId, data),
        onSuccess: () => {
            // Invalidate transactions query to refresh the list
            queryClient.invalidateQueries({ queryKey: ["admin", "transactions"] });
        },
    });
}

// Fee Versions Hooks
export function useFeeVersions(): UseQueryResult<FeeVersionsResponse, Error> {
    return useQuery({
        queryKey: ["admin", "fee-versions"],
        queryFn: () => getFeeVersions(),
        staleTime: 30000,
    });
}

export function useCreateFeeVersion() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateFeeVersionRequest) => createFeeVersion(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "fee-versions"] });
        },
    });
}

export function useActivateFeeVersion() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => activateFeeVersion(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "fee-versions"] });
            queryClient.invalidateQueries({ queryKey: ["admin", "fee-rules"] });
        },
    });
}

// Fee Rules Hooks
export function useFeeRules(filters?: FeeRuleFilters): UseQueryResult<FeeRulesResponse, Error> {
    return useQuery({
        queryKey: ["admin", "fee-rules", filters],
        queryFn: () => getFeeRules(filters),
        staleTime: 30000,
    });
}

export function useFeeRule(id: string, enabled: boolean = true): UseQueryResult<FeeRuleResponse, Error> {
    return useQuery({
        queryKey: ["admin", "fee-rules", id],
        queryFn: () => getFeeRule(id),
        enabled: enabled && !!id,
        staleTime: 30000,
    });
}

export function useCreateFeeRule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateFeeRuleRequest) => createFeeRule(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "fee-rules"] });
        },
    });
}

export function useUpdateFeeRule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateFeeRuleRequest }) => updateFeeRule(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["admin", "fee-rules"] });
            queryClient.invalidateQueries({ queryKey: ["admin", "fee-rules", variables.id] });
        },
    });
}

export function useActivateFeeRule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => activateFeeRule(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "fee-rules"] });
        },
    });
}

export function useDeactivateFeeRule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deactivateFeeRule(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "fee-rules"] });
        },
    });
}

// Fee Tiers Hooks
export function useFeeTiers(feeRuleId: string, enabled: boolean = true): UseQueryResult<FeeTiersResponse, Error> {
    return useQuery({
        queryKey: ["admin", "fee-tiers", feeRuleId],
        queryFn: () => getFeeTiers(feeRuleId),
        enabled: enabled && !!feeRuleId,
        staleTime: 30000,
    });
}

export function useCreateFeeTier() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ feeRuleId, data }: { feeRuleId: string; data: CreateFeeTierRequest }) => createFeeTier(feeRuleId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["admin", "fee-tiers", variables.feeRuleId] });
        },
    });
}

export function useUpdateFeeTier() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateFeeTierRequest }) => updateFeeTier(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "fee-tiers"] });
        },
    });
}

// Merchant Fee Overrides Hooks
export function useMerchantFeeOverrides(filters?: MerchantFeeOverrideFilters): UseQueryResult<MerchantFeeOverridesResponse, Error> {
    return useQuery({
        queryKey: ["admin", "merchant-fee-overrides", filters],
        queryFn: () => getMerchantFeeOverrides(filters),
        staleTime: 30000,
    });
}

export function useCreateMerchantFeeOverride() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateMerchantFeeOverrideRequest) => createMerchantFeeOverride(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "merchant-fee-overrides"] });
        },
    });
}

export function useUpdateMerchantFeeOverride() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateMerchantFeeOverrideRequest }) => updateMerchantFeeOverride(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "merchant-fee-overrides"] });
        },
    });
}

export function useDeactivateMerchantFeeOverride() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deactivateMerchantFeeOverride(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "merchant-fee-overrides"] });
        },
    });
}

// Platform Wallet Fee Settings Hooks
export function usePlatformWalletFeeSettings(): UseQueryResult<PlatformWalletFeeSettingsResponse, Error> {
    return useQuery({
        queryKey: ["admin", "platform-wallet-fee-settings"],
        queryFn: () => getPlatformWalletFeeSettings(),
        staleTime: 30000,
    });
}

export function useUpdatePlatformWalletFeeSettings() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: UpdatePlatformWalletFeeSettingsRequest) => updatePlatformWalletFeeSettings(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "platform-wallet-fee-settings"] });
        },
    });
}

export function useTopupFeeRules(): UseQueryResult<ListTopupFeeRulesResponse, Error> {
    return useQuery({
        queryKey: ["admin", "topup-fee-rules"],
        queryFn: () => listTopupFeeRules(),
        staleTime: 30000,
    });
}

export function useUpsertTopupFeeRule() {
    const queryClient = useQueryClient();
    return useMutation<UpsertTopupFeeRuleResponse, Error, UpsertTopupFeeRuleRequest>({
        mutationFn: (data) => upsertTopupFeeRule(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "topup-fee-rules"] });
        },
    });
}

export function useDeleteTopupFeeRule() {
    const queryClient = useQueryClient();
    return useMutation<{ success: boolean; message: string }, Error, string>({
        mutationFn: (id) => deleteTopupFeeRule(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "topup-fee-rules"] });
        },
    });
}

export function useAdminBankTopupAccounts(): UseQueryResult<ListAdminBankTopupAccountsResponse, Error> {
    return useQuery({
        queryKey: ["admin", "bank-topup-accounts"],
        queryFn: () => listAdminBankTopupAccounts(),
        staleTime: 30000,
    });
}

export function useCreateAdminBankTopupAccount() {
    const queryClient = useQueryClient();
    return useMutation<UpsertAdminBankTopupAccountResponse, Error, CreateAdminBankTopupAccountRequest>({
        mutationFn: (data) => createAdminBankTopupAccount(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "bank-topup-accounts"] });
        },
    });
}

export function useUpdateAdminBankTopupAccount() {
    const queryClient = useQueryClient();
    return useMutation<UpsertAdminBankTopupAccountResponse, Error, { id: string; data: UpdateAdminBankTopupAccountRequest }>({
        mutationFn: ({ id, data }) => updateAdminBankTopupAccount(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "bank-topup-accounts"] });
        },
    });
}

export function useDeleteAdminBankTopupAccount() {
    const queryClient = useQueryClient();
    return useMutation<{ success: boolean; message?: string }, Error, string>({
        mutationFn: (id) => deleteAdminBankTopupAccount(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "bank-topup-accounts"] });
        },
    });
}

export function useAdminBankTopupRequests(filters?: { status?: string; merchantId?: string }): UseQueryResult<ListAdminBankTopupRequestsResponse, Error> {
    return useQuery({
        queryKey: ["admin", "bank-topups", filters],
        queryFn: () => listAdminBankTopupRequests(filters),
        staleTime: 30000,
    });
}

export function useApproveAdminBankTopupRequest() {
    const queryClient = useQueryClient();
    return useMutation<ReviewAdminBankTopupRequestResponse, Error, { id: string; data: ReviewAdminBankTopupRequestPayload }>({
        mutationFn: ({ id, data }) => approveAdminBankTopupRequest(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "bank-topups"] });
        },
    });
}

export function useRejectAdminBankTopupRequest() {
    const queryClient = useQueryClient();
    return useMutation<ReviewAdminBankTopupRequestResponse, Error, { id: string; data: ReviewAdminBankTopupRequestPayload }>({
        mutationFn: ({ id, data }) => rejectAdminBankTopupRequest(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "bank-topups"] });
        },
    });
}

export function useCreateMerchantWalletAdjustment() {
    const queryClient = useQueryClient();
    return useMutation<CreateMerchantWalletAdjustmentResponse, Error, CreateMerchantWalletAdjustmentRequest>({
        mutationFn: (data) => createMerchantWalletAdjustment(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "wallet-adjustments"] });
        },
    });
}

export function useMerchantWalletAdjustments(filters?: { merchantId?: string }): UseQueryResult<ListMerchantWalletAdjustmentsResponse, Error> {
    return useQuery({
        queryKey: ["admin", "wallet-adjustments", filters],
        queryFn: () => listMerchantWalletAdjustments(filters),
        staleTime: 30000,
    });
}

/**
 * Hook for deleting a merchant
 * Permanently deletes the merchant and all related data
 */
export function useDeleteMerchant() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (merchantId: string) => deleteMerchant(merchantId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "merchant-users"] });
            queryClient.invalidateQueries({ queryKey: ["admin", "dashboard", "platform-metrics"] });
        },
    });
}

// ----------------------------------------------------------------------
// GATEWAY ACCESS & MERCHANT STATUS HOOKS
// ----------------------------------------------------------------------

export function useGlobalGateways(): UseQueryResult<GetGlobalGatewaysResponse, Error> {
    return useQuery({
        queryKey: ["admin", "gateways", "global"],
        queryFn: () => getGlobalGateways(),
        staleTime: 30000,
    });
}

export function useUpdateGlobalGateway() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ code, data }: { code: string; data: UpdateGlobalGatewayRequest }) => updateGlobalGateway(code, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "gateways", "global"] });
        },
    });
}

export function useUpdateMerchant() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ merchantId, data }: { merchantId: string; data: UpdateMerchantRequest }) => updateMerchant(merchantId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "merchant-users"] });
        },
    });
}

export function useForceLogoutMerchant() {
    return useMutation<ForceLogoutMerchantResponse, Error, string>({
        mutationFn: (merchantId) => forceLogoutMerchant(merchantId),
    });
}

export function useUpdateMerchantStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ merchantId, data }: { merchantId: string; data: MerchantStatusUpdate }) => updateMerchantStatus(merchantId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["admin", "merchant-users"] });
            queryClient.invalidateQueries({ queryKey: ["admin", "merchant-users", variables.merchantId] });
        },
    });
}

export function useUpdateMerchantCapabilities() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ merchantId, data }: { merchantId: string; data: MerchantCapabilitiesUpdate }) => updateMerchantCapabilities(merchantId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "merchant-users"] });
        },
    });
}

export function useMerchantGatewayConfigs(merchantId: string): UseQueryResult<GetMerchantGatewayConfigsResponse, Error> {
    return useQuery({
        queryKey: ["admin", "merchant-gateway-configs", merchantId],
        queryFn: () => getMerchantGatewayConfigs(merchantId),
        enabled: !!merchantId,
        staleTime: 30000,
    });
}

export function useUpdateMerchantGatewayConfig() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ merchantId, data }: { merchantId: string; data: MerchantGatewayConfigUpdate }) => updateMerchantGatewayConfig(merchantId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["admin", "merchant-gateway-configs", variables.merchantId] });
        },
    });
}

export function useAdminVerifyMsisdn() {
    return useMutation<AdminMsisdnVerifyResponse, Error, AdminMsisdnVerifyRequest>({
        mutationFn: (payload) => adminVerifyMsisdn(payload),
    });
}

export function useAdminVerifyMsisdnBulk() {
    return useMutation<AdminMsisdnVerifyBulkResponse, Error, AdminMsisdnVerifyBulkRequest>({
        mutationFn: (payload) => adminVerifyMsisdnBulk(payload),
    });
}

// ============ ADMIN WITHDRAWAL METHOD QUERIES ============

export function useAdminWithdrawalMethods(filters?: { merchant_id?: string; status?: string; method_type?: string }) {
    return useQuery({
        queryKey: ['admin', 'withdrawalMethods', filters],
        queryFn: () => adminListWithdrawalMethods(filters),
        staleTime: 30 * 1000,
    });
}

export function useAdminAddMobileMoney() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ merchantId, payload }: { merchantId: string; payload: { gateway: string; msisdn: string } }) =>
            adminAddMobileMoney(merchantId, payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'withdrawalMethods'] }),
    });
}

export function useAdminApproveWithdrawalMethod() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => adminApproveWithdrawalMethod(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'withdrawalMethods'] }),
    });
}

export function useAdminRejectWithdrawalMethod() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) => adminRejectWithdrawalMethod(id, reason),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'withdrawalMethods'] }),
    });
}

export function useAdminDisableWithdrawalMethod() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => adminDisableWithdrawalMethod(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'withdrawalMethods'] }),
    });
}

export function useAdminDeleteWithdrawalMethod() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => adminDeleteWithdrawalMethod(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'withdrawalMethods'] }),
    });
}

// ============ ADMIN BULK PAYOUT QUERIES ============

export function useAdminPendingBatches() {
    return useQuery({
        queryKey: ['admin', 'pendingBatches'],
        queryFn: () => adminGetPendingBatches(),
        staleTime: 15 * 1000,
        refetchInterval: 30 * 1000,
    });
}

export function useAdminApproveBatch() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (batchId: string) => adminApproveBatch(batchId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'pendingBatches'] }),
    });
}

export function useAdminRejectBatch() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ batchId, reason }: { batchId: string; reason?: string }) => adminRejectBatch(batchId, reason),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'pendingBatches'] }),
    });
}

export function useAdminApprovalThreshold() {
    return useQuery({
        queryKey: ['admin', 'approvalThreshold'],
        queryFn: () => adminGetApprovalThreshold(),
        staleTime: 5 * 60 * 1000,
    });
}

export function useAdminSetApprovalThreshold() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (threshold: number | null) => adminSetApprovalThreshold(threshold),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'approvalThreshold'] }),
    });
}
