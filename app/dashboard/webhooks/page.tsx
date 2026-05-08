"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Pause,
  Copy,
  Check,
  X,
  RotateCcw,
  Loader2,
  AlertCircle,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { useUserMerchantData } from "@/features/merchants/context/MerchantContext";
import {
  useWebhookEndpoints,
  useWebhookDeliveries,
  useWebhookDelivery,
  useCreateWebhookEndpoint,
  useUpdateWebhookEndpoint,
  useReplayWebhookDelivery,
} from "@/features/webhooks/queries";
import { REQUIRED_WEBHOOK_EVENTS } from "@/features/webhooks/types";
import type { WebhookEndpoint, WebhookDelivery } from "@/features/webhooks/types";
import { toast } from "sonner";

const EVENT_LABELS: Record<string, string> = {
  "payment.succeeded": "Payment Succeeded",
  "payment.failed": "Payment Failed",
  "payout.completed": "Payout Completed",
  "payout.failed": "Payout Failed",
  "refund.completed": "Refund Completed",
  "settlement.generated": "Settlement Generated",
};

export default function WebhooksPage() {
  const { merchant } = useUserMerchantData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<WebhookEndpoint | null>(null);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  // Form state
  const [url, setUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([...REQUIRED_WEBHOOK_EVENTS]);
  const [enabled, setEnabled] = useState(true);
  const [urlError, setUrlError] = useState<string | null>(null);

  // Fetch data
  const { data: endpointsData, isLoading: isLoadingEndpoints } = useWebhookEndpoints();
  const { data: deliveriesData, isLoading: isLoadingDeliveries } = useWebhookDeliveries(
    { limit: 10 },
    true
  );
  const { data: deliveryData } = useWebhookDelivery(selectedDeliveryId || "", !!selectedDeliveryId);

  // Mutations
  const createMutation = useCreateWebhookEndpoint();
  const updateMutation = useUpdateWebhookEndpoint();
  const replayMutation = useReplayWebhookDelivery();

  const endpoints = endpointsData?.endpoints || [];
  const deliveries = deliveriesData?.deliveries || [];

  // Calculate stats
  const stats = {
    activeEndpoints: endpoints.filter((e) => e.enabled).length,
    totalSent: deliveriesData?.pagination.total || 0,
    successRate: deliveries.length > 0
      ? Math.round(
          (deliveries.filter((d) => d.status === "DELIVERED").length / deliveries.length) * 100
        )
      : 100,
    failedLast24h: deliveries.filter(
      (d) => d.status === "FAILED" && new Date(d.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length,
  };

  const validateUrl = (urlString: string): boolean => {
    setUrlError(null);
    if (!urlString) {
      setUrlError("URL is required");
      return false;
    }
    try {
      const urlObj = new URL(urlString);
      if (urlObj.protocol !== "https:") {
        setUrlError("URL must use HTTPS");
        return false;
      }
      return true;
    } catch {
      setUrlError("Invalid URL format");
      return false;
    }
  };

  const handleCreateEndpoint = async () => {
    if (!validateUrl(url)) return;

    if (selectedEvents.length !== REQUIRED_WEBHOOK_EVENTS.length) {
      toast.error("All events required", {
        description: `You must subscribe to all ${REQUIRED_WEBHOOK_EVENTS.length} events.`,
      });
      return;
    }

    try {
      const result = await createMutation.mutateAsync({
        url,
        events: selectedEvents,
      });

      toast.success("Webhook endpoint created!", {
        description: "Save your webhook secret - it won't be shown again.",
      });

      // Show secret in a modal or copy to clipboard
      if (result.endpoint.secret) {
        navigator.clipboard.writeText(result.endpoint.secret);
        toast.info("Secret copied to clipboard", {
          description: "Make sure to save it securely.",
        });
      }

      setShowAddModal(false);
      setUrl("");
      setSelectedEvents([...REQUIRED_WEBHOOK_EVENTS]);
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } }; message?: string })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to create webhook endpoint";
      toast.error("Failed to create endpoint", {
        description: errorMessage,
      });
    }
  };

  const handleUpdateEndpoint = async () => {
    if (!selectedEndpoint) return;

    if (url && !validateUrl(url)) return;

    if (selectedEvents.length !== REQUIRED_WEBHOOK_EVENTS.length) {
      toast.error("All events required", {
        description: `You must subscribe to all ${REQUIRED_WEBHOOK_EVENTS.length} events.`,
      });
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: selectedEndpoint.id,
        data: {
          ...(url && { url }),
          enabled,
          events: selectedEvents,
        },
      });

      toast.success("Webhook endpoint updated!");
      setShowEditModal(false);
      setSelectedEndpoint(null);
      setUrl("");
      setSelectedEvents([...REQUIRED_WEBHOOK_EVENTS]);
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } }; message?: string })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to update webhook endpoint";
      toast.error("Failed to update endpoint", {
        description: errorMessage,
      });
    }
  };

  const handleReplay = async (deliveryId: string) => {
    try {
      await replayMutation.mutateAsync(deliveryId);
      toast.success("Webhook replayed", {
        description: "The webhook will be retried shortly.",
      });
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } }; message?: string })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to replay webhook";
      toast.error("Failed to replay", {
        description: errorMessage,
      });
    }
  };

  const openEditModal = (endpoint: WebhookEndpoint) => {
    setSelectedEndpoint(endpoint);
    setUrl(endpoint.url);
    setSelectedEvents(endpoint.events);
    setEnabled(endpoint.enabled);
    setShowEditModal(true);
  };

  const openDetailModal = (deliveryId: string) => {
    setSelectedDeliveryId(deliveryId);
    setShowDetailModal(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "text-green-600 dark:text-green-400";
      case "FAILED":
        return "text-red-600 dark:text-red-400";
      case "RETRYING":
        return "text-orange-600 dark:text-orange-400";
      case "PENDING":
        return "text-gray-600 dark:text-gray-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return <CheckCircle2 className="w-4 h-4" />;
      case "FAILED":
        return <XCircle className="w-4 h-4" />;
      case "RETRYING":
        return <RotateCcw className="w-4 h-4 animate-spin" />;
      case "PENDING":
        return <Pause className="w-4 h-4" />;
      default:
        return <Pause className="w-4 h-4" />;
    }
  };

  const toggleEvent = (eventId: string) => {
    // Don't allow unchecking required events
    if (REQUIRED_WEBHOOK_EVENTS.includes(eventId as any)) {
      toast.error("Required event", {
        description: "All 6 events are required and cannot be unchecked.",
      });
      return;
    }
    setSelectedEvents((prev) =>
      prev.includes(eventId) ? prev.filter((e) => e !== eventId) : [...prev, eventId]
    );
  };

  return (
    <div className="space-y-4 p-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Webhooks</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Receive real-time notifications for transaction events
          </p>
        </div>
        <button
          onClick={() => {
            setUrl("");
            setSelectedEvents([...REQUIRED_WEBHOOK_EVENTS]);
            setEnabled(true);
            setShowAddModal(true);
          }}
          className="px-3 py-1.5 bg-orange-500 text-white rounded-md text-xs font-semibold hover:bg-orange-600 transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Endpoint
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-background rounded-lg p-3 border border-border hover:shadow-sm transition-shadow">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Active Endpoints
          </p>
          <p className="text-base font-semibold text-foreground">
            {isLoadingEndpoints ? "..." : stats.activeEndpoints}
          </p>
        </div>
        <div className="bg-background rounded-lg p-3 border border-border hover:shadow-sm transition-shadow">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Total Sent
          </p>
          <p className="text-base font-semibold text-foreground">
            {isLoadingDeliveries ? "..." : stats.totalSent.toLocaleString()}
          </p>
        </div>
        <div className="bg-background rounded-lg p-3 border border-border border-l-2 border-l-orange-500 hover:shadow-sm transition-shadow">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Success Rate
          </p>
          <p className="text-base font-semibold text-orange-500">
            {isLoadingDeliveries ? "..." : `${stats.successRate}%`}
          </p>
        </div>
        <div className="bg-background rounded-lg p-3 border border-border hover:shadow-sm transition-shadow">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Failed Last 24H
          </p>
          <p className="text-base font-semibold text-foreground">
            {isLoadingDeliveries ? "..." : stats.failedLast24h}
          </p>
        </div>
      </div>

      {/* ENDPOINTS */}
      <div className="bg-background rounded-lg border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Endpoints</h3>
        </div>

        {isLoadingEndpoints ? (
          <div className="p-8 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
          </div>
        ) : endpoints.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">No webhook endpoints configured</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors"
            >
              Add Your First Endpoint
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">
                    URL
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">
                    Events
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {endpoints.map((endpoint) => (
                  <tr
                    key={endpoint.id}
                    className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-xs font-medium text-foreground">{endpoint.url}</td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      {endpoint.events.length} events
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium ${
                          endpoint.enabled
                            ? "text-green-600 dark:text-green-400"
                            : "text-muted-foreground"
                        }`}
                      >
                        <span
                          className={`w-1 h-1 rounded-full ${
                            endpoint.enabled ? "bg-green-500" : "bg-muted-foreground"
                          }`}
                        />
                        {endpoint.enabled ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(endpoint)}
                          className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RECENT DELIVERIES */}
      <div className="bg-background rounded-lg border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Recent Deliveries</h3>
        </div>

        {isLoadingDeliveries ? (
          <div className="p-8 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
          </div>
        ) : deliveries.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">No deliveries yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">
                    Time
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">
                    Event
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">
                    Attempts
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((delivery) => (
                  <tr
                    key={delivery.id}
                    className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-xs text-foreground">{formatTime(delivery.createdAt)}</td>
                    <td className="py-3 px-4 text-xs font-medium text-foreground">
                      {EVENT_LABELS[delivery.event] || delivery.event}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`flex items-center gap-1.5 text-xs font-medium ${getStatusColor(
                          delivery.status
                        )}`}
                      >
                        {getStatusIcon(delivery.status)}
                        {delivery.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      {delivery.attemptCount}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => openDetailModal(delivery.id)}
                        className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD ENDPOINT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-xl p-6 shadow-2xl border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Add Webhook Endpoint</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setUrl("");
                  setUrlError(null);
                }}
                className="p-1 hover:bg-muted rounded transition-colors"
                disabled={createMutation.isPending}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {urlError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-900 dark:text-red-100">{urlError}</p>
                </div>
              )}

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-xs text-blue-900 dark:text-blue-100">
                  <strong>Important:</strong> You must subscribe to all 6 required events. This ensures
                  you receive all transaction notifications.
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-2 block">
                  Endpoint URL *
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setUrlError(null);
                  }}
                  placeholder="https://api.myapp.com/webhooks/zitopay"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={createMutation.isPending}
                />
                <p className="text-xs text-muted-foreground mt-1">Must be HTTPS (required in production)</p>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-2 block">
                  Events to Subscribe * (All Required)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 border border-border rounded-lg p-3 bg-muted/30">
                  {REQUIRED_WEBHOOK_EVENTS.map((event) => (
                    <label
                      key={event}
                      className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted/50 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedEvents.includes(event)}
                        onChange={() => toggleEvent(event)}
                        disabled
                        className="rounded border-border"
                      />
                      <span className="text-xs text-foreground">
                        {EVENT_LABELS[event] || event}
                      </span>
                      <span className="text-xs text-muted-foreground">(Required)</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  All {REQUIRED_WEBHOOK_EVENTS.length} events are required and cannot be unchecked.
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setUrl("");
                    setUrlError(null);
                  }}
                  className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-sm font-semibold hover:bg-muted transition-colors disabled:opacity-50"
                  disabled={createMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateEndpoint}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Endpoint"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT ENDPOINT MODAL */}
      {showEditModal && selectedEndpoint && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-xl p-6 shadow-2xl border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Edit Webhook Endpoint</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedEndpoint(null);
                  setUrl("");
                  setUrlError(null);
                }}
                className="p-1 hover:bg-muted rounded transition-colors"
                disabled={updateMutation.isPending}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {urlError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-900 dark:text-red-100">{urlError}</p>
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-foreground mb-2 block">
                  Endpoint URL *
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setUrlError(null);
                  }}
                  placeholder="https://api.myapp.com/webhooks/zitopay"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={updateMutation.isPending}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-2 block">
                  Enabled
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                    className="rounded border-border"
                    disabled={updateMutation.isPending}
                  />
                  <span className="text-xs text-foreground">
                    {enabled ? "Endpoint is active" : "Endpoint is disabled"}
                  </span>
                </label>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-2 block">
                  Events (All Required)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 border border-border rounded-lg p-3 bg-muted/30">
                  {REQUIRED_WEBHOOK_EVENTS.map((event) => (
                    <label
                      key={event}
                      className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted/50 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedEvents.includes(event)}
                        onChange={() => toggleEvent(event)}
                        disabled
                        className="rounded border-border"
                      />
                      <span className="text-xs text-foreground">
                        {EVENT_LABELS[event] || event}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedEndpoint(null);
                    setUrl("");
                    setUrlError(null);
                  }}
                  className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-sm font-semibold hover:bg-muted transition-colors disabled:opacity-50"
                  disabled={updateMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateEndpoint}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Endpoint"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELIVERY DETAIL MODAL */}
      {showDetailModal && deliveryData && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-xl p-6 shadow-2xl border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Webhook Delivery Details</h3>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedDeliveryId(null);
                }}
                className="p-1 hover:bg-muted rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-muted-foreground mb-1">Event:</p>
                  <p className="font-semibold text-foreground">
                    {EVENT_LABELS[deliveryData.delivery.event] || deliveryData.delivery.event}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Status:</p>
                  <p
                    className={`font-semibold flex items-center gap-1.5 ${getStatusColor(
                      deliveryData.delivery.status
                    )}`}
                  >
                    {getStatusIcon(deliveryData.delivery.status)}
                    {deliveryData.delivery.status}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Time:</p>
                  <p className="font-semibold text-foreground">
                    {formatDate(deliveryData.delivery.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Attempts:</p>
                  <p className="font-semibold text-foreground">
                    {deliveryData.delivery.attemptCount}
                  </p>
                </div>
                {deliveryData.delivery.responseStatusCode && (
                  <div>
                    <p className="text-muted-foreground mb-1">Response Code:</p>
                    <p className="font-semibold text-foreground">
                      {deliveryData.delivery.responseStatusCode}
                    </p>
                  </div>
                )}
              </div>

              {deliveryData.delivery.payload && (
                <div className="pt-4 border-t border-border">
                  <p className="text-xs font-semibold text-foreground mb-2">Payload:</p>
                  <pre className="bg-muted/50 rounded-lg p-3 overflow-x-auto text-xs">
                    {JSON.stringify(deliveryData.delivery.payload, null, 2)}
                  </pre>
                  <button
                    onClick={async () => {
                      await navigator.clipboard.writeText(
                        JSON.stringify(deliveryData.delivery.payload, null, 2)
                      );
                      setCopiedPayload(true);
                      setTimeout(() => setCopiedPayload(false), 2000);
                      toast.success("Payload copied to clipboard!");
                    }}
                    className="mt-2 px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-semibold hover:bg-muted transition-colors flex items-center gap-2"
                  >
                    {copiedPayload ? (
                      <>
                        <Check className="w-3 h-3" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy Payload
                      </>
                    )}
                  </button>
                </div>
              )}

              {deliveryData.delivery.responseBody && (
                <div>
                  <p className="text-xs font-semibold text-foreground mb-2">Response:</p>
                  <pre className="bg-muted/50 rounded-lg p-3 overflow-x-auto text-xs">
                    {deliveryData.delivery.responseBody}
                  </pre>
                </div>
              )}

              {deliveryData.delivery.errorMessage && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-xs font-semibold text-red-900 dark:text-red-100 mb-1">Error:</p>
                  <p className="text-xs text-red-800 dark:text-red-200">
                    {deliveryData.delivery.errorMessage}
                  </p>
                </div>
              )}

              {deliveryData.delivery.status === "FAILED" && (
                <div className="flex gap-3 pt-4 border-t border-border">
                  <button
                    onClick={() => handleReplay(deliveryData.delivery.id)}
                    className="px-4 py-2 bg-background border border-border rounded-lg text-sm font-semibold hover:bg-muted transition-colors flex items-center gap-2 disabled:opacity-50"
                    disabled={replayMutation.isPending}
                  >
                    {replayMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Replaying...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-4 h-4" />
                        Replay
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
