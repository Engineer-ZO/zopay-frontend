
"use client";

import {
    Building2,
    TrendingUp,
    DollarSign,
    CheckCircle2,
    ArrowUp,
    ArrowDown,
    ChevronDown,
    CreditCard,
    Activity,
    Users,
    Shield,
    Clock,
    Eye,
    ExternalLink,
    Zap,
} from "lucide-react";
import { usePlatformMetrics, useGatewayPerformance } from "@/features/admin/queries";
import {
  useTopMerchantsByVolume,
  useTopMerchantsByRevenue,
  useRecentlyOnboardedMerchants,
} from "@/features/reports/queries";

// Skeleton loader component for metric cards
function MetricCardSkeleton() {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-gray-200 rounded-xl" />
                <div className="w-16 h-6 bg-gray-200 rounded-full" />
            </div>
            <div className="w-32 h-3 bg-gray-200 rounded mb-2" />
            <div className="w-24 h-8 bg-gray-200 rounded mt-2" />
            <div className="w-40 h-3 bg-gray-200 rounded mt-1" />
        </div>
    );
}

// Skeleton loader for gateway performance
function GatewayPerformanceSkeleton() {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div className="w-40 h-6 bg-gray-200 rounded animate-pulse" />
                <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="space-y-5">
                {[1, 2, 3].map((i) => (
                    <div key={i}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
                            <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
                        </div>
                        <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
                    </div>
                ))}
            </div>
        </div>
    );
}

// Metric Card Component
function MetricCard({ metric, index }: { metric: any; index: number }) {
    const colors = [
        { bg: "bg-blue-50", icon: "text-blue-600", border: "border-blue-100", trendUp: "bg-green-100 text-green-700", trendDown: "bg-red-100 text-red-700" },
        { bg: "bg-emerald-50", icon: "text-emerald-600", border: "border-emerald-100", trendUp: "bg-green-100 text-green-700", trendDown: "bg-red-100 text-red-700" },
        { bg: "bg-purple-50", icon: "text-purple-600", border: "border-purple-100", trendUp: "bg-green-100 text-green-700", trendDown: "bg-red-100 text-red-700" },
        { bg: "bg-orange-50", icon: "text-orange-600", border: "border-orange-100", trendUp: "bg-green-100 text-green-700", trendDown: "bg-red-100 text-red-700" },
    ];
    
    const color = colors[index % colors.length];
    
    return (
        <div className={`bg-white rounded-xl border ${color.border} p-6 hover:shadow-lg transition-all duration-300 group`}>
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${color.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <metric.icon className={`w-6 h-6 ${color.icon}`} />
                </div>
                <span
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        metric.trend === "up" 
                            ? color.trendUp
                            : metric.trend === "down" 
                            ? color.trendDown
                            : "bg-gray-100 text-gray-600"
                    }`}
                >
                    {metric.trend === "up" ? (
                        <ArrowUp className="w-3 h-3" />
                    ) : metric.trend === "down" ? (
                        <ArrowDown className="w-3 h-3" />
                    ) : null}
                    {metric.change}
                </span>
            </div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                {metric.label}
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
            <p className="text-xs text-gray-400 mt-2">
                {metric.changeValue} vs last month
            </p>
        </div>
    );
}

// Merchant Table Component - Fixed to handle undefined data
function MerchantTable({ title, icon: Icon, data, isLoading, type }: { 
    title: string; 
    icon: any; 
    data: any[] | undefined; 
    isLoading: boolean;
    type: 'volume' | 'revenue';
}) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                </div>
                <a href="/admin/reports" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1">
                    View All
                    <ExternalLink className="w-3.5 h-3.5" />
                </a>
            </div>
            
            <div className="overflow-x-auto">
                {isLoading ? (
                    <div className="p-6 space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="animate-pulse flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-4 bg-gray-200 rounded"></div>
                                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                                </div>
                                <div className="h-4 bg-gray-200 rounded w-24"></div>
                            </div>
                        ))}
                    </div>
                ) : data && data.length > 0 ? (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Merchant</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                                    {type === 'volume' ? 'Volume' : 'Revenue'}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {data.map((merchant, index) => (
                                <tr key={merchant.merchantId} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <span className={`text-sm font-bold ${
                                            index === 0 ? 'text-amber-600' : 
                                            index === 1 ? 'text-gray-500' : 
                                            index === 2 ? 'text-orange-500' : 'text-gray-400'
                                        }`}>
                                            #{index + 1}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium text-gray-800 group-hover:text-gray-900 transition-colors">
                                            {merchant.merchantName}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-sm font-semibold text-gray-900">
                                            {new Intl.NumberFormat('en-US', {
                                                style: 'currency',
                                                currency: 'XAF',
                                                minimumFractionDigits: 0,
                                            }).format(parseFloat(type === 'volume' ? merchant.volume : merchant.revenue))}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Users className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500">No merchant data available</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function AdminDashboardPage() {
    // Fetch dashboard data using hooks
    const { data: platformMetrics, isLoading: isLoadingPlatform, error: platformError } = usePlatformMetrics();
    const { data: gatewayPerformance, isLoading: isLoadingGateway, error: gatewayError } = useGatewayPerformance();
    
    // Fetch reporting data
    const { data: topMerchantsByVolume, isLoading: isLoadingTopVolume } = useTopMerchantsByVolume(5);
    const { data: topMerchantsByRevenue, isLoading: isLoadingTopRevenue } = useTopMerchantsByRevenue(5);
    const { data: recentlyOnboarded, isLoading: isLoadingRecent } = useRecentlyOnboardedMerchants(5);

    // Map platform metrics to UI format
    const platformMetricsData = platformMetrics ? [
        {
            label: "TOTAL MERCHANTS",
            value: platformMetrics.totalMerchants.value,
            change: platformMetrics.totalMerchants.change,
            changeValue: platformMetrics.totalMerchants.change,
            trend: platformMetrics.totalMerchants.trend,
            icon: Building2,
        },
        {
            label: "ACTIVE MERCHANTS",
            value: platformMetrics.activeMerchants.value,
            change: platformMetrics.activeMerchants.change,
            changeValue: platformMetrics.activeMerchants.change,
            trend: platformMetrics.activeMerchants.trend,
            icon: CheckCircle2,
        },
        {
            label: "PLATFORM REVENUE",
            value: platformMetrics.platformRevenue.value,
            change: platformMetrics.platformRevenue.change,
            changeValue: platformMetrics.platformRevenue.change,
            trend: platformMetrics.platformRevenue.trend,
            icon: DollarSign,
        },
        {
            label: "TOTAL VOLUME",
            value: platformMetrics.totalVolume.value,
            change: platformMetrics.totalVolume.change,
            changeValue: platformMetrics.totalVolume.change,
            trend: platformMetrics.totalVolume.trend,
            icon: TrendingUp,
        },
    ] : [];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="space-y-6 p-6">
                {/* HEADER */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Platform Dashboard
                            </h1>
                        </div>
                        <p className="text-sm text-gray-500 ml-3">
                            Monitor ZoPay platform health and performance metrics
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <select className="appearance-none px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-400 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                <option>Last 30 Days</option>
                                <option>Last 7 Days</option>
                                <option>Last 90 Days</option>
                                <option>This Year</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold text-white transition-all shadow-sm">
                            Export Report
                        </button>
                    </div>
                </div>

                {/* ERROR MESSAGES */}
                {(platformError || gatewayError) && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-red-500" />
                            <p className="text-sm text-red-700 font-semibold">Error loading dashboard data</p>
                        </div>
                        <p className="text-xs text-red-600 mt-1 ml-8">
                            {platformError?.message || gatewayError?.message}
                        </p>
                    </div>
                )}

                {/* PLATFORM METRICS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {isLoadingPlatform ? (
                        Array.from({ length: 4 }).map((_, index) => (
                            <MetricCardSkeleton key={index} />
                        ))
                    ) : (
                        platformMetricsData.map((metric, index) => (
                            <MetricCard key={index} metric={metric} index={index} />
                        ))
                    )}
                </div>

                {/* TOP MERCHANTS SECTION */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <MerchantTable 
                        title="Top Merchants by Volume"
                        icon={TrendingUp}
                        data={topMerchantsByVolume}
                        isLoading={isLoadingTopVolume}
                        type="volume"
                    />
                    <MerchantTable 
                        title="Top Merchants by Revenue"
                        icon={DollarSign}
                        data={topMerchantsByRevenue}
                        isLoading={isLoadingTopRevenue}
                        type="revenue"
                    />
                </div>

                {/* GATEWAY PERFORMANCE & RECENT MERCHANTS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Gateway Performance */}
                    {isLoadingGateway ? (
                        <GatewayPerformanceSkeleton />
                    ) : (
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                        <Activity className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Gateway Performance</h3>
                                </div>
                                <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1">
                                    Details
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <div className="space-y-5">
                                {gatewayPerformance && gatewayPerformance.length > 0 ? (
                                    gatewayPerformance.map((gateway, index) => (
                                        <div key={index} className="group">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <CreditCard className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                                                        {gateway.name}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-400">Success Rate</span>
                                                    <span className="text-sm font-bold text-emerald-600">
                                                        {gateway.successRate}%
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="relative h-10 rounded-lg overflow-hidden bg-gray-100">
                                                <div
                                                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-l-lg flex items-center justify-center text-xs font-bold text-white shadow-sm transition-all duration-500"
                                                    style={{ width: `${gateway.successRate}%` }}
                                                >
                                                    {gateway.successRate >= 15 && (
                                                        <span>{(gateway.successful / 1000).toFixed(0)}K</span>
                                                    )}
                                                </div>
                                                <div
                                                    className="absolute right-0 top-0 h-full bg-gradient-to-r from-red-500 to-red-600 rounded-r-lg flex items-center justify-center text-xs font-bold text-white transition-all duration-500"
                                                    style={{ width: `${100 - gateway.successRate}%` }}
                                                >
                                                    {100 - gateway.successRate >= 15 && (
                                                        <span>{(gateway.failed / 1000).toFixed(0)}K</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex justify-between mt-1 text-[10px] text-gray-400">
                                                <span>Successful: {(gateway.successful / 1000).toFixed(0)}K</span>
                                                <span>Failed: {(gateway.failed / 1000).toFixed(0)}K</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-sm text-gray-500">No gateway performance data available</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Recently Onboarded Merchants */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <Users className="w-4 h-4 text-gray-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Recently Onboarded</h3>
                            </div>
                            <a href="/admin/reports" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1">
                                View All
                                <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                        </div>

                        {isLoadingRecent ? (
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="animate-pulse">
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                ))}
                            </div>
                        ) : recentlyOnboarded && recentlyOnboarded.length > 0 ? (
                            <div className="space-y-3">
                                {recentlyOnboarded.map((merchant, index) => (
                                    <div
                                        key={merchant.merchantId}
                                        className="group flex items-start justify-between p-3 rounded-lg hover:bg-gray-50 transition-all duration-300"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className={`w-2 h-2 rounded-full ${
                                                    index === 0 ? 'bg-emerald-500' : 'bg-blue-500'
                                                }`} />
                                                <p className="text-sm font-medium text-gray-800 group-hover:text-gray-900 transition-colors">
                                                    {merchant.merchantName}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(merchant.createdAt).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                    })}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Eye className="w-3 h-3" />
                                                    {new Date(merchant.createdAt).toLocaleTimeString('en-US', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                        <a
                                            href={`/admin/merchants?merchantId=${merchant.merchantId}`}
                                            className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-xs font-medium text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50"
                                        >
                                            View →
                                        </a>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-sm text-gray-500">No recently onboarded merchants</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center py-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm">
                        <Zap className="w-3 h-3 text-amber-500" />
                        <span className="text-xs text-gray-500">Dashboard updates in real-time</span>
                        <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                        <span className="text-xs text-gray-400">v2.0.0</span>
                    </div>
                </div>
            </div>
        </div>
    );
}