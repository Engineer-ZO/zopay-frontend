"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTicketDetails, useReplyTicket } from "@/features/support/queries";
import { ArrowLeft, Send, Paperclip, Clock, User, Shield, FileText, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { SupportAttachmentInput } from "@/features/support/types";
import { fileToSupportAttachment, getAttachmentDisplayName, isImageAttachmentUrl, MAX_SUPPORT_ATTACHMENT_SIZE, SUPPORT_ATTACHMENT_ACCEPT } from "@/features/support/utils";
import { toast } from "sonner";

export default function TicketDetailPage() {
    const params = useParams();
    const router = useRouter();
    const ticketId = params.id as string;
    const { data, isLoading, error } = useTicketDetails(ticketId);
    const replyMutation = useReplyTicket();

    const [replyMessage, setReplyMessage] = useState("");
    const [attachments, setAttachments] = useState<SupportAttachmentInput[]>([]);

    if (isLoading) {
        return (
            <div className="p-6 flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-crimson-red-500"></div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="p-6">
                <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                    Error loading ticket details. Please try again later.
                </div>
                <button
                    onClick={() => router.back()}
                    className="mt-4 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="w-4 h-4" /> Go Back
                </button>
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

        replyMutation.mutate(
            { ticketId, data: { message: replyMessage, attachments } },
            {
                onSuccess: () => {
                    setReplyMessage("");
                    setAttachments([]);
                    toast.success("Your reply was sent successfully.");
                }
            }
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'bg-deep-blue-violet-100 text-deep-blue-violet-700';
            case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-700';
            case 'WAITING_FOR_CUSTOMER': return 'bg-crimson-red-100 text-crimson-red-700';
            case 'RESOLVED': return 'bg-deep-blue-violet-100 text-deep-blue-violet-700';
            case 'CLOSED': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <button
                    onClick={() => router.back()}
                    className="mb-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Support
                </button>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 bg-background p-6 rounded-xl border border-border">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-bold", getStatusColor(ticket.status))}>
                                {ticket.status.replace(/_/g, " ")}
                            </span>
                            <span className="text-xs text-muted-foreground">#{ticket.ticketNumber}</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {format(new Date(ticket.createdAt), "MMM d, yyyy")}
                            </span>
                        </div>
                        <h1 className="text-xl font-semibold text-foreground">{ticket.subject}</h1>
                        <p className="text-xs text-muted-foreground mt-0.5">category: <span className="font-medium text-foreground">{ticket.category}</span></p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className={cn(
                            "px-3 py-1 rounded-lg text-sm font-medium border",
                            ticket.priority === 'URGENT' ? "bg-red-50 text-red-700 border-red-200" :
                                ticket.priority === 'HIGH' ? "bg-crimson-red-50 text-crimson-red-700 border-crimson-red-200" :
                                    "bg-gray-50 text-gray-700 border-gray-200"
                        )}>
                            Priority: {ticket.priority}
                        </span>
                    </div>
                </div>
            </div>

            {/* Messages Thread */}
            <div className="space-y-6">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={cn(
                            "flex gap-4 max-w-3xl",
                            msg.senderType === 'MERCHANT' ? "ml-auto flex-row-reverse" : ""
                        )}
                    >
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                            msg.senderType === 'MERCHANT' ? "bg-crimson-red-100 text-crimson-red-600" : "bg-deep-blue-violet-100 text-deep-blue-violet-600"
                        )}>
                            {msg.senderType === 'MERCHANT' ? <User className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                        </div>

                        <div className={cn(
                            "p-4 rounded-2xl shadow-sm border",
                            msg.senderType === 'MERCHANT'
                                ? "bg-crimson-red-50/50 border-crimson-red-100 dark:bg-crimson-red-900/10 dark:border-crimson-red-900/30"
                                : "bg-white border-gray-100 dark:bg-gray-800 dark:border-gray-700"
                        )}>
                            <div className="flex items-center justify-between gap-4 mb-2">
                                <span className="text-xs font-bold text-foreground">
                                    {msg.senderType === 'MERCHANT' ? 'You' : 'ZitoPay Support'}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {format(new Date(msg.createdAt), "MMM d, h:mm a")}
                                </span>
                            </div>
                            <div className="text-sm text-foreground whitespace-pre-wrap">
                                {msg.message}
                            </div>
                            {msg.attachments && msg.attachments.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
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
                                                    className="max-h-48 rounded-lg border border-border object-cover"
                                                />
                                            </a>
                                        ) : (
                                            <a
                                                key={idx}
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-xs text-deep-blue-violet-600 hover:underline"
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

            {/* Reply Input */}
            {ticket.status !== 'CLOSED' && (
                <div className="bg-background rounded-xl border border-border p-4 sticky bottom-6 shadow-xl">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Reply to Ticket</h3>
                    <form onSubmit={handleReply}>
                        <textarea
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            placeholder="Type your message here..."
                            rows={3}
                            className="w-full bg-muted border border-border rounded-lg p-3 text-sm focus:ring-2 focus:ring-crimson-red-500 outline-none resize-none"
                        />
                        <div className="flex items-center justify-between mt-3">
                            <button
                                type="button"
                                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 relative"
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
                                className="px-4 py-2 bg-crimson-red-500 text-white rounded-lg text-sm font-semibold hover:bg-crimson-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {replyMutation.isPending ? "Sending..." : <>Send Reply <Send className="w-4 h-4" /></>}
                            </button>
                        </div>
                        {attachments.length > 0 && (
                            <div className="mt-3 space-y-2">
                                {attachments.map((attachment, index) => (
                                    <div key={`${attachment.filename}-${index}`} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs">
                                        <span className="truncate text-foreground">{attachment.filename}</span>
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
            )}

            {ticket.status === 'CLOSED' && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center text-gray-500 text-sm">
                    This ticket is closed. Please create a new ticket.
                </div>
            )}
        </div>
    );
}
