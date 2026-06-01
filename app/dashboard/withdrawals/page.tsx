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
        color: "bg-crimson-red-100 dark:bg-crimson-red-900/20 text-crimson-red-700 dark:text-crimson-red-400",
        icon: <Clock className="w-3 h-3" />,
    },
    ACTIVE: {
        label: "Active",
        color: "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400",
        icon: <CheckCircle2 className="w-3 h-3" />,
    },
    DISABLED: {
        label: "Disabled",
        color: "bg-muted text-muted-foreground",
        icon: <Ban className="w-3 h-3" />,
    },
    REJECTED: {
        label: "Rejected",
        color: "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400",
        icon: <XCircle className="w-3 h-3" />,
    },
};

function MethodTypeIcon({ type }: { type: string }) {
    switch (type) {
        case "LOCAL_BANK": return <Building2 className="w-5 h-5 text-deep-blue-violet-500" />;
        case "INTERNATIONAL_BANK": return <Globe className="w-5 h-5 text-purple-500" />;
        case "PREPAID_CARD": return <CreditCard className="w-5 h-5 text-crimson-red-500" />;
        default: return <Wallet className="w-5 h-5 text-muted-foreground" />;
    }
}

function MethodCard({ method }: { method: WithdrawalMethod }) {
    const status = STATUS_CONFIG[method.status];
    const isAdminOnly = method.adminOnly || method.methodType === "MOBILE_MONEY";

    return (
        <div className="bg-background rounded-xl border border-border p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <MethodTypeIcon type={method.methodType} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                            {method.methodType === "MOBILE_MONEY" && `${method.gateway?.replace(/_/g, " ")} — ${method.msisdn}`}
                            {method.methodType === "LOCAL_BANK" && `${method.bankName} — ${method.accountNumber}`}
                            {method.methodType === "INTERNATIONAL_BANK" && `${method.bankName} (${method.country})`}
                            {method.methodType === "PREPAID_CARD" && `${method.cardNetwork} •••• ${method.lastFourDigits}`}
                            {isAdminOnly && <Lock className="w-3 h-3 text-muted-foreground" />}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {method.methodType === "LOCAL_BANK" && method.accountName}
                            {method.methodType === "INTERNATIONAL_BANK" && `IBAN: ${method.iban}`}
                            {method.methodType === "PREPAID_CARD" && method.cardholderName}
                            {method.methodType === "MOBILE_MONEY" && "Managed by admin"}
                        </p>
                        {method.status === "REJECTED" && method.rejectionReason && (
                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                {method.rejectionReason}
                            </p>
                        )}
                    </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${status.color}`}>
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

    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-foreground">Withdrawals</h1>
                    <p className="text-xs text-muted-foreground mt-1">
                        Manage withdrawal methods and transfer funds from your wallet
                    </p>
                </div>
                <div className="flex gap-2">
                    {activeMethods.length > 0 && (
                        <button
                            onClick={() => {
                                setWithdrawalSuccess(null);
                                setShowWithdrawModal(true);
                            }}
                            className="px-4 py-2 bg-crimson-red-500 text-white rounded-lg text-sm font-semibold hover:bg-crimson-red-600 transition-colors flex items-center gap-2"
                        >
                            <ArrowUpFromLine className="w-4 h-4" />
                            Withdraw Funds
                        </button>
                    )}
                    <button
                        onClick={() => setShowAddMethod(true)}
                        className="px-4 py-2 border border-border text-foreground rounded-lg text-sm font-semibold hover:bg-muted transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Method
                    </button>
                </div>
            </div>

            {/* Withdrawal Methods */}
            <div>
                <h2 className="text-sm font-semibold text-foreground mb-3">Withdrawal Methods</h2>
                {methodsLoading ? (
                    <div className="space-y-3">
                        {[1, 2].map((i) => (
                            <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : methods.length === 0 ? (
                    <div className="bg-background rounded-xl border border-border p-8 text-center">
                        <Wallet className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm font-medium text-foreground mb-1">No withdrawal methods</p>
                        <p className="text-xs text-muted-foreground mb-4">
                            Add a bank account or prepaid card to start withdrawing funds. Mobile money accounts are added by admin.
                        </p>
                        <button
                            onClick={() => setShowAddMethod(true)}
                            className="px-4 py-2 bg-crimson-red-500 text-white rounded-lg text-sm font-semibold hover:bg-crimson-red-600 transition-colors inline-flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add Method
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {methods.map((m) => <MethodCard key={m.id} method={m} />)}
                    </div>
                )}
            </div>

            {/* Recent Withdrawals */}
            <div>
                <h2 className="text-sm font-semibold text-foreground mb-3">Recent Withdrawals</h2>
                <div className="bg-background rounded-xl border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border bg-muted/50">
                                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Date</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Method</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Amount</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Fee</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Total</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {withdrawalsLoading ? (
                                    Array.from({ length: 4 }).map((_, i) => (
                                        <tr key={i} className="border-b border-border">
                                            {Array.from({ length: 5 }).map((__, j) => (
                                                <td key={j} className="py-3 px-4">
                                                    <div className="h-3 bg-muted rounded animate-pulse w-20" />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : withdrawals.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                                            No withdrawals yet
                                        </td>
                                    </tr>
                                ) : (
                                    withdrawals.map((w) => {
                                        const sc = STATUS_CONFIG[w.status as keyof typeof STATUS_CONFIG];
                                        return (
                                            <tr key={w.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                                                <td className="py-3 px-4 text-xs text-foreground">
                                                    {new Date(w.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="py-3 px-4 text-xs text-foreground">
                                                    {w.withdrawalMethod.replace(/_/g, " ")}
                                                </td>
                                                <td className="py-3 px-4 text-xs font-semibold text-foreground">
                                                    {parseFloat(w.amount).toLocaleString()} {currency}
                                                </td>
                                                <td className="py-3 px-4 text-xs text-red-500">
                                                    -{parseFloat(w.withdrawalFee || "0").toLocaleString()} {currency}
                                                </td>
                                                <td className="py-3 px-4 text-xs font-bold text-foreground">
                                                    {parseFloat(w.totalDeduction).toLocaleString()} {currency}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {sc && (
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${sc.color}`}>
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
            </div>

            {/* ---- Add Method Modal ---- */}
            {showAddMethod && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-background rounded-2xl shadow-2xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-5 border-b border-border">
                            <h3 className="text-base font-semibold text-foreground">Add Withdrawal Method</h3>
                            <button onClick={() => { setShowAddMethod(false); setFormType(null); }} className="p-1 hover:bg-muted rounded">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-5">
                            {!formType ? (
                                <div className="space-y-3">
                                    <p className="text-xs text-muted-foreground mb-2">
                                        Choose the type of withdrawal method to add. Mobile money accounts are managed by admin.
                                    </p>
                                    {([
                                        { type: "LOCAL_BANK" as const, label: "Local Bank Account", desc: "Cameroonian bank from catalog", icon: Building2, color: "text-deep-blue-violet-500" },
                                        { type: "INTERNATIONAL_BANK" as const, label: "International Bank", desc: "SWIFT / IBAN transfer", icon: Globe, color: "text-purple-500" },
                                        { type: "PREPAID_CARD" as const, label: "Prepaid Card", desc: "Visa or Mastercard", icon: CreditCard, color: "text-crimson-red-500" },
                                    ]).map(({ type, label, desc, icon: Icon, color }) => (
                                        <button
                                            key={type}
                                            onClick={() => setFormType(type)}
                                            className="w-full flex items-center gap-3 p-4 border border-border rounded-xl hover:bg-muted transition-colors text-left"
                                        >
                                            <Icon className={`w-5 h-5 ${color}`} />
                                            <div>
                                                <p className="text-sm font-semibold text-foreground">{label}</p>
                                                <p className="text-xs text-muted-foreground">{desc}</p>
                                            </div>
                                            <ChevronDown className="w-4 h-4 text-muted-foreground ml-auto -rotate-90" />
                                        </button>
                                    ))}
                                </div>
                            ) : formType === "LOCAL_BANK" ? (
                                <form onSubmit={handleLocalBankSubmit} className="space-y-3">
                                    <button type="button" onClick={() => setFormType(null)} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2">
                                        ← Back
                                    </button>
                                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-deep-blue-violet-500" /> Local Bank Account
                                    </h4>
                                    {/* Bank dropdown */}
                                    <div>
                                        <label className="text-xs font-medium text-foreground mb-1 block">Bank Name</label>
                                        <select
                                            value={localBank.bank_code}
                                            onChange={(e) => setLocalBank((p) => ({ ...p, bank_code: e.target.value }))}
                                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-crimson-red-500"
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
                                    {([
                                        { key: "branch_code", label: "Branch Code", placeholder: "001" },
                                        { key: "account_number", label: "Account Number", placeholder: "12345678901" },
                                        { key: "account_key", label: "Account Key", placeholder: "23" },
                                        { key: "account_name", label: "Account Name", placeholder: "Acme Corp" },
                                    ] as { key: keyof typeof localBank; label: string; placeholder: string }[]).map(({ key, label, placeholder }) => (
                                        <div key={key}>
                                            <label className="text-xs font-medium text-foreground mb-1 block">{label}</label>
                                            <input
                                                type="text"
                                                value={localBank[key]}
                                                onChange={(e) => setLocalBank((p) => ({ ...p, [key]: e.target.value }))}
                                                placeholder={placeholder}
                                                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-crimson-red-500"
                                                required
                                            />
                                        </div>
                                    ))}
                                    <div className="flex gap-2 pt-2">
                                        <button type="button" onClick={() => setFormType(null)} className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg text-sm font-semibold hover:bg-muted transition-colors">
                                            Cancel
                                        </button>
                                        <button type="submit" disabled={submittingLocal} className="flex-1 px-4 py-2 bg-crimson-red-500 text-white rounded-lg text-sm font-semibold hover:bg-crimson-red-600 transition-colors disabled:opacity-50">
                                            {submittingLocal ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Submit for Approval"}
                                        </button>
                                    </div>
                                </form>
                            ) : formType === "INTERNATIONAL_BANK" ? (
                                <form onSubmit={handleIntlBankSubmit} className="space-y-3">
                                    <button type="button" onClick={() => setFormType(null)} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2">
                                        ← Back
                                    </button>
                                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-purple-500" /> International Bank Account
                                    </h4>
                                    {([
                                        { key: "bank_name", label: "Bank Name", placeholder: "HSBC", required: true },
                                        { key: "country", label: "Country Code", placeholder: "GB", required: true },
                                        { key: "swift_code", label: "SWIFT Code", placeholder: "HBUKGB4B", required: true },
                                        { key: "routing_number", label: "Routing Number (optional)", placeholder: "400515", required: false },
                                        { key: "iban", label: "IBAN", placeholder: "GB29NWBK60161331926819", required: true },
                                        { key: "account_number", label: "Account Number", placeholder: "31926819", required: true },
                                        { key: "account_currency", label: "Account Currency", placeholder: "GBP", required: true },
                                        { key: "account_name", label: "Account Name", placeholder: "Acme Corp", required: true },
                                    ] as { key: keyof typeof intlBank; label: string; placeholder: string; required: boolean }[]).map(({ key, label, placeholder, required }) => (
                                        <div key={key}>
                                            <label className="text-xs font-medium text-foreground mb-1 block">{label}</label>
                                            <input
                                                type="text"
                                                value={intlBank[key]}
                                                onChange={(e) => setIntlBank((p) => ({ ...p, [key]: e.target.value }))}
                                                placeholder={placeholder}
                                                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-crimson-red-500"
                                                required={required}
                                            />
                                        </div>
                                    ))}
                                    <div className="flex gap-2 pt-2">
                                        <button type="button" onClick={() => setFormType(null)} className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg text-sm font-semibold hover:bg-muted transition-colors">
                                            Cancel
                                        </button>
                                        <button type="submit" disabled={submittingIntl} className="flex-1 px-4 py-2 bg-crimson-red-500 text-white rounded-lg text-sm font-semibold hover:bg-crimson-red-600 transition-colors disabled:opacity-50">
                                            {submittingIntl ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Submit for Approval"}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={handleCardSubmit} className="space-y-3">
                                    <button type="button" onClick={() => setFormType(null)} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2">
                                        ← Back
                                    </button>
                                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                        <CreditCard className="w-4 h-4 text-crimson-red-500" /> Prepaid Card
                                    </h4>
                                    <div>
                                        <label className="text-xs font-medium text-foreground mb-1 block">Card Network</label>
                                        <select
                                            value={card.card_network}
                                            onChange={(e) => setCard((p) => ({ ...p, card_network: e.target.value as "VISA" | "MASTERCARD" }))}
                                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-crimson-red-500"
                                        >
                                            <option value="VISA">Visa</option>
                                            <option value="MASTERCARD">Mastercard</option>
                                        </select>
                                    </div>
                                    {([
                                        { key: "cardholder_name", label: "Cardholder Name", placeholder: "John Doe", pattern: undefined, maxLength: undefined },
                                        { key: "client_id", label: "Client ID (digits only)", placeholder: "123456", pattern: "[0-9]+", maxLength: undefined },
                                        { key: "last_four_digits", label: "Last 4 Digits", placeholder: "4242", pattern: "[0-9]{4}", maxLength: 4 },
                                    ] as { key: keyof typeof card; label: string; placeholder: string; pattern?: string; maxLength?: number }[]).map(({ key, label, placeholder, pattern, maxLength }) => (
                                        <div key={key}>
                                            <label className="text-xs font-medium text-foreground mb-1 block">{label}</label>
                                            <input
                                                type="text"
                                                value={card[key] as string}
                                                onChange={(e) => setCard((p) => ({ ...p, [key]: e.target.value }))}
                                                placeholder={placeholder}
                                                pattern={pattern}
                                                maxLength={maxLength}
                                                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-crimson-red-500"
                                                required
                                            />
                                        </div>
                                    ))}
                                    <div className="flex gap-2 pt-2">
                                        <button type="button" onClick={() => setFormType(null)} className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg text-sm font-semibold hover:bg-muted transition-colors">
                                            Cancel
                                        </button>
                                        <button type="submit" disabled={submittingCard} className="flex-1 px-4 py-2 bg-crimson-red-500 text-white rounded-lg text-sm font-semibold hover:bg-crimson-red-600 transition-colors disabled:opacity-50">
                                            {submittingCard ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Submit for Approval"}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ---- Withdraw Funds Modal ---- */}
            {showWithdrawModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-background rounded-2xl shadow-2xl border border-border w-full max-w-md">
                        <div className="flex items-center justify-between p-5 border-b border-border">
                            <h3 className="text-base font-semibold text-foreground">
                                {withdrawalSuccess ? "Withdrawal Summary" : "Withdraw Funds"}
                            </h3>
                            <button onClick={closeWithdrawModal} className="p-1 hover:bg-muted rounded">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {withdrawalSuccess ? (
                            <div className="p-6 space-y-6">
                                <div className="flex flex-col items-center text-center space-y-2">
                                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center text-green-600 mb-2">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <h4 className="text-lg font-bold text-foreground">Request Successful</h4>
                                    <p className="text-xs text-muted-foreground">Your withdrawal has been initiated and is now {withdrawalSuccess.status.toLowerCase()}.</p>
                                </div>

                                <div className="bg-muted/30 rounded-xl p-4 space-y-3 border border-border">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Amount</span>
                                        <span className="font-medium text-foreground">{parseFloat(withdrawalSuccess.amount).toLocaleString()} {currency}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Withdrawal Fee</span>
                                        <span className="font-medium text-red-500">+{parseFloat(withdrawalSuccess.withdrawalFee).toLocaleString()} {currency}</span>
                                    </div>
                                    <div className="border-t border-border pt-3 mt-3 flex justify-between text-base font-bold">
                                        <span className="text-foreground">Total Deduction</span>
                                        <span className="text-crimson-red-600">{parseFloat(withdrawalSuccess.totalDeduction).toLocaleString()} {currency}</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider font-semibold px-1">
                                        <span>Reference</span>
                                        <span className="font-mono">{withdrawalSuccess.withdrawalId.slice(0, 8)}...</span>
                                    </div>
                                    <button
                                        onClick={closeWithdrawModal}
                                        className="w-full py-3 bg-foreground text-background rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
                                    >
                                        Done
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleWithdraw} className="p-5 space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-foreground mb-1.5 block">Withdrawal Method</label>
                                    <select
                                        value={selectedMethodId}
                                        onChange={(e) => {
                                            setSelectedMethodId(e.target.value);
                                            if (withdrawError) setWithdrawError("");
                                        }}
                                        className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-crimson-red-500"
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
                                    <label className="text-xs font-medium text-foreground mb-1.5 block">Amount ({currency})</label>
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
                                        className={`w-full px-3 py-2.5 bg-background border ${withdrawError ? "border-red-500 focus:ring-red-500" : "border-border focus:ring-crimson-red-500"} rounded-lg text-sm focus:outline-none focus:ring-2`}
                                        required
                                    />
                                    {withdrawError && (
                                        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1.5 font-medium bg-red-50 dark:bg-red-900/10 p-2 rounded-lg border border-red-200 dark:border-red-900">
                                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                            {withdrawError.replace(/BELOW_MINIMUM:|ABOVE_MAXIMUM:/, "").trim()}
                                        </p>
                                    )}
                                </div>
                                {isReviewingWithdrawal ? (
                                    <>
                                        <div className="bg-muted/30 rounded-xl p-4 space-y-3 border border-border">
                                            <div className="flex justify-between text-sm gap-4">
                                                <span className="text-muted-foreground">Method</span>
                                                <span className="font-medium text-foreground text-right">{selectedMethod ? formatMethodLabel(selectedMethod) : "-"}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Amount</span>
                                                <span className="font-medium text-foreground">{parseFloat(withdrawAmount || "0").toLocaleString()} {currency}</span>
                                            </div>
                                            <div className="flex justify-between text-sm gap-4">
                                                <span className="text-muted-foreground">Withdrawal Fee</span>
                                                <span className="font-medium text-foreground text-right">
                                                    +{parseFloat(withdrawalQuote?.withdrawalFee ?? "0").toLocaleString()} {currency}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm gap-4">
                                                <span className="text-muted-foreground">Gateway Fee</span>
                                                <span className="font-medium text-foreground text-right">
                                                    +{parseFloat(withdrawalQuote?.gatewayFee ?? "0").toLocaleString()} {currency}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm gap-4">
                                                <span className="text-muted-foreground">Platform Fee</span>
                                                <span className="font-medium text-foreground text-right">
                                                    +{parseFloat(withdrawalQuote?.platformFee ?? "0").toLocaleString()} {currency}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm gap-4">
                                                <span className="text-muted-foreground">Total Deduction</span>
                                                <span className="font-medium text-foreground text-right">
                                                    {parseFloat(withdrawalQuote?.totalDeduction ?? "0").toLocaleString()} {currency}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                                            <p className="text-xs text-amber-700 dark:text-amber-400">
                                                This fee breakdown comes from the live withdrawal quote endpoint. Mobile money withdrawals are processed automatically, while bank and card withdrawals may still require manual processing after submission.
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setIsReviewingWithdrawal(false)}
                                                className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg text-sm font-semibold hover:bg-muted transition-colors"
                                            >
                                                Back
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={withdrawing}
                                                className="flex-1 px-4 py-2 bg-crimson-red-500 text-white rounded-lg text-sm font-semibold hover:bg-crimson-red-600 transition-colors disabled:opacity-50"
                                            >
                                                {withdrawing ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Submit Withdrawal"}
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                                            <p className="text-xs text-amber-700 dark:text-amber-400">
                                                Review your withdrawal before submitting. We’ll fetch the exact fee breakdown from ZoPay before anything is created.
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button type="button" onClick={closeWithdrawModal} className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg text-sm font-semibold hover:bg-muted transition-colors">
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleReviewWithdrawal}
                                                disabled={!selectedMethodId || !withdrawAmount || quotingWithdrawal}
                                                className="flex-1 px-4 py-2 bg-crimson-red-500 text-white rounded-lg text-sm font-semibold hover:bg-crimson-red-600 transition-colors disabled:opacity-50"
                                            >
                                                {quotingWithdrawal ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Review Withdrawal"}
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
    );
}
