"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Search,
    Phone,
    Mail,
    MessageCircle,
    FileText,
    Send,
    X,
    ChevronRight,
    Plus,
    Loader2,
    ImageIcon,
    Paperclip
} from "lucide-react";
import { useTickets, useCreateTicket } from "@/features/support/queries";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { SupportAttachmentInput, TicketCategory, TicketPriority } from "@/features/support/types";
import { fileToSupportAttachment, MAX_SUPPORT_ATTACHMENT_SIZE, SUPPORT_ATTACHMENT_ACCEPT } from "@/features/support/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function HelpSupportPage() {
    const router = useRouter();
    const [showContactModal, setShowContactModal] = useState(false);
    const { data: ticketsData, isLoading: ticketsLoading } = useTickets();
    const createTicketMutation = useCreateTicket();

    const [searchQuery, setSearchQuery] = useState("");

    // Form State
    const [subject, setSubject] = useState("");
    const [category, setCategory] = useState<TicketCategory>("TECHNICAL");
    const [priority, setPriority] = useState<TicketPriority>("MEDIUM");
    const [message, setMessage] = useState("");
    const [formError, setFormError] = useState<string | null>(null);
    const [attachments, setAttachments] = useState<SupportAttachmentInput[]>([]);

    const MIN_MESSAGE_LENGTH = 10;

    const handleAttachmentSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (!files.length) return;

        try {
            const invalid = files.find((file) => file.size > MAX_SUPPORT_ATTACHMENT_SIZE);
            if (invalid) {
                setFormError(`"${invalid.name}" exceeds the 10 MB attachment limit.`);
                return;
            }

            const converted = await Promise.all(files.map(fileToSupportAttachment));
            setAttachments((prev) => [...prev, ...converted]);
            setFormError(null);
        } catch {
            setFormError("Failed to read one of the selected files.");
        } finally {
            event.target.value = "";
        }
    };

    const handleRemoveAttachment = (index: number) => {
        setAttachments((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
    };

    const handleSubmitTicket = async () => {
        setFormError(null);

        if (!subject || !message) {
            setFormError("Please fill in all required fields.");
            return;
        }

        const trimmedMessage = message.trim();
        if (trimmedMessage.length < MIN_MESSAGE_LENGTH) {
            setFormError(`Description must be at least ${MIN_MESSAGE_LENGTH} characters.`);
            return;
        }

        createTicketMutation.mutate(
            {
                subject,
                category,
                priority,
                message: trimmedMessage,
                attachments,
            },
            {
                onSuccess: () => {
                    toast.success("Your ticket was sent successfully. Support has been notified.");
                    setShowContactModal(false);
                    setSubject("");
                    setMessage("");
                    setPriority("MEDIUM");
                    setCategory("TECHNICAL");
                    setAttachments([]);
                    setFormError(null);
                },
            }
        );
    };

    const faqCategories = [
        {
            title: "Getting Started",
            items: [
                "How do I create an account?",
                "How do I get my API keys?",
                "How do I test payments in sandbox?",
            ],
        },
        {
            title: "Payments",
            items: [
                "What payment methods do you support?",
                "How long do payments take to process?",
                "What are your transaction fees?",
            ],
        },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'bg-blue-100 text-blue-700';
            case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-700';
            case 'WAITING_FOR_CUSTOMER': return 'bg-orange-100 text-orange-700';
            case 'RESOLVED': return 'bg-blue-100 text-blue-700';
            case 'CLOSED': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-xl font-semibold text-foreground">Help & Support</h1>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Track your tickets and get help from our team
                    </p>
                </div>
                <button
                    onClick={() => setShowContactModal(true)}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Open New Ticket
                </button>
            </div>

            {/* MAIN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT COLUMN: TICKETS LIST */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-background rounded-xl border border-border overflow-hidden">
                        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
                            <h3 className="font-semibold text-foreground">My Support Tickets</h3>
                        </div>

                        {ticketsLoading ? (
                            <div className="p-8 flex justify-center">
                                <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                            </div>
                        ) : ticketsData?.tickets && ticketsData.tickets.length > 0 ? (
                            <div className="divide-y divide-border">
                                {ticketsData.tickets.map((ticket) => (
                                    <div
                                        key={ticket.id}
                                        onClick={() => router.push(`/dashboard/support/${ticket.id}`)}
                                        className="p-4 hover:bg-muted/50 cursor-pointer transition-colors group"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-semibold text-foreground group-hover:text-orange-600 transition-colors">
                                                {ticket.subject}
                                            </h4>
                                            <span className={cn("px-2 py-0.5 rounded-full text-xs font-bold whitespace-nowrap", getStatusColor(ticket.status))}>
                                                {ticket.status.replace(/_/g, " ")}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span>#{ticket.ticketNumber}</span>
                                            <span>•</span>
                                            <span>{format(new Date(ticket.updatedAt), "MMM d, yyyy h:mm a")}</span>
                                            <span>•</span>
                                            <span className="capitalize">{ticket.category.toLowerCase()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-muted-foreground">
                                <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                <p>No support tickets found.</p>
                                <button
                                    onClick={() => setShowContactModal(true)}
                                    className="mt-2 text-sm text-orange-500 font-medium hover:underline"
                                >
                                    Create your first ticket
                                </button>
                            </div>
                        )}
                    </div>

                    {/* FAQs Section */}
                    <div className="bg-background rounded-xl border border-border p-6">
                        <h3 className="text-sm font-semibold text-foreground mb-4">FREQUENTLY ASKED QUESTIONS</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            {faqCategories.map((category, index) => (
                                <div key={index}>
                                    <h4 className="text-xs font-bold text-muted-foreground uppercase mb-3 tracking-wider">{category.title}</h4>
                                    <div className="space-y-2">
                                        {category.items.map((item, itemIndex) => (
                                            <button
                                                key={itemIndex}
                                                className="w-full text-left text-sm text-foreground hover:text-orange-600 transition-colors py-1 flex items-start gap-2"
                                            >
                                                <ChevronRight className="w-4 h-4 shrink-0 mt-0.5 text-muted-foreground" />
                                                {item}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: CONTACT INFO */}
                <div className="space-y-6">
                    {/* SEARCH */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search help articles..."
                            className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                        />
                    </div>

                    <div className="bg-background rounded-xl border border-border p-6">
                        <h3 className="font-semibold text-foreground mb-4">Contact Info</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Email Support</p>
                                    <p className="text-sm font-medium">support@zitopay.com</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                    <Phone className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Phone Support</p>
                                    <p className="text-sm font-medium">+237 670 000 000</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-background rounded-xl border border-border p-6">
                        <h3 className="font-semibold text-foreground mb-4">Resources</h3>
                        <div className="space-y-2">
                            <Link href="/docs" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground p-2 hover:bg-muted rounded-lg transition-colors">
                                <FileText className="w-4 h-4" /> Documentation
                            </Link>
                            <Link href="/api-docs" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground p-2 hover:bg-muted rounded-lg transition-colors">
                                <FileText className="w-4 h-4" /> API Reference
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTACT SUPPORT MODAL */}
            {showContactModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-background rounded-2xl p-6 shadow-2xl border border-border max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-foreground">Create Support Ticket</h3>
                            <button
                                onClick={() => setShowContactModal(false)}
                                className="p-1 hover:bg-muted rounded transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-foreground mb-2 block">
                                    Subject *
                                </label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Brief summary of the issue"
                                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-foreground mb-2 block">
                                        Category *
                                    </label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value as TicketCategory)}
                                        className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                    >
                                        <option value="TECHNICAL">Technical Issue</option>
                                        <option value="BILLING">Billing & Payments</option>
                                        <option value="COMPLIANCE">Compliance / KYB</option>
                                        <option value="FEATURE">Feature Request</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-foreground mb-2 block">
                                        Priority *
                                    </label>
                                    <select
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value as TicketPriority)}
                                        className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                    >
                                        <option value="LOW">Low</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HIGH">High</option>
                                        <option value="URGENT">Urgent</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-foreground mb-2 block">
                                    Description * <span className="text-xs text-muted-foreground">(minimum 10 characters)</span>
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={5}
                                    placeholder="Please describe the issue in detail..."
                                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm resize-none focus:ring-2 focus:ring-orange-500 outline-none"
                                />
                                <div className="mt-1 flex items-center justify-between text-xs">
                                    <span className={cn("text-muted-foreground", message.trim().length > 0 && message.trim().length < MIN_MESSAGE_LENGTH && "text-red-500")}>
                                        {message.trim().length > 0
                                            ? `${message.trim().length} / ${MIN_MESSAGE_LENGTH}+ characters`
                                            : `Please enter at least ${MIN_MESSAGE_LENGTH} characters.`}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-foreground mb-2 block">
                                    Attachments
                                </label>
                                <label className="flex items-center justify-center gap-2 w-full px-3 py-3 border border-dashed border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-orange-300 cursor-pointer transition-colors">
                                    <Paperclip className="w-4 h-4" />
                                    Add files
                                    <input
                                        type="file"
                                        multiple
                                        accept={SUPPORT_ATTACHMENT_ACCEPT}
                                        className="hidden"
                                        onChange={handleAttachmentSelection}
                                    />
                                </label>
                                {attachments.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        {attachments.map((attachment, index) => (
                                            <div key={`${attachment.filename}-${index}`} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2">
                                                <div className="min-w-0 flex items-center gap-2 text-xs text-foreground">
                                                    <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
                                                    <span className="truncate">{attachment.filename}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveAttachment(index)}
                                                    className="text-xs font-medium text-red-500 hover:text-red-600"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {formError && (
                                <div className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                                    {formError}
                                </div>
                            )}

                            <div className="flex gap-3 pt-4 border-t border-border">
                                <button
                                    onClick={() => setShowContactModal(false)}
                                    className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-sm font-semibold hover:bg-muted transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitTicket}
                                    disabled={
                                        createTicketMutation.isPending ||
                                        !subject ||
                                        !message.trim() ||
                                        message.trim().length < MIN_MESSAGE_LENGTH
                                    }
                                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {createTicketMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    Submit Ticket
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
