"use client";

import { useState } from "react";
import {
    AlertTriangle,
    CheckCircle2,
    Info,
    Loader2,
    Phone,
    Plus,
    Search,
    Trash2,
    Users,
    XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useAdminVerifyMsisdn, useAdminVerifyMsisdnBulk } from "@/features/admin/queries";
import type {
    AdminMsisdnVerifyBulkInvalidEntry,
    AdminMsisdnVerifyBulkValidEntry,
    AdminMsisdnVerifyResponse,
} from "@/features/admin/types";

type TabType = "single" | "bulk";

interface BulkRow {
    msisdn: string;
    gateway: "MTN_MOMO" | "ORANGE_MONEY";
    amount?: string;
}

const getGatewayLabel = (gateway: string) =>
    gateway === "ORANGE_MONEY" ? "Orange Money" : "MTN MoMo";

const isUsableLookup = (found: boolean, status?: string) =>
    found && (!status || status.toUpperCase() === "ACTIVE");

export default function AdminMsisdnLookupPage() {
    const [activeTab, setActiveTab] = useState<TabType>("single");
    const [environment, setEnvironment] = useState<"production" | "sandbox">("production");

    const [singleMsisdn, setSingleMsisdn] = useState("");
    const [singleGateway, setSingleGateway] = useState<"MTN_MOMO" | "ORANGE_MONEY">("MTN_MOMO");
    const [singleResult, setSingleResult] = useState<AdminMsisdnVerifyResponse | null>(null);

    const [bulkRows, setBulkRows] = useState<BulkRow[]>([{ msisdn: "", gateway: "MTN_MOMO" }]);
    const [bulkValid, setBulkValid] = useState<AdminMsisdnVerifyBulkValidEntry[]>([]);
    const [bulkInvalid, setBulkInvalid] = useState<AdminMsisdnVerifyBulkInvalidEntry[]>([]);
    const [bulkDone, setBulkDone] = useState(false);

    const { mutate: verifySingle, isPending: verifyingSingle } = useAdminVerifyMsisdn();
    const { mutate: verifyBulk, isPending: verifyingBulk } = useAdminVerifyMsisdnBulk();

    const handleSingleVerify = (e: React.FormEvent) => {
        e.preventDefault();
        setSingleResult(null);
        verifySingle(
            { gateway: singleGateway, msisdn: singleMsisdn.trim(), environment },
            {
                onSuccess: (data) => setSingleResult(data),
                onError: () => toast.error("We could not verify this number right now. Please try again."),
            }
        );
    };

    const handleBulkVerify = (e: React.FormEvent) => {
        e.preventDefault();
        const entries = bulkRows
            .filter((row) => row.msisdn.trim())
            .map((row) => ({
                msisdn: row.msisdn.trim(),
                gateway: row.gateway,
                ...(row.amount ? { amount: row.amount } : {}),
            }));

        if (entries.length === 0) {
            toast.error("Add at least one number");
            return;
        }

        verifyBulk(
            { entries, environment },
            {
                onSuccess: (data) => {
                    const usableEntries = data.valid.filter((entry) => entry.isUsable ?? isUsableLookup(entry.found, entry.status));
                    const inactiveEntries: AdminMsisdnVerifyBulkInvalidEntry[] = data.valid
                        .filter((entry) => !(entry.isUsable ?? isUsableLookup(entry.found, entry.status)))
                        .map((entry) => ({
                            msisdn: entry.msisdn,
                            gateway: entry.gateway,
                            amount: entry.amount,
                            reason: "Number found but account is not active",
                        }));

                    setBulkValid(usableEntries);
                    setBulkInvalid([...inactiveEntries, ...data.invalid]);
                    setBulkDone(true);
                    toast.success(`Verified ${data.total} numbers - ${usableEntries.length} valid, ${inactiveEntries.length + data.invalid.length} invalid`);
                },
                onError: () => toast.error("We could not verify these numbers right now. Please try again."),
            }
        );
    };

    const addRow = () => setBulkRows((rows) => [...rows, { msisdn: "", gateway: "MTN_MOMO" }]);
    const removeRow = (index: number) => setBulkRows((rows) => rows.filter((_, rowIndex) => rowIndex !== index));
    const updateRow = (index: number, field: keyof BulkRow, value: string) =>
        setBulkRows((rows) => rows.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row)));

    const resetBulk = () => {
        setBulkRows([{ msisdn: "", gateway: "MTN_MOMO" }]);
        setBulkValid([]);
        setBulkInvalid([]);
        setBulkDone(false);
    };

    const singleIsUsable = singleResult ? (singleResult.isUsable ?? isUsableLookup(singleResult.found, singleResult.status)) : false;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Phone className="w-6 h-6 text-deep-blue-violet-600" />
                        MSISDN Lookup
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                        Verify subscriber identity on MTN MoMo or Orange Money for payout validation.
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                    {(["production", "sandbox"] as const).map((env) => (
                        <button
                            key={env}
                            onClick={() => setEnvironment(env)}
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-colors ${
                                environment === env
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            {env}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-deep-blue-violet-50 border border-deep-blue-violet-200 rounded-xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-deep-blue-violet-600 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-semibold text-deep-blue-violet-900">What this does</p>
                    <p className="text-xs text-deep-blue-violet-700 mt-0.5">
                        Calls the {environment} operator API to confirm a phone number exists on the selected network and retrieve the subscriber name when available.
                    </p>
                </div>
            </div>

            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
                {(["single", "bulk"] as TabType[]).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            activeTab === tab
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        {tab === "single" ? "Single Lookup" : "Bulk Lookup"}
                    </button>
                ))}
            </div>

            {activeTab === "single" && (
                <div className="space-y-4">
                    <form onSubmit={handleSingleVerify} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-gray-700 mb-1.5 block">Gateway</label>
                                <select
                                    value={singleGateway}
                                    onChange={(e) => setSingleGateway(e.target.value as "MTN_MOMO" | "ORANGE_MONEY")}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-deep-blue-violet-500 outline-none"
                                >
                                    <option value="MTN_MOMO">MTN MoMo</option>
                                    <option value="ORANGE_MONEY">Orange Money</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-700 mb-1.5 block">Phone Number (MSISDN)</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={singleMsisdn}
                                        onChange={(e) => setSingleMsisdn(e.target.value)}
                                        placeholder="237688508539"
                                        className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-deep-blue-violet-500 outline-none"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={verifyingSingle}
                            className="flex items-center gap-2 px-5 py-2.5 bg-deep-blue-violet-600 text-white rounded-lg text-sm font-semibold hover:bg-deep-blue-violet-700 transition-colors disabled:opacity-50"
                        >
                            {verifyingSingle ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                            Lookup Subscriber
                        </button>
                    </form>

                    {singleResult && (
                        <div
                            className={`rounded-xl border p-5 ${
                                singleIsUsable
                                    ? "bg-green-50 border-green-200"
                                    : singleResult.found
                                        ? "bg-crimson-red-50 border-crimson-red-200"
                                        : "bg-red-50 border-red-200"
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                {singleIsUsable ? (
                                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                                ) : singleResult.found ? (
                                    <AlertTriangle className="w-6 h-6 text-crimson-red-500 flex-shrink-0 mt-0.5" />
                                ) : (
                                    <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                                )}
                                <div className="flex-1">
                                    <p
                                        className={`text-sm font-bold ${
                                            singleIsUsable
                                                ? "text-green-900"
                                                : singleResult.found
                                                    ? "text-crimson-red-900"
                                                    : "text-red-900"
                                        }`}
                                    >
                                        {singleIsUsable
                                            ? `Account found: ${singleResult.displayName || "Name not available"}`
                                            : singleResult.found
                                                ? "Number found but account is not active"
                                                : `This number was not found on ${getGatewayLabel(singleResult.gateway)}`}
                                    </p>
                                    <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                                        <div>
                                            <dt className="text-[10px] text-gray-500 uppercase font-semibold">MSISDN</dt>
                                            <dd className="text-sm font-mono text-gray-900">{singleResult.msisdn}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-[10px] text-gray-500 uppercase font-semibold">Gateway</dt>
                                            <dd className="text-sm text-gray-900">{getGatewayLabel(singleResult.gateway)}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-[10px] text-gray-500 uppercase font-semibold">Display Name</dt>
                                            <dd className="text-sm font-semibold text-gray-900">{singleResult.displayName || "Name not available"}</dd>
                                        </div>
                                        {singleResult.given_name && (
                                            <div>
                                                <dt className="text-[10px] text-gray-500 uppercase font-semibold">Given Name</dt>
                                                <dd className="text-sm text-gray-900">{singleResult.given_name}</dd>
                                            </div>
                                        )}
                                        {singleResult.family_name && (
                                            <div>
                                                <dt className="text-[10px] text-gray-500 uppercase font-semibold">Family Name</dt>
                                                <dd className="text-sm text-gray-900">{singleResult.family_name}</dd>
                                            </div>
                                        )}
                                        {singleResult.status && (
                                            <div>
                                                <dt className="text-[10px] text-gray-500 uppercase font-semibold">Status</dt>
                                                <dd className="text-sm text-gray-900">{singleResult.status}</dd>
                                            </div>
                                        )}
                                    </dl>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === "bulk" && (
                <div className="space-y-4">
                    {!bulkDone ? (
                        <form onSubmit={handleBulkVerify} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-semibold text-gray-900">Numbers to verify ({bulkRows.length} / 500 max)</p>
                                <button
                                    type="button"
                                    onClick={addRow}
                                    className="flex items-center gap-1 text-xs text-deep-blue-violet-600 hover:text-deep-blue-violet-800 font-semibold"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Add row
                                </button>
                            </div>

                            <div className="grid grid-cols-[1fr_150px_auto] gap-2 px-1">
                                <span className="text-[10px] font-semibold text-gray-500 uppercase">MSISDN</span>
                                <span className="text-[10px] font-semibold text-gray-500 uppercase">Gateway</span>
                                <span className="w-8" />
                            </div>

                            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                                {bulkRows.map((row, index) => (
                                    <div key={index} className="grid grid-cols-[1fr_150px_auto] gap-2 items-center">
                                        <input
                                            type="text"
                                            value={row.msisdn}
                                            onChange={(e) => updateRow(index, "msisdn", e.target.value)}
                                            placeholder="237688508539"
                                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-deep-blue-violet-500 outline-none"
                                        />
                                        <select
                                            value={row.gateway}
                                            onChange={(e) => updateRow(index, "gateway", e.target.value)}
                                            className="px-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-deep-blue-violet-500 outline-none"
                                        >
                                            <option value="MTN_MOMO">MTN MoMo</option>
                                            <option value="ORANGE_MONEY">Orange Money</option>
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => removeRow(index)}
                                            disabled={bulkRows.length === 1}
                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-30"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button
                                type="submit"
                                disabled={verifyingBulk}
                                className="flex items-center gap-2 px-5 py-2.5 bg-deep-blue-violet-600 text-white rounded-lg text-sm font-semibold hover:bg-deep-blue-violet-700 transition-colors disabled:opacity-50"
                            >
                                {verifyingBulk ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                                Verify All ({bulkRows.filter((row) => row.msisdn.trim()).length})
                            </button>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> {bulkValid.length} valid
                                    </span>
                                    {bulkInvalid.length > 0 && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                                            <XCircle className="w-3.5 h-3.5" /> {bulkInvalid.length} invalid
                                        </span>
                                    )}
                                </div>
                                <button onClick={resetBulk} className="text-xs text-gray-500 hover:text-gray-700">
                                    Back to new lookup
                                </button>
                            </div>

                            {bulkValid.length > 0 && (
                                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                    <div className="px-4 py-3 bg-green-50 border-b border-gray-100">
                                        <p className="text-xs font-semibold text-green-700 flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4" /> Valid ({bulkValid.length})
                                        </p>
                                    </div>
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="text-left py-2 px-4 text-[10px] font-semibold text-gray-500 uppercase">MSISDN</th>
                                                <th className="text-left py-2 px-4 text-[10px] font-semibold text-gray-500 uppercase">Name</th>
                                                <th className="text-left py-2 px-4 text-[10px] font-semibold text-gray-500 uppercase">Gateway</th>
                                                <th className="text-left py-2 px-4 text-[10px] font-semibold text-gray-500 uppercase">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bulkValid.map((entry, index) => (
                                                <tr key={index} className="border-t border-gray-100 hover:bg-gray-50">
                                                    <td className="py-2.5 px-4 text-xs font-mono text-gray-900">{entry.msisdn}</td>
                                                    <td className="py-2.5 px-4 text-xs font-semibold text-gray-900">{entry.displayName || "Name not available"}</td>
                                                    <td className="py-2.5 px-4 text-xs text-gray-600">{getGatewayLabel(entry.gateway)}</td>
                                                    <td className="py-2.5 px-4">
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-semibold">
                                                            <CheckCircle2 className="w-3 h-3" /> {entry.status || "ACTIVE"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {bulkInvalid.length > 0 && (
                                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                    <div className="px-4 py-3 bg-red-50 border-b border-gray-100">
                                        <p className="text-xs font-semibold text-red-700 flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4" /> Invalid / Not Found ({bulkInvalid.length})
                                        </p>
                                    </div>
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="text-left py-2 px-4 text-[10px] font-semibold text-gray-500 uppercase">MSISDN</th>
                                                <th className="text-left py-2 px-4 text-[10px] font-semibold text-gray-500 uppercase">Gateway</th>
                                                <th className="text-left py-2 px-4 text-[10px] font-semibold text-gray-500 uppercase">Reason</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bulkInvalid.map((entry, index) => (
                                                <tr key={index} className="border-t border-gray-100 hover:bg-gray-50">
                                                    <td className="py-2.5 px-4 text-xs font-mono text-gray-900">{entry.msisdn}</td>
                                                    <td className="py-2.5 px-4 text-xs text-gray-600">{getGatewayLabel(entry.gateway)}</td>
                                                    <td className="py-2.5 px-4 text-xs text-red-600">{entry.reason}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
