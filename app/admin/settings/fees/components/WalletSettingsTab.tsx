"use client";

import { useState, useEffect } from "react";
import { Save, Wallet, AlertCircle } from "lucide-react";
import { usePlatformWalletFeeSettings, useUpdatePlatformWalletFeeSettings } from "@/features/admin/queries";
import { toast } from "sonner";

export default function WalletSettingsTab() {
  const { data, isLoading, error } = usePlatformWalletFeeSettings();
  const updateMutation = useUpdatePlatformWalletFeeSettings();

  const [formData, setFormData] = useState({
    chargePlatformFeeOnTopup: false,
    chargePlatformFeeOnWithdrawal: false,
  });

  // Update form data when data loads
  useEffect(() => {
    if (data) {
      setFormData({
        chargePlatformFeeOnTopup: data.chargePlatformFeeOnTopup,
        chargePlatformFeeOnWithdrawal: data.chargePlatformFeeOnWithdrawal,
      });
    }
  }, [data]);

  const handleSubmit = async () => {
    try {
      await updateMutation.mutateAsync(formData);
      toast.success("Wallet fee settings updated successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update wallet fee settings");
    }
  };

  return (
    <div className="space-y-4">
      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900 mb-1">Global Wallet Fee Settings</h3>
            <p className="text-xs text-blue-700">
              These settings apply to <strong>ALL merchants</strong> globally. When enabled, platform fees will be charged on wallet operations (top-ups and withdrawals) for all merchants.
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800 font-semibold mb-1">Error loading wallet settings</p>
          <p className="text-xs text-red-600">{error.message}</p>
        </div>
      )}

      {/* Settings Form */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-pulse space-y-4">
              <div className="w-64 h-4 bg-gray-200 rounded mx-auto" />
              <div className="w-48 h-4 bg-gray-200 rounded mx-auto" />
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Top-up Setting */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-start gap-3">
                <Wallet className="w-5 h-5 text-gray-500 mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Charge Platform Fee on Top-ups</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    When enabled, platform fees will be charged on all merchant wallet top-up operations.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFormData(prev => ({ ...prev, chargePlatformFeeOnTopup: !prev.chargePlatformFeeOnTopup }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.chargePlatformFeeOnTopup ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition ${
                    formData.chargePlatformFeeOnTopup ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Withdrawal Setting */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-start gap-3">
                <Wallet className="w-5 h-5 text-gray-500 mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Charge Platform Fee on Withdrawals</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    When enabled, platform fees will be charged on all merchant wallet withdrawal operations.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFormData(prev => ({ ...prev, chargePlatformFeeOnWithdrawal: !prev.chargePlatformFeeOnWithdrawal }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.chargePlatformFeeOnWithdrawal ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition ${
                    formData.chargePlatformFeeOnWithdrawal ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Last Updated */}
            {data?.updatedAt && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Last updated: {new Date(data.updatedAt).toLocaleString()}
                </p>
              </div>
            )}

            {/* Save Button */}
            <div className="flex items-center justify-end pt-4 border-t border-gray-200">
              <button
                onClick={handleSubmit}
                disabled={updateMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {updateMutation.isPending ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
