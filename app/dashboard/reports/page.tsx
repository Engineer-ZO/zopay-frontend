"use client";

import { useState } from "react";
import { Download, Calendar, BarChart3, DollarSign, TrendingUp, TrendingDown, Activity, X } from "lucide-react";
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

      // Create download link
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
    // Display FCFA instead of XAF in production mode
    const formatted = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
    // Append FCFA in production mode, XAF in sandbox
    return environment === "production" ? `${formatted} FCFA` : `${formatted} XAF`;
  };

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Reports & Analytics</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Analyze your business performance and export reports
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as "7d" | "30d" | "90d" | "all")}
            className="px-3 py-1.5 bg-background border border-border rounded-md text-xs font-medium hover:bg-muted transition-colors"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
          <button
            onClick={() => setShowExportModal(true)}
            className="px-3 py-1.5 bg-orange-500 text-white rounded-md text-xs font-semibold hover:bg-orange-600 transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics - Show only 4 cards (removed Calendar/5th card) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statsLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-background rounded-lg p-3 border border-border animate-pulse">
                <div className="flex items-start justify-between mb-2">
                  <div className="w-8 h-8 bg-muted rounded-lg" />
                </div>
                <div className="w-20 h-2.5 bg-muted rounded mb-1.5" />
                <div className="w-28 h-5 bg-muted rounded" />
              </div>
            ))}
          </>
        ) : stats && stats.stats && stats.stats.length > 0 ? (
          stats.stats.slice(0, 4).map((stat, index) => {
            const icons = [DollarSign, Activity, BarChart3, TrendingUp];
            const Icon = icons[index % icons.length];
            const isPrimary = stat.label === "Available Balance";
            
            return (
              <div
                key={index}
                className={`bg-background rounded-lg p-3 border border-border ${
                  isPrimary ? "border-l-2 border-l-orange-500" : ""
                } hover:shadow-sm transition-shadow`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="w-8 h-8 bg-muted/60 rounded-lg flex items-center justify-center">
                    <Icon className={`w-4 h-4 ${isPrimary ? "text-orange-500" : "text-muted-foreground"}`} />
                  </div>
                  {stat.change && stat.trend && (
                    <span
                      className={`text-[10px] font-medium flex items-center gap-0.5 ${
                        stat.trend === "up"
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {stat.trend === "up" ? (
                        <TrendingUp className="w-2.5 h-2.5" />
                      ) : (
                        <TrendingDown className="w-2.5 h-2.5" />
                      )}
                      {stat.change}
                    </span>
                  )}
                </div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  {stat.label}
                </p>
                <p className={`text-base font-semibold ${isPrimary ? "text-orange-500" : "text-foreground"}`}>
                  {stat.value} {stat.currency}
                </p>
                {stat.subtitle && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">{stat.subtitle}</p>
                )}
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-xs text-muted-foreground">No stats data available</p>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-background rounded-lg p-3 border border-border">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">
              Today
            </p>
            <p className="text-base font-semibold text-foreground">
              {summary.totalTransactionsToday}
            </p>
          </div>
          <div className="bg-background rounded-lg p-3 border border-border">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">
              This Week
            </p>
            <p className="text-base font-semibold text-foreground">
              {summary.totalTransactionsThisWeek}
            </p>
          </div>
          <div className="bg-background rounded-lg p-3 border border-border">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">
              This Month
            </p>
            <p className="text-base font-semibold text-foreground">
              {summary.totalTransactionsThisMonth}
            </p>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Volume Over Time */}
        <ChartCard
          title="Transaction Volume"
          subtitle="Collections vs Payouts over time"
          isLoading={volumeLoading}
          actions={
            <div className="flex gap-2">
              {(Array.isArray([7, 30, 90]) ? [7, 30, 90] : []).map((days) => (
                <button
                  key={days}
                  onClick={() => setChartDays(days)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                    chartDays === days
                      ? "bg-orange-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {days}d
                </button>
              ))}
            </div>
          }
        >
          {volumeData && volumeData.data && Array.isArray(volumeData.data) ? (
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-600">
                  Volume chart: {volumeData.data.length} data points
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Collections and payouts over the last {chartDays} days
                </p>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-600">
                  No volume data available
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Collections and payouts over the last {chartDays} days
                </p>
              </div>
            </div>
          )}
        </ChartCard>

        {/* Success vs Failed */}
        <ChartCard
          title="Transaction Status"
          subtitle="Success vs Failed transactions"
          isLoading={successLoading}
        >
        {successData && successData.total > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-gray-900">Successful</span>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">
                  {((successData.successful / successData.total) * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500">({successData.successful} transactions)</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm font-medium text-gray-900">Failed</span>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">
                  {((successData.failed / successData.total) * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500">({successData.failed} transactions)</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full"
                style={{ width: `${(successData.successful / successData.total) * 100}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center">
            <p className="text-sm text-gray-500">No transaction status data available</p>
          </div>
        )}
        </ChartCard>
      </div>

      {/* Gateway Breakdown */}
      <ChartCard
        title="Gateway Performance"
        subtitle="Transaction distribution by gateway"
        isLoading={gatewayLoading}
      >
        {gatewayData && gatewayData.breakdown && gatewayData.breakdown.length > 0 ? (
          <div className="space-y-4">
            {gatewayData.breakdown.map((gateway) => (
              <div key={gateway.gateway}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">{gateway.gateway}</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {gateway.percentage}% ({formatAmount(gateway.count)})
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      gateway.gateway === "MTN_MOMO"
                        ? "bg-yellow-500"
                        : gateway.gateway === "ORANGE_MONEY"
                        ? "bg-orange-500"
                        : "bg-blue-500"
                    }`}
                    style={{ width: `${gateway.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center">
            <p className="text-sm text-gray-500">No gateway data available</p>
          </div>
        )}
      </ChartCard>

      {/* Scheduled Reports */}
      <div className="bg-background rounded-lg p-3 border border-border">
        <ScheduledReportsList />
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-xl max-w-md w-full border border-border">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Export Report</h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-foreground mb-2 block">Format *</label>
                <div className="flex gap-3">
                  {(["CSV", "EXCEL"] as const).map((format) => (
                    <label key={format} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="exportFormat"
                        value={format}
                        checked={exportFormat === format}
                        onChange={(e) => setExportFormat(e.target.value as "CSV" | "EXCEL")}
                        className="text-orange-500"
                      />
                      <span className="text-xs text-foreground uppercase">{format}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="flex-1 px-4 py-2 bg-background border border-border rounded-md text-xs font-semibold hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  disabled={exportMutation.isPending}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-md text-xs font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {exportMutation.isPending ? "Exporting..." : "Export"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
