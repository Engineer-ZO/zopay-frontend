import { CheckCircle, Clock, XCircle, Download, Eye, Loader2, Receipt } from "lucide-react";
import { Settlement } from "@/features/settlements/types";

const getStatusConfig = (status: string) => {
  const configs = {
    COMPLETED: { icon: CheckCircle, bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-500/20", label: "Completed" },
    PROCESSING: { icon: Clock, bg: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-700 dark:text-amber-400", border: "border-amber-200 dark:border-amber-500/20", label: "Processing" },
    PENDING: { icon: Clock, bg: "bg-sky-50 dark:bg-sky-500/10", text: "text-sky-700 dark:text-sky-400", border: "border-sky-200 dark:border-sky-500/20", label: "Pending" },
    FAILED: { icon: XCircle, bg: "bg-rose-50 dark:bg-rose-500/10", text: "text-rose-700 dark:text-rose-400", border: "border-rose-200 dark:border-rose-500/20", label: "Failed" },
  };
  return configs[status as keyof typeof configs] || configs.PENDING;
};

const SettlementRow = ({ settlement, onClick, onDownload }: any) => {
  const statusConfig = getStatusConfig(settlement.status);
  const StatusIcon = statusConfig.icon;
  const date = new Date(settlement.createdAt);
  
  return (
    <tr className="group border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 cursor-pointer">
      <td className="px-6 py-4" onClick={() => onClick(settlement)}>
        <div className="flex flex-col">
          <code className="text-sm font-mono font-semibold text-slate-900 dark:text-white">{settlement.id.slice(0, 12)}...</code>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </td>
      <td className="px-6 py-4" onClick={() => onClick(settlement)}>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            {new Date(settlement.periodStart).toLocaleDateString()} — {new Date(settlement.periodEnd).toLocaleDateString()}
          </span>
        </div>
      </td>
      <td className="px-6 py-4" onClick={() => onClick(settlement)}>
        <span className="text-sm font-bold text-slate-900 dark:text-white">
          {parseFloat(settlement.grossAmount).toLocaleString()} {settlement.currency}
        </span>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Fee: {parseFloat(settlement.fees).toLocaleString()} {settlement.currency}
        </div>
      </td>
      <td className="px-6 py-4" onClick={() => onClick(settlement)}>
        <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
          {parseFloat(settlement.netAmount).toLocaleString()} {settlement.currency}
        </span>
      </td>
      <td className="px-6 py-4" onClick={() => onClick(settlement)}>
        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} shadow-sm`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            settlement.status === "COMPLETED" ? "bg-emerald-500" :
            settlement.status === "PROCESSING" ? "bg-amber-500" :
            settlement.status === "PENDING" ? "bg-sky-500" : "bg-rose-500"
          } animate-pulse`} />
          <StatusIcon className="w-3 h-3" />
          {statusConfig.label}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick(settlement);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
          >
            <Eye className="w-3.5 h-3.5" />
            Details
          </button>
          {settlement.status === "COMPLETED" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDownload(settlement.id);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
            >
              <Download className="w-3.5 h-3.5" />
              Statement
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export function SettlementsTable({ settlements, isLoading, onRowClick, onDownloadStatement }: any) {
  if (isLoading) {
    return (
      <div className="p-12 text-center">
        <div className="relative">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">Loading settlements...</p>
      </div>
    );
  }

  if (!settlements || settlements.length === 0) {
    return (
      <div className="p-16 text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
          <Receipt className="w-10 h-10 text-slate-400" />
        </div>
        <p className="text-base font-medium text-slate-700 dark:text-slate-300">No settlements found</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Generate a settlement to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-800/30 border-b-2 border-slate-200 dark:border-slate-700">
            <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">ID / Date</th>
            <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Period</th>
            <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Gross Amount</th>
            <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Net Amount</th>
            <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
            <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
           </tr>
        </thead>
        <tbody>
          {settlements.map((settlement: Settlement) => (
            <SettlementRow
              key={settlement.id}
              settlement={settlement}
              onClick={onRowClick}
              onDownload={onDownloadStatement}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}