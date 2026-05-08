// ============ WITHDRAWAL METHOD TYPES ============

export type WithdrawalMethodType =
    | 'MOBILE_MONEY'
    | 'LOCAL_BANK'
    | 'INTERNATIONAL_BANK'
    | 'PREPAID_CARD';

export type WithdrawalGateway = 'MTN_MOMO' | 'ORANGE_MONEY';
export type WithdrawalMethodStatus = 'PENDING' | 'ACTIVE' | 'DISABLED' | 'REJECTED';
export type WithdrawalFeeType = 'FLAT' | 'PERCENTAGE' | 'FLAT_AND_PERCENTAGE';

export interface WithdrawalMethod {
    id: string;
    merchantId: string;
    methodType: WithdrawalMethodType;
    status: WithdrawalMethodStatus;
    adminOnly: boolean;
    approvedAt: string | null;
    rejectionReason: string | null;
    createdAt: string;
    updatedAt: string;
    // Mobile Money
    gateway?: WithdrawalGateway;
    msisdn?: string;
    // Local Bank
    bankName?: string;
    bankCode?: string;
    branchCode?: string;
    accountNumber?: string;
    accountKey?: string;
    accountName?: string;
    // International Bank
    country?: string;
    swiftCode?: string;
    routingNumber?: string;
    iban?: string;
    accountCurrency?: string;
    // Prepaid Card
    cardNetwork?: string;
    cardholderName?: string;
    clientId?: string;
    lastFourDigits?: string;
}

export interface ListWithdrawalMethodsResponse {
    methods: WithdrawalMethod[];
    total: number;
}

// ============ LOCAL BANK CATALOG ============

export interface LocalBank {
    id: string;
    name: string;
    code: string;
    country: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ListLocalBanksResponse {
    banks: LocalBank[];
    total: number;
}

// ============ WITHDRAWAL LIMITS ============

export interface WithdrawalLimit {
    id: string;
    methodType: WithdrawalMethodType;
    gateway: WithdrawalGateway | null;
    currency: string;
    minAmount: string;
    maxAmount: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ListWithdrawalLimitsResponse {
    limits: WithdrawalLimit[];
    total: number;
}

// ============ WITHDRAWAL FEE RULES ============

export interface WithdrawalFeeRule {
    id: string;
    methodType: WithdrawalMethodType;
    currency: string;
    feeType: WithdrawalFeeType;
    flatFee: string;
    percentageFee: string;
    minFee: string | null;
    maxFee: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ListWithdrawalFeeRulesResponse {
    fee_rules: WithdrawalFeeRule[];
    total: number;
}

export interface UpsertWithdrawalFeeRuleRequest {
    method_type: WithdrawalMethodType;
    currency: string;
    fee_type: WithdrawalFeeType;
    flat_fee?: number;
    percentage_fee?: number;
    min_fee?: number;
    max_fee?: number;
}

export interface UpsertWithdrawalFeeRuleResponse {
    fee_rule: WithdrawalFeeRule;
}

// ============ SUBMIT REQUEST BODIES (snake_case — must match backend exactly) ============

export interface SubmitLocalBankRequest {
    merchant_id: string;
    bank_code: string;        // selected from dropdown — backend resolves bank_name automatically
    branch_code: string;
    account_number: string;
    account_key: string;
    account_name: string;
}

export interface SubmitInternationalBankRequest {
    merchant_id: string;
    bank_name: string;
    country: string;
    swift_code: string;
    routing_number?: string;
    iban: string;
    account_number: string;
    account_currency: string;
    account_name: string;
}

export interface SubmitPrepaidCardRequest {
    merchant_id: string;
    card_network: 'VISA' | 'MASTERCARD';
    cardholder_name: string;
    client_id: string;
    last_four_digits: string;
}

export interface SubmitWithdrawalMethodResponse {
    method: WithdrawalMethod;
    message: string;
}

export interface SetWithdrawalLimitRequest {
    method_type: WithdrawalMethodType;
    gateway?: WithdrawalGateway;
    currency: string;
    min_amount: number;
    max_amount?: number;
}

// ============ WITHDRAWAL TYPES ============

export type WithdrawalStatus = 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED';

export interface Withdrawal {
    id: string;
    merchantId: string;
    withdrawalMethod: WithdrawalMethodType;
    gateway: string | null;
    amount: string;
    currency: string;
    gatewayFee: string;
    platformFee: string;
    withdrawalFee: string;
    totalDeduction: string;
    recipientMsisdn: string | null;
    status: WithdrawalStatus;
    gatewayReference: string | null;
    environment: 'sandbox' | 'production';
    createdAt: string;
    updatedAt: string;
}

export interface InitiateWithdrawalRequest {
    merchant_id: string;
    withdrawal_method_id: string;
    amount: number;
    currency: string;
    environment?: string;
}

export interface WithdrawalQuoteResponse {
    amount: string;
    withdrawalMethod: WithdrawalMethodType;
    currency: string;
    gatewayFee: string;
    platformFee: string;
    withdrawalFee: string;
    totalDeduction: string;
}

export interface RawWithdrawalQuoteResponse {
    amount: string;
    withdrawal_method?: WithdrawalMethodType;
    withdrawalMethod?: WithdrawalMethodType;
    currency: string;
    gateway_fee?: string;
    gatewayFee?: string;
    platform_fee?: string;
    platformFee?: string;
    withdrawal_fee?: string;
    withdrawalFee?: string;
    total_deduction?: string;
    totalDeduction?: string;
}

export interface InitiateWithdrawalResponse {
    withdrawalId: string;
    status: WithdrawalStatus;
    withdrawalMethod: WithdrawalMethodType;
    amount: string;
    currency: string;
    gatewayFee: string;
    platformFee: string;
    withdrawalFee: string;
    totalDeduction: string;
    gatewayReference: string | null;
    createdAt: string;
}

export interface RawInitiateWithdrawalResponse {
    withdrawal_id?: string;
    withdrawalId?: string;
    status: WithdrawalStatus;
    withdrawal_method?: WithdrawalMethodType;
    withdrawalMethod?: WithdrawalMethodType;
    amount: string;
    currency: string;
    gateway_fee?: string;
    gatewayFee?: string;
    platform_fee?: string;
    platformFee?: string;
    withdrawal_fee?: string;
    withdrawalFee?: string;
    total_deduction?: string;
    totalDeduction?: string;
    gateway_reference?: string | null;
    gatewayReference?: string | null;
    created_at?: string;
    createdAt?: string;
}

export interface GetWithdrawalResponse {
    withdrawal: Withdrawal;
}

export interface ListWithdrawalsResponse {
    withdrawals: Withdrawal[];
    total: number;
}

export interface ListWithdrawalsParams {
    merchant_id?: string;
    environment?: string;
    status?: WithdrawalStatus;
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
}

// ============ MSISDN VERIFICATION TYPES ============

export interface MsisdnVerifyRequest {
    gateway: string;
    msisdn: string;
    environment?: string;
}

export interface MsisdnVerifyResponse {
    msisdn: string;
    found: boolean;
    name?: string;
    given_name?: string;
    family_name?: string;
    firstName?: string;
    lastName?: string;
    status?: string;
    gateway: string;
    displayName?: string;
    isUsable?: boolean;
}

export interface MsisdnVerifyBulkEntry {
    msisdn: string;
    gateway: string;
    amount?: string;
}

export interface MsisdnVerifyBulkRequest {
    entries: MsisdnVerifyBulkEntry[];
    environment?: string;
}

export interface MsisdnVerifyBulkValidEntry {
    msisdn: string;
    found: boolean;
    name?: string;
    given_name?: string;
    family_name?: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    status?: string;
    gateway: string;
    amount?: string;
    isUsable?: boolean;
}

export interface MsisdnVerifyBulkInvalidEntry {
    msisdn: string;
    gateway: string;
    reason: string;
    amount?: string;
}

export interface MsisdnVerifyBulkResponse {
    valid: MsisdnVerifyBulkValidEntry[];
    invalid: MsisdnVerifyBulkInvalidEntry[];
    total: number;
    validCount: number;
    invalidCount: number;
}
