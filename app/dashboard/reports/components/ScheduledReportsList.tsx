"use client";

import { FileText, Plus, Trash2, Edit } from "lucide-react";
import { useState } from "react";
import { useScheduledReports, useDeleteScheduledReport } from "@/features/reports/queries";
import { toast } from "sonner";
import ScheduledReportModal from "./ScheduledReportModal";

export default function ScheduledReportsList() {
  const [showModal, setShowModal] = useState(false);
  const [editingReport, setEditingReport] = useState<string | null>(null);
  
  const { data, isLoading } = useScheduledReports();
  const deleteMutation = useDeleteScheduledReport();

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this scheduled report?")) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Scheduled report deleted successfully");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to delete scheduled report");
    }
  };

  const handleEdit = (id: string) => {
    setEditingReport(id);
    setShowModal(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-gray-100 rounded-lg p-3 h-16"></div>
        ))}
      </div>
    );
  }

  const reports = data?.reports || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-900">Scheduled Reports</h4>
        <button
          onClick={() => {
            setEditingReport(null);
            setShowModal(true);
          }}
          className="text-xs font-medium text-orange-600 hover:underline flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
          Schedule
        </button>
      </div>
      <div className="space-y-2">
        {reports.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-4">
            No scheduled reports. Create one to get automated reports via email.
          </p>
        ) : (
          reports.map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <FileText className="w-4 h-4 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">
                    {report.reportType} Report
                  </p>
                  <p className="text-xs text-gray-500">
                    {report.frequency} → {report.emailRecipients.join(", ")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(report.id)}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title="Edit"
                >
                  <Edit className="w-3 h-3 text-gray-600" />
                </button>
                <button
                  onClick={() => handleDelete(report.id)}
                  className="p-1 hover:bg-red-50 rounded transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3 text-red-600" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <ScheduledReportModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingReport(null);
          }}
          reportId={editingReport || undefined}
        />
      )}
    </div>
  );
}
