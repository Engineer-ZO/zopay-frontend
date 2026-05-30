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
    XCircle
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

        try {
            const result = await updateProfileMutation.mutateAsync({ email: email.trim() });
            toast.success(result.message || "Profile updated successfully");

            // Show verification reminder if email changed
            if (result.message?.includes("verify")) {
                toast.info("Please verify your new email address");
            }
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
            title: "Enable verification emails",
            description: "Send email verification code emails to users.",
        },
        {
            key: "passwordResetEmail",
            title: "Enable password reset emails",
            description: "Send password reset code emails when users request a reset.",
        },
        {
            key: "welcomeEmail",
            title: "Enable welcome emails",
            description: "Send a welcome email after successful email verification.",
        },
        {
            key: "merchantAccountCreatedEmail",
            title: "Enable merchant account created emails",
            description: "Send credential emails when an admin creates a merchant account.",
        },
        {
            key: "accountStatusChangeEmail",
            title: "Enable account status change emails",
            description: "Notify merchants when their account status changes.",
        },
        {
            key: "suspiciousLoginAlertEmail",
            title: "Enable suspicious login alert emails",
            description: "Notify users about new or suspicious login activity.",
        },
        {
            key: "payoutApprovalEmail",
            title: "Enable payout approval emails",
            description: "Send emails related to bulk payout approval workflow events.",
        },
        {
            key: "supportTicketMerchantEmail",
            title: "Notify merchants on admin ticket updates",
            description: "Send emails to merchants when admins reply to tickets or update ticket status.",
        },
        {
            key: "supportTicketAdminEmail",
            title: "Notify admins on merchant ticket activity",
            description: "Send emails to admins when merchants create tickets, reply, or trigger status changes through reply flow.",
        },
        {
            key: "bankTopupAdminEmail",
            title: "Enable bank top-up admin emails",
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
            title: "Enable transaction emails",
            description: "Master switch for all transaction email alerts.",
        },
        {
            key: "transactionSuccessAlertEmail",
            title: "Enable success transaction emails",
            description: "Controls emails for successful transactions. Only applies when transaction emails are enabled.",
            disabled: !notificationSettingsState.transactionAlertEmail,
        },
        {
            key: "transactionFailureAlertEmail",
            title: "Enable failed transaction emails",
            description: "Controls emails for failed transactions. Only applies when transaction emails are enabled.",
            disabled: !notificationSettingsState.transactionAlertEmail,
        },
    ];

    const tabs = [
        { id: "profile", label: "Profile Settings", icon: User },
        { id: "registration", label: "Merchant Registration", icon: Settings },
        { id: "notifications", label: "Notifications", icon: Mail },
        { id: "withdrawals", label: "Withdrawals", icon: Lock },
        { id: "gateways", label: "Gateways", icon: Server },
        { id: "security", label: "Security", icon: Shield },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Settings className="w-8 h-8 text-deep-blue-violet-600" />
                        Platform Settings
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Configure global behavior, gateways, and system-wide parameters</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                        <RotateCcw className="w-4 h-4" />
                        Reset Defaults
                    </button>
                    {activeTab === "profile" ? (
                        <button
                            onClick={handleProfileUpdate}
                            disabled={updateProfileMutation.isPending || !email.trim()}
                            className="flex items-center gap-2 px-4 py-2 bg-deep-blue-violet-600 hover:bg-deep-blue-violet-700 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-70"
                        >
                            {updateProfileMutation.isPending ? (
                                <>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                    />
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
                            className="flex items-center gap-2 px-4 py-2 bg-deep-blue-violet-600 hover:bg-deep-blue-violet-700 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-70"
                        >
                            {updateMerchantRegistrationMutation.isPending ? (
                                <>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                    />
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
                            className="flex items-center gap-2 px-4 py-2 bg-deep-blue-violet-600 hover:bg-deep-blue-violet-700 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-70"
                        >
                            {isSaving ? (
                                <>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                    />
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
            <div className="bg-white rounded-lg border border-gray-200 p-1 flex gap-1 overflow-x-auto">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${isActive
                                ? "bg-deep-blue-violet-600 text-white"
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
                    {/* Main Settings Panel */}
                    <div className="space-y-6">
                        {activeTab === "profile" && (
                            <>
                                {/* Profile Settings */}
                                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <User className="w-5 h-5 text-gray-500" />
                                        Personal Information
                                    </h3>
                                    {adminLoading ? (
                                        <div className="space-y-4">
                                            <div className="animate-pulse space-y-2">
                                                <div className="h-3 bg-gray-200 rounded w-24"></div>
                                                <div className="h-10 bg-gray-200 rounded"></div>
                                            </div>
                                            <div className="animate-pulse space-y-2">
                                                <div className="h-3 bg-gray-200 rounded w-24"></div>
                                                <div className="h-10 bg-gray-200 rounded"></div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-deep-blue-violet-500 focus:border-deep-blue-violet-500 outline-none text-sm"
                                                    />
                                                </div>
                                                {adminData?.admin && !adminData.admin.emailVerified && (
                                                    <p className="text-xs text-crimson-red-600">Email not verified. Please verify your email address.</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Role</label>
                                                <input
                                                    type="text"
                                                    value={adminData?.admin?.role === "admin" ? "Super Admin" : adminData?.admin?.role || "Admin"}
                                                    disabled
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-500 cursor-not-allowed"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Account Settings */}
                                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Settings className="w-5 h-5 text-gray-500" />
                                        Account Settings
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Change Password</label>
                                            <input
                                                type="password"
                                                placeholder="Enter new password"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-deep-blue-violet-500 focus:border-deep-blue-violet-500 outline-none text-sm"
                                            />
                                            <p className="text-xs text-gray-500">Leave blank to keep current password</p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                                            <input
                                                type="password"
                                                placeholder="Confirm new password"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-deep-blue-violet-500 focus:border-deep-blue-violet-500 outline-none text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === "registration" && (
                            <div className="space-y-6">
                                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Merchant Registration</h3>

                                    {platformSettingsLoading ? (
                                        <div className="space-y-4">
                                            <div className="animate-pulse space-y-2">
                                                <div className="h-4 bg-gray-200 rounded w-48"></div>
                                                <div className="h-10 bg-gray-200 rounded"></div>
                                            </div>
                                            <div className="animate-pulse space-y-2">
                                                <div className="h-4 bg-gray-200 rounded w-48"></div>
                                                <div className="h-10 bg-gray-200 rounded"></div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">Allow Merchant Self-Registration</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">If disabled, users must apply via an external application form.</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setAllowSelfRegistration((prev) => !prev)}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${allowSelfRegistration ? 'bg-green-500' : 'bg-gray-300'}`}
                                                >
                                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${allowSelfRegistration ? 'translate-x-6' : 'translate-x-1'}`} />
                                                </button>
                                            </label>

                                            {!allowSelfRegistration && (
                                                <div className="space-y-2">
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
                                                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
                                                            >
                                                                <Copy className="w-3.5 h-3.5" />
                                                                Copy
                                                            </button>
                                                            <a
                                                                href={applicationFormUrl.trim() || "#"}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                aria-disabled={!applicationFormUrl.trim()}
                                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md border ${applicationFormUrl.trim()
                                                                    ? "border-deep-blue-violet-200 bg-deep-blue-violet-50 text-deep-blue-violet-700 hover:bg-deep-blue-violet-100"
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
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-deep-blue-violet-500 focus:border-deep-blue-violet-500 outline-none text-sm font-mono break-all resize-none"
                                                    />
                                                    <p className="text-xs text-gray-500">Google Form URL for merchant applications. Displayed when self-registration is disabled.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">All Platform Settings</h3>
                                    {platformSettingsLoading ? (
                                        <div className="animate-pulse space-y-2">
                                            <div className="h-4 bg-gray-200 rounded w-56"></div>
                                            <div className="h-4 bg-gray-200 rounded w-40"></div>
                                            <div className="h-4 bg-gray-200 rounded w-48"></div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {(platformSettingsData?.settings || []).map((setting) => (
                                                <div key={setting.id} className="p-3 rounded-lg border border-gray-200">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm font-mono text-gray-900 break-words">{setting.key}</p>
                                                            <p className="mt-1 text-sm text-gray-700 break-words whitespace-pre-wrap">{setting.value}</p>
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
                                                            className="shrink-0 p-2 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-600"
                                                            title="Copy value"
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    {setting.description && (
                                                        <p className="text-xs text-gray-500 mt-1">{setting.description}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === "withdrawals" && (
                            <div className="space-y-6">
                                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Lock className="w-5 h-5 text-gray-500" />
                                        Platform Withdrawals
                                    </h3>

                                    <div className="p-4 rounded-lg border border-crimson-red-200 bg-crimson-red-50">
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
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                    withdrawalsGloballyEnabled ? 'bg-green-500' : 'bg-gray-300'
                                                } ${platformSettingsLoading || updatePlatformWithdrawalsMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                                    withdrawalsGloballyEnabled ? 'translate-x-6' : 'translate-x-1'
                                                }`} />
                                            </button>
                                        </div>

                                        <p className={`mt-3 inline-flex items-center gap-1.5 text-xs font-medium ${
                                            withdrawalsGloballyEnabled ? 'text-green-700' : 'text-red-700'
                                        }`}>
                                            {withdrawalsGloballyEnabled ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                                            {withdrawalsGloballyEnabled ? 'Withdrawals are currently enabled platform-wide' : 'Withdrawals are currently disabled platform-wide'}
                                        </p>
                                    </div>

                                    <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                                        <p className="text-sm font-medium text-gray-900">How this works</p>
                                        <p className="text-xs text-gray-600 mt-1">
                                            When disabled, merchants cannot preview withdrawals or submit withdrawals. This setting sits above gateway-level and merchant-level controls.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "notifications" && (
                            <div className="space-y-6">
                                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Mail className="w-5 h-5 text-gray-500" />
                                        Email Notifications
                                    </h3>

                                    {notificationSettingsLoading ? (
                                        <div className="space-y-4">
                                            {Array.from({ length: 4 }).map((_, index) => (
                                                <div key={index} className="animate-pulse h-16 rounded-lg bg-gray-100" />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {notificationItems.map((item) => {
                                                const enabled = notificationSettingsState[item.key];
                                                return (
                                                    <label
                                                        key={item.key}
                                                        className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100"
                                                    >
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                                                            <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => void handleNotificationToggle(item.key)}
                                                            disabled={updateNotificationSettingsMutation.isPending}
                                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                                enabled ? 'bg-green-500' : 'bg-gray-300'
                                                            } ${updateNotificationSettingsMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        >
                                                            <span
                                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                                                    enabled ? 'translate-x-6' : 'translate-x-1'
                                                                }`}
                                                            />
                                                        </button>
                                                    </label>
                                                );
                                            })}

                                            <div className="rounded-lg border border-gray-200 overflow-hidden">
                                                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                                    <p className="text-sm font-semibold text-gray-900">Transaction Notifications</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        The master switch overrides the two child toggles below.
                                                    </p>
                                                </div>
                                                <div className="p-4 space-y-4">
                                                    {transactionNotificationItems.map((item) => {
                                                        const enabled = notificationSettingsState[item.key];
                                                        const isChildToggle = item.key !== "transactionAlertEmail";
                                                        const isDisabled = Boolean(item.disabled) || updateNotificationSettingsMutation.isPending;

                                                        return (
                                                            <label
                                                                key={item.key}
                                                                className={`flex items-center justify-between gap-4 p-4 rounded-lg border ${
                                                                    isDisabled
                                                                        ? "bg-gray-100 border-gray-200"
                                                                        : "bg-gray-50 border-gray-100"
                                                                }`}
                                                            >
                                                                <div className="min-w-0">
                                                                    <p className={`text-sm font-semibold ${isDisabled ? "text-gray-500" : "text-gray-900"}`}>
                                                                        {item.title}
                                                                    </p>
                                                                    <p className={`text-xs mt-1 ${isDisabled ? "text-gray-400" : "text-gray-500"}`}>
                                                                        {item.description}
                                                                    </p>
                                                                    {isChildToggle && !notificationSettingsState.transactionAlertEmail && (
                                                                        <p className="text-[11px] text-crimson-red-600 mt-2">
                                                                            Transaction emails are disabled at the master level.
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => void handleNotificationToggle(item.key)}
                                                                    disabled={isDisabled}
                                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                                        enabled ? 'bg-green-500' : 'bg-gray-300'
                                                                    } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                >
                                                                    <span
                                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                                                            enabled ? 'translate-x-6' : 'translate-x-1'
                                                                        }`}
                                                                    />
                                                                </button>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === "gateways" && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {gatewaysLoading ? (
                                        Array.from({ length: 2 }).map((_, i) => (
                                            <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-5 animate-pulse h-40" />
                                        ))
                                    ) : (
                                        globalGatewaysResponse?.gateways?.map((gateway) => (
                                            <div key={gateway.code} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-sm ${gateway.code === 'MTN_MOMO' ? 'bg-yellow-400' : 'bg-crimson-red-500'}`}>
                                                            {gateway.code === 'MTN_MOMO' ? 'MTN' : 'OM'}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-gray-900 text-sm">{gateway.name}</h4>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <span className={`text-xs font-medium flex items-center gap-1 ${gateway.isActive ? 'text-green-600' : 'text-red-600'}`}>
                                                                    {gateway.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                                    {gateway.isActive ? 'Active' : 'Inactive'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleGatewayUpdate(gateway.code, { isActive: !gateway.isActive })}
                                                        disabled={updateGatewayMutation.isPending}
                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${gateway.isActive ? 'bg-green-500' : 'bg-gray-300'} ${updateGatewayMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${gateway.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                                                    </button>
                                                </div>

                                                <div className="pt-4 border-t border-gray-100 flex gap-4">
                                                    <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer select-none">
                                                        <div className="relative flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={gateway.collectionsEnabled}
                                                                onChange={() => handleGatewayUpdate(gateway.code, { collectionsEnabled: !gateway.collectionsEnabled })}
                                                                className="sr-only peer"
                                                                disabled={!gateway.isActive}
                                                            />
                                                            <div className="w-8 h-4 bg-gray-200 rounded-full peer peer-checked:bg-deep-blue-violet-600 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                                                        </div>
                                                        Collections
                                                    </label>

                                                    <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer select-none">
                                                        <div className="relative flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={gateway.disbursementsEnabled}
                                                                onChange={() => handleGatewayUpdate(gateway.code, { disbursementsEnabled: !gateway.disbursementsEnabled })}
                                                                className="sr-only peer"
                                                                disabled={!gateway.isActive}
                                                            />
                                                            <div className="w-8 h-4 bg-gray-200 rounded-full peer peer-checked:bg-deep-blue-violet-600 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                                                        </div>
                                                        Disbursements
                                                    </label>

                                                    <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer select-none">
                                                        <div className="relative flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={gateway.withdrawalsEnabled}
                                                                onChange={() => handleGatewayUpdate(gateway.code, { withdrawalsEnabled: !gateway.withdrawalsEnabled })}
                                                                className="sr-only peer"
                                                                disabled={!gateway.isActive}
                                                            />
                                                            <div className="w-8 h-4 bg-gray-200 rounded-full peer peer-checked:bg-deep-blue-violet-600 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                                                        </div>
                                                        Withdrawals
                                                    </label>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    {!gatewaysLoading && (!globalGatewaysResponse?.gateways || globalGatewaysResponse.gateways.length === 0) && (
                                        <div className="col-span-1 md:col-span-2 p-8 text-center bg-gray-50 border border-gray-200 rounded-lg border-dashed">
                                            <Server className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                            <h3 className="text-sm font-medium text-gray-900">No Gateways Found</h3>
                                            <p className="text-xs text-gray-500 mt-1">Global gateway configurations will appear here.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === "security" && (
                            <div className="space-y-6">
                                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Lock className="w-5 h-5 text-gray-500" />
                                        Access Control
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                            <div className="flex items-start gap-3">
                                                <AlertTriangle className="w-5 h-5 text-crimson-red-500 shrink-0 mt-0.5" />
                                                <div>
                                                    <h4 className="text-sm font-semibold text-gray-900">Enforce 2FA for Admins</h4>
                                                    <p className="text-xs text-gray-500 mt-0.5">Require Two-Factor Authentication for all administrative accounts.</p>
                                                </div>
                                            </div>
                                            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-green-500">
                                                <span className="inline-block h-4 w-4 transform translate-x-6 rounded-full bg-white" />
                                            </button>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">IP Whitelist (CIDR)</label>
                                            <textarea
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-deep-blue-violet-500 focus:border-deep-blue-violet-500 font-mono text-sm h-24"
                                                placeholder="192.168.1.0/24"
                                                defaultValue="10.0.0.1/32"
                                            />
                                            <p className="text-xs text-gray-500">Enter one IP range per line. Leave empty to allow all (Not Recommended).</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>

            {showDisableWithdrawalsConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white shadow-2xl border border-gray-200">
                        <div className="p-6 space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 text-red-600">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Disable All Withdrawals?</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        This will block all merchants from previewing or submitting withdrawals on the entire platform.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowDisableWithdrawalsConfirm(false)}
                                    disabled={updatePlatformWithdrawalsMutation.isPending}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={() => void handlePlatformWithdrawalsUpdate(false)}
                                    disabled={updatePlatformWithdrawalsMutation.isPending}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                >
                                    {updatePlatformWithdrawalsMutation.isPending ? "Disabling..." : "Disable All"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
