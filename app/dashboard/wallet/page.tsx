"use client";

import Link from "next/link";
import { useState } from "react";
import {
    Wallet as WalletIcon,
    Lock,
    TrendingDown,
    ArrowUpRight,
    ArrowDownLeft,
    XCircle,
    ChevronLeft,
    ChevronRight,
    X,
    RefreshCw,
    AlertCircle,
    Loader2,
} from "lucide-react";
import { useWalletSummary, useWalletActivity } from "@/features/wallet";
import { useUserMerchantData } from "@/features/merchants/context/MerchantContext";
import { useEnvironment } from "@/core/environment/EnvironmentContext";
import { useTopUpWallet } from "@/features/merchants/hooks/useMerchant";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function WalletPage() {
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [showTopUpModal, setShowTopUpModal] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [topUpAmount, setTopUpAmount] = useState("");
    const [withdrawMethod, setWithdrawMethod] = useState("bank");
    const [topUpGateway, setTopUpGateway] = useState<"MTN_MOMO" | "ORANGE_MONEY">("MTN_MOMO");
    const [topUpMsisdn, setTopUpMsisdn] = useState("");
    const [topUpError, setTopUpError] = useState<string | null>(null);
    const { merchantId } = useUserMerchantData();
    const { environment } = useEnvironment();
    const queryClient = useQueryClient();
    const topUpMutation = useTopUpWallet(merchantId || "");

    // Fetch wallet data using hooks
    const { data: balanceData, isLoading: isLoadingSummary, error: summaryError } = useWalletSummary();
    const { data: recentActivity, isLoading: isLoadingActivity, error: activityError } = useWalletActivity({ limit: 20 });

    // Format number with comma as thousands separator and dot for decimals
    const formatNumber = (num: number): string => {
        return num.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "credit":
                return <ArrowDownLeft className="w-3.5 h-3.5 text-muted-foreground" />;
            case "withdrawal":
                return <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />;
            case "fee":
                return <TrendingDown className="w-3.5 h-3.5 text-muted-foreground" />;
            default:
                return <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "text-green-600 dark:text-green-400";
            case "pending":
                return "text-crimson-red-600 dark:text-crimson-red-400";
            case "failed":
                return "text-red-600 dark:text-red-400";
            default:
                return "text-muted-foreground";
        }
    };

    const setQuickAmount = (amount: number, type: "withdraw" | "topup") => {
        if (type === "withdraw") {
            setWithdrawAmount(amount === (balanceData?.available || 0) ? (balanceData?.available || 0).toString() : amount.toString());
        } else {
            setTopUpAmount(amount.toString());
        }
    };

    const formatPhoneNumber = (phone: string): string => {
        const digits = phone.replace(/\D/g, "");
        if (digits.startsWith("237")) {
            return digits;
        }
        if (digits.startsWith("0")) {
            return "237" + digits.substring(1);
        }
        return "237" + digits;
    };

    const resetTopUpForm = () => {
        setTopUpAmount("");
        setTopUpGateway("MTN_MOMO");
        setTopUpMsisdn("");
        setTopUpError(null);
    };

    const handleTopUp = async () => {
        setTopUpError(null);

        if (!merchantId) {
            toast.error("Merchant ID not found");
            return;
        }

        if (!topUpAmount || parseFloat(topUpAmount) <= 0) {
            setTopUpError("Amount must be greater than 0");
            return;
        }

        if (!topUpMsisdn.trim()) {
            setTopUpError("Phone number is required");
            return;
        }

        const formattedPhone = formatPhoneNumber(topUpMsisdn);
        if (formattedPhone.length < 12 || formattedPhone.length > 15) {
            setTopUpError("Invalid phone number format. Use format: 237670000000");
            return;
        }

        try {
            const result = await topUpMutation.mutateAsync({
                gateway: topUpGateway,
                amount: parseFloat(topUpAmount),
                currency: environment === "sandbox" ? "EUR" : "XAF",
                msisdn: formattedPhone,
                environment: environment ?? "sandbox",
            });

            toast.success("Top-up initiated successfully!", {
                description:
                    result.message ||
                    `Approve the ${result.chargedAmount?.toLocaleString() ?? parseFloat(topUpAmount).toLocaleString()} ${
                        environment === "sandbox" ? "EUR" : "XAF"
                    } payment prompt on your phone to finish funding your wallet.`,
            });

            resetTopUpForm();
            setShowTopUpModal(false);

            queryClient.invalidateQueries({ queryKey: ["wallet", "summary"] });
            queryClient.invalidateQueries({ queryKey: ["wallet", "activity"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard", "transactions"] });
        } catch (error: unknown) {
            const errorMessage =
                (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
                (error as { message?: string })?.message ||
                "Failed to top up wallet";

            setTopUpError(errorMessage);
            toast.error("Top-up failed", {
                description: errorMessage,
            });
        }
    };

    // Loading state
    if (isLoadingSummary || isLoadingActivity) {
        return (
            <div className="space-y-4 p-4">
                <div>
                    <h1 className="text-xl font-semibold text-foreground">Account status</h1>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Manage your funds, view balance history, and process withdrawals
                    </p>
                </div>

                {/* Loading Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-background rounded-lg p-3 border border-border animate-pulse">
                            <div className="flex items-start justify-between mb-2">
                                <div className="w-8 h-8 bg-muted rounded-lg" />
                            </div>
                            <div className="h-2.5 w-20 bg-muted rounded mb-1.5" />
                            <div className="h-5 w-28 bg-muted rounded" />
                        </div>
                    ))}
                </div>

                <div className="bg-background rounded-lg p-3 border border-border">
                    <div className="h-4 w-32 bg-muted rounded mb-4 animate-pulse" />
                    <div className="h-64 bg-muted/30 rounded-lg animate-pulse" />
                </div>
            </div>
        );
    }

    // Error state
    if (summaryError || activityError) {
        return (
            <div className="p-4">
                <div className="bg-background border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
                    <XCircle className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                        Failed to Load Wallet Data
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        {summaryError?.message || activityError?.message || "An error occurred while fetching wallet data"}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-crimson-red-500 text-white rounded-md text-sm font-semibold hover:bg-crimson-red-600 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // No data state
    if (!balanceData || !recentActivity) {
        return (
            <div className="p-4">
                <div className="bg-background border border-border rounded-lg p-6 text-center">
                    <WalletIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Wallet Data</h3>
                    <p className="text-sm text-muted-foreground">
                        Unable to load wallet information at this time.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 p-4">
            {/* HEADER */}
            <div>
                <h1 className="text-xl font-semibold text-foreground">Account status</h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                    Manage your funds, view balance history, and process withdrawals
                </p>
            </div>

            {/* BALANCE OVERVIEW */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Available Balance - Primary card with orange accent */}
                <div className="bg-background rounded-lg p-3 border border-border border-l-2 border-l-crimson-red-500 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                        <div className="w-8 h-8 bg-muted/60 rounded-lg flex items-center justify-center">
                            <WalletIcon className="w-4 h-4 text-crimson-red-500" />
                        </div>
                        <span className="text-[10px] font-medium flex items-center gap-0.5 text-red-600 dark:text-red-400">
                            <TrendingDown className="w-2.5 h-2.5" />
                            {balanceData!.trend}
                        </span>
                    </div>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">
                        Available Balance
                    </p>
                    <p className="text-base font-semibold text-crimson-red-500 mb-0.5">
                        FCFA {formatNumber(balanceData!.available)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                        Last updated: {balanceData!.lastUpdated}
                    </p>
                </div>

                {/* Pending Balance */}
                <div className="bg-background rounded-lg p-3 border border-border hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                        <div className="w-8 h-8 bg-muted/60 rounded-lg flex items-center justify-center">
                            <Lock className="w-4 h-4 text-muted-foreground" />
                        </div>
                    </div>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">
                        PENDING BALANCE
                    </p>
                    <p className="text-base font-semibold text-foreground mb-0.5">
                        FCFA {formatNumber(balanceData!.pending)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                        3 transactions processing
                    </p>
                </div>

                {/* Total Collected */}
                <div className="bg-background rounded-lg p-3 border border-border hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                        <div className="w-8 h-8 bg-muted/60 rounded-lg flex items-center justify-center">
                            <ArrowDownLeft className="w-4 h-4 text-muted-foreground" />
                        </div>
                    </div>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">
                        TOTAL COLLECTED
                    </p>
                    <p className="text-base font-semibold text-foreground mb-0.5">
                        FCFA {formatNumber(balanceData!.totalCollected)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">This month</p>
                </div>

                {/* Total Withdrawn */}
                <div className="bg-background rounded-lg p-3 border border-border hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                        <div className="w-8 h-8 bg-muted/60 rounded-lg flex items-center justify-center">
                            <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                    </div>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">
                        TOTAL WITHDRAWN
                    </p>
                    <p className="text-base font-semibold text-foreground mb-0.5">
                        FCFA {formatNumber(balanceData!.totalWithdrawn)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">This month</p>
                </div>
            </div>

            <div className="bg-background rounded-lg p-4 border border-border">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-sm font-semibold text-foreground">Wallet Actions</h2>
                        <p className="text-xs text-muted-foreground mt-1">
                            Choose direct mobile money top-up or create a manual bank transfer top-up request.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={() => setShowTopUpModal(true)}
                            className="px-4 py-2.5 bg-crimson-red-500 text-white rounded-lg text-sm font-semibold hover:bg-crimson-red-600 transition-colors"
                        >
                            Direct Mobile Top-Up
                        </button>
                        <Link
                            href="/dashboard/bank-topups"
                            className="px-4 py-2.5 border border-border text-foreground rounded-lg text-sm font-semibold hover:bg-muted transition-colors"
                        >
                            Manual Bank Top-Up
                        </Link>
                        <button
                            type="button"
                            onClick={() => setShowWithdrawModal(true)}
                            className="px-4 py-2.5 border border-border text-foreground rounded-lg text-sm font-semibold hover:bg-muted transition-colors"
                        >
                            Withdraw Funds
                        </button>
                    </div>
                </div>
            </div>

            {/* BALANCE CHART */}
            {/* <div className="bg-background rounded-xl p-6 border border-border">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">📈 Balance History</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Last 30 days</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-medium hover:bg-muted transition-colors">
                            7 Days
                        </button>
                        <button className="px-3 py-1.5 bg-crimson-red-500 text-white rounded-lg text-xs font-medium">
                            30 Days
                        </button>
                        <button className="px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-medium hover:bg-muted transition-colors">
                            90 Days
                        </button>
                    </div>
                </div>

                <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg border-2 border-dashed border-border">
                    <div className="text-center">
                        <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm font-medium text-muted-foreground">
                            Balance history chart will be displayed here
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Area chart showing balance over time
                        </p>
                    </div>
                </div>
            </div> */}

            {/* RECENT ACTIVITY */}
            <div className="bg-background rounded-lg border border-border overflow-hidden">
                <div className="px-3 py-2 border-b border-border flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
                    <button className="text-xs font-medium text-crimson-red-600 dark:text-crimson-red-400 hover:underline flex items-center gap-1">
                        View All
                        <ArrowUpRight className="w-3 h-3" />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/30">
                                <th className="text-left py-2 px-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                                    Date/Time
                                </th>
                                <th className="text-left py-2 px-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                                    Type
                                </th>
                                <th className="text-left py-2 px-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                                    Amount
                                </th>
                                <th className="text-left py-2 px-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                                    Balance Before
                                </th>
                                <th className="text-left py-2 px-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentActivity!.map((activity, index) => (
                                <tr
                                    key={index}
                                    className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                                >
                                    <td className="py-2.5 px-3">
                                        <div className="text-xs font-medium text-foreground">{activity.date}</div>
                                        <div className="text-[10px] text-muted-foreground">{activity.time}</div>
                                    </td>
                                    <td className="py-2.5 px-3">
                                        <div className="flex items-center gap-2">
                                            {getTypeIcon(activity.type)}
                                            <div>
                                                <div className="text-xs font-medium text-foreground">{activity.label}</div>
                                                {activity.reference && (
                                                    <div className="text-[10px] text-muted-foreground font-mono">{activity.reference}</div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-2.5 px-3">
                                        <span
                                            className={`text-xs font-semibold ${activity.amount > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                                                }`}
                                        >
                                            {activity.amount > 0 ? "+" : ""}
                                            {formatNumber(activity.amount)} FCFA
                                        </span>
                                    </td>
                                    <td className="py-2.5 px-3 text-xs font-medium text-foreground">
                                        {formatNumber(activity.balanceAfter)} FCFA
                                    </td>
                                    <td className="py-2.5 px-3">
                                        <span
                                            className={`inline-flex items-center gap-1 text-[10px] font-medium ${getStatusColor(
                                                activity.status
                                            )}`}
                                        >
                                            <span
                                                className={`w-1 h-1 rounded-full ${
                                                    activity.status === "completed"
                                                        ? "bg-green-500"
                                                        : activity.status === "pending"
                                                        ? "bg-crimson-red-500"
                                                        : "bg-red-500"
                                                }`}
                                            />
                                            {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-3 py-2 border-t border-border flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">Showing 1-10 of 156</div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-muted rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button className="px-3 py-1 bg-crimson-red-500 text-white rounded text-xs font-medium">
                            1
                        </button>
                        <button className="px-3 py-1 hover:bg-muted rounded text-xs font-medium">2</button>
                        <button className="px-3 py-1 hover:bg-muted rounded text-xs font-medium">3</button>
                        <button className="p-2 hover:bg-muted rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* WITHDRAW MODAL */}
            {showWithdrawModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-background rounded-xl p-6 shadow-2xl border border-border max-w-md w-full">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-foreground">Withdraw Funds</h3>
                            <button
                                onClick={() => setShowWithdrawModal(false)}
                                className="p-1 hover:bg-muted rounded transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-muted/50 rounded-lg p-3 text-xs">
                                <span className="text-muted-foreground">Available Balance:</span>
                                <span className="font-bold text-foreground ml-2">
                                    FCFA {formatNumber(balanceData!.available)}
                                </span>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-foreground mb-2 block">
                                    Withdrawal Amount *
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                        FCFA
                                    </span>
                                    <input
                                        type="number"
                                        value={withdrawAmount}
                                        onChange={(e) => setWithdrawAmount(e.target.value)}
                                        placeholder="100,000"
                                        className="w-full pl-14 pr-4 py-2 bg-muted border border-border rounded-lg text-sm"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Min: {formatNumber(10000)} FCFA | Max: {formatNumber(balanceData!.available)} FCFA
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setQuickAmount(10000, "withdraw")}
                                    className="px-3 py-1.5 bg-muted rounded-lg text-xs font-medium hover:bg-muted/80"
                                >
                                    10K
                                </button>
                                <button
                                    onClick={() => setQuickAmount(50000, "withdraw")}
                                    className="px-3 py-1.5 bg-muted rounded-lg text-xs font-medium hover:bg-muted/80"
                                >
                                    50K
                                </button>
                                <button
                                    onClick={() => setQuickAmount(100000, "withdraw")}
                                    className="px-3 py-1.5 bg-muted rounded-lg text-xs font-medium hover:bg-muted/80"
                                >
                                    100K
                                </button>
                                <button
                                    onClick={() => setQuickAmount(balanceData!.available, "withdraw")}
                                    className="px-3 py-1.5 bg-muted rounded-lg text-xs font-medium hover:bg-muted/80"
                                >
                                    All
                                </button>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-foreground mb-2 block">
                                    Withdrawal Method *
                                </label>
                                <div className="space-y-2">
                                    <label className="flex items-start gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50">
                                        <input
                                            type="radio"
                                            name="withdrawMethod"
                                            value="bank"
                                            checked={withdrawMethod === "bank"}
                                            onChange={(e) => setWithdrawMethod(e.target.value)}
                                            className="mt-0.5"
                                        />
                                        <div className="flex-1">
                                            <div className="text-xs font-medium text-foreground">Bank Transfer</div>
                                            <div className="text-xs text-muted-foreground">Account: **** **** 1234</div>
                                            <div className="text-xs text-muted-foreground">
                                                Fee: {formatNumber(1000)} FCFA | Time: 1-2 business days
                                            </div>
                                        </div>
                                    </label>
                                    <label className="flex items-start gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50">
                                        <input
                                            type="radio"
                                            name="withdrawMethod"
                                            value="mobile"
                                            checked={withdrawMethod === "mobile"}
                                            onChange={(e) => setWithdrawMethod(e.target.value)}
                                            className="mt-0.5"
                                        />
                                        <div className="flex-1">
                                            <div className="text-xs font-medium text-foreground">Mobile Money</div>
                                            <div className="text-xs text-muted-foreground">MTN: +237 670 123 456</div>
                                            <div className="text-xs text-muted-foreground">
                                                Fee: 500 FCFA | Time: Instant
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="bg-muted/50 rounded-lg p-3 space-y-1 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Withdrawal Amount:</span>
                                    <span className="font-medium">{withdrawAmount || "0"} FCFA</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Processing Fee:</span>
                                    <span className="font-medium">{formatNumber(withdrawMethod === "bank" ? 1000 : 500)} FCFA</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-border">
                                    <span className="font-semibold">You will receive:</span>
                                    <span className="font-bold">
                                        {formatNumber(parseInt(withdrawAmount || "0") - (withdrawMethod === "bank" ? 1000 : 500))} FCFA
                                    </span>
                                </div>
                            </div>

                            <button className="w-full px-4 py-2 bg-crimson-red-500 text-white rounded-lg text-sm font-semibold hover:bg-crimson-red-600 transition-colors">
                                Withdraw {withdrawAmount || "0"} FCFA
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TOP UP MODAL */}
            {showTopUpModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-background rounded-xl p-6 shadow-2xl border border-border max-w-md w-full">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-foreground">Top Up Balance</h3>
                            <button
                                onClick={() => setShowTopUpModal(false)}
                                className="p-1 hover:bg-muted rounded transition-colors"
                                disabled={topUpMutation.isPending}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {topUpError && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-900 dark:text-red-100">{topUpError}</p>
                                </div>
                            )}

                            <div className="bg-muted/50 rounded-lg p-3 text-xs">
                                <span className="text-muted-foreground">Current Balance:</span>
                                <span className="font-bold text-foreground ml-2">
                                    FCFA {formatNumber(balanceData!.available)}
                                </span>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-foreground mb-2 block">
                                    Top-Up Amount *
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                        FCFA
                                    </span>
                                    <input
                                        type="number"
                                        value={topUpAmount}
                                        onChange={(e) => {
                                            setTopUpAmount(e.target.value);
                                            setTopUpError(null);
                                        }}
                                        placeholder="50,000"
                                        className="w-full pl-14 pr-4 py-2 bg-muted border border-border rounded-lg text-sm"
                                        disabled={topUpMutation.isPending}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Min: {formatNumber(5000)} FCFA | Max: {formatNumber(1000000)} FCFA
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setQuickAmount(5000, "topup")}
                                    className="px-3 py-1.5 bg-muted rounded-lg text-xs font-medium hover:bg-muted/80"
                                    disabled={topUpMutation.isPending}
                                >
                                    5K
                                </button>
                                <button
                                    onClick={() => setQuickAmount(10000, "topup")}
                                    className="px-3 py-1.5 bg-muted rounded-lg text-xs font-medium hover:bg-muted/80"
                                    disabled={topUpMutation.isPending}
                                >
                                    10K
                                </button>
                                <button
                                    onClick={() => setQuickAmount(50000, "topup")}
                                    className="px-3 py-1.5 bg-muted rounded-lg text-xs font-medium hover:bg-muted/80"
                                    disabled={topUpMutation.isPending}
                                >
                                    50K
                                </button>
                                <button
                                    onClick={() => setQuickAmount(100000, "topup")}
                                    className="px-3 py-1.5 bg-muted rounded-lg text-xs font-medium hover:bg-muted/80"
                                    disabled={topUpMutation.isPending}
                                >
                                    100K
                                </button>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-foreground mb-2 block">
                                    Gateway *
                                </label>
                                <select
                                    value={topUpGateway}
                                    onChange={(e) => {
                                        setTopUpGateway(e.target.value as "MTN_MOMO" | "ORANGE_MONEY");
                                        setTopUpError(null);
                                    }}
                                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm"
                                    disabled={topUpMutation.isPending}
                                >
                                    <option value="MTN_MOMO">MTN Mobile Money</option>
                                    <option value="ORANGE_MONEY">Orange Money</option>
                                </select>
                            </div>

                            <div className="bg-muted/50 rounded-lg p-3 space-y-1 text-xs">
                                <label className="text-xs font-medium text-foreground mb-2 block">
                                    Your Phone Number *
                                </label>
                                <input
                                    type="text"
                                    value={topUpMsisdn}
                                    onChange={(e) => {
                                        setTopUpMsisdn(e.target.value);
                                        setTopUpError(null);
                                    }}
                                    placeholder="237670000000 or 0670000000"
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm mb-2"
                                    disabled={topUpMutation.isPending}
                                />
                                <p className="text-[10px] text-muted-foreground mb-2">
                                    We will send a direct mobile money collection request to this number. No quote step is required.
                                </p>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Top-Up Amount:</span>
                                    <span className="font-medium">{topUpAmount || "0"} FCFA</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-border">
                                    <span className="font-semibold">Collection Request:</span>
                                    <span className="font-bold">
                                        {formatNumber(parseInt(topUpAmount || "0"))} FCFA
                                    </span>
                                </div>
                            </div>

                            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                                <p className="text-xs text-amber-700 dark:text-amber-400">
                                    The wallet is not credited yet when this request succeeds. The top-up finishes after the mobile money collection is approved and verified by the backend.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        resetTopUpForm();
                                        setShowTopUpModal(false);
                                    }}
                                    className="flex-1 px-4 py-2 bg-background border border-border text-foreground rounded-lg text-sm font-semibold hover:bg-muted transition-colors disabled:opacity-50"
                                    disabled={topUpMutation.isPending}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleTopUp}
                                    className="flex-1 px-4 py-2 bg-crimson-red-500 text-white rounded-lg text-sm font-semibold hover:bg-crimson-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    disabled={topUpMutation.isPending}
                                >
                                    {topUpMutation.isPending ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        "Top Up Wallet"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
