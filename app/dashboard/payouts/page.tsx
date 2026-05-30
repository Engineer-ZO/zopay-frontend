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

const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
        case "SUCCESS": return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400";
        case "PENDING_GATEWAY": return "bg-crimson-red-100 dark:bg-crimson-red-900/20 text-crimson-red-700 dark:text-crimson-red-400";
        case "FAILED": return "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400";
        default: return "bg-muted text-muted-foreground";
    }
};

const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
        case "SUCCESS": return <CheckCircle2 className="w-3 h-3 mr-1" />;
        case "PENDING_GATEWAY": return <Clock className="w-3 h-3 mr-1" />;
        case "FAILED": return <XCircle className="w-3 h-3 mr-1" />;
        default: return null;
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
        <span className={`font-mono font-semibold ${isWarning || remaining === "Expired" ? "text-red-500" : "text-crimson-red-500"}`}>
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
        <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Valid</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">{preview.validCount}</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Unverified</p>
                    <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{preview.unverifiedCount}</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Invalid</p>
                    <p className="text-lg font-bold text-red-600 dark:text-red-400">{preview.invalidCount}</p>
                </div>
                <div className="bg-deep-blue-violet-50 dark:bg-deep-blue-violet-900/10 border border-deep-blue-violet-200 dark:border-deep-blue-violet-800 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Recipient Gets</p>
                    <p className="text-lg font-bold text-deep-blue-violet-600 dark:text-deep-blue-violet-400">
                        {recipientTotal.toLocaleString()} {preview.currency}
                    </p>
                </div>
            </div>

            {/* Expiry */}
            <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                <span>Batch expires in:</span>
                <ExpiryTimer expiresAt={preview.expiresAt} />
            </div>

            {hasUnverified && (
                <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10 p-4 space-y-3">
                    <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Choose how to handle unverified rows</p>
                            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                                Verified rows were confirmed by lookup. Unverified rows were not confirmed because the gateway did not return verification feedback. Invalid rows will not be paid.
                            </p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="flex items-start gap-3 rounded-lg border border-amber-200 dark:border-amber-700 bg-background px-3 py-2 cursor-pointer">
                            <input
                                type="radio"
                                name="unverified-mode"
                                checked={!includeUnverified}
                                onChange={() => setIncludeUnverified(false)}
                                className="mt-0.5"
                            />
                            <div className="text-xs">
                                <p className="font-semibold text-foreground">Send verified rows only</p>
                                <p className="text-muted-foreground mt-1">
                                    {preview.validCount} row{preview.validCount !== 1 ? "s" : ""} for {parseMoney(preview.totalAmount).toLocaleString()} {preview.currency}
                                </p>
                            </div>
                        </label>
                        <label className="flex items-start gap-3 rounded-lg border border-amber-200 dark:border-amber-700 bg-background px-3 py-2 cursor-pointer">
                            <input
                                type="radio"
                                name="unverified-mode"
                                checked={includeUnverified}
                                onChange={() => setIncludeUnverified(true)}
                                className="mt-0.5"
                            />
                            <div className="text-xs">
                                <p className="font-semibold text-foreground">Send verified + unverified rows</p>
                                <p className="text-muted-foreground mt-1">
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
                    <p className="text-xs font-semibold text-foreground mb-2">Verified recipients ({preview.validCount})</p>
                    <div className="max-h-40 overflow-y-auto rounded-lg border border-border divide-y divide-border">
                        {preview.valid.map((row, i) => {
                            const recipientName = getPreviewRecipientName(row);

                            return (
                                <div key={i} className="flex items-center justify-between px-3 py-2 text-xs">
                                    <div>
                                        {typeof row.rowIndex === "number" && (
                                            <p className="text-[10px] text-muted-foreground">Row {row.rowIndex}</p>
                                        )}
                                        <p className="font-mono text-foreground">{row.msisdn}</p>
                                        {recipientName && <p className="text-muted-foreground">{recipientName}</p>}
                                    </div>
                                    <span className="font-semibold text-foreground">
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
                    <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Unverified ({preview.unverifiedCount}) — you can choose whether to include these rows
                    </p>
                    <div className="max-h-32 overflow-y-auto rounded-lg border border-amber-200 dark:border-amber-800 divide-y divide-amber-100 dark:divide-amber-900 bg-amber-50 dark:bg-amber-900/10">
                        {preview.unverified.map((row, i) => {
                            const recipientName = getPreviewRecipientName(row);

                            return (
                                <div key={i} className="flex items-center justify-between gap-3 px-3 py-2 text-xs">
                                    <div>
                                        {typeof row.rowIndex === "number" && (
                                            <p className="text-[10px] text-muted-foreground">Row {row.rowIndex}</p>
                                        )}
                                        <p className="font-mono text-foreground">{row.msisdn}</p>
                                        {recipientName && <p className="text-muted-foreground">{recipientName}</p>}
                                        <p className="text-amber-700 dark:text-amber-400 mt-1">{row.reason}</p>
                                    </div>
                                    <span className="font-semibold text-foreground">
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
                    <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Invalid ({preview.invalidCount}) — will NOT be paid
                    </p>
                    <div className="max-h-28 overflow-y-auto rounded-lg border border-red-200 dark:border-red-800 divide-y divide-red-100 dark:divide-red-900 bg-red-50 dark:bg-red-900/10">
                        {preview.invalid.map((row, i) => (
                            <div key={i} className="flex items-center justify-between px-3 py-2 text-xs">
                                <div>
                                    {typeof row.rowIndex === "number" && (
                                        <p className="text-[10px] text-muted-foreground">Row {row.rowIndex}</p>
                                    )}
                                    <span className="font-mono text-foreground">{row.msisdn}</span>
                                </div>
                                <span className="text-red-600 dark:text-red-400 text-right">{row.reason}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Memo */}
            <div>
                <label className="text-xs font-medium text-foreground mb-1 block">
                    Memo <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <input
                    type="text"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="April salary payments"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-crimson-red-500"
                />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={handleCancel}
                    disabled={confirming}
                    className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg text-sm font-semibold hover:bg-muted transition-colors disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    onClick={handleConfirm}
                    disabled={confirming || executableCount === 0}
                    className="flex-1 px-4 py-2 bg-crimson-red-500 text-white rounded-lg text-sm font-semibold hover:bg-crimson-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
        <div className="text-center space-y-4 py-4">
            {isProcessing ? (
                <>
                    <div className="w-14 h-14 bg-deep-blue-violet-100 dark:bg-deep-blue-violet-900/20 rounded-full flex items-center justify-center mx-auto">
                        <Loader2 className="w-7 h-7 text-deep-blue-violet-500 animate-spin" />
                    </div>
                    <div>
                        <p className="text-base font-bold text-foreground">Batch Processing</p>
                        <p className="text-xs text-muted-foreground mt-2 max-w-xs mx-auto">
                            The backend has started processing this batch in the background. You can safely leave this page and come back later without stopping execution.
                        </p>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                        <div className="rounded-lg border border-border p-2">
                            <p className="text-muted-foreground">Done</p>
                            <p className="font-bold text-foreground">{completedCount}/{totalCount || "..."}</p>
                        </div>
                        <div className="rounded-lg border border-border p-2">
                            <p className="text-muted-foreground">Success</p>
                            <p className="font-bold text-green-600">{successCount}</p>
                        </div>
                        <div className="rounded-lg border border-border p-2">
                            <p className="text-muted-foreground">Failed</p>
                            <p className="font-bold text-red-600">{failedCount}</p>
                        </div>
                        <div className="rounded-lg border border-border p-2">
                            <p className="text-muted-foreground">Skipped</p>
                            <p className="font-bold text-amber-600">{skippedCount}</p>
                        </div>
                    </div>
                    {processingCount > 0 ? (
                        <p className="text-xs text-muted-foreground">{processingCount} payout item(s) still processing.</p>
                    ) : totalCount > 0 ? (
                        <p className="text-xs text-green-600 dark:text-green-400">Batch processing has finished.</p>
                    ) : null}
                </>
            ) : isAwaitingApproval ? (
                <>
                    <div className="w-14 h-14 bg-crimson-red-100 dark:bg-crimson-red-900/20 rounded-full flex items-center justify-center mx-auto">
                        <Clock className="w-7 h-7 text-crimson-red-500" />
                    </div>
                    <div>
                        <p className="text-base font-bold text-foreground">Awaiting Admin Approval</p>
                        <p className="text-xs text-muted-foreground mt-2 max-w-xs mx-auto">
                            Your batch exceeds the approval threshold. Payouts have NOT been sent yet.
                            You will be notified by email once an admin approves or rejects it.
                        </p>
                    </div>
                </>
            ) : (
                <>
                    <div className="w-14 h-14 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-7 h-7 text-green-500" />
                    </div>
                    <div>
                        <p className="text-base font-bold text-foreground">Payouts Sent!</p>
                        {result.executionSummary && (
                            <div className="flex justify-center gap-6 mt-3">
                                <div>
                                    <p className="text-xl font-bold text-green-600 dark:text-green-400">
                                        {result.executionSummary.successCount}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Successful</p>
                                </div>
                                {result.executionSummary.failedCount > 0 && (
                                    <div>
                                        <p className="text-xl font-bold text-red-600 dark:text-red-400">
                                            {result.executionSummary.failedCount}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Failed</p>
                                    </div>
                                )}
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-2 max-w-xs mx-auto">
                            Processing continues in the background even if you close this screen.
                        </p>
                    </div>
                </>
            )}
            {result.memo && (
                <p className="text-xs text-muted-foreground">
                    Memo: <span className="font-medium text-foreground">{result.memo}</span>
                </p>
            )}
            <button
                onClick={onClose}
                className="px-6 py-2 bg-crimson-red-500 text-white rounded-lg text-sm font-semibold hover:bg-crimson-red-600 transition-colors"
            >
                Done
            </button>
        </div>
    );
}

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
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* SECRET KEY WARNING */}
            {!secretKey && (
                <div className="flex items-start gap-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-sm">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
                    <div>
                        <span className="font-semibold text-yellow-800 dark:text-yellow-300">Secret key not found.</span>
                        <span className="text-yellow-700 dark:text-yellow-400 ml-1">
                            To send payouts, go to <a href="/dashboard/api-keys" className="underline font-medium">API Keys</a> and regenerate your {environment === "production" ? "production" : "sandbox"} credentials. The secret key is stored locally after regeneration.
                        </span>
                    </div>
                </div>
            )}

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-foreground">Payouts</h1>
                    <p className="text-xs text-muted-foreground mt-1">Send money to customers and vendors</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => setStep({ type: "csv" })}
                        className="px-4 py-2 bg-background border border-border text-foreground rounded-lg text-sm font-semibold hover:bg-muted transition-colors flex items-center gap-2"
                    >
                        <Upload className="w-4 h-4" />
                        CSV Upload
                    </button>
                    <button
                        onClick={() => setStep({ type: "manual" })}
                        className="px-4 py-2 bg-background border border-border text-foreground rounded-lg text-sm font-semibold hover:bg-muted transition-colors flex items-center gap-2"
                    >
                        <FileText className="w-4 h-4" />
                        Manual Entry
                    </button>
                    <button
                        onClick={() => setStep({ type: "single" })}
                        className="px-4 py-2 bg-crimson-red-500 text-white rounded-lg text-sm font-semibold hover:bg-crimson-red-600 transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Single Payout
                    </button>
                </div>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: "TOTAL", value: isLoading ? "—" : `${currency} ${stats.total.toLocaleString()}`, color: "deep-blue-violet" },
                    { label: "SUCCESS", value: isLoading ? "—" : stats.successful, color: "green" },
                    { label: "PENDING", value: isLoading ? "—" : stats.pending, color: "crimson-red" },
                    { label: "FAILED", value: isLoading ? "—" : stats.failed, color: "red" },
                ].map(({ label, value, color }) => (
                    <div key={label} className={`bg-${color}-50 dark:bg-${color}-900/10 rounded-xl p-4 border border-${color}-200 dark:border-${color}-800`}>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">{label}</p>
                        <p className="text-xl font-bold text-foreground">{value}</p>
                    </div>
                ))}
            </div>

            {/* FILTERS */}
            <div className="bg-background rounded-xl p-3 border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:min-w-[250px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search ID or recipient..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            className="w-full pl-9 pr-4 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-crimson-red-500"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                        className="px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-crimson-red-500"
                    >
                        <option value="">All Status</option>
                        <option value="SUCCESS">Success</option>
                        <option value="PENDING_GATEWAY">Pending</option>
                        <option value="FAILED">Failed</option>
                    </select>
                </div>
                <button className="px-4 py-1.5 bg-background border border-border text-foreground rounded-lg text-xs font-semibold hover:bg-muted transition-colors flex items-center gap-2 shrink-0">
                    <Download className="w-3.5 h-3.5" />
                    Export
                </button>
            </div>

            {/* TABLE */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl p-4">
                    <p className="text-xs text-red-600 dark:text-red-400">{error.message}</p>
                </div>
            )}
            <div className="bg-background rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                {["Date", "ID", "Recipient", "Amount", "Gateway", "Status", "Actions"].map((h) => (
                                    <th key={h} className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <tr key={i} className="border-b border-border">
                                        {Array.from({ length: 7 }).map((__, j) => (
                                            <td key={j} className="py-2.5 px-4">
                                                <div className="h-3 bg-muted rounded animate-pulse w-20" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : paginatedPayouts.length > 0 ? (
                                paginatedPayouts.map((tx) => (
                                    <tr key={tx.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                                        <td className="py-2.5 px-4">
                                            <div className="text-xs font-medium text-foreground">{new Date(tx.createdAt).toLocaleDateString()}</div>
                                            <div className="text-[10px] text-muted-foreground">{new Date(tx.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                                        </td>
                                        <td className="py-2.5 px-4 text-xs font-mono text-foreground">
                                            {tx.id.length > 16 ? `${tx.id.slice(0, 16)}…` : tx.id}
                                        </td>
                                        <td className="py-2.5 px-4 text-xs text-foreground">{tx.recipient ?? "—"}</td>
                                        <td className="py-2.5 px-4 text-xs font-semibold text-foreground">
                                            {tx.amount.toLocaleString()} {currency}
                                        </td>
                                        <td className="py-2.5 px-4 text-xs text-foreground">{tx.gateway.replace(/_/g, " ")}</td>
                                        <td className="py-2.5 px-4">
                                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${getStatusColor(tx.status)}`}>
                                                {getStatusIcon(tx.status)}
                                                {formatStatus(tx.status)}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-4">
                                            <button
                                                type="button"
                                                onClick={() => handleDownloadReceipt(tx)}
                                                disabled={downloadingReceiptId === tx.id || tx.status.toUpperCase() !== "SUCCESS"}
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-[11px] font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                                                title={tx.status.toUpperCase() === "SUCCESS" ? "Download payout receipt" : "Receipt is available after successful payout"}
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
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center">
                                        <ArrowUpFromLine className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                                        <p className="text-sm text-muted-foreground">No payouts found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {filteredPayouts.length > itemsPerPage && (
                    <div className="p-4 border-t border-border flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                            {startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredPayouts.length)} of {filteredPayouts.length}
                        </p>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 hover:bg-muted rounded transition-colors disabled:opacity-50">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-xs text-foreground">{currentPage} / {totalPages}</span>
                            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 hover:bg-muted rounded transition-colors disabled:opacity-50">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ===== MODAL ===== */}
            {step !== null && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-background rounded-2xl shadow-2xl border border-border w-full max-w-lg max-h-[90vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
                            <h3 className="text-base font-semibold text-foreground">{modalTitle()}</h3>
                            <button onClick={closeModal} className="p-1 hover:bg-muted rounded transition-colors">
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5">
                            {/* ---- SINGLE PAYOUT ---- */}
                            {step.type === "single" && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-medium text-foreground mb-1 block">Gateway</label>
                                        <select
                                            value={single.gateway}
                                            onChange={(e) => { setSingle((p) => ({ ...p, gateway: e.target.value as "MTN_MOMO" | "ORANGE_MONEY" })); setVerifiedName(null); }}
                                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-crimson-red-500"
                                        >
                                            <option value="MTN_MOMO">MTN Mobile Money</option>
                                            <option value="ORANGE_MONEY">Orange Money</option>
                                        </select>
                                        <p className="text-[10px] text-muted-foreground mt-1.5">
                                            Use this only when a CSV row does not provide its own `gateway` or `network` column. For mixed MTN and Orange files, include the gateway in each row.
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-foreground mb-1 block">Recipient Phone</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="tel"
                                                value={single.msisdn}
                                                onChange={(e) => { setSingle((p) => ({ ...p, msisdn: e.target.value })); setVerifiedName(null); }}
                                                placeholder="237670000001"
                                                className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-crimson-red-500"
                                            />
                                            <button
                                                onClick={handleVerifyPhone}
                                                disabled={isVerifying || !single.msisdn}
                                                className="px-3 py-2 bg-background border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50 whitespace-nowrap"
                                            >
                                                {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
                                            </button>
                                        </div>
                                        {verifiedName && (
                                            <p className="text-xs text-green-600 dark:text-green-400 mt-1.5 flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3" /> {verifiedName}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-foreground mb-1 block">Amount ({currency})</label>
                                        <input
                                            type="number"
                                            value={single.amount}
                                            onChange={(e) => setSingle((p) => ({ ...p, amount: e.target.value }))}
                                            placeholder="50000"
                                            min="1"
                                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-crimson-red-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-foreground mb-1 block">Description <span className="text-muted-foreground font-normal">(optional)</span></label>
                                        <input
                                            type="text"
                                            value={single.description}
                                            onChange={(e) => setSingle((p) => ({ ...p, description: e.target.value }))}
                                            placeholder="Salary payment"
                                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-crimson-red-500"
                                        />
                                    </div>
                                    <button
                                        onClick={handleSinglePreview}
                                        disabled={isPreviewing || !single.msisdn || !single.amount}
                                        className="w-full px-4 py-2 bg-crimson-red-500 text-white rounded-lg text-sm font-semibold hover:bg-crimson-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isPreviewing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                        {isPreviewing ? "Validating..." : "Preview Payout"}
                                    </button>
                                </div>
                            )}

                            {step.type === "singleReview" && (
                                <div className="space-y-4">
                                    <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-2 text-sm">
                                        <div className="flex justify-between gap-4">
                                            <span className="text-muted-foreground">Recipient</span>
                                            <span className="font-semibold text-foreground text-right">
                                                {step.quote.recipientName || "Verified recipient"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between gap-4">
                                            <span className="text-muted-foreground">Amount</span>
                                            <span className="font-semibold text-foreground">
                                                {parseFloat(step.quote.amount).toLocaleString()} {step.quote.currency}
                                            </span>
                                        </div>
                                        <div className="flex justify-between gap-4">
                                            <span className="text-muted-foreground">Gateway fee</span>
                                            <span className="font-medium text-foreground">
                                                {parseFloat(step.quote.gatewayFee).toLocaleString()} {step.quote.currency}
                                            </span>
                                        </div>
                                        <div className="flex justify-between gap-4">
                                            <span className="text-muted-foreground">Platform fee</span>
                                            <span className="font-medium text-foreground">
                                                {parseFloat(step.quote.platformFee).toLocaleString()} {step.quote.currency}
                                            </span>
                                        </div>
                                        <div className="flex justify-between gap-4 border-t border-border pt-2">
                                            <span className="font-semibold text-foreground">Total wallet deduction</span>
                                            <span className="font-bold text-crimson-red-600">
                                                {Math.abs(parseFloat(step.quote.netToMerchant)).toLocaleString()} {step.quote.currency}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground pt-1">
                                            Quote expires at {new Date(step.quote.expiresAt).toLocaleString()}.
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setStep({ type: "single" })}
                                            disabled={executingPayout}
                                            className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg text-sm font-semibold hover:bg-muted transition-colors disabled:opacity-50"
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
                                            className="flex-1 px-4 py-2 bg-crimson-red-500 text-white rounded-lg text-sm font-semibold hover:bg-crimson-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
                                    <p className="text-xs text-muted-foreground">
                                        Add up to 500 rows. Mix MTN and Orange in the same batch.
                                    </p>
                                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                                        {manualRows.map((row, i) => (
                                            <div key={i} className="grid grid-cols-[1fr_130px_90px_32px] gap-2 items-center">
                                                <input
                                                    type="tel"
                                                    value={row.msisdn}
                                                    onChange={(e) => updateRow(i, "msisdn", e.target.value)}
                                                    placeholder="237670000001"
                                                    className="px-2 py-1.5 bg-background border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-crimson-red-500"
                                                />
                                                <select
                                                    value={row.gateway}
                                                    onChange={(e) => updateRow(i, "gateway", e.target.value)}
                                                    className="px-2 py-1.5 bg-background border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-crimson-red-500"
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
                                                    className="px-2 py-1.5 bg-background border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-crimson-red-500"
                                                />
                                                <button
                                                    onClick={() => setManualRows((prev) => prev.filter((_, idx) => idx !== i))}
                                                    disabled={manualRows.length === 1}
                                                    className="p-1 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-500 rounded transition-colors disabled:opacity-30 text-muted-foreground"
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
                                            className="flex-1 px-3 py-2 border border-dashed border-border rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                                        >
                                            <Plus className="w-3 h-3" /> Add Row
                                        </button>
                                        <button
                                            onClick={handleManualPreview}
                                            disabled={isPreviewing}
                                            className="flex-1 px-3 py-2 bg-crimson-red-500 text-white rounded-lg text-xs font-semibold hover:bg-crimson-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                                        >
                                            {isPreviewing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                                            {isPreviewing ? "Validating..." : "Preview Batch"}
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">
                                        {manualRows.length} / 500 rows • Invalid MSISDNs will be shown in the preview and skipped
                                    </p>
                                </div>
                            )}

                            {/* ---- CSV UPLOAD ---- */}
                            {step.type === "csv" && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-medium text-foreground mb-1 block">Default gateway fallback</label>
                                        <select
                                            value={csvGateway}
                                            onChange={(e) => setCsvGateway(e.target.value as "MTN_MOMO" | "ORANGE_MONEY")}
                                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-crimson-red-500"
                                        >
                                            <option value="MTN_MOMO">MTN Mobile Money</option>
                                            <option value="ORANGE_MONEY">Orange Money</option>
                                        </select>
                                    </div>
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-crimson-red-400 hover:bg-crimson-red-50/30 dark:hover:bg-crimson-red-900/10 transition-colors"
                                    >
                                        <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                                        {csvFile ? (
                                            <div>
                                                <p className="text-sm font-semibold text-foreground">{csvFile.name}</p>
                                                <p className="text-xs text-muted-foreground mt-1">{(csvFile.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="text-sm font-medium text-foreground mb-1">Drop CSV file here or click to browse</p>
                                                <p className="text-xs text-muted-foreground">Max 10 MB · Required columns: msisdn, amount</p>
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

                                    <div className="bg-muted/50 rounded-lg p-3">
                                        <p className="text-xs font-medium text-foreground mb-2">Expected CSV format:</p>
                                        <pre className="text-xs font-mono text-muted-foreground">
{"msisdn,gateway,amount,description\n237670000001,MTN,5000,Payment\n237690000002,ORANGE,10000,Bonus"}
                                        </pre>
                                        <p className="text-[10px] text-muted-foreground mt-2">
                                            Supported row gateway values include `MTN`, `MTN_MOMO`, `MTN MOMO`, `ORANGE`, `ORANGE_MONEY`, and `ORANGE MONEY`.
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleDownloadTemplate}
                                            className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg text-sm font-semibold hover:bg-muted transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Download className="w-4 h-4" />
                                            Download Template
                                        </button>
                                        <button
                                            onClick={handleCsvPreview}
                                            disabled={!csvFile || uploadingCsv || isPreviewing}
                                            className="flex-1 px-4 py-2 bg-crimson-red-500 text-white rounded-lg text-sm font-semibold hover:bg-crimson-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
    );
}
