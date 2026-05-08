"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, Loader2, ArrowLeft, KeyRound } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";
import { useVerify2FA } from "@/features/auth/hooks/useAuth";
import { toast } from "sonner";

function Verify2FAContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const partialToken = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [code, setCode] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { mutate: verify, isPending, error } = useVerify2FA();

  useEffect(() => {
    if (!partialToken) {
      router.replace("/login");
    }
    inputRef.current?.focus();
  }, [partialToken, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    verify(
      { partialToken, code: code.trim() },
      {
        onError: (err) => {
          toast.error(err.message || "Invalid code. Please try again.");
          setCode("");
          inputRef.current?.focus();
        },
      }
    );
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <div className="bg-background rounded-2xl shadow-xl border border-border p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-7 h-7 text-orange-500" />
            </div>
            <h1 className="text-xl font-bold text-foreground mb-1">Two-Factor Authentication</h1>
            <p className="text-xs text-muted-foreground">
              {useBackupCode
                ? "Enter one of your backup codes"
                : `Open your authenticator app and enter the 6-digit code for ${email}`}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-xs text-red-500 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900 rounded-lg">
                {error.message || "Invalid or expired code. Please try again."}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                {useBackupCode ? "Backup Code" : "Authentication Code"}
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={useBackupCode ? "A1B2C3D4E5" : "000000"}
                  maxLength={useBackupCode ? 10 : 6}
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef2d10] focus:border-transparent transition-all text-foreground placeholder:text-muted-foreground tracking-widest text-center font-mono"
                  autoComplete="one-time-code"
                  inputMode={useBackupCode ? "text" : "numeric"}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending || code.trim().length === 0}
              className="w-full py-2.5 bg-[#ef2d10] text-white rounded-lg font-semibold text-sm hover:bg-[#d0260e] transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify & Sign In"
              )}
            </button>
          </form>

          {/* Toggle backup code */}
          <div className="mt-4 text-center">
            <button
              onClick={() => { setUseBackupCode((v) => !v); setCode(""); }}
              className="text-xs text-[#2466eb] hover:underline"
            >
              {useBackupCode ? "Use authenticator app instead" : "Use a backup code instead"}
            </button>
          </div>

          {/* Back to login */}
          <div className="mt-4 text-center">
            <button
              onClick={() => router.push("/login")}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to login
            </button>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}

export default function Verify2FAPage() {
  return (
    <Suspense fallback={<AuthLayout><div className="flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div></AuthLayout>}>
      <Verify2FAContent />
    </Suspense>
  );
}
