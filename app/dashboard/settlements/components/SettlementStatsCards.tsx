"use client";

import { Clock, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";
import { useUserMerchantData } from "@/features/merchants/context/MerchantContext";

interface SettlementStatsCardsProps {
  pending: number;
  processing: number;
  completed: number;
  totalNet?: number;
  isLoading?: boolean;
}

export function SettlementStatsCards({
  pending,
  processing,
  completed,
  totalNet,
  isLoading = false,
}: SettlementStatsCardsProps) {
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

  // Unified card style — same neutral background for all cards.
  // Only the primary card (TOTAL NET) gets an orange left-border accent.
  const cardStyle = {
    base: "bg-background rounded-lg p-3 border border-border hover:shadow-sm transition-shadow",
    primary: "bg-background rounded-lg p-3 border border-border border-l-2 border-l-orange-500 hover:shadow-sm transition-shadow",
    icon: {
      primary: "text-orange-500",
      secondary: "text-muted-foreground",
    },
  };

  const PRIMARY_STAT = "TOTAL NET";

  const stats = [
    { label: "PENDING", value: pending.toString(), icon: Clock, isPrimary: false },
    { label: "PROCESSING", value: processing.toString(), icon: AlertCircle, isPrimary: false },
    { label: "COMPLETED", value: completed.toString(), icon: CheckCircle2, isPrimary: false },
    ...(totalNet !== undefined ? [{ label: "TOTAL NET", value: `${totalNet.toLocaleString()} ${currency}`, icon: TrendingUp, isPrimary: true }] : []),
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
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
