"use client";

import { useState, useEffect } from "react";
import {
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Download,
  TestTube,
  Lock,
  ArrowRight,
  X,
  Check,
  Shield,
  Key,
  Server,
  Smartphone,
  Globe,
  Sun,
  Moon,
} from "lucide-react";
import { useUserMerchantData } from "@/features/merchants/context/MerchantContext";
import {
  useRegenerateSandboxCredentials,
  useRegenerateProductionCredentials,
} from "@/features/merchants/hooks/useMerchant";
import type {
  RegenerateSandboxCredentialsResponse,
  RegenerateProductionCredentialsResponse
} from "@/features/merchants/types/index";
import { storeSecretKey } from "@/lib/zoSign";

type Environment = "sandbox" | "production";

// Theme provider component
const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved === "light" || saved === "dark") return saved;
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className={`theme-${theme}`}>
      {children}
      <ThemeToggle theme={theme} setTheme={setTheme} />
    </div>
  );
};

const ThemeToggle = ({ theme, setTheme }: { theme: "light" | "dark"; setTheme: (t: "light" | "dark") => void }) => (
  <button
    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-white/10 dark:bg-slate-800/90 backdrop-blur-sm border border-white/20 dark:border-slate-700 shadow-lg hover:scale-110 transition-transform"
    aria-label="Toggle theme"
  >
    {theme === "dark" ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
  </button>
);

// Status badge component
const StatusBadge = ({ status, variant }: { status: string; variant?: "success" | "warning" | "danger" | "info" }) => {
  const variants = {
    success: "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
    warning: "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20",
    danger: "bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20",
    info: "bg-sky-100 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-500/20",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${variants[variant || "info"]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {status}
    </span>
  );
};

export default function ApiKeysPage() {
  const { merchant, merchantId, isLoading, refetch } = useUserMerchantData();
  const isProductionActive = merchant?.productionState === "ACTIVE";
  const [activeEnv, setActiveEnv] = useState<Environment>(isProductionActive ? "production" : "sandbox");
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [showNewCredsModal, setShowNewCredsModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [newCredentials, setNewCredentials] = useState<RegenerateSandboxCredentialsResponse | RegenerateProductionCredentialsResponse | null>(null);

  const regenerateSandbox = useRegenerateSandboxCredentials(merchantId || "");
  const regenerateProduction = useRegenerateProductionCredentials(merchantId || "");

  if (isLoading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center h-96">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Key className="w-6 h-6 text-indigo-500 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  if (!merchant) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 p-8 text-center">
              <AlertCircle className="w-12 h-12 text-rose-500 dark:text-rose-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Failed to Load Merchant Data</h3>
              <p className="text-slate-600 dark:text-slate-400">Unable to retrieve your account information. Please try again later.</p>
            </div>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  const isProductionPending = merchant.productionState === "PENDING_APPROVAL";
  const isKYBApproved = merchant.kycStatus === "APPROVED";
  const hasRegeneratedSandbox = newCredentials && "sandboxSecretKey" in newCredentials;
  const hasRegeneratedProduction = newCredentials && "productionSecretKey" in newCredentials;

  const credentials = {
    sandbox: {
      apiKey: merchant.sandboxApiKey,
      secretKey: hasRegeneratedSandbox ? (newCredentials as RegenerateSandboxCredentialsResponse).sandboxSecretKey : "••••••••••••••••••••••••••••••••",
      hasSecretKey: hasRegeneratedSandbox,
      createdAt: new Date(merchant.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      lastUsed: "Recently",
    },
    production: {
      apiKey: merchant.productionApiKey || "Not generated yet",
      secretKey: hasRegeneratedProduction ? (newCredentials as RegenerateProductionCredentialsResponse).productionSecretKey : "••••••••••••••••••••••••••••••••",
      hasSecretKey: hasRegeneratedProduction,
      createdAt: merchant.productionApiKey ? new Date(merchant.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A",
      lastUsed: merchant.productionApiKey ? "Recently" : "N/A",
      approved: isProductionActive,
    },
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRegenerate = async () => {
    if (confirmText !== "REGENERATE") return;
    try {
      const isProduction = activeEnv === "production";
      if (isProduction) {
        const response = await regenerateProduction.mutateAsync();
        setNewCredentials(response);
        storeSecretKey(response.productionSecretKey, 'production');
      } else {
        const response = await regenerateSandbox.mutateAsync();
        setNewCredentials(response);
        storeSecretKey(response.sandboxSecretKey, 'sandbox');
      }
      setShowRegenerateModal(false);
      setShowNewCredsModal(true);
      setConfirmText("");
      refetch();
    } catch (error) {
      console.error("Failed to regenerate credentials:", error);
    }
  };

  const currentCreds = credentials[activeEnv];
  const isProduction = activeEnv === "production";

  const testNumbers = {
    mtn: [
      { number: "237670000001", outcome: "SUCCESS", desc: "Completes on first check", color: "emerald" },
      { number: "237670000002", outcome: "SUCCESS", desc: "Completes on first check", color: "emerald" },
      { number: "237670000003", outcome: "FAILED", desc: "Insufficient funds", color: "rose" },
      { number: "237670000004", outcome: "FAILED", desc: "Declined", color: "rose" },
      { number: "237670000005", outcome: "PENDING", desc: "Never resolves", color: "amber" },
    ],
    orange: [
      { number: "237690000001", outcome: "SUCCESS", desc: "Completes on first check", color: "emerald" },
      { number: "237690000002", outcome: "SUCCESS", desc: "Completes on first check", color: "emerald" },
      { number: "237690000003", outcome: "FAILED", desc: "Insufficient funds", color: "rose" },
      { number: "237690000004", outcome: "FAILED", desc: "Declined", color: "rose" },
      { number: "237690000005", outcome: "PENDING", desc: "Never resolves", color: "amber" },
    ],
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-6 shadow-sm dark:shadow-none">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100 dark:bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                    <Key className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">API Credentials</h1>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Securely manage your API keys for sandbox testing and production environments</p>
              </div>
              <StatusBadge status={merchant.kycStatus} variant={merchant.kycStatus === "APPROVED" ? "success" : "warning"} />
            </div>
          </div>

          {/* Environment Tabs */}
          <div className="flex gap-2 p-1 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 w-fit shadow-sm">
            <button
              onClick={() => setActiveEnv("sandbox")}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                activeEnv === "sandbox"
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md"
                  : "text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              <TestTube className="w-4 h-4" />
              Sandbox
            </button>
            <button
              onClick={() => setActiveEnv("production")}
              disabled={!isProductionActive}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                activeEnv === "production"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                  : "text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              }`}
            >
              <Globe className="w-4 h-4" />
              Production
            </button>
          </div>

          {/* Environment Banner */}
          <div className={`rounded-xl p-4 border ${
            isProduction
              ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20"
              : "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20"
          }`}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${isProduction ? "bg-indigo-500" : "bg-amber-500"}`} />
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {isProduction ? "🔐 PRODUCTION MODE — Live Transactions" : "🧪 SANDBOX MODE — Testing Environment"}
                  </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {isProduction
                    ? "⚠️ These credentials process REAL MONEY. Use with extreme caution. Never expose your secret key."
                    : "Use these credentials for development and testing. No real money will be processed. All transactions are simulated."}
                </p>
                {isProduction && isProductionActive && (
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      Active
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      KYB Approved
                    </span>
                  </div>
                )}
              </div>
              {!isProduction && isProductionActive && (
                <button
                  onClick={() => setActiveEnv("production")}
                  className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors flex items-center gap-1"
                >
                  Switch to Production
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Production Not Available State */}
          {isProduction && !isProductionActive && (
            <div className="rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-8 text-center shadow-sm">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-100 dark:bg-rose-500/10 flex items-center justify-center">
                <Lock className="w-8 h-8 text-rose-500 dark:text-rose-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Production Access Locked</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">Complete the steps below to request production access</p>
              <div className="max-w-md mx-auto space-y-3 text-left">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  {isKYBApproved ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <div className="w-5 h-5 rounded-full border-2 border-rose-400" />}
                  <span className="text-sm text-slate-900 dark:text-white">Complete KYB Verification {isKYBApproved && "✓"}</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  {isProductionPending ? <RefreshCw className="w-5 h-5 text-amber-500 animate-spin" /> : 
                   merchant.productionState === "NOT_REQUESTED" ? <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600" /> :
                   <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                  <span className="text-sm text-slate-900 dark:text-white">Request Production Access {isProductionPending && "(Pending)"}</span>
                </div>
              </div>
              <div className="flex gap-3 justify-center mt-6">
                <button className="px-4 py-2 rounded-lg bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 transition shadow-md">
                  View KYB Status
                </button>
                <button
                  disabled={!isKYBApproved || isProductionPending}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProductionPending ? "Request Pending" : "Request Production Access"}
                </button>
              </div>
            </div>
          )}

          {/* API Credentials Card */}
          {(!isProduction || isProductionActive) && (
            <div className="rounded-2xl bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">API Credentials</h3>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* API Key Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-900 dark:text-white">API Key (Public)</label>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Safe to expose
                    </span>
                  </div>
                  <div className="relative group">
                    <input
                      type="text"
                      value={currentCreds.apiKey}
                      readOnly
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white pr-24 focus:outline-none focus:border-indigo-500 transition"
                    />
                    <button
                      onClick={() => handleCopy(currentCreds.apiKey, "apiKey")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition text-xs font-medium text-slate-700 dark:text-white flex items-center gap-1 shadow-sm"
                    >
                      {copiedKey === "apiKey" ? (
                        <>
                          <Check className="w-3 h-3" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Secret Key Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-900 dark:text-white">Secret Key (Private)</label>
                    <span className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Keep secret — never share
                    </span>
                  </div>
                  <div className="relative group">
                    <input
                      type={showSecretKey ? "text" : "password"}
                      value={currentCreds.secretKey}
                      readOnly
                      className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white ${
                        currentCreds.hasSecretKey ? "pr-36" : "pr-3"
                      } focus:outline-none focus:border-indigo-500 transition`}
                    />
                    {currentCreds.hasSecretKey && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                        <button
                          onClick={() => setShowSecretKey(!showSecretKey)}
                          className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition text-xs font-medium text-slate-700 dark:text-white flex items-center gap-1"
                        >
                          {showSecretKey ? (
                            <>
                              <EyeOff className="w-3 h-3" />
                              Hide
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3" />
                              Show
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleCopy(currentCreds.secretKey, "secretKey")}
                          className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition text-xs font-medium text-slate-700 dark:text-white flex items-center gap-1"
                        >
                          {copiedKey === "secretKey" ? (
                            <>
                              <Check className="w-3 h-3" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                  {currentCreds.hasSecretKey ? (
                    <div className="mt-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Your new secret key is visible. Copy it now! It will be hidden after page refresh.
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1">
                      <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                      Secret keys are only shown once during generation. If lost, you must regenerate your credentials.
                    </p>
                  )}
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-600 dark:text-slate-400">Created: {currentCreds.createdAt}</span>
                  <span className="text-xs text-slate-600 dark:text-slate-400">•</span>
                  <span className="text-xs text-slate-600 dark:text-slate-400">Last used: {currentCreds.lastUsed}</span>
                </div>

                {/* Regenerate Button */}
                <div className="pt-2">
                  <button
                    onClick={() => setShowRegenerateModal(true)}
                    disabled={regenerateSandbox.isPending || regenerateProduction.isPending}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white text-sm font-semibold hover:from-rose-600 hover:to-rose-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  >
                    <RefreshCw className={`w-4 h-4 ${(regenerateSandbox.isPending || regenerateProduction.isPending) ? "animate-spin" : ""}`} />
                    {(regenerateSandbox.isPending || regenerateProduction.isPending) ? "Regenerating..." : "Regenerate Credentials"}
                  </button>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 flex items-start gap-1">
                    <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                    Warning: Regenerating will immediately invalidate your current credentials
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Sandbox Test Numbers */}
          {activeEnv === "sandbox" && (
            <div className="rounded-2xl bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-amber-500" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Sandbox Test Numbers</h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Use these deterministic test numbers for predictable outcomes in sandbox mode</p>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* MTN Column */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      MTN Mobile Money
                    </h4>
                    <div className="space-y-2">
                      {testNumbers.mtn.map((item) => (
                        <div key={item.number} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700">
                          <div>
                            <p className="text-sm font-mono text-slate-900 dark:text-white">{item.number}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">{item.desc}</p>
                          </div>
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                            item.color === "emerald" ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400" :
                            item.color === "rose" ? "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400" :
                            "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400"
                          }`}>
                            {item.outcome}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-3">Any other number → INVALID_MSISDN</p>
                  </div>

                  {/* Orange Column */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-orange-500" />
                      Orange Money
                    </h4>
                    <div className="space-y-2">
                      {testNumbers.orange.map((item) => (
                        <div key={item.number} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700">
                          <div>
                            <p className="text-sm font-mono text-slate-900 dark:text-white">{item.number}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">{item.desc}</p>
                          </div>
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                            item.color === "emerald" ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400" :
                            item.color === "rose" ? "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400" :
                            "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400"
                          }`}>
                            {item.outcome}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-3">Any other number → INVALID_MSISDN</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Best Practices */}
          <div className="rounded-2xl bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-indigo-500" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Security Best Practices</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-3 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  DO:
                </h4>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <li className="flex items-start gap-2">• Store secret keys in environment variables</li>
                  <li className="flex items-start gap-2">• Use HTTPS for all API requests</li>
                  <li className="flex items-start gap-2">• Rotate credentials regularly (every 90 days)</li>
                  <li className="flex items-start gap-2">• Monitor API usage for anomalies</li>
                  <li className="flex items-start gap-2">• Use separate keys for sandbox and production</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-rose-600 dark:text-rose-400 mb-3 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  DON'T:
                </h4>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <li className="flex items-start gap-2">• Commit secret keys to version control (Git)</li>
                  <li className="flex items-start gap-2">• Expose secret keys in frontend code</li>
                  <li className="flex items-start gap-2">• Share credentials via email or chat</li>
                  <li className="flex items-start gap-2">• Use production keys in sandbox environments</li>
                  <li className="flex items-start gap-2">• Hard-code credentials in your application</li>
                </ul>
              </div>
            </div>
            <button className="mt-6 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition flex items-center gap-1">
              Read Full Security Guide
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Regenerate Confirmation Modal */}
        {showRegenerateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-500" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Regenerate API Credentials?</h3>
                </div>
                <button onClick={() => { setShowRegenerateModal(false); setConfirmText(""); }} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="space-y-4 mb-6">
                <p className="text-sm text-slate-600 dark:text-slate-300">This will generate new API credentials and immediately invalidate your current ones.</p>
                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20">
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                    Important:
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                    <li>• Your current API key and secret will stop working</li>
                    <li>• Any active integrations will fail</li>
                    <li>• You must update your code with the new credentials</li>
                  </ul>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-900 dark:text-white mb-2 block">Type "REGENERATE" to confirm:</label>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                    placeholder="REGENERATE"
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => { setShowRegenerateModal(false); setConfirmText(""); }} className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition text-sm font-medium">
                  Cancel
                </button>
                <button
                  onClick={handleRegenerate}
                  disabled={confirmText !== "REGENERATE"}
                  className="px-4 py-2 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md"
                >
                  <RefreshCw className="w-4 h-4" />
                  Regenerate
                </button>
              </div>
            </div>
          </div>
        )}

        {/* New Credentials Modal */}
        {showNewCredsModal && newCredentials && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">New Credentials Generated</h3>
                </div>
                <button onClick={() => setShowNewCredsModal(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 mb-4">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  SAVE THESE CREDENTIALS NOW!
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">The secret key will only be shown once. After closing, you won't be able to see it again.</p>
              </div>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-medium text-slate-900 dark:text-white mb-2 block">New API Key</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={"sandboxApiKey" in newCredentials ? newCredentials.sandboxApiKey : newCredentials.productionApiKey}
                      readOnly
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-white pr-16"
                    />
                    <button
                      onClick={() => handleCopy("sandboxApiKey" in newCredentials ? newCredentials.sandboxApiKey : newCredentials.productionApiKey, "newApiKey")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition text-xs text-slate-700 dark:text-white flex items-center gap-1"
                    >
                      {copiedKey === "newApiKey" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-900 dark:text-white mb-2 block">New Secret Key</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={"sandboxSecretKey" in newCredentials ? newCredentials.sandboxSecretKey : newCredentials.productionSecretKey}
                      readOnly
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-white pr-16"
                    />
                    <button
                      onClick={() => handleCopy("sandboxSecretKey" in newCredentials ? newCredentials.sandboxSecretKey : newCredentials.productionSecretKey, "newSecretKey")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition text-xs text-slate-700 dark:text-white flex items-center gap-1"
                    >
                      {copiedKey === "newSecretKey" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const envContent = `# ${activeEnv === "production" ? "Production" : "Sandbox"} API Credentials
ZOPAY_API_KEY=${"sandboxApiKey" in newCredentials ? newCredentials.sandboxApiKey : newCredentials.productionApiKey}
ZOPAY_SECRET_KEY=${"sandboxSecretKey" in newCredentials ? newCredentials.sandboxSecretKey : newCredentials.productionSecretKey}`;
                    const blob = new Blob([envContent], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `.env.${activeEnv}`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download .env
                </button>
                <button
                  onClick={() => {
                    setShowNewCredsModal(false);
                    refetch();
                  }}
                  className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition text-sm font-medium shadow-md"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}