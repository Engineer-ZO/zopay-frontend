"use client";

import { X, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";
import { Refund } from "@/features/refunds/types";
import { useUserMerchantData } from "@/features/merchants/context/MerchantContext";

interface RefundDetailsModalProps {
  refund: Refund | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RefundDetailsModal({
  refund,
  isOpen,
  onClose,
}: RefundDetailsModalProps) {
  const { merchant } = useUserMerchantData();
  
  // Determine environment based on merchant state
  const environment: "sandbox" | "production" =
    merchant?.productionState === "ACTIVE" ? "production" : "sandbox";

  // Format currency for display
  const formatCurrency = (currency: string) => {
    return currency === "XAF" && environment === "production" ? "FCFA" : currency;
  };
  if (!isOpen || !refund) return null;

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
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-xl p-6 shadow-2xl border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Refund Details</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Refund Information */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">
              Refund Information
            </h4>
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Status</span>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium ${getStatusColor(
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
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Amount</span>
                <span className="text-sm font-semibold text-foreground">
                  {parseFloat(refund.amount).toLocaleString()} {formatCurrency(refund.transaction.currency || "XAF")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Method</span>
                <span className="text-sm font-medium text-foreground">
                  {refund.method}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Reason</span>
                <span className="text-sm text-foreground text-right max-w-xs">
                  {refund.reason || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Refund ID</span>
                <span className="text-xs font-mono text-foreground">
                  {refund.id}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Gateway Reference
                </span>
                <span className="text-xs font-mono text-foreground">
                  {refund.gatewayReference || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Created</span>
                <span className="text-xs text-foreground">
                  {formatDate(refund.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Original Transaction */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">
              Original Transaction
            </h4>
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Transaction ID
                </span>
                <span className="text-xs font-mono text-foreground">
                  {refund.transaction.id}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Amount</span>
                <span className="text-sm font-semibold text-foreground">
                  {parseFloat(refund.transaction.amount).toLocaleString()}{" "}
                  {formatCurrency(refund.transaction.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Gateway</span>
                <span className="text-sm text-foreground">
                  {refund.transaction.gateway}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Type</span>
                <span className="text-sm text-foreground">
                  {refund.transaction.type}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Status</span>
                <span className="text-sm text-foreground">
                  {refund.transaction.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Refunded Amount
                </span>
                <span className="text-sm text-foreground">
                  {parseFloat(refund.transaction.refundedAmount).toLocaleString()}{" "}
                  {formatCurrency(refund.transaction.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Fully Refunded
                </span>
                <span className="text-sm text-foreground">
                  {refund.transaction.fullyRefunded ? "Yes" : "No"}
                </span>
              </div>
              {refund.customer.msisdn && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Customer Phone
                  </span>
                  <span className="text-sm text-foreground">
                    {refund.customer.msisdn}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Merchant Info (Admin only) */}
          {refund.merchant && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">
                Merchant Information
              </h4>
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Business Name
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {refund.merchant.businessName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Email</span>
                  <span className="text-sm text-foreground">
                    {refund.merchant.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Merchant ID
                  </span>
                  <span className="text-xs font-mono text-foreground">
                    {refund.merchant.id}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Financial Impact */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">
              Financial Impact
            </h4>
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Refund Amount
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {parseFloat(refund.amount).toLocaleString()} {formatCurrency(refund.transaction.currency || "XAF")}
                </span>
              </div>
              {refund.payout ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Gateway Fee
                    </span>
                    <span className="text-sm text-foreground">
                      {parseFloat(refund.payout.gatewayFee).toLocaleString()} {formatCurrency(refund.transaction.currency || "XAF")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Platform Fee
                    </span>
                    <span className="text-sm text-foreground">
                      {parseFloat(refund.payout.platformFee).toLocaleString()} {formatCurrency(refund.transaction.currency || "XAF")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <span className="text-xs font-semibold text-foreground">
                      Total Cost
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {parseFloat(refund.payout.totalCost).toLocaleString()} {formatCurrency(refund.transaction.currency || "XAF")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Payout Status
                    </span>
                    <span className="text-sm text-foreground">
                      {refund.payout.status}
                    </span>
                  </div>
                  {refund.payout.failureReason && (
                    <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-red-700 dark:text-red-400">
                            Failure Reason
                          </p>
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            {refund.payout.failureReason}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-xs text-muted-foreground italic">
                  Payout information not available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
