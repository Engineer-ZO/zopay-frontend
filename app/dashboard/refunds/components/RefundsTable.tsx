"use client";

import { CheckCircle2, Clock, XCircle, Eye } from "lucide-react";
import { Refund } from "@/features/refunds/types";
import { useUserMerchantData } from "@/features/merchants/context/MerchantContext";

interface RefundsTableProps {
  refunds: Refund[];
  isLoading?: boolean;
  onRowClick: (refund: Refund) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function RefundsTable({
  refunds,
  isLoading = false,
  onRowClick,
  currentPage,
  totalPages,
  onPageChange,
}: RefundsTableProps) {
  const { merchant } = useUserMerchantData();

  // Determine environment based on merchant state
  const environment: "sandbox" | "production" =
    merchant?.productionState === "ACTIVE" ? "production" : "sandbox";

  // Format currency for display
  const formatCurrency = (currency: string) => {
    return currency === "XAF" && environment === "production" ? "FCFA" : currency;
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "text-green-600 dark:text-green-400";
      case "PENDING":
        return "text-orange-600 dark:text-orange-400";
      case "PROCESSING":
        return "text-muted-foreground";
      case "FAILED":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-muted-foreground";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return {
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        time: date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    } catch {
      return { date: dateString, time: "" };
    }
  };

  if (isLoading) {
    return (
      <div className="bg-background rounded-lg border border-border overflow-hidden">
        <div className="p-8 text-center text-muted-foreground text-xs">
          Loading refunds...
        </div>
      </div>
    );
  }

  if (refunds.length === 0) {
    return (
      <div className="bg-background rounded-lg border border-border overflow-hidden">
        <div className="p-8 text-center text-muted-foreground text-xs">
          No refunds found
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left py-2 px-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Date
              </th>
              <th className="text-left py-2 px-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                TX ID
              </th>
              <th className="text-left py-2 px-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Amount
              </th>
              <th className="text-left py-2 px-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Method
              </th>
              <th className="text-left py-2 px-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Reason
              </th>
              <th className="text-left py-2 px-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Status
              </th>
              <th className="text-left py-2 px-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {refunds.map((refund) => {
              const { date, time } = formatDate(refund.createdAt);
              return (
                <tr
                  key={refund.id}
                  className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer group"
                  onClick={() => onRowClick(refund)}
                >
                  <td className="py-2.5 px-3">
                    <div className="text-xs font-medium text-foreground">
                      {date}
                    </div>
                    <div className="text-[10px] text-muted-foreground">{time}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="text-xs font-mono text-foreground">
                      {refund.transaction.id.slice(0, 12)}...
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      {refund.id.slice(0, 12)}...
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-xs font-semibold text-foreground">
                    {parseFloat(refund.amount).toLocaleString()} {formatCurrency(refund.transaction.currency || "XAF")}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-[10px] text-foreground font-medium">
                      {refund.method}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-[10px] text-foreground max-w-xs truncate">
                    {refund.reason || "N/A"}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-medium ${getStatusColor(
                        refund.status
                      )}`}
                    >
                      <span
                        className={`w-1 h-1 rounded-full ${
                          refund.status === "SUCCESS"
                            ? "bg-green-500"
                            : refund.status === "PENDING"
                            ? "bg-orange-500"
                            : refund.status === "PROCESSING"
                            ? "bg-muted-foreground"
                            : "bg-red-500"
                        }`}
                      />
                      {refund.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRowClick(refund);
                      }}
                      className="p-1 hover:text-foreground text-muted-foreground hover:bg-muted rounded transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-border flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 hover:bg-muted rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`px-3 py-1 rounded text-xs font-medium ${currentPage === pageNum
                    ? "bg-orange-500 text-white"
                    : "hover:bg-muted"
                    }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 hover:bg-muted rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
