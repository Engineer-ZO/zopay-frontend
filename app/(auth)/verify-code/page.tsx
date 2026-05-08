"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Shield, Loader2 } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";
import { useVerifyResetCode, useResendResetCode } from "@/features/auth/hooks";

export default function VerifyCodePage() {
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const [email, setEmail] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();

    const { mutate: verifyResetCode, isPending: isVerifying, error: verifyError } = useVerifyResetCode();
    const { mutate: resendResetCode, isPending: isResending, error: resendError } = useResendResetCode();

    useEffect(() => {
        // Try to get email from URL if passed from previous step
        const emailParam = searchParams.get("email");
        if (emailParam) {
            setEmail(emailParam);
        }
    }, [searchParams]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        verifyResetCode({
            email,
            code: code.join("")
        });
    };

    const handleResend = () => {
        if (email) {
            resendResetCode({ email });
        }
    };

    const handleChange = (index: number, value: string) => {
        if (value.length <= 1 && /^\d*$/.test(value)) {
            const newCode = [...code];
            newCode[index] = value;
            setCode(newCode);

            if (value && index < 5) {
                const nextInput = document.getElementById(`code-${index + 1}`);
                nextInput?.focus();
            }
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            const prevInput = document.getElementById(`code-${index - 1}`);
            prevInput?.focus();
        }
    };

    return (
        <AuthLayout>
            <div className="w-full max-w-md">
                <div className="bg-background rounded-2xl shadow-xl border border-border p-6 sm:p-8">
                    <div className="text-center mb-6">
                        <div className="w-14 h-14 bg-[#ef2d10]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Shield className="w-7 h-7 text-[#ef2d10]" />
                        </div>
                        <h1 className="text-xl font-bold text-foreground mb-1.5">Enter verification code</h1>
                        <p className="text-xs text-muted-foreground">
                            We sent a code to your email address. Please enter it below.
                        </p>
                    </div>

                    {/* Email Input (for confirmation) */}
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-xs font-medium text-foreground mb-1.5 text-center">
                            Confirm Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            className="w-full px-3 py-2 text-sm text-center bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef2d10] focus:border-transparent transition-all text-foreground"
                            required
                        />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Error Message */}
                        {(verifyError || resendError) && (
                            <div className="p-3 text-xs text-red-500 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900 rounded-lg text-center">
                                {verifyError?.message || resendError?.message || "Something went wrong."}
                            </div>
                        )}

                        <div className="flex gap-2 justify-center">
                            {code.map((digit, index) => (
                                <input
                                    key={index}
                                    id={`code-${index}`}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="w-11 h-12 text-center text-lg font-bold bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef2d10] focus:border-transparent transition-all text-foreground"
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={isVerifying || code.some(c => !c)}
                            className="w-full py-2.5 bg-[#ef2d10] text-white rounded-lg font-semibold text-sm hover:bg-[#d0260e] transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isVerifying ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                "Verify Code"
                            )}
                        </button>
                    </form>

                    <div className="mt-5 text-center">
                        <p className="text-xs text-muted-foreground mb-1.5">Didn't receive the code?</p>
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={isResending || !email}
                            className="text-xs font-medium text-[#2466eb] hover:underline flex items-center justify-center gap-1 mx-auto disabled:opacity-50"
                        >
                            {isResending ? (
                                <>
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Resending...
                                </>
                            ) : (
                                "Resend Code"
                            )}
                        </button>
                    </div>

                    <div className="mt-5 text-center">
                        <Link
                            href="/forgot-password"
                            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Back
                        </Link>
                    </div>
                </div>
            </div>
        </AuthLayout>
    );
}
