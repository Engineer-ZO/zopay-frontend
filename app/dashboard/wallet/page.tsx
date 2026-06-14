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
    Shield,
    Sparkles,
    Zap,
    Clock,
    CheckCircle,
    CreditCard,
    Smartphone,
    Building2,
    History,
    TrendingUp,
} from "lucide-react";
import { useWalletSummary, useWalletActivity } from "@/features/wallet";
import { useUserMerchantData } from "@/features/merchants/context/MerchantContext";
import { useEnvironment } from "@/core/environment/EnvironmentContext";
import { useTopUpWallet } from "@/features/merchants/hooks/useMerchant";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function WalletPage() {
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [showTopUpModal, setShowTopUpModal] = useState(false); // Fixed: was useState instead of setShowTopUpModal
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
                return <ArrowDownLeft className="w-3.5 h-3.5" />;
            case "withdrawal":
                return <ArrowUpRight className="w-3.5 h-3.5" />;
            case "fee":
                return <TrendingDown className="w-3.5 h-3.5" />;
            default:
                return <RefreshCw className="w-3.5 h-3.5" />;
        }
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "completed":
                return { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-500/20", label: "Completed" };
            case "pending":
                return { color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-200 dark:border-amber-500/20", label: "Pending" };
            case "failed":
                return { color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-500/10", border: "border-rose-200 dark:border-rose-500/20", label: "Failed" };
            default:
                return { color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-100 dark:bg-slate-800", border: "border-slate-200 dark:border-slate-700", label: status };
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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                <div className="max-w-7xl mx-auto p-6 space-y-6">
                    <div className="animate-pulse">
                        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg mb-2" />
                        <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded-lg mb-6" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-32 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 animate-pulse" />
                            ))}
                        </div>
                        <div className="h-64 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 mt-6 animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (summaryError || activityError) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                <div className="max-w-7xl mx-auto p-6">
                    <div className="rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 p-8 text-center">
                        <XCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Failed to Load Wallet Data</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                            {summaryError?.message || activityError?.message || "An error occurred while fetching wallet data"}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all duration-200"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // No data state
    if (!balanceData || !recentActivity) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                <div className="max-w-7xl mx-auto p-6">
                    <div className="rounded-2xl bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
                        <WalletIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Wallet Data</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Unable to load wallet information at this time.</p>
                    </div>
                </div>
            </div>
        );
    }

    // Stat Card Component
    const StatCard = ({ icon: Icon, label, value, subtitle, color = "indigo", trend }: any) => {
        const colors = {
            indigo: "from-indigo-500 to-purple-600",
            emerald: "from-emerald-500 to-teal-600",
            amber: "from-amber-500 to-orange-600",
            rose: "from-rose-500 to-pink-600",
            sky: "from-sky-500 to-blue-600",
        };
        
        return (
            <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                <div className="relative flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{value}</p>
                        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
                        {trend && (
                            <div className="mt-2 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3 text-emerald-500" />
                                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{trend}</p>
                            </div>
                        )}
                    </div>
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${colors[color as keyof typeof colors]} shadow-lg`}>
                        <Icon className="w-5 h-5 text-white" />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            <div className="max-w-7xl mx-auto p-6 space-y-6">
                {/* HEADER */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-white via-white to-indigo-50/50 dark:from-slate-800/80 dark:via-slate-800/60 dark:to-indigo-950/30 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-6 shadow-lg">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                                <WalletIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                                    Account Status
                                </h1>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                                    Manage your funds, view balance history, and process withdrawals
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BALANCE OVERVIEW */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard 
                        icon={WalletIcon} 
                        label="Available Balance" 
                        value={`FCFA ${formatNumber(balanceData!.available)}`}
                        subtitle={`Last updated: ${balanceData!.lastUpdated}`}
                        color="indigo"
                        trend={balanceData!.trend}
                    />
                    <StatCard 
                        icon={Lock} 
                        label="Pending Balance" 
                        value={`FCFA ${formatNumber(balanceData!.pending)}`}
                        subtitle="Transactions processing"
                        color="amber"
                    />
                    <StatCard 
                        icon={ArrowDownLeft} 
                        label="Total Collected" 
                        value={`FCFA ${formatNumber(balanceData!.totalCollected)}`}
                        subtitle="This month"
                        color="emerald"
                    />
                    <StatCard 
                        icon={ArrowUpRight} 
                        label="Total Withdrawn" 
                        value={`FCFA ${formatNumber(balanceData!.totalWithdrawn)}`}
                        subtitle="This month"
                        color="rose"
                    />
                </div>

                {/* Wallet Actions */}
                <div className="rounded-2xl bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Wallet Actions</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Choose direct mobile money top-up or create a manual bank transfer top-up request.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={() => setShowTopUpModal(true)}
                                className="group px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 shadow-md"
                            >
                                <Smartphone className="w-4 h-4" />
                                Direct Mobile Top-Up
                            </button>
                            <Link
                                href="/dashboard/bank-topups"
                                className="group px-5 py-2.5 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-600 hover:border-slate-300 transition-all duration-200 flex items-center gap-2"
                            >
                                <Building2 className="w-4 h-4" />
                                Manual Bank Top-Up
                            </Link>
                            <button
                                type="button"
                                onClick={() => setShowWithdrawModal(true)}
                                className="group px-5 py-2.5 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-600 hover:border-slate-300 transition-all duration-200 flex items-center gap-2"
                            >
                                <ArrowUpRight className="w-4 h-4" />
                                Withdraw Funds
                            </button>
                        </div>
                    </div>
                </div>

                {/* RECENT ACTIVITY */}
                <div className="rounded-2xl bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                    <div className="p-5 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50/30 to-transparent dark:from-slate-800/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <History className="w-4 h-4 text-indigo-500" />
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Activity</h3>
                            </div>
                            <button className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors">
                                View All
                                <ArrowUpRight className="w-3 h-3" />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-800/30 border-b-2 border-slate-200 dark:border-slate-700">
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date/Time</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Balance Before</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentActivity!.map((activity, index) => {
                                    const statusConfig = getStatusConfig(activity.status);
                                    const typeIcon = getTypeIcon(activity.type);
                                    return (
                                        <tr
                                            key={index}
                                            className="group border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{activity.date}</span>
                                                    <span className="text-xs text-slate-500 dark:text-slate-400">{activity.time}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                                                        {typeIcon}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-slate-900 dark:text-white">{activity.label}</div>
                                                        {activity.reference && (
                                                            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">{activity.reference}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-sm font-bold ${activity.amount > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                                                    {activity.amount > 0 ? "+" : ""}
                                                    {formatNumber(activity.amount)} FCFA
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                                    {formatNumber(activity.balanceAfter)} FCFA
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                                        activity.status === "completed" ? "bg-emerald-500" :
                                                        activity.status === "pending" ? "bg-amber-500" :
                                                        "bg-rose-500"
                                                    } animate-pulse`} />
                                                    {statusConfig.label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-5 border-t border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50/30 to-transparent dark:from-slate-800/20">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-xs text-slate-500 dark:text-slate-400">Showing 1-10 of 156</div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200">
                                    <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                </button>
                                <button className="min-w-[36px] h-9 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md">1</button>
                                <button className="min-w-[36px] h-9 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200">2</button>
                                <button className="min-w-[36px] h-9 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200">3</button>
                                <button className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200">
                                    <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* WITHDRAW MODAL - Enhanced */}
            {showWithdrawModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setShowWithdrawModal(false)}>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-gradient-to-r from-white to-indigo-50/30 dark:from-slate-800 dark:to-indigo-950/20 border-b border-slate-200 dark:border-slate-700 p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                                        <ArrowUpRight className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Withdraw Funds</h3>
                                </div>
                                <button onClick={() => setShowWithdrawModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200">
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-5">
                            <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 p-4 border border-indigo-200 dark:border-indigo-500/20">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Available Balance:</span>
                                    <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">FCFA {formatNumber(balanceData!.available)}</span>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-900 dark:text-white mb-1.5 block">Withdrawal Amount *</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 dark:text-slate-400 font-semibold">FCFA</span>
                                    <input
                                        type="number"
                                        value={withdrawAmount}
                                        onChange={(e) => setWithdrawAmount(e.target.value)}
                                        placeholder="100,000"
                                        className="w-full pl-16 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                    />
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Min: {formatNumber(10000)} FCFA | Max: {formatNumber(balanceData!.available)} FCFA</p>
                            </div>

                            <div className="flex gap-2">
                                {[10000, 50000, 100000].map((amount) => (
                                    <button
                                        key={amount}
                                        onClick={() => setQuickAmount(amount, "withdraw")}
                                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                    >
                                        {formatNumber(amount)}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setQuickAmount(balanceData!.available, "withdraw")}
                                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                >
                                    All
                                </button>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-900 dark:text-white mb-1.5 block">Withdrawal Method *</label>
                                <div className="space-y-2">
                                    {[
                                        { value: "bank", label: "Bank Transfer", details: "Account: **** **** 1234", fee: "1,000 FCFA", time: "1-2 business days", icon: Building2 },
                                        { value: "mobile", label: "Mobile Money", details: "MTN: +237 670 123 456", fee: "500 FCFA", time: "Instant", icon: Smartphone },
                                    ].map((method) => (
                                        <label
                                            key={method.value}
                                            className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                                                withdrawMethod === method.value
                                                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"
                                                    : "border-slate-200 dark:border-slate-700 hover:border-indigo-300"
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="withdrawMethod"
                                                value={method.value}
                                                checked={withdrawMethod === method.value}
                                                onChange={(e) => setWithdrawMethod(e.target.value)}
                                                className="mt-0.5"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <method.icon className="w-4 h-4 text-slate-500" />
                                                    <div className="text-sm font-bold text-slate-900 dark:text-white">{method.label}</div>
                                                </div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">{method.details}</div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Fee: {method.fee} | Time: {method.time}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-xl bg-slate-50 dark:bg-slate-900/30 p-4 space-y-2 border border-slate-200 dark:border-slate-700">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600 dark:text-slate-400">Withdrawal Amount:</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">{withdrawAmount || "0"} FCFA</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600 dark:text-slate-400">Processing Fee:</span>
                                    <span className="font-semibold text-rose-600">{formatNumber(withdrawMethod === "bank" ? 1000 : 500)} FCFA</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                                    <span className="text-base font-bold text-slate-900 dark:text-white">You will receive:</span>
                                    <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                        {formatNumber(parseInt(withdrawAmount || "0") - (withdrawMethod === "bank" ? 1000 : 500))} FCFA
                                    </span>
                                </div>
                            </div>

                            <button className="w-full px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200">
                                Withdraw {withdrawAmount || "0"} FCFA
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TOP UP MODAL - Enhanced */}
            {showTopUpModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setShowTopUpModal(false)}>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-gradient-to-r from-white to-indigo-50/30 dark:from-slate-800 dark:to-indigo-950/20 border-b border-slate-200 dark:border-slate-700 p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                                        <Smartphone className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Top Up Balance</h3>
                                </div>
                                <button onClick={() => setShowTopUpModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200">
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-5">
                            {topUpError && (
                                <div className="rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 p-3 flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
                                    <p className="text-xs text-rose-800 dark:text-rose-200">{topUpError}</p>
                                </div>
                            )}

                            <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 p-4 border border-indigo-200 dark:border-indigo-500/20">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Current Balance:</span>
                                    <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">FCFA {formatNumber(balanceData!.available)}</span>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-900 dark:text-white mb-1.5 block">Top-Up Amount *</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 dark:text-slate-400 font-semibold">FCFA</span>
                                    <input
                                        type="number"
                                        value={topUpAmount}
                                        onChange={(e) => {
                                            setTopUpAmount(e.target.value);
                                            setTopUpError(null);
                                        }}
                                        placeholder="50,000"
                                        className="w-full pl-16 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                        disabled={topUpMutation.isPending}
                                    />
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Min: {formatNumber(5000)} FCFA | Max: {formatNumber(1000000)} FCFA</p>
                            </div>

                            <div className="flex gap-2">
                                {[5000, 10000, 50000, 100000].map((amount) => (
                                    <button
                                        key={amount}
                                        onClick={() => setQuickAmount(amount, "topup")}
                                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                    >
                                        {formatNumber(amount)}
                                    </button>
                                ))}
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-900 dark:text-white mb-1.5 block">Gateway *</label>
                                <select
                                    value={topUpGateway}
                                    onChange={(e) => {
                                        setTopUpGateway(e.target.value as "MTN_MOMO" | "ORANGE_MONEY");
                                        setTopUpError(null);
                                    }}
                                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all cursor-pointer"
                                    disabled={topUpMutation.isPending}
                                >
                                    <option value="MTN_MOMO">MTN Mobile Money</option>
                                    <option value="ORANGE_MONEY">Orange Money</option>
                                </select>
                            </div>

                            <div className="rounded-xl bg-slate-50 dark:bg-slate-900/30 p-4 space-y-3 border border-slate-200 dark:border-slate-700">
                                <label className="text-xs font-bold text-slate-900 dark:text-white mb-1.5 block">Your Phone Number *</label>
                                <input
                                    type="text"
                                    value={topUpMsisdn}
                                    onChange={(e) => {
                                        setTopUpMsisdn(e.target.value);
                                        setTopUpError(null);
                                    }}
                                    placeholder="237670000000 or 0670000000"
                                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                    disabled={topUpMutation.isPending}
                                />
                                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                    We will send a direct mobile money collection request to this number.
                                </p>
                                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">Collection Request:</span>
                                    <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{formatNumber(parseInt(topUpAmount || "0"))} FCFA</span>
                                </div>
                            </div>

                            <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-3">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                                    <p className="text-xs text-amber-800 dark:text-amber-200">
                                        The wallet is not credited yet when this request succeeds. The top-up finishes after the mobile money collection is approved and verified.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        resetTopUpForm();
                                        setShowTopUpModal(false);
                                    }}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
                                    disabled={topUpMutation.isPending}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleTopUp}
                                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
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