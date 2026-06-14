"use client";

import { useState } from "react";
import {
  Shield,
  ShieldCheck,
  ShieldOff,
  QrCode,
  Key,
  Copy,
  Check,
  Loader2,
  AlertTriangle,
  Eye,
  EyeOff,
  RefreshCw,
  Lock,
  Smartphone,
  Fingerprint,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import {
  use2FAStatus,
  useInitiate2FASetup,
  useConfirm2FASetup,
  useDisable2FA,
  useRegenerateBackupCodes,
} from "@/features/auth/hooks/useAuth";

// ---- Setup Flow Steps ----
type SetupStep = "idle" | "scan" | "confirm" | "done";

export default function SecuritySettingsPage() {
  const { data: twoFAStatus, isLoading: statusLoading } = use2FAStatus();

  const [setupStep, setSetupStep] = useState<SetupStep>("idle");
  const [setupData, setSetupData] = useState<{ secret: string; qrDataUrl: string; manualEntryKey: string } | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Disable 2FA state
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [showDisablePassword, setShowDisablePassword] = useState(false);

  // Regenerate backup codes state
  const [showRegenModal, setShowRegenModal] = useState(false);
  const [newBackupCodes, setNewBackupCodes] = useState<string[]>([]);

  const { mutate: initiate, isPending: initiating } = useInitiate2FASetup();
  const { mutate: confirm, isPending: confirming } = useConfirm2FASetup();
  const { mutate: disable, isPending: disabling } = useDisable2FA();
  const { mutate: regenerate, isPending: regenerating } = useRegenerateBackupCodes();

  const handleStartSetup = () => {
    initiate(undefined, {
      onSuccess: (data) => {
        setSetupData(data);
        setSetupStep("scan");
      },
      onError: (err) => toast.error(err.message),
    });
  };

  const handleConfirmSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupData) return;
    confirm(
      { secret: setupData.secret, totpCode: totpCode.trim() },
      {
        onSuccess: (data) => {
          setBackupCodes(data.backupCodes);
          setSetupStep("done");
          toast.success("2FA enabled successfully!");
        },
        onError: (err) => toast.error(err.message || "Invalid code. Please try again."),
      }
    );
  };

  const handleDisable = (e: React.FormEvent) => {
    e.preventDefault();
    disable(
      { password: disablePassword },
      {
        onSuccess: () => {
          toast.success("2FA has been disabled.");
          setShowDisableModal(false);
          setDisablePassword("");
          setSetupStep("idle");
        },
        onError: (err) => toast.error(err.message || "Incorrect password."),
      }
    );
  };

  const handleRegenerate = () => {
    regenerate(undefined, {
      onSuccess: (data) => {
        setNewBackupCodes(data.backupCodes);
        setShowRegenModal(true);
        toast.success("Backup codes regenerated. Previous codes are now invalid.");
      },
      onError: (err) => toast.error(err.message),
    });
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const copyAllCodes = (codes: string[]) => {
    navigator.clipboard.writeText(codes.join("\n"));
    toast.success("All codes copied to clipboard");
  };

  if (statusLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Shield className="w-5 h-5 text-indigo-500 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const is2FAEnabled = twoFAStatus?.enabled ?? false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-white via-white to-indigo-50/50 dark:from-slate-800/80 dark:via-slate-800/60 dark:to-indigo-950/30 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-6 shadow-lg">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Security Settings
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                  Manage two-factor authentication and account security
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2FA Card */}
        <div className="rounded-2xl bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50/30 to-transparent dark:from-slate-800/20">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${is2FAEnabled ? 'bg-emerald-100 dark:bg-emerald-500/20' : 'bg-slate-100 dark:bg-slate-700'}`}>
                  {is2FAEnabled ? (
                    <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <ShieldOff className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                  )}
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900 dark:text-white">Two-Factor Authentication</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {is2FAEnabled
                      ? `Enabled · ${twoFAStatus?.backupCodesRemaining ?? 0} backup codes remaining`
                      : "Add an extra layer of security using an authenticator app"}
                  </p>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                is2FAEnabled
                  ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-600"
              }`}>
                {is2FAEnabled ? (
                  <>
                    <CheckCircle className="w-3 h-3" />
                    Enabled
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3" />
                    Disabled
                  </>
                )}
              </span>
            </div>
          </div>

          <div className="p-6">
            {/* ---- Not enabled + not in setup flow ---- */}
            {!is2FAEnabled && setupStep === "idle" && (
              <div className="space-y-5">
                <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950/20 p-4 border border-indigo-200 dark:border-indigo-500/20">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-500/20">
                      <Smartphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-100 mb-1">How it works</p>
                      <p className="text-xs text-indigo-700 dark:text-indigo-300">
                        Use an authenticator app like <strong>Google Authenticator</strong> or <strong>Authy</strong> to
                        generate time-based codes each time you log in. This adds an extra layer of security to your account.
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleStartSetup}
                  disabled={initiating}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 shadow-md"
                >
                  {initiating ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
                  Enable Two-Factor Authentication
                </button>
              </div>
            )}

            {/* ---- Step: Scan QR ---- */}
            {setupStep === "scan" && setupData && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur-xl opacity-50" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={setupData.qrDataUrl}
                      alt="2FA QR Code"
                      className="relative w-48 h-48 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-lg"
                    />
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 p-4 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-2">
                    <Key className="w-3.5 h-3.5" />
                    Manual Entry Key
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono text-slate-900 dark:text-white flex-1 break-all bg-white dark:bg-slate-800 p-2 rounded-lg">
                      {setupData.manualEntryKey}
                    </code>
                    <button
                      onClick={() => copyCode(setupData.manualEntryKey)}
                      className="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors"
                    >
                      {copiedCode === setupData.manualEntryKey ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-500" />
                      )}
                    </button>
                  </div>
                </div>

                <form onSubmit={handleConfirmSetup} className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">
                      Enter verification code
                    </label>
                    <input
                      type="text"
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value)}
                      placeholder="000000"
                      maxLength={6}
                      inputMode="numeric"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-center font-mono tracking-widest text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                      required
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      Enter the 6-digit code shown in your authenticator app
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => { setSetupStep("idle"); setSetupData(null); setTotpCode(""); }}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={confirming || totpCode.length !== 6}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                    >
                      {confirming ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Verify & Enable"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ---- Step: Done — show backup codes ---- */}
            {setupStep === "done" && backupCodes.length > 0 && (
              <BackupCodesDisplay
                codes={backupCodes}
                copiedCode={copiedCode}
                onCopy={copyCode}
                onCopyAll={() => copyAllCodes(backupCodes)}
                onDone={() => setSetupStep("idle")}
              />
            )}

            {/* ---- 2FA enabled — show management options ---- */}
            {is2FAEnabled && setupStep === "idle" && (
              <div className="space-y-3">
                <button
                  onClick={handleRegenerate}
                  disabled={regenerating}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 disabled:opacity-50"
                >
                  {regenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Regenerate Backup Codes
                </button>
                <button
                  onClick={() => setShowDisableModal(true)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 font-semibold hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all duration-200"
                >
                  <ShieldOff className="w-4 h-4" />
                  Disable Two-Factor Authentication
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Security Tips */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/30 dark:to-slate-800/20 border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md">
              <Fingerprint className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Security Best Practices</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Follow these guidelines to keep your account secure
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-start gap-2 p-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" />
              <span className="text-xs text-slate-600 dark:text-slate-400">Always use a strong, unique password for your account</span>
            </div>
            <div className="flex items-start gap-2 p-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" />
              <span className="text-xs text-slate-600 dark:text-slate-400">Store backup codes in a secure password manager</span>
            </div>
            <div className="flex items-start gap-2 p-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" />
              <span className="text-xs text-slate-600 dark:text-slate-400">Never share your 2FA codes or backup codes with anyone</span>
            </div>
            <div className="flex items-start gap-2 p-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" />
              <span className="text-xs text-slate-600 dark:text-slate-400">Regenerate backup codes immediately if they are compromised</span>
            </div>
          </div>
        </div>
      </div>

      {/* Disable 2FA Modal - Enhanced */}
      {showDisableModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setShowDisableModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-500/20">
                  <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Disable 2FA</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">This will reduce your account security</p>
                </div>
              </div>
            </div>
            <form onSubmit={handleDisable} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">
                  Confirm your password
                </label>
                <div className="relative">
                  <input
                    type={showDisablePassword ? "text" : "password"}
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    placeholder="Enter your current password"
                    className="w-full px-4 pr-12 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowDisablePassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    {showDisablePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowDisableModal(false); setDisablePassword(""); }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={disabling || !disablePassword}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                >
                  {disabling ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Disable 2FA"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Regenerated Backup Codes Modal - Enhanced */}
      {showRegenModal && newBackupCodes.length > 0 && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setShowRegenModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-white to-indigo-50/30 dark:from-slate-800 dark:to-indigo-950/20 border-b border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                  <Key className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">New Backup Codes</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Save these codes securely</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <BackupCodesDisplay
                codes={newBackupCodes}
                copiedCode={copiedCode}
                onCopy={copyCode}
                onCopyAll={() => copyAllCodes(newBackupCodes)}
                onDone={() => { setShowRegenModal(false); setNewBackupCodes([]); }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BackupCodesDisplay({
  codes,
  copiedCode,
  onCopy,
  onCopyAll,
  onDone,
}: {
  codes: string[];
  copiedCode: string | null;
  onCopy: (code: string) => void;
  onCopyAll: () => void;
  onDone: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-500/20 p-4">
        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-500/20">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-1">Important: Save these codes now</p>
            <p className="text-xs text-amber-800 dark:text-amber-200">
              Each code can only be used once. If you lose access to your authenticator app, use one of these to sign in.
              These codes will not be shown again.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {codes.map((code) => (
          <button
            key={code}
            onClick={() => onCopy(code)}
            className="group flex items-center justify-between px-3 py-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl font-mono text-sm text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 border border-slate-200 dark:border-slate-700"
          >
            <span>{code}</span>
            {copiedCode === code ? (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </button>
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onCopyAll}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
        >
          <Copy className="w-4 h-4" />
          Copy All Codes
        </button>
        <button
          onClick={onDone}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
        >
          <Check className="w-4 h-4" />
          Done
        </button>
      </div>
    </div>
  );
}