"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Globe, Network } from "lucide-react";
import { NetworkAccessDomainsTab } from "@/components/dashboard/settings/NetworkAccessDomainsTab";
import { NetworkAccessIpsTab } from "@/components/dashboard/settings/NetworkAccessIpsTab";

export type NetworkAccessTab = "domains" | "ips";

function tabFromParam(value: string | null): NetworkAccessTab {
    return value === "ips" ? "ips" : "domains";
}

export function NetworkAccessView() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const activeTab = useMemo(
        () => tabFromParam(searchParams.get("tab")),
        [searchParams]
    );

    const setTab = useCallback(
        (tab: NetworkAccessTab) => {
            const next = tab === "domains" ? "domains" : "ips";
            const params = new URLSearchParams(searchParams.toString());
            params.set("tab", next);
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        },
        [pathname, router, searchParams]
    );

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div>
                <h1 className="text-xl font-bold text-foreground">Network access</h1>
                <p className="text-xs text-muted-foreground mt-1">
                    Register up to one domain and one IP address for your production API (one each per account)
                </p>
            </div>

            <div className="flex flex-wrap gap-2 p-1 bg-muted/40 rounded-xl border border-border w-fit">
                <button
                    type="button"
                    onClick={() => setTab("domains")}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        activeTab === "domains"
                            ? "bg-orange-500 text-white shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-background/80"
                    }`}
                >
                    <Globe className="w-4 h-4" />
                    Domains
                </button>
                <button
                    type="button"
                    onClick={() => setTab("ips")}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        activeTab === "ips"
                            ? "bg-orange-500 text-white shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-background/80"
                    }`}
                >
                    <Network className="w-4 h-4" />
                    IP Whitelist
                </button>
            </div>

            {activeTab === "domains" ? <NetworkAccessDomainsTab /> : <NetworkAccessIpsTab />}
        </div>
    );
}
