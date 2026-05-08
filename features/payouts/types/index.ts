// ============ CSV UPLOAD ============

export interface CsvUploadResponse {
    fileId: string;
    filename: string;
    size: number;
    uploadedAt: string;
}

export type PayoutGateway = 'MTN_MOMO' | 'ORANGE_MONEY';
export type PayoutEnvironment = 'sandbox' | 'production';
export type PayoutStatus = 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';

export interface CreatePayoutQuoteRequest {
    gateway: PayoutGateway;
    amount: string;
    currency: string;
    recipientMsisdn: string;
    reference?: string;
    description?: string;
    environment?: PayoutEnvironment;
}

export interface PayoutQuote {
    id: string;
    merchantId: string;
    gateway: PayoutGateway;
    transactionType: 'DISBURSEMENT';
    amount: string;
    currency: string;
    gatewayFee: string;
    platformFee: string;
    totalAmount: string;
    netToMerchant: string;
    recipientName: string | null;
    expiresAt: string;
    status: string;
}

export interface CreatePayoutQuoteResponse {
    quote: PayoutQuote;
}

export interface ExecutePayoutRequest {
    quoteId: string;
}

export interface Payout {
    id: string;
    merchantId?: string;
    gateway: PayoutGateway;
    amount: string;
    currency: string;
    recipientMsisdn: string;
    recipientName: string | null;
    reference?: string | null;
    description?: string | null;
    gatewayFee: string;
    platformFee: string;
    totalDeduction: string;
    gatewayReference: string | null;
    status: PayoutStatus | string;
    failureReason?: string | null;
    createdAt: string;
    updatedAt?: string;
    completedAt?: string | null;
}

export interface ExecutePayoutResponse {
    payout: Payout;
}

export interface ListPayoutsRequest {
    status?: string;
    gateway?: PayoutGateway;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    environment?: PayoutEnvironment;
}

export interface ListPayoutsResponse {
    payouts: Payout[];
    total: number;
    page?: number;
    limit?: number;
}

// ============ PREVIEW ============

export interface BulkPreviewRow {
    rowIndex?: number;
    msisdn: string;
    gateway: string;
    name?: string | null;
    recipientName?: string | null;
    displayName?: string | null;
    given_name?: string | null;
    family_name?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    status?: string;
    amount: string;
    currency: string;
    description?: string;
}

export interface BulkUnverifiedRow {
    rowIndex?: number;
    msisdn: string;
    gateway?: string;
    reason: string;
    amount?: string;
    currency?: string;
    status?: string;
    name?: string | null;
    recipientName?: string | null;
    displayName?: string | null;
    given_name?: string | null;
    family_name?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    description?: string;
}

export interface BulkInvalidRow {
    rowIndex?: number;
    msisdn: string;
    gateway?: string;
    reason: string;
    amount?: string;
    currency?: string;
}

export interface BulkPreviewResponse {
    batchId: string;
    gateway: string;
    currency: string;
    totalRows: number;
    validCount: number;
    unverifiedCount: number;
    executableCount: number;
    invalidCount: number;
    totalAmount: string;
    totalAmountWithUnverified: string;
    netToMerchant?: string | null;
    expiresAt: string;
    valid: BulkPreviewRow[];
    unverified: BulkUnverifiedRow[];
    invalid: BulkInvalidRow[];
}

// ============ CSV PREVIEW REQUEST ============

export interface CsvPreviewRequest {
    fileId: string;
    gateway?: PayoutGateway;
    currency?: string;
    environment?: PayoutEnvironment;
}

// ============ MANUAL PREVIEW REQUEST ============

export interface ManualPreviewRow {
    rowIndex?: number;
    msisdn: string;
    gateway: PayoutGateway;
    amount: string;
    currency?: string;
    description?: string;
}

export interface ManualPreviewRequest {
    rows: ManualPreviewRow[];
    defaultCurrency?: string;
    environment?: PayoutEnvironment;
}

// ============ CONFIRM ============

export interface BulkConfirmRequest {
    batchId: string;
    memo?: string;
    includeUnverified?: boolean;
}

export interface BulkConfirmResponse {
    batchId: string;
    status: 'PROCESSING' | 'COMPLETED' | 'AWAITING_APPROVAL';
    memo?: string;
    executionSummary: {
        successCount: number;
        failedCount: number;
        payoutIds: string[];
        errors: string[];
    } | null;
}

// ============ BATCH STATUS ============

export type BatchStatus =
    | 'PENDING'
    | 'CONFIRMED'
    | 'PROCESSING'
    | 'COMPLETED'
    | 'AWAITING_APPROVAL'
    | 'CANCELLED';

export interface BatchDetails {
    id: string;
    status: BatchStatus;
    gateway: string;
    currency: string;
    totalRows: number;
    validCount: number;
    unverifiedCount: number;
    executableCount: number;
    invalidCount: number;
    totalAmount: string;
    totalAmountWithUnverified: string;
    netToMerchant: string;
    memo?: string;
    validRows: BulkPreviewRow[];
    unverifiedRows: BulkUnverifiedRow[];
    invalidRows: BulkInvalidRow[];
    items?: BulkPayoutItem[];
    successCount?: number;
    failedCount?: number;
    confirmedAt?: string;
    executedAt?: string;
    expiresAt: string;
}

export interface BulkPayoutItem {
    id: string;
    batchId: string;
    merchantId: string;
    payoutId: string | null;
    rowIndex: number;
    gateway: PayoutGateway;
    amount: string;
    currency: string;
    recipientMsisdn: string;
    recipientName: string | null;
    description: string | null;
    status: string;
    lookupStatus: string;
    gatewayReference: string | null;
    failureReason: string | null;
    createdAt: string;
    startedAt: string | null;
    completedAt: string | null;
}
