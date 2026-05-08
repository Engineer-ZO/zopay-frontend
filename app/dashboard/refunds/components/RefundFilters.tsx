"use client";

import { Search } from "lucide-react";

interface RefundFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  environment: string;
  onEnvironmentChange: (value: string) => void;
}

export function RefundFilters({
  searchQuery,
  onSearchChange,
  status,
  onStatusChange,
  environment,
  onEnvironmentChange,
}: RefundFiltersProps) {
  return (
    <div className="bg-background rounded-lg p-3 border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
        <div className="relative flex-1 md:min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search ID..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-background border border-border rounded-md text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500 transition-shadow"
          />
        </div>
        <select
          value={environment}
          onChange={(e) => onEnvironmentChange(e.target.value)}
          className="px-3 py-1.5 bg-background border border-border rounded-md text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 transition-shadow"
        >
          <option value="">All Environments</option>
          <option value="sandbox">Sandbox</option>
          <option value="production">Production</option>
        </select>
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-3 py-1.5 bg-background border border-border rounded-md text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 transition-shadow"
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="SUCCESS">Success</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>
    </div>
  );
}
