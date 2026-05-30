"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { AlertTriangle, CheckCircle2, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  isPartialPaymentLinkPublic,
  usePayPublicPaymentLink,
  usePublicPaymentLink,
  usePublicPaymentLinkTransactionStatus,
  effectivePayerChoiceChips,
  type PaymentLinkGateway,
} from "@/features/payment-links";
import { PartialPaymentLinkCheckout } from "@/components/payment-links/PartialPaymentLinkCheckout";
import {
  useCheckoutSession,
  useCheckoutSessionStatus,
  usePayCheckoutSession,
  isCheckoutSessionId,
  type CheckoutGateway,
  type CheckoutSession,
} from "@/features/checkout";

function isPaymentLinkTerminalStatus(status?: string): boolean {
  return status === "SUCCESS" || status === "FAILED";
}

function isCheckoutTerminalStatus(status?: string): boolean {
  return status === "PAID" || status === "FAILED" || status === "EXPIRED" || status === "CANCELLED";
}

function formatMoney(amount?: string | null, currency?: string | null) {
  const parsed = Number(amount);
  const safeAmount = Number.isFinite(parsed) ? parsed.toLocaleString() : amount || "0";
  return `${safeAmount} ${currency || ""}`.trim();
}

function gatewayLabel(gateway: string) {
  return gateway === "MTN_MOMO" ? "MTN Mobile Money" : "Orange Money";
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f0e8]">
      <Loader2 className="w-8 h-8 animate-spin text-crimson-red-600" />
    </div>
  );
}

function HostedCheckoutPage({ sessionId }: { sessionId: string }) {
  const sessionQuery = useCheckoutSession(sessionId);
  const payMutation = usePayCheckoutSession();

  const [gateway, setGateway] = useState<CheckoutGateway | "">("");
  const [msisdn, setMsisdn] = useState<string | null>(null);
  const [payerName, setPayerName] = useState<string | null>(null);
  const [payerEmail, setPayerEmail] = useState<string | null>(null);
  const [payerComment, setPayerComment] = useState<string | null>(null);
  const [quoteTotalAmount, setQuoteTotalAmount] = useState<string | null>(null);
  const [quoteCurrency, setQuoteCurrency] = useState<string | null>(null);
  const redirectStartedRef = useRef(false);

  const session = sessionQuery.data?.checkoutSession;
  const shouldPoll =
    !!sessionId &&
    (session?.status === "PROCESSING" || payMutation.data?.checkoutSession.status === "PROCESSING");
  const statusQuery = useCheckoutSessionStatus(sessionId, shouldPoll);

  const statusSession = statusQuery.data?.checkoutSession;
  const effectiveStatus =
    statusSession?.status ||
    payMutation.data?.checkoutSession.status ||
    session?.status;
  const effectiveRedirectUrl =
    statusSession?.redirectUrl ||
    payMutation.data?.checkoutSession.redirectUrl ||
    session?.redirectUrl;
  const finalFailureReason = statusSession?.failureReason || session?.failureReason;

  useEffect(() => {
    if (!effectiveStatus || !isCheckoutTerminalStatus(effectiveStatus) || !effectiveRedirectUrl || redirectStartedRef.current) {
      return;
    }
    redirectStartedRef.current = true;
    const timer = window.setTimeout(() => {
      window.location.assign(effectiveRedirectUrl);
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [effectiveRedirectUrl, effectiveStatus]);

  const selectedGateway = gateway || session?.selectedGateway || session?.gateways?.[0] || "";
  const displayedMsisdn = msisdn ?? session?.payerMsisdn ?? "";
  const displayedPayerName = payerName ?? session?.payerName ?? "";
  const displayedPayerEmail = payerEmail ?? session?.payerEmail ?? "";
  const displayedPayerComment = payerComment ?? session?.payerComment ?? "";
  /** After pay, always prefer `quote.totalAmount` (includes payer-paid fees when applicable). */
  const quoteTotalAfterPay =
    quoteTotalAmount || payMutation.data?.quote?.totalAmount || null;
  const quoteCurrencyAfterPay =
    quoteCurrency || payMutation.data?.quote?.currency || session?.currency || null;
  const redirecting = !!effectiveRedirectUrl && !!effectiveStatus && isCheckoutTerminalStatus(effectiveStatus);

  const canPay = useMemo(() => {
    return (
      !!session &&
      session.payable &&
      session.status === "PENDING" &&
      !!selectedGateway &&
      !!displayedMsisdn.trim() &&
      !payMutation.isPending
    );
  }, [displayedMsisdn, payMutation.isPending, selectedGateway, session]);

  const handlePay = async () => {
    if (!session || !selectedGateway) {
      toast.error("Please select a payment method");
      return;
    }
    if (!displayedMsisdn.trim()) {
      toast.error("Phone number is required");
      return;
    }

    try {
      const result = await payMutation.mutateAsync({
        id: session.id,
        payload: {
          gateway: selectedGateway as CheckoutGateway,
          payer: {
            msisdn: displayedMsisdn.trim(),
            name: displayedPayerName.trim() || undefined,
            email: displayedPayerEmail.trim() || undefined,
          },
          comment: displayedPayerComment.trim() || undefined,
          idempotencyKey: `checkout-${session.id}-${Date.now()}`,
        },
      });

      setQuoteTotalAmount(result.quote.totalAmount);
      setQuoteCurrency(result.quote.currency);
      toast.success("Payment started", {
        description: "Please approve the payment prompt on your phone.",
      });
    } catch (error) {
      toast.error("Payment failed to start", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  if (sessionQuery.isLoading) return <LoadingScreen />;

  if (sessionQuery.error || !session) {
    return (
      <CheckoutStateCard
        title="Checkout unavailable"
        message={sessionQuery.error?.message || "This checkout session could not be loaded."}
      />
    );
  }

  const formDisabled = !session.payable || session.status !== "PENDING" || payMutation.isPending;

  return (
    <main className="min-h-screen bg-[#f4f0e8] px-4 py-8 text-slate-950">
      <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_420px]">
        <section className="overflow-hidden rounded-[2rem] border border-black/10 bg-[#fffaf0] shadow-2xl shadow-slate-900/10">
          <div className="border-b border-black/10 bg-[radial-gradient(circle_at_top_left,#f97316_0,#f97316_28%,#111827_29%,#111827_100%)] p-8 text-white">
            <div className="flex items-center gap-4">
              {session.merchantLogoUrl ? (
                <img
                  src={session.merchantLogoUrl}
                  alt={session.merchantName}
                  className="h-16 w-16 rounded-2xl border border-white/30 bg-white object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-xl font-black">
                  {session.merchantName ? session.merchantName.substring(0, 2).toUpperCase() : "ZP"}
                </div>
              )}
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-white/70">Secure checkout</p>
                <h1 className="mt-1 text-2xl font-black">{session.merchantName || "ZitoPay Checkout"}</h1>
              </div>
            </div>
            {session.description ? (
              <p className="mt-6 max-w-2xl text-sm leading-6 text-white/80">{session.description}</p>
            ) : null}
          </div>

          <div className="space-y-5 p-6 md:p-8">
            <CheckoutStatusBanner
              session={session}
              status={effectiveStatus}
              failureReason={finalFailureReason}
              redirecting={redirecting}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Payment method</span>
                <select
                  value={selectedGateway}
                  onChange={(event) => setGateway(event.target.value as CheckoutGateway)}
                  disabled={formDisabled}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-crimson-red-500 transition focus:ring-2 disabled:opacity-60"
                >
                  {session.gateways.map((item) => (
                    <option key={item} value={item}>
                      {gatewayLabel(item)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Mobile money number</span>
                <input
                  value={displayedMsisdn}
                  onChange={(event) => setMsisdn(event.target.value)}
                  disabled={formDisabled}
                  placeholder="2376XXXXXXXX"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-crimson-red-500 transition focus:ring-2 disabled:opacity-60"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Name (optional)</span>
                <input
                  value={displayedPayerName}
                  onChange={(event) => setPayerName(event.target.value)}
                  disabled={formDisabled}
                  placeholder="Customer name"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-crimson-red-500 transition focus:ring-2 disabled:opacity-60"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Email (optional)</span>
                <input
                  type="email"
                  value={displayedPayerEmail}
                  onChange={(event) => setPayerEmail(event.target.value)}
                  disabled={formDisabled}
                  placeholder="customer@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-crimson-red-500 transition focus:ring-2 disabled:opacity-60"
                />
              </label>
            </div>

            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Comment to merchant (optional)</span>
              <textarea
                value={displayedPayerComment}
                onChange={(event) => setPayerComment(event.target.value)}
                disabled={formDisabled}
                rows={4}
                placeholder="Delivery note, order detail, or message for the merchant"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-crimson-red-500 transition focus:ring-2 disabled:opacity-60"
              />
            </label>

            <button
              type="button"
              onClick={handlePay}
              disabled={!canPay}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-4 text-sm font-black text-white transition hover:bg-crimson-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {payMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              Pay {formatMoney(session.amount, session.currency)}
            </button>
            {!quoteTotalAfterPay ? (
              <p className="text-center text-xs text-slate-500">
                Your phone may ask you to approve a different total if fees apply (see total to approve below after you continue).
              </p>
            ) : null}
          </div>
        </section>

        <aside className="h-fit rounded-[2rem] border border-black/10 bg-white p-6 shadow-xl shadow-slate-900/5">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-crimson-red-600">Order summary</p>
          <div className="mt-5 space-y-4">
            <SummaryLine label="Merchant" value={session.merchantName || "ZitoPay merchant"} />
            <SummaryLine label="Order amount" value={formatMoney(session.amount, session.currency)} />
            <SummaryLine
              label="Total to approve"
              value={
                quoteTotalAfterPay && quoteCurrencyAfterPay
                  ? formatMoney(quoteTotalAfterPay, quoteCurrencyAfterPay)
                  : "Shown after you continue (quote includes fees when applicable)"
              }
              strong={!!quoteTotalAfterPay}
            />
            <SummaryLine label="Status" value={effectiveStatus || session.status} />
            <SummaryLine label="Expires" value={new Date(session.expiresAt).toLocaleString()} />
          </div>
          {payMutation.data?.quote ? (
            <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm">
              <p className="font-bold text-slate-900">Fee breakdown</p>
              <p className="mt-1 text-xs text-slate-500">
                Use <strong>Total to approve</strong> as the amount to confirm on mobile money.
              </p>
              <div className="mt-3 space-y-2">
                <SummaryLine label="Gateway fee" value={formatMoney(payMutation.data.quote.gatewayFee, payMutation.data.quote.currency)} />
                <SummaryLine label="Platform fee" value={formatMoney(payMutation.data.quote.platformFee, payMutation.data.quote.currency)} />
              </div>
            </div>
          ) : null}
          {statusSession?.transactionId || payMutation.data?.transaction.transactionId ? (
            <p className="mt-5 break-all rounded-2xl bg-slate-950 p-4 font-mono text-xs text-white/80">
              {statusSession?.transactionId || payMutation.data?.transaction.transactionId}
            </p>
          ) : null}
        </aside>
      </div>
    </main>
  );
}

function CheckoutStatusBanner({
  session,
  status,
  failureReason,
  redirecting,
}: {
  session: CheckoutSession;
  status?: string;
  failureReason?: string | null;
  redirecting: boolean;
}) {
  if (!session.payable || status === "EXPIRED") {
    return (
      <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        This checkout session has expired or is no longer payable.
      </div>
    );
  }

  if (status === "PAID") {
    return (
      <div className="flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
        {redirecting ? "Payment successful. Redirecting you now..." : "Payment successful."}
      </div>
    );
  }

  if (status === "FAILED" || status === "CANCELLED") {
    return (
      <div className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        {failureReason || "Payment could not be completed."}
      </div>
    );
  }

  if (status === "PROCESSING") {
    return (
      <div className="flex gap-3 rounded-2xl border border-deep-blue-violet-200 bg-deep-blue-violet-50 p-4 text-sm text-deep-blue-violet-900">
        <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin" />
        Payment request sent. Please approve it on your phone.
      </div>
    );
  }

  return (
    <div className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-crimson-red-600" />
      Your payment is processed securely by ZitoPay. We will never ask for your PIN here.
    </div>
  );
}

function CheckoutStateCard({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f0e8] p-4">
      <div className="w-full max-w-xl rounded-3xl border border-black/10 bg-white p-8 text-center shadow-xl">
        <h1 className="text-2xl font-black text-slate-950">{title}</h1>
        <p className="mt-3 text-sm text-slate-600">{message}</p>
      </div>
    </div>
  );
}

function SummaryLine({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className={strong ? "text-right font-black text-slate-950" : "text-right font-semibold text-slate-900"}>
        {value}
      </span>
    </div>
  );
}

const PAY_LINK_POLL_MS = 5000;

function PaymentLinkPage({ slug }: { slug: string }) {
  const [gateway, setGateway] = useState<PaymentLinkGateway | "">("");
  const [msisdn, setMsisdn] = useState("");
  const [payerName, setPayerName] = useState("");
  const [payerEmail, setPayerEmail] = useState("");
  const [payerComment, setPayerComment] = useState("");
  /** For PAYER_CHOICE links: base amount entered by the customer before pay. */
  const [payerAmount, setPayerAmount] = useState("");

  const [activeTransactionId, setActiveTransactionId] = useState<string | null>(null);
  const [quoteTotalAmount, setQuoteTotalAmount] = useState<string | null>(null);
  const [quoteCurrency, setQuoteCurrency] = useState<string | null>(null);

  const publicLinkQuery = usePublicPaymentLink(slug, !!slug);
  const payMutation = usePayPublicPaymentLink();

  const statusQuery = usePublicPaymentLinkTransactionStatus(
    slug,
    activeTransactionId || "",
    !!slug && !!activeTransactionId
  );

  const currentStatus = statusQuery.data?.transaction?.status ?? payMutation.data?.transaction?.status;
  const customerPaidAmount =
    quoteTotalAmount ||
    statusQuery.data?.transaction?.totalAmount ||
    payMutation.data?.quote?.totalAmount ||
    null;
  const customerPaidCurrency =
    quoteCurrency ||
    statusQuery.data?.transaction?.currency ||
    payMutation.data?.quote?.currency ||
    publicLinkQuery.data?.paymentLink?.currency ||
    null;
  const done = isPaymentLinkTerminalStatus(currentStatus);

  const selectedGateway = gateway || publicLinkQuery.data?.paymentLink?.gateways?.[0] || "";
  const refetchStatus = statusQuery.refetch;

  useEffect(() => {
    if (!activeTransactionId || done) return;
    const timer = window.setInterval(() => {
      refetchStatus();
    }, PAY_LINK_POLL_MS);
    return () => window.clearInterval(timer);
  }, [activeTransactionId, done, refetchStatus]);

  useEffect(() => {
    setPayerAmount("");
  }, [slug]);

  const canPay = useMemo(() => {
    const link = publicLinkQuery.data?.paymentLink;
    if (!link || !link.payable || link.status !== "ACTIVE" || !selectedGateway || !msisdn.trim() || payMutation.isPending) {
      return false;
    }
    const mode = link.amountMode ?? "FIXED";
    if (mode === "PAYER_CHOICE") {
      const n = Number(payerAmount);
      return Number.isFinite(n) && n > 0;
    }
    return true;
  }, [publicLinkQuery.data, selectedGateway, msisdn, payMutation.isPending, payerAmount]);

  const handlePay = async () => {
    if (!selectedGateway) {
      toast.error("Please select a gateway");
      return;
    }
    if (!msisdn.trim()) {
      toast.error("Phone number is required");
      return;
    }

    const link = publicLinkQuery.data?.paymentLink;
    const mode = link?.amountMode ?? "FIXED";
    if (mode === "PAYER_CHOICE") {
      const n = Number(payerAmount);
      if (!Number.isFinite(n) || n <= 0) {
        toast.error("Enter a valid amount");
        return;
      }
    }

    try {
      const result = await payMutation.mutateAsync({
        slug,
        payload: {
          gateway: selectedGateway as PaymentLinkGateway,
          payer: {
            msisdn: msisdn.trim(),
            name: payerName.trim() || undefined,
            email: payerEmail.trim() || undefined,
          },
          ...(mode === "PAYER_CHOICE" ? { amount: String(Number(payerAmount)) } : {}),
          comment: payerComment.trim() || undefined,
          idempotencyKey: `pl-${slug}-${Date.now()}`,
        },
      });

      setActiveTransactionId(result.transaction.transactionId);
      setQuoteTotalAmount(result.quote.totalAmount);
      setQuoteCurrency(result.quote.currency);

      toast.success("Payment started", {
        description: "Please approve the payment prompt on your phone.",
      });
    } catch (e) {
      toast.error("Payment failed to start", {
        description: e instanceof Error ? e.message : "Please try again.",
      });
    }
  };

  if (publicLinkQuery.isLoading) return <LoadingScreen />;

  if (publicLinkQuery.error || !publicLinkQuery.data?.paymentLink) {
    return (
      <CheckoutStateCard
        title="Payment link unavailable"
        message={publicLinkQuery.error?.message || "This link could not be loaded."}
      />
    );
  }

  const link = publicLinkQuery.data.paymentLink;
  if (isPartialPaymentLinkPublic(link)) {
    return <PartialPaymentLinkCheckout slug={slug} />;
  }

  const amountMode = link.amountMode ?? "FIXED";
  const payerChoiceChips = effectivePayerChoiceChips(link.suggestedAmounts, link.currency);

  return (
    <div className="min-h-screen bg-muted/20 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-background border border-border rounded-2xl p-6 space-y-6">
        <div className="flex items-start gap-4">
          {link.merchantLogoUrl ? (
            <img
              src={link.merchantLogoUrl}
              alt={link.merchantName}
              className="w-14 h-14 rounded-xl object-cover border border-border shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-crimson-red-500 flex items-center justify-center text-white font-bold text-xl shrink-0">
              {link.merchantName ? link.merchantName.substring(0, 2).toUpperCase() : "M"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{link.merchantName}</p>
            <h1 className="text-2xl font-bold text-foreground mt-1">{link.title}</h1>
            {link.description ? <p className="text-sm text-muted-foreground mt-2">{link.description}</p> : null}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <p className="text-xs text-muted-foreground">Amount</p>
          {amountMode === "PAYER_CHOICE" ? (
            <>
              <p className="text-2xl font-bold text-foreground mt-1">You choose</p>
              <p className="text-sm text-muted-foreground mt-1">
                Enter the amount you want to pay in {link.currency}. Fees may apply per the merchant&apos;s settings.
              </p>
            </>
          ) : (
            <p className="text-2xl font-bold text-foreground mt-1">
              {formatMoney(link.amount, link.currency)}
            </p>
          )}
          {customerPaidAmount && customerPaidCurrency ? (
            <p className="text-xs text-muted-foreground mt-2">
              Amount to approve on mobile money: <strong>{formatMoney(customerPaidAmount, customerPaidCurrency)}</strong>
            </p>
          ) : null}
        </div>

        {!link.payable || link.status !== "ACTIVE" ? (
          <div className="rounded-lg border border-crimson-red-200 bg-crimson-red-50 dark:bg-crimson-red-900/10 p-4 text-sm text-crimson-red-700 dark:text-crimson-red-300">
            This payment link is currently unavailable.
          </div>
        ) : (
          <div className="space-y-4">
            {amountMode === "PAYER_CHOICE" ? (
              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">
                  Your amount ({link.currency}) *
                </label>
                <input
                  type="number"
                  min={0}
                  step="any"
                  inputMode="decimal"
                  value={payerAmount}
                  onChange={(e) => setPayerAmount(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {payerChoiceChips.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setPayerAmount(String(chip))}
                      className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-foreground hover:bg-muted"
                    >
                      {chip.toLocaleString()}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Quick amounts are shortcuts; you can type any allowed value.
                </p>
              </div>
            ) : null}

            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">Gateway</label>
              <select
                value={selectedGateway}
                onChange={(e) => setGateway(e.target.value as PaymentLinkGateway)}
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm"
              >
                {link.gateways.map((g) => (
                  <option key={g} value={g}>{gatewayLabel(g)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">Phone Number (MSISDN) *</label>
              <input
                value={msisdn}
                onChange={(e) => setMsisdn(e.target.value)}
                placeholder="2376XXXXXXXX"
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">Name (optional)</label>
                <input
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">Email (optional)</label>
                <input
                  type="email"
                  value={payerEmail}
                  onChange={(e) => setPayerEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">Comment to merchant (optional)</label>
              <textarea
                value={payerComment}
                onChange={(e) => setPayerComment(e.target.value)}
                rows={3}
                placeholder="Add a reference, order note, or message for the merchant"
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm"
              />
            </div>

            <button
              type="button"
              onClick={handlePay}
              disabled={!canPay}
              className="w-full px-4 py-2 bg-crimson-red-500 text-white rounded-lg text-sm font-semibold hover:bg-crimson-red-600 disabled:opacity-60 inline-flex justify-center items-center gap-2"
            >
              {payMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Pay now
            </button>
          </div>
        )}

        {(activeTransactionId || statusQuery.data) && (
          <div className="rounded-lg border border-border p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Payment Status</h2>
              {!done && (
                <button
                  type="button"
                  onClick={() => statusQuery.refetch()}
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 border border-border rounded hover:bg-muted"
                >
                  <RefreshCw className="w-3 h-3" /> Refresh
                </button>
              )}
            </div>

            <p className="text-sm text-foreground">
              Status: <strong>{currentStatus || "VERIFYING"}</strong>
            </p>
            {customerPaidAmount && customerPaidCurrency ? (
              <p className="text-sm text-foreground">
                Customer-paid amount: <strong>{formatMoney(customerPaidAmount, customerPaidCurrency)}</strong>
              </p>
            ) : null}
            {statusQuery.data?.transaction?.failureReason ? (
              <p className="text-xs text-red-600">Reason: {statusQuery.data.transaction.failureReason}</p>
            ) : null}
            {statusQuery.data?.transaction?.transactionId ? (
              <p className="text-xs font-mono text-muted-foreground break-all">
                {statusQuery.data.transaction.transactionId}
              </p>
            ) : null}

            {done && statusQuery.data?.paymentLink?.successUrl && currentStatus === "SUCCESS" ? (
              <a href={statusQuery.data.paymentLink.successUrl} className="inline-block text-xs text-crimson-red-600 hover:underline">
                Continue
              </a>
            ) : null}

            {done && statusQuery.data?.paymentLink?.cancelUrl && currentStatus === "FAILED" ? (
              <a href={statusQuery.data.paymentLink.cancelUrl} className="inline-block text-xs text-crimson-red-600 hover:underline">
                Return
              </a>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PublicPayPage() {
  const params = useParams<{ slug: string }>();
  const segment = String(params?.slug ?? "").trim();

  if (!segment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f0e8] p-4">
        <CheckoutStateCard title="Invalid link" message="No payment reference was provided in the URL." />
      </div>
    );
  }

  const treatAsHostedCheckout = isCheckoutSessionId(segment);
  const checkoutQuery = useCheckoutSession(segment, treatAsHostedCheckout);

  if (treatAsHostedCheckout) {
    if (checkoutQuery.isLoading) return <LoadingScreen />;
    if (checkoutQuery.data?.checkoutSession) {
      return <HostedCheckoutPage sessionId={segment} />;
    }
    if (checkoutQuery.isError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#f4f0e8] p-4">
          <CheckoutStateCard
            title="Checkout unavailable"
            message={checkoutQuery.error?.message || "This checkout session could not be loaded."}
          />
        </div>
      );
    }
    return <LoadingScreen />;
  }

  return <PaymentLinkPage slug={segment} />;
}
