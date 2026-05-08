"use client";

import { useState } from "react";
import {
    Wallet,
    CheckCircle2,
    XCircle,
    Ban,
    Clock,
    Trash2,
    Plus,
    Search,
    Loader2,
    X,
    AlertTriangle,
    Smartphone,
    Building2,
    Globe,
    CreditCard,
    ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import {
    useAdminWithdrawalMethods,
    useAdminAddMobileMoney,
    useAdminApproveWithdrawalMethod,
    useAdminRejectWithdrawalMethod,
    useAdminDisableWithdrawalMethod,
    useAdminDeleteWithdrawalMethod,
} from "@/features/admin/queries";
import type { AdminWithdrawalMethod } from "@/features/admin/api";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    PENDING: { label: "Pending", color: "bg-orange-100 text-orange-700", icon: <Clock className="w-3 h-3" /> },
    ACTIVE: { label: "Active", color: "bg-green-100 text-green-700", icon: <CheckCircle2 className="w-3 h-3" /> },
    DISABLED: { label: "Disabled", color: "bg-gray-100 text-gray-600", icon: <Ban className="w-3 h-3" /> },
    REJECTED: { label: "Rejected", color: "bg-red-100 text-red-700", icon: <XCircle className="w-3 h-3" /> },
};

const TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode }> = {
    MOBILE_MONEY: { label: "Mobile Money", icon: <Smartphone className="w-4 h-4 text-green-500" /> },
    LOCAL_BANK: { label: "Local Bank", icon: <Building2 className="w-4 h-4 text-blue-500" /> },
    INTERNATIONAL_BANK: { label: "International Bank", icon: <Globe className="w-4 h-4 text-purple-500" /> },
    PREPAID_CARD: { label: "Prepaid Card", icon: <CreditCard className="w-4 h-4 text-orange-500" /> },
};

function methodSummary(m: AdminWithdrawalMethod): string {
    switch (m.methodType) {
        case "MOBILE_MONEY": return `${m.gateway?.replace(/_/g, " ")} — ${m.msisdn}`;
        case "LOCAL_BANK": return `${m.bankName} — ${m.accountNumber} (${m.accountName})`;
        case "INTERNATIONAL_BANK": return `${m.bankName} — IBAN: ${m.iban}`;
        case "PREPAID_CARD": return `${m.cardNetwork} •••• ${m.lastFourDigits} (${m.cardholderName})`;
        default: return m.methodType;
    }
}

export default function AdminWithdrawalsPage() {
    const [statusFilter, setStatusFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [merchantFilter, setMerchantFilter] = useState("");
    const [search, setSearch] = useState("");

    // Add Mobile Money modal
    const [showAddMM, setShowAddMM] = useState(false);
    const [mmMerchantId, setMmMerchantId] = useState("");
    const [mmGateway, setMmGateway] = useState("MTN_MOMO");
    const [mmMsisdn, setMmMsisdn] = useState("");

    // Reject modal
    const [rejectTarget, setRejectTarget] = useState<AdminWithdrawalMethod | null>(null);
    const [rejectReason, setRejectReason] = useState("");

    // Delete confirm
    const [deleteTarget, setDeleteTarget] = useState<AdminWithdrawalMethod | null>(null);

    const { data, isLoading, error } = useAdminWithdrawalMethods({
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(typeFilter ? { method_type: typeFilter } : {}),
        ...(merchantFilter ? { merchant_id: merchantFilter } : {}),
    });

    const { mutate: addMM, isPending: addingMM } = useAdminAddMobileMoney();
    const { mutate: approve, isPending: approving } = useAdminApproveWithdrawalMethod();
    const { mutate: reject, isPending: rejecting } = useAdminRejectWithdrawalMethod();
    const { mutate: disable, isPending: disabling } = useAdminDisableWithdrawalMethod();
    const { mutate: deleteMeth, isPending: deleting } = useAdminDeleteWithdrawalMethod();

    const methods = (data?.methods ?? []).filter((m) => {
        if (!search) return true;
        return methodSummary(m).toLowerCase().includes(search.toLowerCase()) ||
            m.merchantId.toLowerCase().includes(search.toLowerCase());
    });

    const handleAddMM = (e: React.FormEvent) => {
        e.preventDefault();
        addMM(
            { merchantId: mmMerchantId, payload: { gateway: mmGateway, msisdn: mmMsisdn } },
            {
                onSuccess: () => {
                    toast.success("Mobile money method added");
                    setShowAddMM(false);
                    setMmMerchantId(""); setMmMsisdn("");
                },
                onError: (err) => toast.error(err.message),
            }
        );
    };

    const handleApprove = (m: AdminWithdrawalMethod) => {
        approve(m.id, {
            onSuccess: () => toast.success("Method approved"),
            onError: (err) => toast.error(err.message),
        });
    };

    const handleReject = (e: React.FormEvent) => {
        e.preventDefault();
        if (!rejectTarget) return;
        reject(
            { id: rejectTarget.id, reason: rejectReason },
            {
                onSuccess: () => {
                    toast.success("Method rejected");
                    setRejectTarget(null);
                    setRejectReason("");
                },
                onError: (err) => toast.error(err.message),
            }
        );
    };

    const handleDisable = (m: AdminWithdrawalMethod) => {
        disable(m.id, {
            onSuccess: () => toast.success("Method disabled"),
            onError: (err) => toast.error(err.message),
        });
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        deleteMeth(deleteTarget.id, {
            onSuccess: () => {
                toast.success("Method deleted");
                setDeleteTarget(null);
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
                        <Wallet className="w-6 h-6 text-blue-600" />
                        Withdrawal Methods
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                        Approve, reject, and manage merchant withdrawal methods
                    </p>
                </div>
                <button
                    onClick={() => setShowAddMM(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Mobile Money
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by merchant or account..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="ACTIVE">Active</option>
                    <option value="DISABLED">Disabled</option>
                    <option value="REJECTED">Rejected</option>
                </select>
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                    <option value="">All Types</option>
                    <option value="MOBILE_MONEY">Mobile Money</option>
                    <option value="LOCAL_BANK">Local Bank</option>
                    <option value="INTERNATIONAL_BANK">International Bank</option>
                    <option value="PREPAID_CARD">Prepaid Card</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    </div>
                ) : error ? (
                    <div className="p-6 text-center text-red-600 text-sm">{error.message}</div>
                ) : methods.length === 0 ? (
                    <div className="py-16 text-center">
                        <Wallet className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">No withdrawal methods found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Type</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Details</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Merchant ID</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {methods.map((m) => {
                                    const typeConf = TYPE_CONFIG[m.methodType];
                                    const statusConf = STATUS_CONFIG[m.status];
                                    return (
                                        <tr key={m.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    {typeConf?.icon}
                                                    <span className="text-xs font-medium text-gray-700">{typeConf?.label ?? m.methodType}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-xs text-gray-700 max-w-xs truncate">
                                                {methodSummary(m)}
                                            </td>
                                            <td className="py-3 px-4 text-xs font-mono text-gray-500">
                                                {m.merchantId.slice(0, 8)}...
                                            </td>
                                            <td className="py-3 px-4">
                                                {statusConf && (
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusConf.color}`}>
                                                        {statusConf.icon}
                                                        {statusConf.label}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-xs text-gray-500">
                                                {new Date(m.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-1">
                                                    {m.status === "PENDING" && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprove(m)}
                                                                disabled={approving}
                                                                className="px-2 py-1 bg-green-100 text-green-700 rounded text-[10px] font-semibold hover:bg-green-200 transition-colors disabled:opacity-50"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => { setRejectTarget(m); setRejectReason(""); }}
                                                                className="px-2 py-1 bg-red-100 text-red-700 rounded text-[10px] font-semibold hover:bg-red-200 transition-colors"
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}
                                                    {m.status === "ACTIVE" && (
                                                        <button
                                                            onClick={() => handleDisable(m)}
                                                            disabled={disabling}
                                                            className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
                                                        >
                                                            Disable
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => setDeleteTarget(m)}
                                                        className="p-1 text-red-400 hover:text-red-600 rounded transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add Mobile Money Modal */}
            {showAddMM && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-semibold text-gray-900">Add Mobile Money for Merchant</h3>
                            <button onClick={() => setShowAddMM(false)}><X className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleAddMM} className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-gray-700 mb-1 block">Merchant ID</label>
                                <input
                                    type="text"
                                    value={mmMerchantId}
                                    onChange={(e) => setMmMerchantId(e.target.value)}
                                    placeholder="uuid"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-700 mb-1 block">Gateway</label>
                                <select
                                    value={mmGateway}
                                    onChange={(e) => setMmGateway(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="MTN_MOMO">MTN MoMo</option>
                                    <option value="ORANGE_MONEY">Orange Money</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-700 mb-1 block">Phone Number (MSISDN)</label>
                                <input
                                    type="text"
                                    value={mmMsisdn}
                                    onChange={(e) => setMmMsisdn(e.target.value)}
                                    placeholder="237670000001"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setShowAddMM(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50">
                                    Cancel
                                </button>
                                <button type="submit" disabled={addingMM} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
                                    {addingMM ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Add Method"}
                                </button>
                            </div>
                        </form>
                    </div>
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
                                <h3 className="text-base font-semibold text-gray-900">Reject Withdrawal Method</h3>
                                <p className="text-xs text-gray-500">{methodSummary(rejectTarget)}</p>
                            </div>
                        </div>
                        <form onSubmit={handleReject} className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-gray-700 mb-1 block">Reason for rejection</label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Account details could not be verified..."
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none"
                                    required
                                />
                            </div>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setRejectTarget(null)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50">
                                    Cancel
                                </button>
                                <button type="submit" disabled={rejecting} className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 disabled:opacity-50">
                                    {rejecting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Reject Method"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-gray-900">Delete Withdrawal Method</h3>
                                <p className="text-xs text-gray-500">This action is permanent and cannot be undone.</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-5 bg-gray-50 rounded-lg p-3 font-mono text-xs">
                            {methodSummary(deleteTarget)}
                        </p>
                        <div className="flex gap-2">
                            <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50">
                                Cancel
                            </button>
                            <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 disabled:opacity-50">
                                {deleting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Delete Permanently"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
