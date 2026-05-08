"use client";

import { X, Calendar } from "lucide-react";
import { useState } from "react";

interface GenerateSettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: { periodStart: string; periodEnd: string }) => void;
  isLoading?: boolean;
}

export function GenerateSettlementModal({
  isOpen,
  onClose,
  onGenerate,
  isLoading = false,
}: GenerateSettlementModalProps) {
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!periodStart || !periodEnd) {
      return;
    }
    if (new Date(periodEnd) < new Date(periodStart)) {
      alert("End date must be after start date");
      return;
    }
    onGenerate({
      periodStart: new Date(periodStart).toISOString(),
      periodEnd: new Date(periodEnd + "T23:59:59").toISOString(),
    });
    // Reset form
    setPeriodStart("");
    setPeriodEnd("");
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl border border-border max-w-md w-full">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Generate Settlement
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-foreground mb-2 block">
              Start Date
            </label>
            <input
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              required
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground mb-2 block">
              End Date
            </label>
            <input
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              required
              min={periodStart}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <p className="text-xs text-muted-foreground mt-1">
              End date must be after start date
            </p>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-xs font-semibold hover:bg-muted transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !periodStart || !periodEnd}
              className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg text-xs font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Generating..." : "Generate Settlement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
