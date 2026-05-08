"use client";

import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";

export default function EmailVerifiedPage() {
    return (
        <AuthLayout>
            <div className="w-full max-w-md">
                <div className="bg-background rounded-2xl shadow-xl border border-border p-6 sm:p-8 text-center">
                    <div className="w-14 h-14 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-7 h-7 text-green-500" />
                    </div>

                    <h1 className="text-xl font-bold text-foreground mb-2">Email verified successfully!</h1>
                    <p className="text-xs text-muted-foreground mb-6">
                        Your email has been verified. Now let&apos;s set up your merchant credentials to start accepting payments.
                    </p>

                    <Link
                        href="/onboarding/merchant-setup"
                        className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-[#ef2d10] text-white rounded-lg font-semibold text-sm hover:bg-[#dc2626] transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                    >
                        Set Up Business Account
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
}
