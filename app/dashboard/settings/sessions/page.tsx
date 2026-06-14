"use client";

import { useState } from "react";
import { 
  Loader2, 
  Monitor, 
  Smartphone, 
  Clock, 
  MapPin, 
  RefreshCw, 
  Shield, 
  LogOut,
  AlertTriangle,
  Activity,
  Wifi,
  Laptop,
  Tablet,
  Globe,
} from "lucide-react";
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
  if (lowerInfo.includes("iphone") || lowerInfo.includes("mobile")) {
    return <Smartphone className="w-4 h-4" />;
  }
  if (lowerInfo.includes("android")) {
    return <Tablet className="w-4 h-4" />;
  }
  if (lowerInfo.includes("mac") || lowerInfo.includes("windows") || lowerInfo.includes("linux")) {
    return <Laptop className="w-4 h-4" />;
  }
  return <Monitor className="w-4 h-4" />;
}

function getDeviceType(deviceInfo: string): string {
  const lowerInfo = deviceInfo.toLowerCase();
  if (lowerInfo.includes("iphone") || lowerInfo.includes("android") || lowerInfo.includes("mobile")) {
    return "Mobile";
  }
  if (lowerInfo.includes("tablet")) {
    return "Tablet";
  }
  return "Desktop";
}

function SessionCard({ session, isCurrent = false }: { session: Session; isCurrent?: boolean }) {
  const deviceIcon = getDeviceIcon(session.deviceInfo);
  const deviceType = getDeviceType(session.deviceInfo);
  
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
      
      {isCurrent && (
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
            <Activity className="w-2.5 h-2.5" />
            Current Session
          </span>
        </div>
      )}
      
      <div className="relative flex items-start gap-4">
        <div className={`p-3 rounded-xl ${isCurrent 
          ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg' 
          : 'bg-slate-100 dark:bg-slate-700'}`}>
          <div className={isCurrent ? 'text-white' : 'text-slate-500 dark:text-slate-400'}>
            {deviceIcon}
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">{session.deviceInfo}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <span className="w-1 h-1 rounded-full bg-indigo-500" />
                  {deviceType}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <RefreshCw className="w-3 h-3" />
                  {session.refreshCount} refreshes
                </span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10">
                <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Last Active</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatRelativeTime(session.lastActivity)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-500/10">
                <MapPin className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">IP Address</p>
                <p className="text-sm font-mono font-semibold text-slate-900 dark:text-white">{session.ipAddress}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-3 pt-2 text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span>Session ID: {session.sessionId.slice(0, 12)}...</span>
            <span>•</span>
            <span>Created: {formatDate(session.createdAt)}</span>
          </div>
        </div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-white via-white to-indigo-50/50 dark:from-slate-800/80 dark:via-slate-800/60 dark:to-indigo-950/30 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-6 shadow-lg">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                    Active Sessions
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                    Manage your active login sessions across all devices
                  </p>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-600 transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              Refresh
            </button>
          </div>
        </div>

        {/* Security Notice Banner */}
        <div className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-500/20 p-4">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-500/20">
              <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 dark:text-amber-100 text-sm">Security Notice</h3>
              <p className="text-xs text-amber-800 dark:text-amber-200 mt-1">
                If you don&apos;t recognize a device or location, consider logging out from all devices immediately.
              </p>
            </div>
          </div>
        </div>

        {/* Sessions Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-500/20">
              <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Your Active Sessions ({sessions.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={handleForceLogoutAll}
            disabled={sessions.length === 0 || forceLogoutMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {forceLogoutMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
            Logout from all devices
          </button>
        </div>

        {/* Sessions List */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Shield className="w-5 h-5 text-indigo-500 animate-pulse" />
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <AlertTriangle className="w-8 h-8 text-rose-600 dark:text-rose-400" />
            </div>
            <p className="text-sm font-medium text-rose-900 dark:text-rose-100">
              Failed to load sessions
            </p>
            <p className="text-xs text-rose-800 dark:text-rose-200 mt-1">
              {error instanceof Error ? error.message : "Unknown error occurred"}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 text-sm font-semibold hover:bg-rose-200 dark:hover:bg-rose-500/30 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        ) : sessions.length === 0 ? (
          <div className="rounded-2xl bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
              <Shield className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-base font-medium text-slate-700 dark:text-slate-300">No active sessions found</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              This is unusual if you&apos;re currently logged in. Try refreshing the page.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session, index) => (
              <SessionCard 
                key={session.sessionId} 
                session={session}
                isCurrent={index === 0}
              />
            ))}
          </div>
        )}

        {/* Device Information Footer */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/30 dark:to-slate-800/20 border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Session Information</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Understanding your active sessions
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="flex items-start gap-2 p-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" />
              <span className="text-slate-600 dark:text-slate-400">The first session shown is your current session</span>
            </div>
            <div className="flex items-start gap-2 p-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" />
              <span className="text-slate-600 dark:text-slate-400">Sessions expire after prolonged inactivity</span>
            </div>
            <div className="flex items-start gap-2 p-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" />
              <span className="text-slate-600 dark:text-slate-400">Logout from all devices for maximum security</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog - Enhanced */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setShowConfirmDialog(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg">
                  <LogOut className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Logout from all devices?</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    This will terminate all your active sessions
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-500/20 p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    <strong className="font-semibold">Important:</strong> You will be immediately logged out and will need to sign in again on all devices, including this one.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmDialog(false)}
                  disabled={forceLogoutMutation.isPending}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmForceLogout}
                  disabled={forceLogoutMutation.isPending}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {forceLogoutMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Logging out...
                    </>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4" />
                      Logout everywhere
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}