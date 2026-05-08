"use client";

import { X, Download, CheckCircle2, Clock, XCircle, ArrowLeft } from "lucide-react";
import { SettlementDetails } from "@/features/settlements/types";
import { useUserMerchantData } from "@/features/merchants/context/MerchantContext";

interface SettlementDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settlementDetails: SettlementDetails | null;
  onDownloadStatement?: () => void;
  onComplete?: () => void; // For admin to complete settlement
  isLoading?: boolean;
}

export function SettlementDetailsModal({
  isOpen,
  onClose,
  settlementDetails,
  onDownloadStatement,
  onComplete,
  isLoading = false,
}: SettlementDetailsModalProps) {
  const { merchant } = useUserMerchantData();
  
  // Determine environment based on merchant state
  const environment: "sandbox" | "production" =
    merchant?.productionState === "ACTIVE" ? "production" : "sandbox";

  // Currency display
  const currency = environment === "production" ? "FCFA" : "XAF";

  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
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
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatPeriod = (start: string, end: string) => {
    try {
      const startDate = new Date(start);
      const endDate = new Date(end);
      return `${formatDate(start)} - ${formatDate(end)}`;
    } catch {
      return `${start} - ${end}`;
    }
  };

  if (isLoading || !settlementDetails) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-background rounded-2xl shadow-2xl border border-border max-w-2xl w-full p-6">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  const { settlement, items } = settlementDetails;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-background rounded-2xl shadow-2xl border border-border max-w-2xl w-full my-8">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Settlement Details
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {formatPeriod(settlement.periodStart, settlement.periodEnd)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Status */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Status</p>
            <span
              className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${getStatusColor(
                settlement.status
              )}`}
            >
              {settlement.status === "COMPLETED" && (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              {settlement.status === "PENDING" && (
                <Clock className="w-4 h-4 mr-2" />
              )}
              {settlement.status === "FAILED" && (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              {settlement.status}
            </span>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Total Collections
              </p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                {parseFloat(settlement.totalCollections).toLocaleString()} {currency}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-4 border border-red-200 dark:border-red-800">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Total Payouts
              </p>
              <p className="text-lg font-bold text-red-600 dark:text-red-400">
                {parseFloat(settlement.totalPayouts).toLocaleString()} {currency}
              </p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/10 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Total Refunds
              </p>
              <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                {parseFloat(settlement.totalRefunds).toLocaleString()} {currency}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/10 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Total Fees
              </p>
              <p className="text-lg font-bold text-gray-600 dark:text-gray-400">
                {parseFloat(settlement.totalFees).toLocaleString()} {currency}
              </p>
            </div>
          </div>

          {/* Net Amount - Highlighted */}
          <div className="bg-orange-50 dark:bg-orange-900/10 rounded-lg p-4 border-2 border-orange-500">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Net Settlement Amount
            </p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {parseFloat(settlement.netAmount).toLocaleString()} {currency}
            </p>
          </div>

          {/* Transaction Items */}
          {items && items.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">
                Transaction Details
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">
                        Type
                      </th>
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">
                        Amount
                      </th>
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">
                        Fees
                      </th>
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b border-border last:border-0">
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              item.type === "COLLECTION"
                                ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                                : item.type === "PAYOUT"
                                ? "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                                : "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400"
                            }`}
                          >
                            {item.type}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-medium">
                          {parseFloat(item.amount).toLocaleString()} {currency}
                        </td>
                        <td className="py-2 px-3">
                          {parseFloat(item.fees).toLocaleString()} {currency}
                        </td>
                        <td className="py-2 px-3 text-muted-foreground">
                          {formatDate(item.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Payment Info (if completed) */}
          {settlement.status === "COMPLETED" && settlement.bankTransferReference && (
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-foreground mb-3">
                Payment Information
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">MoMo Transaction:</span>
                  <span className="font-mono font-medium">
                    {settlement.bankTransferReference}
                  </span>
                </div>
                {settlement.updatedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completed:</span>
                    <span>{formatDate(settlement.updatedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            {settlement.status === "COMPLETED" && onDownloadStatement && (
              <button
                onClick={onDownloadStatement}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg text-xs font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Statement
              </button>
            )}
            {settlement.status !== "COMPLETED" && onComplete && (
              <button
                onClick={onComplete}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Complete Settlement
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-xs font-semibold hover:bg-muted transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to List
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
