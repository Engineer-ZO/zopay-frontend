"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Github, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

interface NavItem {
    title: string;
    href: string;
    isSubItem?: boolean;
}

interface NavSection {
    title: string;
    href: string; // Main link (goes to overview)
    subItems: NavItem[];
}

const getStartedSubItems: NavItem[] = [
    { title: "Introduction", href: "/docs/getting-started/introduction", isSubItem: true },
    { title: "Implementation Guide", href: "/docs/getting-started/implementation-guide", isSubItem: true },
    { title: "Using the API", href: "/docs/getting-started/using-the-api", isSubItem: true },
];

const collectionsSubItems: NavItem[] = [
    { title: "Overview", href: "/docs/collections/overview", isSubItem: true },
    { title: "Create Quote", href: "/docs/collections/create-quote", isSubItem: true },
    { title: "Execute Collection", href: "/docs/collections/execute", isSubItem: true },
    { title: "Transaction Status", href: "/docs/collections/status", isSubItem: true },
];

const checkoutSubItems: NavItem[] = [
    { title: "Overview", href: "/docs/checkout", isSubItem: true },
];

const disbursementsSubItems: NavItem[] = [
    { title: "Overview", href: "/docs/disbursements/overview", isSubItem: true },
    { title: "Create Quote", href: "/docs/disbursements/create-quote", isSubItem: true },
    { title: "Execute", href: "/docs/disbursements/execute", isSubItem: true },
    { title: "Get Status", href: "/docs/disbursements/get-status", isSubItem: true },
    { title: "List Payouts", href: "/docs/disbursements/list-payouts", isSubItem: true },
    { title: "Bulk Payouts", href: "/docs/disbursements/bulk-payouts", isSubItem: true },
];

const refundsSubItems: NavItem[] = [
    { title: "Overview", href: "/docs/refunds", isSubItem: true },
];

const webhooksSubItems: NavItem[] = [
    { title: "Overview", href: "/docs/webhooks/overview", isSubItem: true },
    { title: "Register Endpoint", href: "/docs/webhooks/register", isSubItem: true },
    { title: "Events", href: "/docs/webhooks/events", isSubItem: true },
    { title: "Security", href: "/docs/webhooks/security", isSubItem: true },
];

const navSections: NavSection[] = [
    {
        title: "Collections",
        href: "/docs/collections/overview",
        subItems: collectionsSubItems,
    },
    {
        title: "Hosted Checkout",
        href: "/docs/checkout",
        subItems: checkoutSubItems,
    },
    {
        title: "Disbursements",
        href: "/docs/disbursements/overview",
        subItems: disbursementsSubItems,
    },
    {
        title: "Refunds",
        href: "/docs/refunds",
        subItems: refundsSubItems,
    },
    {
        title: "Webhooks",
        href: "/docs/webhooks/overview",
        subItems: webhooksSubItems,
    },
];

export function DocsSidebar() {
    const pathname = usePathname();
    const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
        // Auto-expand sections if current path is within them
        const initial = new Set<string>();
        navSections.forEach((section) => {
            if (pathname?.startsWith(section.href) || section.subItems.some(item => pathname === item.href)) {
                initial.add(section.title);
            }
        });
        // Always expand Get Started
        initial.add("Get Started");
        return initial;
    });

    const toggleSection = (title: string) => {
        setExpandedSections((prev) => {
            const next = new Set(prev);
            if (next.has(title)) {
                next.delete(title);
            } else {
                next.add(title);
            }
            return next;
        });
    };

    return (
        <aside className="w-80 bg-background h-[calc(100vh-4rem)] sticky top-16 hidden md:flex flex-col border-r border-border">
            {/* Top Tabs - Fixed */}
            <div className="pt-8 px-4 pb-4 border-b border-border/50 mx-4 shrink-0">
                <div className="flex items-center justify-center gap-4 text-sm font-medium">
                    <Link
                        href="/docs"
                        className={pathname?.startsWith("/docs") && !pathname?.includes("api-reference")
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground transition-colors"
                        }
                    >
                        Documentation
                    </Link>
                    <Link
                        href="/docs/api-reference"
                        className={pathname?.includes("api-reference")
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground transition-colors"
                        }
                    >
                        API Reference
                    </Link>
                </div>
            </div>

            {/* Scrollable Navigation */}
            <div className="overflow-y-auto flex-1 px-6 py-4 flex flex-col">
                <div className="flex-1">
                    {/* Get Started Section */}
                    <div className="mb-4">
                        <div className="text-sm font-semibold text-foreground mb-3">
                            Get Started
                        </div>
                        <nav className="space-y-0.5">
                            {getStartedSubItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`block py-1.5 pl-6 text-sm transition-colors ${isActive
                                            ? "text-foreground font-medium"
                                            : "text-muted-foreground hover:text-foreground"
                                            }`}
                                    >
                                        {item.title}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Navigation Sections with Dropdowns */}
                    {navSections.map((section) => {
                        const isExpanded = expandedSections.has(section.title);

                        return (
                            <div key={section.title} className="mb-4">
                                <div className="flex items-center">
                                    <button
                                        onClick={() => toggleSection(section.title)}
                                        className="flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-foreground transition-colors flex-1"
                                    >
                                        {isExpanded ? (
                                            <ChevronDown className="w-3.5 h-3.5" />
                                        ) : (
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        )}
                                        <span>{section.title}</span>
                                    </button>
                                </div>
                                {isExpanded && (
                                    <nav className="space-y-0.5 mt-1">
                                        {/* Main overview link */}
                                        <Link
                                            href={section.href}
                                            className={`block py-1.5 pl-6 text-sm transition-colors ${pathname === section.href
                                                ? "text-foreground font-medium"
                                                : "text-muted-foreground hover:text-foreground"
                                                }`}
                                        >
                                            Overview
                                        </Link>
                                        {/* Sub-items */}
                                        {section.subItems
                                            .filter(item => item.href !== section.href) // Don't show overview twice
                                            .map((item) => {
                                                const isActive = pathname === item.href;
                                                return (
                                                    <Link
                                                        key={item.href}
                                                        href={item.href}
                                                        className={`block py-1.5 pl-6 text-sm transition-colors ${isActive
                                                            ? "text-foreground font-medium"
                                                            : "text-muted-foreground hover:text-foreground"
                                                            }`}
                                                    >
                                                        {item.title}
                                                    </Link>
                                                );
                                            })}
                                    </nav>
                                )}
                            </div>
                        );
                    })}

                    {/* FAQ */}
                    <div className="mb-4">
                        <Link
                            href="/docs/faq"
                            className={`block py-1.5 px-2 text-sm transition-colors ${pathname === "/docs/faq"
                                ? "text-foreground font-medium"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            FAQ
                        </Link>
                    </div>
                </div>

                {/* GitHub - Moved to bottom with spacing */}
                <div className="mt-8 pt-6 border-t border-border/50">
                    <a
                        href="https://github.com/zitopay"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm font-medium text-foreground hover:opacity-70 transition-opacity px-2"
                    >
                        <Github className="w-4 h-4" />
                        GitHub
                    </a>
                </div>
            </div>
        </aside>
    );
}
