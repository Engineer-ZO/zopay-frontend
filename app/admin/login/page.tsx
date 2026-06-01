"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Shield, Loader2, Mail, CheckCircle2, ArrowLeft } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <Image
              src="/zopaylogo.png"
              alt="ZoPay"
              width={150}
              height={50}
              className="object-contain"
            />
            <div className="px-2 py-1 bg-deep-blue-violet-500 text-white rounded text-xs font-bold">
              ADMIN
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-deep-blue-violet-200 text-sm">
            Sign in to access the admin dashboard
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
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
                  className="absolute left-0 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-deep-blue-violet-600" />
                  <h2 className="text-xl font-bold text-gray-900">Verify Email</h2>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-6 text-center">
                Please enter the 6-digit verification code sent to <span className="font-medium text-gray-900">{email}</span>.
              </p>
              
              <form onSubmit={handleVerifySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-deep-blue-violet-500 focus:border-transparent outline-none transition-all text-center tracking-widest text-xl font-mono"
                    required
                    disabled={verifyMutation.isPending || isPending}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={verifyMutation.isPending || isPending || verificationCode.length !== 6}
                  className="w-full bg-deep-blue-violet-600 text-white py-3 rounded-lg font-semibold hover:bg-deep-blue-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                    className="text-sm text-deep-blue-violet-600 hover:text-deep-blue-violet-800 disabled:opacity-50 font-medium inline-flex items-center gap-1.5"
                  >
                    {resendVerificationMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                    Resend Code
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center gap-2 mb-6">
                <Shield className="w-6 h-6 text-deep-blue-violet-600" />
                <h2 className="text-xl font-bold text-gray-900">Admin Login</h2>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  <div>{loginErrorMessage}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@zitopay.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-deep-blue-violet-500 focus:border-transparent outline-none transition-all"
                    required
                    disabled={isPending}
                  />
                </div>

                {turnstileConfig?.enabled && turnstileConfig.siteKey && (
                  <TurnstileWidget
                    siteKey={turnstileConfig.siteKey}
                    onTokenChange={setTurnstileToken}
                  />
                )}

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-deep-blue-violet-500 focus:border-transparent outline-none transition-all pr-12"
                      required
                      disabled={isPending}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
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
                      className="w-4 h-4 text-deep-blue-violet-600 border-gray-300 rounded focus:ring-deep-blue-violet-500"
                      disabled={isPending}
                    />
                    <span className="text-sm text-gray-600">Remember me</span>
                  </label>
                  <Link
                    href="/admin/forgot-password"
                    className="text-sm text-deep-blue-violet-600 hover:text-deep-blue-violet-700 font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isPending || Boolean(turnstileConfig?.enabled && !turnstileToken)}
                  className="w-full bg-deep-blue-violet-600 text-white py-3 rounded-lg font-semibold hover:bg-deep-blue-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      Sign In
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* Security Notice */}
          <div className="mt-6 p-3 bg-deep-blue-violet-50 border border-deep-blue-violet-200 rounded-lg">
            <p className="text-xs text-deep-blue-violet-800 text-center">
              🔒 This is a secure admin area. All actions are logged and monitored.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-deep-blue-violet-200">
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
