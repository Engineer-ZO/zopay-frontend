"use client";

import { X, FileText, Globe as GlobeIcon, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuthContext } from "@/features/auth/context/AuthContext";
import { useEnvironment } from "@/core/environment/EnvironmentContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function DashboardNavbar() {
    const { user } = useAuthContext();
    const { environment, hasProductionAccess, requestEnvironmentSwitch, isSwitching } = useEnvironment();
    const router = useRouter();
    const [showProductionModal, setShowProductionModal] = useState(false);

    const isSandboxMode = environment === 'sandbox';

    // Handle toggle click - triggers confirmation flow
    const handleToggleClick = () => {
        const targetEnvironment = isSandboxMode ? 'production' : 'sandbox';
        
        // If switching to production without access, show info modal
        if (targetEnvironment === 'production' && !hasProductionAccess) {
            setShowProductionModal(true);
            return;
        }

        // Request environment switch (will show confirmation modal)
        try {
            requestEnvironmentSwitch(targetEnvironment);
        } catch (error: unknown) {
            // If error, show production access modal
            if (error instanceof Error && error.message.includes('Production access is not available')) {
                setShowProductionModal(true);
            }
        }
    };

    // Get user initials
    const getInitials = (email: string) => {
        if (!email) return "U";
        const parts = email.trim().split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return email.substring(0, 2).toUpperCase();
    };

    return (
        <header className="h-16 bg-background border-b border-border flex items-center justify-between px-6 pl-16 lg:pl-6">
            {/* Left: Greeting */}
            <div>
                <h2 className="text-base font-semibold text-foreground">
                    Hi, {user?.email?.split('@')[0] || 'User'}
                </h2>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4">
                {/* Language Selector - Hidden on mobile */}
                <div className="hidden md:block">
                    <LanguageSwitcher showLabel />
                </div>

                {/* Sandbox/Live Mode Toggle - Hidden on mobile */}
                <div className={`hidden md:flex items-center gap-3 px-3 py-1.5 rounded-full transition-colors ${
                    isSandboxMode 
                        ? 'bg-crimson-red-50 dark:bg-crimson-red-950/30 border border-crimson-red-200 dark:border-crimson-red-800' 
                        : 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800'
                }`}>
                    <span className={`text-xs font-semibold uppercase ${
                        isSandboxMode 
                            ? 'text-crimson-red-600 dark:text-crimson-red-400' 
                            : 'text-green-600 dark:text-green-400'
                    }`}>
                        {isSandboxMode ? 'Sandbox Mode' : 'Live Mode'}
                    </span>
                    <button
                        onClick={handleToggleClick}
                        disabled={isSwitching}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                            isSandboxMode ? 'bg-gray-300 dark:bg-gray-600' : 'bg-green-400'
                        } ${isSwitching ? 'opacity-50 cursor-not-allowed' : ''}`}
                        aria-label="Toggle environment"
                    >
                        <span
                            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                                isSandboxMode ? 'translate-x-0' : 'translate-x-5'
                            }`}
                        />
                    </button>
                </div>

                {/* Theme Toggle - Hidden on mobile */}
                <div className="hidden md:block">
                    <ThemeToggle />
                </div>

                {/* User Avatar - Always visible */}
                <div className="relative group">
                    <button
                        onClick={() => router.push("/dashboard/profile")}
                        className="w-9 h-9 rounded-full bg-crimson-red-500 flex items-center justify-center text-white font-semibold text-sm hover:bg-crimson-red-600 transition-colors cursor-pointer"
                        aria-label="Profile"
                    >
                        {user?.email ? getInitials(user.email) : 'U'}
                    </button>
                    {/* Tooltip */}
                    <div className="absolute right-0 top-full mt-2 px-2 py-1 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 shadow-lg">
                        Profile
                        <div className="absolute -top-1 right-3 w-2 h-2 bg-gray-900 dark:bg-gray-800 rotate-45"></div>
                    </div>
                </div>

            </div>

            {/* Production Mode Modal */}
            {showProductionModal && (
                <div 
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    onClick={() => setShowProductionModal(false)}
                >
                    <div 
                        className="bg-background rounded-2xl p-6 shadow-2xl border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-crimson-red-500/10 flex items-center justify-center">
                                    <AlertCircle className="w-6 h-6 text-crimson-red-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-foreground">Switch to Production Mode</h3>
                                    <p className="text-sm text-muted-foreground">Steps to get approved for live transactions</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowProductionModal(false)}
                                className="p-1 hover:bg-muted rounded transition-colors"
                                aria-label="Close modal"
                            >
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="space-y-6">
                            {/* Introduction */}
                            <div className="bg-crimson-red-50 dark:bg-crimson-red-950/20 border border-crimson-red-200 dark:border-crimson-red-800 rounded-lg p-4">
                                <p className="text-sm text-foreground">
                                    To switch to <strong>Production Mode</strong> and process live transactions, you need to complete the following steps. 
                                    Our team will review your application and approve access once all requirements are met.
                                </p>
                            </div>

                            {/* Steps Section */}
                            <div>
                                <h4 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-crimson-red-500" />
                                    Steps to Get Approved
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-crimson-red-500 text-white flex items-center justify-center text-sm font-semibold">
                                            1
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-foreground mb-1">Submit Your Documents</p>
                                            <p className="text-xs text-muted-foreground">
                                                Complete your KYB (Know Your Business) verification by submitting required business documents through{" "}
                                                <strong>Help &amp; Support</strong> or as directed by our team. This includes business registration,
                                                identification, and any other documents specific to your business type.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-crimson-red-500 text-white flex items-center justify-center text-sm font-semibold">
                                            2
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-foreground mb-1">Set Up Your Domain</p>
                                            <p className="text-xs text-muted-foreground">
                                                Verify and configure your business domain. This helps establish your business identity and 
                                                improves the security of your payment integration.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-crimson-red-500 text-white flex items-center justify-center text-sm font-semibold">
                                            3
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-foreground mb-1">Configure Webhooks</p>
                                            <p className="text-xs text-muted-foreground">
                                                Set up webhook endpoints to receive real-time notifications about transaction status updates. 
                                                This ensures your system stays synchronized with payment events.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Important Advice Section */}
                            <div className="border-t border-border pt-6">
                                <h4 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-crimson-red-500" />
                                    Important Tips for Faster Approval
                                </h4>
                                <div className="space-y-4">
                                    <div className="flex gap-3 p-4 bg-deep-blue-violet-50 dark:bg-deep-blue-violet-950/20 border border-deep-blue-violet-200 dark:border-deep-blue-violet-800 rounded-lg">
                                        <FileText className="w-5 h-5 text-deep-blue-violet-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-foreground mb-1">Document Submission</p>
                                            <p className="text-xs text-muted-foreground">
                                                Ensure all documents are clear, valid, and up-to-date. Incomplete or unclear documentation 
                                                may delay the approval process. Double-check that all required fields are filled correctly.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                                        <GlobeIcon className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-foreground mb-1">Domain & Webhooks Setup</p>
                                            <p className="text-xs text-muted-foreground">
                                                <strong>Setting up your domain and webhooks significantly increases your chances of approval.</strong> 
                                                Merchants who have completed these steps are prioritized during the review process. 
                                                This demonstrates your technical readiness and commitment to proper integration.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4 border-t border-border">
                                <button
                                    onClick={() => setShowProductionModal(false)}
                                    className="flex-1 px-4 py-2.5 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors text-sm font-medium"
                                >
                                    Got It
                                </button>
                                <button
                                    onClick={() => {
                                        setShowProductionModal(false);
                                        router.push("/dashboard/support");
                                    }}
                                    className="flex-1 px-4 py-2.5 bg-crimson-red-500 hover:bg-crimson-red-600 text-white rounded-lg transition-colors text-sm font-medium"
                                >
                                    Contact support
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
