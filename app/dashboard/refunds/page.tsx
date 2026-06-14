"use client";

import { useState, useMemo } from "react";
import { Plus, Download, Receipt, TrendingUp, Shield, Clock } from "lucide-react";
import { useUserMerchantData } from "@/features/merchants/context/MerchantContext";
import {
  useMerchantRefunds,
  useMerchantRefundDetails,
} from "@/features/refunds/queries";
import { RefundStatsCards } from "./components/RefundStatsCards";
import { RefundFilters } from "./components/RefundFilters";
import { RefundsTable } from "./components/RefundsTable";
import { RefundDetailsModal } from "./components/RefundDetailsModal";
import { Refund } from "@/features/refunds/types";

export default function RefundsPage() {
  const { merchantId } = useUserMerchantData();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [environmentFilter, setEnvironmentFilter] = useState("");
  const [page, setPage] = useState(1);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRefundId, setSelectedRefundId] = useState<string | null>(null);

  // Query params
  const queryParams = useMemo(() => {
    const params: {
      environment?: "sandbox" | "production";
      status?: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED";
      page: number;
      limit: number;
    } = {
      page,
      limit: 20,
    };

    if (environmentFilter) {
      params.environment = environmentFilter as "sandbox" | "production";
    }
    if (statusFilter) {
      params.status = statusFilter as "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED";
    }

    return params;
  }, [statusFilter, environmentFilter, page]);

  // Fetch refunds
  const {
    data: refundsData,
    isLoading: refundsLoading,
  } = useMerchantRefunds(merchantId, queryParams, !!merchantId);

  // Selected refund details
  const {
    data: refundDetails,
    isLoading: detailsLoading,
  } = useMerchantRefundDetails(merchantId, selectedRefundId);

  // Filter refunds by search query
  const filteredRefunds = useMemo(() => {
    if (!refundsData?.refunds) return [];
    if (!searchQuery) return refundsData.refunds;

    const query = searchQuery.toLowerCase();
    return refundsData.refunds.filter(
      (r) =>
        r.id.toLowerCase().includes(query) ||
        r.transaction.id.toLowerCase().includes(query) ||
        (r.customer.msisdn?.toLowerCase().includes(query) ?? false)
    );
  }, [refundsData?.refunds, searchQuery]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!refundsData?.refunds) {
      return { total: 0, successful: 0, pending: 0, failed: 0 };
    }

    const refunds = refundsData.refunds;
    return {
      total: refunds.reduce((sum, r) => sum + parseFloat(r.amount), 0),
      successful: refunds.filter((r) => r.status === "SUCCESS").length,
      pending: refunds.filter((r) => r.status === "PENDING" || r.status === "PROCESSING").length,
      failed: refunds.filter((r) => r.status === "FAILED").length,
    };
  }, [refundsData?.refunds]);

  // Handlers
  const handleRowClick = (refund: Refund) => {
    setSelectedRefundId(refund.id);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedRefundId(null);
  };

  const totalPages = refundsData?.pagination
    ? Math.ceil(refundsData.pagination.total / refundsData.pagination.limit)
    : 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-[1400px] mx-auto p-6 space-y-6">
        {/* HEADER & ACTIONS - Premium Header */}
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
                    Refunds
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                    Process refunds for customer payments
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="group px-5 py-2.5 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-600 hover:border-slate-300 transition-all duration-200 flex items-center gap-2 shadow-sm">
                <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform duration-200" />
                Export
              </button>
              <button
                className="group px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 shadow-md opacity-50 cursor-not-allowed"
                disabled
              >
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                New Refund
              </button>
            </div>
          </div>
        </div>

        {/* STATS CARDS */}
        <RefundStatsCards
          total={stats.total}
          successful={stats.successful}
          pending={stats.pending}
          failed={stats.failed}
          isLoading={refundsLoading}
        />

        {/* FILTERS & SEARCH */}
        <RefundFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          status={statusFilter}
          onStatusChange={setStatusFilter}
          environment={environmentFilter}
          onEnvironmentChange={setEnvironmentFilter}
        />

        {/* TABLE */}
        <RefundsTable
          refunds={filteredRefunds}
          isLoading={refundsLoading}
          onRowClick={handleRowClick}
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />

        {/* REFUND DETAILS MODAL */}
        <RefundDetailsModal
          refund={refundDetails?.refund || null}
          isOpen={showDetailsModal}
          onClose={handleCloseDetails}
        />
      </div>
    </div>
  );
}