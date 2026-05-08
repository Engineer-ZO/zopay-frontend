"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";

export default function PasswordResetSuccessPage() {
    return (
        <AuthLayout>
            <div className="w-full max-w-md">
                <div className="bg-background rounded-2xl shadow-xl border border-border p-6 sm:p-8 text-center">
                    <div className="w-14 h-14 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-7 h-7 text-green-500" />
                    </div>

                    <h1 className="text-xl font-bold text-foreground mb-2">Password reset successful!</h1>
                    <p className="text-xs text-muted-foreground mb-6">
                        Your password has been successfully reset. You can now log in with your new password.
                    </p>

                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center w-full py-2.5 bg-[#ef2d10] text-white rounded-lg font-semibold text-sm hover:bg-[#d0260e] transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                    >
                        Continue to Login
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
}
