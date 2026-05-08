"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useCreateMerchantFeeOverride, useUpdateMerchantFeeOverride, useMerchantUsers } from "@/features/admin/queries";
import { MerchantFeeOverride, CreateMerchantFeeOverrideRequest, UpdateMerchantFeeOverrideRequest } from "@/features/admin/types";
import { toast } from "sonner";

interface MerchantOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  override?: MerchantFeeOverride;
}

export default function MerchantOverrideModal({ isOpen, onClose, mode, override }: MerchantOverrideModalProps) {
  const { data: merchantsData } = useMerchantUsers();
  const createMutation = useCreateMerchantFeeOverride();
  const updateMutation = useUpdateMerchantFeeOverride();

  const [formData, setFormData] = useState({
    merchantId: override?.merchantId || "",
    gateway: override?.gateway || "MTN_MOMO",
    transactionType: (override?.transactionType || "COLLECTION") as "COLLECTION" | "DISBURSEMENT",
    currency: override?.currency || "XAF",
    gatewayFeeType: (override?.gatewayFeeType || "PERCENTAGE") as "PERCENTAGE" | "FIXED" | "TIERED",
    gatewayFeeValue: override?.gatewayFeeValue || "0.75",
    platformFeeType: (override?.platformFeeType || "PERCENTAGE") as "PERCENTAGE" | "FIXED" | "TIERED",
    platformFeeValue: override?.platformFeeValue || "0.25",
    status: (override?.status || "ACTIVE") as "ACTIVE" | "INACTIVE",
  });

  useEffect(() => {
    if (override) {
      setFormData({
        merchantId: override.merchantId,
        gateway: override.gateway,
        transactionType: override.transactionType,
        currency: override.currency,
        gatewayFeeType: override.gatewayFeeType,
        gatewayFeeValue: override.gatewayFeeValue,
        platformFeeType: override.platformFeeType,
        platformFeeValue: override.platformFeeValue,
        status: override.status,
      });
    }
  }, [override]);

  // Get unique merchants
  const uniqueMerchants = merchantsData?.merchantUsers
    ? Array.from(new Map(merchantsData.merchantUsers.map(mu => [mu.merchantId, mu])).values())
    : [];

  const handleSubmit = async () => {
    if (!formData.merchantId) {
      toast.error("Merchant is required");
      return;
    }

    try {
      if (mode === "create") {
        const request: CreateMerchantFeeOverrideRequest = {
          merchantId: formData.merchantId,
          gateway: formData.gateway,
          transactionType: formData.transactionType,
          currency: formData.currency,
          gatewayFeeType: formData.gatewayFeeType,
          gatewayFeeValue: formData.gatewayFeeValue,
          platformFeeType: formData.platformFeeType,
          platformFeeValue: formData.platformFeeValue,
        };
        await createMutation.mutateAsync(request);
        toast.success("Merchant override created successfully");
      } else {
        const request: UpdateMerchantFeeOverrideRequest = {
          gatewayFeeType: formData.gatewayFeeType,
          gatewayFeeValue: formData.gatewayFeeValue,
          platformFeeType: formData.platformFeeType,
          platformFeeValue: formData.platformFeeValue,
          status: formData.status,
        };
        await updateMutation.mutateAsync({ id: override!.id, data: request });
        toast.success("Merchant override updated successfully");
      }
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to ${mode} merchant override`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">
            {mode === "create" ? "Create Merchant Override" : "Edit Merchant Override"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {mode === "create" && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Merchant <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.merchantId}
                onChange={(e) => setFormData(prev => ({ ...prev, merchantId: e.target.value }))}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-xs"
              >
                <option value="">Select merchant</option>
                {uniqueMerchants.map((mu) => (
                  <option key={mu.merchantId} value={mu.merchantId}>
                    {mu.businessName} ({mu.merchantId.slice(0, 8)}...)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Gateway <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.gateway}
                onChange={(e) => setFormData(prev => ({ ...prev, gateway: e.target.value }))}
                disabled={mode === "edit"}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-xs disabled:bg-gray-50"
              >
                <option value="MTN_MOMO">MTN Mobile Money</option>
                <option value="ORANGE_MONEY">Orange Money</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Transaction Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.transactionType}
                onChange={(e) => setFormData(prev => ({ ...prev, transactionType: e.target.value as "COLLECTION" | "DISBURSEMENT" }))}
                disabled={mode === "edit"}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-xs disabled:bg-gray-50"
              >
                <option value="COLLECTION">Collection</option>
                <option value="DISBURSEMENT">Disbursement</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Currency <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                disabled={mode === "edit"}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-xs disabled:bg-gray-50"
              >
                <option value="XAF">XAF</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Gateway Fee Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.gatewayFeeType}
                onChange={(e) => setFormData(prev => ({ ...prev, gatewayFeeType: e.target.value as "PERCENTAGE" | "FIXED" | "TIERED" }))}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-xs"
              >
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED">Fixed</option>
                <option value="TIERED">Tiered</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Gateway Fee Value <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.gatewayFeeValue}
                onChange={(e) => setFormData(prev => ({ ...prev, gatewayFeeValue: e.target.value }))}
                disabled={formData.gatewayFeeType === "TIERED"}
                placeholder={formData.gatewayFeeType === "PERCENTAGE" ? "e.g., 0.75" : "e.g., 100.00"}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-xs disabled:bg-gray-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Platform Fee Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.platformFeeType}
                onChange={(e) => setFormData(prev => ({ ...prev, platformFeeType: e.target.value as "PERCENTAGE" | "FIXED" | "TIERED" }))}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-xs"
              >
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED">Fixed</option>
                <option value="TIERED">Tiered</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Platform Fee Value <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.platformFeeValue}
                onChange={(e) => setFormData(prev => ({ ...prev, platformFeeValue: e.target.value }))}
                disabled={formData.platformFeeType === "TIERED"}
                placeholder={formData.platformFeeType === "PERCENTAGE" ? "e.g., 0.25" : "e.g., 50.00"}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-xs disabled:bg-gray-50"
              />
            </div>
          </div>

          {mode === "edit" && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as "ACTIVE" | "INACTIVE" }))}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-xs"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          )}

          <div className="flex items-center gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending || (mode === "create" && !formData.merchantId)}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Saving..."
                : mode === "create"
                  ? "Create Override"
                  : "Update Override"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
