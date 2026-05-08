/**
 * Wallet Balance Summary
 * Comprehensive balance overview for dashboard display
 */
export interface WalletSummary {
    /** Current total balance across all currencies */
    available: number;
    /** Amount in pending/processing transactions */
    pending: number;
    /** Lifetime collections (all-time) */
    totalCollected: number;
    /** Lifetime withdrawals (all-time) */
    totalWithdrawn: number;
    /** Growth trend vs previous period (e.g., "+5.2%") */
    trend: string;
    /** Human-readable last activity time (e.g., "2 mins ago") */
    lastUpdated: string;
}

/**
 * Wallet Activity Transaction Type
 */
export type WalletActivityType = "credit" | "withdrawal" | "debit" | "fee";

/**
 * Wallet Activity Transaction Status
 */
export type WalletActivityStatus = "completed" | "pending" | "failed";

/**
 * Wallet Activity Item
 * Individual transaction in the activity feed
 */
export interface WalletActivity {
    /** Transaction date (MMM DD format) */
    date: string;
    /** Transaction time (HH:MM format) */
    time: string;
    /** Transaction type */
    type: WalletActivityType;
    /** Human-readable description */
    label: string;
    /** Transaction reference ID */
    reference: string;
    /** Transaction amount (positive for credits, negative for debits/withdrawals) */
    amount: number;
    /** Balance after this transaction */
    balanceAfter: number;
    /** Transaction status */
    status: WalletActivityStatus;
}

/**
 * Wallet Activity Query Parameters
 */
export interface WalletActivityParams {
    /** Number of activities to return (1-100, default: 50) */
    limit?: number;
}
