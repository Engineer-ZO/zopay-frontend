"use client";

import { X, CheckCircle2, Clock, XCircle, AlertCircle, Receipt, User, CreditCard, DollarSign, Shield, Calendar } from "lucide-react";
import { Refund } from "@/features/refunds/types";
import { useUserMerchantData } from "@/features/merchants/context/MerchantContext";

interface RefundDetailsModalProps {
  refund: Refund | null;
  isOpen: boolean;
  onClose: () => void;
}

const DetailRow = ({ label, value, highlight = false }: { label: string; value: string | number; highlight?: boolean }) => (
  <div className={`flex justify-between py-2 ${highlight ? 'border-t-2 border-indigo-300 dark:border-indigo-500/30 pt-3' : 'border-b border-slate-100 dark:border-slate-700'}`}>
    <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
    <span className={`text-sm ${highlight ? 'font-bold text-indigo-600 dark:text-indigo-400' : 'font-medium text-slate-900 dark:text-white'}`}>
      {value}
    </span>
  </div>
);

export function RefundDetailsModal({
  refund,
  isOpen,
  onClose,
}: RefundDetailsModalProps) {
  const { merchant } = useUserMerchantData();
  
  const environment: "sandbox" | "production" =
    merchant?.productionState === "ACTIVE" ? "production" : "sandbox";

  const formatCurrency = (currency: string) => {
    return currency === "XAF" && environment === "production" ? "FCFA" : currency;
  };

  if (!isOpen || !refund) return null;

  const getStatusConfig = (status: string) => {
    const configs = {
      SUCCESS: { icon: CheckCircle2, bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-500/20", label: "Success" },
      PENDING: { icon: Clock, bg: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-700 dark:text-amber-400", border: "border-amber-200 dark:border-amber-500/20", label: "Pending" },
      PROCESSING: { icon: Clock, bg: "bg-sky-50 dark:bg-sky-500/10", text: "text-sky-700 dark:text-sky-400", border: "border-sky-200 dark:border-sky-500/20", label: "Processing" },
      FAILED: { icon: XCircle, bg: "bg-rose-50 dark:bg-rose-500/10", text: "text-rose-700 dark:text-rose-400", border: "border-rose-200 dark:border-rose-500/20", label: "Failed" },
    };
    return configs[status as keyof typeof configs] || configs.PENDING;
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

  const statusConfig = getStatusConfig(refund.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="sticky top-0 bg-gradient-to-r from-white to-indigo-50/30 dark:from-slate-800 dark:to-indigo-950/20 border-b border-slate-200 dark:border-slate-700 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Refund Details</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Complete refund information</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Status Banner */}
          <div className={`rounded-xl p-5 border-2 ${statusConfig.bg} ${statusConfig.border}`}>
            <div className="flex items-center gap-3 mb-2">
              <div className="animate-pulse">
                <StatusIcon className={`w-6 h-6 ${statusConfig.text}`} />
              </div>
              <span className={`text-base font-bold ${statusConfig.text}`}>{statusConfig.label}</span>
            </div>
            <p className="text-sm opacity-90 ml-9 text-slate-600 dark:text-slate-400">
              {refund.status === "SUCCESS"
                ? "✓ Refund processed successfully. Funds have been returned to the customer."
                : refund.status === "PENDING"
                ? "⏳ Refund request is pending processing."
                : refund.status === "PROCESSING"
                ? "🔄 Refund is being processed. This may take a few minutes."
                : "⚠️ Refund failed. Please check details or contact support."}
            </p>
          </div>

          {/* Refund Information */}
          <div className="rounded-xl bg-slate-50 dark:bg-slate-900/30 p-4 border border-slate-200 dark:border-slate-700">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <div className="p-1 rounded-lg bg-indigo-100 dark:bg-indigo-500/20">
                <Receipt className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              </div>
              Refund Information
            </h4>
            <div className="space-y-2">
              <DetailRow label="Refund ID" value={refund.id} />
              <DetailRow label="Amount" value={`${parseFloat(refund.amount).toLocaleString()} ${formatCurrency(refund.transaction.currency || "XAF")}`} />
              <DetailRow label="Method" value={refund.method} />
              <DetailRow label="Reason" value={refund.reason || "N/A"} />
              <DetailRow label="Gateway Reference" value={refund.gatewayReference || "N/A"} />
              <DetailRow label="Created" value={formatDate(refund.createdAt)} />
            </div>
          </div>

          {/* Original Transaction */}
          <div className="rounded-xl bg-slate-50 dark:bg-slate-900/30 p-4 border border-slate-200 dark:border-slate-700">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <div className="p-1 rounded-lg bg-indigo-100 dark:bg-indigo-500/20">
                <CreditCard className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              </div>
              Original Transaction
            </h4>
            <div className="space-y-2">
              <DetailRow label="Transaction ID" value={refund.transaction.id} />
              <DetailRow label="Amount" value={`${parseFloat(refund.transaction.amount).toLocaleString()} ${formatCurrency(refund.transaction.currency)}`} />
              <DetailRow label="Gateway" value={refund.transaction.gateway} />
              <DetailRow label="Type" value={refund.transaction.type} />
              <DetailRow label="Status" value={refund.transaction.status} />
              <DetailRow label="Refunded Amount" value={`${parseFloat(refund.transaction.refundedAmount).toLocaleString()} ${formatCurrency(refund.transaction.currency)}`} />
              <DetailRow label="Fully Refunded" value={refund.transaction.fullyRefunded ? "Yes" : "No"} />
              {refund.customer.msisdn && (
                <DetailRow label="Customer Phone" value={refund.customer.msisdn} />
              )}
            </div>
          </div>

          {/* Merchant Information */}
          {refund.merchant && (
            <div className="rounded-xl bg-slate-50 dark:bg-slate-900/30 p-4 border border-slate-200 dark:border-slate-700">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <div className="p-1 rounded-lg bg-indigo-100 dark:bg-indigo-500/20">
                  <User className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                </div>
                Merchant Information
              </h4>
              <div className="space-y-2">
                <DetailRow label="Business Name" value={refund.merchant.businessName} />
                <DetailRow label="Email" value={refund.merchant.name} />
                <DetailRow label="Merchant ID" value={refund.merchant.id} />
              </div>
            </div>
          )}

          {/* Financial Impact */}
          <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 p-4 border border-indigo-200 dark:border-indigo-500/20">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <div className="p-1 rounded-lg bg-indigo-200 dark:bg-indigo-500/30">
                <DollarSign className="w-3.5 h-3.5 text-indigo-700 dark:text-indigo-400" />
              </div>
              Financial Impact
            </h4>
            <div className="space-y-2">
              <DetailRow label="Refund Amount" value={`${parseFloat(refund.amount).toLocaleString()} ${formatCurrency(refund.transaction.currency || "XAF")}`} highlight />
              {refund.payout ? (
                <>
                  <DetailRow label="Gateway Fee" value={`${parseFloat(refund.payout.gatewayFee).toLocaleString()} ${formatCurrency(refund.transaction.currency || "XAF")}`} />
                  <DetailRow label="Platform Fee" value={`${parseFloat(refund.payout.platformFee).toLocaleString()} ${formatCurrency(refund.transaction.currency || "XAF")}`} />
                  <DetailRow label="Total Cost" value={`${parseFloat(refund.payout.totalCost).toLocaleString()} ${formatCurrency(refund.transaction.currency || "XAF")}`} highlight />
                  <DetailRow label="Payout Status" value={refund.payout.status} />
                  {refund.payout.failureReason && (
                    <div className="mt-3 p-3 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-rose-700 dark:text-rose-400">Failure Reason</p>
                          <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{refund.payout.failureReason}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-xs text-slate-500 dark:text-slate-400 italic py-2">Payout information not available</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}