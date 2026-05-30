"use client";

import { useState } from "react";
import { Plus, Building2, Search, X, Loader2, CheckCircle2, Edit2, Trash2, Ban } from "lucide-react";
import { toast } from "sonner";
import {
    useAdminLocalBanks,
    useCreateLocalBank,
    useUpdateLocalBank,
    useDeleteLocalBank,
} from "@/features/withdrawals/hooks";
import type { LocalBank } from "@/features/withdrawals/types";

export default function AdminLocalBanksPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingBank, setEditingBank] = useState<LocalBank | null>(null);

    const { data, isLoading } = useAdminLocalBanks();
    const { mutate: createBank, isPending: creating } = useCreateLocalBank();
    const { mutate: updateBank, isPending: updating } = useUpdateLocalBank();
    const { mutate: deleteBank, isPending: deleting } = useDeleteLocalBank();

    const [form, setForm] = useState({ name: "", code: "", country: "CM", isActive: true });

    const banks = data?.banks ?? [];
    const filteredBanks = banks.filter(
        (b) =>
            b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleEdit = (bank: LocalBank) => {
        setEditingBank(bank);
        setForm({ name: bank.name, code: bank.code, country: bank.country, isActive: bank.isActive });
        setShowModal(true);
    };

    const handleAddNew = () => {
        setEditingBank(null);
        setForm({ name: "", code: "", country: "CM", isActive: true });
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingBank) {
            updateBank(
                { id: editingBank.id, payload: form },
                {
                    onSuccess: () => {
                        toast.success("Bank updated successfully");
                        setShowModal(false);
                    },
                    onError: (err) => toast.error(err.message),
                }
            );
        } else {
            createBank(
                form,
                {
                    onSuccess: () => {
                        toast.success("Bank created successfully");
                        setShowModal(false);
                    },
                    onError: (err) => toast.error(err.message),
                }
            );
        }
    };

    const handleDelete = (id: string) => {
        if (!window.confirm("Are you sure you want to delete this bank?")) return;
        deleteBank(id, {
            onSuccess: () => toast.success("Bank deleted successfully"),
            onError: (err) => toast.error(err.message),
        });
    };

    const toggleStatus = (bank: LocalBank) => {
        updateBank(
            { id: bank.id, payload: { isActive: !bank.isActive } },
            {
                onSuccess: () => toast.success(`Bank ${!bank.isActive ? "activated" : "deactivated"}`),
                onError: (err) => toast.error(err.message),
            }
        );
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Local Banks Catalog</h1>
                    <p className="text-xs text-slate-500 mt-1">Manage banks available for merchant withdrawals</p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="px-4 py-2 bg-deep-blue-violet-600 text-white rounded-lg text-sm font-semibold hover:bg-deep-blue-violet-700 transition-colors flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Bank
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-4 border-b border-slate-200">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search banks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-deep-blue-violet-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3">Bank Name</th>
                                <th className="px-4 py-3">Code</th>
                                <th className="px-4 py-3">Country</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 flex justify-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={5} className="px-4 py-3">
                                            <div className="h-4 bg-slate-100 rounded animate-pulse w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredBanks.length > 0 ? (
                                filteredBanks.map((bank) => (
                                    <tr key={bank.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium text-slate-800 flex items-center gap-2">
                                            <Building2 className="w-4 h-4 text-slate-400" /> {bank.name}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 font-mono">{bank.code}</td>
                                        <td className="px-4 py-3 text-slate-600">{bank.country}</td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => toggleStatus(bank)}
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                    bank.isActive
                                                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                }`}
                                            >
                                                {bank.isActive ? <CheckCircle2 className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                                                {bank.isActive ? "Active" : "Inactive"}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(bank)}
                                                    className="p-1 text-slate-400 hover:text-deep-blue-violet-600 rounded transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(bank.id)}
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
                                        No banks found.
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
                                {editingBank ? "Edit Bank" : "Add New Bank"}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 block mb-1">Bank Name</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                                    placeholder="e.g. Afriland First Bank"
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue-violet-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 block mb-1">Bank Code</label>
                                <input
                                    type="text"
                                    value={form.code}
                                    onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                                    placeholder="e.g. AFLB"
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue-violet-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 block mb-1">Country Code</label>
                                <input
                                    type="text"
                                    value={form.country}
                                    onChange={(e) => setForm((p) => ({ ...p, country: e.target.value.toUpperCase() }))}
                                    placeholder="e.g. CM"
                                    required
                                    maxLength={2}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue-violet-500"
                                />
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={form.isActive}
                                    onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                                    className="w-4 h-4 text-deep-blue-violet-600 border-slate-300 rounded focus:ring-deep-blue-violet-500"
                                />
                                <label htmlFor="isActive" className="text-sm text-slate-700 font-medium">Bank is active and visible to merchants</label>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating || updating}
                                    className="flex-1 px-4 py-2 bg-deep-blue-violet-600 text-white rounded-lg font-medium hover:bg-deep-blue-violet-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {(creating || updating) ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Bank"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
