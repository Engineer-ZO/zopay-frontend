"use client";

import { useState } from "react";
import { Plus, X, Network, CheckCircle, AlertCircle, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";

// This is a placeholder - your actual implementation will have real hooks
export function NetworkAccessIpsTab() {
    const [ips, setIps] = useState<any[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newIp, setNewIp] = useState("");
    const [ipDescription, setIpDescription] = useState("");

    const handleAddIp = async () => {
        if (!newIp) return;
        // Your actual implementation here
        toast.success("IP address added successfully");
        setShowAddModal(false);
        setNewIp("");
        setIpDescription("");
    };

    const handleDeleteIp = async (id: string) => {
        // Your actual implementation here
        toast.success("IP address removed successfully");
    };

    if (ips.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                    <Network className="w-10 h-10 text-slate-400" />
                </div>
                <p className="text-base font-medium text-slate-700 dark:text-slate-300">No IP addresses configured</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Add your first IP address to whitelist for API access</p>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all duration-200"
                >
                    <Plus className="w-4 h-4" />
                    Add IP Address
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Whitelisted IP Addresses</h3>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-xs font-semibold hover:shadow-md transition-all duration-200"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Add IP
                </button>
            </div>

            <div className="space-y-3">
                {ips.map((ip) => (
                    <div
                        key={ip.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-200"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-500/20">
                                <Network className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-sm font-mono font-medium text-slate-900 dark:text-white">{ip.ipAddress}</p>
                                {ip.description && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{ip.description}</p>
                                )}
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`inline-flex items-center gap-1 text-xs ${
                                        ip.status === "APPROVED" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                                    }`}>
                                        {ip.status === "APPROVED" ? (
                                            <CheckCircle className="w-3 h-3" />
                                        ) : (
                                            <Clock className="w-3 h-3" />
                                        )}
                                        {ip.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => handleDeleteIp(ip.id)}
                            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Add IP Modal - Enhanced */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                                        <Network className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add IP Address</h3>
                                </div>
                                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">IP Address / CIDR</label>
                                <input
                                    type="text"
                                    value={newIp}
                                    onChange={(e) => setNewIp(e.target.value)}
                                    placeholder="192.168.1.1 or 10.0.0.0/24"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                />
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Enter a single IP or CIDR block</p>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">Description (Optional)</label>
                                <input
                                    type="text"
                                    value={ipDescription}
                                    onChange={(e) => setIpDescription(e.target.value)}
                                    placeholder="e.g., Office Network, API Server, etc."
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                />
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
                                onClick={handleAddIp}
                                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                            >
                                Add IP Address
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}