"use client";

import { useState } from "react";
import {
    Network,
    Search,
    Filter,
    CheckCircle2,
    XCircle,
    Clock,
    Trash2,
    Loader2
} from "lucide-react";
import { toast } from "sonner";
import {
    useGetAllIpRequests,
    useApproveIp,
    useRejectIp,
    useAdminDeleteIp
} from "@/features/merchants/hooks/useAdminIps";
import type { IpRequest } from "@/features/merchants/types/index";

export default function AdminIpsPage() {
    const [statusFilter, setStatusFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('ALL');
    const [searchQuery, setSearchQuery] = useState("");
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedIp, setSelectedIp] = useState<IpRequest | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Fetch IPs
    const { data: ipsData, isLoading, refetch } = useGetAllIpRequests(
        statusFilter === 'ALL' ? undefined : statusFilter
    );

    const approveMutation = useApproveIp();
    const rejectMutation = useRejectIp();
    const deleteMutation = useAdminDeleteIp();

    const ips = ipsData?.ips || [];

    // Filter by search query
    const filteredIps = ips.filter(ip =>
        ip.ipAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ip.merchantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ip.merchantId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ip.description && ip.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleApprove = async (ip: IpRequest) => {
        try {
            await approveMutation.mutateAsync(ip.id);
            toast.success(`IP ${ip.ipAddress} approved successfully`);
            refetch();
        } catch (error: unknown) {
            toast.error("Failed to approve IP");
        }
    };

    const handleReject = async () => {
        if (!selectedIp) return;

        try {
            await rejectMutation.mutateAsync({
                ipId: selectedIp.id,
                data: { reason: rejectionReason }
            });
            toast.success(`IP ${selectedIp.ipAddress} rejected`);
            setShowRejectModal(false);
            setRejectionReason("");
            setSelectedIp(null);
            refetch();
        } catch (error: unknown) {
            toast.error("Failed to reject IP");
        }
    };

    const handleDelete = async () => {
        if (!selectedIp) return;

        try {
            await deleteMutation.mutateAsync(selectedIp.id);
            toast.success(`IP ${selectedIp.ipAddress} deleted`);
            setShowDeleteModal(false);
            setSelectedIp(null);
            refetch();
        } catch (error: unknown) {
            toast.error("Failed to delete IP");
        }
    };

    const getStatusBadge = (status: IpRequest["status"]) => {
        switch (status) {
            case "APPROVED":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approved
                    </span>
                );
            case "PENDING":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                        <Clock className="w-3.5 h-3.5" />
                        Pending
                    </span>
                );
            case "REJECTED":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                        <XCircle className="w-3.5 h-3.5" />
                        Rejected
                    </span>
                );
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">IP Requests</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Review and manage merchant IP whitelist requests
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    {/* Status Tabs */}
                    <div className="flex bg-gray-100 p-1 rounded-lg self-start">
                        {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setStatusFilter(tab)}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${statusFilter === tab
                                        ? "bg-white text-blue-600 shadow-sm"
                                        : "text-gray-500 hover:text-gray-900"
                                    }`}
                            >
                                {tab.charAt(0) + tab.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search IPs or merchants..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                        />
                    </div>
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            ) : filteredIps.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
                    <Network className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No IP requests found</h3>
                    <p className="text-gray-500 mt-1">
                        Try adjusting your filters or search query
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-900">IP Details</th>
                                    <th className="px-6 py-4 font-semibold text-gray-900">Merchant</th>
                                    <th className="px-6 py-4 font-semibold text-gray-900">Status</th>
                                    <th className="px-6 py-4 font-semibold text-gray-900">Requested At</th>
                                    <th className="px-6 py-4 font-semibold text-gray-900 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredIps.map((ip) => (
                                    <tr key={ip.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                                    <Network className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 font-mono">{ip.ipAddress}</p>
                                                    {ip.description && (
                                                        <p className="text-xs text-gray-500 mt-0.5">{ip.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900">{ip.merchantName}</p>
                                            <p className="text-xs text-gray-500 font-mono mt-0.5">{ip.merchantId}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(ip.status)}
                                            {ip.status === 'REJECTED' && ip.rejectionReason && (
                                                <p className="text-xs text-red-600 mt-1 max-w-[200px] truncate" title={ip.rejectionReason}>
                                                    Reason: {ip.rejectionReason}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {formatDate(ip.createdAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {ip.status === 'PENDING' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(ip)}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                            title="Approve"
                                                            disabled={approveMutation.isPending}
                                                        >
                                                            <CheckCircle2 className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedIp(ip);
                                                                setShowRejectModal(true);
                                                            }}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Reject"
                                                        >
                                                            <XCircle className="w-5 h-5" />
                                                        </button>
                                                    </>
                                                )}

                                                <button
                                                    onClick={() => {
                                                        setSelectedIp(ip);
                                                        setShowDeleteModal(true);
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && selectedIp && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Reject IP Request</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Please provide a reason for rejecting <strong>{selectedIp.ipAddress}</strong>. This will be shown to the merchant.
                        </p>

                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="e.g. Invalid IP address, Security risk..."
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[100px] mb-4"
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setSelectedIp(null);
                                    setRejectionReason("");
                                }}
                                className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={!rejectionReason.trim() || rejectMutation.isPending}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                            >
                                {rejectMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reject IP"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && selectedIp && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-6 h-6 text-red-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Delete IP Request?</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Are you sure you want to delete the request for <strong>{selectedIp.ipAddress}</strong>? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleteMutation.isPending}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors flex justify-center items-center gap-2"
                            >
                                {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
