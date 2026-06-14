"use client";

import { useState } from "react";
import {
    Wallet,
    Plus,
    CheckCircle2,
    Clock,
    XCircle,
    Ban,
    Building2,
    Globe,
    CreditCard,
    ChevronDown,
    Loader2,
    X,
    AlertTriangle,
    ArrowUpFromLine,
    Lock,
    TrendingUp,
    Calendar,
    User,
    Banknote,
    Shield,
    Sparkles,
    Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useEnvironment } from "@/core/environment/EnvironmentContext";
import { useUserMerchantData } from "@/features/merchants/context/MerchantContext";
import {
    useWithdrawalMethods,
    useSubmitLocalBank,
    useSubmitInternationalBank,
    useSubmitPrepaidCard,
    useQuoteWithdrawal,
    useInitiateWithdrawal,
    useWithdrawals,
    useMerchantLocalBanks,
} from "@/features/withdrawals/hooks/index";
import type {
    InitiateWithdrawalResponse,
    WithdrawalQuoteResponse,
    WithdrawalMethod,
    WithdrawalMethodStatus,
} from "@/features/withdrawals/types/index";

type MethodFormType = "LOCAL_BANK" | "INTERNATIONAL_BANK" | "PREPAID_CARD" | null;

const STATUS_CONFIG: Record<WithdrawalMethodStatus, { label: string; color: string; icon: React.ReactNode }> = {
    PENDING: {
        label: "Pending Approval",
        color: "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20",
        icon: <Clock className="w-3 h-3" />,
    },
    ACTIVE: {
        label: "Active",
        color: "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20",
        icon: <CheckCircle2 className="w-3 h-3" />,
    },
    DISABLED: {
        label: "Disabled",
        color: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700",
        icon: <Ban className="w-3 h-3" />,
    },
    REJECTED: {
        label: "Rejected",
        color: "bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20",
        icon: <XCircle className="w-3 h-3" />,
    },
};

function MethodTypeIcon({ type }: { type: string }) {
    const icons = {
        LOCAL_BANK: <Building2 className="w-5 h-5 text-indigo-500" />,
        INTERNATIONAL_BANK: <Globe className="w-5 h-5 text-purple-500" />,
        PREPAID_CARD: <CreditCard className="w-5 h-5 text-rose-500" />,
        MOBILE_MONEY: <Smartphone className="w-5 h-5 text-amber-500" />,
    };
    return icons[type as keyof typeof icons] || <Wallet className="w-5 h-5 text-slate-400" />;
}

// Smartphone icon
const Smartphone = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
);

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, color = "indigo" }: any) => {
    const colors = {
        indigo: "from-indigo-500 to-purple-600",
        emerald: "from-emerald-500 to-teal-600",
        amber: "from-amber-500 to-orange-600",
        rose: "from-rose-500 to-pink-600",
    };
    return (
        <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            <div className="relative flex items-start justify-between">
                <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${colors[color as keyof typeof colors]} shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
            </div>
        </div>
    );
};

function MethodCard({ method }: { method: WithdrawalMethod }) {
    const status = STATUS_CONFIG[method.status];
    const isAdminOnly = method.adminOnly || method.methodType === "MOBILE_MONEY";

    return (
        <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            <div className="relative flex items-start justify-between gap-3">
                <div className="flex items-center gap-4 flex-1">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
                        <MethodTypeIcon type={method.methodType} />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            {method.methodType === "MOBILE_MONEY" && `${method.gateway?.replace(/_/g, " ")} — ${method.msisdn}`}
                            {method.methodType === "LOCAL_BANK" && `${method.bankName} — ${method.accountNumber}`}
                            {method.methodType === "INTERNATIONAL_BANK" && `${method.bankName} (${method.country})`}
                            {method.methodType === "PREPAID_CARD" && `${method.cardNetwork} •••• ${method.lastFourDigits}`}
                            {isAdminOnly && <Lock className="w-3 h-3 text-slate-400" />}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {method.methodType === "LOCAL_BANK" && method.accountName}
                            {method.methodType === "INTERNATIONAL_BANK" && `IBAN: ${method.iban}`}
                            {method.methodType === "PREPAID_CARD" && method.cardholderName}
                            {method.methodType === "MOBILE_MONEY" && "Managed by admin"}
                        </p>
                        {method.status === "REJECTED" && method.rejectionReason && (
                            <p className="text-xs text-rose-500 mt-2 flex items-center gap-1.5">
                                <AlertTriangle className="w-3 h-3" />
                                {method.rejectionReason}
                            </p>
                        )}
                    </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${status.color}`}>
                    {status.icon}
                    {status.label}
                </span>
            </div>
        </div>
    );
}

export default function WithdrawalsPage() {
    const { merchantId } = useUserMerchantData();
    const { environment } = useEnvironment();

    const [showAddMethod, setShowAddMethod] = useState(false);
    const [formType, setFormType] = useState<MethodFormType>(null);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [isReviewingWithdrawal, setIsReviewingWithdrawal] = useState(false);

    const { data: methodsData, isLoading: methodsLoading } = useWithdrawalMethods(merchantId);
    const methods = methodsData?.methods ?? [];

    const { data: withdrawalsData, isLoading: withdrawalsLoading } = useWithdrawals(
        merchantId ? { merchant_id: merchantId, environment: environment ?? undefined, limit: 20 } : null
    );

    const { mutate: submitLocal, isPending: submittingLocal } = useSubmitLocalBank();
    const { mutate: submitIntl, isPending: submittingIntl } = useSubmitInternationalBank();
    const { mutate: submitCard, isPending: submittingCard } = useSubmitPrepaidCard();
    const { mutate: quoteWithdrawal, isPending: quotingWithdrawal } = useQuoteWithdrawal();
    const { mutate: initiateWithdrawal, isPending: withdrawing } = useInitiateWithdrawal();

    const activeMethods = methods.filter((m) => m.status === "ACTIVE");
    const withdrawals = withdrawalsData?.withdrawals ?? [];

    // ---- Local Bank Form ----
    const { data: localBanksData, isLoading: loadingLocalBanks } = useMerchantLocalBanks();
    const [localBank, setLocalBank] = useState({
        bank_code: "",
        branch_code: "",
        account_number: "",
        account_key: "",
        account_name: "",
    });

    const resetLocalBank = () => setLocalBank({
        bank_code: "", branch_code: "", account_number: "", account_key: "", account_name: "",
    });

    const handleLocalBankSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!merchantId) return toast.error("Merchant not found");
        submitLocal(
            { merchant_id: merchantId, ...localBank },
            {
                onSuccess: () => {
                    toast.success("Bank account submitted for admin approval");
                    setShowAddMethod(false);
                    setFormType(null);
                    resetLocalBank();
                },
                onError: (err) => toast.error(err.message),
            }
        );
    };

    // ---- International Bank Form ----
    const [intlBank, setIntlBank] = useState({
        bank_name: "",
        country: "",
        swift_code: "",
        routing_number: "",
        iban: "",
        account_number: "",
        account_currency: "",
        account_name: "",
    });

    const resetIntlBank = () => setIntlBank({
        bank_name: "", country: "", swift_code: "", routing_number: "",
        iban: "", account_number: "", account_currency: "", account_name: "",
    });

    const handleIntlBankSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!merchantId) return toast.error("Merchant not found");
        const { routing_number, ...rest } = intlBank;
        submitIntl(
            { merchant_id: merchantId, ...rest, ...(routing_number ? { routing_number } : {}) },
            {
                onSuccess: () => {
                    toast.success("International bank account submitted for admin approval");
                    setShowAddMethod(false);
                    setFormType(null);
                    resetIntlBank();
                },
                onError: (err) => toast.error(err.message),
            }
        );
    };

    // ---- Prepaid Card Form ----
    const [card, setCard] = useState({
        card_network: "VISA" as "VISA" | "MASTERCARD",
        cardholder_name: "",
        client_id: "",
        last_four_digits: "",
    });

    const resetCard = () => setCard({ card_network: "VISA", cardholder_name: "", client_id: "", last_four_digits: "" });

    const handleCardSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!merchantId) return toast.error("Merchant not found");
        submitCard(
            { merchant_id: merchantId, ...card },
            {
                onSuccess: () => {
                    toast.success("Card submitted for admin approval");
                    setShowAddMethod(false);
                    setFormType(null);
                    resetCard();
                },
                onError: (err) => toast.error(err.message),
            }
        );
    };

    // ---- Withdraw Modal ----
    const [selectedMethodId, setSelectedMethodId] = useState("");
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [withdrawError, setWithdrawError] = useState("");

    const [withdrawalSuccess, setWithdrawalSuccess] = useState<InitiateWithdrawalResponse | null>(null);
    const [withdrawalQuote, setWithdrawalQuote] = useState<WithdrawalQuoteResponse | null>(null);
    const selectedMethod = activeMethods.find((method) => method.id === selectedMethodId) ?? null;

    const formatMethodLabel = (method: WithdrawalMethod) => {
        if (method.methodType === "MOBILE_MONEY") return `${method.gateway?.replace(/_/g, " ")} - ${method.msisdn}`;
        if (method.methodType === "LOCAL_BANK") return `${method.bankName} - ${method.accountNumber}`;
        if (method.methodType === "INTERNATIONAL_BANK") return `${method.bankName} (${method.country})`;
        return `${method.cardNetwork} **** ${method.lastFourDigits}`;
    };

    const getErrorMessage = (error: unknown) => {
        if (error instanceof Error) {
            return error.message;
        }

        if (typeof error === "object" && error !== null && "response" in error) {
            const response = error.response as { data?: { message?: string } } | undefined;
            return response?.data?.message ?? "";
        }

        return "";
    };

    const handleWithdraw = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMethodId || !withdrawAmount) return;
        if (!merchantId) return toast.error("Merchant not found");
        setWithdrawError("");
        initiateWithdrawal(
            {
                merchant_id: merchantId,
                withdrawal_method_id: selectedMethodId,
                amount: parseFloat(withdrawAmount),
                currency: "XAF",
                environment: environment ?? undefined,
            },
            {
                onSuccess: (data) => {
                    setWithdrawalSuccess(data);
                    setWithdrawalQuote(null);
                    setIsReviewingWithdrawal(false);
                    toast.success("Withdrawal initiated successfully");
                },
                onError: (error: unknown) => {
                    const message = getErrorMessage(error);
                    const response =
                        typeof error === "object" && error !== null && "response" in error
                            ? (error.response as { status?: number } | undefined)
                            : undefined;

                    if (response?.status === 403) {
                        setWithdrawError("Withdrawals are currently disabled for your account. Please contact support.");
                    } else if (message.includes("BELOW_MINIMUM") || message.includes("ABOVE_MAXIMUM")) {
                        setWithdrawError(message);
                    } else {
                        toast.error(message || "Failed to initiate withdrawal");
                    }
                },
            }
        );
    };

    const handleReviewWithdrawal = () => {
        if (!selectedMethodId || !withdrawAmount) return;
        if (!merchantId) return toast.error("Merchant not found");
        setWithdrawError("");

        quoteWithdrawal(
            {
                merchant_id: merchantId,
                withdrawal_method_id: selectedMethodId,
                amount: parseFloat(withdrawAmount),
                currency: "XAF",
                environment: environment ?? undefined,
            },
            {
                onSuccess: (data) => {
                    setWithdrawalQuote(data);
                    setIsReviewingWithdrawal(true);
                },
                onError: (error: unknown) => {
                    const message = getErrorMessage(error);
                    const response =
                        typeof error === "object" && error !== null && "response" in error
                            ? (error.response as { status?: number } | undefined)
                            : undefined;

                    if (response?.status === 403) {
                        setWithdrawError("Withdrawals are currently disabled for your account. Please contact support.");
                        return;
                    }

                    toast.error(message || "Failed to calculate withdrawal quote");
                },
            }
        );
    };

    const closeWithdrawModal = () => {
        setShowWithdrawModal(false);
        setWithdrawalSuccess(null);
        setWithdrawalQuote(null);
        setIsReviewingWithdrawal(false);
        setSelectedMethodId("");
        setWithdrawAmount("");
        setWithdrawError("");
    };

    const currency = environment === "production" ? "FCFA" : "XAF";

    // Calculate stats
    const totalWithdrawn = withdrawals.reduce((sum, w) => sum + parseFloat(w.amount), 0);
    const successCount = withdrawals.filter(w => w.status === "SUCCESS").length;
    const pendingCount = withdrawals.filter(w => w.status === "PENDING").length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            <div className="max-w-7xl mx-auto p-6 space-y-6">
                {/* HEADER */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-white via-white to-indigo-50/50 dark:from-slate-800/80 dark:via-slate-800/60 dark:to-indigo-950/30 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-6 shadow-lg">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                    <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                                    <ArrowUpFromLine className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                                        Withdrawals
                                    </h1>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                                        Manage withdrawal methods and transfer funds from your wallet
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            {activeMethods.length > 0 && (
                                <button
                                    onClick={() => {
                                        setWithdrawalSuccess(null);
                                        setShowWithdrawModal(true);
                                    }}
                                    className="group px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 shadow-md"
                                >
                                    <ArrowUpFromLine className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                                    Withdraw Funds
                                </button>
                            )}
                            <button
                                onClick={() => setShowAddMethod(true)}
                                className="group px-5 py-2.5 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-600 hover:border-slate-300 transition-all duration-200 flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                                Add Method
                            </button>
                        </div>
                    </div>
                </div>

                {/* STATS CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard icon={Wallet} label="Total Withdrawn" value={`${currency} ${totalWithdrawn.toLocaleString()}`} color="indigo" />
                    <StatCard icon={CheckCircle2} label="Successful" value={successCount} color="emerald" />
                    <StatCard icon={Clock} label="Pending" value={pendingCount} color="amber" />
                </div>

                {/* Withdrawal Methods Section */}
                <div className="rounded-2xl bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                    <div className="p-5 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50/30 to-transparent dark:from-slate-800/20">
                        <div className="flex items-center gap-2">
                            <Wallet className="w-4 h-4 text-indigo-500" />
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Withdrawal Methods</h2>
                        </div>
                    </div>

                    {methodsLoading ? (
                        <div className="p-6 space-y-3">
                            {[1, 2].map((i) => (
                                <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800/50 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : methods.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                                <Wallet className="w-10 h-10 text-slate-400" />
                            </div>
                            <p className="text-base font-medium text-slate-700 dark:text-slate-300">No withdrawal methods</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                Add a bank account or prepaid card to start withdrawing funds.
                            </p>
                            <button
                                onClick={() => setShowAddMethod(true)}
                                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all duration-200"
                            >
                                <Plus className="w-4 h-4" />
                                Add Method
                            </button>
                        </div>
                    ) : (
                        <div className="p-6 space-y-3">
                            {methods.map((m) => <MethodCard key={m.id} method={m} />)}
                        </div>
                    )}
                </div>

                {/* Recent Withdrawals Section */}
                <div className="rounded-2xl bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                    <div className="p-5 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50/30 to-transparent dark:from-slate-800/20">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-indigo-500" />
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Recent Withdrawals</h2>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-800/30 border-b-2 border-slate-200 dark:border-slate-700">
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Method</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fee</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {withdrawalsLoading ? (
                                    Array.from({ length: 4 }).map((_, i) => (
                                        <tr key={i} className="border-b border-slate-100 dark:border-slate-700">
                                            {Array.from({ length: 6 }).map((__, j) => (
                                                <td key={j} className="px-6 py-4">
                                                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-20" />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : withdrawals.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                                                <Banknote className="w-8 h-8 text-slate-400" />
                                            </div>
                                            <p className="text-base font-medium text-slate-700 dark:text-slate-300">No withdrawals yet</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Your withdrawal history will appear here</p>
                                        </td>
                                    </tr>
                                ) : (
                                    withdrawals.map((w) => {
                                        const sc = STATUS_CONFIG[w.status as keyof typeof STATUS_CONFIG];
                                        return (
                                            <tr key={w.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 group">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{new Date(w.createdAt).toLocaleDateString()}</span>
                                                        <span className="text-xs text-slate-500 dark:text-slate-400">{new Date(w.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                                                        {w.withdrawalMethod.replace(/_/g, " ")}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                                                        {parseFloat(w.amount).toLocaleString()} {currency}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs text-rose-600 dark:text-rose-400">
                                                        -{parseFloat(w.withdrawalFee || "0").toLocaleString()} {currency}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                                                        {parseFloat(w.totalDeduction).toLocaleString()} {currency}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {sc && (
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${sc.color}`}>
                                                            {sc.icon}
                                                            {sc.label}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ---- Add Method Modal - Enhanced ---- */}
                {showAddMethod && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => { setShowAddMethod(false); setFormType(null); }}>
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                            <div className="sticky top-0 bg-gradient-to-r from-white to-indigo-50/30 dark:from-slate-800 dark:to-indigo-950/20 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                                            <Plus className="w-4 h-4 text-white" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Withdrawal Method</h3>
                                    </div>
                                    <button onClick={() => { setShowAddMethod(false); setFormType(null); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200">
                                        <X className="w-5 h-5 text-slate-500" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-6">
                                {!formType ? (
                                    <div className="space-y-3">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                                            Choose the type of withdrawal method to add. Mobile money accounts are managed by admin.
                                        </p>
                                        {([
                                            { type: "LOCAL_BANK" as const, label: "Local Bank Account", desc: "Cameroonian bank from catalog", icon: Building2, color: "text-indigo-500" },
                                            { type: "INTERNATIONAL_BANK" as const, label: "International Bank", desc: "SWIFT / IBAN transfer", icon: Globe, color: "text-purple-500" },
                                            { type: "PREPAID_CARD" as const, label: "Prepaid Card", desc: "Visa or Mastercard", icon: CreditCard, color: "text-rose-500" },
                                        ]).map(({ type, label, desc, icon: Icon, color }) => (
                                            <button
                                                key={type}
                                                onClick={() => setFormType(type)}
                                                className="group w-full flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200"
                                            >
                                                <div className={`p-2 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 group-hover:scale-110 transition-transform duration-200`}>
                                                    <Icon className={`w-5 h-5 ${color}`} />
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{label}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
                                                </div>
                                                <ChevronDown className="w-4 h-4 text-slate-400 -rotate-90 group-hover:translate-x-1 transition-transform duration-200" />
                                            </button>
                                        ))}
                                    </div>
                                ) : formType === "LOCAL_BANK" ? (
                                    <form onSubmit={handleLocalBankSubmit} className="space-y-4">
                                        <button type="button" onClick={() => setFormType(null)} className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 mb-2 font-medium">
                                            ← Back
                                        </button>
                                        <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                                            <Building2 className="w-4 h-4 text-indigo-500" /> Local Bank Account
                                        </h4>
                                        {/* Bank dropdown */}
                                        <div>
                                            <label className="text-xs font-bold text-slate-900 dark:text-white mb-1.5 block">Bank Name</label>
                                            <select
                                                value={localBank.bank_code}
                                                onChange={(e) => setLocalBank((p) => ({ ...p, bank_code: e.target.value }))}
                                                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all cursor-pointer"
                                                required
                                            >
                                                <option value="">Select a bank...</option>
                                                {loadingLocalBanks ? (
                                                    <option disabled>Loading banks...</option>
                                                ) : (
                                                    localBanksData?.banks.map((bank) => (
                                                        <option key={bank.id} value={bank.code}>
                                                            {bank.name}
                                                        </option>
                                                    ))
                                                )}
                                            </select>
                                        </div>
                                        {[
                                            { key: "branch_code", label: "Branch Code", placeholder: "001" },
                                            { key: "account_number", label: "Account Number", placeholder: "12345678901" },
                                            { key: "account_key", label: "Account Key", placeholder: "23" },
                                            { key: "account_name", label: "Account Name", placeholder: "Acme Corp" },
                                        ].map(({ key, label, placeholder }) => (
                                            <div key={key}>
                                                <label className="text-xs font-bold text-slate-900 dark:text-white mb-1.5 block">{label}</label>
                                                <input
                                                    type="text"
                                                    value={localBank[key as keyof typeof localBank]}
                                                    onChange={(e) => setLocalBank((p) => ({ ...p, [key]: e.target.value }))}
                                                    placeholder={placeholder}
                                                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                                    required
                                                />
                                            </div>
                                        ))}
                                        <div className="flex gap-3 pt-2">
                                            <button type="button" onClick={() => setFormType(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200">
                                                Cancel
                                            </button>
                                            <button type="submit" disabled={submittingLocal} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200">
                                                {submittingLocal ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Submit for Approval"}
                                            </button>
                                        </div>
                                    </form>
                                ) : formType === "INTERNATIONAL_BANK" ? (
                                    <form onSubmit={handleIntlBankSubmit} className="space-y-4">
                                        <button type="button" onClick={() => setFormType(null)} className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 mb-2 font-medium">
                                            ← Back
                                        </button>
                                        <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                                            <Globe className="w-4 h-4 text-purple-500" /> International Bank Account
                                        </h4>
                                        {[
                                            { key: "bank_name", label: "Bank Name", placeholder: "HSBC", required: true },
                                            { key: "country", label: "Country Code", placeholder: "GB", required: true },
                                            { key: "swift_code", label: "SWIFT Code", placeholder: "HBUKGB4B", required: true },
                                            { key: "routing_number", label: "Routing Number", placeholder: "400515", required: false },
                                            { key: "iban", label: "IBAN", placeholder: "GB29NWBK60161331926819", required: true },
                                            { key: "account_number", label: "Account Number", placeholder: "31926819", required: true },
                                            { key: "account_currency", label: "Account Currency", placeholder: "GBP", required: true },
                                            { key: "account_name", label: "Account Name", placeholder: "Acme Corp", required: true },
                                        ].map(({ key, label, placeholder, required }) => (
                                            <div key={key}>
                                                <label className="text-xs font-bold text-slate-900 dark:text-white mb-1.5 block">{label}{!required && " (Optional)"}</label>
                                                <input
                                                    type="text"
                                                    value={intlBank[key as keyof typeof intlBank]}
                                                    onChange={(e) => setIntlBank((p) => ({ ...p, [key]: e.target.value }))}
                                                    placeholder={placeholder}
                                                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                                    required={required}
                                                />
                                            </div>
                                        ))}
                                        <div className="flex gap-3 pt-2">
                                            <button type="button" onClick={() => setFormType(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200">
                                                Cancel
                                            </button>
                                            <button type="submit" disabled={submittingIntl} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200">
                                                {submittingIntl ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Submit for Approval"}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <form onSubmit={handleCardSubmit} className="space-y-4">
                                        <button type="button" onClick={() => setFormType(null)} className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 mb-2 font-medium">
                                            ← Back
                                        </button>
                                        <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                                            <CreditCard className="w-4 h-4 text-rose-500" /> Prepaid Card
                                        </h4>
                                        <div>
                                            <label className="text-xs font-bold text-slate-900 dark:text-white mb-1.5 block">Card Network</label>
                                            <select
                                                value={card.card_network}
                                                onChange={(e) => setCard((p) => ({ ...p, card_network: e.target.value as "VISA" | "MASTERCARD" }))}
                                                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all cursor-pointer"
                                            >
                                                <option value="VISA">Visa</option>
                                                <option value="MASTERCARD">Mastercard</option>
                                            </select>
                                        </div>
                                        {[
                                            { key: "cardholder_name", label: "Cardholder Name", placeholder: "John Doe" },
                                            { key: "client_id", label: "Client ID (digits only)", placeholder: "123456" },
                                            { key: "last_four_digits", label: "Last 4 Digits", placeholder: "4242", maxLength: 4 },
                                        ].map(({ key, label, placeholder, maxLength }) => (
                                            <div key={key}>
                                                <label className="text-xs font-bold text-slate-900 dark:text-white mb-1.5 block">{label}</label>
                                                <input
                                                    type="text"
                                                    value={card[key as keyof typeof card] as string}
                                                    onChange={(e) => setCard((p) => ({ ...p, [key]: e.target.value }))}
                                                    placeholder={placeholder}
                                                    maxLength={maxLength}
                                                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                                    required
                                                />
                                            </div>
                                        ))}
                                        <div className="flex gap-3 pt-2">
                                            <button type="button" onClick={() => setFormType(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200">
                                                Cancel
                                            </button>
                                            <button type="submit" disabled={submittingCard} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200">
                                                {submittingCard ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Submit for Approval"}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ---- Withdraw Funds Modal - Enhanced ---- */}
                {showWithdrawModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={closeWithdrawModal}>
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                            <div className="sticky top-0 bg-gradient-to-r from-white to-indigo-50/30 dark:from-slate-800 dark:to-indigo-950/20 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                                            <ArrowUpFromLine className="w-4 h-4 text-white" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                            {withdrawalSuccess ? "Withdrawal Summary" : "Withdraw Funds"}
                                        </h3>
                                    </div>
                                    <button onClick={closeWithdrawModal} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200">
                                        <X className="w-5 h-5 text-slate-500" />
                                    </button>
                                </div>
                            </div>

                            {withdrawalSuccess ? (
                                <div className="p-6 space-y-6">
                                    <div className="flex flex-col items-center text-center space-y-3">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                                            <CheckCircle2 className="w-8 h-8 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Request Successful</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Your withdrawal has been initiated and is now {withdrawalSuccess.status.toLowerCase()}.</p>
                                        </div>
                                    </div>

                                    <div className="rounded-xl bg-slate-50 dark:bg-slate-900/30 p-4 space-y-3 border border-slate-200 dark:border-slate-700">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500 dark:text-slate-400">Amount</span>
                                            <span className="font-bold text-slate-900 dark:text-white">{parseFloat(withdrawalSuccess.amount).toLocaleString()} {currency}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500 dark:text-slate-400">Withdrawal Fee</span>
                                            <span className="font-bold text-rose-600">+{parseFloat(withdrawalSuccess.withdrawalFee).toLocaleString()} {currency}</span>
                                        </div>
                                        <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-3 flex justify-between text-base">
                                            <span className="font-bold text-slate-900 dark:text-white">Total Deduction</span>
                                            <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{parseFloat(withdrawalSuccess.totalDeduction).toLocaleString()} {currency}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold px-1">
                                            <span>Reference</span>
                                            <span className="font-mono">{withdrawalSuccess.withdrawalId.slice(0, 12)}...</span>
                                        </div>
                                        <button
                                            onClick={closeWithdrawModal}
                                            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-bold hover:shadow-lg transition-all duration-200"
                                        >
                                            Done
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleWithdraw} className="p-6 space-y-5">
                                    <div>
                                        <label className="text-xs font-bold text-slate-900 dark:text-white mb-1.5 block">Withdrawal Method</label>
                                        <select
                                            value={selectedMethodId}
                                            onChange={(e) => {
                                                setSelectedMethodId(e.target.value);
                                                if (withdrawError) setWithdrawError("");
                                            }}
                                            className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all cursor-pointer"
                                            required
                                        >
                                            <option value="">Select a method...</option>
                                            {activeMethods.map((m) => (
                                                <option key={m.id} value={m.id}>
                                                    {m.methodType === "MOBILE_MONEY" && `${m.gateway?.replace(/_/g, " ")} — ${m.msisdn}`}
                                                    {m.methodType === "LOCAL_BANK" && `${m.bankName} — ${m.accountNumber}`}
                                                    {m.methodType === "INTERNATIONAL_BANK" && `${m.bankName} (${m.country})`}
                                                    {m.methodType === "PREPAID_CARD" && `${m.cardNetwork} •••• ${m.lastFourDigits}`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-900 dark:text-white mb-1.5 block">Amount ({currency})</label>
                                        <input
                                            type="number"
                                            min="1"
                                            step="1"
                                            value={withdrawAmount}
                                            onChange={(e) => {
                                                setWithdrawAmount(e.target.value);
                                                if (withdrawError) setWithdrawError("");
                                            }}
                                            placeholder="50000"
                                            className={`w-full px-4 py-2.5 bg-white dark:bg-slate-900 border ${withdrawError ? "border-rose-500 focus:ring-rose-500" : "border-slate-200 dark:border-slate-700 focus:ring-indigo-500"} rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all`}
                                            required
                                        />
                                        {withdrawError && (
                                            <p className="mt-2 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5 font-medium bg-rose-50 dark:bg-rose-500/10 p-2 rounded-lg border border-rose-200 dark:border-rose-500/20">
                                                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                                {withdrawError.replace(/BELOW_MINIMUM:|ABOVE_MAXIMUM:/, "").trim()}
                                            </p>
                                        )}
                                    </div>

                                    {isReviewingWithdrawal ? (
                                        <>
                                            <div className="rounded-xl bg-slate-50 dark:bg-slate-900/30 p-4 space-y-3 border border-slate-200 dark:border-slate-700">
                                                <div className="flex justify-between gap-4 text-sm">
                                                    <span className="text-slate-500 dark:text-slate-400">Method</span>
                                                    <span className="font-semibold text-slate-900 dark:text-white text-right">{selectedMethod ? formatMethodLabel(selectedMethod) : "-"}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-500 dark:text-slate-400">Amount</span>
                                                    <span className="font-semibold text-slate-900 dark:text-white">{parseFloat(withdrawAmount || "0").toLocaleString()} {currency}</span>
                                                </div>
                                                <div className="flex justify-between gap-4 text-sm">
                                                    <span className="text-slate-500 dark:text-slate-400">Withdrawal Fee</span>
                                                    <span className="font-semibold text-rose-600 dark:text-rose-400">+{parseFloat(withdrawalQuote?.withdrawalFee ?? "0").toLocaleString()} {currency}</span>
                                                </div>
                                                <div className="flex justify-between gap-4 text-sm">
                                                    <span className="text-slate-500 dark:text-slate-400">Gateway Fee</span>
                                                    <span className="font-semibold text-slate-900 dark:text-white">+{parseFloat(withdrawalQuote?.gatewayFee ?? "0").toLocaleString()} {currency}</span>
                                                </div>
                                                <div className="flex justify-between gap-4 text-sm">
                                                    <span className="text-slate-500 dark:text-slate-400">Platform Fee</span>
                                                    <span className="font-semibold text-slate-900 dark:text-white">+{parseFloat(withdrawalQuote?.platformFee ?? "0").toLocaleString()} {currency}</span>
                                                </div>
                                                <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-3 flex justify-between text-base">
                                                    <span className="font-bold text-slate-900 dark:text-white">Total Deduction</span>
                                                    <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{parseFloat(withdrawalQuote?.totalDeduction ?? "0").toLocaleString()} {currency}</span>
                                                </div>
                                            </div>
                                            <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-3">
                                                <p className="text-xs text-amber-800 dark:text-amber-200">
                                                    This fee breakdown comes from the live withdrawal quote endpoint. Mobile money withdrawals are processed automatically, while bank and card withdrawals may still require manual processing.
                                                </p>
                                            </div>
                                            <div className="flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsReviewingWithdrawal(false)}
                                                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
                                                >
                                                    Back
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={withdrawing}
                                                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                                                >
                                                    {withdrawing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                                    {withdrawing ? "Processing..." : "Submit Withdrawal"}
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-3">
                                                <p className="text-xs text-amber-800 dark:text-amber-200">
                                                    Review your withdrawal before submitting. We'll fetch the exact fee breakdown before processing.
                                                </p>
                                            </div>
                                            <div className="flex gap-3">
                                                <button type="button" onClick={closeWithdrawModal} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200">
                                                    Cancel
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleReviewWithdrawal}
                                                    disabled={!selectedMethodId || !withdrawAmount || quotingWithdrawal}
                                                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                                                >
                                                    {quotingWithdrawal ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                                    {quotingWithdrawal ? "Getting Quote..." : "Review Withdrawal"}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </form>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}