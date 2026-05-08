"use client";

import { useState, useMemo } from "react";
import { Landmark, CheckCircle2 } from "lucide-react";
import {
  useListAllSettlements,
  useAdminSettlementDetails,
  useCompleteSettlement,
} from "@/features/settlements/queries";
import { AdminSettlementStatsCards } from "./components/AdminSettlementStatsCards";
import { AdminSettlementFilters } from "./components/AdminSettlementFilters";
import { AdminSettlementsTable } from "./components/AdminSettlementsTable";
import { CompleteSettlementModal } from "./components/CompleteSettlementModal";
import { SettlementDetailsModal } from "@/app/dashboard/settlements/components/SettlementDetailsModal";
import { Settlement } from "@/features/settlements/types";

interface AdminSettlement extends Settlement {
  merchantName?: string;
  merchantBusinessName?: string;
}

export default function AdminSettlementsPage() {
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [merchantFilter, setMerchantFilter] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [page, setPage] = useState(1);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSettlementId, setSelectedSettlementId] = useState<string | null>(null);

  // Query params
  const queryParams = useMemo(() => {
    const params: {
      merchantId?: string;
      status?: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
      startDate?: string;
      endDate?: string;
      page: number;
      limit: number;
    } = {
      page,
      limit: 20,
    };

    if (merchantFilter) {
      params.merchantId = merchantFilter;
    }
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
  }, [merchantFilter, statusFilter, dateRange, page]);

  // Fetch settlements
  const {
    data: settlementsData,
    isLoading: settlementsLoading,
  } = useListAllSettlements(queryParams, true);

  // Selected settlement details
  const {
    data: settlementDetails,
    isLoading: detailsLoading,
  } = useAdminSettlementDetails(selectedSettlementId);

  // Mutations
  const completeMutation = useCompleteSettlement();

  // Filter settlements by search query
  const filteredSettlements = useMemo(() => {
    if (!settlementsData?.settlements) return [];
    if (!searchQuery) return settlementsData.settlements as AdminSettlement[];

    const query = searchQuery.toLowerCase();
    return (settlementsData.settlements as AdminSettlement[]).filter(
      (s) =>
        s.id.toLowerCase().includes(query) ||
        s.merchantName?.toLowerCase().includes(query) ||
        s.merchantBusinessName?.toLowerCase().includes(query)
    );
  }, [settlementsData?.settlements, searchQuery]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!settlementsData?.settlements) {
      return { pending: 0, processing: 0, completed: 0, totalNet: 0 };
    }

    const settlements = settlementsData.settlements as AdminSettlement[];
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

  // Extract unique merchants for filter dropdown
  const merchants = useMemo(() => {
    if (!settlementsData?.settlements) return [];
    const merchantMap = new Map<string, { id: string; businessName: string }>();
    (settlementsData.settlements as AdminSettlement[]).forEach((s) => {
      if (s.merchantId && !merchantMap.has(s.merchantId)) {
        merchantMap.set(s.merchantId, {
          id: s.merchantId,
          businessName: s.merchantBusinessName || s.merchantName || "Unknown",
        });
      }
    });
    return Array.from(merchantMap.values());
  }, [settlementsData?.settlements]);

  // Handlers
  const handleRowClick = (settlement: AdminSettlement) => {
    setSelectedSettlementId(settlement.id);
    setShowDetailsModal(true);
  };

  const handleComplete = async (data: { bankTransferReference?: string }) => {
    if (!selectedSettlementId) return;

    try {
      await completeMutation.mutateAsync({
        id: selectedSettlementId,
        data,
      });
      setShowCompleteModal(false);
      setSelectedSettlementId(null);
      setShowDetailsModal(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Landmark className="w-6 h-6 text-blue-600" />
            Settlements Management
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage and complete merchant settlements across all merchants
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <AdminSettlementStatsCards
        pending={stats.pending}
        processing={stats.processing}
        completed={stats.completed}
        totalNet={stats.totalNet}
        isLoading={settlementsLoading}
      />

      {/* Filters */}
      <AdminSettlementFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        merchantFilter={merchantFilter}
        onMerchantChange={setMerchantFilter}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        merchants={merchants}
      />

      {/* Table */}
      <AdminSettlementsTable
        settlements={filteredSettlements}
        isLoading={settlementsLoading}
        onRowClick={handleRowClick}
      />

      {/* Pagination */}
      {settlementsData?.pagination && settlementsData.pagination.total > 0 && (
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div>
            Showing {(page - 1) * 20 + 1} -{" "}
            {Math.min(page * 20, settlementsData.pagination.total)} of{" "}
            {settlementsData.pagination.total}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span>
              Page {page} of {Math.ceil(settlementsData.pagination.total / 20)}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page * 20 >= settlementsData.pagination.total}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Complete Settlement Modal */}
      <CompleteSettlementModal
        isOpen={showCompleteModal}
        onClose={() => {
          setShowCompleteModal(false);
          setSelectedSettlementId(null);
        }}
        settlementId={selectedSettlementId}
        onComplete={handleComplete}
        isLoading={completeMutation.isPending}
      />

      {/* Settlement Details Modal - Reuse from merchant page with admin actions */}
      <SettlementDetailsModal
        isOpen={showDetailsModal && !showCompleteModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedSettlementId(null);
        }}
        settlementDetails={settlementDetails || null}
        isLoading={detailsLoading}
        onComplete={() => {
          setShowDetailsModal(false);
          setShowCompleteModal(true);
        }}
      />
    </div>
  );
}
