"use client";

import { CheckCircle2, Clock, XCircle, FileText, Eye, Building2 } from "lucide-react";
import { Settlement } from "@/features/settlements/types";

interface AdminSettlement extends Settlement {
  merchantName?: string;
  merchantBusinessName?: string;
}

interface AdminSettlementsTableProps {
  settlements: AdminSettlement[];
  isLoading?: boolean;
  onRowClick: (settlement: AdminSettlement) => void;
  onDownloadStatement?: (settlement: AdminSettlement) => void;
}

export function AdminSettlementsTable({
  settlements,
  isLoading = false,
  onRowClick,
  onDownloadStatement,
}: AdminSettlementsTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-700";
      case "PENDING":
        return "bg-orange-100 text-orange-700";
      case "PROCESSING":
        return "bg-blue-100 text-blue-700";
      case "FAILED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatPeriod = (start: string, end: string) => {
    try {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const startFormatted = startDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const endFormatted = endDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      return `${startFormatted} - ${endFormatted}`;
    } catch {
      return `${start} - ${end}`;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (settlements.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-sm font-semibold text-gray-900 mb-2">
          No settlements found
        </h3>
        <p className="text-xs text-gray-600">
          No settlements match your filters
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                Merchant
              </th>
              <th className="px-4 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                Period
              </th>
              <th className="px-4 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                Net Amount
              </th>
              <th className="px-4 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                Bank Ref
              </th>
              <th className="px-4 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {settlements.map((settlement) => (
              <tr
                key={settlement.id}
                className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                onClick={() => onRowClick(settlement)}
              >
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs font-semibold text-gray-900">
                        {settlement.merchantBusinessName || settlement.merchantName || "Unknown"}
                      </p>
                      <p className="text-[10px] text-gray-500 font-mono">
                        {settlement.merchantId.substring(0, 8)}...
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-xs font-medium text-gray-600">
                  {formatPeriod(settlement.periodStart, settlement.periodEnd)}
                </td>
                <td className="px-4 py-2.5 text-xs font-semibold text-blue-600">
                  {parseFloat(settlement.netAmount).toLocaleString()} FCFA
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(
                      settlement.status
                    )}`}
                  >
                    {settlement.status === "COMPLETED" && (
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                    )}
                    {settlement.status === "PENDING" && (
                      <Clock className="w-3 h-3 mr-1" />
                    )}
                    {settlement.status === "FAILED" && (
                      <XCircle className="w-3 h-3 mr-1" />
                    )}
                    {settlement.status}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-xs text-gray-600 font-mono">
                  {settlement.bankTransferReference || "-"}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {settlement.status === "COMPLETED" && settlement.statementUrl && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownloadStatement?.(settlement);
                        }}
                        className="px-2 py-1 text-xs font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded transition-colors flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        PDF
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRowClick(settlement);
                      }}
                      className="px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
