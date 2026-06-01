"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, Shield, Loader2 } from "lucide-react";
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
        <div className="w-full max-w-md flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
  <div className="bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8">

    {/* Header */}
    <div className="text-center mb-6">
      <h1 className="text-xl font-bold text-[#1e1b4b] dark:text-white mb-1.5">
        Welcome back
      </h1>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Access your dashboard to manage payments securely.
      </p>
    </div>

    {/* Form */}
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Error */}
      {loginErrorMessage && (
        <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg">
          {loginErrorMessage}
        </div>
      )}

      {/* Email */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="w-full pl-9 pr-3 py-2.5 text-sm bg-white dark:bg-[#020617] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent transition-all text-black dark:text-white placeholder:text-gray-400"
            required
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-[#4f46e5] hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full pl-9 pr-10 py-2.5 text-sm bg-white dark:bg-[#020617] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent transition-all text-black dark:text-white placeholder:text-gray-400"
            required
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#4f46e5] transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Turnstile */}
      {turnstileConfig?.enabled && turnstileConfig.siteKey && (
        <TurnstileWidget
          siteKey={turnstileConfig.siteKey}
          onTokenChange={setTurnstileToken}
        />
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending || Boolean(turnstileConfig?.enabled && !turnstileToken)}
        className="w-full py-2.5 bg-gradient-to-r from-[#7c3aed] to-[#dc2626] text-white rounded-lg font-semibold text-sm hover:opacity-90 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </button>
    </form>

    {/* Footer */}
    <p className="mt-5 text-center text-xs text-gray-500 dark:text-gray-400">
      Don&apos;t have an account?{" "}
      <Link href="/apply" className="font-semibold text-[#4f46e5] hover:underline">
        Apply now
      </Link>
    </p>
  </div>

  {/* Security */}
  <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
    <Shield className="w-3.5 h-3.5 text-[#4f46e5]" />
    <span>Secured with 256-bit encryption</span>
  </div>
</div>
    </AuthLayout>
  );
}
