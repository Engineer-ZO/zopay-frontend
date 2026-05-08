"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Filter, ChevronDown, Eye, Ban, Rocket } from "lucide-react";
import { useFeeRules, useActivateFeeRule, useDeactivateFeeRule, useFeeVersions } from "@/features/admin/queries";
import { FeeRule, FeeRuleFilters } from "@/features/admin/types";
import { toast } from "sonner";
import FeeRuleModal from "./FeeRuleModal";
import FeeTiersModal from "./FeeTiersModal";
import FeeRuleConfirmationModal from "./FeeRuleConfirmationModal";

// Helper function to format amount
const formatAmount = (amount: string): string => {
  return parseFloat(amount).toLocaleString();
};

// Skeleton loader for table rows
function TableRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="p-3">
        <div className="w-24 h-3 bg-gray-200 rounded" />
      </td>
      <td className="p-3">
        <div className="w-20 h-3 bg-gray-200 rounded" />
      </td>
      <td className="p-3">
        <div className="w-16 h-3 bg-gray-200 rounded" />
      </td>
      <td className="p-3">
        <div className="w-32 h-3 bg-gray-200 rounded" />
      </td>
      <td className="p-3">
        <div className="w-20 h-3 bg-gray-200 rounded" />
      </td>
      <td className="p-3">
        <div className="w-20 h-5 bg-gray-200 rounded-full" />
      </td>
      <td className="p-3">
        <div className="w-16 h-8 bg-gray-200 rounded" />
      </td>
    </tr>
  );
}

export default function FeeRulesTab() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTiersModal, setShowTiersModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"activate" | "deactivate">("activate");
  const [selectedRule, setSelectedRule] = useState<FeeRule | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [filters, setFilters] = useState<FeeRuleFilters>({});

  const { data: versionsData } = useFeeVersions();
  const activeVersion = versionsData?.feeVersions.find(v => v.isActive);

  const { data, isLoading, error } = useFeeRules(filters);
  const activateMutation = useActivateFeeRule();
  const deactivateMutation = useDeactivateFeeRule();

  const handleEdit = (rule: FeeRule) => {
    setSelectedRule(rule);
    setShowEditModal(true);
  };

  const handleViewTiers = (rule: FeeRule) => {
    setSelectedRule(rule);
    setShowTiersModal(true);
  };

  const handleActivate = (rule: FeeRule) => {
    setSelectedRule(rule);
    setConfirmAction("activate");
    setShowConfirmModal(true);
  };

  const handleDeactivate = (rule: FeeRule) => {
    setSelectedRule(rule);
    setConfirmAction("deactivate");
    setShowConfirmModal(true);
  };

  const handleConfirmActivate = async () => {
    if (!selectedRule) return;

    try {
      await activateMutation.mutateAsync(selectedRule.id);
      toast.success("Fee rule activated successfully");
      setShowConfirmModal(false);
      setSelectedRule(null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to activate fee rule");
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!selectedRule) return;

    try {
      await deactivateMutation.mutateAsync(selectedRule.id);
      toast.success("Fee rule deactivated successfully");
      setShowConfirmModal(false);
      setSelectedRule(null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to deactivate fee rule");
    }
  };

  const handleFilterChange = (key: keyof FeeRuleFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === "all" ? undefined : value,
    }));
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== undefined);

  // Handle click outside to close filter dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showFilterDropdown && !(e.target as HTMLElement).closest('.filter-dropdown-container')) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showFilterDropdown]);

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">Manage default fee rules for gateway + transaction type + currency</p>
          {activeVersion && (
            <p className="text-[10px] text-gray-400 mt-1">
              Active Version: <span className="font-medium text-gray-600">{activeVersion.version}</span>
            </p>
          )}
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          disabled={!activeVersion}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Rule
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800 font-semibold mb-1">Error loading fee rules</p>
          <p className="text-xs text-red-600">{error.message}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-auto filter-dropdown-container">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowFilterDropdown(!showFilterDropdown);
            }}
            className="flex items-center justify-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 text-gray-700 relative"
          >
            <Filter className="w-3.5 h-3.5" />
            Filter
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full" />
            )}
            <ChevronDown className={`w-3 h-3 transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showFilterDropdown && (
            <div
              className="absolute left-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[200px] max-h-[300px] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-3 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Gateway</p>
                  <div className="space-y-1.5">
                    {[
                      { value: "all", label: "All Gateways" },
                      { value: "MTN_MOMO", label: "MTN Mobile Money" },
                      { value: "ORANGE_MONEY", label: "Orange Money" },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded"
                      >
                        <input
                          type="radio"
                          name="gateway"
                          value={option.value}
                          checked={(filters.gateway || "all") === option.value}
                          onChange={(e) => handleFilterChange("gateway", e.target.value)}
                          className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-xs text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200" />

                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Transaction Type</p>
                  <div className="space-y-1.5">
                    {[
                      { value: "all", label: "All Types" },
                      { value: "COLLECTION", label: "Collection" },
                      { value: "DISBURSEMENT", label: "Disbursement" },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded"
                      >
                        <input
                          type="radio"
                          name="transactionType"
                          value={option.value}
                          checked={(filters.transactionType || "all") === option.value}
                          onChange={(e) => handleFilterChange("transactionType", e.target.value)}
                          className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-xs text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200" />

                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Status</p>
                  <div className="space-y-1.5">
                    {[
                      { value: "all", label: "All Statuses" },
                      { value: "ACTIVE", label: "Active" },
                      { value: "INACTIVE", label: "Inactive" },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded"
                      >
                        <input
                          type="radio"
                          name="status"
                          value={option.value}
                          checked={(filters.status || "all") === option.value}
                          onChange={(e) => handleFilterChange("status", e.target.value)}
                          className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-xs text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {hasActiveFilters && (
                  <>
                    <div className="border-t border-gray-200" />
                    <button
                      onClick={() => {
                        setFilters({});
                        setShowFilterDropdown(false);
                      }}
                      className="w-full text-xs text-blue-600 hover:text-blue-700 font-medium py-1.5"
                    >
                      Clear All Filters
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Gateway</th>
                <th className="p-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="p-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Currency</th>
                <th className="p-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Amount Range</th>
                <th className="p-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Fees</th>
                <th className="p-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="p-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRowSkeleton key={index} />
                ))
              ) : !data?.feeRules || data.feeRules.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center">
                    <p className="text-sm text-gray-500">No fee rules found. Create your first rule.</p>
                  </td>
                </tr>
              ) : (
                data.feeRules.map((rule: FeeRule) => (
                  <tr key={rule.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3">
                      <span className="text-xs font-medium text-gray-900">{rule.gateway}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-xs text-gray-600">{rule.transactionType}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-xs text-gray-600">{rule.currency}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-xs text-gray-600">
                        {formatAmount(rule.minAmount)} - {formatAmount(rule.maxAmount)}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="text-xs text-gray-600">
                        <div>Gateway: {rule.gatewayFeeValue}%</div>
                        <div>Platform: {rule.platformFeeValue}%</div>
                      </div>
                    </td>
                    <td className="p-3">
                      {rule.status === "ACTIVE" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {rule.gatewayFeeType === "TIERED" && (
                          <button
                            onClick={() => handleViewTiers(rule)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-blue-600"
                            title="View Tiers"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(rule)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-blue-600"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {rule.status === "ACTIVE" ? (
                          <button
                            onClick={() => handleDeactivate(rule)}
                            disabled={deactivateMutation.isPending}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-red-600"
                            title="Deactivate"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(rule)}
                            disabled={activateMutation.isPending}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                            title="Activate"
                          >
                            <Rocket className="w-3 h-3" />
                            Activate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <FeeRuleModal
          key={`create-${showAddModal}`}
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          mode="create"
          activeVersionId={activeVersion?.id}
        />
      )}

      {showEditModal && selectedRule && (
        <FeeRuleModal
          key={`edit-${selectedRule.id}-${showEditModal}`}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedRule(null);
          }}
          mode="edit"
          rule={selectedRule}
        />
      )}

      {showTiersModal && selectedRule && (
        <FeeTiersModal
          isOpen={showTiersModal}
          onClose={() => {
            setShowTiersModal(false);
            setSelectedRule(null);
          }}
          feeRuleId={selectedRule.id}
        />
      )}

      {/* Confirmation Modal */}
      <FeeRuleConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setSelectedRule(null);
        }}
        onConfirm={confirmAction === "activate" ? handleConfirmActivate : handleConfirmDeactivate}
        rule={selectedRule}
        action={confirmAction}
        isLoading={confirmAction === "activate" ? activateMutation.isPending : deactivateMutation.isPending}
      />
    </div>
  );
}
