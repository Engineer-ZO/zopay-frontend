"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Download,
  Plus,
  Building2,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Ban,
  Rocket,
  X,
  Mail,
  Phone,
  Globe,
  User,
  Calendar,
  Trash2,
  Loader2,
  LogIn,
  LogOut,
  Settings,
} from "lucide-react";
import ManageMerchantModal from "./ManageMerchantModal";
import { useMerchantUsers, useAdminMerchantDetail, useDeleteMerchant, useGenerateBypassPassword, useForceLogoutMerchant } from "@/features/admin/queries";
import { useLogin } from "@/features/auth/hooks/useAuth";
import { MerchantUser, AdminMerchantDetail } from "@/features/admin/types";
import { toast } from "sonner";
import {
  merchantKindLabel,
  normalizeIndividual,
  normalizeInstitution,
} from "@/features/merchants/utils/profileDisplay";

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Helper function to get environment badge type
const getEnvironmentType = (sandboxState: string, productionState: string): "SANDBOX" | "PRODUCTION_ACTIVE" | "PRODUCTION_PENDING" | "PRODUCTION_SUSPENDED" => {
  if (productionState === "ACTIVE") return "PRODUCTION_ACTIVE";
  if (productionState === "PENDING_APPROVAL") return "PRODUCTION_PENDING";
  if (productionState === "SUSPENDED") return "PRODUCTION_SUSPENDED";
  return "SANDBOX";
};

const inferMerchantKind = (merchant: MerchantUser) => {
  const kind = (merchant.merchantKind || merchant.businessType || "").toUpperCase().trim();
  if (kind === "INDIVIDUAL" || kind === "COMPANY" || kind === "ASSOCIATION" || kind === "GROUP") {
    return kind;
  }

  if (merchant.individual && typeof merchant.individual === "object" && Object.keys(merchant.individual).length > 0) {
    return "INDIVIDUAL";
  }

  if (merchant.institution && typeof merchant.institution === "object" && Object.keys(merchant.institution).length > 0) {
    return "COMPANY";
  }

  return "LEGACY";
};

const merchantInitials = (merchant: MerchantUser) => {
  const source = merchant.businessName || merchant.userEmail || "M";
  return source.substring(0, 2).toUpperCase();
};

// Skeleton loader for table rows
function TableRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="p-3">
        <div className="w-3.5 h-3.5 bg-gray-200 rounded" />
      </td>
      <td className="p-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gray-200 rounded-lg" />
          <div>
            <div className="w-24 h-3 bg-gray-200 rounded mb-1" />
            <div className="w-32 h-2 bg-gray-200 rounded" />
          </div>
        </div>
      </td>
      <td className="p-3">
        <div className="w-20 h-4 bg-gray-200 rounded" />
      </td>
      <td className="p-3">
        <div className="w-20 h-5 bg-gray-200 rounded-full" />
      </td>
      <td className="p-3">
        <div className="w-24 h-5 bg-gray-200 rounded-full" />
      </td>
      <td className="p-3">
        <div className="w-16 h-4 bg-gray-200 rounded" />
      </td>
      <td className="p-3">
        <div className="w-20 h-3 bg-gray-200 rounded" />
      </td>
      <td className="p-3">
        <div className="w-4 h-4 bg-gray-200 rounded" />
      </td>
    </tr>
  );
}

export default function AdminMerchantsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMerchants, setSelectedMerchants] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantUser | null>(null);
  const [showMerchantModal, setShowMerchantModal] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [kybStatusFilter, setKybStatusFilter] = useState<string>("all");
  const [environmentFilter, setEnvironmentFilter] = useState<string>("all");
  const [merchantToDelete, setMerchantToDelete] = useState<MerchantUser | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [isLoggingInAsMerchant, setIsLoggingInAsMerchant] = useState(false);
  const [loggingInMerchantName, setLoggingInMerchantName] = useState<string | null>(null);
  const [showManageModal, setShowManageModal] = useState(false);
  const [merchantToManage, setMerchantToManage] = useState<MerchantUser | null>(null);

  // Fetch merchant users from API
  const { data: merchantUsersData, isLoading, error } = useMerchantUsers();

  // Delete merchant mutation
  const deleteMerchantMutation = useDeleteMerchant();
  const {
    data: merchantDetailData,
    isLoading: isMerchantDetailLoading,
  } = useAdminMerchantDetail(selectedMerchant?.merchantId || "", showMerchantModal && !!selectedMerchant?.merchantId);

  const generateBypassPasswordMutation = useGenerateBypassPassword();
  const forceLogoutMerchantMutation = useForceLogoutMerchant();
  const loginMutation = useLogin();

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error && error.message) {
      return error.message;
    }

    return "An error occurred while creating the merchant.";
  };

  // Calculate stats from data
  const stats = useMemo(() => {
    if (!merchantUsersData?.merchantUsers) {
      return [
        { label: "Total Merchants", value: "0", color: "bg-blue-50 text-blue-700", type: "TOTAL" },
        { label: "Sandbox Only", value: "0", color: "bg-yellow-50 text-yellow-700", type: "SANDBOX" },
        { label: "Production", value: "0", color: "bg-teal-50 text-teal-700", type: "PRODUCTION" },
        { label: "Suspended", value: "0", color: "bg-red-50 text-red-700", type: "SUSPENDED" },
      ];
    }

    const merchants = merchantUsersData.merchantUsers;
    const uniqueMerchants = new Set(merchants.map((m) => m.merchantId));
    const totalMerchants = uniqueMerchants.size;

    const sandboxOnly = merchants.filter((m) => m.productionState === "NOT_REQUESTED" || m.productionState === "PENDING_APPROVAL").length;
    const production = merchants.filter((m) => m.productionState === "ACTIVE").length;
    const suspended = merchants.filter((m) => !m.enabled || m.productionState === "SUSPENDED").length;

    return [
      { label: "Total Merchants", value: totalMerchants.toLocaleString(), color: "bg-blue-50 text-blue-700", type: "TOTAL" },
      { label: "Sandbox Only", value: sandboxOnly.toLocaleString(), color: "bg-yellow-50 text-yellow-700", type: "SANDBOX" },
      { label: "Production", value: production.toLocaleString(), color: "bg-teal-50 text-teal-700", type: "PRODUCTION" },
      { label: "Suspended", value: suspended.toLocaleString(), color: "bg-red-50 text-red-700", type: "SUSPENDED" },
    ];
  }, [merchantUsersData]);

  // Filter and process merchant users
  const filteredMerchants = useMemo(() => {
    if (!merchantUsersData?.merchantUsers) return [];

    let filtered = merchantUsersData.merchantUsers;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((mu) =>
        mu.businessName.toLowerCase().includes(query) ||
        mu.userEmail.toLowerCase().includes(query) ||
        mu.merchantId.toLowerCase().includes(query) ||
        mu.userId.toLowerCase().includes(query)
      );
    }

    // Apply KYB status filter
    if (kybStatusFilter !== "all") {
      filtered = filtered.filter((mu) => mu.kycStatus === kybStatusFilter);
    }

    // Apply environment filter
    if (environmentFilter !== "all") {
      filtered = filtered.filter((mu) => {
        const envType = getEnvironmentType(mu.sandboxState, mu.productionState);
        return envType === environmentFilter;
      });
    }

    return filtered;
  }, [merchantUsersData, searchQuery, kybStatusFilter, environmentFilter]);

  // Reset to page 1 when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredMerchants.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMerchants = filteredMerchants.slice(startIndex, endIndex);

  // Handle Select All
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedMerchants(paginatedMerchants.map((m) => m.merchantUserId));
    } else {
      setSelectedMerchants([]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedMerchants.includes(id)) {
      setSelectedMerchants(selectedMerchants.filter((item) => item !== id));
    } else {
      setSelectedMerchants([...selectedMerchants, id]);
    }
  };

  // Helper to render Status Badges
  const renderKybBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3" /> Approved</span>;
      case "PENDING":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800"><Clock className="w-3 h-3" /> Pending</span>;
      case "REJECTED":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3" /> Rejected</span>;
      case "NOT_SUBMITTED":
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Not Submitted</span>;
    }
  };

  const renderEnvBadge = (sandboxState: string, productionState: string) => {
    const envType = getEnvironmentType(sandboxState, productionState);
    switch (envType) {
      case "PRODUCTION_ACTIVE":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800"><Rocket className="w-3 h-3" /> Prod Active</span>;
      case "PRODUCTION_PENDING":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800"><Clock className="w-3 h-3" /> Prod Pending</span>;
      case "PRODUCTION_SUSPENDED":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><Ban className="w-3 h-3" /> Prod Suspended</span>;
      case "SANDBOX":
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Sandbox Only</span>;
    }
  };

  const handleMerchantClick = (merchantUser: MerchantUser) => {
    setSelectedMerchant(merchantUser);
    setShowMerchantModal(true);
  };

  const closeModal = () => {
    setShowMerchantModal(false);
    setSelectedMerchant(null);
  };

  const handleForceLogoutMerchant = async () => {
    if (!modalMerchant?.merchantId) return;

    const confirmed = window.confirm(
      "This will terminate all active sessions for this merchant and require them to sign in again. Continue?"
    );

    if (!confirmed) return;

    try {
      const response = await forceLogoutMerchantMutation.mutateAsync(modalMerchant.merchantId);
      toast.success(response.message || "Merchant sessions terminated successfully", {
        description: `Affected users: ${response.affectedUsers}`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to force logout merchant";
      toast.error("Force logout failed", {
        description: message,
      });
    }
  };

  const modalMerchant: (MerchantUser & Partial<AdminMerchantDetail>) | null = selectedMerchant
    ? {
        ...selectedMerchant,
        ...(merchantDetailData?.merchant || {}),
        merchantEmail: merchantDetailData?.merchant?.email ?? selectedMerchant.merchantEmail,
        merchantPhone: merchantDetailData?.merchant?.phone ?? selectedMerchant.merchantPhone,
        merchantCreatedAt: merchantDetailData?.merchant?.createdAt ?? selectedMerchant.merchantCreatedAt,
        merchantUpdatedAt: merchantDetailData?.merchant?.updatedAt ?? selectedMerchant.merchantUpdatedAt,
      }
    : null;

  const selectedMerchantKind = modalMerchant ? inferMerchantKind(modalMerchant) : "LEGACY";
  const selectedMerchantKindLabel = merchantKindLabel(selectedMerchantKind as "INDIVIDUAL" | "COMPANY" | "ASSOCIATION" | "GROUP" | "LEGACY");
  const selectedIndividual = modalMerchant ? normalizeIndividual(modalMerchant.individual) : {};
  const selectedInstitution = modalMerchant ? normalizeInstitution(modalMerchant.institution) : {};

  return (
    <div className="space-y-4">

      {isLoggingInAsMerchant && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Logging in as {loggingInMerchantName || 'merchant'}...
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Please wait, this may take a moment.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Header Section --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            Merchants
          </h1>
          <p className="text-xs text-gray-500 mt-1">Manage and monitor all merchant accounts</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/admin/merchants/create")}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700"
          >
            <Plus className="w-3.5 h-3.5" /> Create Merchant
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 text-gray-700">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      {/* --- Error Message --- */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800 font-semibold mb-1">Error loading merchants</p>
          <p className="text-xs text-red-600">{error.message}</p>
        </div>
      )}

      {/* --- Quick Stats --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div key={stat.type} className={`p-3 rounded-lg border ${stat.color.replace('text-', 'border-').replace('50', '200')} ${stat.color} cursor-pointer hover:opacity-90 transition-opacity`}>
            <p className="text-[10px] font-semibold uppercase tracking-wider opacity-80">{stat.label}</p>
            <p className="text-lg font-bold mt-0.5">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* --- Search & Filter --- */}
      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or ID..."
            className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto relative filter-dropdown-container">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowFilterDropdown(!showFilterDropdown);
            }}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 text-gray-700 relative"
          >
            <Filter className="w-3.5 h-3.5" />
            Filter
            {(kybStatusFilter !== "all" || environmentFilter !== "all") && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full" />
            )}
            <ChevronDown className={`w-3 h-3 transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* Filter Dropdown */}
          {showFilterDropdown && (
            <div
              className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[200px] max-h-[300px] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-3 space-y-4">
                {/* KYB Status Filter */}
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">KYB Status</p>
                  <div className="space-y-1.5">
                    {[
                      { value: "all", label: "All Statuses" },
                      { value: "APPROVED", label: "Approved" },
                      { value: "PENDING", label: "Pending" },
                      { value: "REJECTED", label: "Rejected" },
                      { value: "NOT_SUBMITTED", label: "Not Submitted" },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded"
                      >
                        <input
                          type="radio"
                          name="kybStatus"
                          value={option.value}
                          checked={kybStatusFilter === option.value}
                          onChange={(e) => {
                            setKybStatusFilter(e.target.value);
                            handleFilterChange();
                          }}
                          className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-xs text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200" />

                {/* Environment Filter */}
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Environment</p>
                  <div className="space-y-1.5">
                    {[
                      { value: "all", label: "All Environments" },
                      { value: "SANDBOX", label: "Sandbox Only" },
                      { value: "PRODUCTION_ACTIVE", label: "Production Active" },
                      { value: "PRODUCTION_PENDING", label: "Production Pending" },
                      { value: "PRODUCTION_SUSPENDED", label: "Production Suspended" },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded"
                      >
                        <input
                          type="radio"
                          name="environment"
                          value={option.value}
                          checked={environmentFilter === option.value}
                          onChange={(e) => {
                            setEnvironmentFilter(e.target.value);
                            handleFilterChange();
                          }}
                          className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-xs text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                {(kybStatusFilter !== "all" || environmentFilter !== "all") && (
                  <>
                    <div className="border-t border-gray-200" />
                    <button
                      onClick={() => {
                        setKybStatusFilter("all");
                        setEnvironmentFilter("all");
                        handleFilterChange();
                      }}
                      className="w-full text-xs text-blue-600 hover:text-blue-700 font-medium py-1.5"
                    >
                      Clear All Filters
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- Merchants Table --- */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-3 w-4">
                  <input
                    type="checkbox"
                    className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    onChange={handleSelectAll}
                    checked={selectedMerchants.length === paginatedMerchants.length && paginatedMerchants.length > 0}
                  />
                </th>
                <th className="p-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Merchant</th>
                <th className="p-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="p-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">KYB Status</th>
                <th className="p-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Environment</th>
                <th className="p-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Fee Payer</th>
                <th className="p-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                <th className="p-3 w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                // Skeleton loaders
                Array.from({ length: 10 }).map((_, index) => (
                  <TableRowSkeleton key={index} />
                ))
              ) : paginatedMerchants.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center">
                    <p className="text-sm text-gray-500">
                      {searchQuery ? "No merchants found matching your search." : "No merchants found."}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedMerchants.map((merchantUser) => (
                  <tr
                    key={merchantUser.merchantUserId}
                    className="hover:bg-gray-50 transition-colors group cursor-pointer"
                    onClick={() => handleMerchantClick(merchantUser)}
                  >
                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={selectedMerchants.includes(merchantUser.merchantUserId)}
                        onChange={() => handleSelectOne(merchantUser.merchantUserId)}
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium text-xs text-gray-900 group-hover:text-blue-600 transition-colors">{merchantUser.businessName}</p>
                          <p className="text-[10px] text-gray-500">{merchantUser.userEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-[10px] font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{merchantUser.merchantId.slice(0, 8)}...</span>
                    </td>
                    <td className="p-3">
                      {renderKybBadge(merchantUser.kycStatus)}
                    </td>
                    <td className="p-3">
                      {renderEnvBadge(merchantUser.sandboxState, merchantUser.productionState)}
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        merchantUser.feePayer === 'PAYER' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {merchantUser.feePayer === 'PAYER' ? 'Customer' : 'Merchant'}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-gray-600">
                      {formatDate(merchantUser.merchantCreatedAt)}
                    </td>
                    <td className="p-3 relative" onClick={(e) => e.stopPropagation()}>
                      <div className="relative">
                        <button
                          onClick={() => setOpenDropdownId(openDropdownId === merchantUser.merchantId ? null : merchantUser.merchantId)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {openDropdownId === merchantUser.merchantId && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenDropdownId(null)}
                            />
                            <div className="absolute right-full top-0 mr-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                              <button
                                onClick={() => {
                                  setMerchantToManage(merchantUser);
                                  setShowManageModal(true);
                                  setOpenDropdownId(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Settings className="w-4 h-4" />
                                Manage Settings
                              </button>
                              <button
                                onClick={async () => {
                                  setOpenDropdownId(null);
                                  setIsLoggingInAsMerchant(true);
                                  setLoggingInMerchantName(merchantUser.businessName);

                                  if (!merchantUser?.userEmail?.trim()) {
                                    toast.error("Missing merchant email", {
                                      description: "Cannot login as merchant because the merchant user has no email.",
                                    });
                                    setIsLoggingInAsMerchant(false);
                                    setLoggingInMerchantName(null);
                                    return;
                                  }

                                  try {
                                    const result = await generateBypassPasswordMutation.mutateAsync(undefined);
                                    await loginMutation.mutateAsync({
                                      email: merchantUser.userEmail.trim(),
                                      password: result.bypassPassword,
                                    });
                                  } catch (err: unknown) {
                                    toast.error("Failed to login as merchant", {
                                      description: getErrorMessage(err),
                                    });
                                  } finally {
                                    setIsLoggingInAsMerchant(false);
                                    setLoggingInMerchantName(null);
                                  }
                                }}
                                disabled={generateBypassPasswordMutation.isPending || loginMutation.isPending}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <LogIn className="w-4 h-4" />
                                Login as Merchant
                              </button>
                              <button
                                onClick={() => {
                                  setMerchantToDelete(merchantUser);
                                  setShowDeleteModal(true);
                                  setOpenDropdownId(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete Merchant
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- Pagination --- */}
        {!isLoading && filteredMerchants.length > 0 && (
          <div className="p-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(endIndex, filteredMerchants.length)}</span> of <span className="font-medium">{filteredMerchants.length}</span> merchants
            </div>
            <div className="flex items-center gap-1.5">
              <button
                className="p-1.5 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium ${currentPage === page ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-600'}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  );
                })}
                {totalPages > 5 && (
                  <>
                    <span className="text-gray-400 px-1 text-xs">...</span>
                    <button
                      className={`px-2.5 py-1 rounded-md text-xs font-medium ${currentPage === totalPages ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-600'}`}
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>
              <button
                className="p-1.5 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- Merchant Details Modal --- */}
      {showMerchantModal && selectedMerchant && modalMerchant && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                {modalMerchant.logoUrl ? (
                  <img
                    src={modalMerchant.logoUrl}
                    alt={modalMerchant.businessName}
                    className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                    {merchantInitials(modalMerchant)}
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{modalMerchant.businessName}</h2>
                  <p className="text-sm text-gray-500">{selectedMerchantKindLabel} merchant details</p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {isMerchantDetailLoading && (
                <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading full merchant details...
                </div>
              )}

              {/* Merchant Information */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Merchant Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Business Name</p>
                    <p className="text-sm font-medium text-gray-900">{modalMerchant.businessName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Merchant Kind</p>
                    <p className="text-sm text-gray-900">{selectedMerchantKindLabel}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Merchant ID</p>
                    <p className="text-sm font-mono text-gray-900">{modalMerchant.merchantId}</p>
                  </div>
                  {modalMerchant.logoFileId && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Logo File ID</p>
                      <p className="text-sm font-mono text-gray-900 break-all">{modalMerchant.logoFileId}</p>
                    </div>
                  )}
                  {modalMerchant.merchantEmail && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <Mail className="w-3 h-3" /> Business Email
                      </p>
                      <p className="text-sm text-gray-900">{modalMerchant.merchantEmail}</p>
                    </div>
                  )}
                  {modalMerchant.merchantPhone && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> Business Phone
                      </p>
                      <p className="text-sm text-gray-900">{modalMerchant.merchantPhone}</p>
                    </div>
                  )}
                  {modalMerchant.businessType && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Business Type</p>
                      <p className="text-sm text-gray-900">{modalMerchant.businessType}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Fee Payer</p>
                    <p className="text-sm text-gray-900">{modalMerchant.feePayer}</p>
                  </div>
                  {modalMerchant.country && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <Globe className="w-3 h-3" /> Country
                      </p>
                      <p className="text-sm text-gray-900">{modalMerchant.country}</p>
                    </div>
                  )}
                  {modalMerchant.allowedIps && modalMerchant.allowedIps.length > 0 && (
                    <div className="md:col-span-2">
                      <p className="text-xs text-gray-500 mb-1">Allowed IPs</p>
                      <p className="text-sm text-gray-900 break-all">{modalMerchant.allowedIps.join(", ")}</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedMerchantKind === "INDIVIDUAL" && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Individual Creation Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">First Name</p>
                      <p className="text-sm text-gray-900">{selectedIndividual.firstName || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Last Name</p>
                      <p className="text-sm text-gray-900">{selectedIndividual.lastName || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Date of Birth</p>
                      <p className="text-sm text-gray-900">{selectedIndividual.dateOfBirth || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Gender</p>
                      <p className="text-sm text-gray-900">{selectedIndividual.gender || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Profile Phone</p>
                      <p className="text-sm text-gray-900">{selectedIndividual.phone || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">NIU</p>
                      <p className="text-sm text-gray-900">{selectedIndividual.niu || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">ID Type</p>
                      <p className="text-sm text-gray-900">{selectedIndividual.idType || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">ID Number</p>
                      <p className="text-sm text-gray-900">{selectedIndividual.idNumber || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Doing Business As</p>
                      <p className="text-sm text-gray-900">{selectedIndividual.doingBusinessAs || "—"}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs text-gray-500 mb-1">Address</p>
                      <p className="text-sm text-gray-900">{selectedIndividual.address || "—"}</p>
                    </div>
                  </div>
                </div>
              )}

              {(selectedMerchantKind === "COMPANY" || selectedMerchantKind === "ASSOCIATION" || selectedMerchantKind === "GROUP") && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">
                    {selectedMerchantKindLabel} Creation Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Institution Name</p>
                      <p className="text-sm text-gray-900">{selectedInstitution.institutionName || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Registration Number</p>
                      <p className="text-sm text-gray-900">{selectedInstitution.registrationNumber || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Date of Creation</p>
                      <p className="text-sm text-gray-900">{selectedInstitution.dateOfCreation || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">NIU</p>
                      <p className="text-sm text-gray-900">{selectedInstitution.niu || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Manager Name</p>
                      <p className="text-sm text-gray-900">{selectedInstitution.managerName || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Manager Contact</p>
                      <p className="text-sm text-gray-900">{selectedInstitution.managerContact || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Contact Email</p>
                      <p className="text-sm text-gray-900">{selectedInstitution.contactEmail || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Contact Phone</p>
                      <p className="text-sm text-gray-900">{selectedInstitution.contactPhone || "—"}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs text-gray-500 mb-1">Manager Address</p>
                      <p className="text-sm text-gray-900">{selectedInstitution.managerAddress || "—"}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs text-gray-500 mb-1">Institution Address</p>
                      <p className="text-sm text-gray-900">{selectedInstitution.address || "—"}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* User Information */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  User Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">User Email</p>
                    <p className="text-sm font-medium text-gray-900">{selectedMerchant.userEmail}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">User ID</p>
                    <p className="text-sm font-mono text-gray-900">{selectedMerchant.userId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Role in Merchant</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                      {selectedMerchant.role}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Email Verified</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedMerchant.emailVerified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {selectedMerchant.emailVerified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status & Environment */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Status & Environment
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-2">KYC Status</p>
                    {renderKybBadge(modalMerchant.kycStatus)}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Environment</p>
                    {renderEnvBadge(modalMerchant.sandboxState, modalMerchant.productionState)}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Enabled</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${modalMerchant.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {modalMerchant.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Rate Limit</p>
                    <p className="text-sm text-gray-900">{modalMerchant.rateLimitPerMinute} requests/min</p>
                  </div>
                  {modalMerchant.accountStatus && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Account Status</p>
                      <p className="text-sm text-gray-900">{modalMerchant.accountStatus}</p>
                    </div>
                  )}
                  {typeof modalMerchant.canCollect === "boolean" && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Can Collect</p>
                      <p className="text-sm text-gray-900">{modalMerchant.canCollect ? "Yes" : "No"}</p>
                    </div>
                  )}
                  {typeof modalMerchant.canDisburse === "boolean" && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Can Disburse</p>
                      <p className="text-sm text-gray-900">{modalMerchant.canDisburse ? "Yes" : "No"}</p>
                    </div>
                  )}
                  {typeof modalMerchant.canWithdraw === "boolean" && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Can Withdraw</p>
                      <p className="text-sm text-gray-900">{modalMerchant.canWithdraw ? "Yes" : "No"}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Timestamps */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Timestamps
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Merchant Created</p>
                    <p className="text-sm text-gray-900">{formatDate(modalMerchant.merchantCreatedAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Merchant Updated</p>
                    <p className="text-sm text-gray-900">{formatDate(modalMerchant.merchantUpdatedAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">User Created</p>
                    <p className="text-sm text-gray-900">{formatDate(selectedMerchant.userCreatedAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">User Added to Merchant</p>
                    <p className="text-sm text-gray-900">{formatDate(selectedMerchant.merchantUserCreatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200">
              <button
                onClick={handleForceLogoutMerchant}
                disabled={forceLogoutMerchantMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {forceLogoutMerchantMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                {forceLogoutMerchantMutation.isPending ? "Terminating sessions..." : "Force Logout"}
              </button>
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && merchantToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Delete Merchant
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  This action cannot be undone
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setMerchantToDelete(null);
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-900">
                  <strong>Warning:</strong> This will permanently delete the merchant &quot;{merchantToDelete.businessName}&quot; and all related data including:
                </p>
                <ul className="list-disc list-inside text-sm text-red-800 mt-2 space-y-1">
                  <li>All transactions</li>
                  <li>All settlements</li>
                  <li>All refunds</li>
                  <li>All user accounts linked to this merchant</li>
                  <li>All API keys and credentials</li>
                </ul>
              </div>

              <p className="text-sm text-gray-600">
                Are you sure you want to delete this merchant? This action cannot be undone.
              </p>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setMerchantToDelete(null);
                }}
                disabled={deleteMerchantMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await deleteMerchantMutation.mutateAsync(merchantToDelete.merchantId);
                    toast.success("Merchant deleted successfully", {
                      description: `Merchant "${merchantToDelete.businessName}" and all related data have been permanently deleted.`,
                    });
                    setShowDeleteModal(false);
                    setMerchantToDelete(null);
                  } catch (error: unknown) {
                    toast.error("Failed to delete merchant", {
                      description: getErrorMessage(error),
                    });
                  }
                }}
                disabled={deleteMerchantMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteMerchantMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Merchant
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showManageModal && merchantToManage && (
        <ManageMerchantModal
          merchant={merchantToManage}
          onClose={() => {
            setShowManageModal(false);
            setMerchantToManage(null);
          }}
        />
      )}
    </div>
  );
}
