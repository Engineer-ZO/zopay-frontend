"use client";

import { useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  MoreVertical,
  X,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  CreditCard,
  User,
  Phone,
  Mail,
  FileText,
  Receipt,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useUserMerchantData } from "@/features/merchants/context/MerchantContext";
import { useEnvironment } from "@/core/environment/EnvironmentContext";
import { downloadTransactionReceipt } from "@/features/merchants/api/index";
import { useTransactionReport } from "@/features/reports/queries";
import type { TransactionReportItem } from "@/features/reports/types";

type TransactionType = "all" | "collection" | "payout";

// Helper functions remain the same
function getCounterpartyName(tx: TransactionReportItem): string {
  return tx.payerName || tx.payeeName || "Name not provided";
}

function getCounterpartyEmail(tx: TransactionReportItem): string | null {
  return tx.payerEmail || tx.payeeEmail || null;
}

function getCounterpartyPhone(tx: TransactionReportItem): string | null {
  return tx.payerMsisdn || tx.payeeMsisdn || tx.phoneNumber || null;
}

function getTransactionDateTime(tx: TransactionReportItem): { date: string; time: string } {
  const parsed = new Date(tx.date);
  if (Number.isNaN(parsed.getTime())) {
    return { date: tx.date || "N/A", time: "" };
  }
  return {
    date: parsed.toLocaleDateString(),
    time: parsed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
}

function normalizeTransactionType(type: string): TransactionType {
  const normalized = type.toLowerCase();
  if (normalized.includes("payout") || normalized.includes("disbursement")) return "payout";
  if (normalized.includes("collection")) return "collection";
  return "all";
}

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, trend, color = "indigo" }: any) => {
  const colors = {
    indigo: "from-indigo-500 to-purple-600",
    emerald: "from-emerald-500 to-teal-600",
    amber: "from-amber-500 to-orange-600",
    rose: "from-rose-500 to-pink-600",
  };
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-2xl" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{value}</p>
          {trend && <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">{trend}</p>}
        </div>
        <div className={`p-2 rounded-xl bg-gradient-to-br ${colors[color as keyof typeof colors]} bg-opacity-10 shadow-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const config = {
    SUCCESS: { icon: CheckCircle2, bg: "bg-emerald-100 dark:bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-500/20", dot: "bg-emerald-500" },
    PENDING_GATEWAY: { icon: Clock, bg: "bg-amber-100 dark:bg-amber-500/10", text: "text-amber-700 dark:text-amber-400", border: "border-amber-200 dark:border-amber-500/20", dot: "bg-amber-500" },
    FAILED: { icon: XCircle, bg: "bg-rose-100 dark:bg-rose-500/10", text: "text-rose-700 dark:text-rose-400", border: "border-rose-200 dark:border-rose-500/20", dot: "bg-rose-500" },
  };
  const c = config[status as keyof typeof config] || config.PENDING_GATEWAY;
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} animate-pulse`} />
      <Icon className="w-3 h-3" />
      {status.replace("_", " ")}
    </span>
  );
};

// Loading Skeleton Component
const LoadingSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 animate-pulse">
        <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
        </div>
        <div className="w-20 h-8 bg-slate-200 dark:bg-slate-700 rounded-full" />
      </div>
    ))}
  </div>
);

export default function TransactionsPage() {
  const { merchantId } = useUserMerchantData();
  const { environment } = useEnvironment();
  const [activeTab, setActiveTab] = useState<TransactionType>("all");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionReportItem | null>(null);
  const [isDownloadingReceipt, setIsDownloadingReceipt] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const reportFilters = {
    page: currentPage,
    limit: itemsPerPage,
    status: statusFilter || undefined,
    transactionType:
      activeTab === "collection"
        ? "COLLECTION"
        : activeTab === "payout"
          ? "DISBURSEMENT"
          : undefined,
  };

  const {
    data: transactionsData,
    isLoading: isLoadingTransactions,
    error: transactionsError,
  } = useTransactionReport(reportFilters);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20";
      case "PENDING_GATEWAY":
        return "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20";
      case "FAILED":
        return "bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20";
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700";
    }
  };

  const formatAmount = (amount: string | number, currency: string = "XAF") => {
    const numericAmount = typeof amount === "string" ? Number(amount) : amount;
    const displayCurrency = currency === "XAF" && environment === "production" ? "FCFA" : currency;
    return `${Number.isFinite(numericAmount) ? numericAmount.toLocaleString() : amount} ${displayCurrency}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case "PENDING_GATEWAY":
        return <Clock className="w-5 h-5 text-amber-500" />;
      case "FAILED":
        return <XCircle className="w-5 h-5 text-rose-500" />;
      default:
        return <Clock className="w-5 h-5 text-slate-500" />;
    }
  };

  const openDetailModal = (transaction: TransactionReportItem) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  const handleDownloadReceipt = async () => {
    if (!selectedTransaction) return;
    setIsDownloadingReceipt(true);
    try {
      const blob = await downloadTransactionReceipt(selectedTransaction.id, environment);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `receipt-${selectedTransaction.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Receipt download started");
    } catch (error) {
      toast.error("Could not download receipt", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsDownloadingReceipt(false);
    }
  };

  const transactions = transactionsData?.transactions || [];

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      !searchQuery ||
      tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.gateway && tx.gateway.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tx.paymentLinkTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      getCounterpartyName(tx).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (getCounterpartyEmail(tx)?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (getCounterpartyPhone(tx)?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

    const matchesStatus =
      !statusFilter || tx.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil((transactionsData?.total || filteredTransactions.length) / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleEnd = Math.min(startIndex + itemsPerPage, transactionsData?.total || filteredTransactions.length);

  const handleTabChange = (tab: TransactionType) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  // Calculate stats
  const totalVolume = transactions.reduce((sum, tx) => sum + Number(tx.amount), 0);
  const successCount = transactions.filter(tx => tx.status === "SUCCESS").length;
  const pendingCount = transactions.filter(tx => tx.status === "PENDING_GATEWAY").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                  <Receipt className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Transactions</h1>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                View and manage all your payment history across sandbox and production environments
              </p>
            </div>
            <button className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 shadow-md">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard icon={Wallet} label="Total Volume" value={formatAmount(totalVolume)} color="indigo" />
          <StatCard icon={CheckCircle2} label="Successful" value={successCount} color="emerald" />
          <StatCard icon={Clock} label="Pending" value={pendingCount} color="amber" />
          <StatCard icon={TrendingUp} label="Success Rate" value={`${Math.round((successCount / transactions.length) * 100) || 0}%`} color="indigo" />
        </div>

        {/* Main Content Card */}
        <div className="rounded-2xl bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
          {/* Tabs & Filters */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Tabs */}
              <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
                {[
                  { id: "all", label: "All Transactions", icon: Receipt },
                  { id: "collection", label: "Collections", icon: ArrowDownToLine },
                  { id: "payout", label: "Payouts", icon: ArrowUpFromLine },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id as TransactionType)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search & Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by ID, gateway, or customer..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="w-64 pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  <option value="">All Status</option>
                  <option value="SUCCESS">Success</option>
                  <option value="PENDING_GATEWAY">Pending</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div>
            {transactionsError && (
              <div className="m-4 p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <p className="text-sm font-semibold text-rose-900 dark:text-rose-100">Error loading transactions</p>
                </div>
                <p className="text-xs text-rose-800 dark:text-rose-200">{transactionsError.message || 'An unknown error occurred.'}</p>
              </div>
            )}

            {!merchantId && (
              <div className="m-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                <p className="text-sm text-amber-900 dark:text-amber-100">Merchant ID not found. Please ensure you're logged in.</p>
              </div>
            )}

            <div className="overflow-x-auto">
              {isLoadingTransactions ? (
                <div className="p-6"><LoadingSkeleton /></div>
              ) : filteredTransactions.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date & Time</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Transaction ID</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Customer</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Gateway</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.slice(startIndex, startIndex + itemsPerPage).map((tx) => {
                      const txDateTime = getTransactionDateTime(tx);
                      const normalizedType = normalizeTransactionType(tx.transactionType);
                      return (
                        <tr
                          key={tx.id}
                          onClick={() => openDetailModal(tx)}
                          className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                        >
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-slate-900 dark:text-white">{txDateTime.date}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">{txDateTime.time}</div>
                          </td>
                          <td className="px-6 py-4">
                            <code className="text-xs font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                              {tx.id.slice(0, 16)}...
                            </code>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-medium capitalize ${
                              normalizedType === "collection" ? "text-emerald-600 dark:text-emerald-400" : "text-indigo-600 dark:text-indigo-400"
                            }`}>
                              {normalizedType === "collection" ? <ArrowDownToLine className="w-3 h-3" /> : <ArrowUpFromLine className="w-3 h-3" />}
                              {normalizedType === "collection" ? "Collection" : "Payout"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-sm text-slate-900 dark:text-white">
                                <User className="w-3 h-3 text-slate-400" />
                                {getCounterpartyName(tx)}
                              </div>
                              {getCounterpartyPhone(tx) && (
                                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                  <Phone className="w-3 h-3" />
                                  {getCounterpartyPhone(tx)}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={tx.status} />
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-semibold text-slate-900 dark:text-white">
                              {formatAmount(tx.amount, tx.currency)}
                            </div>
                            {Number(tx.fees) > 0 && (
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                Fee: {formatAmount(tx.fees, tx.currency)}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs text-slate-600 dark:text-slate-400">
                              {tx.gateway?.replace("_", " ") || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Receipt className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">No transactions found</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {filteredTransactions.length > 0 && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between flex-wrap gap-3">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </button>
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`min-w-[32px] h-8 rounded-lg text-sm font-medium transition-all ${
                            currentPage === pageNum
                              ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {showDetailModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Transaction Details</h3>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Status Banner */}
              <div className={`rounded-xl p-4 border ${getStatusColor(selectedTransaction.status)}`}>
                <div className="flex items-center gap-3 mb-2">
                  {getStatusIcon(selectedTransaction.status)}
                  <span className="text-sm font-semibold">{selectedTransaction.status.replace("_", " ")}</span>
                </div>
                <p className="text-xs opacity-90">
                  {selectedTransaction.status === "SUCCESS"
                    ? "Transaction completed successfully"
                    : selectedTransaction.status === "PENDING_GATEWAY"
                      ? "Transaction is being processed"
                      : "Transaction failed. Please check details or contact support."}
                </p>
              </div>

              {/* Transaction Info */}
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-500" />
                  Transaction Information
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                    <span className="text-slate-500 dark:text-slate-400">Transaction ID:</span>
                    <code className="font-mono font-medium text-slate-900 dark:text-white">{selectedTransaction.id}</code>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                    <span className="text-slate-500 dark:text-slate-400">Type:</span>
                    <span className="font-medium text-slate-900 dark:text-white capitalize">
                      {normalizeTransactionType(selectedTransaction.transactionType) === "collection" ? "Collection" : "Payout"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                    <span className="text-slate-500 dark:text-slate-400">Date:</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {getTransactionDateTime(selectedTransaction).date} at {getTransactionDateTime(selectedTransaction).time}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                    <span className="text-slate-500 dark:text-slate-400">Gateway:</span>
                    <span className="font-medium text-slate-900 dark:text-white">{selectedTransaction.gateway?.replace("_", " ") || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-500" />
                  Customer Information
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                    <span className="text-slate-500 dark:text-slate-400">Name:</span>
                    <span className="font-medium text-slate-900 dark:text-white text-right">{getCounterpartyName(selectedTransaction)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                    <span className="text-slate-500 dark:text-slate-400">Phone:</span>
                    <span className="font-medium text-slate-900 dark:text-white">{getCounterpartyPhone(selectedTransaction) || "Not available"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                    <span className="text-slate-500 dark:text-slate-400">Email:</span>
                    <span className="font-medium text-slate-900 dark:text-white">{getCounterpartyEmail(selectedTransaction) || "Not provided"}</span>
                  </div>
                </div>
              </div>

              {/* Amount Breakdown */}
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                  Amount Breakdown
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                    <span className="text-slate-500 dark:text-slate-400">Transaction Amount:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{formatAmount(selectedTransaction.amount, selectedTransaction.currency)}</span>
                  </div>
                  {Number(selectedTransaction.fees) > 0 && (
                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                      <span className="text-slate-500 dark:text-slate-400">Fees:</span>
                      <span className="text-slate-900 dark:text-white">{formatAmount(selectedTransaction.fees, selectedTransaction.currency)}</span>
                    </div>
                  )}
                  {Number(selectedTransaction.fees) > 0 && (
                    <div className="flex justify-between py-2 pt-3 border-t-2 border-slate-200 dark:border-slate-700">
                      <span className="font-semibold text-slate-900 dark:text-white">Net Amount:</span>
                      <span className="font-bold text-lg text-indigo-600 dark:text-indigo-400">
                        {formatAmount(selectedTransaction.netAmount, selectedTransaction.currency)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleDownloadReceipt}
                  disabled={isDownloadingReceipt}
                  className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isDownloadingReceipt ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  {isDownloadingReceipt ? "Downloading..." : "Download Receipt"}
                </button>
                {(selectedTransaction.status === "SUCCESS" || selectedTransaction.status === "FAILED") && (
                  <button className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    {selectedTransaction.status === "SUCCESS" ? "Refund" : "Retry"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}