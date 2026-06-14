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
  Zap,
  Webhook,
  Activity,
  Bell,
  Shield,
  Clock,
  TrendingUp,
  Server,
  RefreshCw,
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

const EVENT_ICONS: Record<string, any> = {
  "payment.succeeded": CheckCircle2,
  "payment.failed": XCircle,
  "payout.completed": TrendingUp,
  "payout.failed": AlertCircle,
  "refund.completed": RefreshCw,
  "settlement.generated": Activity,
};

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, color = "indigo", isLoading = false }: any) => {
  const colors = {
    indigo: "from-indigo-500 to-purple-600",
    emerald: "from-emerald-500 to-teal-600",
    amber: "from-amber-500 to-orange-600",
    rose: "from-rose-500 to-pink-600",
    sky: "from-sky-500 to-blue-600",
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
          {isLoading ? (
            <div className="mt-2 h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          ) : (
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{value}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colors[color as keyof typeof colors]} shadow-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const configs = {
    DELIVERED: { icon: CheckCircle2, bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-500/20", label: "Delivered" },
    FAILED: { icon: XCircle, bg: "bg-rose-50 dark:bg-rose-500/10", text: "text-rose-700 dark:text-rose-400", border: "border-rose-200 dark:border-rose-500/20", label: "Failed" },
    RETRYING: { icon: RotateCcw, bg: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-700 dark:text-amber-400", border: "border-amber-200 dark:border-amber-500/20", label: "Retrying" },
    PENDING: { icon: Clock, bg: "bg-sky-50 dark:bg-sky-500/10", text: "text-sky-700 dark:text-sky-400", border: "border-sky-200 dark:border-sky-500/20", label: "Pending" },
  };
  const config = configs[status as keyof typeof configs] || configs.PENDING;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border} shadow-sm`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        status === "DELIVERED" ? "bg-emerald-500" :
        status === "FAILED" ? "bg-rose-500" :
        status === "RETRYING" ? "bg-amber-500" : "bg-sky-500"
      } animate-pulse`} />
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
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
        return "text-crimson-red-600 dark:text-crimson-red-400";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-[1400px] mx-auto p-6 space-y-6">
        {/* HEADER - Premium Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-white via-white to-indigo-50/50 dark:from-slate-800/80 dark:via-slate-800/60 dark:to-indigo-950/30 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-6 shadow-lg">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                  <Webhook className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                    Webhook Management
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                    Receive real-time notifications for transaction events
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setUrl("");
                setSelectedEvents([...REQUIRED_WEBHOOK_EVENTS]);
                setEnabled(true);
                setShowAddModal(true);
              }}
              className="group px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 shadow-md"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
              Add Endpoint
            </button>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Zap} label="Active Endpoints" value={isLoadingEndpoints ? "..." : stats.activeEndpoints} color="indigo" isLoading={isLoadingEndpoints} />
          <StatCard icon={Bell} label="Total Sent" value={isLoadingDeliveries ? "..." : stats.totalSent.toLocaleString()} color="emerald" isLoading={isLoadingDeliveries} />
          <StatCard icon={Activity} label="Success Rate" value={isLoadingDeliveries ? "..." : `${stats.successRate}%`} color="amber" isLoading={isLoadingDeliveries} />
          <StatCard icon={AlertCircle} label="Failed Last 24H" value={isLoadingDeliveries ? "..." : stats.failedLast24h} color="rose" isLoading={isLoadingDeliveries} />
        </div>

        {/* ENDPOINTS SECTION */}
        <div className="rounded-2xl bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50/30 to-transparent dark:from-slate-800/20">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Endpoints</h3>
            </div>
          </div>

          {isLoadingEndpoints ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500" />
            </div>
          ) : endpoints.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                <Webhook className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-base font-medium text-slate-700 dark:text-slate-300">No webhook endpoints configured</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Create your first endpoint to start receiving events</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-6 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all duration-200 inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Your First Endpoint
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-800/30 border-b-2 border-slate-200 dark:border-slate-700">
                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">URL</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Events</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {endpoints.map((endpoint) => (
                    <tr
                      key={endpoint.id}
                      className="group border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                            <Server className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <span className="text-sm font-medium text-slate-900 dark:text-white font-mono">{endpoint.url}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {endpoint.events.length} events
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-2 text-xs font-semibold ${
                          endpoint.enabled
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-slate-500 dark:text-slate-400"
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${
                            endpoint.enabled ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                          }`} />
                          {endpoint.enabled ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openEditModal(endpoint)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* RECENT DELIVERIES SECTION */}
        <div className="rounded-2xl bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50/30 to-transparent dark:from-slate-800/20">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Deliveries</h3>
            </div>
          </div>

          {isLoadingDeliveries ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500" />
            </div>
          ) : deliveries.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                <Bell className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-base font-medium text-slate-700 dark:text-slate-300">No deliveries yet</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Webhook deliveries will appear here once events are triggered</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-800/30 border-b-2 border-slate-200 dark:border-slate-700">
                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Time</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Event</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Attempts</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map((delivery) => {
                    const EventIcon = EVENT_ICONS[delivery.event] || Bell;
                    return (
                      <tr
                        key={delivery.id}
                        className="group border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200"
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">{formatTime(delivery.createdAt)}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">{formatDate(delivery.createdAt)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                              <EventIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <span className="text-sm font-medium text-slate-900 dark:text-white">
                              {EVENT_LABELS[delivery.event] || delivery.event}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={delivery.status} />
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            <RotateCcw className="w-3 h-3" />
                            {delivery.attemptCount} attempts
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => openDetailModal(delivery.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ADD ENDPOINT MODAL - Enhanced */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setShowAddModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-white to-indigo-50/30 dark:from-slate-800 dark:to-indigo-950/20 border-b border-slate-200 dark:border-slate-700 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Webhook Endpoint</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {urlError && (
                <div className="rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 p-4 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-rose-900 dark:text-rose-100">{urlError}</p>
                </div>
              )}

              <div className="rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 p-4">
                <p className="text-sm text-indigo-900 dark:text-indigo-100 flex items-start gap-2">
                  <Shield className="w-4 h-4 mt-0.5 shrink-0" />
                  <span><strong className="font-semibold">Important:</strong> You must subscribe to all 6 required events. This ensures you receive all transaction notifications.</span>
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">Endpoint URL *</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setUrlError(null);
                  }}
                  placeholder="https://api.myapp.com/webhooks/zopay"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  disabled={createMutation.isPending}
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">Must be HTTPS (required in production)</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">Events to Subscribe * (All Required)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50/50 dark:bg-slate-900/30">
                  {REQUIRED_WEBHOOK_EVENTS.map((event) => {
                    const EventIcon = EVENT_ICONS[event] || Bell;
                    return (
                      <label
                        key={event}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedEvents.includes(event)}
                          onChange={() => toggleEvent(event)}
                          disabled
                          className="rounded border-slate-300 dark:border-slate-600"
                        />
                        <EventIcon className="w-4 h-4 text-indigo-500" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          {EVENT_LABELS[event] || event}
                        </span>
                        <span className="text-xs text-amber-600 dark:text-amber-400">(Required)</span>
                      </label>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  All {REQUIRED_WEBHOOK_EVENTS.length} events are required and cannot be unchecked.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
                  disabled={createMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateEndpoint}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Create Endpoint
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT ENDPOINT MODAL - Enhanced */}
      {showEditModal && selectedEndpoint && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setShowEditModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-white to-indigo-50/30 dark:from-slate-800 dark:to-indigo-950/20 border-b border-slate-200 dark:border-slate-700 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                  <Edit className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Webhook Endpoint</h3>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {urlError && (
                <div className="rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 p-4 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-rose-900 dark:text-rose-100">{urlError}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">Endpoint URL *</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setUrlError(null);
                  }}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  disabled={updateMutation.isPending}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-500" />
                  Enabled
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-600 w-4 h-4"
                    disabled={updateMutation.isPending}
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {enabled ? "Endpoint is active and receiving events" : "Endpoint is disabled and will not receive events"}
                  </span>
                </label>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">Events (All Required)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50/50 dark:bg-slate-900/30">
                  {REQUIRED_WEBHOOK_EVENTS.map((event) => {
                    const EventIcon = EVENT_ICONS[event] || Bell;
                    return (
                      <label
                        key={event}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedEvents.includes(event)}
                          onChange={() => toggleEvent(event)}
                          disabled
                          className="rounded border-slate-300 dark:border-slate-600"
                        />
                        <EventIcon className="w-4 h-4 text-indigo-500" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          {EVENT_LABELS[event] || event}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
                  disabled={updateMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateEndpoint}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Update Endpoint
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELIVERY DETAIL MODAL - Enhanced */}
      {showDetailModal && deliveryData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-white to-indigo-50/30 dark:from-slate-800 dark:to-indigo-950/20 border-b border-slate-200 dark:border-slate-700 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Webhook Delivery Details</h3>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-50 dark:bg-slate-900/30 p-4 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Event</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    {(() => {
                      const EventIcon = EVENT_ICONS[deliveryData.delivery.event] || Bell;
                      return <EventIcon className="w-4 h-4 text-indigo-500" />;
                    })()}
                    {EVENT_LABELS[deliveryData.delivery.event] || deliveryData.delivery.event}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-slate-900/30 p-4 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Status</p>
                  <StatusBadge status={deliveryData.delivery.status} />
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-slate-900/30 p-4 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Time</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatDate(deliveryData.delivery.createdAt)}</p>
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-slate-900/30 p-4 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Attempts</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-amber-500" />
                    {deliveryData.delivery.attemptCount}
                  </p>
                </div>
                {deliveryData.delivery.responseStatusCode && (
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-900/30 p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Response Code</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{deliveryData.delivery.responseStatusCode}</p>
                  </div>
                )}
              </div>

              {deliveryData.delivery.payload && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Code className="w-4 h-4 text-indigo-500" />
                    Payload
                  </p>
                  <pre className="bg-slate-900 dark:bg-slate-950 rounded-xl p-4 overflow-x-auto text-xs text-slate-200 font-mono">
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
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
                  >
                    {copiedPayload ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Payload
                      </>
                    )}
                  </button>
                </div>
              )}

              {deliveryData.delivery.responseBody && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Server className="w-4 h-4 text-indigo-500" />
                    Response
                  </p>
                  <pre className="bg-slate-900 dark:bg-slate-950 rounded-xl p-4 overflow-x-auto text-xs text-slate-200 font-mono">
                    {deliveryData.delivery.responseBody}
                  </pre>
                </div>
              )}

              {deliveryData.delivery.errorMessage && (
                <div className="rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 p-4">
                  <p className="text-xs font-semibold text-rose-900 dark:text-rose-100 mb-1 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Error Details
                  </p>
                  <p className="text-sm text-rose-800 dark:text-rose-200">{deliveryData.delivery.errorMessage}</p>
                </div>
              )}

              {deliveryData.delivery.status === "FAILED" && (
                <button
                  onClick={() => handleReplay(deliveryData.delivery.id)}
                  className="w-full px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
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
                      Replay Webhook
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Code icon component
const Code = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
);