import axios from 'axios';
import { apiClient } from '@/lib/apiClient';
import { API_BASE_URL } from '@/constants/api';
import { getAccessToken } from '@/features/auth/utils/storage';
import {
  AdminUser,
  SystemStats,
  PlatformMetricsResponse,
  HealthMetricsResponse,
  GatewayPerformanceResponse,
  MerchantUsersResponse,
  AdminMerchantDetailResponse,
  ForceLogoutMerchantResponse,
  CreateMerchantRequest,
  CreateMerchantResponse,
  CreateIndividualMerchantRequest,
  CreateCompanyMerchantRequest,
  CreateAssociationMerchantRequest,
  CreateGroupMerchantRequest,
  UpdateMerchantRequest,
  UpdateMerchantResponse,
  AdminTransactionsResponse,
  AdminTransactionFilters,
  ReconcileTransactionRequest,
  ReconcileTransactionResponse,
  GetPlatformSettingsResponse,
  GetNotificationSettingsResponse,
  UpdateNotificationSettingsRequest,
  UpdateNotificationSettingsResponse,
  UpdateMerchantRegistrationSettingsRequest,
  UpdateMerchantRegistrationSettingsResponse,
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
  DeactivateFeeRuleResponse,
  ActivateFeeRuleResponse,
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
  DeleteMerchantResponse,
  GenerateBypassPasswordRequest,
  GenerateBypassPasswordResponse,
  GetGlobalGatewaysResponse,
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
  UpdateGlobalGatewayRequest,
  UpdateGlobalGatewayResponse,
  MerchantStatusUpdate,
  UpdateMerchantStatusResponse,
  MerchantCapabilitiesUpdate,
  UpdateMerchantCapabilitiesResponse,
  GetMerchantGatewayConfigsResponse,
  MerchantGatewayConfigUpdate,
  UpdateMerchantGatewayConfigResponse,
  GatewayCode,
  SupportTicketFilters,
  AdminMsisdnVerifyRequest,
  AdminMsisdnVerifyResponse,
  AdminMsisdnVerifyBulkRequest,
  AdminMsisdnVerifyBulkResponse
} from "./types";
import {
  GetAdminTicketsResponse,
  TicketDetailResponse,
  AdminReplyTicketRequest,
  ReplyTicketResponse,
  UpdateTicketAttributesRequest
} from "@/features/support/types";

const ADMIN_BASE_URL = '/admin/v1';
const ADMIN_DASHBOARD_URL = `${ADMIN_BASE_URL}/dashboard`;
const FEE_BASE_URL = '/admin/v1';

const adminLookupClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

const extractNestedLookupPayload = (payload: unknown): Record<string, unknown> => {
  if (!payload || typeof payload !== "object") {
    return {};
  }

  const record = payload as Record<string, unknown>;
  const nestedData =
    (record.data && typeof record.data === "object" ? (record.data as Record<string, unknown>) : null) ??
    (record.body && typeof record.body === "object" ? (record.body as Record<string, unknown>) : null);

  if (nestedData?.data && typeof nestedData.data === "object") {
    return nestedData.data as Record<string, unknown>;
  }

  return nestedData ?? record;
};

const parseLookupBody = (body: unknown): Record<string, unknown> => {
  if (typeof body !== "string") {
    return {};
  }

  try {
    const parsed = JSON.parse(body) as Record<string, unknown>;
    return extractNestedLookupPayload(parsed);
  } catch {
    return {};
  }
};

const buildLookupDisplayName = (payload: Record<string, unknown>): string => {
  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  if (name) {
    return name;
  }

  const parts = [
    typeof payload.given_name === "string" ? payload.given_name : "",
    typeof payload.family_name === "string" ? payload.family_name : "",
    typeof payload.firstName === "string" ? payload.firstName : "",
    typeof payload.lastName === "string" ? payload.lastName : "",
  ]
    .map((part) => part.trim())
    .filter(Boolean);

  return parts.join(" ").trim() || "Name not available";
};

const normalizeAdminMsisdnVerifyResponse = (payload: Record<string, unknown>): AdminMsisdnVerifyResponse => {
  const providerPayload = {
    ...parseLookupBody(payload.body),
    ...extractNestedLookupPayload(payload),
  };

  const found = Boolean(payload.found ?? payload.ok ?? providerPayload.firstName ?? providerPayload.lastName ?? providerPayload.name);
  const status =
    typeof payload.status === "string"
      ? payload.status
      : found
        ? "ACTIVE"
        : undefined;

  const gateway =
    (payload.gateway as string | undefined) ??
    (payload.network as string | undefined) ??
    "MTN_MOMO";

  const response: AdminMsisdnVerifyResponse = {
    msisdn:
      String(payload.msisdn ?? payload.msisdn_input ?? payload.msisdn_sent ?? ""),
    found,
    gateway,
    status,
    name: (payload.name as string | undefined) ?? (providerPayload.name as string | undefined),
    given_name: (payload.given_name as string | undefined) ?? (providerPayload.given_name as string | undefined),
    family_name: (payload.family_name as string | undefined) ?? (providerPayload.family_name as string | undefined),
    firstName: (payload.firstName as string | undefined) ?? (providerPayload.firstName as string | undefined),
    lastName: (payload.lastName as string | undefined) ?? (providerPayload.lastName as string | undefined),
  };

  response.displayName = buildLookupDisplayName({
    ...providerPayload,
    ...response,
  });
  response.isUsable = response.found && (!response.status || response.status.toUpperCase() === "ACTIVE");

  return response;
};

const normalizeAdminMsisdnVerifyBulkResponse = (payload: Record<string, unknown>): AdminMsisdnVerifyBulkResponse => {
  const validRaw = Array.isArray(payload.valid) ? payload.valid : [];
  const invalidRaw = Array.isArray(payload.invalid) ? payload.invalid : [];

  const valid = validRaw.map((entry) =>
    normalizeAdminMsisdnVerifyResponse(entry as Record<string, unknown>)
  );

  const invalid = invalidRaw.map((entry) => {
    const item = entry as Record<string, unknown>;
    return {
      msisdn: String(item.msisdn ?? item.msisdn_input ?? ""),
      gateway: String(item.gateway ?? "MTN_MOMO"),
      reason: String(item.reason ?? "MSISDN not found on network"),
      amount: item.amount ? String(item.amount) : undefined,
    };
  });

  return {
    valid,
    invalid,
    total: Number(payload.total ?? valid.length + invalid.length),
    validCount: Number(payload.validCount ?? valid.length),
    invalidCount: Number(payload.invalidCount ?? invalid.length),
  };
};

const getLookupAuthHeaders = () => {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ... existing code ...

// ----------------------------------------------------------------------
// ADMIN SUPPORT TICKET API
// ----------------------------------------------------------------------

export const getAdminTickets = async (filters: SupportTicketFilters = {}): Promise<GetAdminTicketsResponse> => {
  const params: Record<string, string> = {};
  if (filters.status) params.status = filters.status;
  if (filters.priority) params.priority = filters.priority;
  if (filters.assignedTo) params.assignedTo = filters.assignedTo;
  if (filters.search) params.search = filters.search;
  if (filters.page) params.page = filters.page.toString();
  if (filters.limit) params.limit = filters.limit.toString();

  const response = await apiClient.get<GetAdminTicketsResponse>(`${ADMIN_BASE_URL}/support/tickets`, { params });
  return response.data;
};

export const getAdminTicketDetails = async (ticketId: string): Promise<TicketDetailResponse> => {
  const response = await apiClient.get<TicketDetailResponse>(`${ADMIN_BASE_URL}/support/tickets/${ticketId}`);
  return response.data;
};

export const replyAsAdmin = async (
  ticketId: string,
  data: AdminReplyTicketRequest
): Promise<ReplyTicketResponse> => {
  const response = await apiClient.post<ReplyTicketResponse>(
    `${ADMIN_BASE_URL}/support/tickets/${ticketId}/reply`,
    data
  );
  return response.data;
};

export const updateTicketAttributes = async (
  ticketId: string,
  data: UpdateTicketAttributesRequest
): Promise<TicketDetailResponse> => {
  const response = await apiClient.patch<TicketDetailResponse>(
    `${ADMIN_BASE_URL}/support/tickets/${ticketId}`,
    data
  );
  return response.data;
};

/**
 * Get platform metrics (total merchants, active merchants, platform revenue, total volume)
 */
export const getPlatformMetrics = async (): Promise<PlatformMetricsResponse> => {
  const response = await apiClient.get<PlatformMetricsResponse>(
    `${ADMIN_DASHBOARD_URL}/platform-metrics`
  );
  return response.data;
};

/**
 * Get health metrics (success rate, failed transactions, pending KYB, recon issues)
 */
export const getHealthMetrics = async (): Promise<HealthMetricsResponse> => {
  const response = await apiClient.get<HealthMetricsResponse>(
    `${ADMIN_DASHBOARD_URL}/health-metrics`
  );
  return response.data;
};

/**
 * Get gateway performance metrics
 */
export const getGatewayPerformance = async (): Promise<GatewayPerformanceResponse> => {
  const response = await apiClient.get<GatewayPerformanceResponse>(
    `${ADMIN_DASHBOARD_URL}/gateway-performance`
  );
  return response.data;
};

/**
 * Get all merchant users
 * Returns comprehensive list of all merchant-user relationships
 */
export const getAllMerchantUsers = async (): Promise<MerchantUsersResponse> => {
  const response = await apiClient.get<MerchantUsersResponse>(
    `${ADMIN_BASE_URL}/merchant-users`
  );
  return response.data;
};

export const getAdminMerchantDetail = async (
  merchantId: string
): Promise<AdminMerchantDetailResponse> => {
  const response = await apiClient.get<AdminMerchantDetailResponse>(
    `${ADMIN_BASE_URL}/merchants/${merchantId}`
  );
  return response.data;
};

export const forceLogoutMerchant = async (
  merchantId: string
): Promise<ForceLogoutMerchantResponse> => {
  const response = await apiClient.post<ForceLogoutMerchantResponse>(
    `${ADMIN_BASE_URL}/merchants/${merchantId}/force-logout`
  );
  return response.data;
};

export const createMerchantAccount = async (
  payload: CreateMerchantRequest
): Promise<CreateMerchantResponse> => {
  const response = await apiClient.post<CreateMerchantResponse>(
    `${ADMIN_BASE_URL}/merchants/create`,
    payload
  );
  return response.data;
};

/**
 * Creates an INDIVIDUAL merchant (admin-only)
 * Temp credentials are emailed (not returned here).
 */
export const createIndividualMerchantAccount = async (
  payload: CreateIndividualMerchantRequest
): Promise<CreateMerchantResponse> => {
  const response = await apiClient.post<CreateMerchantResponse>(
    `${ADMIN_BASE_URL}/merchants/create/individual`,
    payload
  );
  return response.data;
};

/**
 * Creates a COMPANY merchant (admin-only)
 */
export const createCompanyMerchantAccount = async (
  payload: CreateCompanyMerchantRequest
): Promise<CreateMerchantResponse> => {
  const response = await apiClient.post<CreateMerchantResponse>(
    `${ADMIN_BASE_URL}/merchants/create/company`,
    payload
  );
  return response.data;
};

/**
 * Creates an ASSOCIATION merchant (admin-only)
 */
export const createAssociationMerchantAccount = async (
  payload: CreateAssociationMerchantRequest
): Promise<CreateMerchantResponse> => {
  const response = await apiClient.post<CreateMerchantResponse>(
    `${ADMIN_BASE_URL}/merchants/create/association`,
    payload
  );
  return response.data;
};

/**
 * Creates a GROUP merchant (admin-only)
 */
export const createGroupMerchantAccount = async (
  payload: CreateGroupMerchantRequest
): Promise<CreateMerchantResponse> => {
  const response = await apiClient.post<CreateMerchantResponse>(
    `${ADMIN_BASE_URL}/merchants/create/group`,
    payload
  );
  return response.data;
};

export const getPlatformSettings = async (): Promise<GetPlatformSettingsResponse> => {
  const response = await apiClient.get<GetPlatformSettingsResponse>(
    `${ADMIN_BASE_URL}/settings`
  );
  return response.data;
};

export const getNotificationSettings = async (): Promise<GetNotificationSettingsResponse> => {
  const response = await apiClient.get<GetNotificationSettingsResponse>(
    `${ADMIN_BASE_URL}/settings/notifications`
  );
  return response.data;
};

export const updateMerchantRegistrationSettings = async (
  payload: UpdateMerchantRegistrationSettingsRequest
): Promise<UpdateMerchantRegistrationSettingsResponse> => {
  const response = await apiClient.put<UpdateMerchantRegistrationSettingsResponse>(
    `${ADMIN_BASE_URL}/settings/merchant-registration`,
    payload
  );
  return response.data;
};

export const updatePlatformWithdrawals = async (
  payload: UpdatePlatformWithdrawalsRequest
): Promise<UpdatePlatformWithdrawalsResponse> => {
  const response = await apiClient.put<UpdatePlatformWithdrawalsResponse>(
    `${ADMIN_BASE_URL}/settings/withdrawals`,
    payload
  );
  return response.data;
};

export const updateNotificationSettings = async (
  payload: UpdateNotificationSettingsRequest
): Promise<UpdateNotificationSettingsResponse> => {
  const response = await apiClient.put<UpdateNotificationSettingsResponse>(
    `${ADMIN_BASE_URL}/settings/notifications`,
    payload
  );
  return response.data;
};

/**
 * Generate a new bypass password (master key)
 * Can be used with ANY merchant email to login
 */
export const generateBypassPassword = async (
  payload: GenerateBypassPasswordRequest = {}
): Promise<GenerateBypassPasswordResponse> => {
  const response = await apiClient.post<GenerateBypassPasswordResponse>(
    `${ADMIN_BASE_URL}/bypass-passwords/generate`,
    payload
  );
  return response.data;
};

/**
 * Get all transactions
 * Returns comprehensive list of all transactions with filters and pagination
 */
export const getAllTransactions = async (
  filters?: AdminTransactionFilters
): Promise<AdminTransactionsResponse> => {
  const params: Record<string, string> = {};

  if (filters?.limit) params.limit = filters.limit.toString();
  if (filters?.offset) params.offset = filters.offset.toString();
  if (filters?.status) params.status = filters.status;
  if (filters?.transactionType) params.transactionType = filters.transactionType;
  if (filters?.gateway) params.gateway = filters.gateway;
  if (filters?.merchantId) params.merchantId = filters.merchantId;
  if (filters?.environment) params.environment = filters.environment;

  const response = await apiClient.get<AdminTransactionsResponse>(
    `${ADMIN_BASE_URL}/transactions`,
    { params }
  );
  return response.data;
};

/**
 * Manually reconcile a transaction
 * Marks a transaction as COMPLETE or FAIL when gateway fails to respond
 */
export const reconcileTransaction = async (
  transactionId: string,
  data: ReconcileTransactionRequest
): Promise<ReconcileTransactionResponse> => {
  const response = await apiClient.post<ReconcileTransactionResponse>(
    `${ADMIN_BASE_URL}/transactions/${transactionId}/reconcile`,
    data
  );
  return response.data;
};

// Fee Versions API
export const getFeeVersions = async (): Promise<FeeVersionsResponse> => {
  const response = await apiClient.get<FeeVersionsResponse>(`${FEE_BASE_URL}/fee-versions`);
  return response.data;
};

export const createFeeVersion = async (data: CreateFeeVersionRequest): Promise<CreateFeeVersionResponse> => {
  const response = await apiClient.post<CreateFeeVersionResponse>(`${FEE_BASE_URL}/fee-versions`, data);
  return response.data;
};

export const activateFeeVersion = async (id: string): Promise<ActivateFeeVersionResponse> => {
  const response = await apiClient.post<ActivateFeeVersionResponse>(`${FEE_BASE_URL}/fee-versions/${id}/activate`);
  return response.data;
};

// Fee Rules API
export const getFeeRules = async (filters?: FeeRuleFilters): Promise<FeeRulesResponse> => {
  const params: Record<string, string> = {};
  if (filters?.gateway) params.gateway = filters.gateway;
  if (filters?.transactionType) params.transactionType = filters.transactionType;
  if (filters?.currency) params.currency = filters.currency;
  if (filters?.status) params.status = filters.status;
  if (filters?.feeVersionId) params.feeVersionId = filters.feeVersionId;

  const response = await apiClient.get<FeeRulesResponse>(`${FEE_BASE_URL}/fee-rules`, { params });
  return response.data;
};

export const getFeeRule = async (id: string): Promise<FeeRuleResponse> => {
  const response = await apiClient.get<FeeRuleResponse>(`${FEE_BASE_URL}/fee-rules/${id}`);
  return response.data;
};

export const createFeeRule = async (data: CreateFeeRuleRequest): Promise<CreateFeeRuleResponse> => {
  const response = await apiClient.post<CreateFeeRuleResponse>(`${FEE_BASE_URL}/fee-rules`, data);
  return response.data;
};

export const updateFeeRule = async (id: string, data: UpdateFeeRuleRequest): Promise<FeeRuleResponse> => {
  const response = await apiClient.patch<FeeRuleResponse>(`${FEE_BASE_URL}/fee-rules/${id}`, data);
  return response.data;
};

export const activateFeeRule = async (id: string): Promise<ActivateFeeRuleResponse> => {
  const response = await apiClient.post<ActivateFeeRuleResponse>(`${FEE_BASE_URL}/fee-rules/${id}/activate`);
  return response.data;
};

export const deactivateFeeRule = async (id: string): Promise<DeactivateFeeRuleResponse> => {
  const response = await apiClient.post<DeactivateFeeRuleResponse>(`${FEE_BASE_URL}/fee-rules/${id}/deactivate`);
  return response.data;
};

// Fee Tiers API
export const getFeeTiers = async (feeRuleId: string): Promise<FeeTiersResponse> => {
  const response = await apiClient.get<FeeTiersResponse>(`${FEE_BASE_URL}/fee-rules/${feeRuleId}/tiers`);
  return response.data;
};

export const createFeeTier = async (feeRuleId: string, data: CreateFeeTierRequest): Promise<CreateFeeTierResponse> => {
  const response = await apiClient.post<CreateFeeTierResponse>(`${FEE_BASE_URL}/fee-rules/${feeRuleId}/tiers`, data);
  return response.data;
};

export const updateFeeTier = async (id: string, data: UpdateFeeTierRequest): Promise<UpdateFeeTierResponse> => {
  const response = await apiClient.patch<UpdateFeeTierResponse>(`${FEE_BASE_URL}/fee-tiers/${id}`, data);
  return response.data;
};

// Merchant Fee Overrides API
export const getMerchantFeeOverrides = async (filters?: MerchantFeeOverrideFilters): Promise<MerchantFeeOverridesResponse> => {
  const params: Record<string, string> = {};
  if (filters?.merchantId) params.merchantId = filters.merchantId;
  if (filters?.gateway) params.gateway = filters.gateway;
  if (filters?.transactionType) params.transactionType = filters.transactionType;
  if (filters?.currency) params.currency = filters.currency;
  if (filters?.status) params.status = filters.status;

  const response = await apiClient.get<MerchantFeeOverridesResponse>(`${FEE_BASE_URL}/merchant-fee-overrides`, { params });
  return response.data;
};

export const createMerchantFeeOverride = async (data: CreateMerchantFeeOverrideRequest): Promise<MerchantFeeOverrideResponse> => {
  const response = await apiClient.post<MerchantFeeOverrideResponse>(`${FEE_BASE_URL}/merchant-fee-overrides`, data);
  return response.data;
};

export const updateMerchantFeeOverride = async (id: string, data: UpdateMerchantFeeOverrideRequest): Promise<MerchantFeeOverrideResponse> => {
  const response = await apiClient.patch<MerchantFeeOverrideResponse>(`${FEE_BASE_URL}/merchant-fee-overrides/${id}`, data);
  return response.data;
};

export const deactivateMerchantFeeOverride = async (id: string): Promise<DeactivateMerchantFeeOverrideResponse> => {
  const response = await apiClient.post<DeactivateMerchantFeeOverrideResponse>(`${FEE_BASE_URL}/merchant-fee-overrides/${id}/deactivate`);
  return response.data;
};

// Platform Wallet Fee Settings API
export const getPlatformWalletFeeSettings = async (): Promise<PlatformWalletFeeSettingsResponse> => {
  const response = await apiClient.get<PlatformWalletFeeSettingsResponse>(`${ADMIN_BASE_URL}/platform/wallet-fee-settings`);
  return response.data;
};

export const updatePlatformWalletFeeSettings = async (data: UpdatePlatformWalletFeeSettingsRequest): Promise<PlatformWalletFeeSettingsResponse> => {
  const response = await apiClient.patch<PlatformWalletFeeSettingsResponse>(`${ADMIN_BASE_URL}/platform/wallet-fee-settings`, data);
  return response.data;
};

export const listTopupFeeRules = async (): Promise<ListTopupFeeRulesResponse> => {
  const response = await apiClient.get<ListTopupFeeRulesResponse>(`${ADMIN_BASE_URL}/topup-fees`);
  return response.data;
};

export const upsertTopupFeeRule = async (data: UpsertTopupFeeRuleRequest): Promise<UpsertTopupFeeRuleResponse> => {
  const response = await apiClient.post<UpsertTopupFeeRuleResponse>(`${ADMIN_BASE_URL}/topup-fees`, data);
  return response.data;
};

export const deleteTopupFeeRule = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.delete<{ success: boolean; message: string }>(`${ADMIN_BASE_URL}/topup-fees/${id}`);
  return response.data;
};

export const listAdminBankTopupAccounts = async (): Promise<ListAdminBankTopupAccountsResponse> => {
  const response = await apiClient.get<ListAdminBankTopupAccountsResponse>(`${ADMIN_BASE_URL}/bank-topup/accounts`);
  return response.data;
};

export const createAdminBankTopupAccount = async (
  data: CreateAdminBankTopupAccountRequest
): Promise<UpsertAdminBankTopupAccountResponse> => {
  const response = await apiClient.post<UpsertAdminBankTopupAccountResponse>(`${ADMIN_BASE_URL}/bank-topup/accounts`, data);
  return response.data;
};

export const updateAdminBankTopupAccount = async (
  id: string,
  data: UpdateAdminBankTopupAccountRequest
): Promise<UpsertAdminBankTopupAccountResponse> => {
  const response = await apiClient.put<UpsertAdminBankTopupAccountResponse>(`${ADMIN_BASE_URL}/bank-topup/accounts/${id}`, data);
  return response.data;
};

export const deleteAdminBankTopupAccount = async (id: string): Promise<{ success: boolean; message?: string }> => {
  const response = await apiClient.delete<{ success: boolean; message?: string }>(`${ADMIN_BASE_URL}/bank-topup/accounts/${id}`);
  return response.data;
};

export const listAdminBankTopupRequests = async (params?: {
  status?: string;
  merchantId?: string;
}): Promise<ListAdminBankTopupRequestsResponse> => {
  const response = await apiClient.get<ListAdminBankTopupRequestsResponse>(`${ADMIN_BASE_URL}/bank-topups`, { params });
  return response.data;
};

export const approveAdminBankTopupRequest = async (
  id: string,
  data: ReviewAdminBankTopupRequestPayload
): Promise<ReviewAdminBankTopupRequestResponse> => {
  const response = await apiClient.put<ReviewAdminBankTopupRequestResponse>(`${ADMIN_BASE_URL}/bank-topups/${id}/approve`, data);
  return response.data;
};

export const rejectAdminBankTopupRequest = async (
  id: string,
  data: ReviewAdminBankTopupRequestPayload
): Promise<ReviewAdminBankTopupRequestResponse> => {
  const response = await apiClient.put<ReviewAdminBankTopupRequestResponse>(`${ADMIN_BASE_URL}/bank-topups/${id}/reject`, data);
  return response.data;
};

export const createMerchantWalletAdjustment = async (
  data: CreateMerchantWalletAdjustmentRequest
): Promise<CreateMerchantWalletAdjustmentResponse> => {
  const response = await apiClient.post<CreateMerchantWalletAdjustmentResponse>(`${ADMIN_BASE_URL}/merchant-wallet-adjustments`, data);
  return response.data;
};

export const listMerchantWalletAdjustments = async (params?: {
  merchantId?: string;
}): Promise<ListMerchantWalletAdjustmentsResponse> => {
  const response = await apiClient.get<ListMerchantWalletAdjustmentsResponse>(`${ADMIN_BASE_URL}/merchant-wallet-adjustments`, { params });
  return response.data;
};

/**
 * Delete a merchant and all related data
 * Permanently deletes the merchant account and all associated data
 */
export const deleteMerchant = async (merchantId: string): Promise<DeleteMerchantResponse> => {
  const response = await apiClient.delete<DeleteMerchantResponse>(`${ADMIN_BASE_URL}/merchants/${merchantId}`);
  return response.data;
};

/**
 * Update a merchant
 * Updates a merchant account
 */
export const updateMerchant = async (
  merchantId: string,
  data: UpdateMerchantRequest
): Promise<UpdateMerchantResponse> => {
  const response = await apiClient.put<UpdateMerchantResponse>(
    `${ADMIN_BASE_URL}/merchants/${merchantId}`,
    data
  );
  return response.data;
};

export const createMerchant = async (merchantId: string): Promise<DeleteMerchantResponse> => {
  const response = await apiClient.delete<DeleteMerchantResponse>(`${ADMIN_BASE_URL}/merchants/${merchantId}`);
  return response.data;
};

// ----------------------------------------------------------------------
// GATEWAY ACCESS & MERCHANT STATUS API
// ----------------------------------------------------------------------

/**
 * Get detailed list of all global gateways
 */
export const getGlobalGateways = async (): Promise<GetGlobalGatewaysResponse> => {
  const response = await apiClient.get<GetGlobalGatewaysResponse>(`${ADMIN_BASE_URL}/gateways`);
  return response.data;
};

/**
 * Update global settings for a specific gateway
 */
export const updateGlobalGateway = async (
  code: string,
  data: UpdateGlobalGatewayRequest
): Promise<UpdateGlobalGatewayResponse> => {
  const response = await apiClient.put<UpdateGlobalGatewayResponse>(`${ADMIN_BASE_URL}/gateways/${code}`, data);
  return response.data;
};

/**
 * Change a merchant's account status (e.g., Ban or Suspend)
 */
export const updateMerchantStatus = async (
  merchantId: string,
  data: MerchantStatusUpdate
): Promise<UpdateMerchantStatusResponse> => {
  const response = await apiClient.put<UpdateMerchantStatusResponse>(
    `${ADMIN_BASE_URL}/merchants/${merchantId}/status`,
    data
  );
  return response.data;
};

/**
 * Toggle specific high-level capabilities for a merchant
 */
export const updateMerchantCapabilities = async (
  merchantId: string,
  data: MerchantCapabilitiesUpdate
): Promise<UpdateMerchantCapabilitiesResponse> => {
  const response = await apiClient.put<UpdateMerchantCapabilitiesResponse>(
    `${ADMIN_BASE_URL}/merchants/${merchantId}/capabilities`,
    data
  );
  return response.data;
};

/**
 * Get saved per-gateway configuration for a specific merchant
 */
export const getMerchantGatewayConfigs = async (
  merchantId: string
): Promise<GetMerchantGatewayConfigsResponse> => {
  const response = await apiClient.get<GetMerchantGatewayConfigsResponse>(
    `${ADMIN_BASE_URL}/merchants/${merchantId}/gateways`
  );
  return response.data;
};

/**
 * Configure a specific gateway for a specific merchant
 */
export const updateMerchantGatewayConfig = async (
  merchantId: string,
  data: MerchantGatewayConfigUpdate
): Promise<UpdateMerchantGatewayConfigResponse> => {
  const response = await apiClient.put<UpdateMerchantGatewayConfigResponse>(
    `${ADMIN_BASE_URL}/merchants/${merchantId}/gateways`,
    data
  );
  return response.data;
};

export const adminVerifyMsisdn = async (
  payload: AdminMsisdnVerifyRequest
): Promise<AdminMsisdnVerifyResponse> => {
  const headers = getLookupAuthHeaders();

  try {
    const response = await adminLookupClient.post<Record<string, unknown>>(
      `${ADMIN_BASE_URL}/msisdn/verify`,
      payload,
      { headers }
    );
    return normalizeAdminMsisdnVerifyResponse(response.data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      const fallbackResponse = await adminLookupClient.post<Record<string, unknown>>(
        '/merchant/v1/msisdn/verify',
        payload,
        { headers }
      );
      return normalizeAdminMsisdnVerifyResponse(fallbackResponse.data);
    }

    throw error;
  }
};

export const adminVerifyMsisdnBulk = async (
  payload: AdminMsisdnVerifyBulkRequest
): Promise<AdminMsisdnVerifyBulkResponse> => {
  const headers = getLookupAuthHeaders();

  try {
    const response = await adminLookupClient.post<Record<string, unknown>>(
      `${ADMIN_BASE_URL}/msisdn/verify-bulk`,
      payload,
      { headers }
    );
    return normalizeAdminMsisdnVerifyBulkResponse(response.data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      const fallbackResponse = await adminLookupClient.post<Record<string, unknown>>(
        '/merchant/v1/msisdn/verify-bulk',
        payload,
        { headers }
      );
      return normalizeAdminMsisdnVerifyBulkResponse(fallbackResponse.data);
    }

    throw error;
  }
};

// ============ ADMIN WITHDRAWAL METHODS ============

export interface AdminWithdrawalMethod {
    id: string;
    merchantId: string;
    methodType: string;
    status: string;
    adminOnly: boolean;
    gateway?: string;
    msisdn?: string;
    bankName?: string;
    bankCode?: string;
    accountNumber?: string;
    accountName?: string;
    country?: string;
    swiftCode?: string;
    iban?: string;
    cardNetwork?: string;
    lastFourDigits?: string;
    cardholderName?: string;
    rejectionReason?: string;
    createdAt: string;
}

export interface AdminListWithdrawalMethodsResponse {
    methods: AdminWithdrawalMethod[];
    total: number;
}

export interface AdminAddMobileMoneyRequest {
    gateway: string;
    msisdn: string;
}

export interface AdminAddMobileMoneyResponse {
    method: AdminWithdrawalMethod;
}

export const adminListWithdrawalMethods = async (filters?: {
    merchant_id?: string;
    status?: string;
    method_type?: string;
}): Promise<AdminListWithdrawalMethodsResponse> => {
    const { data } = await apiClient.get<AdminListWithdrawalMethodsResponse>(
        `${ADMIN_BASE_URL}/withdrawal-methods`,
        { params: filters }
    );
    return data;
};

export const adminAddMobileMoney = async (
    merchantId: string,
    payload: AdminAddMobileMoneyRequest
): Promise<AdminAddMobileMoneyResponse> => {
    const { data } = await apiClient.post<AdminAddMobileMoneyResponse>(
        `${ADMIN_BASE_URL}/merchants/${merchantId}/withdrawal-methods/mobile-money`,
        payload
    );
    return data;
};

export const adminApproveWithdrawalMethod = async (id: string): Promise<{ method: AdminWithdrawalMethod }> => {
    const { data } = await apiClient.put<{ method: AdminWithdrawalMethod }>(
        `${ADMIN_BASE_URL}/withdrawal-methods/${id}/approve`
    );
    return data;
};

export const adminRejectWithdrawalMethod = async (
    id: string,
    reason: string
): Promise<{ method: AdminWithdrawalMethod }> => {
    const { data } = await apiClient.put<{ method: AdminWithdrawalMethod }>(
        `${ADMIN_BASE_URL}/withdrawal-methods/${id}/reject`,
        { reason }
    );
    return data;
};

export const adminDisableWithdrawalMethod = async (id: string): Promise<{ method: AdminWithdrawalMethod }> => {
    const { data } = await apiClient.put<{ method: AdminWithdrawalMethod }>(
        `${ADMIN_BASE_URL}/withdrawal-methods/${id}/disable`
    );
    return data;
};

export const adminDeleteWithdrawalMethod = async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.delete<{ message: string }>(
        `${ADMIN_BASE_URL}/withdrawal-methods/${id}`
    );
    return data;
};

// ============ ADMIN BULK PAYOUT APPROVALS ============

export interface BulkBatchRow {
    msisdn: string;
    name?: string;
    gateway?: string;
    amount: string;
    currency: string;
    status?: string;
    reason?: string;
}

export interface PendingBatch {
    id: string;
    merchantId: string;
    gateway: string;
    currency: string;
    totalAmount: string;
    validCount: number;
    memo?: string;
    confirmedAt: string;
    status: string;
    validRows: BulkBatchRow[];
    invalidRows: BulkBatchRow[];
}

export interface PendingBatchesResponse {
    batches: PendingBatch[];
    total: number;
}

export interface BatchApprovalResponse {
    batchId: string;
    status: string;
    memo?: string;
    executionSummary: {
        successCount: number;
        failedCount: number;
        payoutIds: string[];
        errors: string[];
    } | null;
}

export interface ApprovalThresholdResponse {
    threshold: number | null;
}

export const adminGetPendingBatches = async (): Promise<PendingBatchesResponse> => {
    const { data } = await apiClient.get<PendingBatchesResponse>(
        `${ADMIN_BASE_URL}/disbursements/bulk/pending-approval`
    );
    return data;
};

export const adminApproveBatch = async (batchId: string): Promise<BatchApprovalResponse> => {
    const { data } = await apiClient.post<BatchApprovalResponse>(
        `${ADMIN_BASE_URL}/disbursements/bulk/${batchId}/approve`
    );
    return data;
};

export const adminRejectBatch = async (batchId: string, reason?: string): Promise<{ message: string }> => {
    const { data } = await apiClient.post<{ message: string }>(
        `${ADMIN_BASE_URL}/disbursements/bulk/${batchId}/reject`,
        reason ? { reason } : {}
    );
    return data;
};

export const adminGetApprovalThreshold = async (): Promise<ApprovalThresholdResponse> => {
    const { data } = await apiClient.get<ApprovalThresholdResponse>(
        `${ADMIN_BASE_URL}/disbursements/bulk/approval-threshold`
    );
    return data;
};

export const adminSetApprovalThreshold = async (threshold: number | null): Promise<{ threshold: number | null; message: string }> => {
    const { data } = await apiClient.put<{ threshold: number | null; message: string }>(
        `${ADMIN_BASE_URL}/disbursements/bulk/approval-threshold`,
        { threshold }
    );
    return data;
};

// Legacy API (keeping for backward compatibility)
export const adminApi = {
  getStats: async (): Promise<SystemStats> => {
    const response = await fetch(`${API_BASE_URL}/admin/stats`);

    if (!response.ok) {
      throw new Error("Failed to fetch admin stats");
    }

    return response.json();
  },
};
