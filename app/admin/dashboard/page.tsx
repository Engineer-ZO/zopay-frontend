"use client";

import {
    Building2,
    TrendingUp,
    DollarSign,
    CheckCircle2,
    ArrowUp,
    ArrowDown,
    ChevronDown,
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
        <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 animate-pulse">
            <div className="flex items-center justify-between mb-3">
                <div className="w-5 h-5 bg-gray-300 rounded" />
                <div className="w-16 h-4 bg-gray-300 rounded" />
            </div>
            <div className="w-32 h-3 bg-gray-300 rounded mb-2" />
            <div className="w-24 h-8 bg-gray-300 rounded mt-2" />
            <div className="w-40 h-3 bg-gray-300 rounded mt-1" />
        </div>
    );
}

// Skeleton loader for gateway performance
function GatewayPerformanceSkeleton() {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="w-40 h-6 bg-gray-300 rounded animate-pulse" />
                <div className="w-24 h-4 bg-gray-300 rounded animate-pulse" />
            </div>
            <div className="space-y-4">
                {[1, 2].map((i) => (
                    <div key={i}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-32 h-4 bg-gray-300 rounded animate-pulse" />
                            <div className="w-20 h-4 bg-gray-300 rounded animate-pulse" />
                        </div>
                        <div className="flex gap-1 h-8">
                            <div className="flex-1 bg-gray-200 rounded-l animate-pulse" />
                            <div className="flex-1 bg-gray-200 rounded-r animate-pulse" />
                        </div>
                    </div>
                ))}
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

    // Map platform metrics to UI format (from usePlatformMetrics)
    const platformMetricsData = platformMetrics ? [
        {
            label: "TOTAL MERCHANTS",
            value: platformMetrics.totalMerchants.value,
            change: platformMetrics.totalMerchants.change,
            changeValue: platformMetrics.totalMerchants.change,
            trend: platformMetrics.totalMerchants.trend,
            icon: Building2,
            bgColor: "bg-blue-50",
            iconColor: "text-blue-600",
            borderColor: "border-blue-200",
        },
        {
            label: "ACTIVE MERCHANTS",
            value: platformMetrics.activeMerchants.value,
            change: platformMetrics.activeMerchants.change,
            changeValue: platformMetrics.activeMerchants.change,
            trend: platformMetrics.activeMerchants.trend,
            icon: CheckCircle2,
            bgColor: "bg-green-50",
            iconColor: "text-green-600",
            borderColor: "border-green-200",
        },
        {
            label: "PLATFORM REVENUE",
            value: platformMetrics.platformRevenue.value,
            change: platformMetrics.platformRevenue.change,
            changeValue: platformMetrics.platformRevenue.change,
            trend: platformMetrics.platformRevenue.trend,
            icon: DollarSign,
            bgColor: "bg-purple-50",
            iconColor: "text-purple-600",
            borderColor: "border-purple-200",
        },
        {
            label: "TOTAL VOLUME",
            value: platformMetrics.totalVolume.value,
            change: platformMetrics.totalVolume.change,
            changeValue: platformMetrics.totalVolume.change,
            trend: platformMetrics.totalVolume.trend,
            icon: TrendingUp,
            bgColor: "bg-orange-50",
            iconColor: "text-orange-600",
            borderColor: "border-orange-200",
        },
    ] : [];



    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Platform Dashboard</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Monitor ZitoPay platform health and performance
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
                        📅 Last 30 Days
                        <ChevronDown className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* ERROR MESSAGES */}
            {(platformError || gatewayError) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-800 font-semibold mb-1">Error loading dashboard data</p>
                    <p className="text-xs text-red-600">
                        {platformError?.message || gatewayError?.message}
                    </p>
                </div>
            )}

            {/* PLATFORM METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {isLoadingPlatform ? (
                    // Skeleton loaders
                    Array.from({ length: 4 }).map((_, index) => (
                        <MetricCardSkeleton key={index} />
                    ))
                ) : (
                    platformMetricsData.map((metric, index) => (
                        <div
                            key={index}
                            className={`${metric.bgColor} rounded-lg p-5 border ${metric.borderColor} hover:shadow-md transition-shadow cursor-pointer`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <metric.icon className={`w-5 h-5 ${metric.iconColor}`} />
                                <span
                                    className={`flex items-center gap-1 text-sm font-semibold ${metric.trend === "up" ? "text-green-600" : metric.trend === "down" ? "text-red-600" : "text-gray-600"
                                        }`}
                                >
                                    {metric.trend === "up" ? (
                                        <ArrowUp className="w-4 h-4" />
                                    ) : metric.trend === "down" ? (
                                        <ArrowDown className="w-4 h-4" />
                                    ) : null}
                                    {metric.change}
                                </span>
                            </div>
                            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                {metric.label}
                            </p>
                            <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                {metric.changeValue} vs last month
                            </p>
                        </div>
                    ))
                )}
            </div>


            {/* TOP MERCHANTS TABLES */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Merchants by Volume */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            📈 Top Merchants by Volume
                        </h3>
                        <a href="/admin/reports" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                            View All →
                        </a>
                    </div>
                    {isLoadingTopVolume ? (
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="animate-pulse flex items-center justify-between py-2">
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                </div>
                            ))}
                        </div>
                    ) : topMerchantsByVolume && topMerchantsByVolume.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Merchant</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Volume</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {topMerchantsByVolume.map((merchant, index) => (
                                        <tr key={merchant.merchantId} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-medium text-gray-500">#{index + 1}</span>
                                                    <span className="text-sm font-medium text-gray-900">{merchant.merchantName}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {new Intl.NumberFormat('en-US', {
                                                        style: 'currency',
                                                        currency: 'XAF',
                                                        minimumFractionDigits: 0,
                                                    }).format(parseFloat(merchant.volume))}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No merchant data available</p>
                    )}
                </div>

                {/* Top Merchants by Revenue */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            💰 Top Merchants by Revenue
                        </h3>
                        <a href="/admin/reports" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                            View All →
                        </a>
                    </div>
                    {isLoadingTopRevenue ? (
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="animate-pulse flex items-center justify-between py-2">
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                </div>
                            ))}
                        </div>
                    ) : topMerchantsByRevenue && topMerchantsByRevenue.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Merchant</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {topMerchantsByRevenue.map((merchant, index) => (
                                        <tr key={merchant.merchantId} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-medium text-gray-500">#{index + 1}</span>
                                                    <span className="text-sm font-medium text-gray-900">{merchant.merchantName}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {new Intl.NumberFormat('en-US', {
                                                        style: 'currency',
                                                        currency: 'XAF',
                                                        minimumFractionDigits: 0,
                                                    }).format(parseFloat(merchant.revenue))}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No merchant data available</p>
                    )}
                </div>
            </div>

            {/* GATEWAY PERFORMANCE */}
            {isLoadingGateway ? (
                <GatewayPerformanceSkeleton />
            ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">
                            🎯 Gateway Performance
                        </h3>
                        <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                            View Details →
                        </button>
                    </div>

                    <div className="space-y-4">
                        {gatewayPerformance && gatewayPerformance.length > 0 ? (
                            gatewayPerformance.map((gateway, index) => (
                                <div key={index}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-900">
                                            {gateway.name}
                                        </span>
                                        <span className="text-sm font-semibold text-gray-900">
                                            {gateway.successRate}% Success
                                        </span>
                                    </div>
                                    <div className="flex gap-1 h-8">
                                        <div
                                            className={`${gateway.color} rounded-l flex items-center justify-center text-xs font-medium text-white`}
                                            style={{
                                                width: `${gateway.successRate}%`,
                                            }}
                                        >
                                            {(gateway.successful / 1000).toFixed(0)}K
                                        </div>
                                        <div
                                            className="bg-red-500 rounded-r flex items-center justify-center text-xs font-medium text-white"
                                            style={{
                                                width: `${100 - gateway.successRate}%`,
                                            }}
                                        >
                                            {(gateway.failed / 1000).toFixed(0)}K
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-4">
                                No gateway performance data available
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* RECENTLY ONBOARDED MERCHANTS */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">📰 Recently Onboarded</h3>
                    <a href="/admin/reports" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                        View All →
                    </a>
                </div>

                    {isLoadingRecent ? (
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="animate-pulse pb-3 border-b border-gray-100">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    ) : recentlyOnboarded && recentlyOnboarded.length > 0 ? (
                        <div className="space-y-3">
                            {recentlyOnboarded.map((merchant) => (
                                <div
                                    key={merchant.merchantId}
                                    className="pb-3 border-b border-gray-100 last:border-0 last:pb-0"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">
                                                {merchant.merchantName}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {new Date(merchant.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                        <a
                                            href={`/admin/merchants?merchantId=${merchant.merchantId}`}
                                            className="text-xs font-medium text-blue-600 hover:text-blue-700 ml-4"
                                        >
                                            View
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No recently onboarded merchants</p>
                    )}
            </div>
        </div>
    );
}
