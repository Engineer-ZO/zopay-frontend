"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    Building2,
    Clock,
    CreditCard,
    Landmark,
    BarChart3,
    FileText,
    Settings,
    Shield,
    Users,
    ChevronDown,
    ChevronRight,
    Menu,
    X,
    DollarSign,
    FileSearch,
    RotateCcw,
    FileCheck,
    Rocket,
    LifeBuoy,
    Globe,
    Network,
    Send,
    Banknote,
    Phone,
    Wallet,
    Monitor,
} from "lucide-react";

interface MenuItem {
    icon: React.ElementType;
    label: string;
    href: string;
    badge?: string | number;
    badgeColor?: string;
}

interface MenuSection {
    title?: string;
    collapsible?: boolean;
    items: MenuItem[];
}

export function AdminSidebar() {
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [collapsedSections, setCollapsedSections] = useState<string[]>([]);

    const toggleSection = (title: string) => {
        setCollapsedSections((prev) =>
            prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
        );
    };

    const menuSections: MenuSection[] = [
        // Dashboard
        {
            items: [
                {
                    icon: Home,
                    label: "Dashboard",
                    href: "/admin/dashboard",
                },
            ],
        },
        // MERCHANT MANAGEMENT
        {
            title: "MERCHANT MANAGEMENT",
            collapsible: true,
            items: [
                {
                    icon: Building2,
                    label: "Merchants",
                    href: "/admin/merchants",
                },
                {
                    icon: Clock,
                    label: "Pending KYB",
                    href: "/admin/merchants/pending-kyb",
                },
                {
                    icon: Rocket,
                    label: "Pending Production",
                    href: "/admin/merchants/pending-production",
                },
            ],
        },
        // MONITORING
        {
            title: "MONITORING",
            collapsible: true,
            items: [
                {
                    icon: CreditCard,
                    label: "Transactions",
                    href: "/admin/transactions",
                },
                {
                    icon: Landmark,
                    label: "Settlements",
                    href: "/admin/settlements",
                },
                {
                    icon: RotateCcw,
                    label: "Refunds",
                    href: "/admin/refunds",
                },
                {
                    icon: FileSearch,
                    label: "Reconciliation",
                    href: "/admin/reconciliation",
                },
            ],
        },
        // APPROVALS
        {
            title: "APPROVALS",
            collapsible: true,
            items: [
                {
                    icon: Globe,
                    label: "Domain Requests",
                    href: "/admin/domains",
                },
                {
                    icon: Network,
                    label: "IP Requests",
                    href: "/admin/ips",
                },
                {
                    icon: Send,
                    label: "Bulk Payout Approvals",
                    href: "/admin/payouts",
                },
                {
                    icon: Banknote,
                    label: "Withdrawal Methods",
                    href: "/admin/withdrawals",
                },
                {
                    icon: Phone,
                    label: "MSISDN Lookup",
                    href: "/admin/msisdn-lookup",
                },
                {
                    icon: Banknote,
                    label: "Bank Top-Ups",
                    href: "/admin/bank-topups",
                },
            ],
        },
        // ANALYTICS
        {
            title: "ANALYTICS",
            collapsible: true,
            items: [
                {
                    icon: BarChart3,
                    label: "Platform Analytics",
                    href: "/admin/analytics",
                },
                {
                    icon: FileText,
                    label: "Reports",
                    href: "/admin/reports",
                },
            ],
        },
        // SUPPORT
        {
            title: "SUPPORT",
            collapsible: true,
            items: [
                {
                    icon: LifeBuoy,
                    label: "Tickets Inquiry",
                    href: "/admin/support",
                },
            ],
        },
        // CONFIGURATION
        {
            title: "CONFIGURATION",
            collapsible: true,
            items: [
                {
                    icon: Building2,
                    label: "Local Banks",
                    href: "/admin/local-banks",
                },
                {
                    icon: Settings,
                    label: "Withdrawal Limits",
                    href: "/admin/withdrawal-limits",
                },
                {
                    icon: CreditCard,
                    label: "Withdrawal Fee Rules",
                    href: "/admin/fees/withdrawals",
                },
                {
                    icon: DollarSign,
                    label: "Top-Up Fee Rules",
                    href: "/admin/fees/topups",
                },
                {
                    icon: Building2,
                    label: "Bank Top-Up Accounts",
                    href: "/admin/bank-topup-accounts",
                },
                {
                    icon: Wallet,
                    label: "Wallet Adjustments",
                    href: "/admin/wallet-adjustments",
                },
            ],
        },
        // SYSTEM
        {
            title: "SYSTEM",
            collapsible: true,
            items: [
                {
                    icon: Settings,
                    label: "Settings",
                    href: "/admin/settings",
                },
                {
                    icon: DollarSign,
                    label: "Fees",
                    href: "/admin/settings/fees",
                },
                {
                    icon: FileCheck,
                    label: "Audit Logs",
                    href: "/admin/audit-logs",
                },
                {
                    icon: Users,
                    label: "Admin Users",
                    href: "/admin/users",
                    badge: 8,
                },
                {
                    icon: Monitor,
                    label: "Active Sessions",
                    href: "/admin/settings/sessions",
                },
            ],
        },
    ];

    const isActive = (href: string) => pathname === href;

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-lg"
            >
                {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 h-screen w-72 bg-gradient-to-b from-blue-900 to-purple-900 overflow-y-auto transition-transform duration-300 z-40 ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                    }`}
                style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(96, 165, 250, 0.5) transparent',
                }}
            >
                {/* Logo */}
                <div className="p-6 border-b border-blue-800/30">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white">ZitoPay</h1>
                            <p className="text-xs text-blue-300">Admin Portal</p>
                        </div>
                    </div>
                </div>

                {/* Menu */}
                <nav className="p-4 space-y-1">
                    {menuSections.map((section, sectionIndex) => (
                        <div key={sectionIndex}>
                            {/* Section Header */}
                            {section.title && (
                                <button
                                    onClick={() => section.collapsible && section.title && toggleSection(section.title)}
                                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-blue-300 uppercase tracking-wider hover:text-white transition-colors"
                                >
                                    <span>{section.title}</span>
                                    {section.collapsible && (
                                        <>
                                            {collapsedSections.includes(section.title) ? (
                                                <ChevronRight className="w-4 h-4" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4" />
                                            )}
                                        </>
                                    )}
                                </button>
                            )}

                            {/* Menu Items */}
                            {(!section.title || !collapsedSections.includes(section.title)) && (
                                <div className="space-y-1">
                                    {section.items.map((item, itemIndex) => (
                                        <Link
                                            key={itemIndex}
                                            href={item.href}
                                            onClick={() => setIsMobileOpen(false)}
                                            className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${isActive(item.href)
                                                ? "bg-blue-600 text-white shadow-lg"
                                                : "text-blue-100 hover:bg-blue-800/50 hover:text-white"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <item.icon className="w-5 h-5" />
                                                <span className="text-sm font-medium">{item.label}</span>
                                            </div>
                                            {item.badge && (
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${item.badgeColor || "bg-blue-700"
                                                        } text-white`}
                                                >
                                                    {item.badge}
                                                </span>
                                            )}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </nav>
            </aside>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    onClick={() => setIsMobileOpen(false)}
                    className="lg:hidden fixed inset-0 bg-black/50 z-30"
                />
            )}
        </>
    );
}
