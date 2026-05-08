"use client";

import { useState } from "react";
import {
    BarChart3,
    TrendingUp,
    DollarSign,
    Activity,
    Globe,
    Zap,
    Calendar,
    Filter,
    Download,
    ChevronDown,
    ArrowUpRight,
    ArrowDownRight,
    Smartphone,
    Landmark,
} from "lucide-react";

export default function AnalyticsPage() {
    const [period] = useState("Last 30 Days");

    // Metrics for Cards
    const metrics = [
        { label: "Total Payment Volume", value: "4.5B", unit: "FCFA", trend: "+15%", positive: true, icon: DollarSign, color: "blue" },
        { label: "Gross Revenue", value: "112M", unit: "FCFA", trend: "+8%", positive: true, icon: TrendingUp, color: "green" },
        { label: "Avg Transaction Value", value: "12,400", unit: "FCFA", trend: "-2%", positive: false, icon: Activity, color: "orange" },
        { label: "Conversion Rate", value: "96.8%", unit: "%", trend: "+1.2%", positive: true, icon: Zap, color: "purple" }
    ];

    return (
        <div className="space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <BarChart3 className="w-8 h-8 text-blue-600" />
                        Analytics
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Holistic view of ecosystem growth and performance</p>
                </div>

                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        {period}
                        <ChevronDown className="w-3 h-3 ml-1" />
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700">
                        <Filter className="w-4 h-4 text-gray-500" />
                        Gateway: All
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium hover:bg-blue-700 text-white">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Metric Cards - Matching Merchant/Dashboard Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((m, i) => (
                    <div key={i} className={`p-4 rounded-xl border bg-white shadow-sm border-gray-200`}>
                        <div className="flex items-center justify-between mb-2">
                            <div className={`p-2 rounded-lg ${m.color === 'blue' ? 'bg-blue-50 text-blue-700' : m.color === 'green' ? 'bg-green-50 text-green-700' : m.color === 'orange' ? 'bg-orange-50 text-orange-700' : 'bg-purple-50 text-purple-700'}`}>
                                <m.icon className="w-5 h-5" />
                            </div>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${m.positive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {m.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {m.trend}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 font-medium">{m.label}</p>
                        <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-2xl font-bold text-gray-900">{m.value}</span>
                            <span className="text-xs text-gray-500">{m.unit}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue & Volume Trend Chart Placeholder */}
                <div className="lg:col-span-2 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Revenue & Volume Trends</h3>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-600" />
                                <span className="text-xs text-gray-500">TPV</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                <span className="text-xs text-gray-500">Revenue</span>
                            </div>
                        </div>
                    </div>
                    {/* Simplified Chart Area */}
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 border-dashed">
                        <span className="text-sm text-gray-400">Chart Visualization Area</span>
                    </div>
                </div>

                {/* Gateway Performance */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Gateway Health</h3>
                    <p className="text-xs text-gray-500 mb-6">Volume share vs Success rate</p>

                    <div className="space-y-4 flex-1">
                        {[
                            { label: "MTN MoMo", value: 45, color: "bg-yellow-400", share: "98.2%", icon: Smartphone },
                            { label: "Orange Money", value: 35, color: "bg-orange-500", share: "94.5%", icon: Smartphone },
                            { label: "Bank Transfer", value: 12, color: "bg-blue-600", share: "99.1%", icon: Landmark },
                            { label: "Others", value: 8, color: "bg-gray-400", share: "92.0%", icon: Globe }
                        ].map((gw, i) => (
                            <div key={i}>
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <gw.icon className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm font-medium text-gray-700">{gw.label}</span>
                                    </div>
                                    <span className={`text-xs font-medium ${parseFloat(gw.share) > 95 ? 'text-green-600' : 'text-orange-600'}`}>{gw.share} Success</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div className={`h-full ${gw.color}`} style={{ width: `${gw.value}%` }} />
                                    </div>
                                    <span className="text-xs text-gray-500 w-8 text-right">{gw.value}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Geographic Heatmap - Simplified */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-gray-400" />
                        Regional Density
                    </h3>
                    <div className="h-60 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 border-dashed">
                        <span className="text-sm text-gray-400">Map Visualization Area</span>
                    </div>
                </div>

                {/* Merchant Tier Distribution */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Merchant Tier Distribution</h3>
                    <div className="space-y-4">
                        {[
                            { label: "High Volume (> 10M)", count: 45, volume: "3.2B", color: "bg-blue-600" },
                            { label: "Mid Tier (1M - 10M)", count: 280, volume: "1.1B", color: "bg-blue-400" },
                            { label: "Long Tail (< 1M)", count: 1240, volume: "0.2B", color: "bg-blue-200" }
                        ].map((tier, i) => (
                            <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{tier.label}</p>
                                    <p className="text-xs text-gray-500">{tier.count} Merchants</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-gray-900">{tier.volume}</p>
                                    <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-1 ml-auto">
                                        <div className={`h-full rounded-full ${tier.color}`} style={{ width: '60%' }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
