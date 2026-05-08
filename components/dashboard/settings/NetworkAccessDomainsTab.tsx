"use client";

import { useState } from "react";
import {
    Globe,
    Plus,
    CheckCircle2,
    Clock,
    X,
    Loader2,
    AlertCircle,
    Trash2,
    XCircle,
    Info,
} from "lucide-react";
import { toast } from "sonner";
import { useUserMerchantData } from "@/features/merchants/context/MerchantContext";
import { useGetDomains, useAddDomain, useDeleteDomain } from "@/features/merchants/hooks/useDomains";
import type { Domain } from "@/features/merchants/types/index";

export function NetworkAccessDomainsTab() {
    const { merchantId } = useUserMerchantData();
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
    const [domainInput, setDomainInput] = useState("");
    const [domainError, setDomainError] = useState<string | null>(null);

    const { data: domainsData, isLoading: isLoadingDomains } = useGetDomains(
        merchantId || "",
        !!merchantId
    );

    const domains = domainsData?.domains || [];
    /** Product rule: one domain per merchant account */
    const DOMAIN_LIMIT = 1;
    const atDomainLimit = domains.length >= DOMAIN_LIMIT;
    const canAddDomain = !atDomainLimit;

    const addDomainMutation = useAddDomain(merchantId || "");
    const deleteDomainMutation = useDeleteDomain(merchantId || "");

    const getStatusConfig = (status: Domain["status"]) => {
        switch (status) {
            case "APPROVED":
                return {
                    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
                    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
                    label: "Verified",
                };
            case "PENDING":
                return {
                    color: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
                    icon: <Clock className="w-3.5 h-3.5" />,
                    label: "Pending Review",
                };
            case "REJECTED":
                return {
                    color: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
                    icon: <XCircle className="w-3.5 h-3.5" />,
                    label: "Rejected",
                };
            default:
                return {
                    color: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20",
                    icon: <Clock className="w-3.5 h-3.5" />,
                    label: "Pending",
                };
        }
    };

    const validateDomain = (domain: string): boolean => {
        const cleaned = domain.trim().replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];

        const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;

        if (!cleaned) {
            setDomainError("Domain cannot be empty");
            return false;
        }

        if (!domainRegex.test(cleaned)) {
            setDomainError("Invalid domain format. Please enter a valid domain (e.g., example.com)");
            return false;
        }

        setDomainError(null);
        return true;
    };

    const handleAddDomain = async () => {
        if (!merchantId) {
            toast.error("Merchant ID not found");
            return;
        }

        if (domains.length >= DOMAIN_LIMIT) {
            toast.error("Domain limit reached", {
                description: "You can only register one domain. Remove the existing entry to add another.",
            });
            return;
        }

        const cleanedDomain = domainInput.trim().replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];

        if (!validateDomain(cleanedDomain)) {
            return;
        }

        try {
            await addDomainMutation.mutateAsync({ domain: cleanedDomain });

            toast.success("Domain submitted successfully!", {
                description: "Your domain is now pending admin approval.",
            });

            setShowAddModal(false);
            setDomainInput("");
            setDomainError(null);
        } catch (error: unknown) {
            const errorMessage = (error as { response?: { data?: { message?: string }; status?: number }; message?: string })?.response?.data?.message || (error as { message?: string })?.message || "Failed to add domain";

            toast.error("Failed to add domain", {
                description: errorMessage,
            });
        }
    };

    const handleDeleteDomain = async () => {
        if (!selectedDomain || !merchantId) return;

        try {
            await deleteDomainMutation.mutateAsync(selectedDomain.id);

            toast.success("Domain removed successfully");
            setShowDeleteModal(false);
            setSelectedDomain(null);
        } catch (error: unknown) {
            const errorMessage = (error as { response?: { data?: { message?: string }; status?: number }; message?: string })?.response?.data?.message || (error as { message?: string })?.message || "Failed to delete domain";

            toast.error("Failed to delete domain", {
                description: errorMessage,
            });
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h2 className="text-lg font-semibold text-foreground">Domains</h2>
                    <p className="text-xs text-muted-foreground mt-1">
                        Add one domain for production API use (1 domain per account)
                    </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                    {canAddDomain ? (
                        <button
                            type="button"
                            onClick={() => {
                                setShowAddModal(true);
                                setDomainInput("");
                                setDomainError(null);
                            }}
                            className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add Domain
                        </button>
                    ) : (
                        <span className="text-xs font-medium text-muted-foreground px-3 py-2 rounded-lg bg-muted/60 border border-border">
                            1 of 1 domain used
                        </span>
                    )}
                </div>
            </div>

            {atDomainLimit && !isLoadingDomains && (
                <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Limit reached.</span>{" "}
                    You can only have one domain. To register a different domain, remove the current one first (when removal is
                    allowed).
                </div>
            )}

            {isLoadingDomains ? (
                <div className="bg-background rounded-xl border border-border p-12 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
            ) : domains.length === 0 ? (
                <div className="bg-background rounded-xl border border-border p-12 text-center">
                    <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm font-medium text-foreground mb-1">No domains added yet</p>
                    <p className="text-xs text-muted-foreground">
                        Add your domain to get started (one per account)
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {domains.map((domain) => {
                        const statusConfig = getStatusConfig(domain.status);

                        return (
                            <div
                                key={domain.id}
                                className="bg-background rounded-xl border border-border p-6 hover:shadow-md transition-all"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <Globe className="w-5 h-5 text-muted-foreground" />
                                            <h3 className="text-base font-bold text-foreground">{domain.domain}</h3>
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.color}`}
                                            >
                                                {statusConfig.icon}
                                                {statusConfig.label}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-6 text-xs text-muted-foreground">
                                            <p>Added: {formatDate(domain.createdAt)}</p>

                                            {domain.status === "APPROVED" && domain.verifiedAt && (
                                                <p>Verified: {formatDate(domain.verifiedAt)}</p>
                                            )}

                                            {domain.status === "REJECTED" && domain.reviewedAt && (
                                                <p>Reviewed: {formatDate(domain.reviewedAt)}</p>
                                            )}
                                        </div>

                                        {domain.status === "REJECTED" && domain.rejectionReason && (
                                            <div className="mt-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-3 text-xs">
                                                <p className="font-semibold text-red-700 dark:text-red-400 mb-1 flex items-center gap-1.5">
                                                    <AlertCircle className="w-3.5 h-3.5" />
                                                    Rejection Reason:
                                                </p>
                                                <p className="text-red-600 dark:text-red-300">
                                                    {domain.rejectionReason}
                                                </p>
                                            </div>
                                        )}

                                        {domain.status === "PENDING" && (
                                            <div className="mt-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
                                                <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                                <p>This domain is waiting for admin approval. Once approved, you can use it for production API requests.</p>
                                            </div>
                                        )}
                                    </div>

                                    {(domain.status === "PENDING" || domain.status === "REJECTED") && (
                                        <button
                                            onClick={() => {
                                                setSelectedDomain(domain);
                                                setShowDeleteModal(true);
                                            }}
                                            className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                                            title="Delete domain"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-background rounded-xl border border-border shadow-2xl max-w-md w-full">
                        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-foreground">Add Domain</h3>
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setDomainInput("");
                                    setDomainError(null);
                                }}
                                className="p-1 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-medium text-foreground mb-2 block">
                                    Domain Name *
                                </label>
                                <input
                                    type="text"
                                    placeholder="example.com"
                                    value={domainInput}
                                    onChange={(e) => {
                                        setDomainInput(e.target.value);
                                        setDomainError(null);
                                    }}
                                    className={`w-full px-4 py-2.5 bg-muted/20 border rounded-lg text-sm transition-colors outline-none ${domainError
                                            ? "border-red-500 focus:border-red-500"
                                            : "border-border hover:border-primary/50 focus:border-primary"
                                        }`}
                                />
                                {domainError && (
                                    <p className="text-xs text-red-600 dark:text-red-400 mt-1.5 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {domainError}
                                    </p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1.5">
                                    Enter your domain without http:// or https://
                                </p>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                                <p className="text-xs font-medium text-foreground mb-1 flex items-center gap-1.5">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    Admin Approval Required
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Newly added domains must be approved by an administrator before they can be used.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setDomainInput("");
                                        setDomainError(null);
                                    }}
                                    className="flex-1 px-4 py-2.5 bg-background border border-border rounded-lg text-sm font-semibold hover:bg-muted transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddDomain}
                                    disabled={addDomainMutation.isPending || !domainInput.trim()}
                                    className="flex-1 px-4 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {addDomainMutation.isPending ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        "Submit for Approval"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && selectedDomain && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-background rounded-xl border border-border shadow-2xl max-w-sm w-full">
                        <div className="p-6 text-center">
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">Delete Domain?</h3>
                            <p className="text-sm text-muted-foreground mb-6">
                                Are you sure you want to delete <strong>{selectedDomain.domain}</strong>? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 px-4 py-2.5 bg-background border border-border rounded-lg text-sm font-semibold hover:bg-muted transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteDomain}
                                    disabled={deleteDomainMutation.isPending}
                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    {deleteDomainMutation.isPending ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        "Delete"
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
