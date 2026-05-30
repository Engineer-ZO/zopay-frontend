"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Edit, X, Loader2, User, Lock, ImagePlus, Trash2 } from "lucide-react";
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

function ProfileField({ label, value }: { label: string; value?: string | null }) {
    const v = value?.trim();
    return (
        <div>
            <p className="text-[10px] font-medium text-muted-foreground mb-1.5">{label}</p>
            <p className="text-xs font-semibold text-foreground wrap-break-word">{v ? v : "—"}</p>
        </div>
    );
}

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
            // Fall back to signed file resolution for older payloads.
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
            console.error("Failed to update profile:", error);
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
            console.error("Failed to change password:", error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-crimson-red-500" />
            </div>
        );
    }

    if (!merchant) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-muted-foreground">No merchant data available</p>
            </div>
        );
    }

    const inputClass =
        "w-full px-3 py-1.5 bg-muted border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-crimson-red-500";

    return (
        <div className="space-y-6 pt-4 pl-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-foreground">Profile</h1>
                    <p className="text-xs text-muted-foreground mt-1">
                        View your account details. Edits are submitted for admin approval.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowEditModal(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-crimson-red-500 hover:bg-crimson-red-600 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                    <Edit className="w-3.5 h-3.5" />
                    Request changes
                </button>
            </div>

            <div className="bg-background rounded-xl p-5 border border-border">
                <div className="flex items-center gap-4 mb-5">
                    {/* Logo section */}
                    <div className="relative shrink-0">
                        {logoUrl ? (
                            <img
                                src={logoUrl}
                                alt={merchant.businessName}
                                className="w-16 h-16 rounded-xl object-cover border border-border"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-xl bg-crimson-red-500 flex items-center justify-center text-white font-semibold text-lg">
                                {initials}
                            </div>
                        )}
                        {/* Upload overlay button */}
                        <button
                            type="button"
                            title="Upload logo"
                            onClick={() => logoInputRef.current?.click()}
                            disabled={uploadLogoMutation.isPending || removeLogoMutation.isPending}
                            className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-crimson-red-500 hover:bg-crimson-red-600 border-2 border-background flex items-center justify-center transition-colors disabled:opacity-50"
                        >
                            <ImagePlus className="w-3 h-3 text-white" />
                        </button>
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
                                    toast.error("Logo upload failed", {
                                        description: err instanceof Error ? err.message : "Please try again",
                                    });
                                } finally {
                                    e.target.value = "";
                                }
                            }}
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                            {merchantKindLabel(kind)}
                        </p>
                        <h2 className="text-base font-bold text-foreground">{merchant.businessName}</h2>
                        <p className="text-xs text-muted-foreground">{merchant.email}</p>
                        {merchant.logoFileId ? (
                            <button
                                type="button"
                                onClick={async () => {
                                    try {
                                        await removeLogoMutation.mutateAsync();
                                        toast.success("Logo removed");
                                    } catch (err) {
                                        toast.error("Failed to remove logo", {
                                            description: err instanceof Error ? err.message : "Please try again",
                                        });
                                    }
                                }}
                                disabled={removeLogoMutation.isPending || uploadLogoMutation.isPending}
                                className="mt-1 inline-flex items-center gap-1 text-[10px] text-red-500 hover:text-red-600 disabled:opacity-50"
                            >
                                <Trash2 className="w-2.5 h-2.5" />
                                {removeLogoMutation.isPending ? "Removing..." : "Remove logo"}
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => logoInputRef.current?.click()}
                                disabled={uploadLogoMutation.isPending}
                                className="mt-1 inline-flex items-center gap-1 text-[10px] text-crimson-red-500 hover:text-crimson-red-600 disabled:opacity-50"
                            >
                                <ImagePlus className="w-2.5 h-2.5" />
                                {uploadLogoMutation.isPending ? "Uploading..." : "Upload logo"}
                            </button>
                        )}
                    </div>
                </div>

                <h3 className="text-xs font-semibold text-foreground mb-3 pb-2 border-b border-border">Account</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <ProfileField label="Merchant ID" value={merchant.id} />
                    <ProfileField label="Merchant kind" value={merchantKindLabel(kind)} />
                    <ProfileField label="Business name" value={merchant.businessName} />
                    <ProfileField label="Business type" value={merchant.businessType} />
                    <ProfileField label="Email" value={merchant.email} />
                    <ProfileField label="Phone" value={merchant.phone} />
                    <ProfileField label="Country" value={merchant.country} />
                    <ProfileField label="Rate limit" value={`${merchant.rateLimitPerMinute} requests/minute`} />
                    <ProfileField label="Fee payer" value={merchant.feePayer} />
                    <ProfileField label="Allowed IPs" value={merchant.allowedIps?.join(", ")} />
                    <ProfileField label="Created at" value={merchant.createdAt ? new Date(merchant.createdAt).toLocaleString() : undefined} />
                    <ProfileField label="Updated at" value={merchant.updatedAt ? new Date(merchant.updatedAt).toLocaleString() : undefined} />
                </div>

                {kind === "INDIVIDUAL" && (
                    <>
                        <h3 className="text-xs font-semibold text-foreground mb-3 pb-2 border-b border-border">
                            Individual details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ProfileField label="First name" value={individual.firstName} />
                            <ProfileField label="Last name" value={individual.lastName} />
                            <ProfileField label="Date of birth" value={individual.dateOfBirth} />
                            <ProfileField label="Gender" value={individual.gender} />
                            <ProfileField label="Phone (profile)" value={individual.phone} />
                            <ProfileField label="Address" value={individual.address} />
                            <ProfileField label="ID type" value={individual.idType} />
                            <ProfileField label="ID number" value={individual.idNumber} />
                            <ProfileField label="NIU" value={individual.niu} />
                            <ProfileField label="Doing business as (DBA)" value={individual.doingBusinessAs} />
                        </div>
                    </>
                )}

                {isInstitutionKind(kind) && (
                    <>
                        <h3 className="text-xs font-semibold text-foreground mb-3 pb-2 border-b border-border mt-6">
                            {kind === "COMPANY" && "Company details"}
                            {kind === "ASSOCIATION" && "Association details"}
                            {kind === "GROUP" && "Group details"}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ProfileField label="Institution name" value={institution.institutionName} />
                            <ProfileField label="Registration number" value={institution.registrationNumber} />
                            <ProfileField label="Date of creation" value={institution.dateOfCreation} />
                            <ProfileField label="NIU" value={institution.niu} />
                            <ProfileField label="Manager name" value={institution.managerName} />
                            <ProfileField label="Manager contact" value={institution.managerContact} />
                            <ProfileField label="Manager address" value={institution.managerAddress} />
                            <ProfileField label="Address" value={institution.address} />
                            <ProfileField label="Contact phone" value={institution.contactPhone} />
                            <ProfileField label="Contact email" value={institution.contactEmail} />
                        </div>
                    </>
                )}
            </div>

            <div className="bg-background rounded-xl p-5 border border-border">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-crimson-red-500/10 flex items-center justify-center">
                        <Lock className="w-4 h-4 text-crimson-red-500" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-foreground">Change Password</h3>
                        <p className="text-xs text-muted-foreground">You will be logged out after a successful password change.</p>
                    </div>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-3">
                    <div>
                        <label className="text-[10px] font-medium text-foreground mb-1.5 block">Current Password</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-crimson-red-500"
                            placeholder="Enter current password"
                            disabled={changePasswordMutation.isPending || logoutMutation.isPending}
                            required
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-medium text-foreground mb-1.5 block">New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-crimson-red-500"
                            placeholder="Enter new password"
                            minLength={6}
                            disabled={changePasswordMutation.isPending || logoutMutation.isPending}
                            required
                        />
                        <p className="mt-1 text-[10px] text-muted-foreground">Minimum 6 characters.</p>
                    </div>

                    <div>
                        <label className="text-[10px] font-medium text-foreground mb-1.5 block">Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-crimson-red-500"
                            placeholder="Re-enter new password"
                            minLength={6}
                            disabled={changePasswordMutation.isPending || logoutMutation.isPending}
                            required
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={changePasswordMutation.isPending || logoutMutation.isPending}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-crimson-red-500 hover:bg-crimson-red-600 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {changePasswordMutation.isPending || logoutMutation.isPending ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                "Update Password"
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-background rounded-xl p-5 border border-border">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-semibold text-foreground">PREFERENCES</h3>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-medium text-muted-foreground mb-1">Language</p>
                        <p className="text-xs text-foreground">Choose your preferred language</p>
                    </div>
                    <LanguageSwitcher showLabel={true} />
                </div>
            </div>

            <div className="bg-background rounded-xl p-5 border border-border">
                <h3 className="text-xs font-semibold text-foreground mb-3">ACCOUNT STATUS</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                        <p className="text-[10px] font-medium text-muted-foreground mb-1">KYB Status</p>
                        <p
                            className={`text-xs font-semibold ${
                                merchant.kycStatus === "APPROVED"
                                    ? "text-green-600 dark:text-green-400"
                                    : merchant.kycStatus === "PENDING"
                                      ? "text-crimson-red-600 dark:text-crimson-red-400"
                                      : merchant.kycStatus === "REJECTED"
                                        ? "text-red-600 dark:text-red-400"
                                        : "text-muted-foreground"
                            }`}
                        >
                            {merchant.kycStatus}
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] font-medium text-muted-foreground mb-1">Sandbox Status</p>
                        <p
                            className={`text-xs font-semibold ${
                                merchant.sandboxState === "ACTIVE" ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                            }`}
                        >
                            {merchant.sandboxState}
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] font-medium text-muted-foreground mb-1">Production Status</p>
                        <p
                            className={`text-xs font-semibold ${
                                merchant.productionState === "ACTIVE"
                                    ? "text-green-600 dark:text-green-400"
                                    : merchant.productionState === "PENDING_APPROVAL"
                                      ? "text-crimson-red-600 dark:text-crimson-red-400"
                                      : "text-muted-foreground"
                            }`}
                        >
                            {merchant.productionState}
                        </p>
                    </div>
                </div>
            </div>

            {showEditModal && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    onClick={() => setShowEditModal(false)}
                >
                    <div
                        className="bg-background rounded-2xl p-6 shadow-2xl border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-crimson-red-500/10 flex items-center justify-center">
                                    <User className="w-4 h-4 text-crimson-red-500" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-foreground">Request profile changes</h3>
                                    <p className="text-[10px] text-muted-foreground">
                                        {merchantKindLabel(kind)} · Submitted for admin review
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowEditModal(false)}
                                className="p-1 hover:bg-muted rounded transition-colors"
                                aria-label="Close modal"
                            >
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h4 className="text-xs font-semibold text-foreground mb-3">Account</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-medium text-foreground mb-1.5 block">Business name *</label>
                                        <input
                                            type="text"
                                            value={formMerchant.businessName}
                                            onChange={(e) => handleMerchantChange("businessName", e.target.value)}
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-medium text-foreground mb-1.5 block">Business type</label>
                                        {kind === "LEGACY" ? (
                                            <select
                                                value={formMerchant.businessType}
                                                onChange={(e) => handleMerchantChange("businessType", e.target.value)}
                                                className={inputClass}
                                            >
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
                                        <label className="text-[10px] font-medium text-foreground mb-1.5 block">Email *</label>
                                        <input
                                            type="email"
                                            value={formMerchant.email}
                                            onChange={(e) => handleMerchantChange("email", e.target.value)}
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-medium text-foreground mb-1.5 block">Phone *</label>
                                        <input
                                            type="tel"
                                            value={formMerchant.phone}
                                            onChange={(e) => handleMerchantChange("phone", e.target.value)}
                                            className={inputClass}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-medium text-foreground mb-1.5 block">Country *</label>
                                        <input
                                            type="text"
                                            value={formMerchant.country}
                                            onChange={(e) => handleMerchantChange("country", e.target.value)}
                                            className={inputClass}
                                        />
                                    </div>
                                </div>
                            </div>

                            {kind === "INDIVIDUAL" && (
                                <div>
                                    <h4 className="text-xs font-semibold text-foreground mb-3">Individual details</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {(
                                            [
                                                ["firstName", "First name"],
                                                ["lastName", "Last name"],
                                                ["dateOfBirth", "Date of birth"],
                                                ["gender", "Gender"],
                                                ["phone", "Phone (profile)"],
                                                ["address", "Address"],
                                                ["idType", "ID type"],
                                                ["idNumber", "ID number"],
                                                ["niu", "NIU"],
                                                ["doingBusinessAs", "Doing business as (DBA)"],
                                            ] as const
                                        ).map(([key, label]) => (
                                            <div key={key} className={key === "address" ? "md:col-span-2" : undefined}>
                                                <label className="text-[10px] font-medium text-foreground mb-1.5 block">{label}</label>
                                                <input
                                                    type="text"
                                                    value={formIndividual[key] ?? ""}
                                                    onChange={(e) => handleIndividualChange(key, e.target.value)}
                                                    className={inputClass}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {isInstitutionKind(kind) && (
                                <div>
                                    <h4 className="text-xs font-semibold text-foreground mb-3">
                                        {kind === "COMPANY" && "Company details"}
                                        {kind === "ASSOCIATION" && "Association details"}
                                        {kind === "GROUP" && "Group details"}
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {(
                                            [
                                                ["institutionName", "Institution name"],
                                                ["registrationNumber", "Registration number"],
                                                ["dateOfCreation", "Date of creation"],
                                                ["niu", "NIU"],
                                                ["managerName", "Manager name"],
                                                ["managerContact", "Manager contact"],
                                                ["managerAddress", "Manager address"],
                                                ["address", "Address"],
                                                ["contactPhone", "Contact phone"],
                                                ["contactEmail", "Contact email"],
                                            ] as const
                                        ).map(([key, label]) => (
                                            <div
                                                key={key}
                                                className={
                                                    key === "managerAddress" || key === "address" ? "md:col-span-2" : undefined
                                                }
                                            >
                                                <label className="text-[10px] font-medium text-foreground mb-1.5 block">{label}</label>
                                                <input
                                                    type={key === "contactEmail" ? "email" : "text"}
                                                    value={formInstitution[key] ?? ""}
                                                    onChange={(e) => handleInstitutionChange(key, e.target.value)}
                                                    className={inputClass}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-3 border-t border-border">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    disabled={submitProfileUpdateMutation.isPending}
                                    className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-xs font-semibold hover:bg-muted transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={submitProfileUpdateMutation.isPending}
                                    className="flex-1 px-3 py-2 bg-crimson-red-500 hover:bg-crimson-red-600 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {submitProfileUpdateMutation.isPending ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        "Submit request"
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
