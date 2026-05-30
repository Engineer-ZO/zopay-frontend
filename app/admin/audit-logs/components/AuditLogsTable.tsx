"use client";

import { useState } from "react";
import React from "react";
import { ChevronDown, ChevronUp, CheckCircle2, XCircle, AlertTriangle, Plus, RotateCcw, Eye } from "lucide-react";
import { AuditLog } from "@/features/audit-logs/types";

interface AuditLogsTableProps {
  logs: AuditLog[];
  isLoading?: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  currentLimit: number;
}

export function AuditLogsTable({
  logs,
  isLoading = false,
  currentPage,
  totalPages,
  onPageChange,
  onLimitChange,
  currentLimit,
}: AuditLogsTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (logId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedRows(newExpanded);
  };

  const getActionIcon = (action: string) => {
    if (action.includes("APPROVED") || action.includes("VERIFIED")) {
      return <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />;
    }
    if (action.includes("REJECTED") || action.includes("FAILED")) {
      return <XCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />;
    }
    if (action.includes("SUSPENDED")) {
      return <AlertTriangle className="w-3.5 h-3.5 text-crimson-red-600 dark:text-crimson-red-400" />;
    }
    if (action.includes("CREATED") || action.includes("ADDED")) {
      return <Plus className="w-3.5 h-3.5 text-deep-blue-violet-600 dark:text-deep-blue-violet-400" />;
    }
    if (action.includes("UPDATED") || action.includes("REACTIVATED")) {
      return <RotateCcw className="w-3.5 h-3.5 text-crimson-red-600 dark:text-crimson-red-400" />;
    }
    return <Eye className="w-3.5 h-3.5 text-muted-foreground" />;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return {
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        time: date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    } catch {
      return { date: dateString, time: "" };
    }
  };

  const getLoginSessionDetails = (log: AuditLog) => {
    if (log.action !== "LOGIN_SUCCESS" || !log.after) {
      return null;
    }

    return {
      email: typeof log.after.email === "string" ? log.after.email : null,
      authMethod: typeof log.after.authMethod === "string" ? log.after.authMethod : null,
      sessionId: typeof log.after.sessionId === "string" ? log.after.sessionId : null,
      ipAddress: typeof log.after.ipAddress === "string" ? log.after.ipAddress : null,
      userAgent: typeof log.after.userAgent === "string" ? log.after.userAgent : null,
      loggedInAt: typeof log.after.loggedInAt === "string" ? log.after.loggedInAt : null,
    };
  };

  if (isLoading) {
    return (
      <div className="bg-background rounded-lg border border-border overflow-hidden">
        <div className="p-8 text-center text-muted-foreground">
          Loading audit logs...
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="bg-background rounded-lg border border-border overflow-hidden">
        <div className="p-8 text-center text-muted-foreground">
          No audit logs found
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left py-2.5 px-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Timestamp
              </th>
              <th className="text-left py-2.5 px-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Actor
              </th>
              <th className="text-left py-2.5 px-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Action
              </th>
              <th className="text-left py-2.5 px-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Entity
              </th>
              <th className="text-left py-2.5 px-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Details
              </th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => {
              const { date, time } = formatDate(log.createdAt);
              const isExpanded = expandedRows.has(log.id);
              const loginSessionDetails = getLoginSessionDetails(log);
              return (
                <React.Fragment key={log.id}>
                  <tr
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => toggleRow(log.id)}
                  >
                    <td className="py-2.5 px-3">
                      <div className="text-[10px] font-medium text-foreground">{date}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{time}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            log.actorType === "ADMIN"
                              ? "bg-deep-blue-violet-100 dark:bg-deep-blue-violet-900/20 text-deep-blue-violet-700 dark:text-deep-blue-violet-400"
                              : "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                          }`}
                        >
                          {log.actorType}
                        </span>
                        <span className="text-[10px] text-foreground truncate max-w-[120px]">
                          {log.actorName || log.actorEmail || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        {getActionIcon(log.action)}
                        <span className="text-[10px] text-foreground">
                          {log.actionDescription}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="text-[10px] text-foreground">
                        {log.entityName || log.entityType || "N/A"}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRow(log.id);
                        }}
                        className="flex items-center gap-1 text-[10px] text-crimson-red-600 dark:text-crimson-red-400 hover:underline"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-3 h-3" />
                            Hide
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3 h-3" />
                            View
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="bg-muted/20">
                      <td colSpan={5} className="py-4 px-3">
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3 text-[10px]">
                            <div>
                              <span className="font-medium text-muted-foreground">Action:</span>
                              <span className="ml-2 text-foreground">{log.actionDescription}</span>
                            </div>
                            <div>
                              <span className="font-medium text-muted-foreground">Actor:</span>
                              <span className="ml-2 text-foreground">
                                {log.actorName || log.actorEmail || "N/A"} ({log.actorType})
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-muted-foreground">Entity:</span>
                              <span className="ml-2 text-foreground">
                                {log.entityName || log.entityType || "N/A"}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-muted-foreground">Date:</span>
                              <span className="ml-2 text-foreground font-mono">
                                {new Date(log.createdAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                          {loginSessionDetails && (
                            <div>
                              <p className="text-[10px] font-semibold text-foreground mb-1.5">Login Session:</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px] bg-background border border-border rounded p-3">
                                <div>
                                  <span className="font-medium text-muted-foreground">Email:</span>
                                  <span className="ml-2 text-foreground">{loginSessionDetails.email || "N/A"}</span>
                                </div>
                                <div>
                                  <span className="font-medium text-muted-foreground">Auth method:</span>
                                  <span className="ml-2 text-foreground">{loginSessionDetails.authMethod || "N/A"}</span>
                                </div>
                                <div>
                                  <span className="font-medium text-muted-foreground">Session ID:</span>
                                  <span className="ml-2 text-foreground font-mono break-all">{loginSessionDetails.sessionId || "N/A"}</span>
                                </div>
                                <div>
                                  <span className="font-medium text-muted-foreground">IP address:</span>
                                  <span className="ml-2 text-foreground">{loginSessionDetails.ipAddress || "N/A"}</span>
                                </div>
                                <div className="md:col-span-2">
                                  <span className="font-medium text-muted-foreground">User agent:</span>
                                  <span className="ml-2 text-foreground break-all">{loginSessionDetails.userAgent || "N/A"}</span>
                                </div>
                                <div className="md:col-span-2">
                                  <span className="font-medium text-muted-foreground">Login timestamp:</span>
                                  <span className="ml-2 text-foreground font-mono">
                                    {loginSessionDetails.loggedInAt ? new Date(loginSessionDetails.loggedInAt).toLocaleString() : "N/A"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                          {(log.before || log.after) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {log.before && (
                                <div>
                                  <p className="text-[10px] font-semibold text-foreground mb-1.5">Before:</p>
                                  <pre className="text-[10px] bg-background border border-border rounded p-2 overflow-x-auto">
                                    {JSON.stringify(log.before, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {log.after && (
                                <div>
                                  <p className="text-[10px] font-semibold text-foreground mb-1.5">After:</p>
                                  <pre className="text-[10px] bg-background border border-border rounded p-2 overflow-x-auto">
                                    {JSON.stringify(log.after, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-3 border-t border-border flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">Show</span>
          <select
            value={currentLimit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="px-2 py-1 bg-background border border-border rounded text-[10px] text-foreground"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-[10px] text-muted-foreground">per page</span>
        </div>
        <div className="text-[10px] text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-2 py-1 bg-background border border-border rounded text-[10px] font-medium hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-2 py-1 bg-crimson-red-500 text-white rounded text-[10px] font-medium hover:bg-crimson-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
