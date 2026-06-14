"use client";

import { useState, useMemo } from "react";
import { Plus, Download, TrendingUp, Wallet, Clock, CheckCircle, XCircle, Calendar, Search, Filter, ChevronLeft, ChevronRight, FileText, Receipt, AlertCircle } from "lucide-react";
import {
  useListSettlements,
  useGenerateSettlement,
  useSettlementDetails,
  useSettlementStatement,
} from "@/features/settlements/queries";
import { SettlementStatsCards } from "./components/SettlementStatsCards";
import { SettlementFilters } from "./components/SettlementFilters";
import { SettlementsTable } from "./components/SettlementsTable";
import { GenerateSettlementModal } from "./components/GenerateSettlementModal";
import { SettlementDetailsModal } from "./components/SettlementDetailsModal";
import { Settlement } from "@/features/settlements/types";

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, color = "indigo", suffix = "", isLoading = false }: any) => {
  const colors = {
    indigo: "from-indigo-500 to-purple-600",
    emerald: "from-emerald-500 to-teal-600",
    amber: "from-amber-500 to-orange-600",
    rose: "from-rose-500 to-pink-600",
    sky: "from-sky-500 to-blue-600",
  };
  
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
          {isLoading ? (
            <div className="mt-2 h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          ) : (
            <div className="mt-2 flex items-baseline gap-1">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{typeof value === 'number' ? value.toLocaleString() : value}</p>
              {suffix && <span className="text-xs text-slate-500 dark:text-slate-400">{suffix}</span>}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colors[color as keyof typeof colors]} shadow-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
};

export default function SettlementsPage() {

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [page, setPage] = useState(1);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSettlementId, setSelectedSettlementId] = useState<string | null>(null);

  // Query params
  const queryParams = useMemo(() => {
    const params: {
      status?: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
      startDate?: string;
      endDate?: string;
      page: number;
      limit: number;
    } = {
      page,
      limit: 20,
    };

    if (statusFilter) {
      params.status = statusFilter as "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
    }
    if (dateRange.start) {
      params.startDate = new Date(dateRange.start).toISOString();
    }
    if (dateRange.end) {
      params.endDate = new Date(dateRange.end + "T23:59:59").toISOString();
    }

    return params;
  }, [statusFilter, dateRange, page]);

  // Fetch settlements
  const {
    data: settlementsData,
    isLoading: settlementsLoading,
  } = useListSettlements(queryParams, true);

  // Selected settlement details
  const {
    data: settlementDetails,
    isLoading: detailsLoading,
  } = useSettlementDetails(selectedSettlementId);

  // Mutations
  const generateMutation = useGenerateSettlement();
  const statementMutation = useSettlementStatement(selectedSettlementId);

  // Filter settlements by search query
  const filteredSettlements = useMemo(() => {
    if (!settlementsData?.settlements) return [];
    if (!searchQuery) return settlementsData.settlements;

    const query = searchQuery.toLowerCase();
    return settlementsData.settlements.filter(
      (s) => s.id.toLowerCase().includes(query)
    );
  }, [settlementsData?.settlements, searchQuery]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!settlementsData?.settlements) {
      return { pending: 0, processing: 0, completed: 0, totalNet: 0 };
    }

    const settlements = settlementsData.settlements;
    return {
      pending: settlements.filter((s) => s.status === "PENDING").length,
      processing: settlements.filter((s) => s.status === "PROCESSING").length,
      completed: settlements.filter((s) => s.status === "COMPLETED").length,
      totalNet: settlements.reduce(
        (sum, s) => sum + parseFloat(s.netAmount),
        0
      ),
    };
  }, [settlementsData?.settlements]);

  // Handlers
  const handleGenerate = async (data: { periodStart: string; periodEnd: string }) => {
    try {
      await generateMutation.mutateAsync(data);
      setShowGenerateModal(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleRowClick = (settlement: Settlement) => {
    setSelectedSettlementId(settlement.id);
    setShowDetailsModal(true);
  };

  const handleDownloadStatement = async () => {
    if (selectedSettlementId) {
      await statementMutation.mutateAsync();
    }
  };

  const totalPages = settlementsData?.pagination
    ? Math.ceil(settlementsData.pagination.total / 20)
    : 1;
  const startIndex = (page - 1) * 20;
  const endIndex = Math.min(startIndex + 20, settlementsData?.pagination?.total || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-[1400px] mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-white via-white to-indigo-50/50 dark:from-slate-800/80 dark:via-slate-800/60 dark:to-indigo-950/30 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-6 shadow-lg">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                  <Receipt className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                    Settlements
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                    Track your settlement periods and bank transfers
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="group px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 shadow-md"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
              Generate Settlement
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Wallet} label="Total Net" value={stats.totalNet} suffix="XAF" color="indigo" isLoading={settlementsLoading} />
          <StatCard icon={CheckCircle} label="Completed" value={stats.completed} color="emerald" isLoading={settlementsLoading} />
          <StatCard icon={Clock} label="Processing" value={stats.processing} color="amber" isLoading={settlementsLoading} />
          <StatCard icon={AlertCircle} label="Pending" value={stats.pending} color="rose" isLoading={settlementsLoading} />
        </div>

        {/* Filters Section */}
        <div className="rounded-2xl bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative group flex-1 lg:flex-none">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search by settlement ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-80 pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all cursor-pointer"
                >
                  <option value="">All Status</option>
                  <option value="PENDING">⏳ Pending</option>
                  <option value="PROCESSING">🔄 Processing</option>
                  <option value="COMPLETED">✓ Completed</option>
                  <option value="FAILED">✗ Failed</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  placeholder="Start Date"
                />
                <span className="text-slate-400">—</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  placeholder="End Date"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table Component */}
        <div className="rounded-2xl bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md">
          <SettlementsTable
            settlements={filteredSettlements}
            isLoading={settlementsLoading}
            onRowClick={handleRowClick}
            onDownloadStatement={handleDownloadStatement}
          />
        </div>

        {/* Pagination */}
        {settlementsData?.pagination && settlementsData.pagination.total > 0 && (
          <div className="rounded-2xl bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Showing {startIndex + 1} - {endIndex} of {settlementsData.pagination.total} settlements
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                </button>
                <div className="flex gap-1.5">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`min-w-[36px] h-9 rounded-xl text-sm font-semibold transition-all duration-200 ${
                          page === pageNum
                            ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Generate Settlement Modal */}
      <GenerateSettlementModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        onGenerate={handleGenerate}
        isLoading={generateMutation.isPending}
      />

      {/* Settlement Details Modal */}
      <SettlementDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedSettlementId(null);
        }}
        settlementDetails={settlementDetails || null}
        onDownloadStatement={handleDownloadStatement}
        isLoading={detailsLoading}
      />
    </div>
  );
}