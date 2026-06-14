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
    Paperclip,
    HelpCircle,
    BookOpen,
    Headphones,
    Clock,
    CheckCircle,
    AlertCircle,
    Star,
    ArrowRight,
    ExternalLink,
    MessageSquare,
    Ticket,
    Zap,
    Shield,
    Users,
    Globe,
    Bookmark,
    Rocket,
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
    const CreditCard = ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
    );
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
            icon: Rocket,
            items: [
                "How do I create an account?",
                "How do I get my API keys?",
                "How do I test payments in sandbox?",
            ],
        },
        {
            title: "Payments",
            icon: CreditCard,
            items: [
                "What payment methods do you support?",
                "How long do payments take to process?",
                "What are your transaction fees?",
            ],
        },
    ];

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'OPEN': return { icon: MessageCircle, bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-700 dark:text-blue-400", border: "border-blue-200 dark:border-blue-500/20", label: "Open" };
            case 'IN_PROGRESS': return { icon: Clock, bg: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-700 dark:text-amber-400", border: "border-amber-200 dark:border-amber-500/20", label: "In Progress" };
            case 'WAITING_FOR_CUSTOMER': return { icon: Users, bg: "bg-purple-50 dark:bg-purple-500/10", text: "text-purple-700 dark:text-purple-400", border: "border-purple-200 dark:border-purple-500/20", label: "Waiting for You" };
            case 'RESOLVED': return { icon: CheckCircle, bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-500/20", label: "Resolved" };
            case 'CLOSED': return { icon: X, bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-400", border: "border-slate-200 dark:border-slate-700", label: "Closed" };
            default: return { icon: HelpCircle, bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-400", border: "border-slate-200 dark:border-slate-700", label: status };
        }
    };

    // CreditCard icon component


    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            <div className="max-w-7xl mx-auto p-6 space-y-6">
                {/* HEADER */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-white via-white to-indigo-50/50 dark:from-slate-800/80 dark:via-slate-800/60 dark:to-indigo-950/30 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-6 shadow-lg">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                    <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                                    <Headphones className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                                        Help & Support
                                    </h1>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                                        Track your tickets and get help from our team
                                    </p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowContactModal(true)}
                            className="group px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 shadow-md"
                        >
                            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                            Open New Ticket
                        </button>
                    </div>
                </div>

                {/* MAIN GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LEFT COLUMN: TICKETS LIST */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="rounded-2xl bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md">
                            <div className="p-5 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50/30 to-transparent dark:from-slate-800/20">
                                <div className="flex items-center gap-2">
                                    <Ticket className="w-4 h-4 text-indigo-500" />
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">My Support Tickets</h3>
                                </div>
                            </div>

                            {ticketsLoading ? (
                                <div className="p-12 flex justify-center">
                                    <div className="relative">
                                        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                </div>
                            ) : ticketsData?.tickets && ticketsData.tickets.length > 0 ? (
                                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {ticketsData.tickets.map((ticket) => {
                                        const statusConfig = getStatusConfig(ticket.status);
                                        const StatusIcon = statusConfig.icon;
                                        return (
                                            <div
                                                key={ticket.id}
                                                onClick={() => router.push(`/dashboard/support/${ticket.id}`)}
                                                className="group p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all duration-200"
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                        {ticket.subject}
                                                    </h4>
                                                    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border", statusConfig.bg, statusConfig.text, statusConfig.border)}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {statusConfig.label}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                                                    <span className="inline-flex items-center gap-1">
                                                        <span className="font-mono font-semibold">#{ticket.ticketNumber}</span>
                                                    </span>
                                                    <span>•</span>
                                                    <span className="inline-flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {format(new Date(ticket.updatedAt), "MMM d, yyyy h:mm a")}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="inline-flex items-center gap-1">
                                                        <Bookmark className="w-3 h-3" />
                                                        {ticket.category.toLowerCase()}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-12 text-center">
                                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                                        <MessageCircle className="w-10 h-10 text-slate-400" />
                                    </div>
                                    <p className="text-base font-medium text-slate-700 dark:text-slate-300">No support tickets found</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Create your first ticket to get help</p>
                                    <button
                                        onClick={() => setShowContactModal(true)}
                                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all duration-200"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Create Ticket
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* FAQs Section */}
                        <div className="rounded-2xl bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md">
                            <div className="p-5 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50/30 to-transparent dark:from-slate-800/20">
                                <div className="flex items-center gap-2">
                                    <HelpCircle className="w-4 h-4 text-indigo-500" />
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Frequently Asked Questions</h3>
                                </div>
                            </div>
                            <div className="p-5">
                                <div className="grid md:grid-cols-2 gap-6">
                                    {faqCategories.map((category, index) => {
                                        const CategoryIcon = category.icon;
                                        return (
                                            <div key={index}>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-500/20">
                                                        <CategoryIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                                    </div>
                                                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{category.title}</h4>
                                                </div>
                                                <div className="space-y-2">
                                                    {category.items.map((item, itemIndex) => (
                                                        <button
                                                            key={itemIndex}
                                                            className="group w-full text-left text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-1.5 flex items-start gap-2"
                                                        >
                                                            <ChevronRight className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                                            <span className="leading-relaxed">{item}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: CONTACT INFO & RESOURCES */}
                    <div className="space-y-6">
                        {/* SEARCH */}
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search help articles..."
                                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                            />
                        </div>

                        {/* Contact Info Card */}
                        <div className="rounded-2xl bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-5 shadow-sm transition-all duration-300 hover:shadow-md">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                                    <Headphones className="w-3.5 h-3.5 text-white" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Contact Support</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/30 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-500/20 dark:to-purple-500/20 flex items-center justify-center">
                                        <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email Support</p>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">support@zopay.com</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/30 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-500/20 dark:to-teal-500/20 flex items-center justify-center">
                                        <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Phone Support</p>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">+237 670 000 000</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Resources Card */}
                        <div className="rounded-2xl bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-5 shadow-sm transition-all duration-300 hover:shadow-md">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
                                    <BookOpen className="w-3.5 h-3.5 text-white" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Resources</h3>
                            </div>
                            <div className="space-y-2">
                                <Link href="/docs" className="group flex items-center justify-between gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        <span className="font-medium">Documentation</span>
                                    </div>
                                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-200" />
                                </Link>
                                <Link href="/api-docs" className="group flex items-center justify-between gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200">
                                    <div className="flex items-center gap-2">
                                        <ExternalLink className="w-4 h-4" />
                                        <span className="font-medium">API Reference</span>
                                    </div>
                                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-200" />
                                </Link>
                                <Link href="/status" className="group flex items-center justify-between gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200">
                                    <div className="flex items-center gap-2">
                                        <Zap className="w-4 h-4" />
                                        <span className="font-medium">System Status</span>
                                    </div>
                                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-200" />
                                </Link>
                            </div>
                        </div>

                        {/* Support Hours Card */}
                        <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-200 dark:border-indigo-500/20 p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Support Hours</h3>
                            </div>
                            <div className="space-y-2 text-sm">
                                <p className="text-slate-700 dark:text-slate-300">Monday - Friday: 9:00 AM - 6:00 PM WAT</p>
                                <p className="text-slate-700 dark:text-slate-300">Saturday: 10:00 AM - 2:00 PM WAT</p>
                                <p className="text-slate-500 dark:text-slate-400 text-xs mt-2">Emergency support available 24/7 for critical issues</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTACT SUPPORT MODAL - Enhanced */}
            {showContactModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setShowContactModal(false)}>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-gradient-to-r from-white to-indigo-50/30 dark:from-slate-800 dark:to-indigo-950/20 border-b border-slate-200 dark:border-slate-700 p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                                        <MessageSquare className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create Support Ticket</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">We'll respond within 24 hours</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowContactModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200">
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-5">
                            <div>
                                <label className="text-xs font-semibold text-slate-900 dark:text-white mb-1.5 block">Subject *</label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Brief summary of the issue"
                                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-900 dark:text-white mb-1.5 block">Category *</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value as TicketCategory)}
                                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all cursor-pointer"
                                    >
                                        <option value="TECHNICAL">Technical Issue</option>
                                        <option value="BILLING">Billing & Payments</option>
                                        <option value="COMPLIANCE">Compliance / KYB</option>
                                        <option value="FEATURE">Feature Request</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-900 dark:text-white mb-1.5 block">Priority *</label>
                                    <select
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value as TicketPriority)}
                                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all cursor-pointer"
                                    >
                                        <option value="LOW">Low</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HIGH">High</option>
                                        <option value="URGENT">Urgent</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-900 dark:text-white mb-1.5 block">
                                    Description * <span className="text-xs text-slate-500 dark:text-slate-400">(minimum 10 characters)</span>
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={5}
                                    placeholder="Please describe the issue in detail..."
                                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none"
                                />
                                <div className="mt-1.5 flex items-center justify-between text-xs">
                                    <span className={cn("text-slate-500 dark:text-slate-400", message.trim().length > 0 && message.trim().length < MIN_MESSAGE_LENGTH && "text-rose-500")}>
                                        {message.trim().length > 0
                                            ? `${message.trim().length} / ${MIN_MESSAGE_LENGTH}+ characters`
                                            : `Please enter at least ${MIN_MESSAGE_LENGTH} characters.`}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-900 dark:text-white mb-1.5 block">Attachments</label>
                                <label className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-600 cursor-pointer transition-all duration-200">
                                    <Paperclip className="w-4 h-4" />
                                    Click to upload files
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
                                            <div key={`${attachment.filename}-${index}`} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 px-3 py-2">
                                                <div className="min-w-0 flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                                                    <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className="truncate">{attachment.filename}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveAttachment(index)}
                                                    className="text-xs font-medium text-rose-500 hover:text-rose-600 transition-colors"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <p className="mt-1.5 text-[10px] text-slate-500 dark:text-slate-400">Max file size: 10 MB per file</p>
                            </div>

                            {formError && (
                                <div className="rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 p-3 flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                                    <p className="text-xs text-rose-800 dark:text-rose-200">{formError}</p>
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowContactModal(false)}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
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
                                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {createTicketMutation.isPending ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                                    ) : (
                                        <><Send className="w-4 h-4" /> Submit Ticket</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}