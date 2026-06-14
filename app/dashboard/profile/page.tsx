"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Edit, X, Loader2, User, Lock, ImagePlus, Trash2, Mail, Phone, Globe, Building, Calendar, MapPin, Shield, CheckCircle, AlertCircle, Clock, Smartphone, Award, Briefcase, XCircle } from "lucide-react";
import { toast } from "sonner";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useSubmitProfileUpdateRequest, useUploadMerchantLogo, useRemoveMerchantLogo } from "@/features/merchants/hooks/useMerchant";
import { useUserMerchantData } from "@/features/merchants/context/MerchantContext";
import { useChangePassword, useLogout } from "@/features/auth/hooks/useAuth";
import { generateSignedURL } from "@/features/files/api/index";
import type {
    UpdateMerchantProfileRequest,
    IndividualMerchantProfile,
    InstitutionMerchantProfile,
    SubmitProfileUpdateRequestBody,
} from "@/features/merchants/types/index";
import {
    resolveMerchantKind,
    merchantKindLabel,
    isInstitutionKind,
    normalizeIndividual,
    normalizeInstitution,
} from "@/features/merchants/utils/profileDisplay";

// Enhanced Profile Field Component
function ProfileField({ icon: Icon, label, value }: { icon?: any; label: string; value?: string | null }) {
    const v = value?.trim();
    return (
        <div className="group p-3 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-200">
            <div className="flex items-start gap-2.5">
                {Icon && <Icon className="w-3.5 h-3.5 text-indigo-500 mt-0.5 shrink-0" />}
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white break-words">{v ? v : "—"}</p>
                </div>
            </div>
        </div>
    );
}

// Status Badge Component
const StatusBadge = ({ status, type }: { status: string; type: "kyc" | "sandbox" | "production" }) => {
    const getConfig = () => {
        if (type === "kyc") {
            switch (status) {
                case "APPROVED": return { icon: CheckCircle, bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-500/20", label: "Approved" };
                case "PENDING": return { icon: Clock, bg: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-700 dark:text-amber-400", border: "border-amber-200 dark:border-amber-500/20", label: "Pending" };
                case "REJECTED": return { icon: XCircle, bg: "bg-rose-50 dark:bg-rose-500/10", text: "text-rose-700 dark:text-rose-400", border: "border-rose-200 dark:border-rose-500/20", label: "Rejected" };
                default: return { icon: AlertCircle, bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-400", border: "border-slate-200 dark:border-slate-700", label: status };
            }
        }
        if (type === "sandbox") {
            return status === "ACTIVE" 
                ? { icon: CheckCircle, bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-500/20", label: "Active" }
                : { icon: Shield, bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-400", border: "border-slate-200 dark:border-slate-700", label: status };
        }
        if (type === "production") {
            switch (status) {
                case "ACTIVE": return { icon: CheckCircle, bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-500/20", label: "Active" };
                case "PENDING_APPROVAL": return { icon: Clock, bg: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-700 dark:text-amber-400", border: "border-amber-200 dark:border-amber-500/20", label: "Pending" };
                default: return { icon: Shield, bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-400", border: "border-slate-200 dark:border-slate-700", label: status };
            }
        }
        return { icon: Shield, bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-400", border: "border-slate-200 dark:border-slate-700", label: status };
    };
    
    const config = getConfig();
    const Icon = config.icon;
    
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
            <Icon className="w-3 h-3" />
            {config.label}
        </span>
    );
};

const emptyIndividual = (): IndividualMerchantProfile => ({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    phone: "",
    address: "",
    idType: "",
    idNumber: "",
    niu: "",
    doingBusinessAs: "",
});

const emptyInstitution = (): InstitutionMerchantProfile => ({
    institutionName: "",
    registrationNumber: "",
    dateOfCreation: "",
    niu: "",
    managerName: "",
    managerContact: "",
    managerAddress: "",
    address: "",
    contactPhone: "",
    contactEmail: "",
});

export default function ProfilePage() {
    const { merchant, isLoading } = useUserMerchantData();
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    const [formMerchant, setFormMerchant] = useState<UpdateMerchantProfileRequest>({
        businessName: "",
        email: "",
        phone: "",
        businessType: "",
        country: "",
    });
    const [formIndividual, setFormIndividual] = useState<IndividualMerchantProfile>(emptyIndividual());
    const [formInstitution, setFormInstitution] = useState<InstitutionMerchantProfile>(emptyInstitution());

    const submitProfileUpdateMutation = useSubmitProfileUpdateRequest();
    const changePasswordMutation = useChangePassword();
    const logoutMutation = useLogout();
    const uploadLogoMutation = useUploadMerchantLogo();
    const removeLogoMutation = useRemoveMerchantLogo();
    const logoInputRef = useRef<HTMLInputElement>(null);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);

    const kind = useMemo(() => (merchant ? resolveMerchantKind(merchant) : "LEGACY"), [merchant]);
    const individual = useMemo(
        () => (merchant ? normalizeIndividual(merchant.individual) : {}),
        [merchant]
    );
    const institution = useMemo(
        () => (merchant ? normalizeInstitution(merchant.institution) : {}),
        [merchant]
    );

    const initials = useMemo(() => {
        if (!merchant) return "M";
        if (individual.firstName || individual.lastName) {
            const a = (individual.firstName?.[0] || "").toUpperCase();
            const b = (individual.lastName?.[0] || "").toUpperCase();
            if (a || b) return `${a}${b}` || "M";
        }
        return merchant.businessName ? merchant.businessName.substring(0, 2).toUpperCase() : "M";
    }, [merchant, individual.firstName, individual.lastName]);

    useEffect(() => {
        if (!merchant) return;
        setFormMerchant({
            businessName: merchant.businessName || "",
            email: merchant.email || "",
            phone: merchant.phone || "",
            businessType: merchant.businessType || "",
            country: merchant.country || "",
            feePayer: merchant.feePayer,
        });
        setFormIndividual({ ...emptyIndividual(), ...normalizeIndividual(merchant.individual) });
        setFormInstitution({ ...emptyInstitution(), ...normalizeInstitution(merchant.institution) });

        if (merchant.logoUrl) {
            setLogoUrl(merchant.logoUrl);
        } else if (merchant.logoFileId) {
            generateSignedURL(merchant.logoFileId)
                .then((res) => setLogoUrl(res.url))
                .catch(() => setLogoUrl(null));
        } else {
            setLogoUrl(null);
        }
    }, [merchant]);

    const handleMerchantChange = (field: keyof UpdateMerchantProfileRequest, value: string) => {
        setFormMerchant((prev) => ({ ...prev, [field]: value }));
    };

    const handleIndividualChange = (field: keyof IndividualMerchantProfile, value: string) => {
        setFormIndividual((prev) => ({ ...prev, [field]: value }));
    };

    const handleInstitutionChange = (field: keyof InstitutionMerchantProfile, value: string) => {
        setFormInstitution((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!merchant) return;

        const body: SubmitProfileUpdateRequestBody = {
            proposedChanges: {
                merchant: { ...formMerchant },
            },
        };

        if (kind === "INDIVIDUAL") {
            body.proposedChanges.individual = { ...formIndividual };
        } else if (isInstitutionKind(kind)) {
            body.proposedChanges.institution = { ...formInstitution };
        }

        try {
            await submitProfileUpdateMutation.mutateAsync(body);
            toast.success("Profile update submitted", {
                description: "Your profile update request was sent to admin review.",
            });
            setShowEditModal(false);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to update profile";
            toast.error("Update Failed", {
                description: errorMessage,
            });
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        const current = currentPassword.trim();
        const next = newPassword.trim();
        const confirm = confirmNewPassword.trim();

        if (!current || !next || !confirm) {
            toast.error("Please fill in all fields");
            return;
        }

        if (next.length < 6) {
            toast.error("New password must be at least 6 characters");
            return;
        }

        if (next !== confirm) {
            toast.error("New passwords do not match");
            return;
        }

        if (current === next) {
            toast.error("New password must be different from current password");
            return;
        }

        try {
            const res = await changePasswordMutation.mutateAsync({
                currentPassword: current,
                newPassword: next,
            });

            setCurrentPassword("");
            setNewPassword("");
            setConfirmNewPassword("");

            toast.success("Password changed successfully", {
                description: res.message || "Please log in again with your new password.",
            });

            setTimeout(() => {
                logoutMutation.mutate();
            }, 800);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to change password";
            toast.error("Change Password Failed", {
                description: errorMessage,
            });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                <div className="flex items-center justify-center h-96">
                    <div className="relative">
                        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <User className="w-5 h-5 text-indigo-500 animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!merchant) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                        <p className="text-slate-600 dark:text-slate-400">No merchant data available</p>
                    </div>
                </div>
            </div>
        );
    }

    const inputClass = "w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all";

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            <div className="max-w-7xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-white via-white to-indigo-50/50 dark:from-slate-800/80 dark:via-slate-800/60 dark:to-indigo-950/30 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-6 shadow-lg">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                    <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                                    <User className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                                        Profile
                                    </h1>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                                        View your account details. Edits are submitted for admin approval.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowEditModal(true)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 shadow-md"
                        >
                            <Edit className="w-4 h-4" />
                            Request Changes
                        </button>
                    </div>
                </div>

                {/* Profile Card */}
                <div className="rounded-2xl bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md">
                    <div className="p-6">
                        {/* Header with Logo */}
                        <div className="flex flex-col md:flex-row md:items-center gap-6 pb-6 border-b border-slate-200 dark:border-slate-700">
                            <div className="relative shrink-0 group">
                                {logoUrl ? (
                                    <div className="relative">
                                        <img
                                            src={logoUrl}
                                            alt={merchant.businessName}
                                            className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-200 dark:border-slate-700 shadow-md"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => logoInputRef.current?.click()}
                                            className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-md hover:scale-110 transition-transform"
                                        >
                                            <ImagePlus className="w-3.5 h-3.5 text-white" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-md">
                                        {initials}
                                    </div>
                                )}
                                <input
                                    ref={logoInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg"
                                    className="hidden"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        if (file.size > 10 * 1024 * 1024) {
                                            toast.error("Logo must be under 10 MB");
                                            return;
                                        }
                                        try {
                                            await uploadLogoMutation.mutateAsync(file);
                                            toast.success("Logo updated");
                                        } catch (err) {
                                            toast.error("Logo upload failed");
                                        } finally {
                                            e.target.value = "";
                                        }
                                    }}
                                />
                            </div>
                            
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400">
                                        <Award className="w-2.5 h-2.5" />
                                        {merchantKindLabel(kind)}
                                    </span>
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{merchant.businessName}</h2>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{merchant.email}</p>
                                <div className="flex items-center gap-3 mt-2">
                                    {merchant.logoFileId ? (
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                try {
                                                    await removeLogoMutation.mutateAsync();
                                                    toast.success("Logo removed");
                                                } catch (err) {
                                                    toast.error("Failed to remove logo");
                                                }
                                            }}
                                            className="inline-flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 transition-colors"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                            Remove logo
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => logoInputRef.current?.click()}
                                            className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
                                        >
                                            <ImagePlus className="w-3 h-3" />
                                            Upload logo
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Account Information */}
                        <div className="pt-6">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Building className="w-4 h-4 text-indigo-500" />
                                Account Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                <ProfileField icon={Shield} label="Merchant ID" value={merchant.id} />
                                <ProfileField icon={Award} label="Merchant Kind" value={merchantKindLabel(kind)} />
                                <ProfileField icon={Building} label="Business Name" value={merchant.businessName} />
                                <ProfileField icon={Briefcase} label="Business Type" value={merchant.businessType} />
                                <ProfileField icon={Mail} label="Email" value={merchant.email} />
                                <ProfileField icon={Phone} label="Phone" value={merchant.phone} />
                                <ProfileField icon={Globe} label="Country" value={merchant.country} />
                                <ProfileField icon={Clock} label="Rate Limit" value={`${merchant.rateLimitPerMinute} requests/min`} />
                                <ProfileField icon={Shield} label="Fee Payer" value={merchant.feePayer} />
                                <ProfileField icon={MapPin} label="Allowed IPs" value={merchant.allowedIps?.join(", ")} />
                                <ProfileField icon={Calendar} label="Created At" value={merchant.createdAt ? new Date(merchant.createdAt).toLocaleString() : undefined} />
                                <ProfileField icon={Calendar} label="Updated At" value={merchant.updatedAt ? new Date(merchant.updatedAt).toLocaleString() : undefined} />
                            </div>
                        </div>

                        {/* Individual/Institution Details */}
                        {kind === "INDIVIDUAL" && (
                            <div className="pt-6">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <User className="w-4 h-4 text-indigo-500" />
                                    Individual Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <ProfileField icon={User} label="First Name" value={individual.firstName} />
                                    <ProfileField icon={User} label="Last Name" value={individual.lastName} />
                                    <ProfileField icon={Calendar} label="Date of Birth" value={individual.dateOfBirth} />
                                    <ProfileField icon={User} label="Gender" value={individual.gender} />
                                    <ProfileField icon={Smartphone} label="Phone" value={individual.phone} />
                                    <ProfileField icon={MapPin} label="Address" value={individual.address} />
                                    <ProfileField icon={Shield} label="ID Type" value={individual.idType} />
                                    <ProfileField icon={Shield} label="ID Number" value={individual.idNumber} />
                                    <ProfileField icon={Building} label="NIU" value={individual.niu} />
                                    <ProfileField icon={Briefcase} label="Doing Business As" value={individual.doingBusinessAs} />
                                </div>
                            </div>
                        )}

                        {isInstitutionKind(kind) && (
                            <div className="pt-6">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Building className="w-4 h-4 text-indigo-500" />
                                    {kind === "COMPANY" ? "Company Details" : kind === "ASSOCIATION" ? "Association Details" : "Group Details"}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <ProfileField icon={Building} label="Institution Name" value={institution.institutionName} />
                                    <ProfileField icon={Shield} label="Registration Number" value={institution.registrationNumber} />
                                    <ProfileField icon={Calendar} label="Date of Creation" value={institution.dateOfCreation} />
                                    <ProfileField icon={Building} label="NIU" value={institution.niu} />
                                    <ProfileField icon={User} label="Manager Name" value={institution.managerName} />
                                    <ProfileField icon={Smartphone} label="Manager Contact" value={institution.managerContact} />
                                    <ProfileField icon={MapPin} label="Manager Address" value={institution.managerAddress} />
                                    <ProfileField icon={MapPin} label="Address" value={institution.address} />
                                    <ProfileField icon={Phone} label="Contact Phone" value={institution.contactPhone} />
                                    <ProfileField icon={Mail} label="Contact Email" value={institution.contactEmail} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Change Password Card */}
                <div className="rounded-2xl bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md">
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-md">
                                <Lock className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Change Password</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">You will be logged out after a successful password change.</p>
                            </div>
                        </div>

                        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                            <div>
                                <label className="text-xs font-semibold text-slate-900 dark:text-white mb-1.5 block">Current Password</label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className={inputClass}
                                    placeholder="Enter current password"
                                    disabled={changePasswordMutation.isPending || logoutMutation.isPending}
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-900 dark:text-white mb-1.5 block">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className={inputClass}
                                    placeholder="Enter new password"
                                    minLength={6}
                                    disabled={changePasswordMutation.isPending || logoutMutation.isPending}
                                    required
                                />
                                <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">Minimum 6 characters</p>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-900 dark:text-white mb-1.5 block">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    className={inputClass}
                                    placeholder="Re-enter new password"
                                    minLength={6}
                                    disabled={changePasswordMutation.isPending || logoutMutation.isPending}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={changePasswordMutation.isPending || logoutMutation.isPending}
                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                            >
                                {changePasswordMutation.isPending || logoutMutation.isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    "Update Password"
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Preferences Card */}
                <div className="rounded-2xl bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md">
                    <div className="p-6">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Language Preference</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Choose your preferred language for the dashboard</p>
                            </div>
                            <LanguageSwitcher showLabel={true} />
                        </div>
                    </div>
                </div>

                {/* Account Status Card */}
                <div className="rounded-2xl bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md">
                    <div className="p-6">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-indigo-500" />
                            Account Status
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700">
                                <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">KYB Status</p>
                                <StatusBadge status={merchant.kycStatus} type="kyc" />
                            </div>
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700">
                                <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Sandbox Status</p>
                                <StatusBadge status={merchant.sandboxState} type="sandbox" />
                            </div>
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700">
                                <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Production Status</p>
                                <StatusBadge status={merchant.productionState} type="production" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal - Enhanced */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setShowEditModal(false)}>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-gradient-to-r from-white to-indigo-50/30 dark:from-slate-800 dark:to-indigo-950/20 border-b border-slate-200 dark:border-slate-700 p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                                        <Edit className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Request Profile Changes</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            {merchantKindLabel(kind)} · Submitted for admin review
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200">
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Account Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-900 dark:text-white mb-1.5 block">Business Name *</label>
                                        <input type="text" value={formMerchant.businessName} onChange={(e) => handleMerchantChange("businessName", e.target.value)} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-900 dark:text-white mb-1.5 block">Business Type</label>
                                        {kind === "LEGACY" ? (
                                            <select value={formMerchant.businessType} onChange={(e) => handleMerchantChange("businessType", e.target.value)} className={inputClass}>
                                                <option value="">Select business type</option>
                                                <option value="Limited Liability Company">Limited Liability Company</option>
                                                <option value="Corporation">Corporation</option>
                                                <option value="Partnership">Partnership</option>
                                                <option value="Sole Proprietorship">Sole Proprietorship</option>
                                            </select>
                                        ) : (
                                            <input type="text" value={formMerchant.businessType} disabled className={`${inputClass} opacity-70`} />
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-900 dark:text-white mb-1.5 block">Email *</label>
                                        <input type="email" value={formMerchant.email} onChange={(e) => handleMerchantChange("email", e.target.value)} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-900 dark:text-white mb-1.5 block">Phone *</label>
                                        <input type="tel" value={formMerchant.phone} onChange={(e) => handleMerchantChange("phone", e.target.value)} className={inputClass} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-semibold text-slate-900 dark:text-white mb-1.5 block">Country *</label>
                                        <input type="text" value={formMerchant.country} onChange={(e) => handleMerchantChange("country", e.target.value)} className={inputClass} />
                                    </div>
                                </div>
                            </div>

                            {kind === "INDIVIDUAL" && (
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Individual Details</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            ["firstName", "First Name"], ["lastName", "Last Name"], ["dateOfBirth", "Date of Birth"],
                                            ["gender", "Gender"], ["phone", "Phone"], ["address", "Address"],
                                            ["idType", "ID Type"], ["idNumber", "ID Number"], ["niu", "NIU"],
                                            ["doingBusinessAs", "Doing Business As (DBA)"]
                                        ].map(([key, label]) => (
                                            <div key={key} className={key === "address" ? "md:col-span-2" : undefined}>
                                                <label className="text-xs font-semibold text-slate-900 dark:text-white mb-1.5 block">{label}</label>
                                                <input type="text" value={formIndividual[key as keyof IndividualMerchantProfile] ?? ""} onChange={(e) => handleIndividualChange(key as keyof IndividualMerchantProfile, e.target.value)} className={inputClass} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {isInstitutionKind(kind) && (
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
                                        {kind === "COMPANY" ? "Company Details" : kind === "ASSOCIATION" ? "Association Details" : "Group Details"}
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            ["institutionName", "Institution Name"], ["registrationNumber", "Registration Number"],
                                            ["dateOfCreation", "Date of Creation"], ["niu", "NIU"], ["managerName", "Manager Name"],
                                            ["managerContact", "Manager Contact"], ["managerAddress", "Manager Address"],
                                            ["address", "Address"], ["contactPhone", "Contact Phone"], ["contactEmail", "Contact Email"]
                                        ].map(([key, label]) => (
                                            <div key={key} className={key === "managerAddress" || key === "address" ? "md:col-span-2" : undefined}>
                                                <label className="text-xs font-semibold text-slate-900 dark:text-white mb-1.5 block">{label}</label>
                                                <input type={key === "contactEmail" ? "email" : "text"} value={formInstitution[key as keyof InstitutionMerchantProfile] ?? ""} onChange={(e) => handleInstitutionChange(key as keyof InstitutionMerchantProfile, e.target.value)} className={inputClass} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <button onClick={() => setShowEditModal(false)} disabled={submitProfileUpdateMutation.isPending} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200">
                                    Cancel
                                </button>
                                <button onClick={handleSave} disabled={submitProfileUpdateMutation.isPending} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50">
                                    {submitProfileUpdateMutation.isPending ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                                    ) : (
                                        "Submit Request"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}