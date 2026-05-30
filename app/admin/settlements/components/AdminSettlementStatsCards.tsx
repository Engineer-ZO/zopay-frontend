"use client";

import { Clock, CheckCircle2, AlertCircle, Wallet } from "lucide-react";

interface AdminSettlementStatsCardsProps {
  pending: number;
  processing: number;
  completed: number;
  totalNet?: number;
  isLoading?: boolean;
}

export function AdminSettlementStatsCards({
  pending,
  processing,
  completed,
  totalNet,
  isLoading = false,
}: AdminSettlementStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
            <div className="h-6 bg-gray-200 rounded w-24" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="p-1.5 rounded-lg bg-crimson-red-50">
            <Clock className="w-4 h-4 text-crimson-red-600" />
          </div>
          <span className="text-xs font-medium text-gray-500">Pending</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-gray-900">{pending}</span>
        </div>
      </div>
      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="p-1.5 rounded-lg bg-deep-blue-violet-50">
            <AlertCircle className="w-4 h-4 text-deep-blue-violet-600" />
          </div>
          <span className="text-xs font-medium text-gray-500">Processing</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-gray-900">{processing}</span>
        </div>
      </div>
      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="p-1.5 rounded-lg bg-green-50">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <span className="text-xs font-medium text-gray-500">Completed</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-gray-900">{completed}</span>
        </div>
      </div>
      {totalNet !== undefined && (
        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-1.5 rounded-lg bg-deep-blue-violet-50">
              <Wallet className="w-4 h-4 text-deep-blue-violet-600" />
            </div>
            <span className="text-xs font-medium text-gray-500">Total Net</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">
              {totalNet.toLocaleString()}
            </span>
            <span className="text-[10px] font-medium text-gray-500">FCFA</span>
          </div>
        </div>
      )}
    </div>
  );
}
