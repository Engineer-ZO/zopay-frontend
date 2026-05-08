"use client";

import { useState } from "react";
import {
    FileText,
    Plus,
    Calendar,
    Download,
    Mail,
    Search,
    Clock,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Settings,
    FileSpreadsheet,
    FileCode,
    Layout,
    TrendingUp,
    ShieldCheck,
    XCircle,
    Building2,
    Users,
    DollarSign,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePlatformSummary } from "@/features/reports/queries";

// Types
interface ReportJob {
    id: string;
    filename: string;
    template: string;
    format: 'XLSX' | 'CSV' | 'PDF' | 'JSON';
    size: string;
    createdBy: string;
    status: 'COMPLETED' | 'PENDING' | 'FAILED';
    timestamp: string;
}

interface ScheduledReport {
    id: string;
    name: string;
    frequency: 'Daily' | 'Weekly' | 'Monthly';
    recipients: string[];
    nextRun: string;
    status: 'ACTIVE' | 'INACTIVE';
}

// Dummy Data
const RECENT_REPORTS: ReportJob[] = [
    {
        id: "RP-001",
        filename: "Transaction_Master_Jan_2026.xlsx",
        template: "Transaction Master",
        format: "XLSX",
        size: "12.4 MB",
        createdBy: "Admin Sarah",
        status: "COMPLETED",
        timestamp: "Jan 13, 10:45 AM"
    },
    {
        id: "RP-002",
        filename: "Revenue_Audit_Q1_Draft.csv",
        template: "Revenue Audit",
        format: "CSV",
        size: "4.8 MB",
        createdBy: "System Automator",
        status: "PENDING",
        timestamp: "Jan 13, 11:30 AM"
    },
    {
        id: "RP-003",
        filename: "KYB_Compliance_Export.pdf",
        template: "Compliance Dump",
        format: "PDF",
        size: "2.1 MB",
        createdBy: "Compliance Team",
        status: "FAILED",
        timestamp: "Jan 12, 04:20 PM"
    }
];

const SCHEDULED_REPORTS: ScheduledReport[] = [
    {
        id: "SCH-001",
        name: "Daily Executive Summary",
        frequency: "Daily",
        recipients: ["ceo@zitopay.com"],
        nextRun: "Jan 14, 08:00 AM",
        status: "ACTIVE"
    },
    {
        id: "SCH-002",
        name: "Weekly Financial Audit",
        frequency: "Weekly",
        recipients: ["finance@zitopay.com"],
        nextRun: "Jan 19, 00:00 AM",
        status: "ACTIVE"
    }
];

export default function ReportsPage() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState("Transaction Master");
    
    // Fetch platform summary
    const { data: platformSummary, isLoading: isLoadingSummary } = usePlatformSummary();

    const StatusBadge = ({ status }: { status: ReportJob['status'] }) => {
        const styles = {
            COMPLETED: "bg-green-100 text-green-800",
            PENDING: "bg-orange-100 text-orange-800",
            FAILED: "bg-red-100 text-red-800"
        };
        const icons = {
            COMPLETED: CheckCircle2,
            PENDING: Clock,
            FAILED: AlertCircle
        };
        const Icon = icons[status];

        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
                <Icon className="w-3 h-3" />
                {status}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <TrendingUp className="w-8 h-8 text-blue-600" />
                        Reports & Exports
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Data extraction for financial audit and compliance</p>
                </div>

                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        Scheduled
                    </button>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium hover:bg-blue-700 text-white"
                    >
                        <Plus className="w-4 h-4" />
                        Create Report
                    </button>
                </div>
            </div>

            {/* Platform Summary Stats */}
            {isLoadingSummary ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="p-4 rounded-xl border border-gray-200 bg-white animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    ))}
                </div>
            ) : platformSummary ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl border border-blue-200 bg-blue-50">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                <Building2 className="w-5 h-5" />
                            </div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-blue-700 opacity-80">Total Merchants</p>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{platformSummary.totalMerchants}</h3>
                        <p className="text-xs text-blue-600 mt-1">
                            {platformSummary.activeMerchants} active, {platformSummary.inactiveMerchants} inactive
                        </p>
                    </div>

                    <div className="p-4 rounded-xl border border-green-200 bg-green-50">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                                <Users className="w-5 h-5" />
                            </div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-green-700 opacity-80">Active Merchants</p>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{platformSummary.activeMerchants}</h3>
                        <p className="text-xs text-green-600 mt-1">Currently enabled</p>
                    </div>

                    <div className="p-4 rounded-xl border border-purple-200 bg-purple-50">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-purple-700 opacity-80">Total Transactions</p>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {new Intl.NumberFormat('en-US').format(platformSummary.totalTransactions)}
                        </h3>
                        <p className="text-xs text-purple-600 mt-1">All time</p>
                    </div>

                    <div className="p-4 rounded-xl border border-orange-200 bg-orange-50">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                                <DollarSign className="w-5 h-5" />
                            </div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-orange-700 opacity-80">Platform Revenue</p>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'XAF',
                                minimumFractionDigits: 0,
                            }).format(parseFloat(platformSummary.totalPlatformRevenue))}
                        </h3>
                        <p className="text-xs text-orange-600 mt-1">Total fees collected</p>
                    </div>
                </div>
            ) : null}

            {/* Gateway Performance */}
            {platformSummary && platformSummary.gatewayPerformance && platformSummary.gatewayPerformance.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Gateway Performance</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Gateway</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Success Rate</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Total Transactions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {platformSummary.gatewayPerformance.map((gateway, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <span className="text-sm font-medium text-gray-900">{gateway.gateway}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className={`text-sm font-semibold ${
                                                gateway.successRate >= 95 ? 'text-green-600' :
                                                gateway.successRate >= 90 ? 'text-blue-600' :
                                                gateway.successRate >= 85 ? 'text-yellow-600' : 'text-red-600'
                                            }`}>
                                                {gateway.successRate}%
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="text-sm font-medium text-gray-900">
                                                {new Intl.NumberFormat('en-US').format(gateway.totalTransactions)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Reports Table */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
                            <h3 className="font-semibold text-gray-900">Download Center</h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm w-48"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Report Name</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Size</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {RECENT_REPORTS.map((report) => (
                                        <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${report.format === 'XLSX' ? 'bg-green-100 text-green-600' :
                                                            report.format === 'PDF' ? 'bg-red-100 text-red-600' :
                                                                'bg-blue-100 text-blue-600'
                                                        }`}>
                                                        {report.format === 'XLSX' ? <FileSpreadsheet className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{report.filename}</p>
                                                        <p className="text-xs text-gray-500">{report.template} • {report.timestamp}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-sm text-gray-900">{report.size}</p>
                                                <p className="text-xs text-gray-500">{report.createdBy}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={report.status} />
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    disabled={report.status !== 'COMPLETED'}
                                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Available Templates Grid */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                        <h3 className="font-semibold text-gray-900 mb-4">Available Templates</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { title: "Transaction Master", desc: "Full dump of all transactions.", icon: Layout, color: "blue" },
                                { title: "Revenue Audit", desc: "Fees vs Gateway costs.", icon: TrendingUp, color: "green" },
                                { title: "Compliance Dump", desc: "KYB status & OCR data.", icon: ShieldCheck, color: "purple" },
                                { title: "API Usage Log", desc: "Dev environment activity.", icon: FileCode, color: "orange" }
                            ].map((tmpl, i) => (
                                <button key={i} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left group bg-white">
                                    <div className={`p-2 rounded-lg bg-${tmpl.color}-50 text-${tmpl.color}-600 shrink-0`}>
                                        <tmpl.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-700">{tmpl.title}</h4>
                                        <p className="text-xs text-gray-500 mt-0.5">{tmpl.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Automation & Schedule Side */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900">Scheduled Reports</h3>
                            <button className="text-xs font-medium text-blue-600 hover:text-blue-700">Manage</button>
                        </div>

                        <div className="space-y-3">
                            {SCHEDULED_REPORTS.map((sch) => (
                                <div key={sch.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-white hover:border-gray-300 transition-all cursor-pointer group">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{sch.status}</span>
                                        </div>
                                        <span className="px-2 py-0.5 bg-white border border-gray-200 text-gray-600 text-xs font-medium rounded-md">{sch.frequency}</span>
                                    </div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-1">{sch.name}</h4>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>Next: {sch.nextRun}</span>
                                        <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
                        <div className="flex items-start gap-3">
                            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-bold text-blue-900">Pro Tip</h4>
                                <p className="text-xs text-blue-800 mt-1 leading-relaxed">
                                    Use the <strong>Revenue Audit</strong> template to cross-reference with the Reconciliation page for perfect tax compliance.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Report Modal */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-gray-900">Generate New Report</h2>
                                <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-2">Select Template</label>
                                    <select
                                        value={selectedTemplate}
                                        onChange={(e) => setSelectedTemplate(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option>Transaction Master</option>
                                        <option>Revenue Audit</option>
                                        <option>KYB Compliance</option>
                                        <option>Payout Log</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-2">Date Range</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input type="text" value="Jan 1 - Jan 31, 2026" readOnly className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-2">Format</label>
                                        <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                                            <option>Excel (XLSX)</option>
                                            <option>CSV</option>
                                            <option>PDF</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-3">
                                    <Settings className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Email Notification</p>
                                        <p className="text-xs text-gray-500">Notify admin@zitopay.com upon completion</p>
                                    </div>
                                    <input type="checkbox" defaultChecked className="ml-auto rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 bg-white text-gray-700 font-medium rounded-lg hover:bg-gray-50 text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 text-sm"
                                    >
                                        Generate Report
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
