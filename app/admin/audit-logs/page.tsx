"use client";

import { useState, useMemo } from "react";
import { Download } from "lucide-react";
import {
  useAuditLogs,
  useAuditLogFilterOptions,
} from "@/features/audit-logs/queries";
import { AuditLogFilters } from "./components/AuditLogFilters";
import { AuditLogsTable } from "./components/AuditLogsTable";
import type { ActorType, SortBy, SortOrder } from "@/features/audit-logs/types";

export default function AuditLogsPage() {
  // State
  const [filters, setFilters] = useState<{
    actorType?: ActorType;
    action?: string;
    entityType?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }>({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortBy, setSortBy] = useState<SortBy>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Fetch filter options
  const { data: filterOptionsData } = useAuditLogFilterOptions(true);

  // Query params
  const queryParams = useMemo(() => {
    const params: {
      actorType?: ActorType;
      action?: string;
      entityType?: string;
      startDate?: string;
      endDate?: string;
      search?: string;
      page: number;
      limit: number;
      sortBy: SortBy;
      sortOrder: SortOrder;
    } = {
      page,
      limit,
      sortBy,
      sortOrder,
    };

    if (filters.actorType) params.actorType = filters.actorType;
    if (filters.action) params.action = filters.action;
    if (filters.entityType) params.entityType = filters.entityType;
    if (filters.startDate) params.startDate = new Date(filters.startDate).toISOString();
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      params.endDate = endDate.toISOString();
    }
    if (filters.search) params.search = filters.search;

    return params;
  }, [filters, page, limit, sortBy, sortOrder]);

  // Fetch audit logs
  const {
    data: auditLogsData,
    isLoading: isLoadingLogs,
  } = useAuditLogs(queryParams, true);

  // Handlers
  const handleFilterChange = (key: string, value: string | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setFilters({});
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleExport = () => {
    // TODO: Implement CSV export
    alert("Export functionality coming soon!");
  };

  const totalPages = auditLogsData?.pagination?.totalPages || 1;
  const totalLogs = auditLogsData?.pagination?.total || 0;

  return (
    <div className="p-6 space-y-5">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Audit Logs</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track all system actions and changes
          </p>
        </div>
        <button
          onClick={handleExport}
          className="px-3 py-1.5 bg-background border border-border text-foreground rounded-md text-[10px] font-semibold hover:bg-muted transition-colors flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>
      </div>

      {/* FILTERS */}
      <AuditLogFilters
        filters={filters}
        filterOptions={filterOptionsData?.data}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        isLoading={isLoadingLogs}
      />

      {/* RESULTS COUNT */}
      {!isLoadingLogs && auditLogsData && (
        <div className="text-xs text-muted-foreground">
          Showing {((page - 1) * limit) + 1}-{Math.min(page * limit, totalLogs)} of {totalLogs} logs
        </div>
      )}

      {/* TABLE */}
      <AuditLogsTable
        logs={auditLogsData?.data || []}
        isLoading={isLoadingLogs}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        currentLimit={limit}
      />
    </div>
  );
}
