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
    // Dashboard (no section header)
    {
        items: [
            {
                icon: LayoutDashboard,
                label: "Dashboard",
                href: "/dashboard",
            },
        ],
    },
    // PAYMENTS
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
    // FINANCE
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
    // DEVELOPER
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
    // INSIGHTS
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
    // SETTINGS
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
    // SUPPORT
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
            {/* Logout Confirmation Dialog */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black/50 z-100 flex items-center justify-center p-4">
                    <div className="bg-background rounded-2xl p-6 shadow-2xl border border-border max-w-md w-full">
                        <h3 className="text-xl font-bold text-foreground mb-2">Confirm Logout</h3>
                        <p className="text-sm text-muted-foreground mb-6">
                            Are you sure you want to logout? You&apos;ll need to sign in again to access your dashboard.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={handleLogoutCancel}
                                className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLogoutConfirm}
                                className="px-4 py-2 rounded-lg bg-crimson-red-500 text-white hover:bg-crimson-red-600 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Logout Loading Popup */}
            {isLoggingOut && (
                <div className="fixed inset-0 bg-black/50 z-100 flex items-center justify-center">
                    <div className="bg-background rounded-2xl p-8 shadow-2xl border border-border flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-crimson-red-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-lg font-semibold text-foreground">Logging out...</p>
                    </div>
                </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-background border border-border rounded-lg shadow-md hover:bg-muted transition-colors"
                aria-label="Open menu"
            >
                <Menu className="w-6 h-6 text-foreground" />
            </button>

            {/* Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={closeMobileMenu}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed lg:static inset-y-0 left-0 z-50
                    w-64 bg-background border-r border-border flex flex-col
                    transform transition-transform duration-300 ease-in-out
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                {/* Logo & Close Button */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-border">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <Image
                            src="/zitopaylogo.png"
                            alt="ZitoPay"
                            width={120}
                            height={40}
                            className="h-8 w-auto object-contain"
                        />
                    </Link>

                    {/* Close button - only visible on mobile */}
                    <button
                        onClick={closeMobileMenu}
                        className="lg:hidden p-1 hover:bg-muted rounded transition-colors"
                        aria-label="Close menu"
                    >
                        <X className="w-6 h-6 text-foreground" />
                    </button>
                </div>

                {/* Merchant Badge */}
                <div className="px-4 py-4 border-b border-border">
                    <div className="flex items-center gap-3 px-3 py-2 bg-crimson-red-500/10 rounded-lg">
                        <div className="w-8 h-8 bg-crimson-red-500 rounded flex items-center justify-center">
                            <Store className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-foreground">Merchants</span>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto">
                    {menuSections.map((section, sectionIndex) => {
                        const isCollapsed = section.title && collapsedSections.has(section.title);

                        return (
                            <div key={sectionIndex}>
                                {/* Section Header */}
                                {section.title && (
                                    <button
                                        onClick={() => section.collapsible && toggleSection(section.title!)}
                                        className="w-full flex items-center justify-between px-3 py-2 mb-2 group"
                                    >
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            {section.title}
                                        </span>
                                        {section.collapsible && (
                                            isCollapsed ? (
                                                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                            )
                                        )}
                                    </button>
                                )}

                                {/* Section Items */}
                                {!isCollapsed && (
                                    <div className="space-y-1">
                                        {section.items.map((item) => {
                                            const Icon = item.icon;
                                            const isActive = pathname === item.href;

                                            return (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    onClick={closeMobileMenu}
                                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                                        ? "bg-crimson-red-500/10 text-crimson-red-600 dark:text-crimson-red-400"
                                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                                        }`}
                                                >
                                                    <Icon className="w-5 h-5" />
                                                    <span>{item.label}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                {/* Logout Button */}
                <div className="px-4 py-4 border-t border-border">
                    <button
                        onClick={handleLogoutClick}
                        disabled={isLoggingOut}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
}



