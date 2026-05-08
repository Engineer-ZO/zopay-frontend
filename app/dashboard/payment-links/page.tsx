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

function transactionStatusClass(status: string): string {
  switch (status) {
    case "SUCCESS":
      return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400";
    case "FAILED":
      return "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400";
    case "VERIFYING":
    case "PENDING":
    case "PROCESSING":
      return "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400";
    default:
      return "bg-muted text-muted-foreground";
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
      return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400";
    case "INACTIVE":
      return "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400";
    case "ARCHIVED":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-muted text-muted-foreground";
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
  const [partialReminderFrequency, setPartialReminderFrequency] =
    useState<PartialReminderFrequency>("NONE");
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
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Payment Links</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Create hosted customer payment links and track usage.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Link
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-background rounded-xl p-4 border border-border">
          <p className="text-xs text-muted-foreground">Total Links</p>
          <p className="text-xl font-bold text-foreground mt-1">{links.length}</p>
        </div>
        <div className="bg-background rounded-xl p-4 border border-border">
          <p className="text-xs text-muted-foreground">Active Links</p>
          <p className="text-xl font-bold text-foreground mt-1">{activeCount}</p>
        </div>
        <div className="bg-background rounded-xl p-4 border border-border">
          <p className="text-xs text-muted-foreground">Current Environment</p>
          <p className="text-xl font-bold text-foreground mt-1 uppercase">{environment}</p>
        </div>
      </div>

      <div className="bg-background rounded-xl border border-border overflow-hidden">
        <div className="p-3 border-b border-border flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2 p-1 bg-muted/40 rounded-xl border border-border w-fit">
            <button
              type="button"
              onClick={() => {
                setPageTab("links");
                setTxListPage(1);
              }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                pageTab === "links"
                  ? "bg-orange-500 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/80"
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
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                pageTab === "transactions"
                  ? "bg-orange-500 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/80"
              }`}
            >
              Transactions
            </button>
          </div>
          <button
            type="button"
            onClick={() => refreshLinksAndTx()}
            className="text-xs inline-flex items-center gap-1 px-2 py-1 border border-border rounded hover:bg-muted self-start sm:self-auto"
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>

        {pageTab === "links" && isLoading ? (
          <div className="p-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : pageTab === "links" && error ? (
          <div className="p-6 text-sm text-red-600">{error.message}</div>
        ) : pageTab === "links" && links.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">No payment links yet.</div>
        ) : pageTab === "links" ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase">Title</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase">Amount / mode</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase">Usage</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {links.map((link) => {
                  const mode = link.amountMode ?? "FIXED";
                  return (
                  <tr key={link.id} className="border-b border-border last:border-b-0">
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-foreground">{link.title}</p>
                      <p className="text-xs text-muted-foreground">/{link.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      {mode === "PAYER_CHOICE" ? (
                        <div className="space-y-1">
                          <p className="font-medium">Customer sets amount</p>
                          <p className="text-xs text-muted-foreground">{link.currency}</p>
                          {link.suggestedAmounts && link.suggestedAmounts.length > 0 ? (
                            <p className="text-[11px] text-muted-foreground">
                              Presets: {link.suggestedAmounts.join(", ")}
                            </p>
                          ) : null}
                        </div>
                      ) : mode === "PARTIAL" ? (
                        <div className="space-y-1">
                          <p className="font-medium">Partial (per payer)</p>
                          <p className="text-xs text-muted-foreground">
                            Target {link.amount != null && link.amount !== "" ? `${Number(link.amount).toLocaleString()} ${link.currency}` : `— ${link.currency}`}
                          </p>
                          {link.partial?.collectionPaused ? (
                            <p className="text-[11px] font-medium text-amber-700 dark:text-amber-400">Instalments paused</p>
                          ) : null}
                        </div>
                      ) : (
                        <span>
                          {link.amount != null && link.amount !== ""
                            ? `${Number(link.amount).toLocaleString()} ${link.currency}`
                            : `— ${link.currency}`}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded text-[11px] font-medium ${statusClass(link.status)}`}>
                        {link.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {mode === "PARTIAL" ? (
                        <span>Per-email instalments (ledger in Transactions / Payer plans)</span>
                      ) : (
                        <span>
                          {link.usedCount} used / {link.pendingCount} pending{link.maxUses ? ` / max ${link.maxUses}` : ""}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopy(link.slug)}
                          className="inline-flex items-center gap-1 px-2 py-1 border border-border rounded text-xs hover:bg-muted"
                        >
                          <Copy className="w-3 h-3" /> Copy
                        </button>
                        <a
                          href={buildPublicUrl(link.slug)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 border border-border rounded text-xs hover:bg-muted"
                        >
                          <ExternalLink className="w-3 h-3" /> Open
                        </a>
                        <button
                          type="button"
                          onClick={() => setShowTransactionsForId(link.id)}
                          className="inline-flex items-center gap-1 px-2 py-1 border border-border rounded text-xs hover:bg-muted"
                        >
                          Transactions
                        </button>
                        {mode === "PARTIAL" && (
                          <>
                            <button
                              type="button"
                              onClick={() => setShowPartialPlansForId(link.id)}
                              className="inline-flex items-center gap-1 px-2 py-1 border border-border rounded text-xs hover:bg-muted"
                            >
                              Payer plans
                            </button>
                            <button
                              type="button"
                              onClick={() => openPartialManage(link.id)}
                              className="inline-flex items-center gap-1 px-2 py-1 border border-border rounded text-xs hover:bg-muted"
                            >
                              Instalment settings
                            </button>
                          </>
                        )}
                        {link.status !== "ACTIVE" && (
                          <button
                            type="button"
                            onClick={() => setStatus(link.id, "ACTIVE")}
                            className="px-2 py-1 border border-border rounded text-xs hover:bg-muted"
                          >
                            Activate
                          </button>
                        )}
                        {link.status === "ACTIVE" && (
                          <button
                            type="button"
                            onClick={() => setStatus(link.id, "INACTIVE")}
                            className="px-2 py-1 border border-border rounded text-xs hover:bg-muted"
                          >
                            Deactivate
                          </button>
                        )}
                        {link.status !== "ARCHIVED" && (
                          <button
                            type="button"
                            onClick={() => setStatus(link.id, "ARCHIVED")}
                            className="px-2 py-1 border border-border rounded text-xs hover:bg-muted"
                          >
                            Archive
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : pageTab === "transactions" && isLoading ? (
          <div className="p-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : pageTab === "transactions" && error ? (
          <div className="p-6 text-sm text-red-600">{error.message}</div>
        ) : pageTab === "transactions" && links.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">Create a payment link to see transactions here.</div>
        ) : pageTab === "transactions" ? (
          <div className="p-3 space-y-3">
            <p className="text-xs text-muted-foreground px-1">
              All collections recorded for your payment links (newest first). The full Transactions page still lists your
              complete ledger.
            </p>
            {txTabError ? (
              <div className="px-1 text-sm text-red-600">{txTabError.message}</div>
            ) : null}
            {txTabLoading ? (
              <div className="p-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : mergedPaymentLinkTransactions.length === 0 ? (
              <div className="p-10 text-center text-sm text-muted-foreground">No payment link transactions yet.</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border">
                        <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase">Date</th>
                        <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase">Link</th>
                        <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase">Amount</th>
                        <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase">Status</th>
                        <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase">Gateway</th>
                        <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase">Payer</th>
                        <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase">Transaction</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedMergedTxs.map((tx) => (
                        <tr key={`${tx.paymentLinkId}-${tx.transactionId}`} className="border-b border-border last:border-b-0">
                          <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(tx.createdAt).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <p className="font-medium text-foreground">{tx.linkTitle}</p>
                            <p className="text-xs text-muted-foreground">/{tx.linkSlug}</p>
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground">
                            {Number(tx.amount).toLocaleString()} {tx.currency}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex px-2 py-1 rounded text-[11px] font-medium ${transactionStatusClass(tx.status)}`}
                            >
                              {tx.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-foreground">{tx.gateway.replace("_", " ")}</td>
                          <td className="px-4 py-3 text-xs">
                            <p className="text-foreground wrap-break-word">{getPayerName(tx)}</p>
                            <p className="text-muted-foreground wrap-break-word">{getPayerEmail(tx)}</p>
                          </td>
                          <td className="px-4 py-3 text-xs font-mono text-muted-foreground wrap-break-word">
                            {tx.transactionId}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {txTotalPages > 1 ? (
                  <div className="flex items-center justify-between px-2 py-2 border-t border-border text-xs text-muted-foreground">
                    <span>
                      Page {txListPage} of {txTotalPages} ({mergedPaymentLinkTransactions.length} total)
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={txListPage <= 1}
                        onClick={() => setTxListPage((p) => Math.max(1, p - 1))}
                        className="px-2 py-1 border border-border rounded hover:bg-muted disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        disabled={txListPage >= txTotalPages}
                        onClick={() => setTxListPage((p) => Math.min(txTotalPages, p + 1))}
                        className="px-2 py-1 border border-border rounded hover:bg-muted disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>
        ) : null}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-background rounded-2xl p-6 shadow-2xl border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Create Payment Link</h3>
              <button type="button" onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-muted rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-foreground mb-1.5 block">Title *</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 bg-muted border border-border rounded text-sm" />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-medium text-foreground mb-1.5 block">Description (optional)</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full px-3 py-2 bg-muted border border-border rounded text-sm" />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-medium text-foreground mb-1.5 block">Amount mode</label>
                <select
                  value={amountMode}
                  onChange={(e) => setAmountMode(e.target.value as PaymentLinkAmountMode)}
                  className="w-full px-3 py-2 bg-muted border border-border rounded text-sm"
                >
                  <option value="FIXED">Fixed amount</option>
                  <option value="PAYER_CHOICE">Customer chooses amount</option>
                  <option value="PARTIAL">Partial (per-email target and instalments)</option>
                </select>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Partial: payer enters email on checkout (no OTP), pays toward their own target in instalments (minimum rules enforced by the API).
                </p>
              </div>

              {amountMode === "FIXED" ? (
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Amount *</label>
                  <input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-3 py-2 bg-muted border border-border rounded text-sm" />
                </div>
              ) : amountMode === "PAYER_CHOICE" ? (
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Suggested amounts (optional)</label>
                  <input
                    type="text"
                    value={suggestedAmountsInput}
                    onChange={(e) => setSuggestedAmountsInput(e.target.value)}
                    placeholder="e.g. 100, 500, 1000 (max 12, comma-separated)"
                    className="w-full px-3 py-2 bg-muted border border-border rounded text-sm"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Up to 12 values, each greater than zero. Leave empty to use default checkout presets for the currency.
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-1.5 block">Target per payer *</label>
                    <input
                      type="number"
                      min="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-3 py-2 bg-muted border border-border rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-1.5 block">Minimum instalment *</label>
                    <input
                      type="number"
                      min="1"
                      value={partialMinimumAmount}
                      onChange={(e) => setPartialMinimumAmount(e.target.value)}
                      className="w-full px-3 py-2 bg-muted border border-border rounded text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-medium text-foreground mb-1.5 block">Minimum applies to</label>
                    <select
                      value={partialMinimumScope}
                      onChange={(e) => setPartialMinimumScope(e.target.value as PartialMinimumScope)}
                      className="w-full px-3 py-2 bg-muted border border-border rounded text-sm"
                    >
                      <option value="EVERY_INSTALLMENT">Every instalment</option>
                      <option value="FIRST_PAYMENT_ONLY">First successful instalment only</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-medium text-foreground mb-1.5 block">Instalment deadline (optional)</label>
                    <input
                      type="datetime-local"
                      value={partialDeadlineAt}
                      onChange={(e) => setPartialDeadlineAt(e.target.value)}
                      className="w-full px-3 py-2 bg-muted border border-border rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-1.5 block">Payer reminder frequency</label>
                    <select
                      value={partialReminderFrequency}
                      onChange={(e) => setPartialReminderFrequency(e.target.value as PartialReminderFrequency)}
                      className="w-full px-3 py-2 bg-muted border border-border rounded text-sm"
                    >
                      <option value="NONE">NONE</option>
                      <option value="DAILY">DAILY</option>
                      <option value="WEEKLY">WEEKLY</option>
                      <option value="MONTHLY">MONTHLY</option>
                      <option value="EVERY_N_DAYS">EVERY_N_DAYS</option>
                    </select>
                  </div>
                  {partialReminderFrequency === "EVERY_N_DAYS" ? (
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1.5 block">Every N days (≥ 2)</label>
                      <input
                        type="number"
                        min={2}
                        step={1}
                        value={partialReminderEveryNDays}
                        onChange={(e) => setPartialReminderEveryNDays(e.target.value)}
                        className="w-full px-3 py-2 bg-muted border border-border rounded text-sm"
                      />
                    </div>
                  ) : null}
                  <div className="md:col-span-2 flex items-center gap-2">
                    <input
                      id="partialNotifyMerchant"
                      type="checkbox"
                      checked={partialNotifyMerchantOnInstallment}
                      onChange={(e) => setPartialNotifyMerchantOnInstallment(e.target.checked)}
                    />
                    <label htmlFor="partialNotifyMerchant" className="text-xs text-foreground">
                      Email merchant on each successful instalment
                    </label>
                  </div>
                </>
              )}

              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">Currency *</label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full px-3 py-2 bg-muted border border-border rounded text-sm">
                  <option value="XAF">XAF</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">Environment</label>
                <select
                  value={linkEnvironment}
                  onChange={(e) => setLinkEnvironment(e.target.value as "sandbox" | "production")}
                  className="w-full px-3 py-2 bg-muted border border-border rounded text-sm"
                >
                  <option value="sandbox">sandbox</option>
                  <option value="production">production</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">Link Type</label>
                <select
                  value={amountMode === "PARTIAL" ? "MULTI_USE" : linkType}
                  onChange={(e) => setLinkType(e.target.value as PaymentLinkType)}
                  disabled={amountMode === "PARTIAL"}
                  className="w-full px-3 py-2 bg-muted border border-border rounded text-sm disabled:opacity-60"
                >
                  <option value="MULTI_USE">MULTI_USE</option>
                  {amountMode !== "PARTIAL" ? <option value="ONE_TIME">ONE_TIME</option> : null}
                </select>
                {amountMode === "PARTIAL" ? (
                  <p className="text-[11px] text-muted-foreground mt-1">Partial links require MULTI_USE.</p>
                ) : null}
              </div>

              {linkType === "MULTI_USE" && amountMode !== "PARTIAL" && (
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Max Uses (optional)</label>
                  <input
                    type="number"
                    min="1"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    className="w-full px-3 py-2 bg-muted border border-border rounded text-sm"
                    placeholder="Leave empty for unlimited"
                  />
                </div>
              )}

              <div className="md:col-span-2">
                <label className="text-xs font-medium text-foreground mb-1.5 block">Gateways</label>
                <div className="flex flex-wrap gap-4 text-sm">
                  {DEFAULT_GATEWAYS.map((gateway) => (
                    <label key={gateway} className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={gateways.includes(gateway)}
                        onChange={() => toggleGateway(gateway)}
                      />
                      {gateway}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">Expires At (optional)</label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full px-3 py-2 bg-muted border border-border rounded text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">Success URL (optional)</label>
                <input
                  type="url"
                  value={successUrl}
                  onChange={(e) => setSuccessUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-muted border border-border rounded text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-medium text-foreground mb-1.5 block">Cancel URL (optional)</label>
                <input
                  type="url"
                  value={cancelUrl}
                  onChange={(e) => setCancelUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-muted border border-border rounded text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-medium text-foreground mb-1.5 block">Metadata (JSON) (optional)</label>
                <textarea
                  rows={3}
                  value={metadataText}
                  onChange={(e) => setMetadataText(e.target.value)}
                  className="w-full px-3 py-2 bg-muted border border-border rounded text-sm font-mono"
                  placeholder='{"invoiceId":"INV-1001"}'
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-border rounded text-sm font-semibold hover:bg-muted"
                disabled={createMutation.isPending}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreate}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded text-sm font-semibold hover:bg-orange-600 disabled:opacity-60 inline-flex justify-center items-center gap-2"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <LinkIcon className="w-4 h-4" />}
                Create Link
              </button>
            </div>
          </div>
        </div>
      )}

      {showTransactionsForId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowTransactionsForId(null)}>
          <div className="bg-background rounded-2xl p-6 shadow-2xl border border-border max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Link Transactions</h3>
              <button type="button" onClick={() => setShowTransactionsForId(null)} className="p-1 hover:bg-muted rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            {txQuery.isLoading ? (
              <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : txQuery.error ? (
              <p className="text-sm text-red-600">{txQuery.error.message}</p>
            ) : !txQuery.data?.transactions?.length ? (
              <p className="text-sm text-muted-foreground">No transactions yet for this link.</p>
            ) : (
              <div className="space-y-3">
                {txQuery.data.transactions.map((tx) => (
                  <div key={tx.transactionId} className="border border-border rounded-lg p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">{tx.status}</p>
                      <p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleString()}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {Number(tx.amount).toLocaleString()} {tx.currency} - {tx.gateway}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3 text-xs">
                      <div className="rounded border border-border/70 p-2">
                        <p className="text-[10px] uppercase text-muted-foreground">Payee Name</p>
                        <p className="font-medium text-foreground break-words">{getPayerName(tx)}</p>
                      </div>
                      <div className="rounded border border-border/70 p-2">
                        <p className="text-[10px] uppercase text-muted-foreground">Payee Email</p>
                        <p className="font-medium text-foreground break-words">{getPayerEmail(tx)}</p>
                      </div>
                      <div className="rounded border border-border/70 p-2">
                        <p className="text-[10px] uppercase text-muted-foreground">Payee Phone</p>
                        <p className="font-medium text-foreground break-words">{getPayerPhone(tx)}</p>
                      </div>
                    </div>
                    {tx.payerComment || tx.comment ? (
                      <div className="mt-2 rounded border border-border/70 p-2 text-xs">
                        <p className="text-[10px] uppercase text-muted-foreground">Comment</p>
                        <p className="font-medium text-foreground whitespace-pre-wrap">{tx.payerComment || tx.comment}</p>
                      </div>
                    ) : null}
                    <p className="text-xs font-mono text-muted-foreground mt-1">{tx.transactionId}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showPartialPlansForId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowPartialPlansForId(null)}>
          <div className="bg-background rounded-2xl p-6 shadow-2xl border border-border max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Payer plans</h3>
              <button type="button" onClick={() => setShowPartialPlansForId(null)} className="p-1 hover:bg-muted rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            {partialPlansQuery.isLoading ? (
              <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : partialPlansQuery.error ? (
              <p className="text-sm text-red-600">{partialPlansQuery.error.message}</p>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Target per payer:{" "}
                  <strong>
                    {Number(partialPlansQuery.data?.targetAmountPerPayer ?? 0).toLocaleString()}{" "}
                    {partialPlansQuery.data?.currency}
                  </strong>
                </p>
                {!partialPlansQuery.data?.plans?.length ? (
                  <p className="text-sm text-muted-foreground">No payer plans yet.</p>
                ) : (
                  <div className="overflow-x-auto border border-border rounded-lg">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50 border-b border-border">
                          <th className="text-left px-3 py-2 text-xs text-muted-foreground">Email</th>
                          <th className="text-left px-3 py-2 text-xs text-muted-foreground">Verified</th>
                          <th className="text-left px-3 py-2 text-xs text-muted-foreground">Total paid</th>
                          <th className="text-left px-3 py-2 text-xs text-muted-foreground">First instalment</th>
                          <th className="text-left px-3 py-2 text-xs text-muted-foreground">Updated</th>
                        </tr>
                      </thead>
                      <tbody>
                        {partialPlansQuery.data.plans.map((p) => (
                          <tr key={p.planId} className="border-b border-border last:border-b-0">
                            <td className="px-3 py-2 wrap-break-word">{p.payerEmail}</td>
                            <td className="px-3 py-2">{p.verified ? "Yes" : "No"}</td>
                            <td className="px-3 py-2">
                              {Number(p.totalPaid).toLocaleString()} {partialPlansQuery.data.currency}
                            </td>
                            <td className="px-3 py-2">{p.firstSuccessfulInstallmentRecorded ? "Yes" : "No"}</td>
                            <td className="px-3 py-2 text-xs text-muted-foreground">
                              {new Date(p.updatedAt).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {showPartialManageForId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowPartialManageForId(null)}>
          <div className="bg-background rounded-2xl p-6 shadow-2xl border border-border max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Instalment settings</h3>
              <button type="button" onClick={() => setShowPartialManageForId(null)} className="p-1 hover:bg-muted rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">New instalment deadline (optional)</label>
                <input
                  type="datetime-local"
                  value={manageDeadlineAt}
                  onChange={(e) => setManageDeadlineAt(e.target.value)}
                  className="w-full px-3 py-2 bg-muted border border-border rounded text-sm"
                />
                <p className="text-[11px] text-muted-foreground mt-1">Leave unchanged to keep current deadline unless you pick a new date.</p>
              </div>

              <div className="flex items-start gap-2">
                <input
                  id="manageResume"
                  type="checkbox"
                  checked={manageResumeCollection}
                  onChange={(e) => setManageResumeCollection(e.target.checked)}
                />
                <label htmlFor="manageResume" className="text-xs text-foreground leading-snug">
                  Resume collecting instalments (sets partial collection unpaused)
                </label>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">Reminder frequency</label>
                <select
                  value={manageReminderFrequency}
                  onChange={(e) => setManageReminderFrequency(e.target.value as PartialReminderFrequency)}
                  className="w-full px-3 py-2 bg-muted border border-border rounded text-sm"
                >
                  <option value="NONE">NONE</option>
                  <option value="DAILY">DAILY</option>
                  <option value="WEEKLY">WEEKLY</option>
                  <option value="MONTHLY">MONTHLY</option>
                  <option value="EVERY_N_DAYS">EVERY_N_DAYS</option>
                </select>
              </div>

              {manageReminderFrequency === "EVERY_N_DAYS" ? (
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Every N days (≥ 2)</label>
                  <input
                    type="number"
                    min={2}
                    step={1}
                    value={manageReminderEveryNDays}
                    onChange={(e) => setManageReminderEveryNDays(e.target.value)}
                    className="w-full px-3 py-2 bg-muted border border-border rounded text-sm"
                  />
                </div>
              ) : null}

              <div className="flex items-center gap-2">
                <input
                  id="manageNotify"
                  type="checkbox"
                  checked={manageNotifyInstallment}
                  onChange={(e) => setManageNotifyInstallment(e.target.checked)}
                />
                <label htmlFor="manageNotify" className="text-xs text-foreground">
                  Notify merchant on successful instalment
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPartialManageForId(null)}
                  className="flex-1 px-4 py-2 border border-border rounded text-sm font-semibold hover:bg-muted"
                  disabled={updateMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void savePartialManage()}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded text-sm font-semibold hover:bg-orange-600 disabled:opacity-60 inline-flex justify-center items-center gap-2"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
