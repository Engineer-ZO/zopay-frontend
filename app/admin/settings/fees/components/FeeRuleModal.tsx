"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useCreateFeeRule, useUpdateFeeRule, useFeeVersions } from "@/features/admin/queries";
import { FeeRule, CreateFeeRuleRequest, UpdateFeeRuleRequest } from "@/features/admin/types";
import { toast } from "sonner";

interface FeeRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  rule?: FeeRule;
  activeVersionId?: string;
}

export default function FeeRuleModal({ isOpen, onClose, mode, rule, activeVersionId }: FeeRuleModalProps) {
  const { data: versionsData } = useFeeVersions();
  const createMutation = useCreateFeeRule();
  const updateMutation = useUpdateFeeRule();

  // Derive initial form data from props
  const initialFormData = {
    feeVersionId: rule?.feeVersionId || activeVersionId || "",
    gateway: rule?.gateway || "MTN_MOMO",
    transactionType: (rule?.transactionType || "COLLECTION") as "COLLECTION" | "DISBURSEMENT",
    currency: rule?.currency || "XAF",
    minAmount: rule?.minAmount || "0.00",
    maxAmount: rule?.maxAmount || "1000000.00",
    gatewayFeeType: (rule?.gatewayFeeType || "PERCENTAGE") as "PERCENTAGE" | "FIXED" | "TIERED",
    gatewayFeeValue: rule?.gatewayFeeValue || "1.00",
    platformFeeType: (rule?.platformFeeType || "PERCENTAGE") as "PERCENTAGE" | "FIXED" | "TIERED",
    platformFeeValue: rule?.platformFeeValue || "0.50",
    priority: rule?.priority || 0,
    status: (rule?.status || "INACTIVE") as "ACTIVE" | "INACTIVE",
  };

  // Initialize state - will be reset when component remounts (via key prop)
  const [formData, setFormData] = useState(initialFormData);

  const handleSubmit = async () => {
    if (!formData.feeVersionId) {
      toast.error("Fee version is required");
      return;
    }

    try {
      if (mode === "create") {
        const request: CreateFeeRuleRequest = {
          feeVersionId: formData.feeVersionId,
          gateway: formData.gateway,
          transactionType: formData.transactionType,
          currency: formData.currency,
          minAmount: formData.minAmount,
          maxAmount: formData.maxAmount,
          gatewayFeeType: formData.gatewayFeeType,
          gatewayFeeValue: formData.gatewayFeeValue,
          platformFeeType: formData.platformFeeType,
          platformFeeValue: formData.platformFeeValue,
          priority: formData.priority,
        };
        await createMutation.mutateAsync(request);
        toast.success("Fee rule created successfully. Remember to activate it to use it.");
      } else {
        const request: UpdateFeeRuleRequest = {
          minAmount: formData.minAmount,
          maxAmount: formData.maxAmount,
          gatewayFeeType: formData.gatewayFeeType,
          gatewayFeeValue: formData.gatewayFeeValue,
          platformFeeType: formData.platformFeeType,
          platformFeeValue: formData.platformFeeValue,
          priority: formData.priority,
          status: formData.status,
        };
        await updateMutation.mutateAsync({ id: rule!.id, data: request });
        toast.success("Fee rule updated successfully");
      }
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || `Failed to ${mode} fee rule`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">
            {mode === "create" ? "Create Fee Rule" : "Edit Fee Rule"}
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
                Fee Version <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.feeVersionId}
                onChange={(e) => setFormData(prev => ({ ...prev, feeVersionId: e.target.value }))}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-xs"
              >
                <option value="">Select version</option>
                {versionsData?.feeVersions.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.version} {v.isActive && "(Active)"}
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

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Priority
              </label>
              <input
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Min Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.minAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, minAmount: e.target.value }))}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Max Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.maxAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, maxAmount: e.target.value }))}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-xs"
              />
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
                placeholder={formData.gatewayFeeType === "PERCENTAGE" ? "e.g., 1.00" : "e.g., 100.00"}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-xs disabled:bg-gray-50"
              />
              {formData.gatewayFeeType === "TIERED" && (
                <p className="text-[10px] text-gray-500 mt-1">Configure tiers after creating the rule</p>
              )}
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
                placeholder={formData.platformFeeType === "PERCENTAGE" ? "e.g., 0.50" : "e.g., 50.00"}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-xs disabled:bg-gray-50"
              />
              {formData.platformFeeType === "TIERED" && (
                <p className="text-[10px] text-gray-500 mt-1">Configure tiers after creating the rule</p>
              )}
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
              disabled={createMutation.isPending || updateMutation.isPending || !formData.feeVersionId}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Saving..."
                : mode === "create"
                  ? "Create Rule"
                  : "Update Rule"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
