
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation"; 
import Image from "next/image";
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
                className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-gradient-to-r from-crimson-600 to-deep-blue-violet-600 text-white rounded-xl shadow-lg"
            >
                {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 h-screen w-72 bg-gradient-to-b from-gray-950 via-gray-900 to-black overflow-y-auto transition-transform duration-300 z-40 border-r border-crimson-900/30 ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                    }`}
                style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#dc2626 #374151',
                }}
            >
                {/* Logo Section */}
                <div className="p-5 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <div>
                             <Image
                                              src="/zopaylogo.png"
                                              alt="ZoPay"
                                              width={140}
                                              height={45}
                                              className="object-contain brightness-0 invert"
                                            />
                            <p className="text-[11px] text-gray-500 tracking-wider">ADMIN PORTAL</p>
                        </div>
                    </div>
                </div>

                {/* Menu Navigation */}
                <nav className="p-3 space-y-2">
                    {menuSections.map((section, sectionIndex) => (
                        <div key={sectionIndex} className="space-y-1">
                            {/* Section Header */}
                            {section.title && (
                                <button
                                    onClick={() => section.collapsible && section.title && toggleSection(section.title)}
                                    className="w-full flex items-center justify-between px-3 py-2 mt-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider hover:text-crimson-400 transition-colors"
                                >
                                    <span>{section.title}</span>
                                    {section.collapsible && (
                                        <>
                                            {collapsedSections.includes(section.title) ? (
                                                <ChevronRight className="w-3.5 h-3.5" />
                                            ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                            )}
                                        </>
                                    )}
                                </button>
                            )}

                            {/* Menu Items */}
                            {(!section.title || !collapsedSections.includes(section.title)) && (
                                <div className="space-y-0.5">
                                    {section.items.map((item, itemIndex) => (
                                        <Link
                                            key={itemIndex}
                                            href={item.href}
                                            onClick={() => setIsMobileOpen(false)}
                                            className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive(item.href)
                                                    ? "bg-gradient-to-r from-crimson-600/20 to-deep-blue-violet-600/20 border-l-2 border-crimson-500"
                                                    : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <item.icon className={`w-4 h-4 transition-colors ${isActive(item.href)
                                                        ? "text-crimson-400"
                                                        : "text-gray-500 group-hover:text-crimson-400"
                                                    }`} />
                                                <span className={`text-sm font-medium ${isActive(item.href)
                                                        ? "text-white"
                                                        : "text-gray-300"
                                                    }`}>
                                                    {item.label}
                                                </span>
                                            </div>
                                            {item.badge && (
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-crimson-600 to-crimson-700 text-white shadow-sm`}
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

                {/* Footer Decoration */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-crimson-500"></div>
                        <div className="w-1 h-1 rounded-full bg-gray-600"></div>
                        <div className="w-1 h-1 rounded-full bg-deep-blue-violet-500"></div>
                        <span className="text-[10px] text-gray-600">v2.0.0</span>
                    </div>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    onClick={() => setIsMobileOpen(false)}
                    className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-30"
                />
            )}
        </>
    );
}
