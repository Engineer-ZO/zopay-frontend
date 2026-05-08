"use client";

import { Search, Filter, X } from "lucide-react";
import { FilterOptions } from "@/features/audit-logs/types";

interface AuditLogFiltersProps {
  filters: {
    actorType?: string;
    action?: string;
    entityType?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  };
  filterOptions: FilterOptions | undefined;
  onFilterChange: (key: string, value: string | undefined) => void;
  onClearFilters: () => void;
  isLoading?: boolean;
}

export function AuditLogFilters({
  filters,
  filterOptions,
  onFilterChange,
  onClearFilters,
  isLoading = false,
}: AuditLogFiltersProps) {
  const hasActiveFilters = 
    filters.actorType || 
    filters.action || 
    filters.entityType || 
    filters.startDate || 
    filters.endDate || 
    filters.search;

  return (
    <div className="bg-background rounded-lg p-4 border border-border space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-xs text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Actor Type */}
        <div>
          <label className="text-xs font-medium text-foreground mb-1.5 block">
            Actor Type
          </label>
          <select
            value={filters.actorType || ""}
            onChange={(e) => onFilterChange("actorType", e.target.value || undefined)}
            disabled={isLoading}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All Actors</option>
            {filterOptions?.actorTypes?.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Action */}
        <div>
          <label className="text-xs font-medium text-foreground mb-1.5 block">
            Action
          </label>
          <select
            value={filters.action || ""}
            onChange={(e) => onFilterChange("action", e.target.value || undefined)}
            disabled={isLoading}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All Actions</option>
            {filterOptions?.actions?.map((action) => (
              <option key={action} value={action}>
                {action.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        {/* Entity Type */}
        <div>
          <label className="text-xs font-medium text-foreground mb-1.5 block">
            Entity Type
          </label>
          <select
            value={filters.entityType || ""}
            onChange={(e) => onFilterChange("entityType", e.target.value || undefined)}
            disabled={isLoading}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All Entities</option>
            {filterOptions?.entityTypes?.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div>
          <label className="text-xs font-medium text-foreground mb-1.5 block">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search actions..."
              value={filters.search || ""}
              onChange={(e) => onFilterChange("search", e.target.value || undefined)}
              disabled={isLoading}
              className="w-full pl-8 pr-3 py-2 bg-background border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-foreground mb-1.5 block">
            Start Date
          </label>
          <input
            type="date"
            value={filters.startDate || ""}
            onChange={(e) => onFilterChange("startDate", e.target.value || undefined)}
            disabled={isLoading}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-foreground mb-1.5 block">
            End Date
          </label>
          <input
            type="date"
            value={filters.endDate || ""}
            onChange={(e) => onFilterChange("endDate", e.target.value || undefined)}
            disabled={isLoading}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>
    </div>
  );
}
