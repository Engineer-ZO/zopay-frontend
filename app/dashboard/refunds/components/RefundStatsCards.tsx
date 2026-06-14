"use client";

import { DollarSign, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useUserMerchantData } from "@/features/merchants/context/MerchantContext";

interface RefundStatsCardsProps {
  total: number;
  successful: number;
  pending: number;
  failed: number;
  isLoading?: boolean;
}

const StatCard = ({ icon: Icon, label, value, color, isLoading }: any) => {
  const colors = {
    indigo: "from-indigo-500 to-purple-600",
    emerald: "from-emerald-500 to-teal-600",
    amber: "from-amber-500 to-orange-600",
    rose: "from-rose-500 to-pink-600",
  };
  
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
          {isLoading ? (
            <div className="mt-2 h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          ) : (
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{value}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colors[color as keyof typeof colors]} shadow-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
};

export function RefundStatsCards({
  total,
  successful,
  pending,
  failed,
  isLoading = false,
}: RefundStatsCardsProps) {
  const { merchant } = useUserMerchantData();

  const environment: "sandbox" | "production" =
    merchant?.productionState === "ACTIVE" ? "production" : "sandbox";

  const currency = environment === "production" ? "FCFA" : "XAF";
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-5 animate-pulse">
            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl mb-3" />
            <div className="w-20 h-3 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
            <div className="w-28 h-6 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard 
        icon={DollarSign} 
        label="TOTAL REFUNDED" 
        value={`${total.toLocaleString()} ${currency}`} 
        color="indigo"
        isLoading={isLoading}
      />
      <StatCard 
        icon={CheckCircle2} 
        label="SUCCESSFUL" 
        value={successful} 
        color="emerald"
        isLoading={isLoading}
      />
      <StatCard 
        icon={Clock} 
        label="PENDING" 
        value={pending} 
        color="amber"
        isLoading={isLoading}
      />
      <StatCard 
        icon={XCircle} 
        label="FAILED" 
        value={failed} 
        color="rose"
        isLoading={isLoading}
      />
    </div>
  );
}