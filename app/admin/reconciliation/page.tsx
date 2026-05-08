"use client";

import { useState, useMemo } from "react";
import {
  FileSearch,
  Search,
  Filter,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  useReconciliationQueue,
  useLinkTransaction,
  useMarkResolved,
  useReconcileFile,
} from "@/features/settlements/queries";
import { ReconciliationQueueTable } from "./components/ReconciliationQueueTable";
import { LinkTransactionModal } from "./components/LinkTransactionModal";
import { MarkResolvedModal } from "./components/MarkResolvedModal";

export default function ReconciliationPage() {
  const [filters, setFilters] = useState({
    gateway: "",
    matchStatus: "",
    resolved: "",
    page: 1,
    limit: 50,
  });
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);

  // Convert filter values to proper types
  const queryParams = useMemo(() => {
    const params: {
      gateway?: "MTN_MOMO" | "ORANGE_MONEY";
      matchStatus?: "MISSING_IN_ZITOPAY" | "MISSING_IN_GATEWAY" | "AMOUNT_MISMATCH";
      resolved?: boolean;
      page: number;
      limit: number;
    } = {
      page: filters.page,
      limit: filters.limit,
    };

    if (filters.gateway) {
      if (filters.gateway === "MTN_MOMO" || filters.gateway === "ORANGE_MONEY") {
        params.gateway = filters.gateway;
      }
    }

    if (filters.matchStatus) {
      if (
        filters.matchStatus === "MISSING_IN_ZITOPAY" ||
        filters.matchStatus === "MISSING_IN_GATEWAY" ||
        filters.matchStatus === "AMOUNT_MISMATCH"
      ) {
        params.matchStatus = filters.matchStatus;
      }
    }

    if (filters.resolved !== "") {
      params.resolved = filters.resolved === "true";
    }

    return params;
  }, [filters]);

  const { data, isLoading } = useReconciliationQueue(queryParams);
  const linkMutation = useLinkTransaction();
  const resolveMutation = useMarkResolved();

  const handleLink = async (data: { transactionId: string; notes?: string }) => {
    if (!selectedItemId) return;
    try {
      await linkMutation.mutateAsync({
        queueItemId: selectedItemId,
        data,
      });
      setShowLinkModal(false);
      setSelectedItemId(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleResolve = async (data: { notes: string }) => {
    if (!selectedItemId) return;
    try {
      await resolveMutation.mutateAsync({
        queueItemId: selectedItemId,
        data,
      });
      setShowResolveModal(false);
      setSelectedItemId(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const unresolvedCount = data?.items.filter((item) => !item.resolved).length || 0;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileSearch className="w-6 h-6 text-blue-600" />
            Reconciliation Management
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage unmatched transactions and gateway reconciliation
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-600" />
          <div>
            <p className="text-sm font-semibold text-orange-900">
              {unresolvedCount} Unresolved Items
            </p>
            <p className="text-xs text-orange-700">
              Requiring manual review and resolution
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by reference..."
              className="pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-48"
            />
          </div>

          <select
            value={filters.gateway}
            onChange={(e) =>
              setFilters({ ...filters, gateway: e.target.value, page: 1 })
            }
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Gateways</option>
            <option value="MTN_MOMO">MTN MoMo</option>
            <option value="ORANGE_MONEY">Orange Money</option>
          </select>

          <select
            value={filters.matchStatus}
            onChange={(e) =>
              setFilters({ ...filters, matchStatus: e.target.value, page: 1 })
            }
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="MISSING_IN_ZITOPAY">Missing in Zitopay</option>
            <option value="MISSING_IN_GATEWAY">Missing in Gateway</option>
            <option value="AMOUNT_MISMATCH">Amount Mismatch</option>
          </select>

          <select
            value={filters.resolved}
            onChange={(e) =>
              setFilters({ ...filters, resolved: e.target.value, page: 1 })
            }
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Items</option>
            <option value="false">Unresolved Only</option>
            <option value="true">Resolved Only</option>
          </select>
        </div>
      </div>

      {/* Queue Table */}
      <ReconciliationQueueTable
        items={data?.items || []}
        isLoading={isLoading}
        onLink={(itemId) => {
          setSelectedItemId(itemId);
          setShowLinkModal(true);
        }}
        onResolve={(itemId) => {
          setSelectedItemId(itemId);
          setShowResolveModal(true);
        }}
      />

      {/* Pagination */}
      {data?.pagination && data.pagination.total > 0 && (
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div>
            Showing {(filters.page - 1) * filters.limit + 1} -{" "}
            {Math.min(filters.page * filters.limit, data.pagination.total)} of{" "}
            {data.pagination.total}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setFilters({ ...filters, page: Math.max(1, filters.page - 1) })
              }
              disabled={filters.page === 1}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span>
              Page {filters.page} of{" "}
              {Math.ceil(data.pagination.total / filters.limit)}
            </span>
            <button
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              disabled={filters.page * filters.limit >= data.pagination.total}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <LinkTransactionModal
        isOpen={showLinkModal}
        onClose={() => {
          setShowLinkModal(false);
          setSelectedItemId(null);
        }}
        onLink={handleLink}
        isLoading={linkMutation.isPending}
      />

      <MarkResolvedModal
        isOpen={showResolveModal}
        onClose={() => {
          setShowResolveModal(false);
          setSelectedItemId(null);
        }}
        onResolve={handleResolve}
        isLoading={resolveMutation.isPending}
      />
    </div>
  );
}
