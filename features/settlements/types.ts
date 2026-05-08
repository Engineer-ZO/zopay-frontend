// Merchant Settlement Types
export interface Settlement {
  id: string;
  merchantId: string;
  periodStart: string;
  periodEnd: string;
  totalCollections: string;
  totalPayouts: string;
  totalRefunds: string;
  totalFees: string;
  netAmount: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  statementUrl?: string;
  bankTransferReference?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SettlementItem {
  id: string;
  transactionId: string;
  type: "COLLECTION" | "PAYOUT" | "REFUND";
  amount: string;
  fees: string;
  createdAt: string;
}

export interface SettlementDetails {
  settlement: Settlement;
  items: SettlementItem[];
}

export interface ListSettlementsResponse {
  settlements: Settlement[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface GenerateSettlementRequest {
  periodStart: string;
  periodEnd: string;
}

export interface GenerateSettlementResponse {
  settlement: Settlement;
}

export interface GetSettlementDetailsResponse {
  settlement: Settlement;
  items: SettlementItem[];
}

export interface GetStatementResponse {
  statementUrl: string;
}

export interface SetSettlementFrequencyRequest {
  frequency: "DAILY" | "WEEKLY" | null;
}

export interface SetSettlementFrequencyResponse {
  message: string;
  settlementFrequency: "DAILY" | "WEEKLY" | null;
}

// Admin Settlement Types
export interface CompleteSettlementRequest {
  bankTransferReference?: string;
}

export interface CompleteSettlementResponse {
  settlement: {
    id: string;
    status: "COMPLETED";
    bankTransferReference?: string;
  };
}

// Reconciliation Types
export interface ReconciliationQueueItem {
  id: string;
  gateway: "MTN_MOMO" | "ORANGE_MONEY";
  gatewayReference: string;
  amount: string;
  msisdn: string;
  timestamp: string;
  matchStatus: "MISSING_IN_ZITOPAY" | "MISSING_IN_GATEWAY" | "AMOUNT_MISMATCH";
  zitopayTransactionId: string | null;
  assignedTo: string | null;
  resolved: boolean;
  createdAt: string;
}

export interface ListReconciliationQueueResponse {
  items: ReconciliationQueueItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface LinkTransactionRequest {
  transactionId: string;
  notes?: string;
}

export interface LinkTransactionResponse {
  item: {
    id: string;
    resolved: boolean;
    zitopayTransactionId: string;
    resolution?: string;
  };
}

export interface MarkResolvedRequest {
  notes: string;
}

export interface MarkResolvedResponse {
  item: {
    id: string;
    resolved: boolean;
    resolution: string;
  };
}

export interface ReconcileFileResponse {
  fileId: string;
  matched: number;
  missingInZitopay: number;
  missingInGateway: number;
  amountMismatch: number;
}
