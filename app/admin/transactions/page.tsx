"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Download,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCcw,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Copy,
  ChevronLeft,
  ChevronRight,
  Building2,
  MoreVertical,
  TrendingUp,
  TrendingDown,
  Activity,
  Smartphone,
  Landmark,
  ShieldAlert,
  X,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminTransactions, useReconcileTransaction } from "@/features/admin/queries";
import { AdminTransaction } from "@/features/admin/types";
import { toast } from "sonner";
import ReconcileTransactionModal from "./components/ReconcileTransactionModal";

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Helper function to format time
const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

// Helper function to format amount
const formatAmount = (amount: string, currency: string): string => {
  const num = parseFloat(amount);
  return `${num.toLocaleString()} ${currency}`;
};

// Skeleton loader for table rows
function TableRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="p-3">
        <div className="w-16 h-3 bg-gray-200 rounded mb-1" />
        <div className="w-20 h-2 bg-gray-200 rounded" />
      </td>
      <td className="p-3">
        <div className="w-32 h-3 bg-gray-200 rounded" />
      </td>
      <td className="p-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gray-200 rounded-lg" />
          <div>
            <div className="w-24 h-3 bg-gray-200 rounded mb-1" />
            <div className="w-32 h-2 bg-gray-200 rounded" />
          </div>
        </div>
      </td>
      <td className="p-3">
        <div className="w-20 h-3 bg-gray-200 rounded mb-1" />
        <div className="w-16 h-2 bg-gray-200 rounded" />
      </td>
      <td className="p-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-200 rounded" />
          <div className="w-20 h-3 bg-gray-200 rounded" />
        </div>
      </td>
      <td className="p-3">
        <div className="w-20 h-5 bg-gray-200 rounded-full mx-auto" />
      </td>
      <td className="p-3">
        <div className="w-4 h-4 bg-gray-200 rounded ml-auto" />
      </td>
    </tr>
  );
}

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTxn, setSelectedTxn] = useState<AdminTransaction | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isReconcileModalOpen, setIsReconcileModalOpen] = useState(false);
  const [transactionToReconcile, setTransactionToReconcile] = useState<AdminTransaction | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [environmentFilter, setEnvironmentFilter] = useState<string>("all");

  const reconcileMutation = useReconcileTransaction();

  const itemsPerPage = 50;
  const offset = (currentPage - 1) * itemsPerPage;

  // Build filters object
  const filters = useMemo(() => {
    const filterObj: {
      limit?: number;
      offset?: number;
      status?: string;
      transactionType?: string;
      environment?: 'sandbox' | 'production';
    } = {
      limit: itemsPerPage,
      offset,
    };

    if (statusFilter !== "all") filterObj.status = statusFilter;
    if (typeFilter !== "all") filterObj.transactionType = typeFilter;
    if (environmentFilter !== "all") filterObj.environment = environmentFilter as 'sandbox' | 'production';

    return filterObj;
  }, [statusFilter, typeFilter, environmentFilter, offset]);

  // Fetch transactions
  const { data: transactionsData, isLoading, error } = useAdminTransactions(filters);

  // Filter transactions by search term
  const filteredTransactions = useMemo(() => {
    if (!transactionsData?.transactions) return [];

    let filtered = transactionsData.transactions;

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter((tx) =>
        tx.transactionId.toLowerCase().includes(query) ||
        tx.gatewayReference?.toLowerCase().includes(query) ||
        tx.merchantBusinessName.toLowerCase().includes(query) ||
        tx.merchantId.toLowerCase().includes(query) ||
        tx.correlationId.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [transactionsData, searchTerm]);

  const openDetailModal = (txn: AdminTransaction) => {
    setSelectedTxn(txn);
    setIsDetailModalOpen(true);
  };

  const openReconcileModal = (txn: AdminTransaction) => {
    setTransactionToReconcile(txn);
    setIsReconcileModalOpen(true);
  };

  const handleReconcile = async (action: 'COMPLETE' | 'FAIL', notes: string) => {
    if (!transactionToReconcile) return;

    try {
      const result = await reconcileMutation.mutateAsync({
        transactionId: transactionToReconcile.transactionId,
        data: { action, notes },
      });

      if (result.success) {
        toast.success(result.message);
        setIsReconcileModalOpen(false);
        setTransactionToReconcile(null);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to reconcile transaction");
    }
  };

  // Check if transaction can be reconciled
  const canReconcile = (status: string): boolean => {
    return ['PROCESSING', 'VERIFYING', 'PENDING'].includes(status);
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
      SUCCESS: "bg-green-100 text-green-700",
      FAILED: "bg-red-100 text-red-700",
      PENDING: "bg-orange-100 text-orange-700",
      PROCESSING: "bg-blue-100 text-blue-700",
      VERIFYING: "bg-yellow-100 text-yellow-700",
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-700"}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const getGatewayIcon = (gateway: string) => {
    if (gateway.includes("MTN") || gateway.includes("MOMO")) return Smartphone;
    if (gateway.includes("ORANGE")) return Smartphone;
    return Landmark;
  };

  const getGatewayName = (gateway: string) => {
    if (gateway === "MTN_MOMO") return "MTN Mobile Money";
    if (gateway === "ORANGE_MONEY") return "Orange Money";
    return gateway.replace("_", " ");
  };

  // Calculate stats from data
  const stats = useMemo(() => {
    if (!transactionsData?.transactions) {
      return {
        collections: { value: "0", change: "+0%" },
        payouts: { value: "0", change: "+0%" },
        health: { value: "0%", change: "0%" },
      };
    }

    const transactions = transactionsData.transactions;
    const collections = transactions.filter((tx) => tx.transactionType === "COLLECTION");
    const payouts = transactions.filter((tx) => tx.transactionType === "DISBURSEMENT");
    const successful = transactions.filter((tx) => tx.status === "SUCCESS").length;
    const successRate = transactions.length > 0 ? (successful / transactions.length) * 100 : 0;

    return {
      collections: {
        value: collections.reduce((sum, tx) => sum + parseFloat(tx.amount), 0).toLocaleString(),
        change: "+12%",
      },
      payouts: {
        value: payouts.reduce((sum, tx) => sum + parseFloat(tx.amount), 0).toLocaleString(),
        change: "+5%",
      },
      health: {
        value: `${successRate.toFixed(1)}%`,
        change: "-0.5%",
      },
    };
  }, [transactionsData]);

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const handleClickOutside = (e: React.MouseEvent) => {
    if (showFilterDropdown && !(e.target as HTMLElement).closest('.filter-dropdown-container')) {
      setShowFilterDropdown(false);
    }
  };

  return (
    <div className="space-y-4" onClick={handleClickOutside}>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-blue-600" />
            Transactions
          </h1>
          <p className="text-xs text-gray-500 mt-1">Real-time monitoring of all payment flows</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search ID, Ref, Merchant..."
              className="pl-9 pr-3 py-1.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-xs w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative filter-dropdown-container">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowFilterDropdown(!showFilterDropdown);
              }}
              className="flex items-center justify-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 text-gray-700 relative"
            >
              <Filter className="w-3.5 h-3.5" />
              Filter
              {(statusFilter !== "all" || typeFilter !== "all" || environmentFilter !== "all") && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full" />
              )}
              <ChevronDown className={`w-3 h-3 transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Filter Dropdown */}
            {showFilterDropdown && (
              <div
                className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[200px] max-h-[300px] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-3 space-y-4">
                  {/* Status Filter */}
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2">Status</p>
                    <div className="space-y-1.5">
                      {[
                        { value: "all", label: "All Statuses" },
                        { value: "SUCCESS", label: "Success" },
                        { value: "FAILED", label: "Failed" },
                        { value: "PENDING", label: "Pending" },
                        { value: "PROCESSING", label: "Processing" },
                        { value: "VERIFYING", label: "Verifying" },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded"
                        >
                          <input
                            type="radio"
                            name="status"
                            value={option.value}
                            checked={statusFilter === option.value}
                            onChange={(e) => {
                              setStatusFilter(e.target.value);
                              handleFilterChange();
                            }}
                            className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-xs text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-200" />

                  {/* Type Filter */}
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2">Transaction Type</p>
                    <div className="space-y-1.5">
                      {[
                        { value: "all", label: "All Types" },
                        { value: "COLLECTION", label: "Collection" },
                        { value: "DISBURSEMENT", label: "Disbursement" },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded"
                        >
                          <input
                            type="radio"
                            name="type"
                            value={option.value}
                            checked={typeFilter === option.value}
                            onChange={(e) => {
                              setTypeFilter(e.target.value);
                              handleFilterChange();
                            }}
                            className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-xs text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-200" />

                  {/* Environment Filter */}
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2">Environment</p>
                    <div className="space-y-1.5">
                      {[
                        { value: "all", label: "All Environments" },
                        { value: "sandbox", label: "Sandbox" },
                        { value: "production", label: "Production" },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded"
                        >
                          <input
                            type="radio"
                            name="environment"
                            value={option.value}
                            checked={environmentFilter === option.value}
                            onChange={(e) => {
                              setEnvironmentFilter(e.target.value);
                              handleFilterChange();
                            }}
                            className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-xs text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Clear Filters */}
                  {(statusFilter !== "all" || typeFilter !== "all" || environmentFilter !== "all") && (
                    <>
                      <div className="border-t border-gray-200" />
                      <button
                        onClick={() => {
                          setStatusFilter("all");
                          setTypeFilter("all");
                          setEnvironmentFilter("all");
                          handleFilterChange();
                        }}
                        className="w-full text-xs text-blue-600 hover:text-blue-700 font-medium py-1.5"
                      >
                        Clear All Filters
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 text-gray-700">
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800 font-semibold mb-1">Error loading transactions</p>
          <p className="text-xs text-red-600">{error.message}</p>
        </div>
      )}

      {/* Live Monitoring Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <ArrowUpRight className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-xs font-medium text-gray-500">Collections (60m)</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-medium rounded-full border border-green-100">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Live
            </div>
          </div>
          {isLoading ? (
            <div className="animate-pulse">
              <div className="w-24 h-6 bg-gray-200 rounded mb-2" />
              <div className="w-16 h-3 bg-gray-200 rounded" />
            </div>
          ) : (
            <>
              <div className="flex items-end gap-2 mt-1">
                <span className="text-lg font-bold text-gray-900">{stats.collections.value}</span>
                <span className="text-[10px] font-medium text-green-600 flex items-center mb-1">
                  <TrendingUp className="w-3 h-3 mr-0.5" /> {stats.collections.change}
                </span>
              </div>
              <div className="h-1 w-full bg-gray-50 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-green-500 rounded-full w-3/4" />
              </div>
            </>
          )}
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-red-50 rounded-lg">
              <ArrowDownLeft className="w-4 h-4 text-red-600" />
            </div>
            <span className="text-xs font-medium text-gray-500">Payouts (60m)</span>
          </div>
          {isLoading ? (
            <div className="animate-pulse">
              <div className="w-24 h-6 bg-gray-200 rounded mb-2" />
              <div className="w-16 h-3 bg-gray-200 rounded" />
            </div>
          ) : (
            <>
              <div className="flex items-end gap-2 mt-1">
                <span className="text-lg font-bold text-gray-900">{stats.payouts.value}</span>
                <span className="text-[10px] font-medium text-green-600 flex items-center mb-1">
                  <TrendingUp className="w-3 h-3 mr-0.5" /> {stats.payouts.change}
                </span>
              </div>
              <div className="h-1 w-full bg-gray-50 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-red-500 rounded-full w-1/4" />
              </div>
            </>
          )}
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Activity className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-gray-500">Platform Health</span>
          </div>
          {isLoading ? (
            <div className="animate-pulse">
              <div className="w-20 h-6 bg-gray-200 rounded mb-2" />
              <div className="w-16 h-3 bg-gray-200 rounded" />
            </div>
          ) : (
            <>
              <div className="flex items-end gap-2 mt-1">
                <span className="text-lg font-bold text-gray-900">{stats.health.value}</span>
                <span className="text-[10px] font-medium text-red-600 flex items-center mb-1">
                  <TrendingDown className="w-3 h-3 mr-0.5" /> {stats.health.change}
                </span>
              </div>
              <div className="h-1 w-full bg-gray-50 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: stats.health.value }} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                <th className="p-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Transaction ID</th>
                <th className="p-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Merchant</th>
                <th className="p-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider text-right">Volume</th>
                <th className="p-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Gateway</th>
                <th className="p-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider text-center">Status</th>
                <th className="p-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 10 }).map((_, index) => (
                  <TableRowSkeleton key={index} />
                ))
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center">
                    <p className="text-sm text-gray-500">
                      {searchTerm ? "No transactions found matching your search." : "No transactions found."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((txn, index) => {
                  const GatewayIcon = getGatewayIcon(txn.gateway);
                  return (
                    <motion.tr
                      key={txn.transactionId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors group"
                    >
                      <td className="p-3">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-gray-900">{formatTime(txn.createdAt)}</span>
                          <span className="text-[10px] text-gray-500">{formatDate(txn.createdAt)}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-medium text-gray-600 uppercase tracking-tight bg-gray-100 px-1.5 py-0.5 rounded">
                            {txn.transactionId.slice(0, 8)}...
                          </span>
                          <button
                            onClick={() => navigator.clipboard.writeText(txn.transactionId)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white hover:shadow-sm rounded transition-all text-gray-400 hover:text-blue-500"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{txn.merchantBusinessName}</span>
                            <span className="text-[10px] text-gray-500">{txn.merchantId.slice(0, 8)}...</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex flex-col items-end">
                          <span
                            className={`text-xs font-semibold ${
                              txn.transactionType === "DISBURSEMENT" ? "text-red-600" : "text-green-600"
                            }`}
                          >
                            {txn.transactionType === "COLLECTION" ? "+" : "-"}
                            {formatAmount(txn.amount, txn.currency)}
                          </span>
                          <span className="text-[10px] text-gray-500 capitalize">
                            {txn.transactionType === "COLLECTION" ? "Collection" : "Disbursement"}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-gray-50 flex items-center justify-center">
                            <GatewayIcon className="w-3.5 h-3.5 text-blue-600" />
                          </div>
                          <span className="text-xs font-medium text-gray-600">{getGatewayName(txn.gateway)}</span>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <StatusBadge status={txn.status} />
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openDetailModal(txn)}
                            className="p-1.5 hover:bg-gray-100 hover:text-blue-600 rounded-lg transition-all text-gray-400"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {canReconcile(txn.status) && (
                            <button
                              onClick={() => openReconcileModal(txn)}
                              className="p-1.5 hover:bg-gray-100 rounded-lg transition-all text-gray-400 hover:text-orange-600"
                              title="Reconcile Transaction"
                            >
                              <RefreshCcw className="w-4 h-4" />
                            </button>
                          )}
                          <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-all text-gray-400 hover:text-gray-900">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && transactionsData && (
          <div className="p-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Showing <span className="font-medium">{offset + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(offset + itemsPerPage, transactionsData.total)}
              </span>{" "}
              of <span className="font-medium">{transactionsData.total}</span> transactions
            </div>
            <div className="flex items-center gap-1.5">
              <button
                className="p-1.5 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, Math.ceil(transactionsData.total / itemsPerPage)) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium ${currentPage === page ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-600'}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  );
                })}
                {transactionsData.hasMore && (
                  <>
                    <span className="text-gray-400 px-1 text-xs">...</span>
                    <button
                      className={`px-2.5 py-1 rounded-md text-xs font-medium ${currentPage === Math.ceil(transactionsData.total / itemsPerPage) ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-600'}`}
                      onClick={() => setCurrentPage(Math.ceil(transactionsData.total / itemsPerPage))}
                    >
                      {Math.ceil(transactionsData.total / itemsPerPage)}
                    </button>
                  </>
                )}
              </div>
              <button
                className="p-1.5 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!transactionsData.hasMore}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {isDetailModalOpen && selectedTxn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDetailModalOpen(false)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl bg-white rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[95vh]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-5">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
                      selectedTxn.status === "SUCCESS"
                        ? "bg-green-100 text-green-600"
                        : selectedTxn.status === "FAILED"
                          ? "bg-red-100 text-red-600"
                          : "bg-orange-100 text-orange-600"
                    }`}
                  >
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Transaction: #{selectedTxn.transactionId.slice(0, 8)}...
                    </h2>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs font-semibold text-gray-500 uppercase">
                        {selectedTxn.transactionType === "COLLECTION" ? "Collection" : "Disbursement"}
                      </span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full" />
                      <span
                        className={`text-xs font-bold uppercase ${
                          selectedTxn.status === "SUCCESS" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {selectedTxn.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all flex items-center gap-2">
                    <RefreshCcw className="w-4 h-4" />
                    Re-query
                  </button>
                  <button
                    onClick={() => setIsDetailModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-gray-50/30">
                {/* Error Alert if FAILED */}
                {selectedTxn.status === "FAILED" && selectedTxn.failureReason && (
                  <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-red-900">Failure Reason</h4>
                      <p className="text-sm text-red-700 mt-0.5">{selectedTxn.failureReason}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* General Info */}
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-3">
                      General Information
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex justify-between items-center py-1 border-b border-gray-50">
                        <span className="text-sm text-gray-500 font-medium">Transaction ID</span>
                        <span className="text-sm font-mono font-semibold text-gray-900">
                          {selectedTxn.transactionId.slice(0, 8)}...
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-gray-50">
                        <span className="text-sm text-gray-500 font-medium">Merchant</span>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900">{selectedTxn.merchantBusinessName}</div>
                          <div className="text-xs text-gray-500">{selectedTxn.merchantId.slice(0, 8)}...</div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-gray-50">
                        <span className="text-sm text-gray-500 font-medium">Gross Amount</span>
                        <span className="text-sm font-bold text-gray-900">
                          {formatAmount(selectedTxn.amount, selectedTxn.currency)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-gray-50">
                        <span className="text-sm text-gray-500 font-medium">Platform Fee</span>
                        <span className="text-sm font-semibold text-red-600">
                          -{formatAmount(selectedTxn.platformFee, selectedTxn.currency)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-gray-50">
                        <span className="text-sm text-gray-500 font-medium">Gateway Fee</span>
                        <span className="text-sm font-semibold text-red-600">
                          -{formatAmount(selectedTxn.gatewayFee, selectedTxn.currency)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-500 font-bold">Net Settlement</span>
                        <span className="text-lg font-bold text-green-600">
                          {formatAmount(selectedTxn.netToMerchant, selectedTxn.currency)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Gateway Data */}
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-3">
                      Gateway & Routing
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex justify-between items-center py-1 border-b border-gray-50">
                        <span className="text-sm text-gray-500 font-medium">Provider</span>
                        <div className="flex items-center gap-2">
                          {(() => {
                            const GatewayIcon = getGatewayIcon(selectedTxn.gateway);
                            return <GatewayIcon className="w-4 h-4 text-blue-600" />;
                          })()}
                          <span className="text-sm font-semibold text-gray-900">{getGatewayName(selectedTxn.gateway)}</span>
                        </div>
                      </div>
                      {selectedTxn.gatewayReference && (
                        <div className="flex justify-between items-center py-1 border-b border-gray-50">
                          <span className="text-sm text-gray-500 font-medium">Gateway Reference</span>
                          <span className="text-sm font-mono font-medium text-gray-900 bg-gray-50 px-2 py-0.5 rounded">
                            {selectedTxn.gatewayReference}
                          </span>
                        </div>
                      )}
                      {selectedTxn.payerMsisdn && (
                        <div className="flex justify-between items-center py-1 border-b border-gray-50">
                          <span className="text-sm text-gray-500 font-medium">Payer Phone</span>
                          <span className="text-sm font-medium text-gray-900">{selectedTxn.payerMsisdn}</span>
                        </div>
                      )}
                      {selectedTxn.payoutRecipientMsisdn && (
                        <div className="flex justify-between items-center py-1 border-b border-gray-50">
                          <span className="text-sm text-gray-500 font-medium">Recipient Phone</span>
                          <span className="text-sm font-medium text-gray-900">{selectedTxn.payoutRecipientMsisdn}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center py-1 border-b border-gray-50">
                        <span className="text-sm text-gray-500 font-medium">Environment</span>
                        <span className="text-xs font-semibold text-gray-900 uppercase">{selectedTxn.environment}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-gray-50">
                        <span className="text-sm text-gray-500 font-medium">Correlation ID</span>
                        <span className="text-xs font-mono text-gray-900">{selectedTxn.correlationId}</span>
                      </div>
                      {selectedTxn.refunded && (
                        <div className="pt-2 border-t border-gray-100">
                          <div className="flex justify-between items-center py-1">
                            <span className="text-sm text-gray-500 font-medium">Refunded</span>
                            <span className="text-sm font-semibold text-blue-600">
                              {formatAmount(selectedTxn.refundedAmount, selectedTxn.currency)}
                            </span>
                          </div>
                          {selectedTxn.fullyRefunded && (
                            <span className="text-xs text-blue-600 font-medium">Fully Refunded</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Payout Information (if disbursement) */}
                {selectedTxn.transactionType === "DISBURSEMENT" && selectedTxn.payoutId && (
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-3">
                      Payout Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex justify-between items-center py-1 border-b border-gray-50">
                        <span className="text-sm text-gray-500 font-medium">Payout ID</span>
                        <span className="text-sm font-mono text-gray-900">{selectedTxn.payoutId.slice(0, 8)}...</span>
                      </div>
                      {selectedTxn.payoutStatus && (
                        <div className="flex justify-between items-center py-1 border-b border-gray-50">
                          <span className="text-sm text-gray-500 font-medium">Payout Status</span>
                          <StatusBadge status={selectedTxn.payoutStatus} />
                        </div>
                      )}
                      {selectedTxn.payoutReference && (
                        <div className="flex justify-between items-center py-1 border-b border-gray-50">
                          <span className="text-sm text-gray-500 font-medium">Payout Reference</span>
                          <span className="text-sm font-medium text-gray-900">{selectedTxn.payoutReference}</span>
                        </div>
                      )}
                      {selectedTxn.payoutGatewayReference && (
                        <div className="flex justify-between items-center py-1 border-b border-gray-50">
                          <span className="text-sm text-gray-500 font-medium">Gateway Reference</span>
                          <span className="text-sm font-mono text-gray-900">{selectedTxn.payoutGatewayReference}</span>
                        </div>
                      )}
                      {selectedTxn.payoutTotalDeduction && (
                        <div className="flex justify-between items-center py-1">
                          <span className="text-sm text-gray-500 font-medium">Total Deduction</span>
                          <span className="text-sm font-bold text-gray-900">
                            {formatAmount(selectedTxn.payoutTotalDeduction, selectedTxn.currency)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Refund Information (if refunded) */}
                {selectedTxn.refunded && selectedTxn.refundId && (
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-3">
                      Refund Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex justify-between items-center py-1 border-b border-gray-50">
                        <span className="text-sm text-gray-500 font-medium">Refund ID</span>
                        <span className="text-sm font-mono text-gray-900">{selectedTxn.refundId.slice(0, 8)}...</span>
                      </div>
                      {selectedTxn.refundAmount && (
                        <div className="flex justify-between items-center py-1 border-b border-gray-50">
                          <span className="text-sm text-gray-500 font-medium">Refund Amount</span>
                          <span className="text-sm font-bold text-blue-600">
                            {formatAmount(selectedTxn.refundAmount, selectedTxn.currency)}
                          </span>
                        </div>
                      )}
                      {selectedTxn.refundMethod && (
                        <div className="flex justify-between items-center py-1 border-b border-gray-50">
                          <span className="text-sm text-gray-500 font-medium">Refund Method</span>
                          <span className="text-sm font-medium text-gray-900">{selectedTxn.refundMethod}</span>
                        </div>
                      )}
                      {selectedTxn.refundStatus && (
                        <div className="flex justify-between items-center py-1 border-b border-gray-50">
                          <span className="text-sm text-gray-500 font-medium">Refund Status</span>
                          <StatusBadge status={selectedTxn.refundStatus} />
                        </div>
                      )}
                      {selectedTxn.refundReason && (
                        <div className="flex justify-between items-center py-1 border-b border-gray-50">
                          <span className="text-sm text-gray-500 font-medium">Refund Reason</span>
                          <span className="text-sm text-gray-900">{selectedTxn.refundReason}</span>
                        </div>
                      )}
                      {selectedTxn.refundCreatedAt && (
                        <div className="flex justify-between items-center py-1">
                          <span className="text-sm text-gray-500 font-medium">Refund Created</span>
                          <span className="text-sm text-gray-900">{formatDate(selectedTxn.refundCreatedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Life Cycle Log */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-6">
                    Transaction Life Cycle
                  </h3>
                  <div className="space-y-6 relative ml-4">
                    <div className="absolute left-[-17px] top-2 bottom-2 w-0.5 bg-gray-100" />
                    {[
                      {
                        time: formatTime(selectedTxn.createdAt),
                        msg: "Transaction initiated",
                        icon: Clock,
                      },
                      {
                        time: selectedTxn.completedAt ? formatTime(selectedTxn.completedAt) : "Processing...",
                        msg:
                          selectedTxn.status === "SUCCESS"
                            ? `Gateway confirmed payment success via ${getGatewayName(selectedTxn.gateway)}`
                            : selectedTxn.status === "FAILED"
                              ? "Gateway returned failure response"
                              : "Transaction is being processed",
                        icon: selectedTxn.status === "SUCCESS" ? CheckCircle2 : selectedTxn.status === "FAILED" ? XCircle : Clock,
                        color:
                          selectedTxn.status === "SUCCESS"
                            ? "text-green-500"
                            : selectedTxn.status === "FAILED"
                              ? "text-red-500"
                              : "text-gray-400",
                      },
                      {
                        time: selectedTxn.completedAt ? formatTime(selectedTxn.completedAt) : "Pending",
                        msg: "Merchant webhook dispatched",
                        icon: Activity,
                      },
                    ].map((log, i) => (
                      <div key={i} className="flex gap-6 items-start relative">
                        <div
                          className={`w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center shrink-0 z-10 ${log.color || "text-gray-400"} bg-white`}
                        >
                          <log.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 mb-0.5">{log.time}</p>
                          <p className="text-sm font-bold text-gray-800">{log.msg}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Admin Actions */}
                <div className="bg-gray-50 border border-gray-200 p-6 rounded-xl text-center">
                  <h3 className="text-gray-900 font-bold uppercase tracking-wider text-xs mb-6">
                    Internal Management Tools
                  </h3>
                  <div className="flex flex-wrap justify-center gap-4">
                    <button className="px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold rounded-lg transition-all shadow-sm flex items-center gap-2 text-sm">
                      Initiate Refund
                    </button>
                    {canReconcile(selectedTxn.status) && (
                      <button
                        onClick={() => {
                          setIsDetailModalOpen(false);
                          openReconcileModal(selectedTxn);
                        }}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all shadow-sm flex items-center gap-2 text-sm"
                      >
                        <RefreshCcw className="w-4 h-4" />
                        Reconcile Transaction
                      </button>
                    )}
                    <button className="px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold rounded-lg transition-all shadow-sm flex items-center gap-2 text-sm">
                      Notify Merchant
                    </button>
                  </div>
                  <p className="text-gray-500 text-xs mt-6 font-medium">
                    All manual overrides require mandatory reason text and are logged for audit compliance.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reconcile Transaction Modal */}
      <ReconcileTransactionModal
        isOpen={isReconcileModalOpen}
        onClose={() => {
          setIsReconcileModalOpen(false);
          setTransactionToReconcile(null);
        }}
        onConfirm={handleReconcile}
        transaction={transactionToReconcile}
        isLoading={reconcileMutation.isPending}
      />
    </div>
  );
}
