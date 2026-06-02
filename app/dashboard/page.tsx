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
  Zap,
  Shield,
  Sparkles,
  Copy,
  ExternalLink,
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
    const digits = phone.replace(/\D/g, "");
    if (digits.startsWith("237")) return digits;
    if (digits.startsWith("0")) return "237" + digits.substring(1);
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
    if (!validateInputs()) return;
    try {
      const formattedPhone = formatPhoneNumber(recipientMsisdn);
      const result = await withdrawMutation.mutateAsync({
        gateway,
        amount: parseFloat(amount),
        currency: environment === "sandbox" ? "EUR" : "XAF",
        recipientMsisdn: formattedPhone,
        environment,
      });
      toast.success("Withdrawal initiated successfully!", { description: result.message });
      setAmount("");
      setRecipientMsisdn("");
      setError(null);
      onClose();
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "transactions"] });
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } }; message?: string })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to withdraw funds";
      setError(errorMessage);
      toast.error("Withdrawal failed", { description: errorMessage });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scaleIn border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-md">
              <ArrowDownToLine className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Withdraw Funds</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            disabled={withdrawMutation.isPending}
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-5">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-900 dark:text-red-100">{error}</p>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Select Gateway
            </label>
            <select
              value={gateway}
              onChange={(e) => setGateway(e.target.value as "MTN_MOMO" | "ORANGE_MONEY")}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              disabled={withdrawMutation.isPending}
            >
              <option value="MTN_MOMO">MTN Mobile Money</option>
              <option value="ORANGE_MONEY">Orange Money</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Amount ({environment === "sandbox" ? "EUR" : "FCFA"})
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setError(null); }}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                disabled={withdrawMutation.isPending}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Recipient Phone Number
            </label>
            <input
              type="text"
              value={recipientMsisdn}
              onChange={(e) => { setRecipientMsisdn(e.target.value); setError(null); }}
              placeholder="237670000000 or 0670000000"
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              disabled={withdrawMutation.isPending}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Format: 237670000000 (E.164 format)</p>
          </div>

          {environment === "sandbox" && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
              <p className="text-xs text-blue-800 dark:text-blue-200 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <strong>Sandbox Mode:</strong> Only EUR currency is supported
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
              disabled={withdrawMutation.isPending}
            >
              Cancel
            </button>
            <button
              onClick={handleWithdraw}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-rose-700 transition-all shadow-lg shadow-red-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
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
    const digits = phone.replace(/\D/g, "");
    if (digits.startsWith("237")) return digits;
    if (digits.startsWith("0")) return "237" + digits.substring(1);
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
    if (!validateInputs()) return;
    try {
      const formattedPhone = formatPhoneNumber(msisdn);
      const result = await topUpMutation.mutateAsync({
        gateway,
        amount: parseFloat(amount),
        currency: environment === "sandbox" ? "EUR" : "XAF",
        msisdn: formattedPhone,
        environment,
      });
      toast.success("Top-up initiated successfully!", { description: result.message });
      setAmount("");
      setMsisdn("");
      setError(null);
      onClose();
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "transactions"] });
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } }; message?: string })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to top up wallet";
      setError(errorMessage);
      toast.error("Top-up failed", { description: errorMessage });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scaleIn border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-md">
              <ArrowUpFromLine className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Top Up Wallet</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            disabled={topUpMutation.isPending}
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-5">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-900 dark:text-red-100">{error}</p>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Select Gateway
            </label>
            <select
              value={gateway}
              onChange={(e) => setGateway(e.target.value as "MTN_MOMO" | "ORANGE_MONEY")}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              disabled={topUpMutation.isPending}
            >
              <option value="MTN_MOMO">MTN Mobile Money</option>
              <option value="ORANGE_MONEY">Orange Money</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Amount ({environment === "sandbox" ? "EUR" : "FCFA"})
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setError(null); }}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                disabled={topUpMutation.isPending}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Your Phone Number
            </label>
            <input
              type="text"
              value={msisdn}
              onChange={(e) => { setMsisdn(e.target.value); setError(null); }}
              placeholder="237670000000 or 0670000000"
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              disabled={topUpMutation.isPending}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Format: 237670000000 (E.164 format). You'll receive a payment prompt on this number.
            </p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
            <p className="text-xs text-amber-800 dark:text-amber-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Complete the collection approval on your phone to finish funding your wallet.
            </p>
          </div>

          {environment === "sandbox" && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
              <p className="text-xs text-blue-800 dark:text-blue-200 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <strong>Sandbox Mode:</strong> Only EUR currency is supported
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
              disabled={topUpMutation.isPending}
            >
              Cancel
            </button>
            <button
              onClick={handleTopUp}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
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

// Metric Card Component
function MetricCard({ stat, isPrimary }: { stat: any; isPrimary: boolean }) {
  const iconMap: Record<string, any> = {
    "Available Balance": Wallet,
    "Total Revenue": DollarSign,
    "Transactions": Activity,
    "Success Rate": CheckCircle2,
  };
  const Icon = iconMap[stat.label] || Wallet;
  const isUp = stat.trend === "up";

  return (
    <div className={`group relative overflow-hidden bg-white dark:bg-gray-900 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl ${isPrimary 
      ? 'border-l-4 border-l-red-500 shadow-md' 
      : 'border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
    }`}>
      {/* Animated gradient background on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${isPrimary ? 'from-red-50 to-transparent' : 'from-gray-50 to-transparent'} dark:from-gray-800/50 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPrimary ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
            <Icon className={`w-5 h-5 ${isPrimary ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`} />
          </div>
          <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
            isUp 
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {stat.change}
          </span>
        </div>
        
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
          {stat.label}
        </p>
        
        <p className={`text-3xl font-bold mb-1 ${isPrimary ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
          {stat.value} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">{stat.currency}</span>
        </p>
        
        {stat.subtitle && (
          <p className="text-[11px] text-gray-500 dark:text-gray-400">{stat.subtitle}</p>
        )}
      </div>
    </div>
  );
}

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

  const currentEnvironment = environment || 'sandbox';

  const { data: statsData, isLoading: isLoadingStats } = useDashboardStats(
    merchantId || '',
    period
  );

  const { data: transactionsData, isLoading: isLoadingTransactions } = useRecentTransactions(
    merchantId || '',
    10,
    undefined
  );

  if (!merchantId || !currentEnvironment) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
      case "PENDING_GATEWAY":
        return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400";
      case "FAILED":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400";
    }
  };

  const formatAmount = (amount: number, currency: string = "XAF") => {
    const displayCurrency = currency === "XAF" && currentEnvironment === "production" ? "FCFA" : currency;
    return `${amount.toLocaleString()} ${displayCurrency}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="space-y-6 p-6">
        {/* HEADER SECTION */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-8 bg-gradient-to-b from-red-500 to-rose-500 rounded-full"></div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                Business Dashboard
              </h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 ml-3">
              Monitor your transactions and business performance
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 capitalize">
                  {currentEnvironment} Mode
                </span>
              </div>
            </div>
            <button
              onClick={() => router.push("/dashboard/withdrawals")}
              className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl text-sm font-semibold hover:from-red-700 hover:to-rose-700 transition-all shadow-lg shadow-red-500/25 flex items-center gap-2"
            >
              <ArrowDownToLine className="w-4 h-4" />
              Withdraw
            </button>
            <button
              onClick={() => {
                if (!merchantId) { toast.error("Merchant ID not found"); return; }
                setTopUpModalOpen(true);
              }}
              className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2 shadow-sm"
            >
              <ArrowUpFromLine className="w-4 h-4" />
              Top Up
            </button>
          </div>
        </div>

        {/* KEY METRICS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {isLoadingStats ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 animate-pulse">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                  <div className="w-12 h-5 bg-gray-200 dark:bg-gray-700 rounded-full" />
                </div>
                <div className="w-24 h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="w-32 h-7 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
                <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            ))
          ) : (
            statsData?.stats
              .filter((stat) => stat.label !== "Pending")
              .map((stat, index) => (
                <MetricCard key={index} stat={stat} isPrimary={stat.label === "Available Balance"} />
              ))
          )}
        </div>

        {/* TWO-COLUMN LOWER LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT - Recent Transactions */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
              </div>
              <button
                onClick={() => router.push('/dashboard/transactions')}
                className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium flex items-center gap-1 transition-colors"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Transaction ID</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Gateway</th>
                    <th className="py-3 px-6"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {isLoadingTransactions ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        {Array.from({ length: 6 }).map((__, j) => (
                          <td key={j} className="py-3 px-6">
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : transactionsData?.transactions && transactionsData.transactions.length > 0 ? (
                    transactionsData.transactions.slice(0, 8).map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="py-3 px-6">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{tx.date}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{tx.time}</div>
                        </td>
                        <td className="py-3 px-6">
                          <span className="text-xs font-mono text-gray-600 dark:text-gray-400">{tx.id.slice(0, 16)}...</span>
                        </td>
                        <td className="py-3 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              tx.status === "SUCCESS" ? "bg-green-500" :
                              tx.status === "PENDING_GATEWAY" ? "bg-amber-500" : "bg-red-500"
                            }`} />
                            {tx.status.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="py-3 px-6">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">{formatAmount(tx.amount, tx.currency)}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Fee: {formatAmount(tx.fees, tx.currency)}</div>
                        </td>
                        <td className="py-3 px-6">
                          <span className="text-xs text-gray-600 dark:text-gray-400">{tx.gateway.replace(/_/g, " ")}</span>
                        </td>
                        <td className="py-3 px-6">
                          <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Activity className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">No transactions found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT - Quick Actions & Navigation */}
          <div className="flex flex-col gap-5">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => router.push("/dashboard/withdrawals")}
                  className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-red-50 to-transparent dark:from-red-900/10 rounded-xl border border-red-100 dark:border-red-800/50 hover:from-red-100 dark:hover:from-red-900/20 transition-all group"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-md">
                    <ArrowDownToLine className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Withdraw Funds</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Send to mobile money</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" />
                </button>

                <button
                  onClick={() => {
                    if (!merchantId) { toast.error("Merchant ID not found"); return; }
                    setTopUpModalOpen(true);
                  }}
                  className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-transparent dark:from-green-900/10 rounded-xl border border-green-100 dark:border-green-800/50 hover:from-green-100 dark:hover:from-green-900/20 transition-all group"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-md">
                    <ArrowUpFromLine className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Top Up Wallet</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Add funds to balance</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-green-500 transition-colors" />
                </button>
              </div>
            </div>

            {/* Navigation */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                  <LayoutDashboard className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Navigation</h3>
              </div>
              
              <div className="space-y-1">
                {[
                  { label: "Collections", sub: "Incoming payments", icon: CreditCard, href: "/dashboard/collections", color: "blue" },
                  { label: "Payouts", sub: "Send to customers", icon: SendHorizonal, href: "/dashboard/payouts", color: "purple" },
                  { label: "Refunds", sub: "Process refunds", icon: RotateCcw, href: "/dashboard/refunds", color: "amber" },
                  { label: "Settlements", sub: "View settlements", icon: LayoutDashboard, href: "/dashboard/settlements", color: "emerald" },
                ].map(({ label, sub, icon: Icon, href, color }) => {
                  const colorClasses: Record<string, string> = {
                    blue: "hover:bg-blue-50 dark:hover:bg-blue-900/10",
                    purple: "hover:bg-purple-50 dark:hover:bg-purple-900/10",
                    amber: "hover:bg-amber-50 dark:hover:bg-amber-900/10",
                    emerald: "hover:bg-emerald-50 dark:hover:bg-emerald-900/10",
                  };
                  return (
                    <button
                      key={label}
                      onClick={() => router.push(href)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all ${colorClasses[color]} group`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{sub}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                    </button>
                  );
                })}
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
    </div>
  );
}

<style jsx>{`
  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  .animate-scaleIn {
    animation: scaleIn 0.2s ease-out;
  }
`}</style>