"use client";

import { useState } from "react";
import { Plus, Settings, Search, X, Loader2, Trash2, Edit2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
    useAdminWithdrawalLimits,
    useCreateWithdrawalLimit,
    useDeleteWithdrawalLimit,
} from "@/features/withdrawals/hooks";
import type { WithdrawalLimit } from "@/features/withdrawals/types";

export default function AdminWithdrawalLimitsPage() {
    const [showModal, setShowModal] = useState(false);
    const [editingLimit, setEditingLimit] = useState<WithdrawalLimit | null>(null);

    const { data, isLoading } = useAdminWithdrawalLimits();
    const { mutate: saveLimit, isPending: saving } = useCreateWithdrawalLimit();
    const { mutate: deleteLimit, isPending: deleting } = useDeleteWithdrawalLimit();

    const [form, setForm] = useState({
        methodType: "MOBILE_MONEY",
        gateway: "MTN_MOMO",
        currency: "XAF",
        minAmount: "",
        maxAmount: "",
    });

    const limits = data?.limits ?? [];

    const handleEdit = (limit: WithdrawalLimit) => {
        setEditingLimit(limit);
        setForm({
            methodType: limit.methodType,
            gateway: limit.gateway || "",
            currency: limit.currency,
            minAmount: limit.minAmount,
            maxAmount: limit.maxAmount || "",
        });
        setShowModal(true);
    };

    const handleAddNew = () => {
        setEditingLimit(null);
        setForm({ methodType: "MOBILE_MONEY", gateway: "MTN_MOMO", currency: "XAF", minAmount: "", maxAmount: "" });
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        saveLimit(
            {
                method_type: form.methodType as any,
                gateway: form.methodType === "MOBILE_MONEY" && form.gateway ? (form.gateway as any) : undefined,
                currency: form.currency,
                min_amount: parseFloat(form.minAmount),
                max_amount: form.maxAmount ? parseFloat(form.maxAmount) : undefined,
            },
            {
                onSuccess: () => {
                    toast.success("Limit saved successfully");
                    setShowModal(false);
                },
                onError: (err) => toast.error(err.message),
            }
        );
    };

    const handleDelete = (id: string) => {
        if (!window.confirm("Are you sure you want to delete this limit?")) return;
        deleteLimit(id, {
            onSuccess: () => toast.success("Limit deleted successfully"),
            onError: (err) => toast.error(err.message),
        });
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Withdrawal Limits</h1>
                    <p className="text-xs text-slate-500 mt-1">Configure minimum and maximum amounts per withdrawal method</p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="px-4 py-2 bg-deep-blue-violet-600 text-white rounded-lg text-sm font-semibold hover:bg-deep-blue-violet-700 transition-colors flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Limit
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3">Method Type</th>
                                <th className="px-4 py-3">Gateway</th>
                                <th className="px-4 py-3">Min Amount</th>
                                <th className="px-4 py-3">Max Amount</th>
                                <th className="px-4 py-3 flex justify-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={5} className="px-4 py-3">
                                            <div className="h-4 bg-slate-100 rounded animate-pulse w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : limits.length > 0 ? (
                                limits.map((limit) => (
                                    <tr key={limit.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium text-slate-800">
                                            {limit.methodType.replace(/_/g, " ")}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">
                                            {limit.gateway ? limit.gateway.replace(/_/g, " ") : "All"}
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-slate-700">
                                            {parseFloat(limit.minAmount).toLocaleString()} {limit.currency}
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-slate-700">
                                            {limit.maxAmount ? `${parseFloat(limit.maxAmount).toLocaleString()} ${limit.currency}` : <span className="text-slate-400 font-normal">No limit</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(limit)}
                                                    className="p-1 text-slate-400 hover:text-deep-blue-violet-600 rounded transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(limit.id)}
                                                    className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                                        <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                                        <p>No withdrawal limits configured.</p>
                                        <p className="text-xs">Without limits, any withdrawal amount &gt; 0 is allowed.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md">
                        <div className="flex items-center justify-between p-4 border-b border-slate-100">
                            <h3 className="text-lg font-semibold text-slate-800">
                                {editingLimit ? "Edit Limit" : "Add New Limit"}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 block mb-1">Method Type</label>
                                <select
                                    value={form.methodType}
                                    onChange={(e) => setForm((p) => ({ ...p, methodType: e.target.value }))}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue-violet-500"
                                >
                                    <option value="MOBILE_MONEY">Mobile Money</option>
                                    <option value="LOCAL_BANK">Local Bank</option>
                                    <option value="INTERNATIONAL_BANK">International Bank</option>
                                    <option value="PREPAID_CARD">Prepaid Card</option>
                                </select>
                            </div>

                            {form.methodType === "MOBILE_MONEY" && (
                                <div>
                                    <label className="text-sm font-medium text-slate-700 block mb-1">Gateway (Optional)</label>
                                    <select
                                        value={form.gateway}
                                        onChange={(e) => setForm((p) => ({ ...p, gateway: e.target.value }))}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue-violet-500"
                                    >
                                        <option value="">Apply to all Mobile Money</option>
                                        <option value="MTN_MOMO">MTN MoMo</option>
                                        <option value="ORANGE_MONEY">Orange Money</option>
                                        <option value="AIRTEL_MONEY">Airtel Money</option>
                                    </select>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 block mb-1">Currency</label>
                                    <input
                                        type="text"
                                        value={form.currency}
                                        onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value.toUpperCase() }))}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue-violet-500"
                                        placeholder="XAF"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 block mb-1">Min Amount</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={form.minAmount}
                                        onChange={(e) => setForm((p) => ({ ...p, minAmount: e.target.value }))}
                                        placeholder="500"
                                        required
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue-violet-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 block mb-1">Max Amount <span className="text-slate-400 font-normal">(opt)</span></label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min={form.minAmount || "0"}
                                        value={form.maxAmount}
                                        onChange={(e) => setForm((p) => ({ ...p, maxAmount: e.target.value }))}
                                        placeholder="No limit"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue-violet-500"
                                    />
                                </div>
                            </div>

                            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg mt-2">
                                <p className="text-xs text-slate-500">
                                    <strong>Note:</strong> Creating a limit for the same method type, gateway, and currency configuration will update any existing limit.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 px-4 py-2 bg-deep-blue-violet-600 text-white rounded-lg font-medium hover:bg-deep-blue-violet-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Limit"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
