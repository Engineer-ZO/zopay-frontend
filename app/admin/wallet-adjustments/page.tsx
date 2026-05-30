"use client";

import { useState } from "react";
import { ArrowDownCircle, ArrowUpCircle, Loader2, Search, Wallet } from "lucide-react";
import { toast } from "sonner";
import {
    useCreateMerchantWalletAdjustment,
    useMerchantWalletAdjustments,
} from "@/features/admin/queries";

export default function AdminWalletAdjustmentsPage() {
    const [merchantId, setMerchantId] = useState("");
    const [direction, setDirection] = useState<"CREDIT" | "DEBIT">("CREDIT");
    const [amount, setAmount] = useState("");
    const [currency, setCurrency] = useState("XAF");
    const [reason, setReason] = useState("");
    const [environment, setEnvironment] = useState<"sandbox" | "production">("production");
    const [filterMerchantId, setFilterMerchantId] = useState("");

    const createMutation = useCreateMerchantWalletAdjustment();
    const { data, isLoading } = useMerchantWalletAdjustments(
        filterMerchantId.trim() ? { merchantId: filterMerchantId.trim() } : undefined
    );

    const adjustments = data?.adjustments ?? [];
    const creditCount = adjustments.filter((adjustment) => adjustment.direction === "CREDIT").length;
    const debitCount = adjustments.length - creditCount;

    const handleCreate = async () => {
        const parsedAmount = Number(amount);
        if (!merchantId.trim()) {
            toast.error("Merchant ID is required");
            return;
        }
        if (!parsedAmount || parsedAmount <= 0) {
            toast.error("Amount must be greater than 0");
            return;
        }
        if (!reason.trim()) {
            toast.error("Reason is required");
            return;
        }

        try {
            await createMutation.mutateAsync({
                merchantId: merchantId.trim(),
                direction,
                amount: parsedAmount,
                currency: currency.trim().toUpperCase(),
                reason: reason.trim(),
                environment,
            });
            toast.success("Wallet adjustment created");
            setAmount("");
            setReason("");
        } catch (error: unknown) {
            toast.error((error as { message?: string })?.message || "Failed to create wallet adjustment");
        }
    };

    return (
        <div className="space-y-6 p-6 max-w-7xl">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Merchant Wallet Adjustments</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Credit or debit a merchant wallet directly for offline corrections and administrative adjustments.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Total Adjustments</p>
                    <p className="text-3xl font-bold text-gray-900 mt-3">{adjustments.length}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Credits</p>
                    <p className="text-3xl font-bold text-green-700 mt-3">{creditCount}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Debits</p>
                    <p className="text-3xl font-bold text-red-700 mt-3">{debitCount}</p>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Create adjustment</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            This is separate from manual bank top-up approval and is meant for direct admin corrections.
                        </p>
                    </div>
                    <div
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                            direction === "CREDIT" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                    >
                        {direction === "CREDIT" ? "Adding funds" : "Removing funds"}
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                        <label className="text-xs font-medium text-gray-700 mb-1.5 block">Merchant ID</label>
                        <input
                            value={merchantId}
                            onChange={(e) => setMerchantId(e.target.value)}
                            placeholder="daf858b4-6910-4a5d-92ce-c22c6d84f93e"
                            className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium text-gray-700 mb-1.5 block">Direction</label>
                            <select
                                value={direction}
                                onChange={(e) => setDirection(e.target.value as "CREDIT" | "DEBIT")}
                                className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm"
                            >
                                <option value="CREDIT">CREDIT</option>
                                <option value="DEBIT">DEBIT</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-700 mb-1.5 block">Environment</label>
                            <select
                                value={environment}
                                onChange={(e) => setEnvironment(e.target.value as "sandbox" | "production")}
                                className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm"
                            >
                                <option value="production">Production</option>
                                <option value="sandbox">Sandbox</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-[1.2fr_0.8fr] gap-4">
                        <div>
                            <label className="text-xs font-medium text-gray-700 mb-1.5 block">Amount</label>
                            <input
                                type="number"
                                min="1"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="25000"
                                className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-700 mb-1.5 block">Currency</label>
                            <input
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                                className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm"
                            />
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <label className="text-xs font-medium text-gray-700 mb-1.5 block">Reason</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={4}
                            placeholder="Manual correction after offline settlement confirmation"
                            className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm"
                        />
                    </div>
                </div>

                <div className="mt-5 flex justify-end">
                    <button
                        type="button"
                        onClick={() => void handleCreate()}
                        disabled={createMutation.isPending}
                        className="px-5 py-3 bg-deep-blue-violet-600 hover:bg-deep-blue-violet-700 text-white rounded-lg font-semibold disabled:opacity-60 inline-flex items-center justify-center gap-2"
                    >
                        {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
                        Create Wallet Adjustment
                    </button>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Adjustment history</h2>
                        <p className="text-sm text-gray-500 mt-1">Recent credit and debit adjustments across merchant wallets.</p>
                    </div>
                    <div className="relative w-full lg:w-80">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            value={filterMerchantId}
                            onChange={(e) => setFilterMerchantId(e.target.value)}
                            placeholder="Filter by merchant ID"
                            className="w-full pl-9 pr-3 py-3 border border-gray-300 rounded-lg text-sm"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="py-12 flex items-center justify-center text-gray-500">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Loading adjustments...
                    </div>
                ) : adjustments.length === 0 ? (
                    <div className="py-12 text-center text-sm text-gray-500">No wallet adjustments found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[920px]">
                            <thead>
                                <tr className="border-b border-gray-200 text-left">
                                    <th className="py-3 pr-4 text-xs font-semibold text-gray-500 uppercase">Reference</th>
                                    <th className="py-3 pr-4 text-xs font-semibold text-gray-500 uppercase">Merchant</th>
                                    <th className="py-3 pr-4 text-xs font-semibold text-gray-500 uppercase">Direction</th>
                                    <th className="py-3 pr-4 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                                    <th className="py-3 pr-4 text-xs font-semibold text-gray-500 uppercase">Environment</th>
                                    <th className="py-3 pr-4 text-xs font-semibold text-gray-500 uppercase">Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {adjustments.map((adjustment) => (
                                    <tr key={adjustment.id} className="border-b border-gray-100 align-top">
                                        <td className="py-4 pr-4 min-w-[220px]">
                                            <p className="font-semibold text-gray-900">{adjustment.referenceCode}</p>
                                            <p className="text-xs text-gray-500 mt-1 break-words">{adjustment.reason}</p>
                                        </td>
                                        <td className="py-4 pr-4 min-w-[260px]">
                                            <p className="text-sm text-gray-700 break-all">{adjustment.merchantId}</p>
                                        </td>
                                        <td className="py-4 pr-4">
                                            <span
                                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                    adjustment.direction === "CREDIT" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                                }`}
                                            >
                                                {adjustment.direction === "CREDIT" ? <ArrowDownCircle className="w-3.5 h-3.5" /> : <ArrowUpCircle className="w-3.5 h-3.5" />}
                                                {adjustment.direction}
                                            </span>
                                        </td>
                                        <td className="py-4 pr-4 text-sm text-gray-700 whitespace-nowrap">
                                            {adjustment.amount} {adjustment.currency}
                                        </td>
                                        <td className="py-4 pr-4 text-sm text-gray-700 capitalize whitespace-nowrap">
                                            {adjustment.environment}
                                        </td>
                                        <td className="py-4 pr-4 text-sm text-gray-500 whitespace-nowrap">
                                            {new Date(adjustment.createdAt).toLocaleString()}
                                        </td>
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
