"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
    LayoutDashboard,
    ArrowLeftRight,
    RotateCcw,
    Wallet,
    Receipt,
    Key,
    Webhook,
    Globe,
    BarChart3,
    User,
    LogOut,
    Store,
    Menu,
    X,
    ChevronDown,
    ChevronRight,
    LifeBuoy,
    Settings,
    Send,
    Banknote,
    Shield,
    Link2,
    Monitor,
    type LucideIcon,
    TrendingUp,
    CreditCard,
    Zap,
    Lock,
    HelpCircle,
    Sparkles,
    Activity,
    Server,
    Fingerprint,
    Coins,
    RefreshCw,
} from "lucide-react";
import { useState } from "react";
import { useLogout } from "@/features/auth/hooks/useAuth";

interface MenuItem {
    icon: LucideIcon;
    label: string;
    href: string;
}

interface MenuSection {
    title?: string;
    items: MenuItem[];
    collapsible?: boolean;
}

const menuSections: MenuSection[] = [
    {
        items: [
            {
                icon: LayoutDashboard,
                label: "Dashboard",
                href: "/dashboard",
            },
        ],
    },
    {
        title: "PAYMENTS",
        collapsible: true,
        items: [
            {
                icon: ArrowLeftRight,
                label: "Transactions",
                href: "/dashboard/transactions",
            },
            {
                icon: RotateCcw,
                label: "Refunds",
                href: "/dashboard/refunds",
            },
            {
                icon: Link2,
                label: "Payment Links",
                href: "/dashboard/payment-links",
            },
        ],
    },
    {
        title: "FINANCE",
        collapsible: true,
        items: [
            {
                icon: Wallet,
                label: "Account status",
                href: "/dashboard/wallet",
            },
            {
                icon: Receipt,
                label: "Settlements",
                href: "/dashboard/settlements",
            },
            {
                icon: Banknote,
                label: "Withdrawals",
                href: "/dashboard/withdrawals",
            },
            {
                icon: Send,
                label: "Bulk Payouts",
                href: "/dashboard/payouts",
            },
        ],
    },
    {
        title: "DEVELOPER",
        collapsible: true,
        items: [
            {
                icon: Key,
                label: "API Keys",
                href: "/dashboard/api-keys",
            },
            {
                icon: Webhook,
                label: "Webhooks",
                href: "/dashboard/webhooks",
            },
        ],
    },
    {
        title: "INSIGHTS",
        collapsible: true,
        items: [
            {
                icon: BarChart3,
                label: "Reports & Analytics",
                href: "/dashboard/reports",
            },
        ],
    },
    {
        title: "SETTINGS",
        collapsible: true,
        items: [
            {
                icon: Settings,
                label: "Fee Settings",
                href: "/dashboard/fee-settings",
            },
            {
                icon: Globe,
                label: "Network access",
                href: "/dashboard/settings/network-access",
            },
            {
                icon: Shield,
                label: "Security (2FA)",
                href: "/dashboard/settings/security",
            },
            {
                icon: Monitor,
                label: "Active Sessions",
                href: "/dashboard/settings/sessions",
            },
            {
                icon: User,
                label: "Profile",
                href: "/dashboard/profile",
            },
        ],
    },
    {
        title: "SUPPORT",
        collapsible: true,
        items: [
            {
                icon: LifeBuoy,
                label: "Help & Support",
                href: "/dashboard/support",
            },
        ],
    },
];

// Menu Item Component
const MenuItemLink = ({ item, isActive, onClick }: { item: MenuItem; isActive: boolean; onClick: () => void }) => {
    const Icon = item.icon;
    return (
        <Link
            href={item.href}
            onClick={onClick}
            className={`group relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                    ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-700 dark:text-indigo-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
            }`}
        >
            {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-r-full" />
            )}
            <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                isActive ? "text-indigo-600 dark:text-indigo-400" : ""
            }`} />
            <span>{item.label}</span>
            {isActive && (
                <Sparkles className="w-3 h-3 absolute right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            )}
        </Link>
    );
};

export function DashboardSidebar() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
    const { mutate: logout, isPending: isLoggingOut } = useLogout();

    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const handleLogoutConfirm = () => {
        setShowLogoutConfirm(false);
        logout();
    };

    const handleLogoutCancel = () => {
        setShowLogoutConfirm(false);
    };

    const toggleSection = (title: string) => {
        setCollapsedSections(prev => {
            const newSet = new Set(prev);
            if (newSet.has(title)) {
                newSet.delete(title);
            } else {
                newSet.add(title);
            }
            return newSet;
        });
    };

    return (
        <>
            {/* Logout Confirmation Dialog - Enhanced */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg">
                                    <LogOut className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Confirm Logout</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        You&apos;ll need to sign in again to access your dashboard
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-3">
                                <div className="flex items-start gap-2">
                                    <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                                    <p className="text-xs text-amber-800 dark:text-amber-200">
                                        Any unsaved changes will be lost. Make sure to save your work before logging out.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleLogoutCancel}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
                                >
                                    Stay Logged In
                                </button>
                                <button
                                    onClick={handleLogoutConfirm}
                                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Logout Loading Popup - Enhanced */}
            {isLoggingOut && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200">
                        <div className="relative">
                            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <LogOut className="w-5 h-5 text-indigo-500 animate-pulse" />
                            </div>
                        </div>
                        <p className="text-base font-semibold text-slate-900 dark:text-white">Logging out...</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Please wait while we sign you out</p>
                    </div>
                </div>
            )}

            {/* Mobile Menu Button - Enhanced */}
            <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-40 p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 group"
                aria-label="Open menu"
            >
                <Menu className="w-5 h-5 text-slate-700 dark:text-slate-300 group-hover:scale-110 transition-transform duration-200" />
            </button>

            {/* Overlay - Enhanced */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-200"
                    onClick={closeMobileMenu}
                />
            )}

            {/* Sidebar - Enhanced */}
            <aside
                className={`
                    fixed lg:sticky top-0 left-0 z-50
                    w-72 bg-white dark:bg-slate-800/95 backdrop-blur-sm border-r border-slate-200 dark:border-slate-700 flex flex-col
                    transform transition-all duration-300 ease-in-out shadow-xl
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                {/* Logo Section - Enhanced */}
                <div className="relative h-20 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-white via-white to-indigo-50/30 dark:from-slate-800 dark:via-slate-800 dark:to-indigo-950/20">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-2xl" />
                    <Link href="/dashboard" className="relative flex items-center gap-2 group">
                        <Image
                            src="/zopaylogo.png"
                            alt="ZoPay"
                            width={100}
                            height={32}
                            className="h-7 w-auto object-contain dark:brightness-0 dark:invert"
                        />
                    </Link>
                    <button
                        onClick={closeMobileMenu}
                        className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200"
                        aria-label="Close menu"
                    >
                        <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>
                </div>

                {/* Merchant Badge - Enhanced */}
                <div className="px-4 py-5 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-b from-slate-50/30 to-transparent dark:from-slate-800/20">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300" />
                        <div className="relative flex items-center gap-3 px-3 py-2.5 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl backdrop-blur-sm border border-indigo-200 dark:border-indigo-500/20">
                            <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
                                <Store className="w-3.5 h-3.5 text-white" />
                            </div>
                            <div className="flex-1">
                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Merchant Account</span>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400">Active · Production Ready</p>
                            </div>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                    </div>
                </div>

                {/* Navigation Menu - Enhanced */}
                <nav className="flex-1 px-3 py-6 space-y-5 overflow-y-auto">
                    {menuSections.map((section, sectionIndex) => {
                        const isCollapsed = section.title && collapsedSections.has(section.title);

                        return (
                            <div key={sectionIndex} className="space-y-2">
                                {/* Section Header */}
                                {section.title && (
                                    <button
                                        onClick={() => section.collapsible && toggleSection(section.title!)}
                                        className="group w-full flex items-center justify-between px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-all duration-200"
                                    >
                                        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            {section.title}
                                        </span>
                                        {section.collapsible && (
                                            <div className="p-0.5 rounded-md group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                                                {isCollapsed ? (
                                                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition-all duration-200" />
                                                ) : (
                                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition-all duration-200" />
                                                )}
                                            </div>
                                        )}
                                    </button>
                                )}

                                {/* Section Items */}
                                {!isCollapsed && (
                                    <div className="space-y-1 ml-1">
                                        {section.items.map((item) => {
                                            const isActive = pathname === item.href;
                                            return (
                                                <MenuItemLink
                                                    key={item.href}
                                                    item={item}
                                                    isActive={isActive}
                                                    onClick={closeMobileMenu}
                                                />
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                {/* Footer / Logout Button - Enhanced */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-gradient-to-t from-slate-50/30 to-transparent dark:from-slate-800/20">
                    <div className="space-y-3">
                        
                        {/* Logout Button */}
                        <button
                            onClick={handleLogoutClick}
                            disabled={isLoggingOut}
                            className="group w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="p-1 rounded-lg group-hover:bg-rose-100 dark:group-hover:bg-rose-500/20 transition-colors">
                                <LogOut className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                            </div>
                            <span>Logout</span>
                            <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-x-2 group-hover:translate-x-0" />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}