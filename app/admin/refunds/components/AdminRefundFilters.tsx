"use client";

import { Search, Download } from "lucide-react";

interface AdminRefundFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  environment: string;
  onEnvironmentChange: (value: string) => void;
  merchantId: string;
  onMerchantChange: (value: string) => void;
  onExport?: () => void;
}

export function AdminRefundFilters({
  searchQuery,
  onSearchChange,
  status,
  onStatusChange,
  environment,
  onEnvironmentChange,
  merchantId,
  onMerchantChange,
  onExport,
}: AdminRefundFiltersProps) {
  return (
    <div className="bg-background rounded-xl p-4 border border-border space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search refunds by ID, transaction ID, merchant..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-sm text-foreground"
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Merchant ID"
          value={merchantId}
          onChange={(e) => onMerchantChange(e.target.value)}
          className="px-3 py-2 bg-background border border-border rounded-lg text-xs font-medium"
        />
        <select
          value={environment}
          onChange={(e) => onEnvironmentChange(e.target.value)}
          className="px-3 py-2 bg-background border border-border rounded-lg text-xs font-medium"
        >
          <option value="">All Environments</option>
          <option value="sandbox">Sandbox</option>
          <option value="production">Production</option>
        </select>
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-3 py-2 bg-background border border-border rounded-lg text-xs font-medium"
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="SUCCESS">Success</option>
          <option value="FAILED">Failed</option>
        </select>
        {onExport && (
          <button
            onClick={onExport}
            className="ml-auto px-3 py-2 bg-background border border-border rounded-lg text-xs font-semibold hover:bg-muted transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        )}
      </div>
    </div>
  );
}
