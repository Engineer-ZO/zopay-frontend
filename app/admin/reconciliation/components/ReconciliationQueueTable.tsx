"use client";

import { LinkIcon, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { ReconciliationQueueItem } from "@/features/settlements/types";

interface ReconciliationQueueTableProps {
  items: ReconciliationQueueItem[];
  isLoading?: boolean;
  onLink: (itemId: string) => void;
  onResolve: (itemId: string) => void;
}

export function ReconciliationQueueTable({
  items,
  isLoading = false,
  onLink,
  onResolve,
}: ReconciliationQueueTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "MISSING_IN_ZITOPAY":
        return "bg-red-100 text-red-700";
      case "MISSING_IN_GATEWAY":
        return "bg-orange-100 text-orange-700";
      case "AMOUNT_MISMATCH":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getGatewayColor = (gateway: string) => {
    switch (gateway) {
      case "MTN_MOMO":
        return "bg-yellow-100 text-yellow-700";
      case "ORANGE_MONEY":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <CheckCircle2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-sm font-semibold text-gray-900 mb-2">
          No items found
        </h3>
        <p className="text-xs text-gray-600">
          All reconciliation items have been resolved
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                Gateway
              </th>
              <th className="px-4 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                Reference
              </th>
              <th className="px-4 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-4 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                MSISDN
              </th>
              <th className="px-4 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-4 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                Resolved
              </th>
              <th className="px-4 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.map((item) => (
              <tr
                key={item.id}
                className={`hover:bg-gray-50/50 transition-colors ${
                  !item.resolved ? "bg-orange-50/30" : ""
                }`}
              >
                <td className="px-4 py-2.5">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${getGatewayColor(
                      item.gateway
                    )}`}
                  >
                    {item.gateway.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-xs font-mono text-gray-900">
                  {item.gatewayReference}
                </td>
                <td className="px-4 py-2.5 text-xs font-semibold text-gray-900">
                  {parseFloat(item.amount).toLocaleString()} FCFA
                </td>
                <td className="px-4 py-2.5 text-xs text-gray-600">
                  {item.msisdn}
                </td>
                <td className="px-4 py-2.5 text-xs text-gray-600">
                  {formatDate(item.timestamp)}
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(
                      item.matchStatus
                    )}`}
                  >
                    {item.matchStatus.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  {item.resolved ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-orange-600" />
                  )}
                </td>
                <td className="px-4 py-2.5 text-right">
                  {!item.resolved && (
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onLink(item.id)}
                        className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-medium rounded-md transition-all flex items-center gap-1"
                      >
                        <LinkIcon className="w-3 h-3" />
                        Link
                      </button>
                      <button
                        onClick={() => onResolve(item.id)}
                        className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-[10px] font-medium rounded-md transition-all flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Resolve
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
