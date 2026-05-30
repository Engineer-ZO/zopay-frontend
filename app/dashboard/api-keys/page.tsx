"use client";

import { useState } from "react";
import {
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Download,
  FileText,
  Code,
  TestTube,
  Lock,
  ArrowRight,
  X,
  Check,
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
import { storeSecretKey } from "@/lib/zitoSign";

type Environment = "sandbox" | "production";

export default function ApiKeysPage() {
  // Get merchant account data from context
  const { merchant, merchantId, isLoading, refetch } = useUserMerchantData();

  // Determine if production is available
  const isProductionActive = merchant?.productionState === "ACTIVE";

  // Default to production if available, otherwise sandbox
  const [activeEnv, setActiveEnv] = useState<Environment>(
    isProductionActive ? "production" : "sandbox"
  );
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [showNewCredsModal, setShowNewCredsModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [newCredentials, setNewCredentials] = useState<
    RegenerateSandboxCredentialsResponse | RegenerateProductionCredentialsResponse | null
  >(null);

  // Regenerate credentials mutations
  const regenerateSandbox = useRegenerateSandboxCredentials(merchantId || "");
  const regenerateProduction = useRegenerateProductionCredentials(merchantId || "");

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">API Keys</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Loading your API credentials...
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-crimson-red-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // Show error if merchant not found
  if (!merchant) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">API Keys</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Unable to load merchant account
          </p>
        </div>
        <div className="bg-background rounded-xl p-6 border border-border">
          <div className="flex items-center gap-3 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm">Failed to load merchant account data</p>
          </div>
        </div>
      </div>
    );
  }

  // Additional production state checks
  const isProductionPending = merchant.productionState === "PENDING_APPROVAL";
  const isKYBApproved = merchant.kycStatus === "APPROVED";

  // Check if we have regenerated credentials for current environment
  const hasRegeneratedSandbox = newCredentials && "sandboxSecretKey" in newCredentials;
  const hasRegeneratedProduction = newCredentials && "productionSecretKey" in newCredentials;

  // Build credentials object from merchant data
  // If we just regenerated, show the actual secret key temporarily
  const credentials = {
    sandbox: {
      apiKey: merchant.sandboxApiKey,
      secretKey: hasRegeneratedSandbox
        ? newCredentials.sandboxSecretKey
        : "••••••••••••••••••••••••••••••••", // Masked when not available
      hasSecretKey: hasRegeneratedSandbox, // Flag to show/hide buttons
      createdAt: new Date(merchant.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      lastUsed: "Recently", // This would come from usage tracking
    },
    production: {
      apiKey: merchant.productionApiKey || "Not generated yet",
      secretKey: hasRegeneratedProduction
        ? newCredentials.productionSecretKey
        : "••••••••••••••••••••••••••••••••", // Masked when not available
      hasSecretKey: hasRegeneratedProduction, // Flag to show/hide buttons
      createdAt: merchant.productionApiKey
        ? new Date(merchant.updatedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
        : "N/A",
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

      // Refetch merchant data to update the UI
      refetch();
    } catch (error) {
      console.error("Failed to regenerate credentials:", error);
      // You might want to show an error toast here
    }
  };

  const currentCreds = credentials[activeEnv];
  const isProduction = activeEnv === "production";

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-xl font-bold text-foreground">API Keys</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Manage your API keys for accessing the ZitoPay API
        </p>
      </div>

      {/* ENVIRONMENT TABS */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveEnv("sandbox")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${activeEnv === "sandbox"
            ? "bg-crimson-red-500 text-white"
            : "bg-background border border-border text-foreground hover:bg-muted"
            }`}
        >
          <div className="w-2 h-2 bg-crimson-red-400 rounded-full" />
          Sandbox
          {activeEnv === "sandbox" && <Check className="w-4 h-4" />}
        </button>
        <button
          onClick={() => setActiveEnv("production")}
          disabled={!isProductionActive}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${activeEnv === "production"
            ? "bg-deep-blue-violet-500 text-white"
            : "bg-background border border-border text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            }`}
        >
          <div className="w-2 h-2 bg-deep-blue-violet-400 rounded-full" />
          Production
          {activeEnv === "production" && <Check className="w-4 h-4" />}
        </button>
      </div>

      {/* ENVIRONMENT BANNER */}
      <div
        className={`rounded-lg p-3 border ${isProduction
          ? "bg-deep-blue-violet-50 dark:bg-deep-blue-violet-900/10 border-deep-blue-violet-200 dark:border-deep-blue-violet-800"
          : "bg-crimson-red-50 dark:bg-crimson-red-900/10 border-crimson-red-200 dark:border-crimson-red-800"
          }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {isProduction ? (
                <div className="w-2 h-2 bg-deep-blue-violet-500 rounded-full animate-pulse" />
              ) : (
                <div className="w-2 h-2 bg-crimson-red-500 rounded-full animate-pulse" />
              )}
              <h3 className="text-sm font-semibold text-foreground">
                {isProduction ? "🔵 PRODUCTION MODE - Live Environment" : "🟠 SANDBOX MODE - Testing Environment"}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              {isProduction
                ? "⚠️ These credentials process REAL MONEY. Use with caution and never expose the secret key."
                : "Use these credentials for development and testing. No real money will be processed."}
            </p>
            {isProduction && isProductionActive && (
              <div className="flex items-center gap-3 mt-2 text-xs">
                <span className="flex items-center gap-1 text-deep-blue-violet-600 dark:text-deep-blue-violet-400">
                  <CheckCircle2 className="w-3 h-3" />
                  Active
                </span>
                <span className="flex items-center gap-1 text-deep-blue-violet-600 dark:text-deep-blue-violet-400">
                  <CheckCircle2 className="w-3 h-3" />
                  KYB Approved
                </span>
              </div>
            )}
          </div>
          {!isProduction && isProductionActive && (
            <button
              onClick={() => setActiveEnv("production")}
              className="text-xs font-medium text-crimson-red-600 dark:text-crimson-red-400 hover:underline whitespace-nowrap flex items-center gap-1"
            >
              Switch to Production
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* PRODUCTION NOT APPROVED STATE */}
      {isProduction && !isProductionActive && (
        <div className="bg-background rounded-xl p-6 border border-border">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-crimson-red-100 dark:bg-crimson-red-900/20 rounded-lg flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6 text-crimson-red-600 dark:text-crimson-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-foreground mb-2">
                🔒 Production Access Not Available
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Complete these steps to request production access:
              </p>
              <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-xs">
                {isKYBApproved ? (
                  <CheckCircle2 className="w-4 h-4 text-deep-blue-violet-500" />
                ) : (
                  <div className="w-4 h-4 border-2 border-crimson-red-500 rounded-full" />
                )}
                <span className="text-foreground">
                  1. Complete KYB verification {isKYBApproved && "✓"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {isProductionPending ? (
                  <div className="w-4 h-4 border-2 border-crimson-red-500 rounded-full animate-spin border-t-transparent" />
                ) : merchant.productionState === "NOT_REQUESTED" ? (
                  <div className="w-4 h-4 border-2 border-border rounded-full" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-deep-blue-violet-500" />
                )}
                <span className="text-foreground">
                  2. Submit production access request
                  {isProductionPending && " (Pending)"}
                </span>
              </div>
                <div className="flex items-center gap-2 text-xs">
                  {isProductionPending ? (
                    <div className="w-4 h-4 border-2 border-border rounded-full" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-border rounded-full" />
                  )}
                  <span className="text-muted-foreground">3. Wait for admin approval</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="px-3 py-1.5 bg-crimson-red-500 text-white rounded-lg text-xs font-semibold hover:bg-crimson-red-600 transition-colors">
                  View KYB Status
                </button>
                <button
                  disabled={!isKYBApproved || isProductionPending}
                  className="px-3 py-1.5 bg-background border border-border text-foreground rounded-lg text-xs font-semibold hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProductionPending ? "Request Pending" : "Request Production Access"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API CREDENTIALS */}
      {(!isProduction || isProductionActive) && (
        <div className="bg-background rounded-xl p-6 border border-border space-y-6">
          <h3 className="text-sm font-semibold text-foreground">API Credentials</h3>

          {/* API Key (Public) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground">API Key (Public)</label>
              <span className="flex items-center gap-1 text-xs text-deep-blue-violet-600 dark:text-deep-blue-violet-400">
                <CheckCircle2 className="w-3 h-3" />
                Safe to expose
              </span>
            </div>
            <div className="relative">
              <input
                type="text"
                value={currentCreds.apiKey}
                readOnly
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-xs font-mono text-foreground pr-20"
              />
              <button
                onClick={() => handleCopy(currentCreds.apiKey, "apiKey")}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-background border border-border rounded text-xs font-medium hover:bg-muted transition-colors flex items-center gap-1"
              >
                {copiedKey === "apiKey" ? (
                  <>
                    <Check className="w-3 h-3 text-deep-blue-violet-500" />
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
            <p className="text-xs text-muted-foreground flex items-start gap-1">
              <CheckCircle2 className="w-3 h-3 mt-0.5 text-deep-blue-violet-500 shrink-0" />
              This key is safe to expose in your frontend code
            </p>
          </div>

          {/* Secret Key (Private) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground">Secret Key (Private)</label>
              <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="w-3 h-3" />
                Keep secret
              </span>
            </div>
            <div className="relative">
              <input
                type={showSecretKey ? "text" : "password"}
                value={currentCreds.secretKey}
                readOnly
                className={`w-full px-3 py-2 bg-muted border border-border rounded-lg text-xs font-mono text-foreground ${currentCreds.hasSecretKey ? "pr-32" : "pr-3"
                  }`}
              />
              {/* Only show buttons if we have the actual secret key */}
              {currentCreds.hasSecretKey && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                  <button
                    onClick={() => setShowSecretKey(!showSecretKey)}
                    className="px-2 py-1 bg-background border border-border rounded text-xs font-medium hover:bg-muted transition-colors flex items-center gap-1"
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
                    className="px-2 py-1 bg-background border border-border rounded text-xs font-medium hover:bg-muted transition-colors flex items-center gap-1"
                  >
                    {copiedKey === "secretKey" ? (
                      <>
                        <Check className="w-3 h-3 text-deep-blue-violet-500" />
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
              <div className="bg-deep-blue-violet-50 dark:bg-deep-blue-violet-900/10 border border-deep-blue-violet-200 dark:border-deep-blue-violet-800 rounded-lg p-3">
                <p className="text-xs font-semibold text-foreground flex items-center gap-1 mb-1">
                  <CheckCircle2 className="w-3 h-3 text-deep-blue-violet-600" />
                  Secret Key Available
                </p>
                <p className="text-xs text-muted-foreground">
                  Your secret key is currently visible. Copy it now! It will be hidden when you refresh or navigate away from this page.
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground flex items-start gap-1">
                <AlertCircle className="w-3 h-3 mt-0.5 text-crimson-red-500 shrink-0" />
                Secret keys are only shown once during generation. If you lost it, you must regenerate your credentials.
              </p>
            )}
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-3 border-t border-border">
            <span>Created: {currentCreds.createdAt}</span>
            <span>•</span>
            <span>Last used: {currentCreds.lastUsed}</span>
          </div>

          {/* Regenerate Button */}
          <div className="pt-3 border-t border-border">
            <button
              onClick={() => setShowRegenerateModal(true)}
              disabled={regenerateSandbox.isPending || regenerateProduction.isPending}
              className="px-4 py-2 bg-crimson-red-500 text-white rounded-lg text-xs font-semibold hover:bg-crimson-red-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${(regenerateSandbox.isPending || regenerateProduction.isPending) ? "animate-spin" : ""}`} />
              {(regenerateSandbox.isPending || regenerateProduction.isPending) ? "Regenerating..." : "Regenerate Credentials"}
            </button>
            <p className="text-xs text-muted-foreground mt-2 flex items-start gap-1">
              <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
              Warning: Regenerating will immediately invalidate your current credentials
            </p>
          </div>
        </div>
      )}



      {/* QUICK START */}
      {/* <div className="bg-background rounded-xl p-6 border border-border">
        <h3 className="text-sm font-semibold text-foreground mb-4">Quick Start</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <button className="flex items-center justify-center gap-2 py-3 px-4 bg-background border border-border text-foreground rounded-lg text-xs font-semibold hover:bg-muted transition-colors">
            <FileText className="w-4 h-4" />
            API Documentation
          </button>
          <button className="flex items-center justify-center gap-2 py-3 px-4 bg-background border border-border text-foreground rounded-lg text-xs font-semibold hover:bg-muted transition-colors">
            <Code className="w-4 h-4" />
            Code Examples
          </button>
          <button className="flex items-center justify-center gap-2 py-3 px-4 bg-background border border-border text-foreground rounded-lg text-xs font-semibold hover:bg-muted transition-colors">
            <TestTube className="w-4 h-4" />
            Test API
          </button>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 border border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-foreground">JavaScript / Node.js</span>
            <button
              onClick={() => handleCopy(codeExample, "code")}
              className="text-xs font-medium text-crimson-red-600 dark:text-crimson-red-400 hover:underline flex items-center gap-1"
            >
              {copiedKey === "code" ? (
                <>
                  <Check className="w-3 h-3" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  Copy Code
                </>
              )}
            </button>
          </div>
          <pre className="text-xs font-mono text-foreground overflow-x-auto">
            <code>{codeExample}</code>
          </pre>
        </div>
        <button className="mt-4 text-xs font-medium text-crimson-red-600 dark:text-crimson-red-400 hover:underline flex items-center gap-1">
          View More Examples
          <ArrowRight className="w-3 h-3" />
        </button>
      </div> */}

      {/* SECURITY BEST PRACTICES */}
      <div className="bg-background rounded-xl p-6 border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-4 h-4 text-crimson-red-600 dark:text-crimson-red-400" />
          <h3 className="text-sm font-semibold text-foreground">Security Best Practices</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-xs font-semibold text-deep-blue-violet-600 dark:text-deep-blue-violet-400 mb-3 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              DO:
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-deep-blue-violet-500 mt-0.5">•</span>
                Store secret keys in environment variables
              </li>
              <li className="flex items-start gap-2">
                <span className="text-deep-blue-violet-500 mt-0.5">•</span>
                Use HTTPS for all API requests
              </li>
              <li className="flex items-start gap-2">
                <span className="text-deep-blue-violet-500 mt-0.5">•</span>
                Rotate credentials regularly
              </li>
              <li className="flex items-start gap-2">
                <span className="text-deep-blue-violet-500 mt-0.5">•</span>
                Monitor API usage for anomalies
              </li>
              <li className="flex items-start gap-2">
                <span className="text-deep-blue-violet-500 mt-0.5">•</span>
                Use different keys for sandbox and production
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              DON&apos;T:
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                Commit secret keys to version control (Git)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                Expose secret keys in frontend code
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                Share credentials via email or chat
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                Use production keys in sandbox
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                Hard-code credentials in your application
              </li>
            </ul>
          </div>
        </div>
        <button className="mt-6 text-xs font-medium text-crimson-red-600 dark:text-crimson-red-400 hover:underline flex items-center gap-1">
          Read Full Security Guide
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* SANDBOX TEST NUMBERS — only shown in sandbox mode */}
      {activeEnv === "sandbox" && (
        <div className="bg-background rounded-xl p-6 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <TestTube className="w-4 h-4 text-crimson-red-600 dark:text-crimson-red-400" />
            <h3 className="text-sm font-semibold text-foreground">Sandbox Test Numbers</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-5">
            Use these numbers when testing in sandbox mode. Each number has a fixed, deterministic outcome — results never change.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* MTN */}
            <div>
              <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
                MTN Mobile Money
              </h4>
              <div className="space-y-2">
                {[
                  { number: "237670000001", outcome: "SUCCESS", desc: "Completes on first check", color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/10" },
                  { number: "237670000002", outcome: "SUCCESS", desc: "Completes on first check", color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/10" },
                  { number: "237670000003", outcome: "FAILED", desc: "Insufficient funds", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/10" },
                  { number: "237670000004", outcome: "FAILED", desc: "Declined", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/10" },
                  { number: "237670000005", outcome: "PENDING", desc: "Never resolves", color: "text-crimson-red-600 dark:text-crimson-red-400", bg: "bg-crimson-red-50 dark:bg-crimson-red-900/10" },
                  { number: "237670000006", outcome: "PENDING", desc: "Never resolves", color: "text-crimson-red-600 dark:text-crimson-red-400", bg: "bg-crimson-red-50 dark:bg-crimson-red-900/10" },
                ].map(({ number, outcome, desc, color, bg }) => (
                  <div key={number} className={`flex items-center justify-between px-3 py-2 rounded-lg ${bg} border border-transparent`}>
                    <div>
                      <p className="text-xs font-mono font-semibold text-foreground">{number}</p>
                      <p className="text-[10px] text-muted-foreground">{desc}</p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase ${color}`}>{outcome}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">Any other number → rejected with <span className="font-mono">INVALID_MSISDN</span></p>
            </div>

            {/* Orange */}
            <div>
              <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-crimson-red-400 inline-block" />
                Orange Money
              </h4>
              <div className="space-y-2">
                {[
                  { number: "237690000001", outcome: "SUCCESS", desc: "Completes on first check", color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/10" },
                  { number: "237690000002", outcome: "SUCCESS", desc: "Completes on first check", color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/10" },
                  { number: "237690000003", outcome: "FAILED", desc: "Insufficient funds", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/10" },
                  { number: "237690000004", outcome: "FAILED", desc: "Declined", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/10" },
                  { number: "237690000005", outcome: "PENDING", desc: "Never resolves", color: "text-crimson-red-600 dark:text-crimson-red-400", bg: "bg-crimson-red-50 dark:bg-crimson-red-900/10" },
                  { number: "237690000006", outcome: "PENDING", desc: "Never resolves", color: "text-crimson-red-600 dark:text-crimson-red-400", bg: "bg-crimson-red-50 dark:bg-crimson-red-900/10" },
                ].map(({ number, outcome, desc, color, bg }) => (
                  <div key={number} className={`flex items-center justify-between px-3 py-2 rounded-lg ${bg} border border-transparent`}>
                    <div>
                      <p className="text-xs font-mono font-semibold text-foreground">{number}</p>
                      <p className="text-[10px] text-muted-foreground">{desc}</p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase ${color}`}>{outcome}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">Any other number → rejected with <span className="font-mono">INVALID_MSISDN</span></p>
            </div>
          </div>
        </div>
      )}

      {/* REGENERATE CONFIRMATION MODAL */}
      {showRegenerateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-2xl p-6 shadow-2xl border border-border max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-crimson-red-600 dark:text-crimson-red-400" />
                <h3 className="text-lg font-semibold text-foreground">Regenerate API Credentials?</h3>
              </div>
              <button
                onClick={() => {
                  setShowRegenerateModal(false);
                  setConfirmText("");
                }}
                className="p-1 hover:bg-muted rounded transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <p className="text-sm text-foreground">
                This will generate new API credentials and immediately invalidate your current ones.
              </p>

              <div className="bg-crimson-red-50 dark:bg-crimson-red-900/10 border border-crimson-red-200 dark:border-crimson-red-800 rounded-lg p-4">
                <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-crimson-red-600" />
                  Important:
                </h4>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>• Your current API key and secret will stop working</li>
                  <li>• Any active integrations will fail</li>
                  <li>• You must update your code with the new credentials</li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-foreground mb-2">Before proceeding:</h4>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3 h-3 mt-0.5 text-deep-blue-violet-500" />
                    Ensure you have access to update your integration
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3 h-3 mt-0.5 text-deep-blue-violet-500" />
                    Consider doing this during low-traffic periods
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3 h-3 mt-0.5 text-deep-blue-violet-500" />
                    Have a rollback plan ready
                  </li>
                </ul>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-2 block">
                  Type &quot;REGENERATE&quot; to confirm:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground"
                  placeholder="REGENERATE"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowRegenerateModal(false);
                  setConfirmText("");
                }}
                className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleRegenerate}
                disabled={confirmText !== "REGENERATE" || regenerateSandbox.isPending || regenerateProduction.isPending}
                className="px-4 py-2 rounded-lg bg-crimson-red-500 text-white hover:bg-crimson-red-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {(regenerateSandbox.isPending || regenerateProduction.isPending) && (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                )}
                {(regenerateSandbox.isPending || regenerateProduction.isPending)
                  ? "Regenerating..."
                  : "Regenerate Credentials"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW CREDENTIALS MODAL */}
      {showNewCredsModal && newCredentials && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-2xl p-6 shadow-2xl border border-border max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-deep-blue-violet-600" />
                <h3 className="text-lg font-semibold text-foreground">New Credentials Generated</h3>
              </div>
              <button
                onClick={() => {
                  setShowNewCredsModal(false);
                  // Don't clear newCredentials - keep it so secret key stays visible on main page
                }}
                className="p-1 hover:bg-muted rounded transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="bg-crimson-red-50 dark:bg-crimson-red-900/10 border border-crimson-red-200 dark:border-crimson-red-800 rounded-lg p-4 mb-4">
              <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                <AlertCircle className="w-4 h-4 text-crimson-red-600" />
                SAVE THESE CREDENTIALS NOW!
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                The secret key will only be shown once. After closing this window, you won&apos;t be able to see it again.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-medium text-foreground mb-2 block">
                  New API Key ({activeEnv === "production" ? "Production" : "Sandbox"})
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={
                      "sandboxApiKey" in newCredentials
                        ? newCredentials.sandboxApiKey
                        : newCredentials.productionApiKey
                    }
                    readOnly
                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-xs font-mono text-foreground pr-16"
                  />
                  <button
                    onClick={() =>
                      handleCopy(
                        "sandboxApiKey" in newCredentials
                          ? newCredentials.sandboxApiKey
                          : newCredentials.productionApiKey,
                        "newApiKey"
                      )
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-background border border-border rounded text-xs font-medium hover:bg-muted transition-colors flex items-center gap-1"
                  >
                    {copiedKey === "newApiKey" ? (
                      <>
                        <Check className="w-3 h-3 text-deep-blue-violet-500" />
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

              <div>
                <label className="text-xs font-medium text-foreground mb-2 block">
                  New Secret Key ({activeEnv === "production" ? "Production" : "Sandbox"})
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={
                      "sandboxSecretKey" in newCredentials
                        ? newCredentials.sandboxSecretKey
                        : newCredentials.productionSecretKey
                    }
                    readOnly
                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-xs font-mono text-foreground pr-16"
                  />
                  <button
                    onClick={() =>
                      handleCopy(
                        "sandboxSecretKey" in newCredentials
                          ? newCredentials.sandboxSecretKey
                          : newCredentials.productionSecretKey,
                        "newSecretKey"
                      )
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-background border border-border rounded text-xs font-medium hover:bg-muted transition-colors flex items-center gap-1"
                  >
                    {copiedKey === "newSecretKey" ? (
                      <>
                        <Check className="w-3 h-3 text-deep-blue-violet-500" />
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

              <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-xs font-semibold text-foreground flex items-center gap-1 mb-1">
                  <AlertCircle className="w-3 h-3 text-red-600" />
                  Important Warning
                </p>
                <p className="text-xs text-muted-foreground">
                  {newCredentials.warning || "Your old credentials have been invalidated immediately. Update your integration now to avoid service disruption."}
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-3">
                <h4 className="text-xs font-semibold text-foreground mb-2">Next Steps:</h4>
                <ol className="space-y-1 text-xs text-muted-foreground list-decimal list-inside">
                  <li>Copy and save both keys securely</li>
                  <li>Update your environment variables</li>
                  <li>Deploy your updated code</li>
                  <li>Test your integration</li>
                </ol>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  const envContent = `# ${activeEnv === "production" ? "Production" : "Sandbox"} API Credentials
ZITOPAY_API_KEY=${"sandboxApiKey" in newCredentials ? newCredentials.sandboxApiKey : newCredentials.productionApiKey}
ZITOPAY_SECRET_KEY=${"sandboxSecretKey" in newCredentials ? newCredentials.sandboxSecretKey : newCredentials.productionSecretKey}`;

                  const blob = new Blob([envContent], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `.env.${activeEnv}`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download .env
              </button>
              <button
                onClick={() => {
                  setShowNewCredsModal(false);
                  // Don't clear newCredentials - keep it so secret key stays visible on main page
                }}
                className="flex-1 px-4 py-2 rounded-lg bg-crimson-red-500 text-white hover:bg-crimson-red-600 transition-colors text-sm font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const codeExample = `const zitopay = require('zitopay-sdk');

const client = new zitopay({
  apiKey: 'sk_sandbox_...',
  secretKey: 'secret_...'
});

const payment = await client.createPayment({
  amount: 1000,
  currency: 'XAF'
});`;
