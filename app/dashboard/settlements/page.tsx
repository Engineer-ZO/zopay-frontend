"use client";

import { useState, useMemo } from "react";
import { Plus, Download } from "lucide-react";
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

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Settlements</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track your settlement periods and bank transfers
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowGenerateModal(true)}
            className="px-3 py-1.5 bg-orange-500 text-white rounded-md text-xs font-semibold hover:bg-orange-600 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Generate Settlement
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <SettlementStatsCards
        pending={stats.pending}
        processing={stats.processing}
        completed={stats.completed}
        totalNet={stats.totalNet}
        isLoading={settlementsLoading}
      />

      {/* Filters */}
      <SettlementFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      {/* Table */}
      <SettlementsTable
        settlements={filteredSettlements}
        isLoading={settlementsLoading}
        onRowClick={handleRowClick}
        onDownloadStatement={handleDownloadStatement}
      />

      {/* Pagination */}
      {settlementsData?.pagination && settlementsData.pagination.total > 0 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div>
            Showing {(page - 1) * 20 + 1} -{" "}
            {Math.min(page * 20, settlementsData.pagination.total)} of{" "}
            {settlementsData.pagination.total}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span>
              Page {page} of {Math.ceil(settlementsData.pagination.total / 20)}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page * 20 >= settlementsData.pagination.total}
              className="px-3 py-1 border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

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
