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
} from "lucide-react";
import { toast } from "sonner";
import { useUserMerchantData } from "@/features/merchants/context/MerchantContext";
import { useEnvironment } from "@/core/environment/EnvironmentContext";
import { downloadTransactionReceipt } from "@/features/merchants/api/index";
import { useTransactionReport } from "@/features/reports/queries";
import type { TransactionReportItem } from "@/features/reports/types";

type TransactionType = "all" | "collection" | "payout";

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
        return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400";
      case "PENDING_GATEWAY":
        return "bg-crimson-red-100 dark:bg-crimson-red-900/20 text-crimson-red-700 dark:text-crimson-red-400";
      case "FAILED":
        return "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400";
      default:
        return "bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400";
    }
  };

  const formatAmount = (amount: string | number, currency: string = "XAF") => {
    const numericAmount = typeof amount === "string" ? Number(amount) : amount;
    // Display FCFA instead of XAF in production mode
    const displayCurrency = currency === "XAF" && environment === "production" ? "FCFA" : currency;
    return `${Number.isFinite(numericAmount) ? numericAmount.toLocaleString() : amount} ${displayCurrency}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return <CheckCircle2 className="w-4 h-4" />;
      case "PENDING_GATEWAY":
        return <Clock className="w-4 h-4" />;
      case "FAILED":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
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

  // Get transactions from API data
  const transactions = transactionsData?.transactions || [];

  // Debug logging (remove in production)
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('Transactions Page Debug:', {
      merchantId,
      activeTab,
      transactionType: reportFilters.transactionType,
      hasData: !!transactionsData,
      transactionsCount: transactions.length,
      isLoading: isLoadingTransactions,
      error: transactionsError?.message,
      errorDetails: transactionsError
    });
  }

  // Filter transactions
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

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil((transactionsData?.total || filteredTransactions.length) / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + filteredTransactions.length;
  const paginatedTransactions = filteredTransactions;
  const visibleEnd = Math.min(endIndex, transactionsData?.total || filteredTransactions.length);

  // Reset to page 1 when filter changes
  const handleTabChange = (tab: TransactionType) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Transactions</h1>
          <p className="text-xs text-muted-foreground mt-1">
            View and manage all your payment history
          </p>
        </div>
        <button className="px-4 py-2 bg-background border border-border text-foreground rounded-lg text-sm font-semibold hover:bg-muted transition-colors flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* CONTROLS (TABS & FILTERS) */}
      <div className="bg-background rounded-xl p-3 border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">

        {/* TABS (Segmented Control) */}
        <div className="flex p-1 bg-muted/50 rounded-lg shrink-0">
          {[
            { id: "all", label: "All" },
            { id: "collection", label: "Collections", icon: ArrowDownToLine },
            { id: "payout", label: "Payouts", icon: ArrowUpFromLine },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as TransactionType)}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTab === tab.id
                ? "bg-background text-foreground shadow-sm border border-border/50"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
              {tab.label}
            </button>
          ))}
        </div>

        {/* SEARCH & FILTERS */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 md:min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search ID or gateway..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-crimson-red-500 transition-shadow"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-crimson-red-500 transition-shadow"
          >
            <option value="">All Status</option>
            <option value="SUCCESS">Success</option>
            <option value="PENDING_GATEWAY">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>


      {/* TRANSACTIONS TABLE */}
      <div className="bg-background rounded-xl p-6 border border-border">
        {transactionsError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-900 dark:text-red-100 font-semibold mb-1">
              Error loading transactions
            </p>
            <p className="text-xs text-red-800 dark:text-red-200">
              {transactionsError.message || 'An unknown error occurred. Please try again.'}
            </p>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-2">
                <summary className="text-xs text-red-700 dark:text-red-300 cursor-pointer">
                  Show error details
                </summary>
                <pre className="mt-2 text-xs text-red-600 dark:text-red-400 overflow-auto">
                  {JSON.stringify(transactionsError, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}
        {!merchantId && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-900 dark:text-yellow-100">
              Merchant ID not found. Please ensure you&apos;re logged in.
            </p>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Date & Time
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Transaction ID
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Type
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Payee
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Amount
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Gateway
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoadingTransactions ? (
                // Skeleton Loaders
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="py-3 px-4">
                      <div className="w-20 h-3 bg-muted rounded mb-1 animate-pulse" />
                      <div className="w-16 h-3 bg-muted rounded animate-pulse" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-32 h-3 bg-muted rounded animate-pulse" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-16 h-3 bg-muted rounded animate-pulse" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-24 h-3 bg-muted rounded mb-1 animate-pulse" />
                      <div className="w-20 h-3 bg-muted rounded animate-pulse" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-20 h-6 bg-muted rounded animate-pulse" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-24 h-3 bg-muted rounded mb-1 animate-pulse" />
                      <div className="w-16 h-3 bg-muted rounded animate-pulse" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-20 h-3 bg-muted rounded animate-pulse" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-4 h-4 bg-muted rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filteredTransactions.length > 0 && paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((tx) => {
                  const txDateTime = getTransactionDateTime(tx);
                  const normalizedType = normalizeTransactionType(tx.transactionType);

                  return (
                  <tr
                    key={tx.id}
                    onClick={() => openDetailModal(tx)}
                    className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4">
                      <div className="text-xs text-foreground font-medium">{txDateTime.date}</div>
                      <div className="text-xs text-muted-foreground">{txDateTime.time}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-xs text-foreground font-mono">
                        {tx.id.length > 20 ? `${tx.id.slice(0, 20)}...` : tx.id}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-medium text-foreground capitalize">
                        {normalizedType === "all" ? tx.transactionType : normalizedType}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-xs font-medium text-foreground">
                        {getCounterpartyName(tx)}
                      </div>
                      {getCounterpartyPhone(tx) ? (
                        <div className="text-xs text-muted-foreground">
                          {getCounterpartyPhone(tx)}
                        </div>
                      ) : null}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                          tx.status
                        )}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${tx.status === "SUCCESS"
                            ? "bg-green-500"
                            : tx.status === "PENDING_GATEWAY"
                              ? "bg-crimson-red-500"
                              : "bg-red-500"
                            }`}
                        />
                        {tx.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-xs font-semibold text-foreground">
                        {formatAmount(tx.amount, tx.currency)}
                      </div>
                      {Number(tx.fees) > 0 && (
                        <div className="text-xs text-muted-foreground">
                          Fee: {formatAmount(tx.fees, tx.currency)}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-foreground">
                        {tx.gateway.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button className="p-1 text-muted-foreground hover:bg-muted hover:text-foreground rounded transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <p className="text-sm text-muted-foreground">No transactions found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredTransactions.length > 0 && (
          <div className="p-4 border-t border-border flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Showing {startIndex + 1}-{visibleEnd} of {transactionsData?.total || filteredTransactions.length} transactions
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 hover:bg-muted rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 text-muted-foreground" />
              </button>
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
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${currentPage === pageNum
                      ? "bg-crimson-red-500 text-white"
                      : "hover:bg-muted text-foreground"
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <span className="text-xs text-muted-foreground">...</span>
              )}
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className="px-3 py-1 hover:bg-muted rounded text-xs font-medium text-foreground"
                >
                  {totalPages}
                </button>
              )}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 hover:bg-muted rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* TRANSACTION DETAIL MODAL */}
      {showDetailModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-2xl shadow-2xl border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-background border-b border-border p-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Transaction Details</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1 hover:bg-muted rounded transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Status Banner */}
              <div className={`rounded-lg p-4 border ${getStatusColor(selectedTransaction.status)}`}>
                <div className="flex items-center gap-2 mb-1">
                  {getStatusIcon(selectedTransaction.status)}
                  <span className="text-sm font-semibold">
                    {selectedTransaction.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs">
                  {selectedTransaction.status === "SUCCESS"
                    ? "Transaction completed successfully"
                    : selectedTransaction.status === "PENDING_GATEWAY"
                      ? "Transaction is being processed"
                      : "Transaction failed"}
                </p>
              </div>

              {/* Transaction Information */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Transaction Information</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transaction ID:</span>
                    <span className="font-mono font-medium text-foreground">{selectedTransaction.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium text-foreground">
                      {normalizeTransactionType(selectedTransaction.transactionType) === "collection"
                        ? "Collection"
                        : normalizeTransactionType(selectedTransaction.transactionType) === "payout"
                          ? "Payout"
                          : selectedTransaction.transactionType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium text-foreground">
                      {getTransactionDateTime(selectedTransaction).date} {getTransactionDateTime(selectedTransaction).time}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gateway:</span>
                    <span className="font-medium text-foreground">{selectedTransaction.gateway?.replace("_", " ") || "N/A"}</span>
                  </div>
                  {selectedTransaction.paymentLinkTitle ? (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Link:</span>
                      <span className="font-medium text-foreground">{selectedTransaction.paymentLinkTitle}</span>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Payee Information */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Payee Information</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium text-foreground text-right">{getCounterpartyName(selectedTransaction)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-medium text-foreground text-right">{getCounterpartyPhone(selectedTransaction) || "Phone not available"}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium text-foreground text-right">{getCounterpartyEmail(selectedTransaction) || "Email not provided"}</span>
                  </div>
                  {selectedTransaction.comment ? (
                    <div className="pt-2">
                      <span className="text-muted-foreground block mb-1">Comment:</span>
                      <p className="font-medium text-foreground whitespace-pre-wrap rounded-lg border border-border p-3">
                        {selectedTransaction.comment}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Amount Breakdown */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Amount Breakdown</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transaction Amount:</span>
                    <span className="font-semibold text-foreground">
                      {formatAmount(selectedTransaction.amount, selectedTransaction.currency)}
                    </span>
                  </div>
                  {Number(selectedTransaction.fees) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fees:</span>
                      <span className="text-foreground">{formatAmount(selectedTransaction.fees, selectedTransaction.currency)}</span>
                    </div>
                  )}
                  {Number(selectedTransaction.fees) > 0 && (
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="font-medium text-foreground">Net Amount:</span>
                      <span className="font-bold text-foreground">
                        {formatAmount(selectedTransaction.netAmount, selectedTransaction.currency)}
                      </span>
                    </div>
                  )}
                </div>
              </div>


              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={handleDownloadReceipt}
                  disabled={isDownloadingReceipt}
                  className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-xs font-semibold text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isDownloadingReceipt ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  {isDownloadingReceipt ? "Downloading..." : "Download Receipt"}
                </button>
                {selectedTransaction.status === "SUCCESS" && (
                  <button className="flex-1 px-4 py-2 bg-crimson-red-500 text-white rounded-lg text-xs font-semibold hover:bg-crimson-red-600 transition-colors flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Refund
                  </button>
                )}
                {selectedTransaction.status === "FAILED" && (
                  <button className="flex-1 px-4 py-2 bg-crimson-red-500 text-white rounded-lg text-xs font-semibold hover:bg-crimson-red-600 transition-colors flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Retry
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
