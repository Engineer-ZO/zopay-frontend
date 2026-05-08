"use client";

import { useState } from "react";
import { X, AlertTriangle, CheckCircle2, XCircle, Wallet, Loader2 } from "lucide-react";
import { AdminTransaction } from "@/features/admin/types";

interface ReconcileTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (action: 'COMPLETE' | 'FAIL', notes: string) => void;
  transaction: AdminTransaction | null;
  isLoading?: boolean;
}

export default function ReconcileTransactionModal({
  isOpen,
  onClose,
  onConfirm,
  transaction,
  isLoading = false,
}: ReconcileTransactionModalProps) {
  const [selectedAction, setSelectedAction] = useState<'COMPLETE' | 'FAIL' | null>(null);
  const [notes, setNotes] = useState("");
  const [showNotesInput, setShowNotesInput] = useState(false);

  if (!isOpen || !transaction) return null;

  // Check if transaction can be reconciled
  const canReconcile = ['PROCESSING', 'VERIFYING', 'PENDING'].includes(transaction.status);
  const isCollection = transaction.transactionType === 'COLLECTION';

  const handleActionSelect = (action: 'COMPLETE' | 'FAIL') => {
    setSelectedAction(action);
    setShowNotesInput(true);
  };

  const handleConfirm = () => {
    if (!selectedAction || !notes.trim()) {
      return;
    }
    onConfirm(selectedAction, notes.trim());
    // Reset state after confirmation
    setTimeout(() => {
      setSelectedAction(null);
      setNotes("");
      setShowNotesInput(false);
    }, 100);
  };

  const handleClose = () => {
    if (!isLoading) {
      setSelectedAction(null);
      setNotes("");
      setShowNotesInput(false);
      onClose();
    }
  };

  const formatAmount = (amount: string, currency: string): string => {
    const num = parseFloat(amount);
    return `${num.toLocaleString()} ${currency}`;
  };

  if (!canReconcile) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Cannot Reconcile</h3>
                <p className="text-xs text-gray-500 mt-0.5">Transaction already finalized</p>
              </div>
            </div>
            {!isLoading && (
              <button
                onClick={handleClose}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-900">
                This transaction is in <strong>{transaction.status}</strong> status and cannot be manually reconciled.
              </p>
              <p className="text-xs text-red-700 mt-2">
                Only transactions in PROCESSING, VERIFYING, or PENDING status can be reconciled.
              </p>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Manual Reconciliation</h3>
              <p className="text-xs text-gray-500 mt-0.5">Mark transaction as complete or failed</p>
            </div>
          </div>
          {!isLoading && (
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Transaction Details */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Transaction Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-mono font-semibold text-gray-900">{transaction.transactionId.slice(0, 12)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Merchant:</span>
                <span className="font-semibold text-gray-900">{transaction.merchantBusinessName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold text-gray-900">{formatAmount(transaction.amount, transaction.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gateway:</span>
                <span className="font-semibold text-gray-900">{transaction.gateway}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-semibold text-orange-600">{transaction.status}</span>
              </div>
            </div>
          </div>

          {/* Action Selection */}
          {!showNotesInput && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Select Action:</p>
              <div className="grid grid-cols-2 gap-3">
                {/* Mark as Complete */}
                <button
                  onClick={() => handleActionSelect('COMPLETE')}
                  className="p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all text-left"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="font-bold text-gray-900">Mark as Complete</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {isCollection 
                      ? `Merchant wallet will be credited with ${formatAmount(transaction.netToMerchant, transaction.currency)}`
                      : 'Transaction will be marked as successful'}
                  </p>
                </button>

                {/* Mark as Failed */}
                <button
                  onClick={() => handleActionSelect('FAIL')}
                  className="p-4 border-2 border-red-200 rounded-lg hover:border-red-400 hover:bg-red-50 transition-all text-left"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <XCircle className="w-4 h-4 text-red-600" />
                    </div>
                    <span className="font-bold text-gray-900">Mark as Failed</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    No wallet changes. Transaction will be marked as failed.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Notes Input */}
          {showNotesInput && selectedAction && (
            <div className="space-y-3">
              <div className={`p-4 rounded-lg border-2 ${
                selectedAction === 'COMPLETE' 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {selectedAction === 'COMPLETE' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-bold text-green-900">Marking as Complete</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-bold text-red-900">Marking as Failed</span>
                    </>
                  )}
                </div>
                {selectedAction === 'COMPLETE' && isCollection && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-green-800">
                    <Wallet className="w-3 h-3" />
                    <span>Merchant wallet will be credited: <strong>{formatAmount(transaction.netToMerchant, transaction.currency)}</strong></span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Reconciliation Notes <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={
                    selectedAction === 'COMPLETE'
                      ? "e.g., Customer confirmed payment via phone call, Gateway timeout occurred but payment was processed"
                      : "e.g., Gateway confirmed transaction never processed, Customer payment attempt failed"
                  }
                  rows={4}
                  required
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Please provide details about why you are reconciling this transaction
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowNotesInput(false);
                    setSelectedAction(null);
                    setNotes("");
                  }}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isLoading || !notes.trim()}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                    selectedAction === 'COMPLETE'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Reconciling...
                    </>
                  ) : (
                    <>
                      {selectedAction === 'COMPLETE' ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Confirm Complete
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          Confirm Failed
                        </>
                      )}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Only show if no action selected */}
        {!showNotesInput && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
