"use client";

import { TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  currency?: string;
  change?: string;
  trend?: "up" | "down";
  subtitle?: string;
  icon?: React.ReactNode;
  bgColor?: string;
  iconColor?: string;
  isLoading?: boolean;
}

export default function MetricCard({
  label,
  value,
  currency = "",
  change,
  trend,
  subtitle,
  icon,
  bgColor = "bg-blue-50",
  iconColor = "text-blue-600",
  isLoading = false,
}: MetricCardProps) {
  if (isLoading) {
    return (
      <div className={`${bgColor} rounded-lg p-4 border border-gray-200`}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          <div className="h-6 bg-gray-300 rounded w-3/4"></div>
          {subtitle && <div className="h-3 bg-gray-300 rounded w-1/2"></div>}
        </div>
      </div>
    );
  }

  return (
    <div className={`${bgColor} rounded-lg p-4 border border-gray-200`}>
      <div className="flex items-start justify-between mb-2">
        {icon && (
          <div className={`w-8 h-8 ${iconColor.replace('text-', 'bg-')} rounded-lg flex items-center justify-center`}>
            {icon}
          </div>
        )}
        {change && trend && (
          <span
            className={`flex items-center gap-1 text-xs font-semibold ${
              trend === "up" ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend === "up" ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {change}
          </span>
        )}
      </div>
      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-lg font-bold text-gray-900">
        {currency && `${currency} `}
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
  );
}
