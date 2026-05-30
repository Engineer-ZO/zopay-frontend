"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  isPartialPaymentLinkPublic,
  usePayPublicPaymentLink,
  usePublicPaymentLink,
  usePublicPaymentLinkTransactionStatus,
  type PaymentLinkGateway,
  type PaymentLinkPartialConfig,
  type PublicPaymentLink,
} from "@/features/payment-links";

function isPaymentLinkTerminalStatus(status?: string): boolean {
  return status === "SUCCESS" || status === "FAILED";
}

function gatewayLabel(gateway: string) {
  return gateway === "MTN_MOMO" ? "MTN Mobile Money" : "Orange Money";
}

function formatMoney(amount?: string | null, currency?: string | null) {
  const parsed = Number(amount);
  const safeAmount = Number.isFinite(parsed) ? parsed.toLocaleString() : amount || "0";
  return `${safeAmount} ${currency || ""}`.trim();
}

/** Client-side minimum check: `FIRST_PAYMENT_ONLY` first-instalment rule is enforced by the API. */
function validateInstalmentAmount(
  amountNum: number,
  partial: PaymentLinkPartialConfig | null | undefined
): string | null {
  if (!Number.isFinite(amountNum) || amountNum <= 0) return "Enter a valid instalment amount";
  const minStr = partial?.minimumAmount;
  if (!minStr) return null;
  const min = Number(minStr);
  if (!Number.isFinite(min) || min <= 0) return null;
  const scope = partial?.minimumScope;
  if (scope === "FIRST_PAYMENT_ONLY") return null;
  if (amountNum + 1e-9 < min) return `Each instalment must be at least ${min.toLocaleString()}`;
  return null;
}

function isValidPayerEmail(email: string): boolean {
  const t = email.trim();
  return t.length > 0 && t.includes("@");
}

function CheckoutStateCard({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 p-4">
      <div className="w-full max-w-xl rounded-2xl border border-border bg-background p-8 text-center shadow-lg">
        <h1 className="text-xl font-bold text-foreground">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20">
      <Loader2 className="w-8 h-8 animate-spin text-crimson-red-600" />
    </div>
  );
}

/**
 * PARTIAL links: unified `POST /public/v1/payment-links/:slug/pay` with `amount` + `payer.email` (no OTP, no `/partial/*`).
 */
export function PartialPaymentLinkCheckout({ slug }: { slug: string }) {
  const publicLinkQuery = usePublicPaymentLink(slug, !!slug);
  const payMutation = usePayPublicPaymentLink();

  const [instalmentAmount, setInstalmentAmount] = useState("");
  const [gateway, setGateway] = useState<PaymentLinkGateway | "">("");
  const [msisdn, setMsisdn] = useState("");
  const [payerName, setPayerName] = useState("");
  const [payerEmail, setPayerEmail] = useState("");
  const [payerComment, setPayerComment] = useState("");

  const [activeTransactionId, setActiveTransactionId] = useState<string | null>(null);
  const [quoteTotalAmount, setQuoteTotalAmount] = useState<string | null>(null);
  const [quoteCurrency, setQuoteCurrency] = useState<string | null>(null);

  const statusQuery = usePublicPaymentLinkTransactionStatus(
    slug,
    activeTransactionId || "",
    !!slug && !!activeTransactionId
  );

  const link = publicLinkQuery.data?.paymentLink;

  const currentStatus = statusQuery.data?.transaction?.status ?? payMutation.data?.transaction?.status;
  const done = isPaymentLinkTerminalStatus(currentStatus);
  const refetchStatus = statusQuery.refetch;

  useEffect(() => {
    if (!activeTransactionId || done) return;
    const t = window.setInterval(() => {
      refetchStatus();
    }, 5000);
    return () => window.clearInterval(t);
  }, [activeTransactionId, done, refetchStatus]);

  const selectedGateway = gateway || link?.gateways?.[0] || "";

  const instalmentError = useMemo(
    () => validateInstalmentAmount(Number(instalmentAmount), link?.partial ?? null),
    [instalmentAmount, link?.partial]
  );

  const canSubmitPay = useMemo(() => {
    if (!link || !selectedGateway || !msisdn.trim() || payMutation.isPending) return false;
    if (!isValidPayerEmail(payerEmail)) return false;
    if (!link.payable || link.status !== "ACTIVE") return false;
    if (instalmentError) return false;
    const n = Number(instalmentAmount);
    return Number.isFinite(n) && n > 0;
  }, [instalmentError, instalmentAmount, link, msisdn, payMutation.isPending, payerEmail, selectedGateway]);

  const handlePay = async () => {
    if (!link) return;
    if (!isValidPayerEmail(payerEmail)) {
      toast.error("A valid email is required");
      return;
    }
    const err = validateInstalmentAmount(Number(instalmentAmount), link.partial);
    if (err) {
      toast.error(err);
      return;
    }
    try {
      const result = await payMutation.mutateAsync({
        slug,
        payload: {
          gateway: selectedGateway as PaymentLinkGateway,
          amount: String(Number(instalmentAmount)),
          payer: {
            msisdn: msisdn.trim(),
            name: payerName.trim() || undefined,
            email: payerEmail.trim(),
          },
          comment: payerComment.trim() || undefined,
          idempotencyKey: `pl-${slug}-${Date.now()}`,
        },
      });
      setActiveTransactionId(result.transaction.transactionId);
      setQuoteTotalAmount(result.quote.totalAmount);
      setQuoteCurrency(result.quote.currency);
      toast.success("Payment started", { description: "Approve the prompt on your phone." });
      void publicLinkQuery.refetch();
    } catch (e) {
      toast.error("Payment failed to start", {
        description: e instanceof Error ? e.message : "Try again.",
      });
    }
  };

  if (publicLinkQuery.isLoading) return <LoadingScreen />;
  if (publicLinkQuery.error || !link) {
    return (
      <CheckoutStateCard
        title="Payment link unavailable"
        message={publicLinkQuery.error?.message || "This link could not be loaded."}
      />
    );
  }

  if (!isPartialPaymentLinkPublic(link)) {
    return (
      <CheckoutStateCard title="Wrong payment flow" message="This page is not configured for partial payment links." />
    );
  }

  const partial = link.partial;

  return (
    <div className="min-h-screen bg-muted/20 py-10 px-4">
      <div className="max-w-lg mx-auto bg-background border border-border rounded-2xl p-6 space-y-6">
        <MerchantHeader link={link} />

        <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
          <p className="text-xs text-muted-foreground">Partial payment</p>
          <p className="text-sm text-foreground">
            Your contribution target: <strong>{formatMoney(link.amount, link.currency)}</strong>
          </p>
          {partial?.minimumAmount ? (
            <p className="text-xs text-muted-foreground">
              Minimum instalment: {Number(partial.minimumAmount).toLocaleString()} {link.currency}{" "}
              ({partial.minimumScope === "FIRST_PAYMENT_ONLY" ? "first successful payment only" : "each instalment"})
            </p>
          ) : null}
          {partial?.deadlineAt ? (
            <p className="text-xs text-muted-foreground">
              Instalment deadline: {new Date(partial.deadlineAt).toLocaleString()}
            </p>
          ) : null}
        </div>

        {partial?.collectionPaused ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/15 p-3 text-sm text-amber-900 dark:text-amber-200">
            Instalments are paused (deadline passed or merchant pause). Paying stays blocked until the merchant renews
            this link.
          </div>
        ) : null}

        {!link.payable || link.status !== "ACTIVE" ? (
          <div className="rounded-lg border border-crimson-red-200 bg-crimson-red-50 dark:bg-crimson-red-900/10 p-4 text-sm text-crimson-red-800 dark:text-crimson-red-200">
            This link is not accepting payments right now.
          </div>
        ) : null}

        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Enter the email you want tied to this plan (one plan per email per link). Use the same email when you return to
          continue paying — we do not send a verification code to that address for identity; receipts and reminders use
          the email you provide.
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium mb-1.5 block">Email *</label>
            <input
              type="email"
              value={payerEmail}
              onChange={(e) => setPayerEmail(e.target.value)}
              disabled={!link.payable}
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="text-xs font-medium mb-1.5 block">Instalment amount ({link.currency}) *</label>
            <input
              type="number"
              min={0}
              step="any"
              value={instalmentAmount}
              onChange={(e) => setInstalmentAmount(e.target.value)}
              disabled={!link.payable}
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm"
            />
            {instalmentError ? <p className="text-[11px] text-red-600 mt-1">{instalmentError}</p> : null}
            <p className="text-[11px] text-muted-foreground mt-1">Overpaying the target is allowed.</p>
          </div>

          <div>
            <label className="text-xs font-medium mb-1.5 block">Gateway</label>
            <select
              value={selectedGateway}
              onChange={(e) => setGateway(e.target.value as PaymentLinkGateway)}
              disabled={!link.payable}
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm"
            >
              {link.gateways.map((g) => (
                <option key={g} value={g}>
                  {gatewayLabel(g)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium mb-1.5 block">Phone number *</label>
            <input
              value={msisdn}
              onChange={(e) => setMsisdn(e.target.value)}
              placeholder="2376XXXXXXXX"
              disabled={!link.payable}
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-medium mb-1.5 block">Name (optional)</label>
            <input
              value={payerName}
              onChange={(e) => setPayerName(e.target.value)}
              disabled={!link.payable}
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-medium mb-1.5 block">Comment (optional)</label>
            <textarea
              value={payerComment}
              onChange={(e) => setPayerComment(e.target.value)}
              disabled={!link.payable}
              rows={2}
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm"
            />
          </div>

          <button
            type="button"
            onClick={() => void handlePay()}
            disabled={!canSubmitPay}
            className="w-full py-2 bg-crimson-red-500 text-white rounded-lg text-sm font-semibold hover:bg-crimson-red-600 disabled:opacity-60 inline-flex justify-center items-center gap-2"
          >
            {payMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Pay instalment
          </button>

          {quoteTotalAmount && quoteCurrency ? (
            <p className="text-xs text-muted-foreground text-center">
              Approve on phone: <strong>{formatMoney(quoteTotalAmount, quoteCurrency)}</strong>
            </p>
          ) : null}
        </div>

        {(activeTransactionId || statusQuery.data) && (
          <div className="rounded-lg border border-border p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Payment status</h2>
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
            <p className="text-sm">
              Status: <strong>{currentStatus || "VERIFYING"}</strong>
            </p>
            {statusQuery.data?.transaction?.failureReason ? (
              <p className="text-xs text-red-600">{statusQuery.data.transaction.failureReason}</p>
            ) : null}
            {done && statusQuery.data?.paymentLink?.successUrl && currentStatus === "SUCCESS" ? (
              <a href={statusQuery.data.paymentLink.successUrl} className="text-xs text-crimson-red-600 hover:underline">
                Continue
              </a>
            ) : null}
            {done && statusQuery.data?.paymentLink?.cancelUrl && currentStatus === "FAILED" ? (
              <a href={statusQuery.data.paymentLink.cancelUrl} className="text-xs text-crimson-red-600 hover:underline">
                Return
              </a>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

function MerchantHeader({ link }: { link: PublicPaymentLink }) {
  return (
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
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">{link.merchantName}</p>
        <h1 className="text-2xl font-bold text-foreground mt-1">{link.title}</h1>
        {link.description ? <p className="text-sm text-muted-foreground mt-2">{link.description}</p> : null}
      </div>
    </div>
  );
}
