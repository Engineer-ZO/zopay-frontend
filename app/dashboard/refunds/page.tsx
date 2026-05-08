"use client";

import { useState, useMemo } from "react";
import { Plus, Download } from "lucide-react";
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
    <div className="space-y-4 p-4">
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Refunds</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Process refunds for customer payments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 bg-background border border-border text-foreground rounded-md text-xs font-semibold hover:bg-muted transition-colors flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
          <button
            className="px-3 py-1.5 bg-orange-500 text-white rounded-md text-xs font-semibold hover:bg-orange-600 transition-colors flex items-center gap-1.5 opacity-50 cursor-not-allowed"
            disabled
          >
            <Plus className="w-3.5 h-3.5" />
            New Refund
          </button>
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
  );
}
