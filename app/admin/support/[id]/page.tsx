"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    useAdminTicketDetails,
    useReplyAsAdmin,
    useUpdateTicketAttributes
} from "@/features/admin/queries";
import {
    ArrowLeft,
    Send,
    Paperclip,
    User,
    Shield,
    Lock,
    Save,
    FileText,
    X
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { TicketStatus, TicketPriority, AdminReplyTicketRequest, SupportAttachmentInput } from "@/features/support/types";
import { fileToSupportAttachment, getAttachmentDisplayName, isImageAttachmentUrl, MAX_SUPPORT_ATTACHMENT_SIZE, SUPPORT_ATTACHMENT_ACCEPT } from "@/features/support/utils";
import { toast } from "sonner";

export default function AdminTicketDetailPage() {
    const params = useParams();
    const router = useRouter();
    const ticketId = params.id as string;
    const { data, isLoading, error } = useAdminTicketDetails(ticketId);
    const replyMutation = useReplyAsAdmin();
    const updateMutation = useUpdateTicketAttributes();

    const [replyMessage, setReplyMessage] = useState("");
    const [isInternal, setIsInternal] = useState(false);
    const [attachments, setAttachments] = useState<SupportAttachmentInput[]>([]);

    // Edit Mode State
    const [editStatus, setEditStatus] = useState<TicketStatus | null>(null);
    const [editPriority, setEditPriority] = useState<TicketPriority | null>(null);

    if (isLoading) {
        return (
            <div className="p-6 flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="p-6">
                <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                    Error loading ticket details: {error?.message}
                </div>
            </div>
        );
    }

    const { ticket, messages } = data.data;
    const handleAttachmentSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (!files.length) return;

        try {
            const invalid = files.find((file) => file.size > MAX_SUPPORT_ATTACHMENT_SIZE);
            if (invalid) {
                toast.error(`"${invalid.name}" exceeds the 10 MB attachment limit.`);
                return;
            }

            const converted = await Promise.all(files.map(fileToSupportAttachment));
            setAttachments((prev) => [...prev, ...converted]);
        } catch {
            toast.error("Failed to read one of the selected files.");
        } finally {
            event.target.value = "";
        }
    };

    const handleReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyMessage.trim()) return;

        const payload: AdminReplyTicketRequest = {
            message: replyMessage,
            attachments,
            isInternal
        };

        // Rule: If ticket is closed, admin must re-open it to reply
        if (ticket.status === 'CLOSED' && !isInternal) {
            payload.newStatus = 'OPEN';
        }

        replyMutation.mutate(
            {
                ticketId,
                data: payload
            },
            {
                onSuccess: () => {
                    setReplyMessage("");
                    setIsInternal(false);
                    setAttachments([]);
                    toast.success(isInternal ? "Internal note added successfully." : "Reply sent successfully. Merchant has been notified.");
                }
            }
        );
    };

    const handleUpdateAttributes = () => {
        if (!editStatus && !editPriority) return;

        updateMutation.mutate(
            {
                ticketId,
                data: {
                    status: editStatus || undefined,
                    priority: editPriority || undefined
                }
            },
            {
                onSuccess: () => {
                    setEditStatus(null);
                    setEditPriority(null);
                    toast.success("Ticket status updated successfully.");
                }
            }
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'WAITING_FOR_CUSTOMER': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'RESOLVED': return 'bg-green-100 text-green-700 border-green-200';
            case 'CLOSED': return 'bg-gray-100 text-gray-700 border-gray-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* LEFT COLUMN: CONVERSATION */}
            <div className="lg:col-span-3 space-y-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className={cn("px-2 py-0.5 rounded text-xs font-bold border", getStatusColor(ticket.status))}>
                                {ticket.status.replace(/_/g, " ")}
                            </span>
                            <span className="text-xs text-gray-500">#{ticket.ticketNumber}</span>
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">{ticket.subject}</h1>
                    </div>
                </div>

                <div className="space-y-6 pb-24">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex gap-4 max-w-3xl",
                                msg.senderType === 'ADMIN' ? "ml-auto flex-row-reverse" : "",
                                msg.isInternal ? "ml-auto flex-row-reverse max-w-full lg:max-w-4xl opacity-90" : ""
                            )}
                        >
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border",
                                msg.senderType === 'MERCHANT' ? "bg-orange-100 text-orange-600 border-orange-200" :
                                    msg.isInternal ? "bg-yellow-100 text-yellow-600 border-yellow-200" : "bg-blue-100 text-blue-600 border-blue-200"
                            )}>
                                {msg.senderType === 'MERCHANT' ? <User className="w-5 h-5" /> : msg.isInternal ? <Lock className="w-4 h-4" /> : <Shield className="w-5 h-5" />}
                            </div>

                            <div className={cn(
                                "p-4 rounded-2xl shadow-sm border relative",
                                msg.senderType === 'MERCHANT'
                                    ? "bg-white border-gray-200"
                                    : msg.isInternal
                                        ? "bg-yellow-50 border-yellow-200"
                                        : "bg-blue-50 border-blue-100"
                            )}>
                                <div className="flex items-center justify-between gap-4 mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-gray-900">
                                            {msg.senderType === 'MERCHANT' ? ticket.merchantName || 'Merchant' : msg.senderName || 'Admin'}
                                        </span>
                                        {msg.isInternal && (
                                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-yellow-200 text-yellow-800 text-[10px] font-bold uppercase">
                                                <Lock className="w-3 h-3" /> Internal Note
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        {format(new Date(msg.createdAt), "MMM d, h:mm a")}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-800 whitespace-pre-wrap">
                                    {msg.message}
                                </div>
                                {msg.attachments && msg.attachments.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-gray-200/50 space-y-2">
                                        {msg.attachments.map((url, idx) => (
                                            isImageAttachmentUrl(url) ? (
                                                <a
                                                    key={idx}
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block"
                                                >
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={url}
                                                        alt={getAttachmentDisplayName(url, idx)}
                                                        className="max-h-48 rounded-lg border border-gray-200 object-cover"
                                                    />
                                                </a>
                                            ) : (
                                                <a
                                                    key={idx}
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-xs text-blue-600 hover:underline"
                                                >
                                                    <FileText className="w-3 h-3" />
                                                    {getAttachmentDisplayName(url, idx)}
                                                </a>
                                            )
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Reply Box */}
                <div className="bg-white border top border-gray-200 p-4 rounded-xl shadow-lg sticky bottom-6 z-10">
                    <form onSubmit={handleReply}>
                        {ticket.status === 'CLOSED' && !isInternal && (
                            <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700 flex items-center gap-2">
                                <Shield className="w-3 h-3" />
                                <span>Note: Replying will automatically re-open this ticket.</span>
                            </div>
                        )}
                        <div className="mb-2 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-700">Reply</h3>
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={isInternal}
                                    onChange={(e) => setIsInternal(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                                />
                                <span className={cn("text-xs font-medium px-2 py-0.5 rounded transition-colors", isInternal ? "bg-yellow-100 text-yellow-800" : "text-gray-500")}>
                                    Internal Note
                                </span>
                            </label>
                        </div>
                        <textarea
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            placeholder={isInternal ? "Add an internal note visible only to admins..." : "Type a reply to the merchant..."}
                            rows={3}
                            className={cn(
                                "w-full border rounded-lg p-3 text-sm focus:ring-2 outline-none resize-none transition-colors",
                                isInternal ? "bg-yellow-50 border-yellow-200 focus:ring-yellow-500 placeholder-yellow-700/50" : "bg-white border-gray-200 focus:ring-blue-500"
                            )}
                        />
                        <div className="flex items-center justify-between mt-3">
                            <button
                                type="button"
                                className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1 relative"
                            >
                                <Paperclip className="w-4 h-4" /> Attach File
                                <input
                                    type="file"
                                    multiple
                                    accept={SUPPORT_ATTACHMENT_ACCEPT}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={handleAttachmentSelection}
                                />
                            </button>
                            <button
                                type="submit"
                                disabled={!replyMessage.trim() || replyMutation.isPending}
                                className={cn(
                                    "px-4 py-2 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2",
                                    isInternal ? "bg-yellow-600 hover:bg-yellow-700" : "bg-blue-600 hover:bg-blue-700"
                                )}
                            >
                                {replyMutation.isPending ? "Sending..." : <>
                                    {isInternal ? <Lock className="w-3 h-3" /> : <Send className="w-3 h-3" />}
                                    {isInternal ? "Add Note" : "Send Reply"}
                                </>}
                            </button>
                        </div>
                        {attachments.length > 0 && (
                            <div className="mt-3 space-y-2">
                                {attachments.map((attachment, index) => (
                                    <div key={`${attachment.filename}-${index}`} className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs">
                                        <span className="truncate text-gray-800">{attachment.filename}</span>
                                        <button
                                            type="button"
                                            onClick={() => setAttachments((prev) => prev.filter((_, currentIndex) => currentIndex !== index))}
                                            className="text-red-500 hover:text-red-600"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </form>
                </div>
            </div>

            {/* RIGHT COLUMN: TICKET DETAILS & CONTROLS */}
            <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        Ticket Attributes
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Status</label>
                            <select
                                value={editStatus || ticket.status}
                                onChange={(e) => setEditStatus(e.target.value as TicketStatus)}
                                className="w-full text-sm border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="OPEN">Open</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="WAITING_FOR_CUSTOMER">Waiting for Customer</option>
                                <option value="RESOLVED">Resolved</option>
                                <option value="CLOSED">Closed</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Priority</label>
                            <select
                                value={editPriority || ticket.priority}
                                onChange={(e) => setEditPriority(e.target.value as TicketPriority)}
                                className="w-full text-sm border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="URGENT">Urgent</option>
                            </select>
                        </div>

                        {(editStatus || editPriority) && (
                            <button
                                onClick={handleUpdateAttributes}
                                disabled={updateMutation.isPending}
                                className="w-full py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-black transition-colors flex items-center justify-center gap-2"
                            >
                                {updateMutation.isPending ? "Saving..." : <><Save className="w-4 h-4" /> Save Changes</>}
                            </button>
                        )}
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4">Merchant Info</h3>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
                                <User className="w-4 h-4 text-gray-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">{ticket.merchantName || "Unknown Merchant"}</p>
                                <p className="text-xs text-gray-500">ID: {ticket.merchantId?.substring(0, 8)}...</p>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <p className="text-gray-500">Created</p>
                                <p className="font-medium text-gray-900">{format(new Date(ticket.createdAt), "MMM d, yyyy")}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Category</p>
                                <p className="font-medium text-gray-900">{ticket.category}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
