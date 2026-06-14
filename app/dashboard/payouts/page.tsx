"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
    Search,
    Download,
    CheckCircle2,
    Clock,
    XCircle,
    ArrowUpFromLine,
    X,
    Plus,
    Upload,
    ChevronLeft,
    ChevronRight,
    Loader2,
    AlertTriangle,
    FileText,
    Trash2,
    Send,
    Wallet,
    TrendingUp,
    Users,
    Zap,
    Shield,
    CreditCard,
    Smartphone,
    DollarSign,
    Calendar,
    Activity,
    Server,
} from "lucide-react";
import { useEnvironment } from "@/core/environment/EnvironmentContext";
import { useVerifyMsisdn } from "@/features/withdrawals/hooks/index";
import {
    useUploadPayoutCsv,
    usePreviewCsvBatch,
    usePreviewManualBatch,
    useConfirmBatch,
    useCancelBatch,
    useCreatePayoutQuote,
    useExecutePayout,
    usePayouts,
    useGetBatch,
} from "@/features/payouts/hooks/index";
import { downloadPayoutReceipt } from "@/features/payouts/api/index";
import type {
    BulkPreviewRow,
    BulkUnverifiedRow,
    BulkPreviewResponse,
    BulkConfirmResponse,
    ManualPreviewRow,
    Payout,
    PayoutQuote,
} from "@/features/payouts/types/index";
import { toast } from "sonner";

// ============ TYPES ============

type ModalStep =
    | null
    | { type: "single" }
    | { type: "singleReview"; quote: PayoutQuote }
    | { type: "manual" }
    | { type: "csv" }
    | { type: "preview"; preview: BulkPreviewResponse }
    | { type: "result"; result: BulkConfirmResponse };

type DashboardPayout = Omit<Payout, "amount"> & {
    amount: number;
    recipient: string;
};

// ============ HELPERS ============

const getStatusConfig = (status: string) => {
    switch (status.toUpperCase()) {
        case "SUCCESS": return { bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-500/20", icon: CheckCircle2 };
        case "PENDING_GATEWAY": return { bg: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-700 dark:text-amber-400", border: "border-amber-200 dark:border-amber-500/20", icon: Clock };
        case "FAILED": return { bg: "bg-rose-50 dark:bg-rose-500/10", text: "text-rose-700 dark:text-rose-400", border: "border-rose-200 dark:border-rose-500/20", icon: XCircle };
        default: return { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-400", border: "border-slate-200 dark:border-slate-700", icon: Activity };
    }
};

const formatStatus = (status: string) =>
    status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const compactName = (...parts: Array<string | null | undefined>) =>
    parts.map((part) => part?.trim()).filter(Boolean).join(" ");

const getPreviewRecipientName = (row: BulkPreviewRow | BulkUnverifiedRow) =>
    row.name?.trim()
    || row.recipientName?.trim()
    || row.displayName?.trim()
    || compactName(row.given_name, row.family_name)
    || compactName(row.firstName, row.lastName);

const parseMoney = (value: string | number | null | undefined) => {
    const parsed = typeof value === "number" ? value : parseFloat(value ?? "");
    return Number.isFinite(parsed) ? parsed : 0;
};

const getPreviewExecutableCount = (preview: BulkPreviewResponse, includeUnverified: boolean) =>
    includeUnverified ? preview.executableCount : preview.validCount;

const getPreviewRecipientTotal = (preview: BulkPreviewResponse, includeUnverified: boolean) =>
    parseMoney(includeUnverified ? preview.totalAmountWithUnverified : preview.totalAmount);

// ============ EXPIRY TIMER ============

function ExpiryTimer({ expiresAt }: { expiresAt: string }) {
    const [remaining, setRemaining] = useState("");

    useEffect(() => {
        const tick = () => {
            const diff = new Date(expiresAt).getTime() - Date.now();
            if (diff <= 0) { setRemaining("Expired"); return; }
            const m = Math.floor(diff / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setRemaining(`${m}:${s.toString().padStart(2, "0")}`);
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [expiresAt]);

    const isWarning = remaining !== "Expired" && parseInt(remaining) < 5;

    return (
        <span className={`font-mono font-bold ${isWarning || remaining === "Expired" ? "text-rose-500" : "text-indigo-600 dark:text-indigo-400"}`}>
            {remaining}
        </span>
    );
}

// ============ PREVIEW STEP ============

function PreviewStep({
    preview,
    onConfirmed,
    onCancel,
}: {
    preview: BulkPreviewResponse;
    onConfirmed: (result: BulkConfirmResponse) => void;
    onCancel: () => void;
}) {
    const [memo, setMemo] = useState("");
    const [includeUnverified, setIncludeUnverified] = useState(false);
    const { mutate: confirm, isPending: confirming } = useConfirmBatch();
    const { mutate: cancel } = useCancelBatch();
    const hasUnverified = preview.unverifiedCount > 0;
    const executableCount = getPreviewExecutableCount(preview, includeUnverified);
    const recipientTotal = getPreviewRecipientTotal(preview, includeUnverified);

    const handleConfirm = () => {
        confirm(
            {
                payload: {
                    batchId: preview.batchId,
                    memo: memo.trim() || undefined,
                    includeUnverified,
                },
            },
            {
                onSuccess: onConfirmed,
                onError: (err) => toast.error(err.message),
            }
        );
    };

    const handleCancel = () => {
        cancel({ batchId: preview.batchId });
        onCancel();
    };

    return (
        <div className="space-y-5">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-500/20 p-3 text-center">
                    <p className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">Valid</p>
                    <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{preview.validCount}</p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-500/20 p-3 text-center">
                    <p className="text-[10px] font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">Unverified</p>
                    <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{preview.unverifiedCount}</p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20 border border-rose-200 dark:border-rose-500/20 p-3 text-center">
                    <p className="text-[10px] font-medium text-rose-700 dark:text-rose-400 uppercase tracking-wider mb-1">Invalid</p>
                    <p className="text-2xl font-bold text-rose-700 dark:text-rose-400">{preview.invalidCount}</p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-200 dark:border-indigo-500/20 p-3 text-center">
                    <p className="text-[10px] font-medium text-indigo-700 dark:text-indigo-400 uppercase tracking-wider mb-1">Recipient Gets</p>
                    <p className="text-xl font-bold text-indigo-700 dark:text-indigo-400">
                        {recipientTotal.toLocaleString()} {preview.currency}
                    </p>
                </div>
            </div>

            {/* Expiry */}
            <div className="flex items-center justify-between text-xs rounded-xl bg-slate-50 dark:bg-slate-900/50 px-4 py-2.5 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-600 dark:text-slate-400">Batch expires in:</span>
                <ExpiryTimer expiresAt={preview.expiresAt} />
            </div>

            {hasUnverified && (
                <div className="rounded-xl border border-amber-200 dark:border-amber-500/20 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-4 space-y-3">
                    <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm font-bold text-amber-900 dark:text-amber-100">Handle unverified rows</p>
                            <p className="text-xs text-amber-800 dark:text-amber-200 mt-1">
                                Verified rows were confirmed by lookup. Unverified rows were not confirmed because the gateway did not return verification feedback.
                            </p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="flex items-start gap-3 rounded-xl border border-amber-200 dark:border-amber-700 bg-white dark:bg-slate-800 px-4 py-3 cursor-pointer transition-all hover:shadow-md">
                            <input
                                type="radio"
                                name="unverified-mode"
                                checked={!includeUnverified}
                                onChange={() => setIncludeUnverified(false)}
                                className="mt-0.5"
                            />
                            <div className="text-xs">
                                <p className="font-bold text-slate-900 dark:text-white">Send verified rows only</p>
                                <p className="text-slate-500 dark:text-slate-400 mt-1">
                                    {preview.validCount} row{preview.validCount !== 1 ? "s" : ""} for {parseMoney(preview.totalAmount).toLocaleString()} {preview.currency}
                                </p>
                            </div>
                        </label>
                        <label className="flex items-start gap-3 rounded-xl border border-amber-200 dark:border-amber-700 bg-white dark:bg-slate-800 px-4 py-3 cursor-pointer transition-all hover:shadow-md">
                            <input
                                type="radio"
                                name="unverified-mode"
                                checked={includeUnverified}
                                onChange={() => setIncludeUnverified(true)}
                                className="mt-0.5"
                            />
                            <div className="text-xs">
                                <p className="font-bold text-slate-900 dark:text-white">Send verified + unverified rows</p>
                                <p className="text-slate-500 dark:text-slate-400 mt-1">
                                    {preview.executableCount} row{preview.executableCount !== 1 ? "s" : ""} for {parseMoney(preview.totalAmountWithUnverified).toLocaleString()} {preview.currency}
                                </p>
                            </div>
                        </label>
                    </div>
                </div>
            )}

            {/* Valid rows */}
            {preview.valid.length > 0 && (
                <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        Verified recipients ({preview.validCount})
                    </p>
                    <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800/50">
                        {preview.valid.map((row, i) => {
                            const recipientName = getPreviewRecipientName(row);
                            return (
                                <div key={i} className="flex items-center justify-between px-4 py-2.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                    <div>
                                        {typeof row.rowIndex === "number" && (
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400">Row {row.rowIndex}</p>
                                        )}
                                        <p className="font-mono font-semibold text-slate-900 dark:text-white">{row.msisdn}</p>
                                        {recipientName && <p className="text-slate-500 dark:text-slate-400 mt-0.5">{recipientName}</p>}
                                    </div>
                                    <span className="font-bold text-slate-900 dark:text-white">
                                        {parseMoney(row.amount).toLocaleString()} {row.currency}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Unverified rows */}
            {preview.unverified.length > 0 && (
                <div>
                    <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Unverified ({preview.unverifiedCount})
                    </p>
                    <div className="max-h-32 overflow-y-auto rounded-xl border border-amber-200 dark:border-amber-500/20 divide-y divide-amber-100 dark:divide-amber-800 bg-amber-50 dark:bg-amber-950/20">
                        {preview.unverified.map((row, i) => {
                            const recipientName = getPreviewRecipientName(row);
                            return (
                                <div key={i} className="flex items-center justify-between gap-3 px-4 py-2.5 text-xs">
                                    <div>
                                        {typeof row.rowIndex === "number" && (
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400">Row {row.rowIndex}</p>
                                        )}
                                        <p className="font-mono font-semibold text-slate-900 dark:text-white">{row.msisdn}</p>
                                        {recipientName && <p className="text-slate-500 dark:text-slate-400 mt-0.5">{recipientName}</p>}
                                        <p className="text-amber-700 dark:text-amber-400 mt-1 text-[10px]">{row.reason}</p>
                                    </div>
                                    <span className="font-bold text-slate-900 dark:text-white">
                                        {parseMoney(row.amount).toLocaleString()} {row.currency}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Invalid rows */}
            {preview.invalid.length > 0 && (
                <div>
                    <p className="text-xs font-bold text-rose-700 dark:text-rose-400 mb-2 flex items-center gap-2">
                        <XCircle className="w-3.5 h-3.5" />
                        Invalid ({preview.invalidCount})
                    </p>
                    <div className="max-h-28 overflow-y-auto rounded-xl border border-rose-200 dark:border-rose-500/20 divide-y divide-rose-100 dark:divide-rose-800 bg-rose-50 dark:bg-rose-950/20">
                        {preview.invalid.map((row, i) => (
                            <div key={i} className="flex items-center justify-between px-4 py-2.5 text-xs">
                                <div>
                                    {typeof row.rowIndex === "number" && (
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Row {row.rowIndex}</p>
                                    )}
                                    <span className="font-mono text-slate-900 dark:text-white">{row.msisdn}</span>
                                </div>
                                <span className="text-rose-700 dark:text-rose-400 text-right text-[10px]">{row.reason}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Memo */}
            <div>
                <label className="text-xs font-bold text-slate-900 dark:text-white mb-1.5 block">
                    Memo <span className="font-normal text-slate-500 dark:text-slate-400">(optional)</span>
                </label>
                <input
                    type="text"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="April salary payments"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
                <button
                    onClick={handleCancel}
                    disabled={confirming}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
                >
                    Cancel
                </button>
                <button
                    onClick={handleConfirm}
                    disabled={confirming || executableCount === 0}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {confirming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {confirming ? "Sending..." : `Confirm & Send ${executableCount} payout${executableCount !== 1 ? "s" : ""}`}
                </button>
            </div>
        </div>
    );
}

// ============ RESULT STEP ============

function ResultStep({
    result,
    onClose,
}: {
    result: BulkConfirmResponse;
    onClose: () => void;
}) {
    const isAwaitingApproval = result.status === "AWAITING_APPROVAL";
    const isProcessing = result.status === "PROCESSING";
    const { data: batch } = useGetBatch(result.batchId);
    const items = batch?.items ?? [];
    const successCount = items.filter((item) => item.status === "SUCCESS").length;
    const failedCount = items.filter((item) => item.status === "FAILED").length;
    const skippedCount = items.filter((item) => item.status === "SKIPPED").length;
    const processingCount = items.filter((item) => item.status === "PROCESSING" || item.status === "PENDING").length;
    const completedCount = successCount + failedCount + skippedCount;
    const totalCount = items.length || batch?.executableCount || 0;

    return (
        <div className="text-center space-y-5 py-4">
            {isProcessing ? (
                <>
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                    <div>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">Batch Processing</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-xs mx-auto">
                            The backend has started processing this batch in the background. You can safely leave this page and come back later.
                        </p>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        <div className="rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 p-3">
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">Done</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white">{completedCount}/{totalCount || "..."}</p>
                        </div>
                        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-3">
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Success</p>
                            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{successCount}</p>
                        </div>
                        <div className="rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 p-3">
                            <p className="text-[10px] text-rose-600 dark:text-rose-400">Failed</p>
                            <p className="text-xl font-bold text-rose-700 dark:text-rose-400">{failedCount}</p>
                        </div>
                        <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-3">
                            <p className="text-[10px] text-amber-600 dark:text-amber-400">Skipped</p>
                            <p className="text-xl font-bold text-amber-700 dark:text-amber-400">{skippedCount}</p>
                        </div>
                    </div>
                </>
            ) : isAwaitingApproval ? (
                <>
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                        <Clock className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">Awaiting Admin Approval</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-xs mx-auto">
                            Your batch exceeds the approval threshold. Payouts have NOT been sent yet.
                            You will be notified by email once an admin approves or rejects it.
                        </p>
                    </div>
                </>
            ) : (
                <>
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                        <CheckCircle2 className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">Payouts Sent!</p>
                        {result.executionSummary && (
                            <div className="flex justify-center gap-6 mt-3">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                        {result.executionSummary.successCount}
                                    </p>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Successful</p>
                                </div>
                                {result.executionSummary.failedCount > 0 && (
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                                            {result.executionSummary.failedCount}
                                        </p>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Failed</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}
            {result.memo && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    Memo: <span className="font-medium text-slate-900 dark:text-white">{result.memo}</span>
                </p>
            )}
            <button
                onClick={onClose}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all duration-200"
            >
                Done
            </button>
        </div>
    );
}

// ============ STAT CARD COMPONENT ============

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

// ============ MAIN PAGE ============

export default function PayoutsPage() {
    const { environment } = useEnvironment();
    const apiKey = "";
    const secretKey = "internal-dashboard-payout";

    const [step, setStep] = useState<ModalStep>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [downloadingReceiptId, setDownloadingReceiptId] = useState<string | null>(null);
    const itemsPerPage = 20;

    const { data: payoutsData, isLoading, error } = usePayouts({
        status: statusFilter || undefined,
        page: currentPage,
        limit: 50,
        environment: environment || "sandbox",
    });

    const { mutate: verifyMsisdn, isPending: isVerifying } = useVerifyMsisdn();
    const { mutate: uploadCsv, isPending: uploadingCsv } = useUploadPayoutCsv();
    const { mutate: previewCsv, isPending: previewingCsv } = usePreviewCsvBatch();
    const { mutate: previewManual, isPending: previewingManual } = usePreviewManualBatch();
    const { mutate: createQuote, isPending: creatingQuote } = useCreatePayoutQuote();
    const { mutate: executePayout, isPending: executingPayout } = useExecutePayout();

    const currency = environment === "production" ? "FCFA" : "XAF";

    // ---- History table ----
    const allPayouts: DashboardPayout[] = (payoutsData?.payouts ?? []).map((payout) => ({
        ...payout,
        amount: Number(payout.amount),
        recipient: payout.recipientName || payout.recipientMsisdn,
    }));
    const filteredPayouts = useMemo(() => allPayouts.filter((tx) => {
        const matchesSearch = !searchQuery ||
            tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (tx.recipientName ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            tx.recipientMsisdn.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (tx.reference ?? "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = !statusFilter ||
            tx.status.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    }), [allPayouts, searchQuery, statusFilter]);
    const totalPages = Math.ceil(filteredPayouts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedPayouts = filteredPayouts.slice(startIndex, startIndex + itemsPerPage);
    const stats = useMemo(() => ({
        total: allPayouts.reduce((sum, tx) => sum + tx.amount, 0),
        successful: allPayouts.filter((tx) => tx.status === "SUCCESS").length,
        pending: allPayouts.filter((tx) => tx.status === "PENDING" || tx.status === "PROCESSING").length,
        failed: allPayouts.filter((tx) => tx.status === "FAILED").length,
    }), [allPayouts]);

    // ---- Single payout state ----
    const [single, setSingle] = useState({
        gateway: "MTN_MOMO" as "MTN_MOMO" | "ORANGE_MONEY",
        msisdn: "", amount: "", description: "",
    });
    const [verifiedName, setVerifiedName] = useState<string | null>(null);

    const handleVerifyPhone = () => {
        if (!single.msisdn) return;
        verifyMsisdn(
            { gateway: single.gateway, msisdn: single.msisdn.trim(), environment: environment || "sandbox" },
            {
                onSuccess: (data) => {
                    if (data.found) {
                        setVerifiedName(data.displayName || data.name || [data.given_name, data.family_name].filter(Boolean).join(" ") || "Verified");
                        toast.success("Number verified!");
                    } else {
                        setVerifiedName(null);
                        toast.error("Number not found or inactive.");
                    }
                },
                onError: (err) => {
                    setVerifiedName(null);
                    toast.error(err.message);
                },
            }
        );
    };

    const handleSinglePreview = () => {
        if (!secretKey) return toast.error("Regenerate your API credentials first — secret key required.");
        if (!single.msisdn || !single.amount) return;
        createQuote(
            {
                gateway: single.gateway,
                amount: single.amount,
                currency: "XAF",
                recipientMsisdn: single.msisdn.replace(/\s+/g, ""),
                description: single.description || undefined,
                environment: environment || "sandbox",
            },
            {
                onSuccess: ({ quote }) => {
                    setVerifiedName(quote.recipientName || null);
                    setStep({ type: "singleReview", quote });
                },
                onError: (err) => toast.error(err.message),
            }
        );
    };

    // ---- Manual entry state ----
    const emptyRow = (): ManualPreviewRow => ({ msisdn: "", gateway: "MTN_MOMO", amount: "", currency: "XAF" });
    const [manualRows, setManualRows] = useState<ManualPreviewRow[]>([emptyRow()]);

    const updateRow = (i: number, field: keyof ManualPreviewRow, value: string) => {
        setManualRows((prev) => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
    };

    const handleManualPreview = () => {
        if (!secretKey) return toast.error("Regenerate your API credentials first — secret key required.");
        const validRows = manualRows
            .map((row, index) => ({ ...row, rowIndex: index + 1 }))
            .filter((r) => r.msisdn && r.amount);
        if (validRows.length === 0) return toast.error("Add at least one row with MSISDN and amount.");
        previewManual(
            { payload: { rows: validRows, defaultCurrency: "XAF", environment: environment || "sandbox" }, apiKey, secretKey },
            {
                onSuccess: (preview) => setStep({ type: "preview", preview }),
                onError: (err) => toast.error(err.message),
            }
        );
    };

    // ---- CSV state ----
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [csvGateway, setCsvGateway] = useState<"MTN_MOMO" | "ORANGE_MONEY">("MTN_MOMO");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleCsvPreview = () => {
        if (!secretKey) return toast.error("Regenerate your API credentials first — secret key required.");
        if (!csvFile) return toast.error("Please select a CSV file.");
        uploadCsv(
            { file: csvFile, apiKey, secretKey },
            {
                onSuccess: ({ fileId }) => {
                    previewCsv(
                        { payload: { fileId, gateway: csvGateway, currency: "XAF", environment: environment || "sandbox" }, apiKey, secretKey },
                        {
                            onSuccess: (preview) => setStep({ type: "preview", preview }),
                            onError: (err) => toast.error(err.message),
                        }
                    );
                },
                onError: (err) => toast.error(err.message),
            }
        );
    };

    const handleDownloadTemplate = () => {
        const csv = "msisdn,gateway,amount,description\n237670000001,MTN,5000,Payment\n237690000002,ORANGE,10000,Bonus";
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "payout_template.csv";
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleDownloadReceipt = async (payout: DashboardPayout) => {
        setDownloadingReceiptId(payout.id);
        try {
            const blob = await downloadPayoutReceipt(payout.id, environment || undefined);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `payout-receipt-${payout.id}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success("Receipt download started");
        } catch (error) {
            toast.error("Could not download payout receipt", {
                description: error instanceof Error ? error.message : "Please try again.",
            });
        } finally {
            setDownloadingReceiptId(null);
        }
    };

    const closeModal = () => {
        setStep(null);
        setSingle({ gateway: "MTN_MOMO", msisdn: "", amount: "", description: "" });
        setVerifiedName(null);
        setManualRows([emptyRow()]);
        setCsvFile(null);
    };

    const modalTitle = () => {
        if (!step) return "";
        if (step.type === "single") return "Single Payout";
        if (step.type === "singleReview") return "Review Payout";
        if (step.type === "manual") return "Manual Entry";
        if (step.type === "csv") return "CSV Upload";
        if (step.type === "preview") return "Preview Batch";
        if (step.type === "result") return step.result.status === "AWAITING_APPROVAL" ? "Pending Approval" : "Payouts Sent";
        return "";
    };

    const isPreviewing = previewingManual || previewingCsv || creatingQuote;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            <div className="max-w-7xl mx-auto p-6 space-y-6">
                {/* SECRET KEY WARNING */}
                {!secretKey && (
                    <div className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-500/20 p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                            <div>
                                <span className="font-bold text-amber-900 dark:text-amber-100">Secret key not found.</span>
                                <span className="text-amber-800 dark:text-amber-200 ml-1">
                                    To send payouts, go to <a href="/dashboard/api-keys" className="underline font-bold hover:text-amber-900 transition-colors">API Keys</a> and regenerate your {environment === "production" ? "production" : "sandbox"} credentials.
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* HEADER */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-white via-white to-indigo-50/50 dark:from-slate-800/80 dark:via-slate-800/60 dark:to-indigo-950/30 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-6 shadow-lg">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                    <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                                    <Send className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                                        Payouts
                                    </h1>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                                        Send money to customers and vendors
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                onClick={() => setStep({ type: "csv" })}
                                className="group px-5 py-2.5 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-600 hover:border-slate-300 transition-all duration-200 flex items-center gap-2"
                            >
                                <Upload className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                                CSV Upload
                            </button>
                            <button
                                onClick={() => setStep({ type: "manual" })}
                                className="group px-5 py-2.5 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-600 hover:border-slate-300 transition-all duration-200 flex items-center gap-2"
                            >
                                <FileText className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                                Manual Entry
                            </button>
                            <button
                                onClick={() => setStep({ type: "single" })}
                                className="group px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 shadow-md"
                            >
                                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                                Single Payout
                            </button>
                        </div>
                    </div>
                </div>

                {/* STATS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard icon={Wallet} label="Total Volume" value={`${currency} ${stats.total.toLocaleString()}`} color="indigo" />
                    <StatCard icon={CheckCircle2} label="Successful" value={stats.successful} color="emerald" />
                    <StatCard icon={Clock} label="Pending" value={stats.pending} color="amber" />
                    <StatCard icon={XCircle} label="Failed" value={stats.failed} color="rose" />
                </div>

                {/* FILTERS */}
                <div className="rounded-2xl bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative group flex-1 md:min-w-[260px]">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search ID or recipient..."
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                                className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all cursor-pointer"
                            >
                                <option value="">All Status</option>
                                <option value="SUCCESS">✓ Success</option>
                                <option value="PENDING_GATEWAY">⏳ Pending</option>
                                <option value="FAILED">✗ Failed</option>
                            </select>
                        </div>
                        <button className="group px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 flex items-center gap-2">
                            <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                            Export
                        </button>
                    </div>
                </div>

                {/* TABLE */}
                {error && (
                    <div className="rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 p-4">
                        <p className="text-sm text-rose-700 dark:text-rose-300">{error.message}</p>
                    </div>
                )}
                <div className="rounded-2xl bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-800/30 border-b-2 border-slate-200 dark:border-slate-700">
                                    {["Date", "ID", "Recipient", "Amount", "Gateway", "Status", "Actions"].map((h) => (
                                        <th key={h} className="text-left px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    Array.from({ length: 8 }).map((_, i) => (
                                        <tr key={i} className="border-b border-slate-100 dark:border-slate-700">
                                            {Array.from({ length: 7 }).map((__, j) => (
                                                <td key={j} className="px-6 py-4">
                                                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-20" />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : paginatedPayouts.length > 0 ? (
                                    paginatedPayouts.map((tx) => {
                                        const statusConfig = getStatusConfig(tx.status);
                                        const StatusIcon = statusConfig.icon;
                                        return (
                                            <tr key={tx.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 group">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{new Date(tx.createdAt).toLocaleDateString()}</span>
                                                        <span className="text-xs text-slate-500 dark:text-slate-400">{new Date(tx.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <code className="text-xs font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                                                        {tx.id.length > 16 ? `${tx.id.slice(0, 16)}…` : tx.id}
                                                    </code>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">{tx.recipient ?? "—"}</td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                                                        {tx.amount.toLocaleString()} {currency}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                                                        <CreditCard className="w-3 h-3" />
                                                        {tx.gateway.replace(/_/g, " ")}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {formatStatus(tx.status)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDownloadReceipt(tx)}
                                                        disabled={downloadingReceiptId === tx.id || tx.status.toUpperCase() !== "SUCCESS"}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 disabled:opacity-50"
                                                        title={tx.status.toUpperCase() === "SUCCESS" ? "Download payout receipt" : "Receipt available after successful payout"}
                                                    >
                                                        {downloadingReceiptId === tx.id ? (
                                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                        ) : (
                                                            <Download className="h-3.5 w-3.5" />
                                                        )}
                                                        Receipt
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center">
                                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                                                <Send className="w-8 h-8 text-slate-400" />
                                            </div>
                                            <p className="text-base font-medium text-slate-700 dark:text-slate-300">No payouts found</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Create your first payout to get started</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {filteredPayouts.length > itemsPerPage && (
                        <div className="p-5 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Showing {startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredPayouts.length)} of {filteredPayouts.length}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 transition-all duration-200"
                                >
                                    <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                </button>
                                <span className="text-sm font-semibold text-slate-900 dark:text-white">{currentPage} / {totalPages}</span>
                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 transition-all duration-200"
                                >
                                    <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ===== MODAL ===== */}
                {step !== null && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={closeModal}>
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                            {/* Modal Header */}
                            <div className="sticky top-0 bg-gradient-to-r from-white to-indigo-50/30 dark:from-slate-800 dark:to-indigo-950/20 border-b border-slate-200 dark:border-slate-700 px-6 py-4 rounded-t-2xl">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{modalTitle()}</h3>
                                    <button onClick={closeModal} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200">
                                        <X className="w-5 h-5 text-slate-500" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6">
                                {/* ---- SINGLE PAYOUT ---- */}
                                {step.type === "single" && (
                                    <div className="space-y-5">
                                        <div>
                                            <label className="text-xs font-bold text-slate-900 dark:text-white mb-1.5 block">Gateway</label>
                                            <select
                                                value={single.gateway}
                                                onChange={(e) => { setSingle((p) => ({ ...p, gateway: e.target.value as "MTN_MOMO" | "ORANGE_MONEY" })); setVerifiedName(null); }}
                                                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all cursor-pointer"
                                            >
                                                <option value="MTN_MOMO">MTN Mobile Money</option>
                                                <option value="ORANGE_MONEY">Orange Money</option>
                                            </select>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2">
                                                Use this only when a CSV row does not provide its own gateway column.
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-900 dark:text-white mb-1.5 block">Recipient Phone</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="tel"
                                                    value={single.msisdn}
                                                    onChange={(e) => { setSingle((p) => ({ ...p, msisdn: e.target.value })); setVerifiedName(null); }}
                                                    placeholder="237670000001"
                                                    className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                                />
                                                <button
                                                    onClick={handleVerifyPhone}
                                                    disabled={isVerifying || !single.msisdn}
                                                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
                                                >
                                                    {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
                                                </button>
                                            </div>
                                            {verifiedName && (
                                                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" /> {verifiedName}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-900 dark:text-white mb-1.5 block">Amount ({currency})</label>
                                            <input
                                                type="number"
                                                value={single.amount}
                                                onChange={(e) => setSingle((p) => ({ ...p, amount: e.target.value }))}
                                                placeholder="50000"
                                                min="1"
                                                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-900 dark:text-white mb-1.5 block">Description <span className="font-normal text-slate-500 dark:text-slate-400">(optional)</span></label>
                                            <input
                                                type="text"
                                                value={single.description}
                                                onChange={(e) => setSingle((p) => ({ ...p, description: e.target.value }))}
                                                placeholder="Salary payment"
                                                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                            />
                                        </div>
                                        <button
                                            onClick={handleSinglePreview}
                                            disabled={isPreviewing || !single.msisdn || !single.amount}
                                            className="w-full px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {isPreviewing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                            {isPreviewing ? "Validating..." : "Preview Payout"}
                                        </button>
                                    </div>
                                )}

                                {/* ---- SINGLE REVIEW ---- */}
                                {step.type === "singleReview" && (
                                    <div className="space-y-5">
                                        <div className="rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 p-4 space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-xs text-slate-500 dark:text-slate-400">Recipient</span>
                                                <span className="text-sm font-bold text-slate-900 dark:text-white">{step.quote.recipientName || "Verified recipient"}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-xs text-slate-500 dark:text-slate-400">Amount</span>
                                                <span className="text-sm font-bold text-slate-900 dark:text-white">{parseFloat(step.quote.amount).toLocaleString()} {step.quote.currency}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-xs text-slate-500 dark:text-slate-400">Gateway fee</span>
                                                <span className="text-sm font-medium text-slate-900 dark:text-white">{parseFloat(step.quote.gatewayFee).toLocaleString()} {step.quote.currency}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-xs text-slate-500 dark:text-slate-400">Platform fee</span>
                                                <span className="text-sm font-medium text-slate-900 dark:text-white">{parseFloat(step.quote.platformFee).toLocaleString()} {step.quote.currency}</span>
                                            </div>
                                            <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                                                <span className="text-sm font-bold text-slate-900 dark:text-white">Total wallet deduction</span>
                                                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                                    {Math.abs(parseFloat(step.quote.netToMerchant)).toLocaleString()} {step.quote.currency}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 pt-1">
                                                Quote expires at {new Date(step.quote.expiresAt).toLocaleString()}.
                                            </p>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setStep({ type: "single" })}
                                                disabled={executingPayout}
                                                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
                                            >
                                                Back
                                            </button>
                                            <button
                                                onClick={() => executePayout(
                                                    { quoteId: step.quote.id },
                                                    {
                                                        onSuccess: ({ payout }) => {
                                                            toast.success("Payout submitted", {
                                                                description: `${payout.recipientName || payout.recipientMsisdn} is ${formatStatus(payout.status)}.`,
                                                            });
                                                            setStep(null);
                                                        },
                                                        onError: (err) => toast.error(err.message),
                                                    }
                                                )}
                                                disabled={executingPayout}
                                                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                                            >
                                                {executingPayout ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                                {executingPayout ? "Sending..." : "Execute Payout"}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* ---- MANUAL ENTRY ---- */}
                                {step.type === "manual" && (
                                    <div className="space-y-4">
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Add up to 500 rows. Mix MTN and Orange in the same batch.
                                        </p>
                                        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                                            {manualRows.map((row, i) => (
                                                <div key={i} className="grid grid-cols-[1fr_100px_80px_32px] gap-2 items-center">
                                                    <input
                                                        type="tel"
                                                        value={row.msisdn}
                                                        onChange={(e) => updateRow(i, "msisdn", e.target.value)}
                                                        placeholder="237670000001"
                                                        className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                                    />
                                                    <select
                                                        value={row.gateway}
                                                        onChange={(e) => updateRow(i, "gateway", e.target.value)}
                                                        className="px-2 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                                    >
                                                        <option value="MTN_MOMO">MTN</option>
                                                        <option value="ORANGE_MONEY">Orange</option>
                                                    </select>
                                                    <input
                                                        type="number"
                                                        value={row.amount}
                                                        onChange={(e) => updateRow(i, "amount", e.target.value)}
                                                        placeholder="Amount"
                                                        min="1"
                                                        className="px-2 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                                    />
                                                    <button
                                                        onClick={() => setManualRows((prev) => prev.filter((_, idx) => idx !== i))}
                                                        disabled={manualRows.length === 1}
                                                        className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-500 rounded-lg transition-colors disabled:opacity-30 text-slate-500"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setManualRows((prev) => [...prev, emptyRow()])}
                                                disabled={manualRows.length >= 500}
                                                className="flex-1 px-3 py-2 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-all duration-200 flex items-center justify-center gap-1"
                                            >
                                                <Plus className="w-3 h-3" /> Add Row
                                            </button>
                                            <button
                                                onClick={handleManualPreview}
                                                disabled={isPreviewing}
                                                className="flex-1 px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-xs font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-1"
                                            >
                                                {isPreviewing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                                                {isPreviewing ? "Validating..." : "Preview Batch"}
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center">
                                            {manualRows.length} / 500 rows
                                        </p>
                                    </div>
                                )}

                                {/* ---- CSV UPLOAD ---- */}
                                {step.type === "csv" && (
                                    <div className="space-y-5">
                                        <div>
                                            <label className="text-xs font-bold text-slate-900 dark:text-white mb-1.5 block">Default gateway fallback</label>
                                            <select
                                                value={csvGateway}
                                                onChange={(e) => setCsvGateway(e.target.value as "MTN_MOMO" | "ORANGE_MONEY")}
                                                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all cursor-pointer"
                                            >
                                                <option value="MTN_MOMO">MTN Mobile Money</option>
                                                <option value="ORANGE_MONEY">Orange Money</option>
                                            </select>
                                        </div>
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 dark:hover:bg-indigo-500/10 transition-all duration-200"
                                        >
                                            <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                                            {csvFile ? (
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{csvFile.name}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{(csvFile.size / 1024).toFixed(1)} KB</p>
                                                </div>
                                            ) : (
                                                <div>
                                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Drop CSV file here or click to browse</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Max 10 MB · Required columns: msisdn, amount</p>
                                                </div>
                                            )}
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept=".csv"
                                                className="hidden"
                                                onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)}
                                            />
                                        </div>

                                        <div className="rounded-xl bg-slate-50 dark:bg-slate-900/30 p-4 border border-slate-200 dark:border-slate-700">
                                            <p className="text-xs font-bold text-slate-900 dark:text-white mb-2">Expected CSV format:</p>
                                            <pre className="text-xs font-mono text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 p-2 rounded-lg">
{"msisdn,gateway,amount,description\n237670000001,MTN,5000,Payment\n237690000002,ORANGE,10000,Bonus"}
                                            </pre>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2">
                                                Supported row gateway values: MTN, MTN_MOMO, ORANGE, ORANGE_MONEY
                                            </p>
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={handleDownloadTemplate}
                                                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 flex items-center justify-center gap-2"
                                            >
                                                <Download className="w-4 h-4" />
                                                Template
                                            </button>
                                            <button
                                                onClick={handleCsvPreview}
                                                disabled={!csvFile || uploadingCsv || isPreviewing}
                                                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                                            >
                                                {(uploadingCsv || isPreviewing) ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                                {uploadingCsv ? "Uploading..." : isPreviewing ? "Validating..." : "Preview Batch"}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* ---- PREVIEW RESULT ---- */}
                                {step.type === "preview" && (
                                    <PreviewStep
                                        preview={step.preview}
                                        onConfirmed={(result) => setStep({ type: "result", result })}
                                        onCancel={closeModal}
                                    />
                                )}

                                {/* ---- RESULT ---- */}
                                {step.type === "result" && (
                                    <ResultStep result={step.result} onClose={closeModal} />
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}