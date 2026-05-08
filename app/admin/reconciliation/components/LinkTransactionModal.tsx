"use client";

import { X, Link as LinkIcon } from "lucide-react";
import { useState } from "react";

interface LinkTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLink: (data: { transactionId: string; notes?: string }) => void;
  isLoading?: boolean;
}

export function LinkTransactionModal({
  isOpen,
  onClose,
  onLink,
  isLoading = false,
}: LinkTransactionModalProps) {
  const [transactionId, setTransactionId] = useState("");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim()) {
      return;
    }
    onLink({
      transactionId: transactionId.trim(),
      notes: notes.trim() || undefined,
    });
    setTransactionId("");
    setNotes("");
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-blue-600" />
            Link Transaction
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
            <label className="text-xs font-medium text-gray-700 mb-2 block">
              ZitoPay Transaction ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="tx-123"
              required
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the ZitoPay transaction ID to link
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 mb-2 block">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Manually linked after investigation..."
              rows={3}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
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
              disabled={isLoading || !transactionId.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Linking..." : "Link Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
