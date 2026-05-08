import { apiClient } from '@/lib/apiClient';
import { fileUploadClient } from '@/lib/fileUploadClient';
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
    AddDomainRequest,
    AddDomainResponse,
    DeleteDomainResponse,
    GetDomainsResponse,
    AddIpRequest,
    AddIpResponse,
    DeleteIpResponse,
    GetIpsResponse,
    GetGatewaysResponse,
    ConfigureGatewayRequest,
    ConfigureGatewayResponse,
    SetFeeOverrideRequest,
    SetFeeOverrideResponse,
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
    GetPendingDomainRequestsResponse,
    GetAllDomainRequestsResponse,
    ApproveDomainResponse,
    RejectDomainRequest,
    RejectDomainResponse,
    GetPendingIpRequestsResponse,
    GetAllIpRequestsResponse,
    ApproveIpResponse,
    RejectIpRequest,
    RejectIpResponse,
} from '../types/index';

const MERCHANT_BASE_URL = '/merchant/v1/merchants';

/**
 * Create a new merchant account
 * Automatically creates sandbox credentials
 */
export const createMerchant = async (
    data: CreateMerchantRequest
): Promise<CreateMerchantResponse> => {
    const response = await apiClient.post<CreateMerchantResponse>(
        MERCHANT_BASE_URL,
        data
    );
    return response.data;
};

/**
 * Get all merchants that the authenticated user has access to
 */
export const getUserMerchants = async (): Promise<GetUserMerchantsResponse> => {
    const response = await apiClient.get<GetUserMerchantsResponse>(
        MERCHANT_BASE_URL
    );
    return response.data;
};

/**
 * Get the first merchant account associated with the authenticated user
 * Returns 404 if user has no merchant accounts
 */
export const getFirstMerchant = async (): Promise<GetFirstMerchantResponse> => {
    const response = await apiClient.get<GetFirstMerchantResponse>(
        `${MERCHANT_BASE_URL}/first`
    );
    return response.data;
};

/**
 * Get merchant profile details
 */
export const getMerchant = async (
    merchantId: string
): Promise<GetMerchantResponse> => {
    const response = await apiClient.get<GetMerchantResponse>(
        `${MERCHANT_BASE_URL}/${merchantId}`
    );
    return response.data;
};

/**
 * Update merchant profile information
 */
export const updateMerchant = async (
    merchantId: string,
    data: UpdateMerchantRequest
): Promise<UpdateMerchantResponse> => {
    const response = await apiClient.put<UpdateMerchantResponse>(
        `${MERCHANT_BASE_URL}/${merchantId}`,
        data
    );
    return response.data;
};

/**
 * Submit KYB documents for verification
 */
export const submitKYB = async (
    merchantId: string
): Promise<SubmitKYBResponse> => {
    const response = await apiClient.post<SubmitKYBResponse>(
        `${MERCHANT_BASE_URL}/${merchantId}/kyb/submit`
    );
    return response.data;
};

/**
 * Approve merchant's KYB submission (Admin only)
 */
export const approveKYB = async (
    merchantId: string
): Promise<ApproveKYBResponse> => {
    const response = await apiClient.post<ApproveKYBResponse>(
        `${MERCHANT_BASE_URL}/${merchantId}/kyb/approve`
    );
    return response.data;
};

/**
 * Reject merchant's KYB submission (Admin only)
 */
export const rejectKYB = async (
    merchantId: string
): Promise<RejectKYBResponse> => {
    const response = await apiClient.post<RejectKYBResponse>(
        `${MERCHANT_BASE_URL}/${merchantId}/kyb/reject`
    );
    return response.data;
};

/**
 * Request production environment access
 */
export const requestProduction = async (
    merchantId: string
): Promise<RequestProductionResponse> => {
    const response = await apiClient.post<RequestProductionResponse>(
        `${MERCHANT_BASE_URL}/${merchantId}/production-request`
    );
    return response.data;
};

/**
 * Approve production access and generate production credentials (Admin only)
 */
export const approveProduction = async (
    merchantId: string
): Promise<ApproveProductionResponse> => {
    const response = await apiClient.post<ApproveProductionResponse>(
        `${MERCHANT_BASE_URL}/${merchantId}/production-approve`
    );
    return response.data;
};

/**
 * Suspend merchant's sandbox environment (Admin only)
 */
export const suspendSandbox = async (
    merchantId: string
): Promise<SuspendSandboxResponse> => {
    const response = await apiClient.post<SuspendSandboxResponse>(
        `${MERCHANT_BASE_URL}/${merchantId}/sandbox/suspend`
    );
    return response.data;
};

/**
 * Reactivate merchant's sandbox environment (Admin only)
 */
export const reactivateSandbox = async (
    merchantId: string
): Promise<ReactivateSandboxResponse> => {
    const response = await apiClient.post<ReactivateSandboxResponse>(
        `${MERCHANT_BASE_URL}/${merchantId}/sandbox/reactivate`
    );
    return response.data;
};

/**
 * Suspend merchant's production environment (Admin only)
 */
export const suspendProduction = async (
    merchantId: string
): Promise<SuspendProductionResponse> => {
    const response = await apiClient.post<SuspendProductionResponse>(
        `${MERCHANT_BASE_URL}/${merchantId}/production/suspend`
    );
    return response.data;
};

/**
 * Reactivate merchant's production environment (Admin only)
 */
export const reactivateProduction = async (
    merchantId: string
): Promise<ReactivateProductionResponse> => {
    const response = await apiClient.post<ReactivateProductionResponse>(
        `${MERCHANT_BASE_URL}/${merchantId}/production/reactivate`
    );
    return response.data;
};

/**
 * Add a domain for admin approval
 */
export const addDomain = async (
    merchantId: string,
    data: AddDomainRequest
): Promise<AddDomainResponse> => {
    const response = await apiClient.post<AddDomainResponse>(
        `${MERCHANT_BASE_URL}/${merchantId}/domains`,
        data
    );
    return response.data;
};

/**
 * Delete a domain (only PENDING or REJECTED domains can be deleted by merchant)
 */
export const deleteDomain = async (
    merchantId: string,
    domainId: string
): Promise<DeleteDomainResponse> => {
    const response = await apiClient.delete<DeleteDomainResponse>(
        `${MERCHANT_BASE_URL}/${merchantId}/domains/${domainId}`
    );
    return response.data;
};

/**
 * Get all domains for a merchant
 */
export const getDomains = async (
    merchantId: string
): Promise<GetDomainsResponse> => {
    const response = await apiClient.get<GetDomainsResponse>(
        `${MERCHANT_BASE_URL}/${merchantId}/domains`
    );
    return response.data;
};

/**
 * Get configured gateways for a merchant
 */
export const getGateways = async (
    merchantId: string
): Promise<GetGatewaysResponse> => {
    const response = await apiClient.get<GetGatewaysResponse>(
        `${MERCHANT_BASE_URL}/${merchantId}/gateways`
    );
    return response.data;
};

/**
 * Configure payment gateway settings
 */
export const configureGateway = async (
    merchantId: string,
    data: ConfigureGatewayRequest
): Promise<ConfigureGatewayResponse> => {
    const response = await apiClient.post<ConfigureGatewayResponse>(
        `${MERCHANT_BASE_URL}/${merchantId}/gateways`,
        data
    );
    return response.data;
};

/**
 * Set custom fee structure for a gateway
 */
export const setFeeOverride = async (
    merchantId: string,
    data: SetFeeOverrideRequest
): Promise<SetFeeOverrideResponse> => {
    const response = await apiClient.post<SetFeeOverrideResponse>(
        `${MERCHANT_BASE_URL}/${merchantId}/fee-overrides`,
        data
    );
    return response.data;
};

/**
 * Regenerate sandbox API credentials
 * WARNING: Old credentials will be invalidated immediately
 */
export const regenerateSandboxCredentials = async (
    merchantId: string
): Promise<RegenerateSandboxCredentialsResponse> => {
    const response = await apiClient.post<RegenerateSandboxCredentialsResponse>(
        `${MERCHANT_BASE_URL}/${merchantId}/regenerate-sandbox-credentials`
    );
    return response.data;
};

/**
 * Regenerate production API credentials
 * WARNING: Old credentials will be invalidated immediately
 * Requires production environment to be ACTIVE
 */
export const regenerateProductionCredentials = async (
    merchantId: string
): Promise<RegenerateProductionCredentialsResponse> => {
    const response = await apiClient.post<RegenerateProductionCredentialsResponse>(
        `${MERCHANT_BASE_URL}/${merchantId}/regenerate-production-credentials`
    );
    return response.data;
};

/**
 * Get all pending KYB submissions (Admin only)
 * Returns merchants with kycStatus = 'PENDING'
 */
export const getPendingKYBSubmissions = async (): Promise<GetPendingKYBSubmissionsResponse> => {
    const response = await apiClient.get<GetPendingKYBSubmissionsResponse>(
        '/merchant/v1/admin/pending-kyb'
    );
    return response.data;
};

/**
 * Get pending production summary (Admin only)
 * Returns merchants with approved KYB awaiting production access
 */
export const getPendingProductionSummary = async (): Promise<GetPendingProductionSummaryResponse> => {
    const response = await apiClient.get<GetPendingProductionSummaryResponse>(
        '/merchant/v1/admin/pending-production-summary'
    );
    return response.data;
};

/**
 * Get Dashboard Overview Stats
 * Returns 5 key metric cards for the dashboard
 */
export const getDashboardStats = async (
    merchantId: string,
    period: '7d' | '30d' | '90d' | 'all' = '30d',
    environment: 'sandbox' | 'production'
): Promise<DashboardStatsResponse> => {
    const params: Record<string, string> = {
        period,
        environment, // ALWAYS pass environment - REQUIRED
    };

    console.log('[merchants/getDashboardStats] Called with environment:', environment);
    console.log('[merchants/getDashboardStats] merchantId:', merchantId, 'period:', period);
    console.log('[merchants/getDashboardStats] Params being sent:', params);

    const response = await apiClient.get<DashboardStatsResponse>(
        `${MERCHANT_BASE_URL}/${merchantId}/dashboard/stats`,
        {
            params,
        }
    );
    return response.data;
};

/**
 * Get Recent Transactions
 * Returns the most recent transactions for dashboard display
 */
export const getRecentTransactions = async (
    merchantId: string,
    limit: number = 10,
    type: 'collection' | 'payout' | 'refund' | undefined,
    environment: 'sandbox' | 'production'
): Promise<RecentTransactionsResponse> => {
    const params: Record<string, string> = {
        limit: limit.toString(),
        environment, // ALWAYS pass environment - REQUIRED
    };
    if (type) {
        params.type = type;
    }

    console.log('[merchants/getRecentTransactions] Called with environment:', environment);
    console.log('[merchants/getRecentTransactions] merchantId:', merchantId, 'limit:', limit, 'type:', type);
    console.log('[merchants/getRecentTransactions] Params being sent:', params);

    const response = await apiClient.get<RecentTransactionsResponse>(
        `${MERCHANT_BASE_URL}/${merchantId}/dashboard/transactions/recent`,
        {
            params,
        }
    );
    return response.data;
};

/**
 * Download a merchant transaction receipt.
 * Backend route expected: GET /merchant/v1/transactions/:id/receipt
 */
export const downloadTransactionReceipt = async (
    transactionId: string,
    environment?: 'sandbox' | 'production'
): Promise<Blob> => {
    const response = await apiClient.get<Blob>(
        `/merchant/v1/transactions/${transactionId}/receipt`,
        {
            params: environment ? { environment } : undefined,
            responseType: 'blob',
        }
    );
    return response.data;
};

/**
 * Top Up Wallet
 * Add money to merchant wallet via mobile money collection
 */
export const topUpWallet = async (
    _merchantId: string,
    data: TopUpRequest
): Promise<TopUpResponse> => {
    const response = await apiClient.post<TopUpResponse>(
        `/merchant/v1/wallet/topup`,
        data
    );
    return response.data;
};

/**
 * Withdraw from Wallet
 * Withdraw money from merchant wallet to a mobile number
 */
export const withdrawFromWallet = async (
    merchantId: string,
    data: WithdrawRequest
): Promise<WithdrawResponse> => {
    const response = await apiClient.post<WithdrawResponse>(
        `${MERCHANT_BASE_URL}/${merchantId}/wallet/withdraw`,
        data
    );
    return response.data;
};

/**
 * Get Wallet Operation History
 * Retrieve history of all wallet top-ups and withdrawals
 */
export const getWalletOperations = async (
    _merchantId: string,
    environment?: 'sandbox' | 'production',
    limit: number = 50
): Promise<WalletOperationsResponse> => {
    const params: Record<string, string> = {
        limit: limit.toString(),
    };
    if (environment) {
        params.environment = environment;
    }

    const response = await apiClient.get<WalletOperationsResponse>(
        `/merchant/v1/wallet/operations`,
        {
            params,
        }
    );
    return response.data;
};

export const listBankTopupAccounts = async (): Promise<BankTopupAccountsResponse> => {
    const response = await apiClient.get<BankTopupAccountsResponse>(
        `/merchant/v1/bank-topup/accounts`
    );
    return response.data;
};

export const createBankTopupRequest = async (
    data: CreateBankTopupRequestPayload
): Promise<CreateBankTopupRequestResponse> => {
    const response = await apiClient.post<CreateBankTopupRequestResponse>(
        `/merchant/v1/bank-topups`,
        data
    );
    return response.data;
};

export const uploadBankTopupReceipt = async (
    requestId: string,
    data: UploadBankTopupReceiptPayload
): Promise<UploadBankTopupReceiptResponse> => {
    const response = await apiClient.post<UploadBankTopupReceiptResponse>(
        `/merchant/v1/bank-topups/${requestId}/receipt`,
        data
    );
    return response.data;
};

export const listMerchantBankTopups = async (): Promise<MerchantBankTopupRequestsResponse> => {
    const response = await apiClient.get<MerchantBankTopupRequestsResponse>(
        `/merchant/v1/bank-topups`
    );
    return response.data;
};

export const getMerchantBankTopup = async (
    requestId: string
): Promise<MerchantBankTopupRequestResponse> => {
    const response = await apiClient.get<MerchantBankTopupRequestResponse>(
        `/merchant/v1/bank-topups/${requestId}`
    );
    return response.data;
};

/**
 * Update merchant profile
 * Updates the first merchant account linked to the authenticated user
 * All fields are optional - only provided fields will be updated
 */
export const updateMerchantProfile = async (
    updates: UpdateMerchantProfileRequest
): Promise<UpdateMerchantProfileResponse> => {
    const response = await apiClient.put<UpdateMerchantProfileResponse>(
        '/merchant/v1/profile',
        updates
    );
    return response.data;
};

/**
 * Upload merchant logo image
 * POST /files/v1/upload?type=MERCHANT_LOGO
 * Returns the uploaded file's id
 */
export const uploadMerchantLogo = async (
    file: File
): Promise<{ id: string; filename: string; storagePath: string; size: number }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fileUploadClient.upload<{ id: string; filename: string; storagePath: string; size: number }>(
        '/files/v1/upload?type=MERCHANT_LOGO',
        formData
    );
    return response.data;
};

/**
 * Submit merchant profile changes for admin review.
 * Merchants are blocked from direct profile/account edits in the new onboarding model.
 */
export const submitProfileUpdateRequest = async (
    body: SubmitProfileUpdateRequestBody
): Promise<SubmitProfileUpdateResponse> => {
    const payload: SubmitProfileUpdateRequestBody = {
        proposedChanges: {
            merchant: body.proposedChanges.merchant,
            individual: body.proposedChanges.individual ?? {},
            institution: body.proposedChanges.institution ?? {},
        },
        changeDescription: body.changeDescription ?? "Requested by merchant",
        supportingFileIds: body.supportingFileIds ?? [],
    };

    const response = await apiClient.post<SubmitProfileUpdateResponse>(
        "/merchant/v1/profile/update-request",
        payload
    );

    return response.data;
};

// ============================================
// IP ADDRESS MANAGEMENT (Merchant Side)
// ============================================

/**
 * Add an IP address for admin approval
 */
export const addIp = async (
    merchantId: string,
    data: AddIpRequest
): Promise<AddIpResponse> => {
    const response = await apiClient.post<AddIpResponse>(
        `${MERCHANT_BASE_URL}/${merchantId}/ips`,
        data
    );
    return response.data;
};

/**
 * Get all IP addresses for a merchant
 */
export const getIps = async (
    merchantId: string
): Promise<GetIpsResponse> => {
    const response = await apiClient.get<GetIpsResponse>(
        `${MERCHANT_BASE_URL}/${merchantId}/ips`
    );
    return response.data;
};

/**
 * Delete an IP address (only PENDING or REJECTED IPs can be deleted by merchant)
 */
export const deleteIp = async (
    merchantId: string,
    ipId: string
): Promise<DeleteIpResponse> => {
    const response = await apiClient.delete<DeleteIpResponse>(
        `${MERCHANT_BASE_URL}/${merchantId}/ips/${ipId}`
    );
    return response.data;
};

// ============================================
// ADMIN - DOMAIN APPROVAL
// ============================================

/**
 * Get all pending domain requests (Admin only)
 */
export const getPendingDomainRequests = async (): Promise<GetPendingDomainRequestsResponse> => {
    const response = await apiClient.get<GetPendingDomainRequestsResponse>(
        '/admin/v1/domain-requests/pending'
    );
    return response.data;
};

/**
 * Get all domain requests with optional status filter (Admin only)
 */
export const getAllDomainRequests = async (
    status?: 'PENDING' | 'APPROVED' | 'REJECTED'
): Promise<GetAllDomainRequestsResponse> => {
    const params = status ? { status } : {};
    const response = await apiClient.get<GetAllDomainRequestsResponse>(
        '/admin/v1/domain-requests',
        { params }
    );
    return response.data;
};

/**
 * Approve a domain request (Admin only)
 */
export const approveDomain = async (
    domainId: string
): Promise<ApproveDomainResponse> => {
    const response = await apiClient.post<ApproveDomainResponse>(
        `/admin/v1/domain-requests/${domainId}/approve`
    );
    return response.data;
};

/**
 * Reject a domain request with a reason (Admin only)
 */
export const rejectDomain = async (
    domainId: string,
    data: RejectDomainRequest
): Promise<RejectDomainResponse> => {
    const response = await apiClient.post<RejectDomainResponse>(
        `/admin/v1/domain-requests/${domainId}/reject`,
        data
    );
    return response.data;
};

/**
 * Delete a domain (Admin only - can delete any domain including approved ones)
 */
export const adminDeleteDomain = async (
    domainId: string
): Promise<DeleteDomainResponse> => {
    const response = await apiClient.delete<DeleteDomainResponse>(
        `/admin/v1/domain-requests/${domainId}`
    );
    return response.data;
};

// ============================================
// ADMIN - IP APPROVAL
// ============================================

/**
 * Get all pending IP requests (Admin only)
 */
export const getPendingIpRequests = async (): Promise<GetPendingIpRequestsResponse> => {
    const response = await apiClient.get<GetPendingIpRequestsResponse>(
        '/admin/v1/ip-requests/pending'
    );
    return response.data;
};

/**
 * Get all IP requests with optional status filter (Admin only)
 */
export const getAllIpRequests = async (
    status?: 'PENDING' | 'APPROVED' | 'REJECTED'
): Promise<GetAllIpRequestsResponse> => {
    const params = status ? { status } : {};
    const response = await apiClient.get<GetAllIpRequestsResponse>(
        '/admin/v1/ip-requests',
        { params }
    );
    return response.data;
};

/**
 * Approve an IP request (Admin only)
 */
export const approveIp = async (
    ipId: string
): Promise<ApproveIpResponse> => {
    const response = await apiClient.post<ApproveIpResponse>(
        `/admin/v1/ip-requests/${ipId}/approve`
    );
    return response.data;
};

/**
 * Reject an IP request with a reason (Admin only)
 */
export const rejectIp = async (
    ipId: string,
    data: RejectIpRequest
): Promise<RejectIpResponse> => {
    const response = await apiClient.post<RejectIpResponse>(
        `/admin/v1/ip-requests/${ipId}/reject`,
        data
    );
    return response.data;
};

/**
 * Delete an IP (Admin only - can delete any IP including approved ones)
 */
export const adminDeleteIp = async (
    ipId: string
): Promise<DeleteIpResponse> => {
    const response = await apiClient.delete<DeleteIpResponse>(
        `/admin/v1/ip-requests/${ipId}`
    );
    return response.data;
};
