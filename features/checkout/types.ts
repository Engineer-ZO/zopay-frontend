export type CheckoutGateway = "MTN_MOMO" | "ORANGE_MONEY";
export type CheckoutEnvironment = "sandbox" | "production";
export type CheckoutStatus = "PENDING" | "PROCESSING" | "PAID" | "FAILED" | "EXPIRED" | "CANCELLED";

export interface CheckoutSession {
  id: string;
  merchantName: string;
  merchantLogoUrl: string | null;
  checkoutUrl: string;
  amount: string;
  currency: string;
  description: string | null;
  gateways: CheckoutGateway[];
  environment: CheckoutEnvironment;
  status: CheckoutStatus;
  payable: boolean;
  metadata: Record<string, unknown> | null;
  selectedGateway: CheckoutGateway | null;
  payerName: string | null;
  payerEmail: string | null;
  payerMsisdn: string | null;
  payerComment: string | null;
  transactionId: string | null;
  gatewayReference: string | null;
  failureReason: string | null;
  redirectUrl: string | null;
  expiresAt: string;
  paidAt?: string | null;
}

export interface GetCheckoutSessionResponse {
  checkoutSession: CheckoutSession;
}

export interface PayCheckoutSessionRequest {
  gateway: CheckoutGateway;
  payer: {
    msisdn: string;
    name?: string;
    email?: string;
  };
  comment?: string;
  idempotencyKey?: string;
}

export interface PayCheckoutSessionResponse {
  checkoutSession: Pick<
    CheckoutSession,
    | "id"
    | "status"
    | "selectedGateway"
    | "payerName"
    | "payerEmail"
    | "payerMsisdn"
    | "payerComment"
    | "transactionId"
    | "gatewayReference"
    | "redirectUrl"
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

export interface GetCheckoutSessionStatusResponse {
  checkoutSession: Pick<
    CheckoutSession,
    "id" | "status" | "transactionId" | "gatewayReference" | "failureReason" | "redirectUrl"
  > & {
    paidAt?: string | null;
  };
}
