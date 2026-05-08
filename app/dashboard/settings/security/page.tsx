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
      <div className="p-6 flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const is2FAEnabled = twoFAStatus?.enabled ?? false;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Shield className="w-5 h-5 text-orange-500" />
          Security Settings
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Manage two-factor authentication and account security
        </p>
      </div>

      {/* 2FA Card */}
      <div className="bg-background rounded-xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            {is2FAEnabled ? (
              <ShieldCheck className="w-6 h-6 text-green-500" />
            ) : (
              <ShieldOff className="w-6 h-6 text-muted-foreground" />
            )}
            <div>
              <p className="text-sm font-semibold text-foreground">Two-Factor Authentication</p>
              <p className="text-xs text-muted-foreground">
                {is2FAEnabled
                  ? `Enabled · ${twoFAStatus?.backupCodesRemaining ?? 0} backup codes remaining`
                  : "Add an extra layer of security using an authenticator app"}
              </p>
            </div>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
              is2FAEnabled
                ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {is2FAEnabled ? "Enabled" : "Disabled"}
          </span>
        </div>

        <div className="p-5">
          {/* ---- Not enabled + not in setup flow ---- */}
          {!is2FAEnabled && setupStep === "idle" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Use an authenticator app like <strong>Google Authenticator</strong> or <strong>Authy</strong> to
                generate time-based codes each time you log in.
              </p>
              <button
                onClick={handleStartSetup}
                disabled={initiating}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {initiating ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
                Enable 2FA
              </button>
            </div>
          )}

          {/* ---- Step: Scan QR ---- */}
          {setupStep === "scan" && setupData && (
            <div className="space-y-5">
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">1. Scan this QR code</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Open your authenticator app and scan the code below.
                </p>
                <div className="flex justify-center mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={setupData.qrDataUrl}
                    alt="2FA QR Code"
                    className="w-48 h-48 rounded-lg border border-border"
                  />
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Manual entry key:</p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono text-foreground flex-1 break-all">
                      {setupData.manualEntryKey}
                    </code>
                    <button
                      onClick={() => copyCode(setupData.manualEntryKey)}
                      className="p-1.5 hover:bg-background rounded transition-colors flex-shrink-0"
                    >
                      {copiedCode === setupData.manualEntryKey ? (
                        <Check className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <form onSubmit={handleConfirmSetup} className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">2. Enter the 6-digit code</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    Enter the code shown in your authenticator app to confirm setup.
                  </p>
                  <input
                    type="text"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                    inputMode="numeric"
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-center font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setSetupStep("idle"); setSetupData(null); setTotpCode(""); }}
                    className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg text-sm font-semibold hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={confirming || totpCode.length !== 6}
                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
                  >
                    {confirming ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Confirm & Enable"}
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
                className="flex items-center gap-2 px-4 py-2 border border-border text-foreground rounded-lg text-sm font-semibold hover:bg-muted transition-colors disabled:opacity-50"
              >
                {regenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Regenerate Backup Codes
              </button>
              <button
                onClick={() => setShowDisableModal(true)}
                className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
              >
                <ShieldOff className="w-4 h-4" />
                Disable 2FA
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Disable 2FA Modal */}
      {showDisableModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-2xl p-6 shadow-2xl border border-border max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">Disable Two-Factor Authentication</h3>
                <p className="text-xs text-muted-foreground">This will reduce your account security</p>
              </div>
            </div>
            <form onSubmit={handleDisable} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">
                  Enter your password to confirm
                </label>
                <div className="relative">
                  <input
                    type={showDisablePassword ? "text" : "password"}
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    placeholder="Current password"
                    className="w-full px-3 pr-10 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowDisablePassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showDisablePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setShowDisableModal(false); setDisablePassword(""); }}
                  className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg text-sm font-semibold hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={disabling || !disablePassword}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {disabling ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Disable 2FA"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Regenerated Backup Codes Modal */}
      {showRegenModal && newBackupCodes.length > 0 && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-2xl p-6 shadow-2xl border border-border max-w-md w-full">
            <h3 className="text-base font-semibold text-foreground mb-1">New Backup Codes</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Your previous codes are now invalid. Store these somewhere safe — they won&apos;t be shown again.
            </p>
            <BackupCodesDisplay
              codes={newBackupCodes}
              copiedCode={copiedCode}
              onCopy={copyCode}
              onCopyAll={() => copyAllCodes(newBackupCodes)}
              onDone={() => { setShowRegenModal(false); setNewBackupCodes([]); }}
            />
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
    <div className="space-y-4">
      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Key className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-400">
            <strong>Save these backup codes now.</strong> Each code can only be used once. If you lose access to
            your authenticator app, use one of these to sign in.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {codes.map((code) => (
          <button
            key={code}
            onClick={() => onCopy(code)}
            className="flex items-center justify-between px-3 py-2 bg-muted rounded-lg font-mono text-xs text-foreground hover:bg-muted/80 transition-colors group"
          >
            <span>{code}</span>
            {copiedCode === code ? (
              <Check className="w-3 h-3 text-green-500" />
            ) : (
              <Copy className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          onClick={onCopyAll}
          className="flex items-center gap-2 flex-1 px-4 py-2 border border-border text-foreground rounded-lg text-sm font-semibold hover:bg-muted transition-colors"
        >
          <Copy className="w-4 h-4" />
          Copy All
        </button>
        <button
          onClick={onDone}
          className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}
