"use client";

import { useState } from "react";
import { 
    Download, 
    Calendar, 
    BarChart3, 
    DollarSign, 
    TrendingUp, 
    TrendingDown, 
    Activity, 
    X,
    Wallet,
    CheckCircle,
    Clock,
    AlertCircle,
    PieChart,
    LineChart,
    CreditCard,
    Smartphone,
    Building2,
    Globe,
    Zap,
    Sparkles,
    Shield,
    RefreshCw,
    ChevronDown,
} from "lucide-react";
import { useUserMerchantData } from "@/features/merchants/context/MerchantContext";
import { useEnvironment } from "@/core/environment/EnvironmentContext";
import {
  useDashboardSummary,
  useDashboardStats,
  useVolumeOverTime,
  useSuccessVsFailed,
  useGatewayBreakdown,
  useCollectionsVsPayouts,
  useExportTransactions,
} from "@/features/reports/queries";
import MetricCard from "./components/MetricCard";
import ChartCard from "./components/ChartCard";
import ScheduledReportsList from "./components/ScheduledReportsList";
import { toast } from "sonner";

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, subtitle, change, trend, color = "indigo", isPrimary = false }: any) => {
    const colors = {
        indigo: "from-indigo-500 to-purple-600",
        emerald: "from-emerald-500 to-teal-600",
        amber: "from-amber-500 to-orange-600",
        rose: "from-rose-500 to-pink-600",
        sky: "from-sky-500 to-blue-600",
    };
    
    return (
        <div className={`group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 ${isPrimary ? "ring-2 ring-indigo-500/20" : ""}`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            <div className="relative flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{value}</p>
                    {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
                    {change && (
                        <div className="mt-2 flex items-center gap-1">
                            {trend === "up" ? (
                                <TrendingUp className="w-3 h-3 text-emerald-500" />
                            ) : (
                                <TrendingDown className="w-3 h-3 text-rose-500" />
                            )}
                            <p className={`text-xs font-medium ${trend === "up" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                                {change}
                            </p>
                        </div>
                    )}
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${colors[color as keyof typeof colors]} shadow-lg ${isPrimary ? "ring-2 ring-white/20" : ""}`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
            </div>
        </div>
    );
};

// Summary Card Component
const SummaryCard = ({ label, value }: { label: string; value: number }) => (
    <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-4 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
        <div className="relative">
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{label}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
    </div>
);

export default function ReportsPage() {
  const { merchant } = useUserMerchantData();
  const { environment } = useEnvironment();
  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "30d" | "90d" | "all">("30d");
  const [chartDays, setChartDays] = useState(30);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<"CSV" | "EXCEL">("CSV");

  // API Hooks
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const { data: stats, isLoading: statsLoading } = useDashboardStats(
    merchant?.id || "",
    selectedPeriod
  );
  const { data: volumeData, isLoading: volumeLoading } = useVolumeOverTime(chartDays);
  const { data: successData, isLoading: successLoading } = useSuccessVsFailed();
  const { data: gatewayData, isLoading: gatewayLoading } = useGatewayBreakdown();
  const { data: collectionsData, isLoading: collectionsLoading } = useCollectionsVsPayouts();
  const exportMutation = useExportTransactions();

  const handleExport = async () => {
    try {
      const blob = await exportMutation.mutateAsync({
        format: exportFormat,
        filters: {},
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions_${new Date().toISOString().split("T")[0]}.${
        exportFormat === "CSV" ? "csv" : "xlsx"
      }`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Report exported successfully");
      setShowExportModal(false);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to export report");
    }
  };

  const formatAmount = (amount: string | number): string => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatCurrency = (amount: string): string => {
    const num = parseFloat(amount);
    const formatted = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
    return environment === "production" ? `${formatted} FCFA` : `${formatted} XAF`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-white via-white to-indigo-50/50 dark:from-slate-800/80 dark:via-slate-800/60 dark:to-indigo-950/30 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-6 shadow-lg">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                    Reports & Analytics
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                    Analyze your business performance and export reports
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as "7d" | "30d" | "90d" | "all")}
                className="px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all duration-200 cursor-pointer"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="all">All Time</option>
              </select>
              <button
                onClick={() => setShowExportModal(true)}
                className="group px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 shadow-md"
              >
                <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 animate-pulse" />
              ))}
            </>
          ) : stats && stats.stats && stats.stats.length > 0 ? (
            stats.stats.slice(0, 4).map((stat, index) => {
              const icons = [DollarSign, Activity, BarChart3, Wallet];
              const Icon = icons[index % icons.length];
              const colors = ["indigo", "emerald", "amber", "sky"];
              const isPrimary = stat.label === "Available Balance";
              
              return (
                <StatCard
                  key={index}
                  icon={Icon}
                  label={stat.label}
                  value={`${stat.value} ${stat.currency}`}
                  subtitle={stat.subtitle}
                  change={stat.change}
                  trend={stat.trend}
                  color={colors[index % colors.length]}
                  isPrimary={isPrimary}
                />
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                <BarChart3 className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-base font-medium text-slate-700 dark:text-slate-300">No stats data available</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Try selecting a different time period</p>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SummaryCard label="Today" value={summary.totalTransactionsToday} />
            <SummaryCard label="This Week" value={summary.totalTransactionsThisWeek} />
            <SummaryCard label="This Month" value={summary.totalTransactionsThisMonth} />
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Volume Over Time */}
          <div className="rounded-2xl bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="p-5 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50/30 to-transparent dark:from-slate-800/20">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <LineChart className="w-4 h-4 text-indigo-500" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Transaction Volume</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Collections vs Payouts over time</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {[7, 30, 90].map((days) => (
                    <button
                      key={days}
                      onClick={() => setChartDays(days)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                        chartDays === days
                          ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                          : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600"
                      }`}
                    >
                      {days}d
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6">
              {volumeLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="relative">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                </div>
              ) : volumeData && volumeData.data && Array.isArray(volumeData.data) ? (
                <div className="h-64 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/30 dark:to-slate-800/20 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-500/20 dark:to-purple-500/20 flex items-center justify-center">
                      <LineChart className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Volume chart: {volumeData.data.length} data points
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Collections and payouts over the last {chartDays} days
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/30 dark:to-slate-800/20 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                      <BarChart3 className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No volume data available</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try selecting a different time period</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Success vs Failed */}
          <div className="rounded-2xl bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="p-5 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50/30 to-transparent dark:from-slate-800/20">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-indigo-500" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Transaction Status</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Success vs Failed transactions</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              {successLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="relative">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                </div>
              ) : successData && successData.total > 0 ? (
                <div className="space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Successful</span>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                          {((successData.successful / successData.total) * 100).toFixed(1)}%
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">({formatAmount(successData.successful)} transactions)</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-rose-500" />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Failed</span>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                          {((successData.failed / successData.total) * 100).toFixed(1)}%
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">({formatAmount(successData.failed)} transactions)</p>
                      </div>
                    </div>
                    <div className="relative w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                        style={{ width: `${(successData.successful / successData.total) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-900/30 p-3 text-center">
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Total transactions: <span className="font-bold text-slate-900 dark:text-white">{formatAmount(successData.total)}</span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                      <Activity className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No transaction status data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Gateway Breakdown */}
        <div className="rounded-2xl bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md">
          <div className="p-5 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50/30 to-transparent dark:from-slate-800/20">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-500" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Gateway Performance</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Transaction distribution by gateway</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            {gatewayLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="relative">
                  <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
              </div>
            ) : gatewayData && gatewayData.breakdown && gatewayData.breakdown.length > 0 ? (
              <div className="space-y-5">
                {gatewayData.breakdown.map((gateway) => {
                  const getGatewayColor = (name: string) => {
                    if (name.includes("MTN")) return "from-amber-500 to-orange-600";
                    if (name.includes("ORANGE")) return "from-rose-500 to-pink-600";
                    return "from-indigo-500 to-purple-600";
                  };
                  const getGatewayIcon = (name: string) => {
                    if (name.includes("MTN")) return <Smartphone className="w-4 h-4" />;
                    if (name.includes("ORANGE")) return <Phone className="w-4 h-4" />;
                    return <CreditCard className="w-4 h-4" />;
                  };
                  return (
                    <div key={gateway.gateway} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg bg-gradient-to-br ${getGatewayColor(gateway.gateway)}`}>
                            {getGatewayIcon(gateway.gateway)}
                          </div>
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">{gateway.gateway}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{gateway.percentage}%</span>
                          <p className="text-xs text-slate-500 dark:text-slate-400">({formatAmount(gateway.count)} transactions)</p>
                        </div>
                      </div>
                      <div className="relative w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`absolute left-0 top-0 h-full bg-gradient-to-r ${getGatewayColor(gateway.gateway)} rounded-full transition-all duration-500`}
                          style={{ width: `${gateway.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                    <CreditCard className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No gateway data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scheduled Reports */}
        <div className="rounded-2xl bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md">
          <ScheduledReportsList />
        </div>
      </div>

      {/* Export Modal - Enhanced */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setShowExportModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-white to-indigo-50/30 dark:from-slate-800 dark:to-indigo-950/20 border-b border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                    <Download className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Export Report</h3>
                </div>
                <button onClick={() => setShowExportModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-900 dark:text-white mb-2 block">Format *</label>
                <div className="flex gap-4">
                  {(["CSV", "EXCEL"] as const).map((format) => (
                    <label key={format} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="exportFormat"
                        value={format}
                        checked={exportFormat === format}
                        onChange={(e) => setExportFormat(e.target.value as "CSV" | "EXCEL")}
                        className="text-indigo-500 focus:ring-indigo-500"
                      />
                      <span className={`text-sm font-semibold transition-colors duration-200 ${exportFormat === format ? "text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-400 group-hover:text-indigo-500"}`}>
                        {format}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    The export will include all transactions based on your current filters.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  disabled={exportMutation.isPending}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {exportMutation.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Export
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Phone icon component (add if missing)
const Phone = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
);