/**
 * Wallet Feature Module
 * 
 * This module provides wallet functionality including:
 * - Balance summary
 * - Transaction activity
 * - Real-time updates
 */

// Types
export type {
    WalletSummary,
    WalletActivity,
    WalletActivityType,
    WalletActivityStatus,
    WalletActivityParams,
} from "./types";

// API
export { walletApi } from "./api";

// Hooks
export { useWalletSummary, useWalletActivity } from "./hooks/use-wallet";
