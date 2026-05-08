"use client";

import { CheckCircle2, Clock, XCircle, FileText, Eye } from "lucide-react";
import { Settlement } from "@/features/settlements/types";
import { useUserMerchantData } from "@/features/merchants/context/MerchantContext";

interface SettlementsTableProps {
  settlements: Settlement[];
  isLoading?: boolean;
  onRowClick: (settlement: Settlement) => void;
  onDownloadStatement?: (settlement: Settlement) => void;
}

export function SettlementsTable({
  settlements,
  isLoading = false,
  onRowClick,
  onDownloadStatement,
}: SettlementsTableProps) {
  const { merchant } = useUserMerchantData();
  
  // Determine environment based on merchant state
  const environment: "sandbox" | "production" =
    merchant?.productionState === "ACTIVE" ? "production" : "sandbox";

  // Currency display
  const currency = environment === "production" ? "FCFA" : "XAF";
  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
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
      <div className="bg-background rounded-lg border border-border overflow-hidden">
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-muted/50 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (settlements.length === 0) {
    return (
      <div className="bg-background rounded-lg border border-border p-12 text-center">
        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-sm font-semibold text-foreground mb-2">
          No settlements found
        </h3>
        <p className="text-xs text-muted-foreground">
          Generate your first settlement to get started
        </p>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">
                Period
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">
                Net Amount
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">
                Status
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">
                Statement
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">
                Bank Ref
              </th>
            </tr>
          </thead>
          <tbody>
            {settlements.map((settlement) => (
              <tr
                key={settlement.id}
                className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => onRowClick(settlement)}
              >
                <td className="py-3 px-4 text-xs font-medium text-foreground">
                  {formatPeriod(settlement.periodStart, settlement.periodEnd)}
                </td>
                <td className="py-3 px-4 text-xs font-semibold text-foreground">
                  {parseFloat(settlement.netAmount).toLocaleString()} {currency}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-medium ${getStatusColor(
                      settlement.status
                    )}`}
                  >
                    <span
                      className={`w-1 h-1 rounded-full ${
                        settlement.status === "COMPLETED"
                          ? "bg-green-500"
                          : settlement.status === "PENDING"
                          ? "bg-orange-500"
                          : settlement.status === "PROCESSING"
                          ? "bg-muted-foreground"
                          : "bg-red-500"
                      }`}
                    />
                    {settlement.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {settlement.status === "COMPLETED" && settlement.statementUrl ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownloadStatement?.(settlement);
                      }}
                      className="text-xs font-medium text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3" />
                      PDF
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRowClick(settlement);
                      }}
                      className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </button>
                  )}
                </td>
                <td className="py-3 px-4 text-xs text-muted-foreground font-mono">
                  {settlement.bankTransferReference || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
