"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    LifeBuoy,
    Book,
    Search,
    AlertTriangle,
    ExternalLink,
    CheckCircle2,
    FileText,
    ChevronRight,
    Server,
    Activity,
    Phone,
    Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminTickets } from "@/features/admin/queries";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { TicketStatus } from "@/features/support/types";

export default function SupportPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("support"); // Default to support tickets
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<TicketStatus | "ALL">("ALL");

    // Fetch Tickets
    const { data: ticketsData, isLoading: ticketsLoading } = useAdminTickets({
        status: statusFilter === "ALL" ? undefined : statusFilter,
        search: searchQuery || undefined
    });

    const docsCategories = [
        {
            title: "Onboarding & KYB",
            icon: FileText,
            color: "bg-blue-50 text-blue-600 border-blue-200",
            articles: ["Verifying Merchant Documents", "Updating KYB Status", "Handling Rejections"]
        },
        {
            title: "Finance & Settlements",
            icon: CheckCircle2,
            color: "bg-green-50 text-green-600 border-green-200",
            articles: ["Processing Manual Payouts", "Reconciliation Disputes", "Fee Structure Guide"]
        },
        {
            title: "Technical Issues",
            icon: Server,
            color: "bg-purple-50 text-purple-600 border-purple-200",
            articles: ["Webhook Debugging", "API Rate Limits", "Gateway Error Codes"]
        },
        {
            title: "Platform Admin",
            icon: Activity,
            color: "bg-orange-50 text-orange-600 border-orange-200",
            articles: ["Creating Admin Users", "Audit Log Analysis", "Maintenance Mode"]
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <LifeBuoy className="w-8 h-8 text-blue-600" />
                        Help & Support Center
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Manage support tickets and view documentation</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg border border-gray-200 p-1 flex gap-1 w-fit">
                {['support', 'documentation'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${activeTab === tab
                            ? "bg-blue-600 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === "documentation" && (
                        <div className="space-y-6">
                            {/* Search Hero */}
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-6 text-white relative overflow-hidden shadow-sm">
                                <div className="relative z-10 max-w-2xl">
                                    <h2 className="text-lg font-semibold mb-3">Internal Knowledge Base</h2>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search guides, error codes, or articles..."
                                            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-400/30 outline-none text-sm shadow-sm"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 skew-x-12 transform translate-x-12" />
                            </div>

                            {/* Categories Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {docsCategories.map((category) => {
                                    const Icon = category.icon;
                                    return (
                                        <div key={category.title} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-all group cursor-pointer">
                                            <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <h3 className="font-semibold text-gray-900 text-sm mb-3">{category.title}</h3>
                                            <ul className="space-y-1.5">
                                                {category.articles.map((article) => (
                                                    <li key={article} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 cursor-pointer">
                                                        <ChevronRight className="w-3 h-3" />
                                                        {article}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Quick Links */}
                            <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                                <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
                                    <Book className="w-4 h-4 text-gray-500" />
                                    Internal Quick Links
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {['Emergency Response Plan', 'Compliance Handbook 2026', 'Brand Assets', 'API Specs (Private)'].map((link) => (
                                        <a href="#" key={link} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:border-blue-300 hover:text-blue-600 transition-colors">
                                            {link}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "support" && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left: Ticket Queue */}
                            <div className="lg:col-span-2 space-y-4">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <h3 className="font-semibold text-gray-900 text-sm">Merchant Support Tickets</h3>
                                    <div className="flex gap-2">
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value as any)}
                                            className="text-xs border-gray-200 rounded-lg focus:ring-blue-500"
                                        >
                                            <option value="ALL">All Status</option>
                                            <option value="OPEN">Open</option>
                                            <option value="IN_PROGRESS">In Progress</option>
                                            <option value="WAITING_FOR_CUSTOMER">Waiting</option>
                                            <option value="RESOLVED">Resolved</option>
                                            <option value="CLOSED">Closed</option>
                                        </select>
                                    </div>
                                </div>

                                {ticketsLoading ? (
                                    <div className="py-12 flex justify-center">
                                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                                    </div>
                                ) : ticketsData?.tickets && ticketsData.tickets.length > 0 ? (
                                    <div className="space-y-3">
                                        {ticketsData.tickets.map((item) => {
                                            const ticket = item.ticket;
                                            // Handling potentially different response structure (AdminTicketListItem vs SupportTicket)
                                            // Type suggests 'tickets: AdminTicketListItem[]' where item has 'ticket' and 'merchantName'
                                            return (
                                                <div
                                                    key={ticket.id}
                                                    onClick={() => router.push(`/admin/support/${ticket.id}`)}
                                                    className="bg-white border border-gray-200 p-4 rounded-lg flex items-center justify-between hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "w-2 h-2 rounded-full",
                                                            ticket.priority === 'URGENT' || ticket.priority === 'HIGH' ? 'bg-red-500 shadow-red-200 shadow-[0_0_8px]' :
                                                                ticket.priority === 'MEDIUM' ? 'bg-orange-500' : 'bg-blue-500'
                                                        )} />
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-0.5">
                                                                <span className="font-mono text-xs text-gray-400 font-medium tracking-tight">#{ticket.ticketNumber}</span>
                                                                <h4 className="font-medium text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                                                                    {ticket.subject}
                                                                </h4>
                                                            </div>
                                                            <div className="text-xs text-gray-500 flex gap-1">
                                                                <span className="font-medium text-gray-700">{item.merchantName || "Unknown Merchant"}</span>
                                                                <span>•</span>
                                                                <span>{formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={cn(
                                                        "px-2.5 py-0.5 rounded-full text-xs font-medium uppercase min-w-[80px] text-center",
                                                        ticket.status === 'OPEN' ? "bg-blue-50 text-blue-700" :
                                                            ticket.status === 'IN_PROGRESS' ? "bg-yellow-50 text-yellow-700" :
                                                                ticket.status === 'WAITING_FOR_CUSTOMER' ? "bg-orange-50 text-orange-700" :
                                                                    ticket.status === 'RESOLVED' ? "bg-green-50 text-green-700" :
                                                                        "bg-gray-100 text-gray-600"
                                                    )}>
                                                        {ticket.status.replace(/_/g, " ")}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-10 text-center">
                                        <LifeBuoy className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 text-sm">No tickets found matching your filters.</p>
                                    </div>
                                )}
                            </div>

                            {/* Right: Operations & Contact */}
                            <div className="space-y-4">
                                {/* Escalation Contact */}
                                <div className="bg-red-50 border border-red-100 p-5 rounded-lg">
                                    <h3 className="font-semibold text-red-800 text-sm mb-1.5 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" />
                                        Emergency Escalation
                                    </h3>
                                    <p className="text-xs text-red-700 mb-3 leading-relaxed">
                                        For P0 incidents (System Outage, Data Breach), contact the on-call engineer immediately.
                                    </p>
                                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-red-100 shadow-sm mb-2">
                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-semibold text-gray-600 text-xs">JD</div>
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900 text-sm">John Doe</div>
                                            <div className="text-xs text-green-600 font-medium">● ON CALL</div>
                                        </div>
                                        <button className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
                                            <Phone className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {/* External Links */}
                                <div className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm">
                                    <h3 className="font-semibold text-gray-900 text-sm mb-3">External Portals</h3>
                                    <div className="space-y-1.5">
                                        <a href="#" className="flex p-2.5 hover:bg-gray-50 rounded-lg text-xs text-gray-700 font-medium transition-colors justify-between items-center group">
                                            MTN Partner Portal
                                            <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-blue-600" />
                                        </a>
                                        <a href="#" className="flex p-2.5 hover:bg-gray-50 rounded-lg text-xs text-gray-700 font-medium transition-colors justify-between items-center group">
                                            Orange Money Business
                                            <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-blue-600" />
                                        </a>
                                        <a href="#" className="flex p-2.5 hover:bg-gray-50 rounded-lg text-xs text-gray-700 font-medium transition-colors justify-between items-center group">
                                            Stripe Dashboard
                                            <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-blue-600" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
