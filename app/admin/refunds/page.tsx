"use client";

import { useState, useMemo } from "react";
import {
  useAllRefunds,
  useAdminRefundDetails,
} from "@/features/refunds/queries";
import { AdminRefundStatsCards } from "./components/AdminRefundStatsCards";
import { AdminRefundFilters } from "./components/AdminRefundFilters";
import { AdminRefundsTable } from "./components/AdminRefundsTable";
import { RefundDetailsModal } from "@/app/dashboard/refunds/components/RefundDetailsModal";
import { Refund } from "@/features/refunds/types";

export default function AdminRefundsPage() {
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [environmentFilter, setEnvironmentFilter] = useState("");
  const [merchantFilter, setMerchantFilter] = useState("");
  const [page, setPage] = useState(1);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRefundId, setSelectedRefundId] = useState<string | null>(null);

  // Query params
  const queryParams = useMemo(() => {
    const params: {
      merchantId?: string;
      environment?: "sandbox" | "production";
      status?: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED";
      page: number;
      limit: number;
    } = {
      page,
      limit: 20,
    };

    if (merchantFilter) {
      params.merchantId = merchantFilter;
    }
    if (environmentFilter) {
      params.environment = environmentFilter as "sandbox" | "production";
    }
    if (statusFilter) {
      params.status = statusFilter as "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED";
    }

    return params;
  }, [merchantFilter, statusFilter, environmentFilter, page]);

  // Fetch refunds
  const {
    data: refundsData,
    isLoading: refundsLoading,
  } = useAllRefunds(queryParams, true);

  // Selected refund details
  const {
    data: refundDetails,
    isLoading: detailsLoading,
  } = useAdminRefundDetails(selectedRefundId);

  // Filter refunds by search query
  const filteredRefunds = useMemo(() => {
    if (!refundsData?.refunds) return [];
    if (!searchQuery) return refundsData.refunds;

    const query = searchQuery.toLowerCase();
    return refundsData.refunds.filter(
      (r) =>
        r.id.toLowerCase().includes(query) ||
        r.transaction.id.toLowerCase().includes(query) ||
        r.merchant?.name.toLowerCase().includes(query) ||
        r.merchant?.businessName.toLowerCase().includes(query) ||
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
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Refunds</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Monitor all refunds across all merchants
          </p>
        </div>
      </div>

      {/* STATS CARDS */}
      <AdminRefundStatsCards
        total={stats.total}
        successful={stats.successful}
        pending={stats.pending}
        failed={stats.failed}
        isLoading={refundsLoading}
      />

      {/* FILTERS & SEARCH */}
      <AdminRefundFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        environment={environmentFilter}
        onEnvironmentChange={setEnvironmentFilter}
        merchantId={merchantFilter}
        onMerchantChange={setMerchantFilter}
      />

      {/* TABLE */}
      <AdminRefundsTable
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
