"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";

// Define navigation order for all docs pages
const navigationOrder: Record<string, { prev?: string; next?: string; prevTitle?: string; nextTitle?: string }> = {
    "/docs/getting-started/introduction": {
        next: "/docs/getting-started/implementation-guide",
        nextTitle: "Implementation Guide",
    },
    "/docs/getting-started/implementation-guide": {
        prev: "/docs/getting-started/introduction",
        prevTitle: "Introduction",
        next: "/docs/getting-started/using-the-api",
        nextTitle: "Using the API",
    },
    "/docs/getting-started/using-the-api": {
        prev: "/docs/getting-started/implementation-guide",
        prevTitle: "Implementation Guide",
        next: "/docs/collections/overview",
        nextTitle: "Collections Overview",
    },
    "/docs/collections/overview": {
        prev: "/docs/getting-started/using-the-api",
        prevTitle: "Using the API",
        next: "/docs/collections/create-quote",
        nextTitle: "Create Quote",
    },
    "/docs/collections/create-quote": {
        prev: "/docs/collections/overview",
        prevTitle: "Collections Overview",
        next: "/docs/collections/execute",
        nextTitle: "Execute Collection",
    },
    "/docs/collections/execute": {
        prev: "/docs/collections/create-quote",
        prevTitle: "Create Quote",
        next: "/docs/collections/status",
        nextTitle: "Transaction Status",
    },
    "/docs/collections/status": {
        prev: "/docs/collections/execute",
        prevTitle: "Execute Collection",
        next: "/docs/checkout",
        nextTitle: "Hosted Checkout",
    },
    "/docs/checkout": {
        prev: "/docs/collections/status",
        prevTitle: "Transaction Status",
        next: "/docs/disbursements/overview",
        nextTitle: "Disbursements Overview",
    },
    "/docs/disbursements/overview": {
        prev: "/docs/checkout",
        prevTitle: "Hosted Checkout",
        next: "/docs/disbursements/create-quote",
        nextTitle: "Create Quote",
    },
    "/docs/disbursements/create-quote": {
        prev: "/docs/disbursements/overview",
        prevTitle: "Disbursements Overview",
        next: "/docs/disbursements/execute",
        nextTitle: "Execute",
    },
    "/docs/disbursements/execute": {
        prev: "/docs/disbursements/create-quote",
        prevTitle: "Create Quote",
        next: "/docs/disbursements/get-status",
        nextTitle: "Get Status",
    },
    "/docs/disbursements/get-status": {
        prev: "/docs/disbursements/execute",
        prevTitle: "Execute",
        next: "/docs/disbursements/list-payouts",
        nextTitle: "List Payouts",
    },
    "/docs/disbursements/list-payouts": {
        prev: "/docs/disbursements/get-status",
        prevTitle: "Get Status",
        next: "/docs/disbursements/bulk-payouts",
        nextTitle: "Bulk Payouts",
    },
    "/docs/disbursements/bulk-payouts": {
        prev: "/docs/disbursements/list-payouts",
        prevTitle: "List Payouts",
        next: "/docs/refunds",
        nextTitle: "Refunds Overview",
    },
    "/docs/refunds": {
        prev: "/docs/disbursements/bulk-payouts",
        prevTitle: "Bulk Payouts",
        next: "/docs/webhooks/overview",
        nextTitle: "Webhooks Overview",
    },
    "/docs/webhooks/overview": {
        prev: "/docs/refunds",
        prevTitle: "Refunds Overview",
        next: "/docs/webhooks/register",
        nextTitle: "Register Endpoint",
    },
    "/docs/webhooks/register": {
        prev: "/docs/webhooks/overview",
        prevTitle: "Webhooks Overview",
        next: "/docs/webhooks/events",
        nextTitle: "Webhook Events",
    },
    "/docs/webhooks/events": {
        prev: "/docs/webhooks/register",
        prevTitle: "Register Endpoint",
        next: "/docs/webhooks/security",
        nextTitle: "Webhook Security",
    },
    "/docs/webhooks/security": {
        prev: "/docs/webhooks/events",
        prevTitle: "Webhook Events",
        next: "/docs/faq",
        nextTitle: "FAQ",
    },
    "/docs/faq": {
        prev: "/docs/webhooks/security",
        prevTitle: "Webhook Security",
    },
    "/docs/authentication": {
        next: "/docs/collections",
        nextTitle: "Collections",
    },
    "/docs/mtn-momo": {
        next: "/docs/orange-money",
        nextTitle: "Orange Money",
    },
    "/docs/orange-money": {
        prev: "/docs/mtn-momo",
        prevTitle: "MTN Mobile Money",
    },
};

export function DocsNavigation() {
    const pathname = usePathname();
    const nav = navigationOrder[pathname || ""];

    if (!nav || (!nav.prev && !nav.next)) {
        return null;
    }

    return (
        <div className="mt-12 pt-8 border-t border-border">
            <div className="flex items-center justify-between gap-4">
                {/* Previous Button */}
                {nav.prev ? (
                    <Link
                        href={nav.prev}
                        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
                    >
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        <div className="flex flex-col items-start">
                            <span className="text-xs text-muted-foreground">Previous</span>
                            <span>{nav.prevTitle}</span>
                        </div>
                    </Link>
                ) : (
                    <div></div>
                )}

                {/* Next Button */}
                {nav.next ? (
                    <Link
                        href={nav.next}
                        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group ml-auto"
                    >
                        <div className="flex flex-col items-end">
                            <span className="text-xs text-muted-foreground">Next</span>
                            <span>{nav.nextTitle}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                ) : null}
            </div>
        </div>
    );
}
