"use client";

import { X, AlertTriangle, Rocket, Ban } from "lucide-react";
import { FeeRule } from "@/features/admin/types";

interface FeeRuleConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  rule: FeeRule | null;
  action: "activate" | "deactivate";
  isLoading?: boolean;
}

export default function FeeRuleConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  rule,
  action,
  isLoading = false,
}: FeeRuleConfirmationModalProps) {
  if (!isOpen || !rule) return null;

  const isActivate = action === "activate";

  const getMessage = () => {
    if (isActivate) {
      return `Activating this ${rule.gateway} ${rule.currency} ${rule.transactionType} rule will deactivate all other active ${rule.gateway} ${rule.currency} ${rule.transactionType} rules. Continue?`;
    } else {
      return `Are you sure you want to deactivate this fee rule?`;
    }
  };

  const getRuleDetails = () => {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-3">
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">Gateway:</span>
            <span className="font-semibold text-gray-900">{rule.gateway}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Type:</span>
            <span className="font-semibold text-gray-900">{rule.transactionType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Currency:</span>
            <span className="font-semibold text-gray-900">{rule.currency}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Amount Range:</span>
            <span className="font-semibold text-gray-900">
              {formatAmount(rule.minAmount)} - {formatAmount(rule.maxAmount)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const formatAmount = (amount: string): string => {
    return parseFloat(amount).toLocaleString();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isActivate ? (
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Rocket className="w-5 h-5 text-orange-600" />
              </div>
            ) : (
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Ban className="w-5 h-5 text-red-600" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {isActivate ? "Activate Fee Rule" : "Deactivate Fee Rule"}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {isActivate ? "Confirm activation" : "Confirm deactivation"}
              </p>
            </div>
          </div>
          {!isLoading && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Warning Message */}
          <div className={`flex items-start gap-3 p-4 rounded-lg mb-4 ${
            isActivate 
              ? "bg-orange-50 border border-orange-200" 
              : "bg-red-50 border border-red-200"
          }`}>
            <AlertTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
              isActivate ? "text-orange-600" : "text-red-600"
            }`} />
            <p className={`text-sm ${
              isActivate ? "text-orange-900" : "text-red-900"
            }`}>
              {getMessage()}
            </p>
          </div>

          {/* Rule Details */}
          {getRuleDetails()}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
              isActivate
                ? "bg-orange-600 hover:bg-orange-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {isActivate ? "Activating..." : "Deactivating..."}
              </>
            ) : (
              <>
                {isActivate ? (
                  <>
                    <Rocket className="w-4 h-4" />
                    Activate
                  </>
                ) : (
                  <>
                    <Ban className="w-4 h-4" />
                    Deactivate
                  </>
                )}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
