"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, Loader2, ArrowLeft, KeyRound } from "lucide-react";
import Image from "next/image";
import { useAdminVerify2FA } from "@/features/auth/hooks/useAuth";
import { toast } from "sonner";

function AdminVerify2FAContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const partialToken = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [code, setCode] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { mutate: verify, isPending, error } = useAdminVerify2FA();

  useEffect(() => {
    if (!partialToken) {
      router.replace("/admin/login");
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <Image src="/zitopaylogo.png" alt="ZitoPay" width={150} height={50} className="object-contain" />
            <div className="px-2 py-1 bg-deep-blue-violet-500 text-white rounded text-xs font-bold">ADMIN</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-deep-blue-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-7 h-7 text-deep-blue-violet-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">Two-Factor Authentication</h1>
            <p className="text-xs text-gray-500">
              {useBackupCode
                ? "Enter one of your backup codes"
                : `Open your authenticator app and enter the 6-digit code for ${email}`}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error.message || "Invalid or expired code. Please try again."}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {useBackupCode ? "Backup Code" : "Authentication Code"}
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={useBackupCode ? "A1B2C3D4E5" : "000000"}
                  maxLength={useBackupCode ? 10 : 6}
                  className="w-full pl-9 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-deep-blue-violet-500 focus:border-transparent outline-none text-center font-mono tracking-widest text-lg"
                  autoComplete="one-time-code"
                  inputMode={useBackupCode ? "text" : "numeric"}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending || code.trim().length === 0}
              className="w-full bg-deep-blue-violet-600 text-white py-3 rounded-lg font-semibold hover:bg-deep-blue-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Verify & Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-4 text-center space-y-2">
            <button
              onClick={() => { setUseBackupCode((v) => !v); setCode(""); }}
              className="text-sm text-deep-blue-violet-600 hover:underline block w-full"
            >
              {useBackupCode ? "Use authenticator app instead" : "Use a backup code instead"}
            </button>
            <button
              onClick={() => router.push("/admin/login")}
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminVerify2FAPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    }>
      <AdminVerify2FAContent />
    </Suspense>
  );
}
