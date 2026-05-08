"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Lock, ArrowLeft, Loader2 } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";
import { useResetPassword } from "@/features/auth/hooks";

export default function ResetPasswordPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [validationError, setValidationError] = useState("");

    const router = useRouter();
    const searchParams = useSearchParams();
    const { mutate: resetPassword, isPending, error } = useResetPassword();

    useEffect(() => {
        const emailParam = searchParams.get("email");
        const codeParam = searchParams.get("code");

        if (emailParam) setEmail(emailParam);
        if (codeParam) setCode(codeParam);
    }, [searchParams]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError("");

        if (!email || !code) {
            setValidationError("Missing verification information. Please try again from the beginning.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setValidationError("Passwords do not match");
            return;
        }

        if (newPassword.length < 8) {
            setValidationError("Password must be at least 8 characters");
            return;
        }

        resetPassword({
            email,
            code,
            newPassword
        });
    };

    return (
        <AuthLayout>
            <div className="w-full max-w-md">
                <div className="bg-background rounded-2xl shadow-xl border border-border p-6 sm:p-8">
                    <div className="text-center mb-6">
                        <div className="w-14 h-14 bg-[#ef2d10]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Lock className="w-7 h-7 text-[#ef2d10]" />
                        </div>
                        <h1 className="text-xl font-bold text-foreground mb-1.5">Set new password</h1>
                        <p className="text-xs text-muted-foreground">
                            Your new password must be different from previously used passwords.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Error Message */}
                        {(error || validationError) && (
                            <div className="p-3 text-xs text-red-500 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900 rounded-lg">
                                {validationError || error?.message || "Something went wrong. Please try again."}
                            </div>
                        )}

                        <div>
                            <label htmlFor="password" className="block text-xs font-medium text-foreground mb-1.5">
                                New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Create a password"
                                    className="w-full pl-9 pr-10 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef2d10] focus:border-transparent transition-all text-foreground placeholder:text-muted-foreground"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">Must be at least 8 characters</p>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-xs font-medium text-foreground mb-1.5">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter your password"
                                    className="w-full pl-9 pr-10 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef2d10] focus:border-transparent transition-all text-foreground placeholder:text-muted-foreground"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full py-2.5 bg-[#ef2d10] text-white rounded-lg font-semibold text-sm hover:bg-[#d0260e] transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Resetting Password...
                                </>
                            ) : (
                                "Reset Password"
                            )}
                        </button>
                    </form>

                    <div className="mt-5 text-center">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </AuthLayout>
    );
}
