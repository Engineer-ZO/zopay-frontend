"use client";

import { useState, useMemo } from "react";
import {
    Search,
    Rocket,
    CheckCircle2,
    Clock,
    Building2,
    Mail,
    Globe,
    AlertCircle,
    ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetPendingProductionSummary } from "@/features/merchants/hooks/useMerchant";
import { useApproveProduction } from "@/features/merchants/hooks/useMerchant";
import type { PendingProductionSummaryItem } from "@/features/merchants/types/index";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function PendingProductionPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMerchant, setSelectedMerchant] = useState<PendingProductionSummaryItem | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    // Fetch pending production requests
    const { data, isLoading, error, refetch } = useGetPendingProductionSummary();
    const requests = data?.summary || [];

    // Query client for invalidation
    const queryClient = useQueryClient();

    // Production approval mutation
    const { mutate: approveProductionMutation, isPending: isApprovingProduction } = useApproveProduction(
        selectedMerchant?.id || ''
    );

    const openConfirmModal = (merchant: PendingProductionSummaryItem) => {
        setSelectedMerchant(merchant);
        setIsConfirmModalOpen(true);
    };

    const closeConfirmModal = () => {
        setIsConfirmModalOpen(false);
        setSelectedMerchant(null);
    };

    const handleGrantProduction = () => {
        if (!selectedMerchant) return;

        approveProductionMutation(undefined, {
            onSuccess: () => {
                toast.success(`Production access granted to ${selectedMerchant.merchant.businessName}`);
                // Invalidate queries to refresh data
                queryClient.invalidateQueries({ queryKey: ['admin', 'pending-production-summary'] });
                queryClient.invalidateQueries({ queryKey: ['merchants'] });
                closeConfirmModal();
            },
            onError: (error: Error) => {
                toast.error(error.message || 'Failed to grant production access');
            },
        });
    };

    // Filter requests by search term
    const filteredRequests = useMemo(() => {
        if (!searchTerm.trim()) return requests;
        const query = searchTerm.toLowerCase();
        return requests.filter((req) =>
            req.merchant.businessName.toLowerCase().includes(query) ||
            req.merchant.email.toLowerCase().includes(query) ||
            req.id.toLowerCase().includes(query)
        );
    }, [requests, searchTerm]);

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return 'bg-red-100 text-red-700 border-red-200';
            case 'attention':
                return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'recent':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch {
            return dateString;
        }
    };

    // Skeleton Loader
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
                <div className="h-10 bg-gray-200 rounded-lg w-32" />
            </div>
        </div>
    );

    return (
        <div className="space-y-6 pb-12">
            {/* Header Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Pending Production Requests</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Merchants with approved KYB awaiting production access
                    </p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by business name, email, or merchant ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Stats */}
            {!isLoading && requests.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">
                            Total Requests
                        </p>
                        <p className="text-2xl font-bold text-blue-900">{requests.length}</p>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                        <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-1">
                            Needs Attention
                        </p>
                        <p className="text-2xl font-bold text-orange-900">
                            {requests.filter((r) => r.priority === 'attention' || r.priority === 'urgent').length}
                        </p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">
                            Ready to Approve
                        </p>
                        <p className="text-2xl font-bold text-green-900">
                            {requests.filter((r) => r.approvedDocuments === r.totalDocuments).length}
                        </p>
                    </div>
                </div>
            )}

            {/* Requests List */}
            <div className="space-y-4">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                        <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                        <p className="text-sm text-red-900 font-medium">Failed to load requests</p>
                        <p className="text-xs text-red-700 mt-1">{error.message}</p>
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                        <Rocket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-sm font-semibold text-gray-900 mb-1">
                            {searchTerm ? 'No requests found' : 'No pending production requests'}
                        </p>
                        <p className="text-xs text-gray-600">
                            {searchTerm
                                ? 'Try adjusting your search terms'
                                : 'All merchants with approved KYB have been granted production access'}
                        </p>
                    </div>
                ) : (
                    filteredRequests.map((request) => (
                        <motion.div
                            key={request.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                <div className="flex gap-4 flex-1 min-w-0">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-orange-500 rounded-xl flex items-center justify-center shrink-0">
                                        <Building2 className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-base font-bold text-gray-900 truncate">
                                                {request.merchant.businessName}
                                            </h3>
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getPriorityColor(
                                                    request.priority
                                                )}`}
                                            >
                                                {request.priority.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                                            <div className="flex items-center gap-1.5">
                                                <Mail className="w-3.5 h-3.5" />
                                                <span className="truncate">{request.merchant.email}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Globe className="w-3.5 h-3.5" />
                                                <span>{request.merchant.country}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>Requested {formatDate(request.submissionDate)}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 mt-2">
                                            <div className="flex items-center gap-1.5">
                                                <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                                                <span className="text-xs text-gray-600">
                                                    {request.approvedDocuments} of {request.totalDocuments} documents approved
                                                </span>
                                            </div>
                                            {request.ageInDays > 0 && (
                                                <span className="text-xs text-gray-500">
                                                    {request.ageInDays} day{request.ageInDays !== 1 ? 's' : ''} ago
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => openConfirmModal(request)}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all text-sm shadow-sm hover:shadow-md shrink-0"
                                >
                                    <Rocket className="w-4 h-4" />
                                    Grant Production Access
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {isConfirmModalOpen && selectedMerchant && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeConfirmModal}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden"
                        >
                            <div className="p-6 text-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                    Grant Production Access?
                                </h3>
                                <p className="text-sm text-gray-600 mb-1">
                                    KYB has been approved for{' '}
                                    <span className="font-semibold text-gray-900">
                                        {selectedMerchant.merchant.businessName}
                                    </span>
                                    .
                                </p>
                                <p className="text-sm text-gray-600">
                                    Are you sure you want to grant production access to this merchant?
                                </p>
                            </div>
                            <div className="bg-gray-50 px-6 py-4 flex gap-3">
                                <button
                                    onClick={closeConfirmModal}
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
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
