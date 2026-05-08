import type {
  IndividualMerchantProfile,
  InstitutionMerchantProfile,
} from "@/features/merchants/types/index";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export interface SystemStats {
  totalMerchants: number;
  totalTransactions: number;
  totalVolume: number;
  activeUsers: number;
}

// Admin Dashboard Types
export interface MetricValue {
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
}

export interface HealthMetricValue {
  value: string;
  change: string;
  status: string;
  trend: "up" | "down" | "neutral";
  changeValue?: number;
}

export interface PlatformMetricsResponse {
  totalMerchants: MetricValue;
  activeMerchants: MetricValue;
  platformRevenue: MetricValue;
  totalVolume: MetricValue;
}

export interface HealthMetricsResponse {
  successRate: HealthMetricValue;
  failedTransactions: HealthMetricValue;
  pendingKyb: HealthMetricValue;
  reconIssues: HealthMetricValue;
}

export interface GatewayPerformance {
  name: string;
  successful: number;
  failed: number;
  successRate: number;
  color: string;
}

export type GatewayPerformanceResponse = GatewayPerformance[];

// Admin Bypass Password (Master Key) Types
export interface GenerateBypassPasswordRequest {
  durationHours?: number;
}

export interface GenerateBypassPasswordResponse {
  success: boolean;
  bypassPassword: string;
  expiresAt: string;
  expiresIn: number;
  message: string;
}

// Admin Merchant Users Types
export interface MerchantUser {
  merchantUserId: string;
  role: string;
  merchantUserCreatedAt: string;

  userId: string;
  userEmail: string;
  userRole: string;
  emailVerified: boolean;
  userCreatedAt: string;
  userUpdatedAt: string;

  merchantId: string;
  businessName: string;
  merchantEmail: string | null;
  merchantPhone: string | null;
  businessType: string | null;
  country: string | null;
  enabled: boolean;
  kycStatus: string;
  sandboxState: string;
  productionState: string;
  sandboxApiKey: string;
  productionApiKey: string | null;
  rateLimitPerMinute: number;
  feePayer: 'PAYER' | 'MERCHANT';
  merchantCreatedAt: string;
  merchantUpdatedAt: string;

  // Extended properties for management
  accountStatus?: AccountStatus;
  canCollect?: boolean;
  canDisburse?: boolean;
  canWithdraw?: boolean;

  // Extended merchant profile payload for admin detail views
  merchantKind?: string | null;
  logoFileId?: string | null;
  logoUrl?: string | null;
  individual?: IndividualMerchantProfile | Record<string, unknown> | null;
  institution?: InstitutionMerchantProfile | Record<string, unknown> | null;
}

export interface MerchantUsersResponse {
  merchantUsers: MerchantUser[];
  total: number;
}

export interface AdminMerchantDetail {
  id: string;
  businessName: string;
  email: string | null;
  phone: string | null;
  businessType: string | null;
  country: string | null;
  enabled: boolean;
  kycStatus: string;
  sandboxState: string;
  productionState: string;
  sandboxApiKey: string;
  productionApiKey: string | null;
  rateLimitPerMinute: number;
  feePayer: 'PAYER' | 'MERCHANT';
  logoFileId?: string | null;
  logoUrl?: string | null;
  accountStatus?: AccountStatus;
  canCollect?: boolean;
  canDisburse?: boolean;
  canWithdraw?: boolean;
  allowedIps?: string[];
  createdAt: string;
  updatedAt: string;
  individual?: IndividualMerchantProfile | Record<string, unknown> | null;
  institution?: InstitutionMerchantProfile | Record<string, unknown> | null;
}

export interface AdminMerchantDetailResponse {
  success: boolean;
  merchant: AdminMerchantDetail;
}

export interface ForceLogoutMerchantResponse {
  success: boolean;
  merchantId: string;
  affectedUsers: number;
  message: string;
}

export interface UpdateMerchantRequest {
  businessName?: string;
  email?: string;
  phone?: string;
  businessType?: string;
  country?: string;
  feePayer?: 'PAYER' | 'MERCHANT';
}

export interface UpdateMerchantResponse {
  success: boolean;
  message: string;
  merchant: MerchantUser;
}

export interface CreateMerchantRequest {
  email: string;
  businessName: string;
  phone?: string;
  businessType?: string;
  country?: string;
}

// =============================
// Admin merchant creation (new)
// =============================

export interface Base64FileObject {
  base64: string;
  filename: string;
  mimeType: string;
}

export type AssociationOrGroupDocumentRole = "ASSOCIATION_DOCUMENT" | "GROUP_DOCUMENT";

export interface CreateIndividualMerchantRequest {
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  address: string;
  idType: string;
  idNumber: string;
  niu?: string;
  doingBusinessAs: string;
  passportPhoto: Base64FileObject;
  idDocuments: Base64FileObject[]; // 1..10
  businessLogo?: Base64FileObject | null;
  country?: string;
}

export interface CreateCompanyMerchantRequest {
  email: string;
  institutionName: string;
  registrationNumber: string;
  dateOfCreation: string;
  niu?: string;
  managerName: string;
  managerContact: string;
  managerAddress: string;
  address: string;
  contactPhone: string;
  contactEmail: string;
  documents: Base64FileObject[]; // 1..10
  country?: string;
}

export interface CreateAssociationMerchantRequest extends CreateCompanyMerchantRequest {
  documentRole: AssociationOrGroupDocumentRole; // always ASSOCIATION_DOCUMENT
}

export interface CreateGroupMerchantRequest extends CreateCompanyMerchantRequest {
  documentRole: AssociationOrGroupDocumentRole; // always GROUP_DOCUMENT
}

export interface CreateMerchantResponse {
  success: boolean;
  message: string;
  merchant: {
    userId: string;
    merchantId: string;
    email: string;
    businessName: string;
    sandboxApiKey: string;
  };
}

export interface UpdateMerchantRegistrationSettingsRequest {
  allowSelfRegistration: boolean;
  applicationFormUrl: string;
}

export interface UpdateMerchantRegistrationSettingsResponse {
  success: boolean;
  message: string;
  config: {
    allowSelfRegistration: boolean;
    applicationFormUrl: string;
  };
}

export interface PlatformSetting {
  id: string;
  key: string;
  value: string;
  description: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetPlatformSettingsResponse {
  settings: PlatformSetting[];
  total: number;
  withdrawalsGloballyEnabled: boolean;
  notificationSettings: NotificationSettings;
}

export interface NotificationSettings {
  verificationEmail: boolean;
  passwordResetEmail: boolean;
  welcomeEmail: boolean;
  merchantAccountCreatedEmail: boolean;
  accountStatusChangeEmail: boolean;
  transactionAlertEmail: boolean;
  transactionSuccessAlertEmail: boolean;
  transactionFailureAlertEmail: boolean;
  suspiciousLoginAlertEmail: boolean;
  payoutApprovalEmail: boolean;
  supportTicketMerchantEmail: boolean;
  supportTicketAdminEmail: boolean;
  bankTopupAdminEmail: boolean;
}

export interface GetNotificationSettingsResponse {
  notificationSettings: NotificationSettings;
}

export type UpdateNotificationSettingsRequest = Partial<NotificationSettings>;

export interface UpdateNotificationSettingsResponse {
  success: boolean;
  notificationSettings: NotificationSettings;
}

export interface UpdatePlatformWithdrawalsRequest {
  enabled: boolean;
}

export interface UpdatePlatformWithdrawalsResponse {
  success: boolean;
  withdrawalsGloballyEnabled: boolean;
  updatedAt: string;
}

export interface AdminMsisdnVerifyRequest {
  gateway: "MTN_MOMO" | "ORANGE_MONEY";
  msisdn: string;
  environment?: "sandbox" | "production";
}

export interface AdminMsisdnVerifyResponse {
  msisdn: string;
  found: boolean;
  gateway: "MTN_MOMO" | "ORANGE_MONEY" | string;
  status?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  isUsable?: boolean;
}

export interface AdminMsisdnVerifyBulkEntry {
  msisdn: string;
  gateway: "MTN_MOMO" | "ORANGE_MONEY";
  amount?: string;
}

export interface AdminMsisdnVerifyBulkRequest {
  entries: AdminMsisdnVerifyBulkEntry[];
  environment?: "sandbox" | "production";
}

export interface AdminMsisdnVerifyBulkValidEntry {
  msisdn: string;
  found: boolean;
  gateway: "MTN_MOMO" | "ORANGE_MONEY" | string;
  amount?: string;
  status?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  isUsable?: boolean;
}

export interface AdminMsisdnVerifyBulkInvalidEntry {
  msisdn: string;
  gateway: "MTN_MOMO" | "ORANGE_MONEY" | string;
  reason: string;
  amount?: string;
}

export interface AdminMsisdnVerifyBulkResponse {
  valid: AdminMsisdnVerifyBulkValidEntry[];
  invalid: AdminMsisdnVerifyBulkInvalidEntry[];
  total: number;
  validCount: number;
  invalidCount: number;
}

// Admin Transactions Types
export interface AdminTransaction {
  transactionId: string;
  transactionType: 'COLLECTION' | 'DISBURSEMENT';
  status: string;
  amount: string;
  currency: string;
  environment: string;
  gateway: string;
  gatewayReference: string | null;
  failureReason: string | null;
  correlationId: string;
  refunded: boolean;
  refundedAmount: string;
  fullyRefunded: boolean;
  createdAt: string;
  completedAt: string | null;

  quoteId: string;
  gatewayFee: string;
  platformFee: string;
  totalAmount: string;
  netToMerchant: string;
  payerMsisdn: string | null;

  merchantId: string;
  merchantBusinessName: string;
  merchantEmail: string | null;
  merchantPhone: string | null;

  payoutId: string | null;
  payoutRecipientMsisdn: string | null;
  payoutReference: string | null;
  payoutStatus: string | null;
  payoutGatewayReference: string | null;
  payoutTotalDeduction: string | null;

  refundId: string | null;
  refundAmount: string | null;
  refundMethod: string | null;
  refundStatus: string | null;
  refundReason: string | null;
  refundCreatedAt: string | null;
}

export interface AdminTransactionsResponse {
  transactions: AdminTransaction[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface AdminTransactionFilters {
  limit?: number;
  offset?: number;
  status?: string;
  transactionType?: string;
  gateway?: string;
  merchantId?: string;
  environment?: 'sandbox' | 'production';
}

// Manual Reconciliation Types
export interface ReconcileTransactionRequest {
  action: 'COMPLETE' | 'FAIL';
  notes?: string;
}

export interface ReconcileTransactionResponse {
  success: boolean;
  transaction: {
    id: string;
    status: string;
    completedAt: string | null;
    failureReason: string | null;
  };
  walletCredited: boolean;
  message: string;
}

// Fee Management Types
export interface FeeVersion {
  id: string;
  version: string;
  isActive: boolean;
  description: string | null;
  createdAt: string;
}

export interface FeeVersionsResponse {
  feeVersions: FeeVersion[];
}

export interface CreateFeeVersionRequest {
  version: string;
  description?: string;
}

export interface CreateFeeVersionResponse {
  feeVersion: FeeVersion;
}

export interface ActivateFeeVersionResponse {
  message: string;
  feeVersion: FeeVersion;
}

export interface FeeRule {
  id: string;
  feeVersionId: string;
  gateway: string;
  transactionType: 'COLLECTION' | 'DISBURSEMENT';
  currency: string;
  minAmount: string;
  maxAmount: string;
  gatewayFeeType: 'PERCENTAGE' | 'FIXED' | 'TIERED';
  gatewayFeeValue: string;
  platformFeeType: 'PERCENTAGE' | 'FIXED' | 'TIERED';
  platformFeeValue: string;
  priority: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface FeeRulesResponse {
  feeRules: FeeRule[];
}

export interface FeeRuleResponse {
  feeRule: FeeRule;
}

export interface FeeRuleFilters {
  gateway?: string;
  transactionType?: string;
  currency?: string;
  status?: string;
  feeVersionId?: string;
}

export interface CreateFeeRuleRequest {
  feeVersionId: string;
  gateway: string;
  transactionType: 'COLLECTION' | 'DISBURSEMENT';
  currency: string;
  minAmount: string;
  maxAmount: string;
  gatewayFeeType: 'PERCENTAGE' | 'FIXED' | 'TIERED';
  gatewayFeeValue: string;
  platformFeeType: 'PERCENTAGE' | 'FIXED' | 'TIERED';
  platformFeeValue: string;
  priority?: number;
}

export interface CreateFeeRuleResponse {
  feeRule: FeeRule;
}

export interface UpdateFeeRuleRequest {
  minAmount?: string;
  maxAmount?: string;
  gatewayFeeType?: 'PERCENTAGE' | 'FIXED' | 'TIERED';
  gatewayFeeValue?: string;
  platformFeeType?: 'PERCENTAGE' | 'FIXED' | 'TIERED';
  platformFeeValue?: string;
  priority?: number;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface DeactivateFeeRuleResponse {
  message: string;
}

export interface ActivateFeeRuleResponse {
  message: string;
  feeRule: FeeRule;
}

export interface FeeTier {
  id: string;
  feeRuleId: string;
  minAmount: string;
  maxAmount: string;
  gatewayFeeValue: string;
  platformFeeValue: string | null;
  createdAt: string;
}

export interface FeeTiersResponse {
  feeRule: {
    id: string;
    gateway: string;
    transactionType: string;
    currency: string;
    gatewayFeeType: string;
    status: string;
  };
  tiers: FeeTier[];
}

export interface CreateFeeTierRequest {
  minAmount: string;
  maxAmount: string;
  gatewayFeeValue: string;
  platformFeeValue?: string;
}

export interface CreateFeeTierResponse {
  tier: FeeTier;
}

export interface UpdateFeeTierRequest {
  minAmount?: string;
  maxAmount?: string;
  gatewayFeeValue?: string;
  platformFeeValue?: string;
}

export interface UpdateFeeTierResponse {
  tier: FeeTier;
}

export interface MerchantFeeOverride {
  id: string;
  merchantId: string;
  gateway: string;
  transactionType: 'COLLECTION' | 'DISBURSEMENT';
  currency: string;
  gatewayFeeType: 'PERCENTAGE' | 'FIXED' | 'TIERED';
  gatewayFeeValue: string;
  platformFeeType: 'PERCENTAGE' | 'FIXED' | 'TIERED';
  platformFeeValue: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface MerchantFeeOverridesResponse {
  merchantFeeOverrides: MerchantFeeOverride[];
}

export interface MerchantFeeOverrideResponse {
  override: MerchantFeeOverride;
}

export interface MerchantFeeOverrideFilters {
  merchantId?: string;
  gateway?: string;
  transactionType?: string;
  currency?: string;
  status?: string;
}

export interface CreateMerchantFeeOverrideRequest {
  merchantId: string;
  gateway: string;
  transactionType: 'COLLECTION' | 'DISBURSEMENT';
  currency: string;
  gatewayFeeType: 'PERCENTAGE' | 'FIXED' | 'TIERED';
  gatewayFeeValue: string;
  platformFeeType: 'PERCENTAGE' | 'FIXED' | 'TIERED';
  platformFeeValue: string;
}

export interface UpdateMerchantFeeOverrideRequest {
  gatewayFeeType?: 'PERCENTAGE' | 'FIXED' | 'TIERED';
  gatewayFeeValue?: string;
  platformFeeType?: 'PERCENTAGE' | 'FIXED' | 'TIERED';
  platformFeeValue?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface DeactivateMerchantFeeOverrideResponse {
  message: string;
}

export interface PlatformWalletFeeSettings {
  chargePlatformFeeOnTopup: boolean;
  chargePlatformFeeOnWithdrawal: boolean;
  updatedAt: string | null;
}

export interface PlatformWalletFeeSettingsResponse {
  chargePlatformFeeOnTopup: boolean;
  chargePlatformFeeOnWithdrawal: boolean;
  updatedAt: string | null;
}

export interface UpdatePlatformWalletFeeSettingsRequest {
  chargePlatformFeeOnTopup?: boolean;
  chargePlatformFeeOnWithdrawal?: boolean;
}

// Delete Merchant Types
export interface DeleteMerchantResponse {
  success: boolean;
  message: string;
  deletedMerchant: {
    id: string;
    businessName: string;
  };
}

export type GatewayCode = 'MTN_MOMO' | 'ORANGE_MONEY';
export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED' | 'API_BLOCKED';
export type TopupFeeType = 'FLAT' | 'PERCENTAGE' | 'FLAT_AND_PERCENTAGE';

export interface GlobalGateway {
  id: string;
  code: GatewayCode;
  name: string;
  isActive: boolean;
  collectionsEnabled: boolean;
  disbursementsEnabled: boolean;
  withdrawalsEnabled: boolean;
  updatedAt: string;
}

export interface GetGlobalGatewaysResponse {
  success: boolean;
  gateways: GlobalGateway[];
}

export interface TopupFeeRule {
  id: string;
  gateway: GatewayCode;
  currency: string;
  feeType: TopupFeeType;
  flatFee: string;
  percentageFee: string;
  minFee: string | null;
  maxFee: string | null;
  isActive: boolean;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListTopupFeeRulesResponse {
  fee_rules: TopupFeeRule[];
  total: number;
}

export interface UpsertTopupFeeRuleRequest {
  gateway: GatewayCode;
  currency: string;
  fee_type: TopupFeeType;
  flat_fee?: number;
  percentage_fee?: number;
  min_fee?: number;
  max_fee?: number;
}

export interface UpsertTopupFeeRuleResponse {
  fee_rule: TopupFeeRule;
}

export interface AdminBankTopupAccount {
  id: string;
  bankName: string;
  currency: string;
  instructions: string;
  isActive: boolean;
  logoUrl: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ListAdminBankTopupAccountsResponse {
  accounts: AdminBankTopupAccount[];
}

export interface CreateAdminBankTopupAccountRequest {
  bankName: string;
  currency: string;
  instructions: string;
  isActive: boolean;
  logo?: Base64FileObject | null;
}

export interface UpdateAdminBankTopupAccountRequest {
  bankName?: string;
  currency?: string;
  instructions?: string;
  isActive?: boolean;
  logo?: Base64FileObject | null;
}

export interface UpsertAdminBankTopupAccountResponse {
  success: boolean;
  account: AdminBankTopupAccount;
  message?: string;
}

export type BankTopupRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface AdminBankTopupRequest {
  id: string;
  merchantId: string;
  merchantBusinessName: string;
  bankAccountId: string;
  amount: string;
  currency: string;
  environment: 'sandbox' | 'production';
  referenceCode: string;
  status: BankTopupRequestStatus;
  merchantNote: string | null;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
  bankName: string;
  instructions: string;
  receiptUrl: string | null;
  logoUrl: string | null;
}

export interface ListAdminBankTopupRequestsResponse {
  requests: AdminBankTopupRequest[];
}

export interface ReviewAdminBankTopupRequestPayload {
  adminNote?: string;
}

export interface ReviewAdminBankTopupRequestResponse {
  success: boolean;
  request: AdminBankTopupRequest;
  message?: string;
}

export interface MerchantWalletAdjustment {
  id: string;
  merchantId: string;
  performedBy: string;
  direction: 'CREDIT' | 'DEBIT';
  amount: string;
  currency: string;
  environment: 'sandbox' | 'production';
  referenceCode: string;
  reason: string;
  createdAt: string;
}

export interface CreateMerchantWalletAdjustmentRequest {
  merchantId: string;
  direction: 'CREDIT' | 'DEBIT';
  amount: number;
  currency: string;
  reason: string;
  environment: 'sandbox' | 'production';
}

export interface CreateMerchantWalletAdjustmentResponse {
  success: boolean;
  adjustment: MerchantWalletAdjustment;
}

export interface ListMerchantWalletAdjustmentsResponse {
  adjustments: MerchantWalletAdjustment[];
}

export interface UpdateGlobalGatewayRequest {
  isActive?: boolean;
  collectionsEnabled?: boolean;
  disbursementsEnabled?: boolean;
  withdrawalsEnabled?: boolean;
}

export interface UpdateGlobalGatewayResponse {
  success: boolean;
  gateway: GlobalGateway;
}

export interface MerchantStatusUpdate {
  status: AccountStatus;
  notifyUser?: boolean;
  reason?: string;
}

export interface UpdateMerchantStatusResponse {
  success: boolean;
  merchant: {
    id: string;
    businessName: string;
    accountStatus: AccountStatus;
    updatedAt: string;
    // ...other merchant fields can be partial using Record<string, any> or just what we need
  };
}

export interface MerchantCapabilitiesUpdate {
  canCollect?: boolean;
  canDisburse?: boolean;
  canWithdraw?: boolean;
}

export interface UpdateMerchantCapabilitiesResponse {
  success: boolean;
  merchant: {
    id: string;
    canCollect: boolean;
    canDisburse: boolean;
    canWithdraw: boolean;
    updatedAt: string;
  };
}

export interface MerchantGatewayConfigUpdate {
  gateway: GatewayCode;
  enabled?: boolean;
  canCollect?: boolean;
  canDisburse?: boolean;
}

export interface MerchantGatewayConfig {
  id: string;
  merchantId: string;
  gateway: GatewayCode;
  enabled: boolean;
  canCollect: boolean;
  canDisburse: boolean;
  updatedAt: string;
}

export interface GetMerchantGatewayConfigsResponse {
  success: boolean;
  configs: MerchantGatewayConfig[];
}

export interface UpdateMerchantGatewayConfigResponse {
  success: boolean;
  config: MerchantGatewayConfig;
}

// Support Ticket Types
import { TicketStatus, TicketPriority } from "@/features/support/types";

export interface SupportTicketFilters {
  status?: TicketStatus;
  priority?: TicketPriority;
  assignedTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}
