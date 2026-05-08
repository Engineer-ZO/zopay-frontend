export type PaymentLinkGateway = "MTN_MOMO" | "ORANGE_MONEY";
export type PaymentLinkEnvironment = "sandbox" | "production";
export type PaymentLinkType = "MULTI_USE" | "ONE_TIME";
export type PaymentLinkStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";
/** FIXED / PAYER_CHOICE / PARTIAL (per-payer target + instalments; payer email on unified `/pay`). */
export type PaymentLinkAmountMode = "FIXED" | "PAYER_CHOICE" | "PARTIAL";

export type PartialMinimumScope = "EVERY_INSTALLMENT" | "FIRST_PAYMENT_ONLY";

export type PartialReminderFrequency = "NONE" | "DAILY" | "WEEKLY" | "MONTHLY" | "EVERY_N_DAYS";

/** Nested `partial` on payment link (public + merchant). */
export interface PaymentLinkPartialConfig {
  minimumAmount: string | null;
  minimumScope: PartialMinimumScope | string;
  deadlineAt: string | null;
  collectionPaused: boolean;
  reminderFrequency: string;
  reminderEveryNDays: number | null;
  notifyMerchantOnInstallment: boolean;
}

export interface PaymentLink {
  id: string;
  merchantId: string;
  slug: string;
  title: string;
  description: string | null;
  /** Omitted on older API responses; treat as FIXED. */
  amountMode?: PaymentLinkAmountMode;
  /** Per-payer target for PARTIAL; null for PAYER_CHOICE. */
  amount: string | null;
  suggestedAmounts?: number[] | null;
  /** Present when `amountMode === 'PARTIAL'`. */
  partial?: PaymentLinkPartialConfig | null;
  currency: string;
  gateways: PaymentLinkGateway[];
  environment: PaymentLinkEnvironment;
  status: PaymentLinkStatus;
  linkType: PaymentLinkType;
  maxUses: number | null;
  pendingCount: number;
  usedCount: number;
  successUrl: string | null;
  cancelUrl: string | null;
  metadata: Record<string, unknown> | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  publicPath: string;
}

/**
 * Create body: FIXED requires amount; PAYER_CHOICE omits amount; PARTIAL requires amount + partial_* fields and MULTI_USE.
 */
export interface CreatePaymentLinkRequest {
  title: string;
  currency: string;
  amount?: string;
  amountMode?: PaymentLinkAmountMode;
  suggestedAmounts?: number[];
  partialMinimumAmount?: string;
  partialMinimumScope?: PartialMinimumScope;
  partialDeadlineAt?: string | null;
  partialReminderFrequency?: PartialReminderFrequency;
  partialReminderEveryNDays?: number;
  partialNotifyMerchantOnInstallment?: boolean;
  description?: string;
  gateways?: PaymentLinkGateway[];
  environment?: PaymentLinkEnvironment;
  linkType?: PaymentLinkType;
  maxUses?: number | null;
  expiresAt?: string | null;
  successUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface CreatePaymentLinkResponse {
  paymentLink: PaymentLink;
}

export interface ListPaymentLinksResponse {
  paymentLinks: Array<
    Pick<
      PaymentLink,
      | "id"
      | "slug"
      | "title"
      | "amountMode"
      | "amount"
      | "suggestedAmounts"
      | "partial"
      | "currency"
      | "status"
      | "linkType"
      | "pendingCount"
      | "usedCount"
      | "maxUses"
      | "publicPath"
    > & {
      expiresAt?: string | null;
      createdAt?: string;
      updatedAt?: string;
    }
  >;
}

export interface GetPaymentLinkResponse {
  paymentLink: PaymentLink;
}

export interface UpdatePaymentLinkRequest {
  title?: string;
  description?: string;
  status?: PaymentLinkStatus;
  expiresAt?: string | null;
  successUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, unknown> | null;
  partialDeadlineAt?: string | null;
  partialCollectionPaused?: boolean;
  partialReminderFrequency?: PartialReminderFrequency;
  partialReminderEveryNDays?: number | null;
  partialNotifyMerchantOnInstallment?: boolean;
}

export interface UpdatePaymentLinkResponse {
  paymentLink: Partial<PaymentLink> & { id: string };
}

export interface PaymentLinkTransaction {
  transactionId: string;
  quoteId?: string;
  gateway: PaymentLinkGateway;
  transactionType: "COLLECTION";
  amount: string;
  currency: string;
  environment: PaymentLinkEnvironment;
  status: string;
  gatewayReference: string | null;
  failureReason: string | null;
  correlationId: string;
  createdAt: string;
  completedAt: string | null;
  payerName?: string | null;
  payerEmail?: string | null;
  payerMsisdn?: string | null;
  payerComment?: string | null;
  payeeName?: string | null;
  payeeEmail?: string | null;
  payeeMsisdn?: string | null;
  comment?: string | null;
}

export interface ListPaymentLinkTransactionsResponse {
  transactions: PaymentLinkTransaction[];
}

export interface PublicPaymentLink
  extends Omit<PaymentLink, "merchantId" | "publicPath" | "metadata" | "createdAt" | "updatedAt"> {
  merchantName: string;
  merchantLogoUrl: string | null;
  payable: boolean;
}

export interface GetPublicPaymentLinkResponse {
  paymentLink: PublicPaymentLink;
}

/**
 * Unified pay body for FIXED / PAYER_CHOICE / PARTIAL.
 * For **PARTIAL**, `amount` and `payer.email` are required (same `POST …/pay` as other modes).
 */
export interface PayPublicPaymentLinkRequest {
  gateway: PaymentLinkGateway;
  payer: {
    msisdn: string;
    name?: string;
    email?: string;
  };
  amount?: string | number;
  comment?: string;
  idempotencyKey?: string;
}

/** True when the public link should use the PARTIAL instalment checkout (not FIXED/PAYER_CHOICE). */
export function isPartialPaymentLinkPublic(link: {
  amountMode?: string | null;
  partial?: unknown;
}): boolean {
  const mode = (link.amountMode ?? "").toString().trim().toUpperCase();
  if (mode === "PARTIAL") return true;
  if (link.partial != null && typeof link.partial === "object" && Object.keys(link.partial as object).length > 0) {
    return true;
  }
  return false;
}

export interface PayPublicPaymentLinkResponse {
  paymentLink: Pick<
    PaymentLink,
    "id" | "slug" | "title" | "amountMode" | "amount" | "suggestedAmounts" | "currency" | "pendingCount" | "usedCount"
  >;
  quote: {
    quoteId: string;
    amount: string;
    totalAmount: string;
    currency: string;
    gatewayFee: string;
    platformFee: string;
    netToMerchant: string;
    expiresAt: string;
  };
  transaction: {
    transactionId: string;
    status: string;
    gatewayReference: string | null;
    correlationId: string;
    payerName?: string | null;
    payerEmail?: string | null;
    payerMsisdn?: string | null;
    payerComment?: string | null;
  };
}

export interface GetPublicPaymentLinkTransactionStatusResponse {
  paymentLink: {
    id: string;
    slug: string;
    title: string;
    merchantName: string;
    merchantLogoUrl?: string | null;
    successUrl: string | null;
    cancelUrl: string | null;
  };
  transaction: {
    transactionId: string;
    status: string;
    amount: string;
    totalAmount?: string;
    currency: string;
    gateway: PaymentLinkGateway;
    failureReason: string | null;
    correlationId: string;
    createdAt: string;
    completedAt: string | null;
    payerName?: string | null;
    payerEmail?: string | null;
    payerMsisdn?: string | null;
    payerComment?: string | null;
    payeeName?: string | null;
    payeeEmail?: string | null;
    payeeMsisdn?: string | null;
    comment?: string | null;
  };
}

// --- Partial payment links (merchant) ---

export interface PartialPlanMerchantRow {
  planId: string;
  payerEmail: string;
  verified: boolean;
  totalPaid: string;
  firstSuccessfulInstallmentRecorded: boolean;
  updatedAt: string;
}

export interface ListPartialPlansResponse {
  paymentLinkId: string;
  targetAmountPerPayer: string;
  currency: string;
  plans: PartialPlanMerchantRow[];
}
