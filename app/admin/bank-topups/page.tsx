"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
    useAdminBankTopupRequests,
    useApproveAdminBankTopupRequest,
    useRejectAdminBankTopupRequest,
} from "@/features/admin/queries";
import type { AdminBankTopupRequest } from "@/features/admin/types";

const statusTone: Record<AdminBankTopupRequest["status"], string> = {
    PENDING: "bg-orange-100 text-orange-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
};

export default function AdminBankTopupsPage() {
    const [status, setStatus] = useState("");
    const [merchantId, setMerchantId] = useState("");
    const [selectedRequest, setSelectedRequest] = useState<AdminBankTopupRequest | null>(null);
    const [adminNote, setAdminNote] = useState("");

    const filters = useMemo(
        () => ({
            ...(status ? { status } : {}),
            ...(merchantId.trim() ? { merchantId: merchantId.trim() } : {}),
        }),
        [merchantId, status]
    );

    const { data, isLoading } = useAdminBankTopupRequests(filters);
    const approveMutation = useApproveAdminBankTopupRequest();
    const rejectMutation = useRejectAdminBankTopupRequest();

    const requests = data?.requests ?? [];
    const actionPending = approveMutation.isPending || rejectMutation.isPending;

    const handleReview = async (action: "approve" | "reject") => {
        if (!selectedRequest) return;

        try {
            if (action === "approve") {
                await approveMutation.mutateAsync({
                    id: selectedRequest.id,
                    data: { adminNote: adminNote.trim() || undefined },
                });
                toast.success("Bank top-up approved and wallet credited");
            } else {
                await rejectMutation.mutateAsync({
                    id: selectedRequest.id,
                    data: { adminNote: adminNote.trim() || undefined },
                });
                toast.success("Bank top-up rejected");
            }
            setSelectedRequest(null);
            setAdminNote("");
        } catch (error: unknown) {
            toast.error((error as { message?: string })?.message || `Failed to ${action} bank top-up`);
        }
    };

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Bank Top-Up Requests</h1>
                <p className="text-sm text-gray-500 mt-1">Review manual bank transfer requests and credit merchant wallets on approval.</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-medium text-gray-700 mb-1.5 block">Status</label>
                        <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm">
                            <option value="">All statuses</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-700 mb-1.5 block">Merchant ID</label>
                        <input value={merchantId} onChange={(e) => setMerchantId(e.target.value)} placeholder="Filter by merchant ID" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
                    </div>
                </div>
            </div>

            <div className="grid xl:grid-cols-[1.25fr_0.75fr] gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    {isLoading ? (
                        <div className="py-10 flex items-center justify-center text-gray-500">
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Loading requests...
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="py-10 text-center text-sm text-gray-500">No bank top-up requests found for the selected filters.</div>
                    ) : (
                        <div className="space-y-4">
                            {requests.map((request) => (
                                <button
                                    key={request.id}
                                    type="button"
                                    onClick={() => {
                                        setSelectedRequest(request);
                                        setAdminNote(request.adminNote || "");
                                    }}
                                    className={`w-full text-left rounded-xl border p-4 transition ${
                                        selectedRequest?.id === request.id ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-blue-200"
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="font-semibold text-gray-900">{request.referenceCode}</p>
                                            <p className="text-sm text-gray-500 mt-1">{request.merchantBusinessName}</p>
                                            <p className="text-sm text-gray-600 mt-2">{request.amount} {request.currency} • {request.bankName}</p>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusTone[request.status]}`}>
                                            {request.status}
                                        </span>
                                    </div>
                                    {request.merchantNote && (
                                        <p className="text-xs text-gray-500 mt-3">Merchant note: {request.merchantNote}</p>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    {selectedRequest ? (
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">{selectedRequest.referenceCode}</h2>
                                <p className="text-sm text-gray-500 mt-1">{selectedRequest.merchantBusinessName}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-xs uppercase text-gray-500">Amount</p>
                                    <p className="font-semibold text-gray-900">{selectedRequest.amount} {selectedRequest.currency}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase text-gray-500">Environment</p>
                                    <p className="font-semibold text-gray-900 capitalize">{selectedRequest.environment}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase text-gray-500">Bank</p>
                                    <p className="font-semibold text-gray-900">{selectedRequest.bankName}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase text-gray-500">Created</p>
                                    <p className="font-semibold text-gray-900">{new Date(selectedRequest.createdAt).toLocaleString()}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs uppercase text-gray-500 mb-2">Instructions</p>
                                <pre className="whitespace-pre-wrap text-sm text-gray-600 font-sans rounded-lg bg-gray-50 p-3 border border-gray-200">{selectedRequest.instructions}</pre>
                            </div>

                            {selectedRequest.receiptUrl && (
                                <a href={selectedRequest.receiptUrl} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700">
                                    View uploaded receipt
                                </a>
                            )}

                            <div>
                                <label className="text-xs font-medium text-gray-700 mb-1.5 block">Admin note</label>
                                <textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)} rows={5} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" placeholder="Transfer confirmed on bank statement" />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => void handleReview("approve")}
                                    disabled={actionPending || selectedRequest.status !== "PENDING"}
                                    className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold disabled:opacity-60 inline-flex items-center justify-center gap-2"
                                >
                                    {approveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                    Approve
                                </button>
                                <button
                                    type="button"
                                    onClick={() => void handleReview("reject")}
                                    disabled={actionPending || selectedRequest.status !== "PENDING"}
                                    className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold disabled:opacity-60 inline-flex items-center justify-center gap-2"
                                >
                                    {rejectMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                    Reject
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full min-h-[320px] flex items-center justify-center text-sm text-gray-500 text-center">
                            Select a bank top-up request to review its receipt, notes, and approval actions.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
