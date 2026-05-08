"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  useScheduledReport,
  useCreateScheduledReport,
  useUpdateScheduledReport,
} from "@/features/reports/queries";
import { toast } from "sonner";
import type { ReportType, Frequency, ExportFormat } from "@/features/reports/types";

interface ScheduledReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId?: string;
}

export default function ScheduledReportModal({
  isOpen,
  onClose,
  reportId,
}: ScheduledReportModalProps) {
  const { data: reportData } = useScheduledReport(reportId || "");
  const createMutation = useCreateScheduledReport();
  const updateMutation = useUpdateScheduledReport();

  const [formData, setFormData] = useState({
    reportType: "TRANSACTION" as ReportType,
    frequency: "DAILY" as Frequency,
    emailRecipients: "",
    format: "CSV" as ExportFormat,
    enabled: true,
  });

  useEffect(() => {
    if (reportData?.report) {
      const report = reportData.report;
      setFormData({
        reportType: report.reportType,
        frequency: report.frequency,
        emailRecipients: report.emailRecipients.join(", "),
        format: report.format,
        enabled: report.enabled,
      });
    } else if (!reportId) {
      setFormData({
        reportType: "TRANSACTION",
        frequency: "DAILY",
        emailRecipients: "",
        format: "CSV",
        enabled: true,
      });
    }
  }, [reportData, reportId]);

  const handleSubmit = async () => {
    if (!formData.emailRecipients.trim()) {
      toast.error("Email recipients are required");
      return;
    }

    const emails = formData.emailRecipients
      .split(",")
      .map((e) => e.trim())
      .filter((e) => e);

    if (emails.length === 0) {
      toast.error("At least one valid email is required");
      return;
    }

    try {
      if (reportId) {
        await updateMutation.mutateAsync({
          id: reportId,
          data: {
            reportType: formData.reportType,
            frequency: formData.frequency,
            emailRecipients: emails,
            format: formData.format,
            enabled: formData.enabled,
          },
        });
        toast.success("Scheduled report updated successfully");
      } else {
        await createMutation.mutateAsync({
          reportType: formData.reportType,
          frequency: formData.frequency,
          emailRecipients: emails,
          format: formData.format,
          enabled: formData.enabled,
        });
        toast.success("Scheduled report created successfully");
      }
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to save scheduled report");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-foreground">
            {reportId ? "Edit Scheduled Report" : "Schedule Report"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-2 block">
              Report Type *
            </label>
            <select
              value={formData.reportType}
              onChange={(e) =>
                setFormData({ ...formData, reportType: e.target.value as ReportType })
              }
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
            >
              <option value="TRANSACTION">Transaction Report</option>
              <option value="SETTLEMENT">Settlement Report</option>
              <option value="REVENUE">Revenue Report</option>
              <option value="SUMMARY">Summary Report</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 mb-2 block">
              Frequency *
            </label>
            <div className="flex gap-3">
              {(["DAILY", "WEEKLY", "MONTHLY"] as Frequency[]).map((freq) => (
                <label key={freq} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="frequency"
                    value={freq}
                    checked={formData.frequency === freq}
                    onChange={(e) =>
                      setFormData({ ...formData, frequency: e.target.value as Frequency })
                    }
                  />
                  <span className="text-xs text-gray-700 capitalize">{freq.toLowerCase()}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 mb-2 block">
              Recipients * (comma-separated emails)
            </label>
            <input
              type="text"
              value={formData.emailRecipients}
              onChange={(e) =>
                setFormData({ ...formData, emailRecipients: e.target.value })
              }
              placeholder="admin@example.com, finance@example.com"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 mb-2 block">Format</label>
            <div className="flex gap-3">
              {(["CSV", "EXCEL", "PDF"] as ExportFormat[]).map((format) => (
                <label key={format} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    value={format}
                    checked={formData.format === format}
                    onChange={(e) =>
                      setFormData({ ...formData, format: e.target.value as ExportFormat })
                    }
                  />
                  <span className="text-xs text-gray-700 uppercase">{format}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="enabled"
              checked={formData.enabled}
              onChange={(e) =>
                setFormData({ ...formData, enabled: e.target.checked })
              }
              className="rounded"
            />
            <label htmlFor="enabled" className="text-xs text-gray-700 cursor-pointer">
              Enabled
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Saving..."
                : reportId
                ? "Update"
                : "Schedule"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
