"use client";

import { useState } from "react";
import { Plus, X, Globe, CheckCircle, AlertCircle, Trash2, ExternalLink, Clock } from "lucide-react";
import { toast } from "sonner";

// This is a placeholder - your actual implementation will have real hooks
export function NetworkAccessDomainsTab() {
    const [domains, setDomains] = useState<any[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newDomain, setNewDomain] = useState("");

    // Placeholder functions - replace with your actual API calls
    const handleAddDomain = async () => {
        if (!newDomain) return;
        // Your actual implementation here
        toast.success("Domain added successfully");
        setShowAddModal(false);
        setNewDomain("");
    };

    const handleDeleteDomain = async (id: string) => {
        // Your actual implementation here
        toast.success("Domain removed successfully");
    };

    if (domains.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                    <Globe className="w-10 h-10 text-slate-400" />
                </div>
                <p className="text-base font-medium text-slate-700 dark:text-slate-300">No domains configured</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Add your first domain to secure API access</p>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all duration-200"
                >
                    <Plus className="w-4 h-4" />
                    Add Domain
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Registered Domains</h3>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-xs font-semibold hover:shadow-md transition-all duration-200"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Add Domain
                </button>
            </div>

            <div className="space-y-3">
                {domains.map((domain) => (
                    <div
                        key={domain.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-200"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-500/20">
                                <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">{domain.domain}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`inline-flex items-center gap-1 text-xs ${
                                        domain.status === "APPROVED" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                                    }`}>
                                        {domain.status === "APPROVED" ? (
                                            <CheckCircle className="w-3 h-3" />
                                        ) : (
                                            <Clock className="w-3 h-3" />
                                        )}
                                        {domain.status}
                                    </span>
                                    {domain.verified && (
                                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                                            <CheckCircle className="w-3 h-3" />
                                            Verified
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {domain.status === "APPROVED" && (
                                <a
                                    href={`https://${domain.domain}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            )}
                            <button
                                onClick={() => handleDeleteDomain(domain.id)}
                                className="p-2 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Domain Modal - Enhanced */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                                        <Globe className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Domain</h3>
                                </div>
                                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">Domain Name</label>
                                <input
                                    type="text"
                                    value={newDomain}
                                    onChange={(e) => setNewDomain(e.target.value)}
                                    placeholder="api.yourdomain.com"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                />
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Enter the domain you want to whitelist for API access</p>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex gap-3">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddDomain}
                                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                            >
                                Add Domain
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}