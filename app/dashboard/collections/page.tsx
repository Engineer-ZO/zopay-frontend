"use client";

import { useState, useMemo } from "react";
import {
    Search,
    Download,
    CheckCircle2,
    Clock,
    XCircle,
    ArrowDownToLine,
    MoreVertical,
    X,
    Plus,
    QrCode,
    Link as LinkIcon,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { useUserMerchantData } from "@/features/merchants/context/MerchantContext";
import { useEnvironment } from "@/core/environment/EnvironmentContext";
import { useRecentTransactions } from "@/features/merchants/hooks/useMerchant";

export default function CollectionsPage() {
    const { merchantId } = useUserMerchantData();
    const { environment } = useEnvironment();

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [showNewPaymentModal, setShowNewPaymentModal] = useState(false);

    const itemsPerPage = 20;

    // Fetch collection transactions using the shared hook (reads environment internally)
    const {
        data: transactionsData,
        isLoading,
        error,
    } = useRecentTransactions(
        merchantId || "",
        100,
        "collection",
        !!merchantId
    );

    // Currency display based on environment
    const currency = environment === "production" ? "FCFA" : "XAF";

    // All collections from API
    const allCollections = transactionsData?.transactions ?? [];

    // Filter by search query and status
    const filteredCollections = useMemo(() => {
        return allCollections.filter((tx) => {
            const matchesSearch =
                !searchQuery ||
                tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (tx.customer ?? "").toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus =
                !statusFilter ||
                tx.status.toLowerCase() === statusFilter.toLowerCase();

            return matchesSearch && matchesStatus;
        });
    }, [allCollections, searchQuery, statusFilter]);

    // Pagination
    const totalPages = Math.ceil(filteredCollections.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedCollections = filteredCollections.slice(startIndex, startIndex + itemsPerPage);

    // Stats derived from all collections
    const stats = useMemo(() => ({
        total: allCollections.reduce((sum, tx) => sum + tx.amount, 0),
        successful: allCollections.filter((tx) => tx.status === "SUCCESS").length,
        pending: allCollections.filter((tx) => tx.status === "PENDING_GATEWAY").length,
        failed: allCollections.filter((tx) => tx.status === "FAILED").length,
    }), [allCollections]);

    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case "SUCCESS":
                return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400";
            case "PENDING_GATEWAY":
                return "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400";
            case "FAILED":
                return "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400";
            default:
                return "bg-muted text-muted-foreground";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toUpperCase()) {
            case "SUCCESS":
                return <CheckCircle2 className="w-3 h-3 mr-1" />;
            case "PENDING_GATEWAY":
                return <Clock className="w-3 h-3 mr-1" />;
            case "FAILED":
                return <XCircle className="w-3 h-3 mr-1" />;
            default:
                return null;
        }
    };

    const formatStatus = (status: string) =>
        status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* HEADER & ACTIONS */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-foreground">Collections</h1>
                    <p className="text-xs text-muted-foreground mt-1">
                        Manage incoming payments from customers
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="px-4 py-2 bg-background border border-border text-foreground rounded-lg text-sm font-semibold hover:bg-muted transition-colors flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <button
                        onClick={() => setShowNewPaymentModal(true)}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        New Payment
                    </button>
                </div>
            </div>

            {/* STATS CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">TOTAL</p>
                    <p className="text-xl font-bold text-foreground">
                        {isLoading ? "—" : `${currency} ${stats.total.toLocaleString()}`}
                    </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/10 rounded-xl p-4 border border-green-200 dark:border-green-800">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">SUCCESS</p>
                    <p className="text-xl font-bold text-foreground">
                        {isLoading ? "—" : stats.successful}
                    </p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/10 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">PENDING</p>
                    <p className="text-xl font-bold text-foreground">
                        {isLoading ? "—" : stats.pending}
                    </p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-4 border border-red-200 dark:border-red-800">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">FAILED</p>
                    <p className="text-xl font-bold text-foreground">
                        {isLoading ? "—" : stats.failed}
                    </p>
                </div>
            </div>

            {/* FILTERS & SEARCH */}
            <div className="bg-background rounded-xl p-3 border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:min-w-[250px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search ID or customer..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            className="w-full pl-9 pr-4 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500 transition-shadow"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                        className="px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 transition-shadow"
                    >
                        <option value="">All Status</option>
                        <option value="SUCCESS">Success</option>
                        <option value="PENDING_GATEWAY">Pending</option>
                        <option value="FAILED">Failed</option>
                    </select>
                </div>
            </div>

            {/* ERROR STATE */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl p-4">
                    <p className="text-sm font-semibold text-red-900 dark:text-red-100">Error loading collections</p>
                    <p className="text-xs text-red-700 dark:text-red-300 mt-1">{error.message}</p>
                </div>
            )}

            {/* TABLE */}
            <div className="bg-background rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Date</th>
                                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">ID</th>
                                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Customer</th>
                                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Amount</th>
                                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Gateway</th>
                                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Status</th>
                                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <tr key={i} className="border-b border-border">
                                        {Array.from({ length: 7 }).map((__, j) => (
                                            <td key={j} className="py-2.5 px-3">
                                                <div className="h-3 bg-muted rounded animate-pulse w-20" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : paginatedCollections.length > 0 ? (
                                paginatedCollections.map((tx) => (
                                    <tr
                                        key={tx.id}
                                        className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors group cursor-pointer"
                                    >
                                        <td className="py-2.5 px-3">
                                            <div className="text-xs font-medium text-foreground">{tx.date}</div>
                                            <div className="text-[10px] text-muted-foreground">{tx.time}</div>
                                        </td>
                                        <td className="py-2.5 px-3 text-xs font-mono text-foreground">
                                            {tx.id.length > 18 ? `${tx.id.slice(0, 18)}...` : tx.id}
                                        </td>
                                        <td className="py-2.5 px-3 text-xs text-foreground">{tx.customer ?? "—"}</td>
                                        <td className="py-2.5 px-3 text-xs font-semibold text-foreground">
                                            {tx.amount.toLocaleString()} {currency}
                                        </td>
                                        <td className="py-2.5 px-3 text-xs text-foreground">{tx.gateway.replace(/_/g, " ")}</td>
                                        <td className="py-2.5 px-3">
                                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${getStatusColor(tx.status)}`}>
                                                {getStatusIcon(tx.status)}
                                                {formatStatus(tx.status)}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-3">
                                            <button className="p-1 hover:text-foreground text-muted-foreground hover:bg-muted rounded transition-colors opacity-0 group-hover:opacity-100">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center">
                                        <ArrowDownToLine className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                                        <p className="text-sm text-muted-foreground">No collections found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredCollections.length > 0 && (
                    <div className="p-4 border-t border-border flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                            Showing {startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredCollections.length)} of {filteredCollections.length}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 hover:bg-muted rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum = i + 1;
                                if (totalPages > 5) {
                                    if (currentPage <= 3) pageNum = i + 1;
                                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                                    else pageNum = currentPage - 2 + i;
                                }
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${currentPage === pageNum ? "bg-orange-500 text-white" : "hover:bg-muted text-foreground"}`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="p-2 hover:bg-muted rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* NEW PAYMENT MODAL */}
            {showNewPaymentModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-background rounded-2xl p-6 shadow-2xl border border-border max-w-md w-full">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-foreground">Generate Payment Link</h3>
                            <button
                                onClick={() => setShowNewPaymentModal(false)}
                                className="p-1 hover:bg-muted rounded transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-foreground mb-2 block">
                                    Amount ({currency})
                                </label>
                                <input
                                    type="number"
                                    placeholder="10000"
                                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-foreground mb-2 block">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    placeholder="Payment for order #123"
                                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2">
                                    <LinkIcon className="w-4 h-4" />
                                    Generate Link
                                </button>
                                <button className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-sm font-semibold hover:bg-muted transition-colors flex items-center justify-center gap-2">
                                    <QrCode className="w-4 h-4" />
                                    QR Code
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
