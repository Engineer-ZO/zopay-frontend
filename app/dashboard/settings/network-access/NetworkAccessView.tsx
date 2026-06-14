"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Globe, Network, Shield, Lock, Server, Wifi, CheckCircle, AlertCircle } from "lucide-react";
import { NetworkAccessDomainsTab } from "@/components/dashboard/settings/NetworkAccessDomainsTab";
import { NetworkAccessIpsTab } from "@/components/dashboard/settings/NetworkAccessIpsTab";

export type NetworkAccessTab = "domains" | "ips";

function tabFromParam(value: string | null): NetworkAccessTab {
    return value === "ips" ? "ips" : "domains";
}

export function NetworkAccessView() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const activeTab = useMemo(
        () => tabFromParam(searchParams.get("tab")),
        [searchParams]
    );

    const setTab = useCallback(
        (tab: NetworkAccessTab) => {
            const next = tab === "domains" ? "domains" : "ips";
            const params = new URLSearchParams(searchParams.toString());
            params.set("tab", next);
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        },
        [pathname, router, searchParams]
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            <div className="max-w-7xl mx-auto p-6 space-y-6">
                {/* HEADER - Premium Header */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-white via-white to-indigo-50/50 dark:from-slate-800/80 dark:via-slate-800/60 dark:to-indigo-950/30 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-6 shadow-lg">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                                    Network Access
                                </h1>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                                    Configure network security settings for your API access
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Banner */}
                <div className="rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200 dark:border-indigo-500/20 p-4">
                    <div className="flex items-start gap-3">
                        <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-500/20">
                            <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-100 mb-1">
                                Production Security Requirements
                            </p>
                            <p className="text-xs text-indigo-700 dark:text-indigo-300">
                                Register up to one domain and one IP address for your production API (one each per account). 
                                This ensures secure access to your production endpoints.
                            </p>
                        </div>
                        <div className="hidden sm:flex items-center gap-2">
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/50 dark:bg-slate-800/50">
                                <Lock className="w-3 h-3 text-emerald-500" />
                                <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300">Secure</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/50 dark:bg-slate-800/50">
                                <Server className="w-3 h-3 text-indigo-500" />
                                <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300">API Access</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs - Modern Segmented Control */}
                <div className="relative">
                    <div className="flex gap-2 p-1 bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700 w-fit shadow-sm">
                        <button
                            type="button"
                            onClick={() => setTab("domains")}
                            className={`group relative flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                                activeTab === "domains"
                                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50"
                            }`}
                        >
                            {activeTab === "domains" && (
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 animate-pulse opacity-50 -z-10" />
                            )}
                            <Globe className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                                activeTab === "domains" ? "text-white" : ""
                            }`} />
                            <span>Domains</span>
                            {activeTab === "domains" && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setTab("ips")}
                            className={`group relative flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                                activeTab === "ips"
                                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50"
                            }`}
                        >
                            <Network className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                                activeTab === "ips" ? "text-white" : ""
                            }`} />
                            <span>IP Whitelist</span>
                            {activeTab === "ips" && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            )}
                        </button>
                    </div>
                    
                    {/* Decorative line */}
                    <div className="absolute -bottom-3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent opacity-50" />
                </div>

                {/* Content Container */}
                <div className="transition-all duration-300 animate-in fade-in slide-in-from-top-2">
                    <div className="rounded-2xl bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                        {activeTab === "domains" ? (
                            <div className="p-6">
                                <NetworkAccessDomainsTab />
                            </div>
                        ) : (
                            <div className="p-6">
                                <NetworkAccessIpsTab />
                            </div>
                        )}
                    </div>
                </div>

                {/* Security Tips Footer */}
                <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/30 dark:to-slate-800/20 border border-slate-200 dark:border-slate-700 p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md">
                                <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Security Best Practices</h3>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                                    Follow these guidelines to keep your API access secure
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400">
                                <AlertCircle className="w-3 h-3" />
                                Use HTTPS only
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400">
                                <Wifi className="w-3 h-3" />
                                Validate IP ranges
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                                <CheckCircle className="w-3 h-3" />
                                Regular audits
                            </span>
                        </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-400">
                            <div className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5" />
                                <span>Only whitelist IP addresses you trust completely</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5" />
                                <span>Use specific subdomains rather than wildcards when possible</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5" />
                                <span>Review and audit your network access settings regularly</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}