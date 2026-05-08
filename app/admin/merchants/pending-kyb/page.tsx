"use client";

import { useState } from "react";
import {
    Search,
    Filter,
    Download,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Layers,
    ShieldCheck,
    Building2,
    Mail,
    Globe,
    FileText,
    Eye,
    FileCheck,
    FileWarning,
    MessageSquare,
    Rocket,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetPendingKYBSubmissions, useApproveProduction, useApproveKYB } from "@/features/merchants/hooks/useMerchant";
import { useUpdateKYCDocumentStatus } from "@/features/files/hooks";
import type { KYBSubmission } from "@/features/merchants/types/index";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function PendingKYBPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMerchant, setSelectedMerchant] = useState<KYBSubmission | null>(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [rejectingDocId, setRejectingDocId] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [isProductionConfirmOpen, setIsProductionConfirmOpen] = useState(false);
    const [productionMerchant, setProductionMerchant] = useState<KYBSubmission | null>(null);

    // Fetch pending KYB submissions
    const { data, isLoading, error, refetch } = useGetPendingKYBSubmissions();
    const submissions = data?.submissions || [];

    // Query client for invalidation
    const queryClient = useQueryClient();

    // KYB approval mutation
    const { mutate: approveKYBMutation, isPending: isApprovingKYB } = useApproveKYB(
        selectedMerchant?.id || ''
    );

    // Production approval mutation
    const { mutate: approveProductionMutation, isPending: isApprovingProduction } = useApproveProduction(
        productionMerchant?.id || ''
    );

    console.log(submissions);
    const openReviewModal = (merchant: KYBSubmission) => {
        setSelectedMerchant(merchant);
        setIsReviewModalOpen(true);
    };

    const closeReviewModal = () => {
        setIsReviewModalOpen(false);
        setSelectedMerchant(null);
        setRejectingDocId(null);
        setRejectionReason("");
    };

    const openProductionConfirm = (merchant: KYBSubmission) => {
        setProductionMerchant(merchant);
        setIsProductionConfirmOpen(true);
    };

    const closeProductionConfirm = () => {
        setIsProductionConfirmOpen(false);
        setProductionMerchant(null);
    };

    const handleApproveKYB = () => {
        if (!selectedMerchant) return;

        approveKYBMutation(undefined, {
            onSuccess: () => {
                toast.success(`KYB approved for ${selectedMerchant.merchant.businessName}`);
                // Invalidate queries to refresh data
                queryClient.invalidateQueries({ queryKey: ['pending-kyb-submissions'] });
                queryClient.invalidateQueries({ queryKey: ['merchants'] });
                refetch();
            },
            onError: (error: Error) => {
                toast.error(error.message || 'Failed to approve KYB');
            },
        });
    };

    const handleGrantProduction = () => {
        if (!productionMerchant) return;

        approveProductionMutation(undefined, {
            onSuccess: () => {
                toast.success(`Production access granted to ${productionMerchant.merchant.businessName}`);
                // Invalidate queries to refresh data
                queryClient.invalidateQueries({ queryKey: ['pending-kyb-submissions'] });
                queryClient.invalidateQueries({ queryKey: ['merchants'] });
                closeProductionConfirm();
                closeReviewModal();
            },
            onError: (error: Error) => {
                toast.error(error.message || 'Failed to grant production access');
            },
        });
    };

    // Check if at least one document is approved
    const hasApprovedDocuments = selectedMerchant?.documents.some(doc => doc.reviewStatus === 'APPROVED') || false;
    const isKYBApproved = selectedMerchant?.merchant.kycStatus === 'APPROVED';

    // Skeleton Loader Component
    const SkeletonCard = () => (
        <div className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl shrink-0" />
                    <div className="flex-1">
                        <div className="h-5 bg-gray-200 rounded w-48 mb-2" />
                        <div className="h-4 bg-gray-100 rounded w-64" />
                    </div>
                </div>
                <div className="flex items-center gap-8">
                    <div className="h-12 bg-gray-100 rounded w-32" />
                    <div className="h-12 bg-gray-100 rounded w-32" />
                </div>
                <div className="flex gap-3">
                    <div className="h-10 bg-gray-200 rounded-lg w-32" />
                    <div className="h-10 bg-gray-200 rounded-lg w-20" />
                </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded-xl" />
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-6 pb-12">
            {/* Header Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Clock className="w-6 h-6 text-blue-600" />
                        Pending KYB Review
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">Review and approve merchant business documentation</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search merchants..."
                            className="pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-64 text-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors">
                        <Filter className="w-4 h-4" />
                        Filter
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Summary Banner */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
                            <Layers className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-medium text-gray-500">Total Pending</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        {isLoading ? (
                            <div className="h-6 w-12 bg-gray-200 rounded animate-pulse" />
                        ) : (
                            <>
                                <span className="text-xl font-bold text-gray-900">{submissions.length}</span>
                                <span className="text-[10px] text-blue-600 font-medium">submissions</span>
                            </>
                        )}
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-orange-50 rounded-lg text-orange-600">
                            <AlertCircle className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-medium text-gray-500">Oldest Submission</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        {isLoading ? (
                            <div className="h-6 w-12 bg-gray-200 rounded animate-pulse" />
                        ) : submissions.length > 0 ? (
                            <>
                                <span className="text-xl font-bold text-gray-900">
                                    {Math.max(...submissions.map(s => s.ageInDays))}d
                                </span>
                                <span className="text-[10px] text-orange-600 font-medium">Needs attention</span>
                            </>
                        ) : (
                            <span className="text-xs text-gray-400">No data</span>
                        )}
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-green-50 rounded-lg text-green-600">
                            <CheckCircle className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-medium text-gray-500">Avg. Review Time</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-gray-900">1.2d</span>
                        <span className="text-[10px] text-green-600 font-medium">Optimized</span>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-purple-50 rounded-lg text-purple-600">
                            <ShieldCheck className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-medium text-gray-500">Approved Today</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-gray-900">8</span>
                        <span className="text-[10px] text-purple-600 font-medium">Target: 10</span>
                    </div>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-red-900 mb-2">Failed to Load Submissions</h3>
                    <p className="text-xs text-red-700">{error.message}</p>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && submissions.length === 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">All Caught Up!</h3>
                    <p className="text-xs text-gray-500">No pending KYB submissions at the moment.</p>
                </div>
            )}

            {/* Submission Cards */}
            {!isLoading && !error && submissions.length > 0 && (
                <div className="space-y-3">
                    {submissions.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="group bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all duration-300 overflow-hidden"
                        >
                            <div className="p-4">
                                {/* Header Section */}
                                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                                    {/* Left: Merchant Info */}
                                    <div className="flex gap-3 flex-1">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${item.priority === 'urgent' ? 'bg-red-50 text-red-600' :
                                            item.priority === 'attention' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                                            }`}>
                                            <Building2 className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-gray-900 text-sm truncate">{item.merchant.businessName}</h3>
                                                {item.isResubmission && (
                                                    <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-semibold rounded-full border border-blue-200 shrink-0">
                                                        Resubmission
                                                    </span>
                                                )}
                                            </div>
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                                    <Mail className="w-3 h-3 text-gray-400" />
                                                    <span>{item.merchant.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                                        <Globe className="w-3 h-3 text-gray-400" />
                                                        <span>{item.merchant.country} ({item.merchant.countryCode})</span>
                                                    </div>
                                                    <span className="px-1 py-0.5 font-mono text-[10px] bg-gray-100 text-gray-600 rounded border border-gray-200">
                                                        {item.id}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Stats & Actions */}
                                    <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-start gap-3">
                                        {/* Stats Cards */}
                                        <div className="flex gap-2">
                                            {/* Submission Age */}
                                            <div className="bg-gray-50 rounded-lg px-2.5 py-1.5 border border-gray-200 min-w-[100px]">
                                                <div className="flex items-center gap-1.5 mb-0.5">
                                                    <Clock className={`w-3 h-3 ${item.ageInDays >= 5 ? 'text-red-500' : 'text-gray-400'}`} />
                                                    <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Submitted</span>
                                                </div>
                                                <p className={`text-xs font-bold ${item.ageInDays >= 5 ? 'text-red-600' : 'text-gray-900'}`}>
                                                    {item.ageInDays} day{item.ageInDays !== 1 ? 's' : ''} ago
                                                </p>
                                            </div>

                                            {/* Documents Count */}
                                            <div className="bg-blue-50 rounded-lg px-2.5 py-1.5 border border-blue-200 min-w-[100px]">
                                                <div className="flex items-center gap-1.5 mb-0.5">
                                                    <FileText className="w-3 h-3 text-blue-600" />
                                                    <span className="text-[10px] font-medium text-blue-700 uppercase tracking-wide">Documents</span>
                                                </div>
                                                <p className="text-xs font-bold text-blue-900">
                                                    {item.documents.length} Uploaded
                                                </p>
                                            </div>
                                        </div>

                                        {/* Priority Badge */}
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border ${item.priority === 'urgent' ? 'bg-red-50 text-red-700 border-red-200' :
                                                item.priority === 'attention' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                    'bg-green-50 text-green-700 border-green-200'
                                                }`}>
                                                {item.priority.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Row */}
                                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => openReviewModal(item)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all text-xs shadow-sm hover:shadow-md"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            Review Docs
                                        </button>

                                        {/* All Approved Indicator */}
                                        {item.documents.every(doc => doc.reviewStatus === 'APPROVED') && (
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 rounded-full border border-green-200 animate-pulse">
                                                <CheckCircle className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-bold uppercase tracking-wide">Ready for Approval</span>
                                            </div>
                                        )}

                                        {/* Grant Production Button - Always Visible */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openProductionConfirm(item);
                                            }}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all text-xs shadow-sm hover:shadow-md"
                                        >
                                            <Rocket className="w-3.5 h-3.5" />
                                            Grant Production
                                        </button>
                                    </div>
                                </div>

                                {/* Document List Preview */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {item.documents.map((doc) => (
                                        <div
                                            key={doc.id}
                                            className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${doc.reviewStatus === 'APPROVED' ? 'bg-green-50 border-green-200' :
                                                doc.reviewStatus === 'REJECTED' ? 'bg-red-50 border-red-200' :
                                                    'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                                }`}
                                        >
                                            {doc.reviewStatus === 'APPROVED' ? (
                                                <FileCheck className="w-6 h-6 text-green-600 bg-green-100 p-1 rounded-md shrink-0" />
                                            ) : doc.reviewStatus === 'REJECTED' ? (
                                                <FileWarning className="w-6 h-6 text-red-600 bg-red-100 p-1 rounded-md shrink-0" />
                                            ) : doc.status === 'valid' ? (
                                                <FileCheck className="w-6 h-6 text-blue-600 bg-blue-100 p-1 rounded-md shrink-0" />
                                            ) : (
                                                <FileWarning className="w-6 h-6 text-orange-600 bg-orange-100 p-1 rounded-md shrink-0" />
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs font-semibold text-gray-900 truncate">{doc.type}</p>
                                                    {doc.reviewStatus === 'APPROVED' && <CheckCircle className="w-3 h-3 text-green-600" />}
                                                </div>
                                                <p className="text-[10px] text-gray-500 truncate">{doc.name}</p>
                                                <p className="text-[10px] text-gray-400 mt-0.5">{doc.size}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Admin Note Preview */}
                                {item.notes && (
                                    <div className="mt-3 flex items-start gap-2 bg-blue-50 p-2 rounded-lg border border-blue-200">
                                        <MessageSquare className="w-3 h-3 text-blue-600 mt-0.5 shrink-0" />
                                        <p className="text-xs text-blue-800 font-medium">&quot;{item.notes}&quot;</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Load More */}
            <div className="flex justify-center mt-6">
                <button className="px-6 py-2 bg-white border border-gray-200 text-gray-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-xs">
                    Load More Submissions
                </button>
            </div>

            {/* Review Modal */}
            <AnimatePresence>
                {isReviewModalOpen && selectedMerchant && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeReviewModal}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-5xl bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Modal Header */}
                            <div className="p-4 border-b border-gray-200 flex items-center justify-between shrink-0 bg-white">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                                        <Building2 className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-bold text-gray-900">{selectedMerchant.merchant.businessName}</h2>
                                        <p className="text-xs text-gray-500 font-mono">{selectedMerchant.id}</p>
                                    </div>
                                    <div className="h-6 w-px bg-gray-200 mx-2" />
                                    <div className="text-xs">
                                        <p className="text-gray-500 text-[10px]">Submitted On</p>
                                        <p className="text-gray-900 font-medium">{new Date(selectedMerchant.submittedAt).toLocaleDateString()} at {new Date(selectedMerchant.submittedAt).toLocaleTimeString()}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={closeReviewModal}
                                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <XCircle className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            {/* Modal Content - Scrollable */}
                            <div className="flex-1 overflow-y-auto w-full">
                                <div className="p-4 space-y-4">
                                    {/* Documents List with Actions */}
                                    <div>
                                        <h3 className="text-xs font-bold text-gray-900 mb-3">Review Documents</h3>
                                        <div className="space-y-3">
                                            {selectedMerchant.documents.map((doc) => {
                                                const DocumentActions = () => {
                                                    const { mutate: updateStatus, isPending } = useUpdateKYCDocumentStatus(doc.id);

                                                    const handleApprove = () => {
                                                        updateStatus(
                                                            { status: 'APPROVED' },
                                                            {
                                                                onSuccess: () => {
                                                                    toast.success(`${doc.type} approved`);
                                                                    refetch();
                                                                },
                                                                onError: (error: Error) => {
                                                                    toast.error(error.message || 'Failed to approve document');
                                                                }
                                                            }
                                                        );
                                                    };

                                                    const handleReject = () => {
                                                        if (!rejectionReason.trim()) {
                                                            toast.error('Please provide a rejection reason');
                                                            return;
                                                        }

                                                        updateStatus(
                                                            {
                                                                status: 'REJECTED',
                                                                rejectionReason: rejectionReason
                                                            },
                                                            {
                                                                onSuccess: () => {
                                                                    toast.success(`${doc.type} rejected`);
                                                                    setRejectingDocId(null);
                                                                    setRejectionReason('');
                                                                    refetch();
                                                                },
                                                                onError: (error: Error) => {
                                                                    toast.error(error.message || 'Failed to reject document');
                                                                }
                                                            }
                                                        );
                                                    };

                                                    return (
                                                        <div className="flex flex-col gap-2">
                                                            {rejectingDocId === doc.id ? (
                                                                <div className="space-y-2">
                                                                    <textarea
                                                                        value={rejectionReason}
                                                                        onChange={(e) => setRejectionReason(e.target.value)}
                                                                        placeholder="Why are you rejecting this document?"
                                                                        className="w-full p-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                                                                        rows={2}
                                                                    />
                                                                    <div className="flex gap-2">
                                                                        <button
                                                                            onClick={handleReject}
                                                                            disabled={isPending}
                                                                            className="flex-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                                                                        >
                                                                            {isPending ? 'Rejecting...' : 'Confirm Reject'}
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                setRejectingDocId(null);
                                                                                setRejectionReason('');
                                                                            }}
                                                                            disabled={isPending}
                                                                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-colors"
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() => window.open(doc.url, '_blank')}
                                                                        className="flex-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                                                                    >
                                                                        <Eye className="w-3.5 h-3.5" />
                                                                        View
                                                                    </button>
                                                                    <button
                                                                        onClick={handleApprove}
                                                                        disabled={isPending || doc.reviewStatus === 'APPROVED'}
                                                                        className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 ${doc.reviewStatus === 'APPROVED'
                                                                            ? 'bg-green-100 text-green-800 cursor-not-allowed'
                                                                            : 'bg-green-50 hover:bg-green-100 text-green-700'
                                                                            }`}
                                                                    >
                                                                        <CheckCircle className="w-3.5 h-3.5" />
                                                                        {doc.reviewStatus === 'APPROVED' ? 'Approved' : isPending ? 'Approving...' : 'Approve'}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setRejectingDocId(doc.id)}
                                                                        disabled={isPending || doc.reviewStatus === 'APPROVED'}
                                                                        className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${doc.reviewStatus === 'APPROVED'
                                                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                            : 'bg-red-50 hover:bg-red-100 text-red-700'
                                                                            }`}
                                                                    >
                                                                        <XCircle className="w-3.5 h-3.5" />
                                                                        Reject
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                };

                                                return (
                                                    <div
                                                        key={doc.id}
                                                        className={`p-3 rounded-lg border transition-all ${doc.reviewStatus === 'APPROVED' ? 'bg-green-50 border-green-200' :
                                                            doc.reviewStatus === 'REJECTED' ? 'bg-red-50 border-red-200' :
                                                                'bg-white border-gray-200 hover:border-blue-300'
                                                            }`}
                                                    >
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                <FileText className={`w-4 h-4 shrink-0 ${doc.reviewStatus === 'APPROVED' ? 'text-green-600' :
                                                                    doc.reviewStatus === 'REJECTED' ? 'text-red-600' :
                                                                        'text-blue-600'
                                                                    }`} />
                                                                <div className="min-w-0 flex-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <p className="text-xs font-semibold text-gray-900 truncate">{doc.type}</p>
                                                                        {/* Status Badge */}
                                                                        {doc.reviewStatus === 'APPROVED' && (
                                                                            <span className="px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-medium border border-green-200">
                                                                                Approved
                                                                            </span>
                                                                        )}
                                                                        {doc.reviewStatus === 'REJECTED' && (
                                                                            <span className="px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-medium border border-red-200">
                                                                                Rejected
                                                                            </span>
                                                                        )}
                                                                        {doc.reviewStatus === 'PENDING' && (
                                                                            <span className="px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-medium border border-gray-200">
                                                                                Pending
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-[10px] text-gray-500 truncate">{doc.name}</p>
                                                                    <p className="text-[10px] text-gray-400 mt-0.5">{doc.size}</p>
                                                                </div>
                                                            </div>
                                                            {doc.reviewStatus === 'APPROVED' && <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />}
                                                            {doc.reviewStatus === 'REJECTED' && <XCircle className="w-4 h-4 text-red-600 shrink-0" />}
                                                            {(doc.reviewStatus === 'PENDING' || doc.reviewStatus === 'UNDER_REVIEW') && <AlertCircle className="w-4 h-4 text-gray-400 shrink-0" />}
                                                        </div>

                                                        <DocumentActions />

                                                        {doc.notes && doc.reviewStatus === 'REJECTED' && (
                                                            <div className="mt-2 text-xs text-red-600 bg-red-50/50 p-2 rounded border border-red-100">
                                                                <span className="font-semibold">Reason:</span> {doc.notes}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Footer Actions */}
                                    <div className="flex justify-between items-center pt-4 border-t border-gray-200 gap-3">
                                        <div className="flex gap-2">
                                            {/* Bulk Approve KYB Button - Show when at least one doc is approved but KYB is not approved */}
                                            {hasApprovedDocuments && !isKYBApproved && (
                                                <button
                                                    onClick={handleApproveKYB}
                                                    disabled={isApprovingKYB}
                                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all text-xs shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ShieldCheck className="w-4 h-4" />
                                                    {isApprovingKYB ? 'Approving KYB...' : 'Approve KYB'}
                                                </button>
                                            )}
                                            {/* Grant Production Access Button - Show only when KYB is approved */}
                                            {isKYBApproved && (
                                                <button
                                                    onClick={() => openProductionConfirm(selectedMerchant)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all text-xs shadow-sm hover:shadow-md"
                                                >
                                                    <Rocket className="w-4 h-4" />
                                                    Grant Production Access
                                                </button>
                                            )}
                                        </div>
                                        <button
                                            onClick={closeReviewModal}
                                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-xs"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Production Access Confirmation Modal */}
            <AnimatePresence>
                {isProductionConfirmOpen && productionMerchant && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeProductionConfirm}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden"
                        >
                            {productionMerchant.merchant.kycStatus === 'APPROVED' ? (
                                // KYB approved - Show success confirmation
                                <>
                                    <div className="p-6 text-center">
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle className="w-8 h-8 text-green-600" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                                            Grant Production Access?
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-1">
                                            KYB has been approved for <span className="font-semibold text-gray-900">{productionMerchant.merchant.businessName}</span>.
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Are you sure you want to grant production access to this merchant?
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 px-6 py-4 flex gap-3">
                                        <button
                                            onClick={closeProductionConfirm}
                                            disabled={isApprovingProduction}
                                            className="flex-1 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleGrantProduction}
                                            disabled={isApprovingProduction}
                                            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isApprovingProduction ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    Granting...
                                                </>
                                            ) : (
                                                <>
                                                    <Rocket className="w-4 h-4" />
                                                    Grant Access
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                // KYB not approved - Show warning
                                <>
                                    <div className="p-6 text-center">
                                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <AlertCircle className="w-8 h-8 text-orange-600" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                                            KYB Not Approved
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-3">
                                            <span className="font-semibold text-gray-900">{productionMerchant.merchant.businessName}</span> has not completed the KYB review process. Please approve their KYB first before granting production access.
                                        </p>
                                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                                            <p className="text-xs text-orange-800 font-medium">
                                                {productionMerchant.documents.filter(doc => doc.reviewStatus === 'APPROVED').length} of {productionMerchant.documents.length} documents approved
                                            </p>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            You can still grant production access, but it&apos;s recommended to complete the review first.
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 px-6 py-4 flex gap-3">
                                        <button
                                            onClick={closeProductionConfirm}
                                            disabled={isApprovingProduction}
                                            className="flex-1 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleGrantProduction}
                                            disabled={isApprovingProduction}
                                            className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isApprovingProduction ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    Granting...
                                                </>
                                            ) : (
                                                <>
                                                    <Rocket className="w-4 h-4" />
                                                    Grant Anyway
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
