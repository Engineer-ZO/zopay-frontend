"use client";

import { useState } from "react";
import {
    Send,
    CheckCircle2,
    XCircle,
    Loader2,
    X,
    Settings,
    ChevronDown,
    ChevronUp,
    Users,
    AlertTriangle,
    DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import {
    useAdminPendingBatches,
    useAdminApproveBatch,
    useAdminRejectBatch,
    useAdminApprovalThreshold,
    useAdminSetApprovalThreshold,
} from "@/features/admin/queries";
import type { PendingBatch } from "@/features/admin/api";

function BatchCard({
    batch,
    onApprove,
    onReject,
    approving,
    rejecting,
}: {
    batch: PendingBatch;
    onApprove: (id: string) => void;
    onReject: (batch: PendingBatch) => void;
    approving: boolean;
    rejecting: boolean;
}) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-crimson-red-100 text-crimson-red-700 rounded-full text-[10px] font-semibold">
                                <AlertTriangle className="w-3 h-3" />
                                Awaiting Approval
                            </span>
                            <span className="text-xs text-gray-500 font-mono">{batch.id.slice(0, 8)}...</span>
                        </div>
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase font-semibold">Gateway</p>
                                <p className="text-sm font-semibold text-gray-900">{batch.gateway.replace(/_/g, " ")}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase font-semibold">Total Amount</p>
                                <p className="text-sm font-bold text-gray-900">
                                    {parseFloat(batch.totalAmount).toLocaleString()} {batch.currency}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase font-semibold">Recipients</p>
                                <p className="text-sm font-semibold text-gray-900">{batch.validCount}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase font-semibold">Submitted</p>
                                <p className="text-sm text-gray-700">{new Date(batch.confirmedAt).toLocaleString()}</p>
                            </div>
                        </div>
                        {batch.memo && (
                            <p className="mt-2 text-xs text-gray-600 italic">
                                &ldquo;{batch.memo}&rdquo;
                            </p>
                        )}
                        <p className="text-[10px] text-gray-400 mt-1">Merchant: {batch.merchantId.slice(0, 8)}...</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                            onClick={() => onApprove(batch.id)}
                            disabled={approving}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                            {approving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                            Approve
                        </button>
                        <button
                            onClick={() => onReject(batch)}
                            disabled={rejecting}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200 transition-colors"
                        >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                        </button>
                    </div>
                </div>

                {/* Toggle recipients */}
                <button
                    onClick={() => setExpanded((v) => !v)}
                    className="mt-3 flex items-center gap-1 text-xs text-deep-blue-violet-600 hover:text-deep-blue-violet-800 transition-colors"
                >
                    <Users className="w-3.5 h-3.5" />
                    {expanded ? "Hide" : "Show"} recipients ({batch.validCount})
                    {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
            </div>

            {/* Recipients Table */}
            {expanded && (
                <div className="border-t border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="text-left py-2 px-4 text-[10px] font-semibold text-gray-500 uppercase">MSISDN</th>
                                    <th className="text-left py-2 px-4 text-[10px] font-semibold text-gray-500 uppercase">Name</th>
                                    <th className="text-left py-2 px-4 text-[10px] font-semibold text-gray-500 uppercase">Gateway</th>
                                    <th className="text-left py-2 px-4 text-[10px] font-semibold text-gray-500 uppercase">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {batch.validRows.map((row, i) => (
                                    <tr key={i} className="border-t border-gray-50 hover:bg-gray-50">
                                        <td className="py-2 px-4 text-xs font-mono text-gray-700">{row.msisdn}</td>
                                        <td className="py-2 px-4 text-xs text-gray-700">{row.name ?? "—"}</td>
                                        <td className="py-2 px-4 text-xs text-gray-600">{row.gateway?.replace(/_/g, " ") ?? "—"}</td>
                                        <td className="py-2 px-4 text-xs font-semibold text-gray-900">
                                            {parseFloat(row.amount).toLocaleString()} {row.currency}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AdminPayoutsPage() {
    const { data, isLoading, error } = useAdminPendingBatches();
    const { data: thresholdData, isLoading: thresholdLoading } = useAdminApprovalThreshold();

    const { mutate: approve, isPending: approving } = useAdminApproveBatch();
    const { mutate: rejectBatch, isPending: rejecting } = useAdminRejectBatch();
    const { mutate: setThreshold, isPending: settingThreshold } = useAdminSetApprovalThreshold();

    const [rejectTarget, setRejectTarget] = useState<PendingBatch | null>(null);
    const [rejectReason, setRejectReason] = useState("");

    // Threshold settings
    const [showThresholdModal, setShowThresholdModal] = useState(false);
    const [thresholdValue, setThresholdValue] = useState("");

    const batches = data?.batches ?? [];

    const handleApprove = (batchId: string) => {
        approve(batchId, {
            onSuccess: (data) => {
                toast.success(
                    `Batch approved — ${data.executionSummary?.successCount ?? 0} payouts executed`
                );
            },
            onError: (err) => toast.error(err.message),
        });
    };

    const handleReject = (e: React.FormEvent) => {
        e.preventDefault();
        if (!rejectTarget) return;
        rejectBatch(
            { batchId: rejectTarget.id, reason: rejectReason || undefined },
            {
                onSuccess: () => {
                    toast.success("Batch rejected");
                    setRejectTarget(null);
                    setRejectReason("");
                },
                onError: (err) => toast.error(err.message),
            }
        );
    };

    const handleSetThreshold = (e: React.FormEvent) => {
        e.preventDefault();
        const value = thresholdValue === "" ? null : parseFloat(thresholdValue);
        setThreshold(value, {
            onSuccess: (data) => {
                toast.success(data.message);
                setShowThresholdModal(false);
                setThresholdValue("");
            },
            onError: (err) => toast.error(err.message),
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Send className="w-6 h-6 text-deep-blue-violet-600" />
                        Bulk Payout Approvals
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                        Review and approve merchant bulk payouts that exceed the threshold
                    </p>
                </div>
                <button
                    onClick={() => {
                        setThresholdValue(thresholdData?.threshold?.toString() ?? "");
                        setShowThresholdModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                    <Settings className="w-4 h-4" />
                    Approval Threshold
                </button>
            </div>

            {/* Threshold banner */}
            {!thresholdLoading && (
                <div className="bg-deep-blue-violet-50 border border-deep-blue-violet-200 rounded-xl p-4 flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-deep-blue-violet-600 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-deep-blue-violet-900">
                            {thresholdData?.threshold != null
                                ? `Batches above ${thresholdData.threshold.toLocaleString()} XAF require your approval`
                                : "No threshold set — all batches execute immediately without approval"}
                        </p>
                        <p className="text-xs text-deep-blue-violet-700 mt-0.5">
                            Click &ldquo;Approval Threshold&rdquo; to change this setting.
                        </p>
                    </div>
                </div>
            )}

            {/* Pending Batches */}
            {isLoading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 animate-spin text-deep-blue-violet-600" />
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
                    {error.message}
                </div>
            ) : batches.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
                    <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
                    <p className="text-base font-semibold text-gray-900">All caught up!</p>
                    <p className="text-sm text-gray-500 mt-1">No batches are waiting for approval.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 font-medium">{batches.length} batch{batches.length !== 1 ? "es" : ""} awaiting approval</p>
                    {batches.map((batch) => (
                        <BatchCard
                            key={batch.id}
                            batch={batch}
                            onApprove={handleApprove}
                            onReject={setRejectTarget}
                            approving={approving}
                            rejecting={rejecting}
                        />
                    ))}
                </div>
            )}

            {/* Reject Modal */}
            {rejectTarget && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <XCircle className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-gray-900">Reject Batch</h3>
                                <p className="text-xs text-gray-500">
                                    {parseFloat(rejectTarget.totalAmount).toLocaleString()} {rejectTarget.currency} · {rejectTarget.validCount} recipients
                                </p>
                            </div>
                        </div>
                        <form onSubmit={handleReject} className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-gray-700 mb-1 block">Reason (optional)</label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Amount exceeds monthly limit for this merchant..."
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setRejectTarget(null)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50">
                                    Cancel
                                </button>
                                <button type="submit" disabled={rejecting} className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 disabled:opacity-50">
                                    {rejecting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Reject Batch"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Threshold Modal */}
            {showThresholdModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-semibold text-gray-900">Set Approval Threshold</h3>
                            <button onClick={() => setShowThresholdModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        <p className="text-xs text-gray-500 mb-4">
                            Bulk batches with a total amount above this threshold will require admin approval before executing.
                            Leave empty to remove the threshold (all batches execute immediately).
                        </p>
                        <form onSubmit={handleSetThreshold} className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-gray-700 mb-1 block">
                                    Threshold Amount (XAF) — leave empty to remove
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={thresholdValue}
                                    onChange={(e) => setThresholdValue(e.target.value)}
                                    placeholder="e.g. 5000000"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-deep-blue-violet-500 outline-none"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setShowThresholdModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50">
                                    Cancel
                                </button>
                                <button type="submit" disabled={settingThreshold} className="flex-1 px-4 py-2 bg-deep-blue-violet-600 text-white rounded-lg text-sm font-semibold hover:bg-deep-blue-violet-700 disabled:opacity-50">
                                    {settingThreshold ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Save Threshold"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
