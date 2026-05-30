"use client";

import { useState } from "react";
import { Building2, Loader2, Pencil, Plus, Power, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import {
    useAdminBankTopupAccounts,
    useCreateAdminBankTopupAccount,
    useDeleteAdminBankTopupAccount,
    useUpdateAdminBankTopupAccount,
} from "@/features/admin/queries";
import type { AdminBankTopupAccount, Base64FileObject } from "@/features/admin/types";

function toBase64Payload(file: File, base64: string): Base64FileObject {
    return {
        base64,
        filename: file.name,
        mimeType: file.type || "application/octet-stream",
    };
}

async function readFileAsBase64(file: File): Promise<Base64FileObject> {
    return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(toBase64Payload(file, typeof reader.result === "string" ? reader.result : ""));
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
    });
}

export default function AdminBankTopupAccountsPage() {
    const { data, isLoading } = useAdminBankTopupAccounts();
    const createMutation = useCreateAdminBankTopupAccount();
    const updateMutation = useUpdateAdminBankTopupAccount();
    const deleteMutation = useDeleteAdminBankTopupAccount();

    const [editingAccount, setEditingAccount] = useState<AdminBankTopupAccount | null>(null);
    const [bankName, setBankName] = useState("");
    const [currency, setCurrency] = useState("XAF");
    const [instructions, setInstructions] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [logo, setLogo] = useState<Base64FileObject | null>(null);

    const accounts = data?.accounts ?? [];
    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    const resetForm = () => {
        setEditingAccount(null);
        setBankName("");
        setCurrency("XAF");
        setInstructions("");
        setIsActive(true);
        setLogo(null);
    };

    const handleEdit = (account: AdminBankTopupAccount) => {
        setEditingAccount(account);
        setBankName(account.bankName);
        setCurrency(account.currency);
        setInstructions(account.instructions);
        setIsActive(account.isActive);
        setLogo(null);
    };

    const handleSubmit = async () => {
        if (!bankName.trim() || !currency.trim() || !instructions.trim()) {
            toast.error("Bank name, currency, and instructions are required");
            return;
        }

        try {
            if (editingAccount) {
                await updateMutation.mutateAsync({
                    id: editingAccount.id,
                    data: {
                        bankName: bankName.trim(),
                        currency: currency.trim().toUpperCase(),
                        instructions: instructions.trim(),
                        isActive,
                        ...(logo ? { logo } : {}),
                    },
                });
                toast.success("Bank top-up account updated");
            } else {
                await createMutation.mutateAsync({
                    bankName: bankName.trim(),
                    currency: currency.trim().toUpperCase(),
                    instructions: instructions.trim(),
                    isActive,
                    ...(logo ? { logo } : {}),
                });
                toast.success("Bank top-up account created");
            }
            resetForm();
        } catch (error: unknown) {
            toast.error((error as { message?: string })?.message || "Failed to save bank account");
        }
    };

    const handleLogoChange = async (file: File | null) => {
        if (!file) return;
        try {
            const payload = await readFileAsBase64(file);
            setLogo(payload);
        } catch (error: unknown) {
            toast.error((error as { message?: string })?.message || "Failed to read logo");
        }
    };

    const handleDisable = async (account: AdminBankTopupAccount) => {
        try {
            await deleteMutation.mutateAsync(account.id);
            toast.success(account.isActive ? "Bank account disabled" : "Bank account removal request processed");
        } catch (error: unknown) {
            toast.error((error as { message?: string })?.message || "Failed to disable bank account");
        }
    };

    const activeCount = accounts.filter((account) => account.isActive).length;

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Bank Top-Up Accounts</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Configure the bank accounts merchants can use for manual wallet top-ups.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Total Accounts</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{accounts.length}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Active Accounts</p>
                    <p className="text-2xl font-bold text-green-700 mt-2">{activeCount}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Inactive Accounts</p>
                    <p className="text-2xl font-bold text-crimson-red-700 mt-2">{accounts.length - activeCount}</p>
                </div>
            </div>

            <div className="grid xl:grid-cols-[1fr_1.2fr] gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                {editingAccount ? "Edit bank account" : "Create bank account"}
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Add instructions exactly the way merchants should see them.
                            </p>
                        </div>
                        {editingAccount && (
                            <button type="button" onClick={resetForm} className="text-sm text-gray-500 hover:text-gray-700">
                                Cancel edit
                            </button>
                        )}
                    </div>

                    <div>
                        <label className="text-xs font-medium text-gray-700 mb-1.5 block">Bank name</label>
                        <input value={bankName} onChange={(e) => setBankName(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
                    </div>

                    <div>
                        <label className="text-xs font-medium text-gray-700 mb-1.5 block">Currency</label>
                        <input value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase())} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
                    </div>

                    <div>
                        <label className="text-xs font-medium text-gray-700 mb-1.5 block">Instructions</label>
                        <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={8} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                        <div>
                            <p className="text-sm font-medium text-gray-900">Active</p>
                            <p className="text-xs text-gray-500">Inactive accounts stay in the system but are hidden from merchants.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsActive((prev) => !prev)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full ${isActive ? "bg-green-500" : "bg-gray-300"}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${isActive ? "translate-x-6" : "translate-x-1"}`} />
                        </button>
                    </div>

                    <div>
                        <label className="text-xs font-medium text-gray-700 mb-1.5 block">Logo</label>
                        <label className="flex items-center gap-2 px-3 py-3 border border-dashed border-gray-300 rounded-lg text-sm text-gray-600 cursor-pointer hover:bg-gray-50">
                            <UploadCloud className="w-4 h-4" />
                            {logo ? logo.filename : "Upload bank logo"}
                            <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" className="hidden" onChange={(e) => void handleLogoChange(e.target.files?.[0] ?? null)} />
                        </label>
                    </div>

                    <button
                        type="button"
                        onClick={() => void handleSubmit()}
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 bg-deep-blue-violet-600 hover:bg-deep-blue-violet-700 text-white rounded-lg font-semibold disabled:opacity-60 inline-flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingAccount ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {editingAccount ? "Update account" : "Create account"}
                    </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900">Configured accounts</h2>
                    <p className="text-sm text-gray-500 mt-1">Deleting an account here safely disables it.</p>

                    {isLoading ? (
                        <div className="py-10 flex items-center justify-center text-gray-500">
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Loading accounts...
                        </div>
                    ) : accounts.length === 0 ? (
                        <div className="py-10 text-center text-sm text-gray-500">No bank top-up accounts configured yet.</div>
                    ) : (
                        <div className="space-y-4 mt-5">
                            {accounts.map((account) => (
                                <div key={account.id} className="rounded-xl border border-gray-200 p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            {account.logoUrl ? (
                                                <img src={account.logoUrl} alt={account.bankName} className="w-11 h-11 rounded-lg object-cover border border-gray-200" />
                                            ) : (
                                                <div className="w-11 h-11 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center">
                                                    <Building2 className="w-5 h-5 text-gray-500" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-semibold text-gray-900">{account.bankName}</p>
                                                <p className="text-sm text-gray-500">{account.currency}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${account.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                                                {account.isActive ? "Active" : "Inactive"}
                                            </span>
                                            <button type="button" onClick={() => handleEdit(account)} className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:text-deep-blue-violet-600">
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button type="button" onClick={() => void handleDisable(account)} className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:text-red-600">
                                                {account.isActive ? <Trash2 className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <pre className="mt-4 whitespace-pre-wrap text-sm text-gray-600 font-sans">{account.instructions}</pre>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
