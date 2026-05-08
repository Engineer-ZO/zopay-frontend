// Merchant API Types

// Merchant States
export type KYCStatus = 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
export type SandboxState = 'ACTIVE' | 'SUSPENDED';
export type ProductionState = 'NOT_REQUESTED' | 'PENDING_APPROVAL' | 'ACTIVE' | 'SUSPENDED';

/** How the merchant account is modeled (matches admin creation + API). */
export type MerchantKind = 'INDIVIDUAL' | 'COMPANY' | 'ASSOCIATION' | 'GROUP' | 'LEGACY';

/** Profile payload for INDIVIDUAL merchants (from API; may be camelCase or snake_case before normalize). */
export interface IndividualMerchantProfile {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    gender?: string;
    phone?: string;
    address?: string;
    idType?: string;
    idNumber?: string;
    niu?: string;
    doingBusinessAs?: string;
}

/** Profile payload for COMPANY / ASSOCIATION / GROUP merchants. */
export interface InstitutionMerchantProfile {
    institutionName?: string;
    registrationNumber?: string;
    dateOfCreation?: string;
    niu?: string;
    managerName?: string;
    managerContact?: string;
    managerAddress?: string;
    address?: string;
    contactPhone?: string;
    contactEmail?: string;
}

// Merchant Object
export interface Merchant {
    id: string;
    businessName: string;
    email: string;
    phone: string;
    businessType: string;
    country: string;
    enabled: boolean;
    kycStatus: KYCStatus;
    sandboxState: SandboxState;
    productionState: ProductionState;
    sandboxApiKey: string;
    productionApiKey?: string;
    rateLimitPerMinute: number;
    feePayer: 'PAYER' | 'MERCHANT';
    userRole?: 'owner' | 'admin' | 'viewer';  // Role in merchant (for getUserMerchants)
    logoFileId?: string | null;
    logoUrl?: string | null;
    allowedIps?: string[];
    createdAt: string;
    updatedAt: string;
    /** Present for individual merchants when API returns extended profile */
    individual?: IndividualMerchantProfile | Record<string, unknown> | null;
    /** Present for company / association / group when API returns extended profile */
    institution?: InstitutionMerchantProfile | Record<string, unknown> | null;
}

// Domain Object (Updated for manual approval system)
export interface Domain {
    id: string;
    merchantId: string;
    domain: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    requestedBy: string | null;
    reviewedBy: string | null;
    reviewedAt: string | null;
    rejectionReason: string | null;
    verifiedAt: string | null;
    verificationToken?: string; // Legacy field, may not be present in new system
    createdAt: string;
    updatedAt: string;
}

// IP Address Object
export interface IpAddress {
    id: string;
    merchantId: string;
    ipAddress: string;
    description: string | null;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    requestedBy: string | null;
    reviewedBy: string | null;
    reviewedAt: string | null;
    rejectionReason: string | null;
    verifiedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

// Gateway Configuration
export interface GatewayConfig {
    id: string;
    merchantId: string;
    gateway: string;
    enabled: boolean;
    minAmount: string;
    maxAmount: string;
    dailyLimit: string;
    createdAt: string;
    updatedAt: string;
}

// Fee Override
export interface FeeOverride {
    id: string;
    merchantId: string;
    gateway: string;
    percentage: string;
    flatFee: string;
    createdAt: string;
    updatedAt: string;
}

// Request Types
export interface CreateMerchantRequest {
    businessName: string;
    email?: string;
    phone?: string;
    businessType?: string;
    country?: string;
}

export interface UpdateMerchantRequest {
    businessName?: string;
    email?: string;
    phone?: string;
    businessType?: string;
    country?: string;
    feePayer?: 'PAYER' | 'MERCHANT';
}

export interface UpdateMerchantProfileRequest {
    businessName?: string;
    email?: string;
    phone?: string;
    businessType?: string;
    country?: string;
    feePayer?: 'PAYER' | 'MERCHANT';
    logoFileId?: string | null;
}

export interface UpdateMerchantProfileResponse {
    merchant: {
        id: string;
        businessName: string;
        email: string | null;
        phone: string | null;
        businessType: string | null;
        country: string | null;
        enabled: boolean;
        kycStatus: KYCStatus;
        sandboxState: SandboxState;
        productionState: ProductionState;
        rateLimitPerMinute: number;
        feePayer: 'PAYER' | 'MERCHANT';
        allowedIps: string[];
        createdAt: string;
        updatedAt: string;
    };
}

export interface SubmitProfileUpdateRequestBody {
    proposedChanges: {
        merchant: UpdateMerchantProfileRequest;
        individual?: Partial<IndividualMerchantProfile>;
        institution?: Partial<InstitutionMerchantProfile>;
    };
    changeDescription?: string;
    supportingFileIds?: string[];
}

export interface SubmitProfileUpdateResponse {
    id: string;
    message: string;
}

export interface AddDomainRequest {
    domain: string;
}

export interface ConfigureGatewayRequest {
    gateway: string;
    enabled?: boolean;
    minAmount?: string;
    maxAmount?: string;
    dailyLimit?: string;
}

export interface SetFeeOverrideRequest {
    gateway: string;
    percentage?: string;
    flatFee?: string;
}

// Response Types
export interface CreateMerchantResponse {
    merchant: {
        id: string;
        businessName: string;
        sandboxApiKey: string;
        sandboxSecretKey: string;
    };
}

export interface GetMerchantResponse {
    merchant: Merchant;
}

export interface GetFirstMerchantResponse {
    merchant: Merchant;
}

export interface GetUserMerchantsResponse {
    merchants: Merchant[];
}

export interface UpdateMerchantResponse {
    merchant: Merchant;
}

export interface SubmitKYBResponse {
    merchant: Merchant;
}

export interface ApproveKYBResponse {
    merchant: Merchant;
}

export interface RejectKYBResponse {
    merchant: Merchant;
}

export interface RequestProductionResponse {
    merchant: Merchant;
}

export interface ApproveProductionResponse {
    merchant: Merchant;
    productionApiKey: string;
    productionSecretKey: string;
}

export interface SuspendSandboxResponse {
    merchant: Merchant;
}

export interface ReactivateSandboxResponse {
    merchant: Merchant;
}

export interface SuspendProductionResponse {
    merchant: Merchant;
}

export interface ReactivateProductionResponse {
    merchant: Merchant;
}

export interface AddDomainResponse {
    domain: {
        id: string;
        domain: string;
        status: 'PENDING' | 'APPROVED' | 'REJECTED';
    };
}

export interface VerifyDomainResponse {
    domain: Domain;
}

export interface GetDomainsResponse {
    domains: Domain[];
}

export interface ConfigureGatewayResponse {
    gateway: GatewayConfig;
}

export interface GetGatewaysResponse {
    gateways: GatewayConfig[];
}

export interface SetFeeOverrideResponse {
    feeOverride: FeeOverride;
}

export interface RegenerateSandboxCredentialsResponse {
    message: string;
    sandboxApiKey: string;
    sandboxSecretKey: string;
    warning: string;
}

export interface RegenerateProductionCredentialsResponse {
    message: string;
    productionApiKey: string;
    productionSecretKey: string;
    warning: string;
}

// Pending KYB Submissions Types
export interface KYBDocument {
    id: string;
    fileId: string;
    type: string;
    name: string;
    size: string;
    status: 'valid' | 'error' | 'warning';
    reviewStatus: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
    url: string;
    urlExpiresAt: string;
    notes?: string;
}

export interface KYBSubmission {
    id: string;
    merchant: {
        businessName: string;
        email: string;
        phone: string;
        businessType: string;
        country: string;
        countryCode: string;
        kycStatus?: string;
    };
    submittedAt: string;
    documents: KYBDocument[];
    notes: string;
    isResubmission: boolean;
    priority: 'recent' | 'attention' | 'urgent';
    ageInDays: number;
}

export interface GetPendingKYBSubmissionsResponse {
    submissions: KYBSubmission[];
}

// Pending Production Summary Types
export interface PendingProductionSummaryItem {
    id: string;
    merchant: {
        businessName: string;
        email: string;
        phone: string;
        businessType: string;
        country: string;
        countryCode: string;
        kybStatus: string;
        productionState: string;
    };
    submissionDate: string;
    ageInDays: number;
    priority: 'recent' | 'attention' | 'urgent';
    totalDocuments: number;
    approvedDocuments: number;
}

export interface GetPendingProductionSummaryResponse {
    summary: PendingProductionSummaryItem[];
}

// Legacy alias for backward compatibility (deprecated)
/** @deprecated Use PendingProductionSummaryItem instead */
export type PendingKYBSummaryItem = PendingProductionSummaryItem;
/** @deprecated Use GetPendingProductionSummaryResponse instead */
export type GetPendingKYBSummaryResponse = GetPendingProductionSummaryResponse;

// Dashboard Types
export interface DashboardStat {
    label: string;
    value: string;
    currency: string;
    change: string;
    trend: 'up' | 'down';
    subtitle: string;
}

export interface DashboardStatsResponse {
    stats: DashboardStat[];
}

export interface RecentTransaction {
    id: string;
    date: string;
    time: string;
    type: 'collection' | 'payout' | 'refund';
    amount: number;
    currency: string;
    status: string;
    gateway: string;
    customer?: string;
    recipient?: string;
    fees: number;
    netAmount: number;
    createdAt: string;
    payerName?: string | null;
    payerEmail?: string | null;
    payerMsisdn?: string | null;
    payeeName?: string | null;
    payeeEmail?: string | null;
    payeeMsisdn?: string | null;
    phoneNumber?: string | null;
    comment?: string | null;
    paymentLinkId?: string | null;
    paymentLinkTitle?: string | null;
    source?: string | null;
}

export interface RecentTransactionsResponse {
    transactions: RecentTransaction[];
    total: number;
    hasMore: boolean;
}

// Wallet Operations Types
export interface TopUpRequest {
    gateway: 'MTN_MOMO' | 'ORANGE_MONEY';
    amount: number;
    currency: string;
    msisdn: string;
    environment?: 'sandbox' | 'production';
}

export interface TopUpResponse {
    success: boolean;
    message: string;
    transactionId: string;
    gatewayFee: number;
    platformFee: number;
    topupFee: number;
    totalFee: number;
    chargedAmount: number;
    walletCreditAmount: number;
    netAmount: number;
}

export interface WithdrawRequest {
    gateway: 'MTN_MOMO' | 'ORANGE_MONEY';
    amount: number;
    currency: string;
    recipientMsisdn: string;
    environment?: 'sandbox' | 'production';
}

export interface WithdrawResponse {
    success: boolean;
    message: string;
    payoutId: string;
    gatewayFee: number;
    totalDeducted: number;
}

export interface WalletOperation {
    id: string;
    type: 'TOPUP' | 'WITHDRAWAL';
    amount: number;
    currency: string;
    gatewayFee: number;
    status: 'PENDING' | 'PROCESSING' | 'VERIFYING' | 'SUCCESS' | 'FAILED';
    msisdn: string;
    createdAt: string;
}

export interface WalletOperationsResponse {
    operations: WalletOperation[];
    total: number;
}

export interface MerchantBase64FileObject {
    base64: string;
    filename: string;
    mimeType: string;
}

export interface BankTopupAccount {
    id: string;
    bankName: string;
    currency: string;
    instructions: string;
    isActive: boolean;
    logoUrl: string | null;
}

export interface MerchantBankTopupRequest {
    id: string;
    merchantId: string;
    bankAccountId: string;
    amount: string;
    currency: string;
    environment: 'sandbox' | 'production';
    referenceCode: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    merchantNote: string | null;
    adminNote: string | null;
    approvedAt: string | null;
    rejectedAt: string | null;
    createdAt: string;
    updatedAt: string;
    bankName: string;
    instructions: string;
    receiptUrl: string | null;
    logoUrl: string | null;
}

export interface BankTopupAccountsResponse {
    accounts: BankTopupAccount[];
}

export interface CreateBankTopupRequestPayload {
    bankAccountId: string;
    amount: number;
    currency: string;
    merchantNote?: string;
    receipt?: MerchantBase64FileObject;
}

export interface CreateBankTopupRequestResponse {
    success: boolean;
    message: string;
    request: MerchantBankTopupRequest;
}

export interface UploadBankTopupReceiptPayload {
    receipt: MerchantBase64FileObject;
}

export interface UploadBankTopupReceiptResponse {
    success: boolean;
    message: string;
    request: MerchantBankTopupRequest;
}

export interface MerchantBankTopupRequestsResponse {
    requests: MerchantBankTopupRequest[];
}

export interface MerchantBankTopupRequestResponse {
    request: MerchantBankTopupRequest;
}

// ============================================
// IP ADDRESS TYPES (Merchant Side)
// ============================================

export interface AddIpRequest {
    ipAddress: string;
    description?: string;
}

export interface AddIpResponse {
    ip: {
        id: string;
        ipAddress: string;
        status: 'PENDING' | 'APPROVED' | 'REJECTED';
    };
}

export interface GetIpsResponse {
    ips: IpAddress[];
}

export interface DeleteIpResponse {
    message: string;
}

export interface DeleteDomainResponse {
    message: string;
}

// ============================================
// ADMIN DOMAIN APPROVAL TYPES
// ============================================

export interface DomainRequest {
    id: string;
    merchantId: string;
    merchantName: string;
    domain: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    requestedBy: string | null;
    requestedByEmail: string | null;
    reviewedBy: string | null;
    reviewedAt: string | null;
    rejectionReason: string | null;
    verifiedAt: string | null;
    createdAt: string;
}

export interface GetPendingDomainRequestsResponse {
    domains: DomainRequest[];
}

export interface GetAllDomainRequestsResponse {
    domains: DomainRequest[];
}

export type ApproveDomainRequest = Record<string, never>;

export interface ApproveDomainResponse {
    message: string;
    domain: Domain;
}

export interface RejectDomainRequest {
    reason: string;
}

export interface RejectDomainResponse {
    message: string;
    domain: Domain;
}

// ============================================
// ADMIN IP APPROVAL TYPES
// ============================================

export interface IpRequest {
    id: string;
    merchantId: string;
    merchantName: string;
    ipAddress: string;
    description: string | null;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    requestedBy: string | null;
    requestedByEmail: string | null;
    reviewedBy: string | null;
    reviewedAt: string | null;
    rejectionReason: string | null;
    verifiedAt: string | null;
    createdAt: string;
}

export interface GetPendingIpRequestsResponse {
    ips: IpRequest[];
}

export interface GetAllIpRequestsResponse {
    ips: IpRequest[];
}

export type ApproveIpRequest = Record<string, never>;

export interface ApproveIpResponse {
    message: string;
    ip: IpAddress;
}

export interface RejectIpRequest {
    reason: string;
}

export interface RejectIpResponse {
    message: string;
    ip: IpAddress;
}
