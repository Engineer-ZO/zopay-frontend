"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Building2, Copy, FileUp, Loader2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { useEnvironment } from "@/core/environment/EnvironmentContext";
import {
    useBankTopupAccounts,
    useCreateBankTopupRequest,
    useMerchantBankTopups,
    useUploadBankTopupReceipt,
} from "@/features/merchants/hooks";
import type { MerchantBase64FileObject, MerchantBankTopupRequest } from "@/features/merchants/types";

function toBase64Payload(file: File, base64: string): MerchantBase64FileObject {
    return {
        base64,
        filename: file.name,
        mimeType: file.type || "application/octet-stream",
    };
}

async function readFileAsBase64(file: File): Promise<MerchantBase64FileObject> {
    return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = typeof reader.result === "string" ? reader.result : "";
            resolve(toBase64Payload(file, result));
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
    });
}

const statusTone: Record<MerchantBankTopupRequest["status"], string> = {
    PENDING: "bg-crimson-red-100 text-crimson-red-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
};

export default function MerchantBankTopupsPage() {
    const { environment } = useEnvironment();
    const [selectedAccountId, setSelectedAccountId] = useState("");
    const [amount, setAmount] = useState("");
    const [merchantNote, setMerchantNote] = useState("");
    const [receipt, setReceipt] = useState<MerchantBase64FileObject | null>(null);
    const [uploadingRequestId, setUploadingRequestId] = useState<string | null>(null);
    const [createdRequest, setCreatedRequest] = useState<MerchantBankTopupRequest | null>(null);

    const { data: accountsData, isLoading: accountsLoading } = useBankTopupAccounts();
    const { data: requestsData, isLoading: requestsLoading } = useMerchantBankTopups();
    const createRequestMutation = useCreateBankTopupRequest();
    const uploadReceiptMutation = useUploadBankTopupReceipt();

    const accounts = useMemo(
        () => (accountsData?.accounts ?? []).filter((account) => account.isActive),
        [accountsData]
    );
    const requests = requestsData?.requests ?? [];
    const selectedAccount = accounts.find((account) => account.id === selectedAccountId) ?? null;

    const handleCreateRequest = async () => {
        if (!selectedAccountId) {
            toast.error("Select a bank account first");
            return;
        }

        const parsedAmount = Number(amount);
        if (!parsedAmount || parsedAmount <= 0) {
            toast.error("Amount must be greater than 0");
            return;
        }

        try {
            const result = await createRequestMutation.mutateAsync({
                bankAccountId: selectedAccountId,
                amount: parsedAmount,
                currency: selectedAccount?.currency || "XAF",
                merchantNote: merchantNote.trim() || undefined,
                receipt: receipt ?? undefined,
            });

            setCreatedRequest(result.request);
            setAmount("");
            setMerchantNote("");
            setReceipt(null);
            toast.success(result.message);
        } catch (error: unknown) {
            const message = (error as { message?: string })?.message || "Failed to create bank top-up request";
            toast.error(message);
        }
    };

    const handleReceiptChange = async (file: File | null) => {
        if (!file) return;
        try {
            const payload = await readFileAsBase64(file);
            setReceipt(payload);
        } catch (error: unknown) {
            toast.error((error as { message?: string })?.message || "Failed to read receipt");
        }
    };

    const handleUploadReceipt = async (requestId: string, file: File | null) => {
        if (!file) return;

        try {
            setUploadingRequestId(requestId);
            const payload = await readFileAsBase64(file);
            await uploadReceiptMutation.mutateAsync({
                requestId,
                payload: { receipt: payload },
            });
            toast.success("Receipt uploaded successfully");
        } catch (error: unknown) {
            toast.error((error as { message?: string })?.message || "Failed to upload receipt");
        } finally {
            setUploadingRequestId(null);
        }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto p-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <Link href="/dashboard/wallet" className="text-sm text-crimson-red-600 hover:text-crimson-red-700 inline-flex items-center gap-1">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Wallet
                    </Link>
                    <h1 className="text-2xl font-bold text-foreground mt-2">Manual Bank Top-Up</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Generate a bank transfer reference, make the transfer, then upload your receipt for admin approval.
                    </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-muted text-sm font-medium text-muted-foreground capitalize">
                    {environment}
                </span>
            </div>

            {createdRequest && (
                <div className="rounded-xl border border-crimson-red-200 bg-crimson-red-50 p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold text-crimson-red-900">Reference code generated</p>
                            <p className="text-2xl font-bold text-crimson-red-700 mt-2">{createdRequest.referenceCode}</p>
                            <p className="text-xs text-crimson-red-800 mt-2">
                                Use this exact reference in your bank transfer description or narration.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                navigator.clipboard.writeText(createdRequest.referenceCode);
                                toast.success("Reference code copied");
                            }}
                            className="px-3 py-2 rounded-lg border border-crimson-red-300 bg-white text-crimson-red-700 text-sm font-medium inline-flex items-center gap-2"
                        >
                            <Copy className="w-4 h-4" />
                            Copy
                        </button>
                    </div>
                    <div className="mt-4 rounded-lg bg-white p-4 border border-crimson-red-100">
                        <p className="text-sm font-semibold text-foreground">Bank instructions</p>
                        <pre className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground font-sans">{createdRequest.instructions}</pre>
                    </div>
                </div>
            )}

            <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900">Create bank top-up request</h2>
                    <p className="text-sm text-gray-500 mt-1">Select an active bank account configured by admin.</p>

                    <div className="space-y-4 mt-5">
                        <div>
                            <label className="text-xs font-medium text-gray-700 mb-1.5 block">Bank account</label>
                            <select
                                value={selectedAccountId}
                                onChange={(e) => setSelectedAccountId(e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
                                disabled={accountsLoading || createRequestMutation.isPending}
                            >
                                <option value="">Select bank account</option>
                                {accounts.map((account) => (
                                    <option key={account.id} value={account.id}>
                                        {account.bankName} ({account.currency})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedAccount && (
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                <div className="flex items-center gap-3">
                                    {selectedAccount.logoUrl ? (
                                        <img src={selectedAccount.logoUrl} alt={selectedAccount.bankName} className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                                            <Building2 className="w-5 h-5 text-gray-500" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{selectedAccount.bankName}</p>
                                        <p className="text-xs text-gray-500">{selectedAccount.currency}</p>
                                    </div>
                                </div>
                                <pre className="mt-3 whitespace-pre-wrap text-sm text-gray-600 font-sans">{selectedAccount.instructions}</pre>
                            </div>
                        )}

                        <div>
                            <label className="text-xs font-medium text-gray-700 mb-1.5 block">Amount</label>
                            <input
                                type="number"
                                min="1"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="50000"
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
                                disabled={createRequestMutation.isPending}
                            />
                        </div>

                        <div>
                            <label className="text-xs font-medium text-gray-700 mb-1.5 block">Merchant note</label>
                            <textarea
                                value={merchantNote}
                                onChange={(e) => setMerchantNote(e.target.value)}
                                rows={4}
                                placeholder="Transferred from my banking app"
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
                                disabled={createRequestMutation.isPending}
                            />
                        </div>

                        <div>
                            <label className="text-xs font-medium text-gray-700 mb-1.5 block">Receipt (optional)</label>
                            <label className="flex items-center gap-2 px-3 py-3 border border-dashed border-gray-300 rounded-lg text-sm text-gray-600 cursor-pointer hover:bg-gray-50">
                                <UploadCloud className="w-4 h-4" />
                                {receipt ? `${receipt.filename} selected` : "Upload PDF or image receipt"}
                                <input
                                    type="file"
                                    accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
                                    className="hidden"
                                    onChange={(e) => void handleReceiptChange(e.target.files?.[0] ?? null)}
                                    disabled={createRequestMutation.isPending}
                                />
                            </label>
                        </div>

                        <button
                            type="button"
                            onClick={() => void handleCreateRequest()}
                            disabled={createRequestMutation.isPending || accountsLoading}
                            className="w-full px-4 py-3 bg-crimson-red-600 hover:bg-crimson-red-700 text-white rounded-lg font-semibold disabled:opacity-60 inline-flex items-center justify-center gap-2"
                        >
                            {createRequestMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            Create Bank Top-Up Request
                        </button>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900">Important</h2>
                    <div className="space-y-3 mt-4 text-sm text-gray-600">
                        <p>1. Create the request to generate your reference code.</p>
                        <p>2. Use that reference in the bank transfer description or narration.</p>
                        <p>3. Upload your receipt if you did not attach it during request creation.</p>
                        <p>4. Your wallet is credited only after admin approval.</p>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">Bank top-up history</h2>
                <p className="text-sm text-gray-500 mt-1">Track pending, approved, and rejected manual transfer requests.</p>

                {requestsLoading ? (
                    <div className="py-10 flex items-center justify-center text-gray-500">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Loading requests...
                    </div>
                ) : requests.length === 0 ? (
                    <div className="py-10 text-center text-sm text-gray-500">No bank top-up requests yet.</div>
                ) : (
                    <div className="overflow-x-auto mt-4">
                        <table className="w-full min-w-[920px]">
                            <thead>
                                <tr className="border-b border-gray-200 text-left">
                                    <th className="py-3 pr-4 text-xs font-semibold text-gray-500 uppercase">Reference</th>
                                    <th className="py-3 pr-4 text-xs font-semibold text-gray-500 uppercase">Bank</th>
                                    <th className="py-3 pr-4 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                                    <th className="py-3 pr-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    <th className="py-3 pr-4 text-xs font-semibold text-gray-500 uppercase">Receipt</th>
                                    <th className="py-3 pr-4 text-xs font-semibold text-gray-500 uppercase">Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map((request) => (
                                    <tr key={request.id} className="border-b border-gray-100 align-top">
                                        <td className="py-4 pr-4">
                                            <p className="font-semibold text-gray-900">{request.referenceCode}</p>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-3">{request.instructions}</p>
                                        </td>
                                        <td className="py-4 pr-4 text-sm text-gray-700">{request.bankName}</td>
                                        <td className="py-4 pr-4 text-sm text-gray-700">{request.amount} {request.currency}</td>
                                        <td className="py-4 pr-4">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${statusTone[request.status]}`}>
                                                {request.status}
                                            </span>
                                            {request.adminNote && (
                                                <p className="text-xs text-gray-500 mt-2">{request.adminNote}</p>
                                            )}
                                        </td>
                                        <td className="py-4 pr-4">
                                            {request.receiptUrl ? (
                                                <a href={request.receiptUrl} target="_blank" rel="noreferrer" className="text-sm text-crimson-red-600 hover:text-crimson-red-700">
                                                    View receipt
                                                </a>
                                            ) : request.status === "PENDING" ? (
                                                <label className="inline-flex items-center gap-2 text-sm text-crimson-red-600 cursor-pointer">
                                                    {uploadingRequestId === request.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4" />}
                                                    Upload receipt
                                                    <input
                                                        type="file"
                                                        accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
                                                        className="hidden"
                                                        onChange={(e) => void handleUploadReceipt(request.id, e.target.files?.[0] ?? null)}
                                                    />
                                                </label>
                                            ) : (
                                                <span className="text-sm text-gray-400">No receipt</span>
                                            )}
                                        </td>
                                        <td className="py-4 pr-4 text-sm text-gray-500">{new Date(request.createdAt).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
