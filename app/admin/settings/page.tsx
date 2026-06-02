"use client";

import { useState, useEffect } from "react";
import {
    Settings,
    Server,
    Shield,
    Save,
    RotateCcw,
    Mail,
    AlertTriangle,
    Lock,
    CheckCircle2,
    User,
    Copy,
    ExternalLink,
    XCircle,
    Bell,
    Globe,
    Key,
    Fingerprint,
    Database,
    RefreshCw,
    ChevronRight,
    Building2,
    CreditCard,
    Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrentAdmin, useUpdateAdminProfile } from "@/features/auth/hooks/useAuth";
import {
    usePlatformSettings,
    useNotificationSettings,
    useUpdateNotificationSettings,
    useUpdateMerchantRegistrationSettings,
    useUpdatePlatformWithdrawals,
    useGlobalGateways,
    useUpdateGlobalGateway
} from "@/features/admin/queries";
import { toast } from "sonner";
import { NotificationSettings, UpdateGlobalGatewayRequest } from "@/features/admin/types";

export default function PlatformSettingsPage() {
    const [activeTab, setActiveTab] = useState("profile");
    const [isSaving, setIsSaving] = useState(false);

    // Admin profile state
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Merchant registration settings state
    const [allowSelfRegistration, setAllowSelfRegistration] = useState(true);
    const [applicationFormUrl, setApplicationFormUrl] = useState("");
    const [withdrawalsGloballyEnabled, setWithdrawalsGloballyEnabled] = useState(true);
    const [showDisableWithdrawalsConfirm, setShowDisableWithdrawalsConfirm] = useState(false);
    const [notificationSettingsState, setNotificationSettingsState] = useState<NotificationSettings>({
        verificationEmail: true,
        passwordResetEmail: true,
        welcomeEmail: true,
        merchantAccountCreatedEmail: true,
        accountStatusChangeEmail: true,
        transactionAlertEmail: true,
        transactionSuccessAlertEmail: true,
        transactionFailureAlertEmail: true,
        suspiciousLoginAlertEmail: true,
        payoutApprovalEmail: true,
        supportTicketMerchantEmail: true,
        supportTicketAdminEmail: true,
        bankTopupAdminEmail: true,
    });

    // Hooks
    const { data: adminData, isLoading: adminLoading } = useCurrentAdmin();
    const updateProfileMutation = useUpdateAdminProfile();
    const { data: platformSettingsData, isLoading: platformSettingsLoading } = usePlatformSettings();
    const { data: notificationSettingsData, isLoading: notificationSettingsLoading } = useNotificationSettings();
    const updateNotificationSettingsMutation = useUpdateNotificationSettings();
    const updateMerchantRegistrationMutation = useUpdateMerchantRegistrationSettings();
    const updatePlatformWithdrawalsMutation = useUpdatePlatformWithdrawals();

    // Gateway Hooks
    const { data: globalGatewaysResponse, isLoading: gatewaysLoading } = useGlobalGateways();
    const updateGatewayMutation = useUpdateGlobalGateway();

    // Load admin data into form
    useEffect(() => {
        if (adminData?.admin) {
            setEmail(adminData.admin.email);
        }
    }, [adminData]);

    useEffect(() => {
        if (!platformSettingsData?.settings) {
            return;
        }

        const allowSetting = platformSettingsData.settings.find((s) => s.key === "allow_merchant_self_registration");
        const formUrlSetting = platformSettingsData.settings.find((s) => s.key === "merchant_application_form_url");

        if (allowSetting?.value != null) {
            setAllowSelfRegistration(allowSetting.value === "true");
        }
        if (formUrlSetting?.value != null) {
            setApplicationFormUrl(formUrlSetting.value);
        }
        if (typeof platformSettingsData.withdrawalsGloballyEnabled === "boolean") {
            setWithdrawalsGloballyEnabled(platformSettingsData.withdrawalsGloballyEnabled);
        }
    }, [platformSettingsData]);

    useEffect(() => {
        if (notificationSettingsData?.notificationSettings) {
            setNotificationSettingsState(notificationSettingsData.notificationSettings);
        }
    }, [notificationSettingsData]);


    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 1500);
    };

    const handleMerchantRegistrationSave = async () => {
        try {
            const result = await updateMerchantRegistrationMutation.mutateAsync({
                allowSelfRegistration,
                applicationFormUrl: applicationFormUrl || "",
            });
            toast.success(result.message || "Settings updated successfully");
        } catch (err: unknown) {
            const error = err as { message?: string; response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || error.message || "Failed to update settings");
        }
    };

    const handleProfileUpdate = async () => {
        if (!email.trim()) {
            toast.error("Email is required");
            return;
        }

        if (newPassword && newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            const result = await updateProfileMutation.mutateAsync({ 
                email: email.trim(),
                ...(newPassword && { password: newPassword })
            });
            toast.success(result.message || "Profile updated successfully");

            if (result.message?.includes("verify")) {
                toast.info("Please verify your new email address");
            }
            
            // Clear password fields after successful update
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || "Failed to update profile");
        }
    };

    const handleGatewayUpdate = async (code: string, updates: UpdateGlobalGatewayRequest) => {
        try {
            await updateGatewayMutation.mutateAsync({ code, data: updates });
            toast.success("Gateway settings updated");
        } catch (err) {
            toast.error("Failed to update gateway settings");
            console.error(err);
        }
    };

    const handlePlatformWithdrawalsUpdate = async (enabled: boolean) => {
        try {
            const result = await updatePlatformWithdrawalsMutation.mutateAsync({ enabled });
            setWithdrawalsGloballyEnabled(result.withdrawalsGloballyEnabled);
            toast.success(
                result.withdrawalsGloballyEnabled
                    ? "Platform withdrawals enabled"
                    : "Platform withdrawals disabled"
            );
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } }; message?: string };
            toast.error(error.response?.data?.message || error.message || "Failed to update platform withdrawals");
        } finally {
            setShowDisableWithdrawalsConfirm(false);
        }
    };

    const handleNotificationToggle = async (key: keyof NotificationSettings) => {
        const nextValue = !notificationSettingsState[key];

        try {
            const result = await updateNotificationSettingsMutation.mutateAsync({ [key]: nextValue });
            setNotificationSettingsState(result.notificationSettings);
            toast.success("Notification settings updated");
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } }; message?: string };
            toast.error(error.response?.data?.message || error.message || "Failed to update notification settings");
        }
    };

    const notificationItems: Array<{
        key: keyof NotificationSettings;
        title: string;
        description: string;
    }> = [
        {
            key: "verificationEmail",
            title: "Verification Emails",
            description: "Send email verification code emails to users.",
        },
        {
            key: "passwordResetEmail",
            title: "Password Reset Emails",
            description: "Send password reset code emails when users request a reset.",
        },
        {
            key: "welcomeEmail",
            title: "Welcome Emails",
            description: "Send a welcome email after successful email verification.",
        },
        {
            key: "merchantAccountCreatedEmail",
            title: "Merchant Account Created Emails",
            description: "Send credential emails when an admin creates a merchant account.",
        },
        {
            key: "accountStatusChangeEmail",
            title: "Account Status Change Emails",
            description: "Notify merchants when their account status changes.",
        },
        {
            key: "suspiciousLoginAlertEmail",
            title: "Suspicious Login Alerts",
            description: "Notify users about new or suspicious login activity.",
        },
        {
            key: "payoutApprovalEmail",
            title: "Payout Approval Emails",
            description: "Send emails related to bulk payout approval workflow events.",
        },
        {
            key: "supportTicketMerchantEmail",
            title: "Merchant Support Notifications",
            description: "Send emails to merchants when admins reply to tickets or update ticket status.",
        },
        {
            key: "supportTicketAdminEmail",
            title: "Admin Support Notifications",
            description: "Send emails to admins when merchants create tickets, reply, or trigger status changes.",
        },
        {
            key: "bankTopupAdminEmail",
            title: "Bank Top-Up Admin Emails",
            description: "Send emails to admins for manual bank top-up activity that requires review.",
        },
    ];

    const transactionNotificationItems: Array<{
        key: keyof NotificationSettings;
        title: string;
        description: string;
        disabled?: boolean;
    }> = [
        {
            key: "transactionAlertEmail",
            title: "Transaction Emails",
            description: "Master switch for all transaction email alerts.",
        },
        {
            key: "transactionSuccessAlertEmail",
            title: "Success Transaction Emails",
            description: "Controls emails for successful transactions. Only applies when transaction emails are enabled.",
            disabled: !notificationSettingsState.transactionAlertEmail,
        },
        {
            key: "transactionFailureAlertEmail",
            title: "Failed Transaction Emails",
            description: "Controls emails for failed transactions. Only applies when transaction emails are enabled.",
            disabled: !notificationSettingsState.transactionAlertEmail,
        },
    ];

    const tabs = [
        { id: "profile", label: "Profile", icon: User, color: "blue" },
        { id: "registration", label: "Registration", icon: Building2, color: "emerald" },
        { id: "notifications", label: "Notifications", icon: Bell, color: "purple" },
        { id: "withdrawals", label: "Withdrawals", icon: Lock, color: "orange" },
        { id: "gateways", label: "Gateways", icon: CreditCard, color: "cyan" },
        { id: "security", label: "Security", icon: Shield, color: "red" },
    ];

    const getTabColor = (color: string) => {
        const colors: Record<string, string> = {
            blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-100",
            emerald: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100",
            purple: "bg-purple-50 text-purple-600 group-hover:bg-purple-100",
            orange: "bg-orange-50 text-orange-600 group-hover:bg-orange-100",
            cyan: "bg-cyan-50 text-cyan-600 group-hover:bg-cyan-100",
            red: "bg-red-50 text-red-600 group-hover:bg-red-100",
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                                <Settings className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
                                <p className="text-sm text-gray-500">Configure global behavior, gateways, and system-wide parameters</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                            <RotateCcw className="w-4 h-4" />
                            Reset Defaults
                        </button>
                        {activeTab === "profile" ? (
                            <button
                                onClick={handleProfileUpdate}
                                disabled={updateProfileMutation.isPending || !email.trim()}
                                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-blue-500/25 disabled:opacity-70"
                            >
                                {updateProfileMutation.isPending ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Update Profile
                                    </>
                                )}
                            </button>
                        ) : activeTab === "registration" ? (
                            <button
                                onClick={handleMerchantRegistrationSave}
                                disabled={updateMerchantRegistrationMutation.isPending || platformSettingsLoading}
                                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-blue-500/25 disabled:opacity-70"
                            >
                                {updateMerchantRegistrationMutation.isPending ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        ) : activeTab === "notifications" || activeTab === "withdrawals" ? (
                            <div />
                        ) : (
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-blue-500/25 disabled:opacity-70"
                            >
                                {isSaving ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="bg-white rounded-2xl border border-gray-100 p-1.5 flex gap-1 overflow-x-auto shadow-sm">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                                    isActive
                                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                                        : "text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Content Area */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                    >
                        {activeTab === "profile" && (
                            <>
                                {/* Profile Settings */}
                                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                            <User className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                                            <p className="text-sm text-gray-500">Update your admin account details</p>
                                        </div>
                                    </div>
                                    {adminLoading ? (
                                        <div className="space-y-5">
                                            {[1, 2].map((i) => (
                                                <div key={i} className="animate-pulse">
                                                    <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
                                                    <div className="h-10 bg-gray-200 rounded-xl"></div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Email Address <span className="text-red-500">*</span></label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <input
                                                        type="email"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        placeholder="admin@zitopay.com"
                                                        required
                                                        className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all"
                                                    />
                                                </div>
                                                {adminData?.admin && !adminData.admin.emailVerified && (
                                                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                                        <AlertTriangle className="w-3 h-3" />
                                                        Email not verified. Please verify your email address.
                                                    </p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Role</label>
                                                <div className="relative">
                                                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        value={adminData?.admin?.role === "admin" ? "Super Admin" : adminData?.admin?.role || "Admin"}
                                                        disabled
                                                        className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-500 cursor-not-allowed"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Account Settings */}
                                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                            <Lock className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">Account Security</h3>
                                            <p className="text-sm text-gray-500">Change your password and security settings</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">New Password</label>
                                            <div className="relative">
                                                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    placeholder="Enter new password"
                                                    className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-400">Leave blank to keep current password</p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                                            <div className="relative">
                                                <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    placeholder="Confirm new password"
                                                    className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === "registration" && (
                            <div className="space-y-6">
                                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                                            <Building2 className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">Merchant Registration</h3>
                                            <p className="text-sm text-gray-500">Control how merchants can register on the platform</p>
                                        </div>
                                    </div>

                                    {platformSettingsLoading ? (
                                        <div className="space-y-4">
                                            {[1, 2].map((i) => (
                                                <div key={i} className="animate-pulse">
                                                    <div className="h-20 bg-gray-100 rounded-xl"></div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="space-y-5">
                                            <div className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100">
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">Allow Merchant Self-Registration</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">If disabled, users must apply via an external application form.</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setAllowSelfRegistration((prev) => !prev)}
                                                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ${
                                                        allowSelfRegistration ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gray-300'
                                                    }`}
                                                >
                                                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-300 ${
                                                        allowSelfRegistration ? 'translate-x-6' : 'translate-x-1'
                                                    }`} />
                                                </button>
                                            </div>

                                            {!allowSelfRegistration && (
                                                <div className="space-y-3 animate-fadeIn">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <label className="text-sm font-medium text-gray-700">Application Form URL</label>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={async () => {
                                                                    if (!applicationFormUrl.trim()) {
                                                                        toast.error("No URL to copy");
                                                                        return;
                                                                    }
                                                                    try {
                                                                        await navigator.clipboard.writeText(applicationFormUrl.trim());
                                                                        toast.success("Copied to clipboard");
                                                                    } catch {
                                                                        toast.error("Failed to copy");
                                                                    }
                                                                }}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-all"
                                                            >
                                                                <Copy className="w-3.5 h-3.5" />
                                                                Copy
                                                            </button>
                                                            <a
                                                                href={applicationFormUrl.trim() || "#"}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                aria-disabled={!applicationFormUrl.trim()}
                                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                                                                    applicationFormUrl.trim()
                                                                        ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                                                                        : "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                                                                }`}
                                                            >
                                                                <ExternalLink className="w-3.5 h-3.5" />
                                                                Open
                                                            </a>
                                                        </div>
                                                    </div>

                                                    <textarea
                                                        value={applicationFormUrl}
                                                        onChange={(e) => setApplicationFormUrl(e.target.value)}
                                                        placeholder="https://forms.google.com/..."
                                                        rows={2}
                                                        spellCheck={false}
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm font-mono break-all resize-none transition-all"
                                                    />
                                                    <p className="text-xs text-gray-400">Google Form URL for merchant applications. Displayed when self-registration is disabled.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                            <Database className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">Platform Configuration</h3>
                                            <p className="text-sm text-gray-500">All system settings and their current values</p>
                                        </div>
                                    </div>
                                    {platformSettingsLoading ? (
                                        <div className="space-y-3">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="animate-pulse h-16 bg-gray-100 rounded-xl" />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="grid gap-3">
                                            {(platformSettingsData?.settings || []).map((setting) => (
                                                <div key={setting.id} className="group p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm font-mono font-medium text-gray-800 break-words">{setting.key}</p>
                                                            <p className="mt-1 text-sm text-gray-600 break-words whitespace-pre-wrap">{setting.value}</p>
                                                            {setting.description && (
                                                                <p className="text-xs text-gray-400 mt-2">{setting.description}</p>
                                                            )}
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={async () => {
                                                                if (!setting.value?.trim()) {
                                                                    toast.error("No value to copy");
                                                                    return;
                                                                }
                                                                try {
                                                                    await navigator.clipboard.writeText(setting.value.trim());
                                                                    toast.success("Copied to clipboard");
                                                                } catch {
                                                                    toast.error("Failed to copy");
                                                                }
                                                            }}
                                                            className="shrink-0 p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-all opacity-0 group-hover:opacity-100"
                                                            title="Copy value"
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === "withdrawals" && (
                            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                                        <Lock className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Platform Withdrawals</h3>
                                        <p className="text-sm text-gray-500">Global control for all withdrawal operations</p>
                                    </div>
                                </div>

                                <div className="p-5 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 border border-orange-100">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">Enable Platform Withdrawals</p>
                                            <p className="text-xs text-gray-600 mt-1">
                                                Master kill switch for all withdrawals across the platform. This overrides gateway-level and merchant-level withdrawal access.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (withdrawalsGloballyEnabled) {
                                                    setShowDisableWithdrawalsConfirm(true);
                                                    return;
                                                }
                                                void handlePlatformWithdrawalsUpdate(true);
                                            }}
                                            disabled={platformSettingsLoading || updatePlatformWithdrawalsMutation.isPending}
                                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ${
                                                withdrawalsGloballyEnabled ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gray-300'
                                            } ${platformSettingsLoading || updatePlatformWithdrawalsMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-300 ${
                                                withdrawalsGloballyEnabled ? 'translate-x-6' : 'translate-x-1'
                                            }`} />
                                        </button>
                                    </div>

                                    <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${
                                        withdrawalsGloballyEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                        {withdrawalsGloballyEnabled ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                                        {withdrawalsGloballyEnabled ? 'Withdrawals are currently enabled platform-wide' : 'Withdrawals are currently disabled platform-wide'}
                                    </div>
                                </div>

                                <div className="mt-5 rounded-xl bg-gray-50 border border-gray-100 p-5">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                            <Sparkles className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">How this works</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                When disabled, merchants cannot preview withdrawals or submit withdrawals. 
                                                This setting sits above gateway-level and merchant-level controls.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "notifications" && (
                            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                        <Bell className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Email Notifications</h3>
                                        <p className="text-sm text-gray-500">Configure what emails are sent to merchants and admins</p>
                                    </div>
                                </div>

                                {notificationSettingsLoading ? (
                                    <div className="space-y-4">
                                        {Array.from({ length: 6 }).map((_, index) => (
                                            <div key={index} className="animate-pulse h-20 bg-gray-100 rounded-xl" />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="grid gap-3">
                                            {notificationItems.map((item) => {
                                                const enabled = notificationSettingsState[item.key];
                                                return (
                                                    <div
                                                        key={item.key}
                                                        className="flex items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:border-gray-200 transition-all"
                                                    >
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                                                            <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => void handleNotificationToggle(item.key)}
                                                            disabled={updateNotificationSettingsMutation.isPending}
                                                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ${
                                                                enabled ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gray-300'
                                                            } ${updateNotificationSettingsMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        >
                                                            <span
                                                                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-300 ${
                                                                    enabled ? 'translate-x-6' : 'translate-x-1'
                                                                }`}
                                                            />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="rounded-xl border border-gray-200 overflow-hidden mt-6">
                                            <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                                                <div className="flex items-center gap-2">
                                                    <CreditCard className="w-4 h-4 text-gray-500" />
                                                    <p className="text-sm font-semibold text-gray-900">Transaction Notifications</p>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    The master switch overrides the two child toggles below.
                                                </p>
                                            </div>
                                            <div className="p-4 space-y-3">
                                                {transactionNotificationItems.map((item) => {
                                                    const enabled = notificationSettingsState[item.key];
                                                    const isChildToggle = item.key !== "transactionAlertEmail";
                                                    const isDisabled = Boolean(item.disabled) || updateNotificationSettingsMutation.isPending;

                                                    return (
                                                        <div
                                                            key={item.key}
                                                            className={`flex items-center justify-between gap-4 p-4 rounded-xl transition-all ${
                                                                isDisabled
                                                                    ? "bg-gray-50 border border-gray-100"
                                                                    : "bg-white border border-gray-100 hover:border-gray-200"
                                                            }`}
                                                        >
                                                            <div className="min-w-0 flex-1">
                                                                <p className={`text-sm font-semibold ${isDisabled ? "text-gray-500" : "text-gray-900"}`}>
                                                                    {item.title}
                                                                </p>
                                                                <p className={`text-xs mt-1 ${isDisabled ? "text-gray-400" : "text-gray-500"}`}>
                                                                    {item.description}
                                                                </p>
                                                                {isChildToggle && !notificationSettingsState.transactionAlertEmail && (
                                                                    <p className="text-[11px] text-orange-600 mt-2 flex items-center gap-1">
                                                                        <AlertTriangle className="w-3 h-3" />
                                                                        Transaction emails are disabled at the master level.
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => void handleNotificationToggle(item.key)}
                                                                disabled={isDisabled}
                                                                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ${
                                                                    enabled ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gray-300'
                                                                } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                            >
                                                                <span
                                                                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-300 ${
                                                                        enabled ? 'translate-x-6' : 'translate-x-1'
                                                                    }`}
                                                                />
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "gateways" && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                    {gatewaysLoading ? (
                                        Array.from({ length: 2 }).map((_, i) => (
                                            <div key={i} className="bg-gray-50 rounded-2xl border border-gray-100 p-5 animate-pulse h-48" />
                                        ))
                                    ) : (
                                        globalGatewaysResponse?.gateways?.map((gateway, idx) => (
                                            <motion.div
                                                key={gateway.code}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-300"
                                            >
                                                <div className="flex items-center justify-between mb-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-sm shadow-lg ${
                                                            gateway.code === 'MTN_MOMO' 
                                                                ? 'bg-gradient-to-br from-yellow-500 to-orange-500' 
                                                                : 'bg-gradient-to-br from-red-500 to-crimson-600'
                                                        }`}>
                                                            {gateway.code === 'MTN_MOMO' ? 'MTN' : 'OM'}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-gray-900">{gateway.name}</h4>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className={`text-xs font-medium flex items-center gap-1 ${
                                                                    gateway.isActive ? 'text-emerald-600' : 'text-gray-400'
                                                                }`}>
                                                                    {gateway.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                                    {gateway.isActive ? 'Active' : 'Inactive'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleGatewayUpdate(gateway.code, { isActive: !gateway.isActive })}
                                                        disabled={updateGatewayMutation.isPending}
                                                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ${
                                                            gateway.isActive ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gray-300'
                                                        } ${updateGatewayMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-300 ${
                                                            gateway.isActive ? 'translate-x-6' : 'translate-x-1'
                                                        }`} />
                                                    </button>
                                                </div>

                                                <div className="pt-4 border-t border-gray-100 flex gap-5">
                                                    {[
                                                        { key: 'collectionsEnabled', label: 'Collections', enabled: gateway.collectionsEnabled },
                                                        { key: 'disbursementsEnabled', label: 'Disbursements', enabled: gateway.disbursementsEnabled },
                                                        { key: 'withdrawalsEnabled', label: 'Withdrawals', enabled: gateway.withdrawalsEnabled },
                                                    ].map((feature) => (
                                                        <label key={feature.key} className="flex items-center gap-2 text-xs font-medium text-gray-600 cursor-pointer select-none">
                                                            <div className="relative flex items-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={feature.enabled}
                                                                    onChange={() => handleGatewayUpdate(gateway.code, { [feature.key]: !feature.enabled })}
                                                                    className="sr-only peer"
                                                                    disabled={!gateway.isActive}
                                                                />
                                                                <div className="w-8 h-4 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                                                            </div>
                                                            {feature.label}
                                                        </label>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                    {!gatewaysLoading && (!globalGatewaysResponse?.gateways || globalGatewaysResponse.gateways.length === 0) && (
                                        <div className="col-span-1 lg:col-span-2 p-12 text-center bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100 border-dashed">
                                            <Server className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                            <h3 className="text-base font-medium text-gray-900">No Gateways Found</h3>
                                            <p className="text-sm text-gray-500 mt-1">Global gateway configurations will appear here.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === "security" && (
                            <div className="space-y-6">
                                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                                            <Shield className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">Access Control</h3>
                                            <p className="text-sm text-gray-500">Manage security policies and access restrictions</p>
                                        </div>
                                    </div>
                                    <div className="space-y-5">
                                        <div className="flex items-center justify-between p-5 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100">
                                            <div className="flex items-start gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                                                    <Fingerprint className="w-4 h-4 text-white" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-semibold text-gray-900">Enforce 2FA for Admins</h4>
                                                    <p className="text-xs text-gray-500 mt-0.5">Require Two-Factor Authentication for all administrative accounts.</p>
                                                </div>
                                            </div>
                                            <button className="relative inline-flex h-7 w-12 items-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500">
                                                <span className="inline-block h-5 w-5 transform translate-x-6 rounded-full bg-white shadow-md" />
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <Globe className="w-4 h-4 text-gray-500" />
                                                <label className="text-sm font-medium text-gray-700">IP Whitelist (CIDR)</label>
                                            </div>
                                            <textarea
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm h-28 resize-none transition-all"
                                                placeholder="192.168.1.0/24&#10;10.0.0.1/32"
                                                defaultValue="10.0.0.1/32"
                                            />
                                            <p className="text-xs text-gray-400 flex items-center gap-1">
                                                <AlertTriangle className="w-3 h-3" />
                                                Enter one IP range per line. Leave empty to allow all (Not Recommended).
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Confirmation Modal */}
                {showDisableWithdrawalsConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-100"
                        >
                            <div className="p-6 space-y-5">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                                        <AlertTriangle className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Disable All Withdrawals?</h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            This will block all merchants from previewing or submitting withdrawals on the entire platform.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowDisableWithdrawalsConfirm(false)}
                                        disabled={updatePlatformWithdrawalsMutation.isPending}
                                        className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => void handlePlatformWithdrawalsUpdate(false)}
                                        disabled={updatePlatformWithdrawalsMutation.isPending}
                                        className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-orange-600 rounded-xl hover:from-red-700 hover:to-orange-700 transition-all shadow-lg shadow-red-500/25 disabled:opacity-50"
                                    >
                                        {updatePlatformWithdrawalsMutation.isPending ? "Disabling..." : "Disable All"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
}