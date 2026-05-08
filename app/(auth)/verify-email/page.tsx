"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";

export default function VerifyEmailPage() {
  const router = useRouter();

  const handleResend = () => {
    // In production, this would resend the email
    // For demo, simulate email verification after 2 seconds
    setTimeout(() => {
      router.push("/email-verified");
    }, 2000);
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <div className="bg-background rounded-2xl shadow-xl border border-border p-6 sm:p-8 text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-[#ef2d10]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-[#ef2d10]" />
          </div>

          {/* Header */}
          <h1 className="text-xl font-bold text-foreground mb-3">Check your email</h1>
          <p className="text-sm text-muted-foreground mb-8">
            We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
          </p>

          {/* Resend Button */}
          <button
            type="button"
            onClick={handleResend}
            className="w-full py-2.5 bg-[#ef2d10] text-white rounded-lg font-semibold text-sm hover:bg-[#d0260e] transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] mb-4"
          >
            Resend Verification Email
          </button>

          {/* Back to Login */}
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Login
          </Link>
        </div>

        {/* Help Text */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Didn't receive the email? Check your spam folder or contact support.
        </p>
      </div>
    </AuthLayout>
  );
}
