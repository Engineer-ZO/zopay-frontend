"use client";

import { DollarSign, CheckCircle2, Clock, XCircle } from "lucide-react";

interface AdminRefundStatsCardsProps {
  total: number;
  successful: number;
  pending: number;
  failed: number;
  isLoading?: boolean;
}

export function AdminRefundStatsCards({
  total,
  successful,
  pending,
  failed,
  isLoading = false,
}: AdminRefundStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-background rounded-xl p-4 border border-border animate-pulse"
          >
            <div className="h-4 bg-muted rounded w-20 mb-2" />
            <div className="h-6 bg-muted rounded w-24" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
          <DollarSign className="w-3 h-3" />
          TOTAL
        </p>
        <p className="text-xl font-bold text-foreground">
          {total.toLocaleString()} FCFA
        </p>
      </div>
      <div className="bg-green-50 dark:bg-green-900/10 rounded-xl p-4 border border-green-200 dark:border-green-800">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          SUCCESSFUL
        </p>
        <p className="text-xl font-bold text-foreground">{successful}</p>
      </div>
      <div className="bg-orange-50 dark:bg-orange-900/10 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          PENDING
        </p>
        <p className="text-xl font-bold text-foreground">{pending}</p>
      </div>
      <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-4 border border-red-200 dark:border-red-800">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          FAILED
        </p>
        <p className="text-xl font-bold text-foreground">{failed}</p>
      </div>
    </div>
  );
}
