"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, Shield, Loader2, ArrowRight, Sparkles, Fingerprint } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";
import { TurnstileWidget } from "@/components/auth/TurnstileWidget";
import { useLogin, useTurnstileConfig } from "@/features/auth/hooks";
import { useAuthContext } from "@/features/auth/context/AuthContext";
import { getCurrentUser } from "@/features/auth/api/index";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthContext();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const { mutate: login, isPending, error } = useLogin();
  const { data: turnstileConfig } = useTurnstileConfig();

  const getStatusCode = (error: unknown): number | undefined => {
    if (typeof error !== "object" || error === null) return undefined;
    if ("response" in error) {
      return (error.response as { status?: number } | undefined)?.status;
    }
    if ("status" in error && typeof error.status === "number") {
      return error.status;
    }
    return undefined;
  };

  const isMustChangePasswordError = (error: unknown): boolean => {
    if (typeof error !== "object" || error === null || !("response" in error)) {
      return false;
    }
    const response = error.response as { data?: { error?: string } } | undefined;
    return response?.data?.error === "MUST_CHANGE_PASSWORD";
  };

  // Check if user is already authenticated and verify account still exists
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // If user has token, verify account still exists
        if (isAuthenticated && user) {
          if (user.mustChangePassword) {
            router.push("/change-password");
            return;
          }

          try {
            // Try to fetch current user - this will fail if account is deleted
            const me = await getCurrentUser();
            // Account exists, redirect to the right screen
            router.push(me.mustChangePassword ? "/change-password" : "/dashboard");
          } catch (error: unknown) {
            // If 401/403/404, account might be deleted or token invalid
            // The apiClient and AuthContext will handle clearing auth automatically
            // Just stay on login page
            const status = getStatusCode(error);
            if (isMustChangePasswordError(error)) {
              router.push("/change-password");
              return;
            }
            if (status === 401 || status === 403 || status === 404) {
              console.warn('Account verification failed (status:', status, '), staying on login page');
            }
          }
        } else {
          // No authentication, stay on login page
          setIsCheckingAuth(false);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [isAuthenticated, user, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (turnstileConfig?.enabled && !turnstileToken) {
      return;
    }

    login({
      email,
      password,
      turnstileToken: turnstileConfig?.enabled ? turnstileToken ?? undefined : undefined,
    });
  };

  const loginErrorMessage = (() => {
    if (!error) return null;
    const status = getStatusCode(error);
    const responseData = typeof error === "object" && error !== null && "response" in error
      ? (error.response as { data?: { message?: string } } | undefined)?.data
      : undefined;
    const message = responseData?.message || error.message;

    if (status === 400 && message?.includes("Turnstile verification is required")) {
      return "Please complete the security verification before signing in.";
    }
    if (status === 403 && message?.includes("Turnstile verification failed")) {
      return "Verification failed. Please try again.";
    }
    if (status === 502 && message?.includes("Failed to verify Turnstile token")) {
      return "Security verification is temporarily unavailable. Please retry.";
    }

    return message || "Something went wrong. Please try again.";
  })();

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <AuthLayout>
        <div className="w-full max-w-md flex items-center justify-center py-20">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-red-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <div className="relative">
          {/* Decorative gradient orb */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-purple-400 to-red-400 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-tr from-blue-400 to-purple-400 rounded-full blur-3xl opacity-20"></div>
          
          {/* Main Card */}
          <div className="relative bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-white/10 p-6 sm:p-8">
            
            {/* Header */}
            <div className="text-center mb-7">
              <div className="inline-flex items-center justify-center w-12 h-12 mb-4 bg-gradient-to-br from-purple-500 to-red-500 rounded-xl shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-red-600 dark:from-purple-400 dark:to-red-400 bg-clip-text text-transparent mb-2">
                Welcome back
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Access your dashboard to manage payments securely.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Error */}
              {loginErrorMessage && (
                <div className="p-3 text-sm text-red-600 bg-red-50/80 dark:bg-red-500/10 backdrop-blur-sm border border-red-200 dark:border-red-500/30 rounded-xl flex items-start gap-2">
                  <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{loginErrorMessage}</span>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-red-500 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm"></div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-9 pr-3 py-2.5 text-sm bg-white dark:bg-[#020617] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-red-500 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm"></div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2.5 text-sm bg-white dark:bg-[#020617] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-500 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Turnstile */}
              {turnstileConfig?.enabled && turnstileConfig.siteKey && (
                <div className="flex justify-center">
                  <TurnstileWidget
                    siteKey={turnstileConfig.siteKey}
                    onTokenChange={setTurnstileToken}
                  />
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isPending || Boolean(turnstileConfig?.enabled && !turnstileToken)}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-red-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed group"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              Don&apos;t have an account?{" "}
              <Link href="/apply" className="font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors">
                Apply now
              </Link>
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/50 dark:bg-white/5 backdrop-blur-sm rounded-full border border-gray-200 dark:border-white/10">
            <Fingerprint className="w-3.5 h-3.5 text-purple-500" />
            <span>256-bit encryption</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/50 dark:bg-white/5 backdrop-blur-sm rounded-full border border-gray-200 dark:border-white/10">
            <Shield className="w-3.5 h-3.5 text-green-500" />
            <span>PCI compliant</span>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
