"use client";

import { useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  TrendingUp,
  TrendingDown,
  Wallet,
  CheckCircle2,
  ArrowRight,
  Clock,
  DollarSign,
  MoreVertical,
  X,
  Activity,
  Loader2,
  AlertCircle,
  CreditCard,
  SendHorizonal,
  RotateCcw,
  LayoutDashboard,
} from "lucide-react";
import { useUserMerchantData } from "@/features/merchants/context/MerchantContext";
import { useEnvironment } from "@/core/environment/EnvironmentContext";
import {
  useDashboardStats,
  useRecentTransactions,
  useTopUpWallet,
  useWithdrawFromWallet,
} from "@/features/merchants/hooks/useMerchant";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

// ============================================
// COMPONENTS
// ============================================

// Withdraw Modal
function WithdrawModal({
  isOpen,
  onClose,
  merchantId,
  environment,
}: {
  isOpen: boolean;
  onClose: () => void;
  merchantId: string;
  environment: "sandbox" | "production";
}) {
  const [amount, setAmount] = useState("");
  const [recipientMsisdn, setRecipientMsisdn] = useState("");
  const [gateway, setGateway] = useState<"MTN_MOMO" | "ORANGE_MONEY">("MTN_MOMO");
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const withdrawMutation = useWithdrawFromWallet(merchantId);

  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, "");
    // If starts with country code, return as is, otherwise add 237
    if (digits.startsWith("237")) {
      return digits;
    }
    // If starts with 0, replace with 237
    if (digits.startsWith("0")) {
      return "237" + digits.substring(1);
    }
    // Otherwise, add 237 prefix
    return "237" + digits;
  };

  const validateInputs = (): boolean => {
    setError(null);

    if (!amount || parseFloat(amount) <= 0) {
      setError("Amount must be greater than 0");
      return false;
    }

    if (!recipientMsisdn || recipientMsisdn.trim().length === 0) {
      setError("Recipient phone number is required");
      return false;
    }

    const formattedPhone = formatPhoneNumber(recipientMsisdn);
    if (formattedPhone.length < 12 || formattedPhone.length > 15) {
      setError("Invalid phone number format. Use format: 237670000000");
      return false;
    }

    return true;
  };

  const handleWithdraw = async () => {
    if (!validateInputs()) {
      return;
    }

    try {
      const formattedPhone = formatPhoneNumber(recipientMsisdn);
      const result = await withdrawMutation.mutateAsync({
        gateway,
        amount: parseFloat(amount),
        currency: environment === "sandbox" ? "EUR" : "XAF",
        recipientMsisdn: formattedPhone,
        environment,
      });

      toast.success("Withdrawal initiated successfully!", {
        description: result.message,
      });

      // Reset form
      setAmount("");
      setRecipientMsisdn("");
      setError(null);
      onClose();

      // Invalidate queries to refresh dashboard data
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "transactions"] });
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } }; message?: string })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to withdraw funds";
      setError(errorMessage);
      toast.error("Withdrawal failed", {
        description: errorMessage,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-xl border border-border max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Withdraw Funds</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
            disabled={withdrawMutation.isPending}
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-900 dark:text-red-100">{error}</p>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-foreground mb-2 block">
              Gateway
            </label>
            <select
              value={gateway}
              onChange={(e) => setGateway(e.target.value as "MTN_MOMO" | "ORANGE_MONEY")}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={withdrawMutation.isPending}
            >
              <option value="MTN_MOMO">MTN Mobile Money</option>
              <option value="ORANGE_MONEY">Orange Money</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground mb-2 block">
              Withdrawal Amount ({environment === "sandbox" ? "EUR" : "FCFA"})
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError(null);
              }}
              placeholder="Enter amount"
              min="0"
              step="0.01"
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={withdrawMutation.isPending}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground mb-2 block">
              Recipient Phone Number
            </label>
            <input
              type="text"
              value={recipientMsisdn}
              onChange={(e) => {
                setRecipientMsisdn(e.target.value);
                setError(null);
              }}
              placeholder="237670000000 or 0670000000"
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={withdrawMutation.isPending}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Format: 237670000000 (E.164 format)
            </p>
          </div>

          {environment === "sandbox" && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-xs text-blue-900 dark:text-blue-100">
                <strong>Note:</strong> In sandbox mode, only EUR currency is supported.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-background border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={withdrawMutation.isPending}
            >
              Cancel
            </button>
            <button
              onClick={handleWithdraw}
              className="flex-1 px-4 py-2.5 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={withdrawMutation.isPending}
            >
              {withdrawMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Withdraw"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Top Up Modal
function TopUpModal({
  isOpen,
  onClose,
  merchantId,
  environment,
}: {
  isOpen: boolean;
  onClose: () => void;
  merchantId: string;
  environment: "sandbox" | "production";
}) {
  const [amount, setAmount] = useState("");
  const [msisdn, setMsisdn] = useState("");
  const [gateway, setGateway] = useState<"MTN_MOMO" | "ORANGE_MONEY">("MTN_MOMO");
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const topUpMutation = useTopUpWallet(merchantId);

  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, "");
    // If starts with country code, return as is, otherwise add 237
    if (digits.startsWith("237")) {
      return digits;
    }
    // If starts with 0, replace with 237
    if (digits.startsWith("0")) {
      return "237" + digits.substring(1);
    }
    // Otherwise, add 237 prefix
    return "237" + digits;
  };

  const validateInputs = (): boolean => {
    setError(null);

    if (!amount || parseFloat(amount) <= 0) {
      setError("Amount must be greater than 0");
      return false;
    }

    if (!msisdn || msisdn.trim().length === 0) {
      setError("Phone number is required");
      return false;
    }

    const formattedPhone = formatPhoneNumber(msisdn);
    if (formattedPhone.length < 12 || formattedPhone.length > 15) {
      setError("Invalid phone number format. Use format: 237670000000");
      return false;
    }

    return true;
  };

  const handleTopUp = async () => {
    if (!validateInputs()) {
      return;
    }

    try {
      const formattedPhone = formatPhoneNumber(msisdn);
      const result = await topUpMutation.mutateAsync({
        gateway,
        amount: parseFloat(amount),
        currency: environment === "sandbox" ? "EUR" : "XAF",
        msisdn: formattedPhone,
        environment,
      });

      toast.success("Top-up initiated successfully!", {
        description:
          result.message ||
          `Approve the ${result.chargedAmount?.toLocaleString() ?? parseFloat(amount).toLocaleString()} ${
            environment === "sandbox" ? "EUR" : "XAF"
          } payment on your phone to finish funding your wallet.`,
      });

      // Reset form
      setAmount("");
      setMsisdn("");
      setError(null);
      onClose();

      // Invalidate queries to refresh dashboard data
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "transactions"] });
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } }; message?: string })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to top up wallet";
      setError(errorMessage);
      toast.error("Top-up failed", {
        description: errorMessage,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-xl border border-border max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Top Up Wallet</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
            disabled={topUpMutation.isPending}
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-900 dark:text-red-100">{error}</p>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-foreground mb-2 block">
              Gateway
            </label>
            <select
              value={gateway}
              onChange={(e) => setGateway(e.target.value as "MTN_MOMO" | "ORANGE_MONEY")}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={topUpMutation.isPending}
            >
              <option value="MTN_MOMO">MTN Mobile Money</option>
              <option value="ORANGE_MONEY">Orange Money</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground mb-2 block">
              Amount ({environment === "sandbox" ? "EUR" : "FCFA"})
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError(null);
              }}
              placeholder="Enter amount"
              min="0"
              step="0.01"
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={topUpMutation.isPending}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground mb-2 block">
              Your Phone Number
            </label>
            <input
              type="text"
              value={msisdn}
              onChange={(e) => {
                setMsisdn(e.target.value);
                setError(null);
              }}
              placeholder="237670000000 or 0670000000"
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={topUpMutation.isPending}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Format: 237670000000 (E.164 format). You&apos;ll receive a payment prompt on this number.
            </p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              This top-up is initiated immediately through the dashboard. Complete the collection approval on your phone to finish funding your wallet.
            </p>
          </div>

          {environment === "sandbox" && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-xs text-blue-900 dark:text-blue-100">
                <strong>Note:</strong> In sandbox mode, only EUR currency is supported.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-background border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={topUpMutation.isPending}
            >
              Cancel
            </button>
            <button
              onClick={handleTopUp}
              className="flex-1 px-4 py-2.5 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={topUpMutation.isPending}
            >
              {topUpMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Top Up"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Icon mapping for stats
const iconMap: Record<string, typeof Wallet> = {
  "Available Balance": Wallet,
  "Total Revenue": DollarSign,
  "Transactions": Activity,
  "Success Rate": CheckCircle2,
  "Pending": Clock,
};

// Unified card style — same neutral background for all cards.
// Only the primary card (Available Balance) gets an orange left-border accent.
// Icon colours are muted for secondary cards; orange for the primary.
const cardStyle = {
  base: "bg-card rounded-lg p-3 border border-border hover:shadow-sm transition-shadow",
  primary: "bg-card rounded-lg p-3 border border-border border-l-2 border-l-orange-500 hover:shadow-sm transition-shadow",
  icon: {
    primary: "text-orange-500",
    secondary: "text-muted-foreground",
  },
};

// Which stat label is the primary (highlighted) card
const PRIMARY_STAT = "Available Balance";

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================

export default function DashboardPage() {
  const router = useRouter();
  const { merchantId } = useUserMerchantData();
  const { environment } = useEnvironment();
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [topUpModalOpen, setTopUpModalOpen] = useState(false);
  const [period] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  // Ensure environment is defined (fallback to sandbox)
  const currentEnvironment = environment || 'sandbox';

  // Fetch dashboard data
  const { data: statsData, isLoading: isLoadingStats } = useDashboardStats(
    merchantId || '',
    period
  );

  const { data: transactionsData, isLoading: isLoadingTransactions } = useRecentTransactions(
    merchantId || '',
    10,
    undefined
  );

  // Show loading state if merchant or environment is not ready
  if (!merchantId || !currentEnvironment) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400";
      case "PENDING_GATEWAY":
        return "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400";
      case "FAILED":
        return "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400";
      default:
        return "bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400";
    }
  };

  const formatAmount = (amount: number, currency: string = "XAF") => {
    // Display FCFA instead of XAF in production mode
    const displayCurrency = currency === "XAF" && currentEnvironment === "production" ? "FCFA" : currency;
    return `${amount.toLocaleString()} ${displayCurrency}`;
  };


  return (
    <div className="space-y-4 p-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Business Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitor your transactions and business performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/dashboard/withdrawals")}
            className="px-3 py-1.5 bg-orange-500 text-white rounded-md text-xs font-semibold hover:bg-orange-600 transition-colors flex items-center gap-1.5"
          >
            <ArrowDownToLine className="w-3.5 h-3.5" />
            Withdraw
          </button>
          <button
            onClick={() => {
              if (!merchantId) { toast.error("Merchant ID not found"); return; }
              setTopUpModalOpen(true);
            }}
            className="px-3 py-1.5 bg-background border border-border text-foreground rounded-md text-xs font-semibold hover:bg-muted transition-colors flex items-center gap-1.5"
          >
            <ArrowUpFromLine className="w-3.5 h-3.5" />
            Top Up
          </button>
        </div>
      </div>

      {/* SECTION 1: KEY METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {isLoadingStats ? (
          // Skeleton Loaders
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-card rounded-lg p-3 border border-border animate-pulse"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="w-8 h-8 bg-muted rounded-lg" />
                <div className="w-10 h-3 bg-muted rounded" />
              </div>
              <div className="w-20 h-2.5 bg-muted rounded mb-1.5" />
              <div className="w-28 h-5 bg-muted rounded mb-1" />
              <div className="w-16 h-2.5 bg-muted rounded" />
            </div>
          ))
        ) : (
          statsData?.stats
            .filter((stat) => stat.label !== "Pending")
            .map((stat, index) => {
              const Icon = iconMap[stat.label] || Wallet;
              const isPrimary = stat.label === PRIMARY_STAT;
              return (
                <div
                  key={index}
                  className={isPrimary ? cardStyle.primary : cardStyle.base}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-8 h-8 bg-muted/60 rounded-lg flex items-center justify-center">
                      <Icon
                        className={`w-4 h-4 ${isPrimary
                          ? cardStyle.icon.primary
                          : cardStyle.icon.secondary
                          }`}
                      />
                    </div>
                    <span
                      className={`text-[10px] font-medium flex items-center gap-0.5 ${stat.trend === "up"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                        }`}
                    >
                      {stat.trend === "up" ? (
                        <TrendingUp className="w-2.5 h-2.5" />
                      ) : (
                        <TrendingDown className="w-2.5 h-2.5" />
                      )}
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    {stat.label}
                  </p>
                  <p className={`text-2xl font-bold mb-0.5 ${isPrimary ? "text-orange-500" : "text-foreground"
                    }`}>
                    {stat.value} {stat.currency}
                  </p>
                  {stat.subtitle && (
                    <p className="text-[10px] text-muted-foreground">{stat.subtitle}</p>
                  )}
                </div>
              );
            })
        )}
      </div>

      {/* SECTION 2: TWO-COLUMN LOWER LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

        {/* LEFT — Recent Transactions (2/3 width) */}
        <div className="lg:col-span-2 bg-card rounded-lg border border-border">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
            <button
              onClick={() => router.push('/dashboard/transactions')}
              className="text-xs text-orange-600 dark:text-orange-400 hover:underline font-medium flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-2 px-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Date</th>
                  <th className="text-left py-2 px-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Transaction ID</th>
                  <th className="text-left py-2 px-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Status</th>
                  <th className="text-left py-2 px-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Amount</th>
                  <th className="text-left py-2 px-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Gateway</th>
                  <th className="py-2 px-3" />
                </tr>
              </thead>
              <tbody>
                {isLoadingTransactions ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      {Array.from({ length: 6 }).map((__, j) => (
                        <td key={j} className="py-2 px-3">
                          <div className="h-2.5 bg-muted rounded animate-pulse w-20" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : transactionsData?.transactions && transactionsData.transactions.length > 0 ? (
                  transactionsData.transactions.slice(0, 8).map((tx) => (
                    <tr key={tx.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-2 px-3">
                        <div className="text-xs text-foreground font-medium">{tx.date}</div>
                        <div className="text-[10px] text-muted-foreground">{tx.time}</div>
                      </td>
                      <td className="py-2 px-3">
                        <span className="text-[10px] text-foreground font-mono">{tx.id.slice(0, 16)}...</span>
                      </td>
                      <td className="py-2 px-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${getStatusColor(tx.status)}`}>
                          <span className={`w-1 h-1 rounded-full ${tx.status === "SUCCESS" ? "bg-green-500"
                            : tx.status === "PENDING_GATEWAY" ? "bg-orange-500"
                              : "bg-red-500"
                            }`} />
                          {tx.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <div className="text-xs text-foreground font-semibold">{formatAmount(tx.amount, tx.currency)}</div>
                        <div className="text-[10px] text-muted-foreground">Fee: {formatAmount(tx.fees, tx.currency)}</div>
                      </td>
                      <td className="py-2 px-3">
                        <span className="text-[10px] text-foreground">{tx.gateway.replace(/_/g, " ")}</span>
                      </td>
                      <td className="py-2 px-3">
                        <button className="p-0.5 hover:bg-muted rounded transition-colors">
                          <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-10 text-center">
                      <p className="text-xs text-muted-foreground">No transactions found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT — Quick Actions + Navigation (1/3 width) */}
        <div className="flex flex-col gap-3">

          {/* Quick Actions */}
          <div className="bg-card rounded-lg border border-border p-3">
            <h3 className="text-lg font-semibold text-foreground mb-2">Quick Actions</h3>
            <div className="space-y-1.5">
              <button
                onClick={() => router.push("/dashboard/withdrawals")}
                className="w-full flex items-center gap-3 px-3 py-2 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors group"
              >
                <div className="w-7 h-7 bg-orange-500 rounded-md flex items-center justify-center shrink-0">
                  <ArrowDownToLine className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-foreground">Withdraw Funds</p>
                  <p className="text-[10px] text-muted-foreground">Send to mobile money</p>
                </div>
              </button>

              <button
                onClick={() => {
                  if (!merchantId) { toast.error("Merchant ID not found"); return; }
                  setTopUpModalOpen(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 bg-background border border-border rounded-lg hover:bg-muted transition-colors"
              >
                <div className="w-7 h-7 bg-muted rounded-md flex items-center justify-center shrink-0">
                  <ArrowUpFromLine className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-foreground">Top Up Wallet</p>
                  <p className="text-[10px] text-muted-foreground">Add funds to balance</p>
                </div>
              </button>
            </div>
          </div>

          {/* Navigate */}
          <div className="bg-card rounded-lg border border-border p-3">
            <h3 className="text-lg font-semibold text-foreground mb-1.5">Navigate</h3>
            <div className="space-y-1">
              {[
                { label: "Collections", sub: "Incoming payments", icon: CreditCard, href: "/dashboard/collections" },
                { label: "Payouts", sub: "Send to customers", icon: SendHorizonal, href: "/dashboard/payouts" },
                { label: "Refunds", sub: "Process refunds", icon: RotateCcw, href: "/dashboard/refunds" },
                { label: "Settlements", sub: "View settlements", icon: LayoutDashboard, href: "/dashboard/settlements" },
              ].map(({ label, sub, icon: Icon, href }) => (
                <button
                  key={label}
                  onClick={() => router.push(href)}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-muted transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <div className="text-left">
                      <p className="text-xs font-medium text-foreground">{label}</p>
                      <p className="text-[10px] text-muted-foreground">{sub}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>


      {/* MODALS */}
      {merchantId && (
        <>
          <WithdrawModal
            isOpen={withdrawModalOpen}
            onClose={() => setWithdrawModalOpen(false)}
            merchantId={merchantId}
            environment={environment}
          />
          <TopUpModal
            isOpen={topUpModalOpen}
            onClose={() => setTopUpModalOpen(false)}
            merchantId={merchantId}
            environment={environment}
          />
        </>
      )}
    </div>
  );
}
