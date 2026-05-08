"use client";

import { useState } from "react";
import { Plus, Rocket, X, CheckCircle2, Clock } from "lucide-react";
import { useFeeVersions, useCreateFeeVersion, useActivateFeeVersion } from "@/features/admin/queries";
import { FeeVersion, CreateFeeVersionRequest } from "@/features/admin/types";
import { toast } from "sonner";

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Skeleton loader for table rows
function TableRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="p-3">
        <div className="w-32 h-3 bg-gray-200 rounded" />
      </td>
      <td className="p-3">
        <div className="w-20 h-5 bg-gray-200 rounded-full" />
      </td>
      <td className="p-3">
        <div className="w-48 h-3 bg-gray-200 rounded" />
      </td>
      <td className="p-3">
        <div className="w-24 h-3 bg-gray-200 rounded" />
      </td>
      <td className="p-3">
        <div className="w-16 h-8 bg-gray-200 rounded" />
      </td>
    </tr>
  );
}

export default function FeeVersionsTab() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [version, setVersion] = useState("");
  const [description, setDescription] = useState("");

  const { data, isLoading, error } = useFeeVersions();
  const createMutation = useCreateFeeVersion();
  const activateMutation = useActivateFeeVersion();

  const handleCreate = async () => {
    if (!version.trim()) {
      toast.error("Version is required");
      return;
    }

    try {
      const request: CreateFeeVersionRequest = {
        version: version.trim(),
        description: description.trim() || undefined,
      };
      await createMutation.mutateAsync(request);
      toast.success("Fee version created successfully");
      setShowAddModal(false);
      setVersion("");
      setDescription("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create fee version");
    }
  };

  const handleActivate = async (id: string) => {
    if (!confirm("Are you sure you want to activate this version? This will deactivate all other fee versions.")) {
      return;
    }

    try {
      await activateMutation.mutateAsync(id);
      toast.success("Fee version activated successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to activate fee version");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">Manage fee versions for version control</p>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Version
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800 font-semibold mb-1">Error loading fee versions</p>
          <p className="text-xs text-red-600">{error.message}</p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Version</th>
                <th className="p-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="p-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                <th className="p-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                <th className="p-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRowSkeleton key={index} />
                ))
              ) : !data?.feeVersions || data.feeVersions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <p className="text-sm text-gray-500">No fee versions found. Create your first version.</p>
                  </td>
                </tr>
              ) : (
                data.feeVersions.map((fv: FeeVersion) => (
                  <tr key={fv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3">
                      <span className="text-xs font-medium text-gray-900">{fv.version}</span>
                    </td>
                    <td className="p-3">
                      {fv.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <Clock className="w-3 h-3" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="text-xs text-gray-600">{fv.description || "—"}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-xs text-gray-600">{formatDate(fv.createdAt)}</span>
                    </td>
                    <td className="p-3 text-right">
                      {!fv.isActive && (
                        <button
                          onClick={() => handleActivate(fv.id)}
                          disabled={activateMutation.isPending}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Rocket className="w-3.5 h-3.5" />
                          Activate
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Version Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-lg max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Create Fee Version</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Version <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="e.g., 2024-02"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-xs"
                />
                <p className="text-[10px] text-gray-500 mt-1">Version identifier (1-50 characters, unique)</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description for this version"
                  rows={3}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-xs resize-none"
                />
              </div>
              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={createMutation.isPending || !version.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {createMutation.isPending ? "Creating..." : "Create Version"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
