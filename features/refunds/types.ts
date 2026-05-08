// Refund Types

export interface RefundTransaction {
  id: string;
  amount: string;
  currency: string;
  gateway: string;
  type: string;
  gatewayReference: string | null;
  status: string;
  refundedAmount: string;
  fullyRefunded: boolean;
  createdAt: string;
  completedAt: string | null;
}

export interface RefundCustomer {
  msisdn: string | null;
}

export interface RefundPayout {
  id: string;
  gatewayFee: string;
  platformFee: string;
  totalCost: string;
  status: string;
  failureReason: string | null;
  completedAt: string | null;
}

export interface RefundMerchant {
  id: string;
  name: string;
  businessName: string;
}

export interface Refund {
  id: string;
  amount: string;
  method: "PAYOUT";
  status: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED";
  reason: string | null;
  gatewayReference: string | null;
  createdAt: string;
  updatedAt: string;
  transaction: RefundTransaction;
  customer: RefundCustomer;
  payout: RefundPayout | null;
  merchant?: RefundMerchant; // Admin only
}

export interface ListRefundsResponse {
  refunds: Refund[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface GetRefundDetailsResponse {
  refund: Refund;
}
