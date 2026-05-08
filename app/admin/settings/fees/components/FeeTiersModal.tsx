"use client";

import { useState } from "react";
import { Plus, Edit, X, Trash2 } from "lucide-react";
import { useFeeTiers, useCreateFeeTier, useUpdateFeeTier } from "@/features/admin/queries";
import { FeeTier, CreateFeeTierRequest, UpdateFeeTierRequest } from "@/features/admin/types";
import { toast } from "sonner";

interface FeeTiersModalProps {
  isOpen: boolean;
  onClose: () => void;
  feeRuleId: string;
}

// Helper function to format amount
const formatAmount = (amount: string): string => {
  return parseFloat(amount).toLocaleString();
};

export default function FeeTiersModal({ isOpen, onClose, feeRuleId }: FeeTiersModalProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTier, setEditingTier] = useState<FeeTier | null>(null);
  const [formData, setFormData] = useState({
    minAmount: "",
    maxAmount: "",
    gatewayFeeValue: "",
    platformFeeValue: "",
  });

  const { data, isLoading } = useFeeTiers(feeRuleId, isOpen);
  const createMutation = useCreateFeeTier();
  const updateMutation = useUpdateFeeTier();

  const handleAdd = () => {
    setFormData({ minAmount: "", maxAmount: "", gatewayFeeValue: "", platformFeeValue: "" });
    setEditingTier(null);
    setShowAddModal(true);
  };

  const handleEdit = (tier: FeeTier) => {
    setFormData({
      minAmount: tier.minAmount,
      maxAmount: tier.maxAmount,
      gatewayFeeValue: tier.gatewayFeeValue,
      platformFeeValue: tier.platformFeeValue || "",
    });
    setEditingTier(tier);
    setShowAddModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.minAmount || !formData.maxAmount || !formData.gatewayFeeValue) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingTier) {
        const request: UpdateFeeTierRequest = {
          minAmount: formData.minAmount,
          maxAmount: formData.maxAmount,
          gatewayFeeValue: formData.gatewayFeeValue,
          platformFeeValue: formData.platformFeeValue || undefined,
        };
        await updateMutation.mutateAsync({ id: editingTier.id, data: request });
        toast.success("Tier updated successfully");
      } else {
        const request: CreateFeeTierRequest = {
          minAmount: formData.minAmount,
          maxAmount: formData.maxAmount,
          gatewayFeeValue: formData.gatewayFeeValue,
          platformFeeValue: formData.platformFeeValue || undefined,
        };
        await createMutation.mutateAsync({ feeRuleId, data: request });
        toast.success("Tier added successfully");
      }
      setShowAddModal(false);
      setEditingTier(null);
      setFormData({ minAmount: "", maxAmount: "", gatewayFeeValue: "", platformFeeValue: "" });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save tier");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Fee Tiers</h2>
              {data?.feeRule && (
                <p className="text-xs text-gray-500 mt-1">
                  {data.feeRule.gateway} - {data.feeRule.transactionType} - {data.feeRule.currency}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Tier
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">Loading tiers...</p>
              </div>
            ) : !data?.tiers || data.tiers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">No tiers found. Add your first tier.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="p-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Min Amount</th>
                      <th className="p-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Max Amount</th>
                      <th className="p-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Gateway Fee (%)</th>
                      <th className="p-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Platform Fee (%)</th>
                      <th className="p-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.tiers.map((tier: FeeTier) => (
                      <tr key={tier.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3">
                          <span className="text-xs text-gray-900">{formatAmount(tier.minAmount)}</span>
                        </td>
                        <td className="p-3">
                          <span className="text-xs text-gray-900">{formatAmount(tier.maxAmount)}</span>
                        </td>
                        <td className="p-3">
                          <span className="text-xs text-gray-900">{tier.gatewayFeeValue}%</span>
                        </td>
                        <td className="p-3">
                          <span className="text-xs text-gray-900">{tier.platformFeeValue || "—"}</span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleEdit(tier)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-blue-600"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Tier Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-lg max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">
                {editingTier ? "Edit Tier" : "Add Tier"}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingTier(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
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

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Gateway Fee (%) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.gatewayFeeValue}
                  onChange={(e) => setFormData(prev => ({ ...prev, gatewayFeeValue: e.target.value }))}
                  placeholder="e.g., 1.50"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Platform Fee (%) (Optional)
                </label>
                <input
                  type="text"
                  value={formData.platformFeeValue}
                  onChange={(e) => setFormData(prev => ({ ...prev, platformFeeValue: e.target.value }))}
                  placeholder="e.g., 0.50"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-xs"
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingTier(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : editingTier
                      ? "Update Tier"
                      : "Add Tier"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
