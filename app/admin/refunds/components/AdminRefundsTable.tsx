"use client";

import { CheckCircle2, Clock, XCircle, Eye } from "lucide-react";
import { Refund } from "@/features/refunds/types";

interface AdminRefundsTableProps {
  refunds: Refund[];
  isLoading?: boolean;
  onRowClick: (refund: Refund) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function AdminRefundsTable({
  refunds,
  isLoading = false,
  onRowClick,
  currentPage,
  totalPages,
  onPageChange,
}: AdminRefundsTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400";
      case "PENDING":
        return "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400";
      case "PROCESSING":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400";
      case "FAILED":
        return "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400";
      default:
        return "bg-muted text-muted-foreground";
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
      <div className="bg-background rounded-xl border border-border overflow-hidden">
        <div className="p-8 text-center text-muted-foreground">
          Loading refunds...
        </div>
      </div>
    );
  }

  if (refunds.length === 0) {
    return (
      <div className="bg-background rounded-xl border border-border overflow-hidden">
        <div className="p-8 text-center text-muted-foreground">
          No refunds found
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">
                Date
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">
                Merchant
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">
                TX ID
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">
                Amount
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">
                Method
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">
                Status
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">
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
                  className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => onRowClick(refund)}
                >
                  <td className="py-3 px-4">
                    <div className="text-xs font-medium text-foreground">
                      {date}
                    </div>
                    <div className="text-xs text-muted-foreground">{time}</div>
                  </td>
                  <td className="py-3 px-4">
                    {refund.merchant ? (
                      <div>
                        <div className="text-xs font-medium text-foreground">
                          {refund.merchant.businessName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {refund.merchant.name}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">N/A</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-xs font-mono text-foreground font-medium">
                      {refund.transaction.id.slice(0, 12)}...
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {refund.id.slice(0, 12)}...
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs font-semibold text-foreground">
                    {parseFloat(refund.amount).toLocaleString()} FCFA
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded text-xs font-medium">
                      {refund.method}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                        refund.status
                      )}`}
                    >
                      {refund.status === "SUCCESS" && (
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                      )}
                      {refund.status === "PENDING" && (
                        <Clock className="w-3 h-3 mr-1" />
                      )}
                      {refund.status === "PROCESSING" && (
                        <Clock className="w-3 h-3 mr-1" />
                      )}
                      {refund.status === "FAILED" && (
                        <XCircle className="w-3 h-3 mr-1" />
                      )}
                      {refund.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRowClick(refund);
                      }}
                      className="p-1 hover:bg-muted rounded transition-colors"
                    >
                      <Eye className="w-4 h-4 text-muted-foreground" />
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
                  className={`px-3 py-1 rounded text-xs font-medium ${
                    currentPage === pageNum
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
