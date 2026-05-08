"use client";

import { X, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface CompleteSettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  settlementId: string | null;
  onComplete: (data: { bankTransferReference?: string }) => void;
  isLoading?: boolean;
}

export function CompleteSettlementModal({
  isOpen,
  onClose,
  settlementId,
  onComplete,
  isLoading = false,
}: CompleteSettlementModalProps) {
  const [bankRef, setBankRef] = useState("");

  if (!isOpen || !settlementId) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({
      bankTransferReference: bankRef || undefined,
    });
    setBankRef("");
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Complete Settlement
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-700 mb-4">
              Mark this settlement as completed after payment has been sent.
            </p>
            <label className="text-xs font-medium text-gray-700 mb-2 block">
              MoMo Transaction Reference (Optional)
            </label>
            <input
              type="text"
              value={bankRef}
              onChange={(e) => setBankRef(e.target.value)}
              placeholder="MTN_MOMO_TX_123456789"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional: Enter the mobile money transaction reference
            </p>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Completing..." : "Complete Settlement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
