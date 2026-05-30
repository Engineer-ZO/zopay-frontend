"use client";

import { useState } from "react";
import { Loader2, Monitor, Smartphone, Clock, MapPin, RefreshCw, Shield, LogOut } from "lucide-react";
import { useActiveSessions, useForceLogoutAll } from "@/features/auth/sessions";
import type { Session } from "@/features/auth/sessions";

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDeviceIcon(deviceInfo: string) {
  const lowerInfo = deviceInfo.toLowerCase();
  if (lowerInfo.includes("iphone") || lowerInfo.includes("android") || lowerInfo.includes("mobile")) {
    return <Smartphone className="w-4 h-4" />;
  }
  return <Monitor className="w-4 h-4" />;
}

function SessionCard({ session }: { session: Session }) {
  return (
    <div className="bg-background border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {getDeviceIcon(session.deviceInfo)}
          <div>
            <h3 className="font-medium text-foreground text-sm">{session.deviceInfo}</h3>
            <p className="text-xs text-muted-foreground">Session ID: {session.sessionId.slice(0, 8)}...</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <RefreshCw className="w-3 h-3" />
          {session.refreshCount}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <div>
            <p className="text-muted-foreground">Last active</p>
            <p className="font-medium text-foreground">{formatRelativeTime(session.lastActivity)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-3 h-3 text-muted-foreground" />
          <div>
            <p className="text-muted-foreground">IP Address</p>
            <p className="font-medium text-foreground">{session.ipAddress}</p>
          </div>
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        <p>Created: {formatDate(session.createdAt)}</p>
      </div>
    </div>
  );
}

export default function SessionsPage() {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { data: sessionsData, isLoading, error, refetch } = useActiveSessions();
  const forceLogoutMutation = useForceLogoutAll();

  const sessions = sessionsData?.sessions || [];

  const handleForceLogoutAll = () => {
    setShowConfirmDialog(true);
  };

  const confirmForceLogout = () => {
    setShowConfirmDialog(false);
    forceLogoutMutation.mutate();
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Active Sessions</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage your active login sessions across all devices
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="text-xs inline-flex items-center gap-1 px-2 py-1 border border-border rounded hover:bg-muted"
        >
          <RefreshCw className="w-3 h-3" /> Refresh
        </button>
      </div>

      {/* Security Notice */}
      <div className="bg-crimson-red-50 dark:bg-crimson-red-900/10 border border-crimson-red-200 dark:border-crimson-red-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-crimson-red-600 dark:text-crimson-red-400 mt-0.5" />
          <div>
            <h3 className="font-medium text-crimson-red-800 dark:text-crimson-red-200 text-sm">Security Notice</h3>
            <p className="text-xs text-crimson-red-700 dark:text-crimson-red-300 mt-1">
              If you don&apos;t recognize a device or location, consider logging out from all devices immediately.
            </p>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            Your Active Sessions ({sessions.length})
          </h2>
          <button
            type="button"
            onClick={handleForceLogoutAll}
            disabled={sessions.length === 0 || forceLogoutMutation.isPending}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {forceLogoutMutation.isPending ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <LogOut className="w-3 h-3" />
            )}
            Logout from all devices
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-600 dark:text-red-400">
              Failed to load sessions: {error instanceof Error ? error.message : "Unknown error"}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="text-xs text-red-600 dark:text-red-400 hover:underline mt-2"
            >
              Try again
            </button>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No active sessions found</p>
            <p className="text-xs text-muted-foreground mt-1">
              This is unusual if you&apos;re currently logged in. Try refreshing the page.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {sessions.map((session) => (
              <SessionCard key={session.sessionId} session={session} />
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-2xl p-6 shadow-2xl border border-border max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Logout from all devices?</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  This will terminate all your active sessions, including this one.
                </p>
              </div>
            </div>

            <div className="bg-crimson-red-50 dark:bg-crimson-red-900/10 border border-crimson-red-200 dark:border-crimson-red-800 rounded-lg p-3 mb-4">
              <p className="text-xs text-crimson-red-700 dark:text-crimson-red-300">
                <strong>Important:</strong> You will be immediately logged out and will need to sign in again on all devices.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmDialog(false)}
                disabled={forceLogoutMutation.isPending}
                className="flex-1 px-4 py-2 border border-border rounded text-sm font-medium hover:bg-muted disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmForceLogout}
                disabled={forceLogoutMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded text-sm font-medium hover:bg-red-600 disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                {forceLogoutMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Logging out...
                  </>
                ) : (
                  "Logout everywhere"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
