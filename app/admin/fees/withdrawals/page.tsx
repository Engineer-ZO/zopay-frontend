"use client";

import { useState } from "react";
import {
    Plus,
    Trash2,
    Edit2,
    Save,
    X,
    AlertTriangle,
    Loader2,
    ChevronLeft,
    DollarSign,
    Percent,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import {
    useWithdrawalFeeRules,
    useUpsertWithdrawalFeeRule,
    useDeleteWithdrawalFeeRule
} from "@/features/withdrawals/hooks/index";
import { WithdrawalFeeRule, WithdrawalMethodType, WithdrawalFeeType } from "@/features/withdrawals/types/index";

interface FeeRuleFormState {
    id?: string;
    methodType: WithdrawalMethodType;
    currency: string;
    feeType: WithdrawalFeeType;
    flatFee: string;
    percentageFee: string;
    minFee: string;
    maxFee: string;
    isActive: boolean;
}

const emptyRuleForm = (): FeeRuleFormState => ({
    methodType: "MOBILE_MONEY",
    currency: "XAF",
    feeType: "FLAT",
    flatFee: "0",
    percentageFee: "0",
    minFee: "",
    maxFee: "",
    isActive: true,
});

const toRuleFormState = (rule: WithdrawalFeeRule): FeeRuleFormState => ({
    id: rule.id,
    methodType: rule.methodType,
    currency: rule.currency,
    feeType: rule.feeType,
    flatFee: rule.flatFee,
    percentageFee: rule.percentageFee,
    minFee: rule.minFee ?? "",
    maxFee: rule.maxFee ?? "",
    isActive: rule.isActive,
});

const formatMoney = (value: string | null) => {
    if (!value) return "Not set";
    return Number(value).toLocaleString();
};

const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error && error.message) {
        return error.message;
    }
    return fallback;
};

export default function WithdrawalFeesAdminPage() {
    const { data: rulesData, isLoading: loadingRules, refetch } = useWithdrawalFeeRules();
    const upsertMutation = useUpsertWithdrawalFeeRule();
    const deleteMutation = useDeleteWithdrawalFeeRule();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<FeeRuleFormState | null>(null);

    const rules = rulesData?.fee_rules || [];

    const handleEdit = (rule: WithdrawalFeeRule) => {
        setEditingRule(toRuleFormState(rule));
        setIsFormOpen(true);
    };

    const handleAddNew = () => {
        setEditingRule(emptyRuleForm());
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this fee rule?")) return;
        try {
            await deleteMutation.mutateAsync(id);
            toast.success("Fee rule deleted");
            refetch();
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, "Failed to delete rule"));
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingRule) return;

        try {
            await upsertMutation.mutateAsync({
                method_type: editingRule.methodType as WithdrawalMethodType,
                currency: editingRule.currency,
                fee_type: editingRule.feeType as WithdrawalFeeType,
                flat_fee:
                    editingRule.feeType === "FLAT" || editingRule.feeType === "FLAT_AND_PERCENTAGE"
                        ? Number(editingRule.flatFee || "0")
                        : undefined,
                percentage_fee:
                    editingRule.feeType === "PERCENTAGE" || editingRule.feeType === "FLAT_AND_PERCENTAGE"
                        ? Number(editingRule.percentageFee || "0")
                        : undefined,
                min_fee: editingRule.minFee.trim() ? Number(editingRule.minFee) : undefined,
                max_fee: editingRule.maxFee.trim() ? Number(editingRule.maxFee) : undefined,
            });
            toast.success(editingRule.id ? "Rule updated" : "Rule created");
            setIsFormOpen(false);
            setEditingRule(null);
            refetch();
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, "Failed to save rule"));
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/fees" className="p-2 hover:bg-gray-100 rounded-lg">
                        <ChevronLeft className="w-5 h-5 text-gray-500" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Withdrawal Fee Rules</h1>
                        <p className="text-sm text-gray-500">Configure how fees are calculated for merchant withdrawals</p>
                    </div>
                </div>
                <button
                    onClick={handleAddNew}
                    className="flex items-center gap-2 px-4 py-2 bg-deep-blue-violet-600 text-white rounded-lg hover:bg-deep-blue-violet-700 transition-colors font-semibold"
                >
                    <Plus className="w-4 h-4" />
                    New Rule
                </button>
            </div>

            {loadingRules ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-deep-blue-violet-600" />
                    <p className="text-gray-500 italic">Loading fee rules...</p>
                </div>
            ) : rules.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-20 text-center">
                    <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No fee rules configured yet</p>
                    <button onClick={handleAddNew} className="mt-4 text-deep-blue-violet-600 hover:underline font-semibold">
                        Add your first rule
                    </button>
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Method</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Currency</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Fee Structure</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Fee Caps (Min/Max)</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {rules.map((rule) => (
                                <tr key={rule.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-deep-blue-violet-100 text-deep-blue-violet-600 rounded flex items-center justify-center">
                                                <DollarSign className="w-4 h-4" />
                                            </div>
                                            <span className="font-semibold text-gray-900">{rule.methodType.replace(/_/g, ' ')}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-sm">{rule.currency}</td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            {rule.feeType === 'FLAT' && (
                                                <span className="text-sm text-gray-700 font-medium">{formatMoney(rule.flatFee)} {rule.currency} (Flat)</span>
                                            )}
                                            {rule.feeType === 'PERCENTAGE' && (
                                                <span className="text-sm text-gray-700 font-medium">{Number(rule.percentageFee).toLocaleString()}% (Percentage)</span>
                                            )}
                                            {rule.feeType === 'FLAT_AND_PERCENTAGE' && (
                                                <span className="text-sm text-gray-700 font-medium">{formatMoney(rule.flatFee)} {rule.currency} + {Number(rule.percentageFee).toLocaleString()}%</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs text-gray-500">
                                            Min: {rule.minFee ? `${formatMoney(rule.minFee)} ${rule.currency}` : 'Not set'} <br />
                                            Max: {rule.maxFee ? `${formatMoney(rule.maxFee)} ${rule.currency}` : 'Not set'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                                            rule.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${rule.isActive ? 'bg-green-500' : 'bg-gray-500'}`} />
                                            {rule.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(rule)}
                                                className="p-2 text-gray-400 hover:text-deep-blue-violet-600 hover:bg-deep-blue-violet-50 rounded-lg transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(rule.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Rule Editor Modal */}
            {isFormOpen && editingRule && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{editingRule.id ? 'Edit Fee Rule' : 'New Fee Rule'}</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Define withdrawal costs for specific methods</p>
                            </div>
                            <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Method Type</label>
                                    <select
                                        value={editingRule.methodType}
                                        onChange={(e) => setEditingRule({ ...editingRule, methodType: e.target.value as WithdrawalMethodType })}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-deep-blue-violet-500 focus:border-deep-blue-violet-500 outline-none"
                                        required
                                    >
                                        <option value="MOBILE_MONEY">Mobile Money</option>
                                        <option value="LOCAL_BANK">Local Bank</option>
                                        <option value="INTERNATIONAL_BANK">International Bank</option>
                                        <option value="PREPAID_CARD">Prepaid Card</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Currency</label>
                                    <input
                                        type="text"
                                        value={editingRule.currency}
                                        onChange={(e) => setEditingRule({ ...editingRule, currency: e.target.value.toUpperCase() })}
                                        placeholder="XAF"
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-deep-blue-violet-500 focus:border-deep-blue-violet-500 outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Fee Type</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['FLAT', 'PERCENTAGE', 'FLAT_AND_PERCENTAGE'] as WithdrawalFeeType[]).map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setEditingRule({ ...editingRule, feeType: type })}
                                            className={`px-2 py-2 text-[10px] font-bold rounded-lg border transition-all ${
                                                editingRule.feeType === type
                                                    ? 'bg-deep-blue-violet-600 border-deep-blue-violet-600 text-white shadow-md shadow-blue-200'
                                                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                            }`}
                                        >
                                            {type.replace(/_/g, ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {(editingRule.feeType === 'FLAT' || editingRule.feeType === 'FLAT_AND_PERCENTAGE') && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <DollarSign className="w-3 h-3" /> Flat Fee ({editingRule.currency})
                                    </label>
                                    <input
                                        type="number"
                                        value={editingRule.flatFee}
                                        onChange={(e) => setEditingRule({ ...editingRule, flatFee: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-deep-blue-violet-500 outline-none"
                                        required
                                    />
                                </div>
                            )}

                            {(editingRule.feeType === 'PERCENTAGE' || editingRule.feeType === 'FLAT_AND_PERCENTAGE') && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <Percent className="w-3 h-3" /> Percentage Fee (%)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={editingRule.percentageFee}
                                        onChange={(e) => setEditingRule({ ...editingRule, percentageFee: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-deep-blue-violet-500 outline-none"
                                        required
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Min Fee Cap</label>
                                    <input
                                        type="number"
                                        value={editingRule.minFee}
                                        onChange={(e) => setEditingRule({ ...editingRule, minFee: e.target.value })}
                                        placeholder="Optional"
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-deep-blue-violet-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Max Fee Cap</label>
                                    <input
                                        type="number"
                                        value={editingRule.maxFee}
                                        onChange={(e) => setEditingRule({ ...editingRule, maxFee: e.target.value })}
                                        placeholder="Optional"
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-deep-blue-violet-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={upsertMutation.isPending}
                                    className="flex-1 px-4 py-2 bg-deep-blue-violet-600 text-white rounded-lg text-sm font-bold hover:bg-deep-blue-violet-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {upsertMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {editingRule.id ? 'Update Rule' : 'Create Rule'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
