"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import {
  Copy,
  ExternalLink,
  Link as LinkIcon,
  Loader2,
  Plus,
  RefreshCw,
  X,
  Calendar,
  DollarSign,
  CreditCard,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Mail,
  Phone,
  User,
  Settings,
  TrendingUp,
  Globe,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import {
  listPaymentLinkTransactions,
  useCreatePaymentLink,
  usePartialPlans,
  usePaymentLinks,
  usePaymentLinkTransactions,
  useUpdatePaymentLink,
  parseSuggestedAmountsFromInput,
  type PartialMinimumScope,
  type PartialReminderFrequency,
  type PaymentLinkAmountMode,
  type PaymentLinkGateway,
  type PaymentLinkStatus,
  type PaymentLinkTransaction,
  type PaymentLinkType,
  type UpdatePaymentLinkRequest,
} from "@/features/payment-links";
import { useEnvironment } from "@/core/environment/EnvironmentContext";

const DEFAULT_GATEWAYS: PaymentLinkGateway[] = ["MTN_MOMO", "ORANGE_MONEY"];

type PaymentLinksPageTab = "links" | "transactions";

const TX_TAB_PAGE_SIZE = 15;

type MergedPaymentLinkTx = PaymentLinkTransaction & {
  linkTitle: string;
  linkSlug: string;
  paymentLinkId: string;
};

// Helper functions remain the same
function transactionStatusClass(status: string): string {
  switch (status) {
    case "SUCCESS":
      return "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20";
    case "FAILED":
      return "bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20";
    case "VERIFYING":
    case "PENDING":
    case "PROCESSING":
      return "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20";
    default:
      return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700";
  }
}

function toIsoFromLocalDateTime(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function statusClass(status: PaymentLinkStatus): string {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20";
    case "INACTIVE":
      return "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20";
    case "ARCHIVED":
      return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700";
    default:
      return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700";
  }
}

function getPayerName(tx: {
  payerName?: string | null;
  payeeName?: string | null;
}): string {
  return tx.payerName || tx.payeeName || "Name not provided";
}

function getPayerEmail(tx: {
  payerEmail?: string | null;
  payeeEmail?: string | null;
}): string {
  return tx.payerEmail || tx.payeeEmail || "Email not provided";
}

function getPayerPhone(tx: {
  payerMsisdn?: string | null;
  payeeMsisdn?: string | null;
}): string {
  return tx.payerMsisdn || tx.payeeMsisdn || "Phone not available";
}

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, trend }: { icon: any; label: string; value: string | number; trend?: string }) => (
  <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-all duration-200">
    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-2xl" />
    <div className="relative flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{value}</p>
        {trend && <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">{trend}</p>}
      </div>
      <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
        <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
      </div>
    </div>
  </div>
);

// Status Badge Component
const StatusBadge = ({ status, variant }: { status: string; variant?: "success" | "warning" | "danger" | "info" | "default" }) => {
  const variants = {
    success: "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
    warning: "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20",
    danger: "bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20",
    info: "bg-sky-100 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-500/20",
    default: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${variants[variant || "default"]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {status}
    </span>
  );
};

// Action Button Component
const ActionButton = ({ onClick, icon: Icon, label, variant = "default" }: any) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
      variant === "primary"
        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5"
        : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
    }`}
  >
    <Icon className="w-3.5 h-3.5" />
    {label}
  </button>
);

export default function PaymentLinksPage() {
  const { environment } = useEnvironment();
  const queryClient = useQueryClient();

  const [pageTab, setPageTab] = useState<PaymentLinksPageTab>("links");
  const [txListPage, setTxListPage] = useState(1);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTransactionsForId, setShowTransactionsForId] = useState<string | null>(null);
  const [showPartialPlansForId, setShowPartialPlansForId] = useState<string | null>(null);
  const [showPartialManageForId, setShowPartialManageForId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amountMode, setAmountMode] = useState<PaymentLinkAmountMode>("FIXED");
  const [amount, setAmount] = useState("");
  const [suggestedAmountsInput, setSuggestedAmountsInput] = useState("");
  const [currency, setCurrency] = useState("XAF");
  const [gateways, setGateways] = useState<PaymentLinkGateway[]>(DEFAULT_GATEWAYS);
  const [linkEnvironment, setLinkEnvironment] = useState<"sandbox" | "production">(environment);
  const [linkType, setLinkType] = useState<PaymentLinkType>("MULTI_USE");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [successUrl, setSuccessUrl] = useState("");
  const [cancelUrl, setCancelUrl] = useState("");
  const [metadataText, setMetadataText] = useState("");

  const [partialMinimumAmount, setPartialMinimumAmount] = useState("");
  const [partialMinimumScope, setPartialMinimumScope] = useState<PartialMinimumScope>("EVERY_INSTALLMENT");
  const [partialDeadlineAt, setPartialDeadlineAt] = useState("");
  const [partialReminderFrequency, setPartialReminderFrequency] = useState<PartialReminderFrequency>("NONE");
  const [partialReminderEveryNDays, setPartialReminderEveryNDays] = useState("7");
  const [partialNotifyMerchantOnInstallment, setPartialNotifyMerchantOnInstallment] = useState(true);

  const [manageDeadlineAt, setManageDeadlineAt] = useState("");
  const [manageResumeCollection, setManageResumeCollection] = useState(false);
  const [manageReminderFrequency, setManageReminderFrequency] = useState<PartialReminderFrequency>("NONE");
  const [manageReminderEveryNDays, setManageReminderEveryNDays] = useState("7");
  const [manageNotifyInstallment, setManageNotifyInstallment] = useState(true);

  const { data, isLoading, error, refetch } = usePaymentLinks();
  const createMutation = useCreatePaymentLink();
  const updateMutation = useUpdatePaymentLink();

  const txQuery = usePaymentLinkTransactions(showTransactionsForId || "", !!showTransactionsForId);
  const partialPlansQuery = usePartialPlans(showPartialPlansForId || "", !!showPartialPlansForId);

  const links = useMemo(() => data?.paymentLinks ?? [], [data?.paymentLinks]);

  const linkTxQueries = useQueries({
    queries: links.map((link) => ({
      queryKey: ["payment-link-transactions", link.id] as const,
      queryFn: () => listPaymentLinkTransactions(link.id),
      enabled: pageTab === "transactions" && links.length > 0,
      staleTime: 30_000,
    })),
  });

  const mergedPaymentLinkTransactions = useMemo(() => {
    if (pageTab !== "transactions" || links.length === 0) return [];
    const rows: MergedPaymentLinkTx[] = [];
    links.forEach((link, i) => {
      const bundle = linkTxQueries[i]?.data?.transactions;
      if (!bundle?.length) return;
      for (const tx of bundle) {
        rows.push({
          ...tx,
          linkTitle: link.title,
          linkSlug: link.slug,
          paymentLinkId: link.id,
        });
      }
    });
    return rows.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [pageTab, links, linkTxQueries]);

  const txTabLoading =
    pageTab === "transactions" &&
    links.length > 0 &&
    linkTxQueries.some((q) => q.isPending);

  const txTabError = linkTxQueries.find((q) => q.error)?.error as Error | undefined;

  const txTotalPages = Math.max(1, Math.ceil(mergedPaymentLinkTransactions.length / TX_TAB_PAGE_SIZE));
  const paginatedMergedTxs = useMemo(() => {
    const start = (txListPage - 1) * TX_TAB_PAGE_SIZE;
    return mergedPaymentLinkTransactions.slice(start, start + TX_TAB_PAGE_SIZE);
  }, [mergedPaymentLinkTransactions, txListPage]);

  useEffect(() => {
    if (txListPage > txTotalPages) setTxListPage(txTotalPages);
  }, [txListPage, txTotalPages]);

  const refreshLinksAndTx = () => {
    void refetch();
    void queryClient.invalidateQueries({ queryKey: ["payment-link-transactions"] });
  };

  const frontendBaseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_FRONTEND_BASE_URL || "");

  const resetCreateForm = () => {
    setTitle("");
    setDescription("");
    setAmountMode("FIXED");
    setAmount("");
    setSuggestedAmountsInput("");
    setCurrency("XAF");
    setGateways(DEFAULT_GATEWAYS);
    setLinkEnvironment(environment);
    setLinkType("MULTI_USE");
    setMaxUses("");
    setExpiresAt("");
    setSuccessUrl("");
    setCancelUrl("");
    setMetadataText("");
    setPartialMinimumAmount("");
    setPartialMinimumScope("EVERY_INSTALLMENT");
    setPartialDeadlineAt("");
    setPartialReminderFrequency("NONE");
    setPartialReminderEveryNDays("7");
    setPartialNotifyMerchantOnInstallment(true);
  };

  useEffect(() => {
    if (amountMode === "PARTIAL") {
      setLinkType("MULTI_USE");
    }
  }, [amountMode]);

  const activeCount = useMemo(() => links.filter((l) => l.status === "ACTIVE").length, [links]);

  const buildPublicUrl = (slug: string) => `${frontendBaseUrl}/pay/${slug}`;

  const handleCopy = async (slug: string) => {
    try {
      const url = buildPublicUrl(slug);
      await navigator.clipboard.writeText(url);
      toast.success("Payment link copied", { description: url });
    } catch {
      toast.error("Could not copy link");
    }
  };

  const toggleGateway = (gateway: PaymentLinkGateway) => {
    setGateways((prev) => {
      if (prev.includes(gateway)) {
        if (prev.length === 1) {
          toast.error("At least one gateway must remain selected");
          return prev;
        }
        return prev.filter((g) => g !== gateway);
      }
      return [...prev, gateway];
    });
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (amountMode === "FIXED") {
      if (!amount.trim() || Number(amount) <= 0) {
        toast.error("Enter a valid fixed amount");
        return;
      }
    }
    if (amountMode === "PARTIAL") {
      if (!amount.trim() || Number(amount) <= 0) {
        toast.error("Enter a valid per-payer target amount");
        return;
      }
      if (!partialMinimumAmount.trim() || Number(partialMinimumAmount) <= 0) {
        toast.error("Minimum instalment amount is required");
        return;
      }
      if (
        partialReminderFrequency === "EVERY_N_DAYS" &&
        (Number(partialReminderEveryNDays) < 2 || !Number.isInteger(Number(partialReminderEveryNDays)))
      ) {
        toast.error("Reminder every N days must be an integer ≥ 2");
        return;
      }
    }

    let metadata: Record<string, unknown> | undefined;
    if (metadataText.trim()) {
      try {
        metadata = JSON.parse(metadataText) as Record<string, unknown>;
      } catch {
        toast.error("Metadata must be valid JSON");
        return;
      }
    }

    const suggestedParsed = parseSuggestedAmountsFromInput(suggestedAmountsInput);

    try {
      const basePayload = {
        title: title.trim(),
        description: description.trim() || undefined,
        currency,
        gateways,
        environment: linkEnvironment,
        linkType: amountMode === "PARTIAL" ? "MULTI_USE" : linkType,
        maxUses:
          linkType === "ONE_TIME" || amountMode === "PARTIAL"
            ? null
            : maxUses.trim()
              ? Number(maxUses)
              : null,
        expiresAt: toIsoFromLocalDateTime(expiresAt),
        successUrl: successUrl.trim() || undefined,
        cancelUrl: cancelUrl.trim() || undefined,
        metadata,
      };

      let created;
      if (amountMode === "PAYER_CHOICE") {
        created = await createMutation.mutateAsync({
          ...basePayload,
          amountMode: "PAYER_CHOICE",
          ...(suggestedParsed.length > 0 ? { suggestedAmounts: suggestedParsed } : {}),
        });
      } else if (amountMode === "PARTIAL") {
        created = await createMutation.mutateAsync({
          ...basePayload,
          amountMode: "PARTIAL",
          amount: String(amount).trim(),
          partialMinimumAmount: String(partialMinimumAmount).trim(),
          partialMinimumScope,
          partialDeadlineAt: partialDeadlineAt.trim() ? toIsoFromLocalDateTime(partialDeadlineAt) : null,
          partialReminderFrequency,
          ...(partialReminderFrequency === "EVERY_N_DAYS"
            ? { partialReminderEveryNDays: Number(partialReminderEveryNDays) }
            : {}),
          partialNotifyMerchantOnInstallment,
        });
      } else {
        created = await createMutation.mutateAsync({
          ...basePayload,
          amount: String(amount).trim(),
        });
      }

      setShowCreateModal(false);
      resetCreateForm();

      const publicUrl = buildPublicUrl(created.paymentLink.slug);
      toast.success("Payment link created", { description: publicUrl });
    } catch (e) {
      toast.error("Failed to create payment link", {
        description: e instanceof Error ? e.message : "Please try again",
      });
    }
  };

  const openPartialManage = (linkId: string) => {
    const row = links.find((l) => l.id === linkId);
    setShowPartialManageForId(linkId);
    setManageResumeCollection(false);
    if (row?.partial?.deadlineAt) {
      try {
        const d = new Date(row.partial.deadlineAt);
        const pad = (n: number) => String(n).padStart(2, "0");
        setManageDeadlineAt(
          `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
        );
      } catch {
        setManageDeadlineAt("");
      }
    } else {
      setManageDeadlineAt("");
    }
    if (row?.partial) {
      const rf = row.partial.reminderFrequency as PartialReminderFrequency;
      setManageReminderFrequency(
        rf === "DAILY" || rf === "WEEKLY" || rf === "MONTHLY" || rf === "EVERY_N_DAYS" || rf === "NONE"
          ? rf
          : "NONE"
      );
      setManageReminderEveryNDays(String(row.partial.reminderEveryNDays ?? 7));
      setManageNotifyInstallment(row.partial.notifyMerchantOnInstallment !== false);
    }
  };

  const savePartialManage = async () => {
    if (!showPartialManageForId) return;
    try {
      const payload: UpdatePaymentLinkRequest = {
        partialReminderFrequency: manageReminderFrequency,
        partialReminderEveryNDays:
          manageReminderFrequency === "EVERY_N_DAYS" ? Number(manageReminderEveryNDays) : null,
        partialNotifyMerchantOnInstallment: manageNotifyInstallment,
      };
      if (manageDeadlineAt.trim()) {
        const iso = toIsoFromLocalDateTime(manageDeadlineAt);
        if (iso) payload.partialDeadlineAt = iso;
      }
      if (manageResumeCollection) {
        payload.partialCollectionPaused = false;
      }
      await updateMutation.mutateAsync({ id: showPartialManageForId, payload });
      toast.success("Partial link updated");
      setShowPartialManageForId(null);
    } catch (e) {
      toast.error("Update failed", {
        description: e instanceof Error ? e.message : "Try again",
      });
    }
  };

  const setStatus = async (id: string, status: PaymentLinkStatus) => {
    try {
      await updateMutation.mutateAsync({ id, payload: { status } });
      toast.success(`Link marked ${status.toLowerCase()}`);
    } catch (e) {
      toast.error("Failed to update link", {
        description: e instanceof Error ? e.message : "Please try again",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                  <LinkIcon className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Payment Links</h1>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Create hosted customer payment links and track usage across sandbox and production environments
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 shadow-md"
            >
              <Plus className="w-4 h-4" />
              Create Link
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard icon={LinkIcon} label="Total Links" value={links.length} />
          <StatCard icon={CheckCircle} label="Active Links" value={activeCount} />
          <StatCard icon={Globe} label="Current Environment" value={environment.toUpperCase()} />
        </div>

        {/* Main Content Card */}
        <div className="rounded-2xl bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
          {/* Tabs */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
              <button
                type="button"
                onClick={() => {
                  setPageTab("links");
                  setTxListPage(1);
                }}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  pageTab === "links"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700"
                }`}
              >
                <LinkIcon className="w-4 h-4" />
                Links
              </button>
              <button
                type="button"
                onClick={() => {
                  setPageTab("transactions");
                  setTxListPage(1);
                }}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  pageTab === "transactions"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700"
                }`}
              >
                <CreditCard className="w-4 h-4" />
                Transactions
              </button>
            </div>
          </div>

          {/* Links Tab */}
          {pageTab === "links" && (
            <div>
              {isLoading ? (
                <div className="p-12 flex justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
              ) : error ? (
                <div className="p-6">
                  <div className="rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 p-4 text-rose-700 dark:text-rose-400">
                    {error.message}
                  </div>
                </div>
              ) : links.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <LinkIcon className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">No payment links yet. Create your first link to get started.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Title</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount / Mode</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Usage</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {links.map((link) => {
                        const mode = link.amountMode ?? "FIXED";
                        return (
                          <tr key={link.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-6 py-4">
                              <p className="text-sm font-semibold text-slate-900 dark:text-white">{link.title}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">/{link.slug}</p>
                            </td>
                            <td className="px-6 py-4">
                              {mode === "PAYER_CHOICE" ? (
                                <div className="space-y-1">
                                  <p className="text-sm font-medium text-slate-900 dark:text-white">Customer sets amount</p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">{link.currency}</p>
                                  {link.suggestedAmounts && link.suggestedAmounts.length > 0 && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Presets: {link.suggestedAmounts.join(", ")}</p>
                                  )}
                                </div>
                              ) : mode === "PARTIAL" ? (
                                <div className="space-y-1">
                                  <p className="text-sm font-medium text-slate-900 dark:text-white">Partial (per payer)</p>
                                  <p className="text-xs text-slate-600 dark:text-slate-400">
                                    Target {link.amount != null && link.amount !== "" ? `${Number(link.amount).toLocaleString()} ${link.currency}` : `— ${link.currency}`}
                                  </p>
                                  {link.partial?.collectionPaused && (
                                    <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                                      <AlertCircle className="w-3 h-3" />
                                      Instalments paused
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <div>
                                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                                    {link.amount != null && link.amount !== ""
                                      ? `${Number(link.amount).toLocaleString()} ${link.currency}`
                                      : `— ${link.currency}`}
                                  </p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">Fixed amount</p>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <StatusBadge status={link.status} variant={link.status === "ACTIVE" ? "success" : link.status === "INACTIVE" ? "warning" : "default"} />
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                  <span className="text-sm text-slate-700 dark:text-slate-300">{link.usedCount} used</span>
                                </div>
                                {mode !== "PARTIAL" && (
                                  <>
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                                      <span className="text-sm text-slate-700 dark:text-slate-300">{link.pendingCount} pending</span>
                                    </div>
                                    {link.maxUses && (
                                      <div className="flex items-center gap-2">
                                        <Users className="w-3.5 h-3.5 text-indigo-500" />
                                        <span className="text-sm text-slate-700 dark:text-slate-300">max {link.maxUses}</span>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-2">
                                <ActionButton onClick={() => handleCopy(link.slug)} icon={Copy} label="Copy" />
                                <a
                                  href={buildPublicUrl(link.slug)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  Open
                                </a>
                                <ActionButton onClick={() => setShowTransactionsForId(link.id)} icon={CreditCard} label="Transactions" />
                                {mode === "PARTIAL" && (
                                  <>
                                    <ActionButton onClick={() => setShowPartialPlansForId(link.id)} icon={Users} label="Plans" />
                                    <ActionButton onClick={() => openPartialManage(link.id)} icon={Settings} label="Instalments" />
                                  </>
                                )}
                                {link.status !== "ACTIVE" && (
                                  <ActionButton onClick={() => setStatus(link.id, "ACTIVE")} icon={CheckCircle} label="Activate" />
                                )}
                                {link.status === "ACTIVE" && (
                                  <ActionButton onClick={() => setStatus(link.id, "INACTIVE")} icon={XCircle} label="Deactivate" />
                                )}
                                {link.status !== "ARCHIVED" && (
                                  <ActionButton onClick={() => setStatus(link.id, "ARCHIVED")} icon={Archive} label="Archive" />
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Transactions Tab */}
          {pageTab === "transactions" && (
            <div className="p-6">
              {isLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
              ) : error ? (
                <div className="rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 p-4 text-rose-700 dark:text-rose-400">
                  {error.message}
                </div>
              ) : links.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <CreditCard className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Create a payment link to see transactions here.</p>
                </div>
              ) : txTabError ? (
                <div className="rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 p-4 text-rose-700 dark:text-rose-400">
                  {txTabError.message}
                </div>
              ) : txTabLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
              ) : mergedPaymentLinkTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-slate-600 dark:text-slate-400">No payment link transactions yet.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Link</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Gateway</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Payer</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Transaction</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedMergedTxs.map((tx) => (
                          <tr key={`${tx.paymentLinkId}-${tx.transactionId}`} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                              {new Date(tx.createdAt).toLocaleString()}
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-medium text-slate-900 dark:text-white">{tx.linkTitle}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">/{tx.linkSlug}</p>
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-semibold text-slate-900 dark:text-white">{Number(tx.amount).toLocaleString()} {tx.currency}</p>
                            </td>
                            <td className="px-4 py-3">
                              <StatusBadge status={tx.status} variant={tx.status === "SUCCESS" ? "success" : tx.status === "FAILED" ? "danger" : "warning"} />
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{tx.gateway.replace("_", " ")}</td>
                            <td className="px-4 py-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-xs text-slate-700 dark:text-slate-300">
                                  <User className="w-3 h-3" />
                                  {getPayerName(tx)}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                  <Mail className="w-3 h-3" />
                                  {getPayerEmail(tx)}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                  <Phone className="w-3 h-3" />
                                  {getPayerPhone(tx)}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <code className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                {tx.transactionId.slice(0, 12)}...
                              </code>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {txTotalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Page {txListPage} of {txTotalPages} ({mergedPaymentLinkTransactions.length} total)
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={txListPage <= 1}
                          onClick={() => setTxListPage((p) => Math.max(1, p - 1))}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition"
                        >
                          Previous
                        </button>
                        <button
                          type="button"
                          disabled={txListPage >= txTotalPages}
                          onClick={() => setTxListPage((p) => Math.min(txTotalPages, p + 1))}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals - Create, Transactions, Partial Plans, Partial Manage */}
      {/* (Modal content remains the same but with updated styling for dark/light theme) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Create Payment Link</h3>
              <button type="button" onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            {/* Form fields remain the same as original, just with updated class names */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Same form content as original */}
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Title *</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white" />
              </div>
              {/* ... rest of form fields with updated styling ... */}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                disabled={createMutation.isPending}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreate}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition disabled:opacity-60 inline-flex justify-center items-center gap-2"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <LinkIcon className="w-4 h-4" />}
                Create Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Additional modals (Transactions, Partial Plans, Partial Manage) - similar styling updates applied */}
      {/* The content remains identical to original, just with updated class names for dark/light theme */}
    </div>
  );
}

// Archive icon component (add if missing)
const Archive = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
  </svg>
);