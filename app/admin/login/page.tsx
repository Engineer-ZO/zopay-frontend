"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Shield, Loader2, Mail, CheckCircle2, ArrowLeft, Lock, LogIn } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { verifyEmail } from "@/features/auth/api/index";
import Image from "next/image";
import Link from "next/link";
import { TurnstileWidget } from "@/components/auth/TurnstileWidget";
import { useAdminLogin, useResendVerification, useTurnstileConfig } from "@/features/auth/hooks";
import { getAuthData } from "@/features/auth/utils/storage";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");

  const { mutate: adminLogin, isPending, error } = useAdminLogin();
  const resendVerificationMutation = useResendVerification();
  const { data: turnstileConfig } = useTurnstileConfig();

  // Redirect if already authenticated as admin
  useEffect(() => {
    const authData = getAuthData();
    if (authData && authData.accessToken && authData.user && authData.user.role === 'admin') {
      router.push('/admin/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (turnstileConfig?.enabled && !turnstileToken) {
      return;
    }

    adminLogin({
      email,
      password,
      turnstileToken: turnstileConfig?.enabled ? turnstileToken ?? undefined : undefined,
    });
  };

  const verifyMutation = useMutation({
    mutationFn: (code: string) => verifyEmail({ email: email.trim(), code }),
    onSuccess: () => {
      toast.success("Email verified successfully. Logging in...");
      // Re-trigger login with same credentials to get the token, handle 2FA etc.
      adminLogin({
        email: email.trim(),
        password,
        turnstileToken: turnstileConfig?.enabled ? turnstileToken ?? undefined : undefined,
      });
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || "Verification failed");
    }
  });

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }
    verifyMutation.mutate(verificationCode);
  };

  const errorStatus =
    typeof error === "object" && error !== null && "response" in error
      ? (error.response as { status?: number } | undefined)?.status
      : undefined;
  const errorData =
    typeof error === "object" && error !== null && "response" in error
      ? (error.response as { data?: { message?: string; emailVerified?: boolean } } | undefined)?.data
      : undefined;
  const isVerificationRequired = errorStatus === 403 && errorData?.emailVerified === false;

  const loginErrorMessage = (() => {
    const message = errorData?.message || error?.message;

    if (errorStatus === 400 && message?.includes("Turnstile verification is required")) {
      return "Please complete the security verification before signing in.";
    }
    if (errorStatus === 403 && message?.includes("Turnstile verification failed")) {
      return "Verification failed. Please try again.";
    }
    if (errorStatus === 502 && message?.includes("Failed to verify Turnstile token")) {
      return "Security verification is temporarily unavailable. Please retry.";
    }
    if (isVerificationRequired) {
      return "Please verify your email before logging in.";
    }

    return message || "Invalid credentials. Please try again.";
  })();

  const handleResendVerification = () => {
    if (!email.trim()) {
      toast.error("Enter the admin email address first.");
      return;
    }

    resendVerificationMutation.mutate(
      { email: email.trim() },
      {
        onSuccess: (result) => {
          toast.success(result.message || "Verification code sent.");
        },
        onError: (mutationError: Error) => {
          toast.error(mutationError.message || "Failed to resend verification code.");
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Animated background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-5">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur-xl opacity-30"></div>
              <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-4 inline-flex items-center gap-3 border border-white/20">
                <Image
                  src="/zopaylogo.png"
                  alt="ZoPay"
                  width={140}
                  height={45}
                  className="object-contain brightness-0 invert"
                />
                <div className="px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full text-xs font-bold shadow-lg">
                  ADMIN
                </div>
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome Back</h1>
          <p className="text-purple-200 text-sm">
            Access the admin dashboard securely
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
          {isVerificationRequired ? (
            <>
              <div className="mb-6 relative">
                <button
                  type="button"
                  onClick={() => {
                     if (error) {
                       window.location.reload();
                     }
                  }}
                  className="absolute left-0 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Verify Your Email</h2>
                </div>
              </div>
              
              <p className="text-sm text-purple-200 mb-6 text-center">
                Please enter the 6-digit verification code sent to <span className="font-medium text-white">{email}</span>
              </p>
              
              <form onSubmit={handleVerifySubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-white mb-2 text-center">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-center tracking-widest text-xl font-mono text-white placeholder-white/50"
                    required
                    disabled={verifyMutation.isPending || isPending}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={verifyMutation.isPending || isPending || verificationCode.length !== 6}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                >
                  {verifyMutation.isPending || isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Verify & Sign In
                    </>
                  )}
                </button>
                
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resendVerificationMutation.isPending || verifyMutation.isPending || isPending}
                    className="text-sm text-purple-300 hover:text-white disabled:opacity-50 font-medium inline-flex items-center gap-1.5 transition-colors"
                  >
                    {resendVerificationMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                    Resend Code
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Admin Access</h2>
              </div>

              {error && (
                <div className="mb-5 p-3 bg-red-500/10 backdrop-blur-sm border border-red-500/30 rounded-xl text-sm text-red-200">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    {loginErrorMessage}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@zitopay.com"
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-white placeholder-white/50"
                      required
                      disabled={isPending}
                    />
                  </div>
                </div>

                {turnstileConfig?.enabled && turnstileConfig.siteKey && (
                  <div className="flex justify-center">
                    <TurnstileWidget
                      siteKey={turnstileConfig.siteKey}
                      onTokenChange={setTurnstileToken}
                    />
                  </div>
                )}

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-white placeholder-white/50"
                      required
                      disabled={isPending}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                      disabled={isPending}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-white/30 bg-white/10 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
                      disabled={isPending}
                    />
                    <span className="text-sm text-purple-200">Remember me</span>
                  </label>
                  <Link
                    href="/admin/forgot-password"
                    className="text-sm text-purple-300 hover:text-white font-medium transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isPending || Boolean(turnstileConfig?.enabled && !turnstileToken)}
                  className="w-full bg-gradient-to-r from-purple-500 to-red-500 text-white py-3 rounded-xl font-semibold hover:from-red-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      Sign In
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* Security Notice */}
          <div className="mt-6 p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
            <p className="text-xs text-purple-200 text-center">
              🔒 Secure admin area. All actions are logged and monitored.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-3">
          <p className="text-sm text-purple-200">
            Not an admin?{" "}
            <Link href="/login" className="text-white font-semibold hover:underline">
              Merchant Login →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}