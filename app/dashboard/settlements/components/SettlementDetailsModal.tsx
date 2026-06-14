import { X, Download, CheckCircle, Clock, XCircle, Calendar, Wallet, TrendingUp, AlertCircle, Loader2 } from "lucide-react";

const getStatusConfig = (status: string) => {
  const configs = {
    COMPLETED: { icon: CheckCircle, bg: "bg-emerald-100 dark:bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-500/20", label: "Completed" },
    PROCESSING: { icon: Clock, bg: "bg-amber-100 dark:bg-amber-500/10", text: "text-amber-700 dark:text-amber-400", border: "border-amber-200 dark:border-amber-500/20", label: "Processing" },
    PENDING: { icon: Clock, bg: "bg-sky-100 dark:bg-sky-500/10", text: "text-sky-700 dark:text-sky-400", border: "border-sky-200 dark:border-sky-500/20", label: "Pending" },
    FAILED: { icon: XCircle, bg: "bg-rose-100 dark:bg-rose-500/10", text: "text-rose-700 dark:text-rose-400", border: "border-rose-200 dark:border-rose-500/20", label: "Failed" },
  };
  return configs[status as keyof typeof configs] || configs.PENDING;
};

export function SettlementDetailsModal({ isOpen, onClose, settlementDetails, onDownloadStatement, isLoading }: any) {
  if (!isOpen) return null;

  const statusConfig = settlementDetails ? getStatusConfig(settlementDetails.status) : null;
  const StatusIcon = statusConfig?.icon;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-gradient-to-r from-white to-indigo-50/30 dark:from-slate-800 dark:to-indigo-950/20 border-b border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Settlement Details</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Complete settlement information</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500" />
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">Loading settlement details...</p>
          </div>
        ) : !settlementDetails ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
              <Wallet className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-base font-medium text-slate-700 dark:text-slate-300">No settlement data available</p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Status Banner */}
            <div className={`rounded-xl p-5 border-2 ${statusConfig?.bg} ${statusConfig?.border}`}>
              <div className="flex items-center gap-3 mb-2">
                {StatusIcon && <StatusIcon className={`w-6 h-6 ${statusConfig?.text}`} />}
                <span className={`text-base font-bold ${statusConfig?.text}`}>{statusConfig?.label}</span>
              </div>
              <p className="text-sm opacity-90 ml-9 text-slate-600 dark:text-slate-400">
                {settlementDetails.status === "COMPLETED"
                  ? "✓ Settlement completed successfully. Funds have been transferred."
                  : settlementDetails.status === "PROCESSING"
                  ? "⏳ Settlement is being processed. This may take a few minutes."
                  : settlementDetails.status === "PENDING"
                  ? "⏰ Settlement is pending processing."
                  : "⚠️ Settlement failed. Please contact support."}
              </p>
            </div>

            {/* Settlement Info */}
            <div className="rounded-xl bg-slate-50 dark:bg-slate-900/30 p-4 border border-slate-200 dark:border-slate-700">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                Settlement Information
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400">Settlement ID:</span>
                  <code className="font-mono font-medium text-slate-900 dark:text-white">{settlementDetails.id}</code>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400">Period:</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {new Date(settlementDetails.periodStart).toLocaleDateString()} — {new Date(settlementDetails.periodEnd).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400">Created:</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {new Date(settlementDetails.createdAt).toLocaleString()}
                  </span>
                </div>
                {settlementDetails.completedAt && (
                  <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500 dark:text-slate-400">Completed:</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {new Date(settlementDetails.completedAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Amount Breakdown */}
            <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 p-4 border border-indigo-200 dark:border-indigo-500/20">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                Amount Breakdown
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-indigo-200 dark:border-indigo-500/20">
                  <span className="text-slate-600 dark:text-slate-400">Gross Amount:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {parseFloat(settlementDetails.grossAmount).toLocaleString()} {settlementDetails.currency}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-indigo-200 dark:border-indigo-500/20">
                  <span className="text-slate-600 dark:text-slate-400">Fees:</span>
                  <span className="text-rose-600 dark:text-rose-400 font-medium">
                    -{parseFloat(settlementDetails.fees).toLocaleString()} {settlementDetails.currency}
                  </span>
                </div>
                <div className="flex justify-between py-2 pt-3 border-t-2 border-indigo-300 dark:border-indigo-500/30">
                  <span className="font-bold text-slate-900 dark:text-white">Net Amount:</span>
                  <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                    {parseFloat(settlementDetails.netAmount).toLocaleString()} {settlementDetails.currency}
                  </span>
                </div>
              </div>
            </div>

            {/* Transaction Count */}
            <div className="rounded-xl bg-slate-50 dark:bg-slate-900/30 p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-500/20">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-400">Transactions in this settlement:</span>
                </div>
                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{settlementDetails.transactionCount}</span>
              </div>
            </div>

            {/* Actions */}
            {settlementDetails.status === "COMPLETED" && (
              <button
                onClick={onDownloadStatement}
                className="w-full px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Statement
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}