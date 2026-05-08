"use client";

import { DollarSign, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useUserMerchantData } from "@/features/merchants/context/MerchantContext";

interface RefundStatsCardsProps {
  total: number;
  successful: number;
  pending: number;
  failed: number;
  isLoading?: boolean;
}

// Unified card style — same neutral background for all cards.
// Only the primary card (TOTAL) gets an orange left-border accent.
// Icon colours are muted for secondary cards; orange for the primary.
const cardStyle = {
  base: "bg-background rounded-lg p-3 border border-border hover:shadow-sm transition-shadow",
  primary: "bg-background rounded-lg p-3 border border-border border-l-2 border-l-orange-500 hover:shadow-sm transition-shadow",
  icon: {
    primary: "text-orange-500",
    secondary: "text-muted-foreground",
  },
};

// Which stat label is the primary (highlighted) card
const PRIMARY_STAT = "TOTAL";

// Icon mapping for stats
const iconMap: Record<string, typeof DollarSign> = {
  "TOTAL": DollarSign,
  "SUCCESSFUL": CheckCircle2,
  "PENDING": Clock,
  "FAILED": XCircle,
};

export function RefundStatsCards({
  total,
  successful,
  pending,
  failed,
  isLoading = false,
}: RefundStatsCardsProps) {
  const { merchant } = useUserMerchantData();

  // Determine environment based on merchant state
  const environment: "sandbox" | "production" =
    merchant?.productionState === "ACTIVE" ? "production" : "sandbox";

  // Currency display
  const currency = environment === "production" ? "FCFA" : "XAF";
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-background rounded-lg p-3 border border-border animate-pulse"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="w-8 h-8 bg-muted rounded-lg" />
            </div>
            <div className="w-20 h-2.5 bg-muted rounded mb-1.5" />
            <div className="w-28 h-5 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    { label: "TOTAL", value: `${total.toLocaleString()} ${currency}`, isPrimary: true },
    { label: "SUCCESSFUL", value: successful.toString(), isPrimary: false },
    { label: "PENDING", value: pending.toString(), isPrimary: false },
    { label: "FAILED", value: failed.toString(), isPrimary: false },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat, index) => {
        const Icon = iconMap[stat.label] || DollarSign;
        const isPrimary = stat.label === PRIMARY_STAT;
        return (
          <div
            key={index}
            className={isPrimary ? cardStyle.primary : cardStyle.base}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="w-8 h-8 bg-muted/60 rounded-lg flex items-center justify-center">
                <Icon
                  className={`w-4 h-4 ${
                    isPrimary
                      ? cardStyle.icon.primary
                      : cardStyle.icon.secondary
                  }`}
                />
              </div>
            </div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">
              {stat.label}
            </p>
            <p
              className={`text-base font-semibold ${
                isPrimary ? "text-orange-500" : "text-foreground"
              }`}
            >
              {stat.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
