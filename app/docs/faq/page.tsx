"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, MessageCircle, Ticket } from "lucide-react";
import Link from "next/link";

interface FAQItem {
    question: string;
    answer: string;
}

const faqItems: FAQItem[] = [
    {
        question: "How do I get started with ZitoPay?",
        answer: "To get started, create an account on our platform. Once registered, you'll have immediate access to the sandbox environment where you can test your integration. Navigate to your merchant dashboard to retrieve your API keys. For production access, complete the KYC verification process and request production access."
    },
    {
        question: "What is the difference between sandbox and production environments?",
        answer: "The sandbox environment is for testing and development. It uses test credentials and doesn't process real money. The production environment is for live transactions with real money. Both environments are completely separated - sandbox testing does not affect production data, and you can invite team members to sandbox without giving them production access."
    },
    {
        question: "How long are quotes valid?",
        answer: "Quotes are valid for 15 minutes. During this period, fees are locked in. After expiry, you must create a new quote as pricing may have changed. Each quote can only be used once when executing a collection or disbursement."
    },
    {
        question: "What payment gateways does ZitoPay support?",
        answer: "ZitoPay currently supports MTN Mobile Money and Orange Money. Gateway availability and limits for your merchant account are managed by ZitoPay—contact Help & Support if you need changes."
    },
    {
        question: "How do I verify my domain?",
        answer: "To verify your domain, add it in the Domain Settings section of your merchant dashboard. You'll receive a verification token. Add a DNS TXT record with the name '_zitopay' and the token as the value at your domain registrar (where you bought the domain). Important: You must wait 15-30 minutes for DNS propagation before clicking 'Verify Domain'. If you're using Vercel, you cannot add DNS records to Vercel domains (*.vercel.app) - you need to use a custom domain and add the TXT record at your domain registrar, not in Vercel. Domain verification is required for production API access."
    },
    {
        question: "What is an idempotency key and why do I need it?",
        answer: "An idempotency key is a unique identifier you provide with each transaction request. It ensures that if you retry a request (due to network issues or timeouts), the same transaction won't be processed twice. Always generate a unique idempotency key for each transaction attempt. If you retry with the same key, ZitoPay will return the original transaction result instead of creating a duplicate."
    },
    {
        question: "How do webhooks work?",
        answer: "Webhooks allow you to receive real-time notifications about transaction events. After registering a webhook endpoint in your dashboard, ZitoPay sends HTTP POST requests to your endpoint when events occur (like transaction completion or failure). Always verify the webhook signature in the X-Webhook-Signature header before processing webhook payloads for security."
    },
    {
        question: "What happens if a transaction fails?",
        answer: "If a transaction fails, you'll receive a webhook notification with the failure reason. You can also check the transaction status using the GET /api/v1/wallets/transactions/:id endpoint. Failed transactions are not charged to the customer. Common failure reasons include insufficient funds, incorrect phone number format, or gateway unavailability."
    },
    {
        question: "How are fees calculated?",
        answer: "Fees consist of two components: gateway fees (charged by the mobile money provider like MTN or Orange) and platform fees (ZitoPay service fee). When you create a quote, you'll receive the exact fee breakdown. Fees are locked in for 15 minutes with the quote. The total amount the customer pays includes the original amount plus all fees."
    },
    {
        question: "Can I use the same API key for sandbox and production?",
        answer: "No, sandbox and production environments use completely separate API keys. Your sandbox API key will only work in the sandbox environment and should never be used in production. After completing KYC and requesting production access, you'll receive separate production API keys that should be kept secure and only used in production."
    },
    {
        question: "What is the rate limit for API requests?",
        answer: "The default rate limit is 100 requests per minute per merchant. This is configurable based on your needs. If you exceed the rate limit, you'll receive a 429 Too Many Requests response with a retry_after header indicating how many seconds to wait before retrying. Implement exponential backoff when handling rate limit responses."
    },
    {
        question: "How do I handle refunds?",
        answer: "Refunds can be processed through the ZitoPay API. There are two methods: reversal (instant refund by reversing the original transaction) and manual refund (processed separately). To create a refund, use the refund endpoint with the original transaction ID and a reason. Refunds are subject to the same security and verification requirements as other transactions."
    }
];

export default function FAQPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggleQuestion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div>
            <h1>Frequently Asked Questions</h1>
            <p className="mb-6">
                Find answers to common questions about ZitoPay API, integration, and usage.
            </p>

            <div className="space-y-3 mb-12">
                {faqItems.map((item, index) => (
                    <div
                        key={index}
                        className="bg-background border border-border rounded-lg overflow-hidden hover:shadow-md transition-all duration-200"
                    >
                        <button
                            onClick={() => toggleQuestion(index)}
                            className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/50 transition-colors duration-200"
                        >
                            <span className="text-sm font-semibold text-foreground pr-4">{item.question}</span>
                            <div className="flex-shrink-0 transition-transform duration-200">
                                {openIndex === index ? (
                                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                )}
                            </div>
                        </button>
                        <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                            }`}
                        >
                            <div className="px-3 pb-3 border-t border-border">
                                <p className="pt-3 text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Support Boxes */}
            <div className="grid md:grid-cols-2 gap-4 mt-10">
                {/* Contact Support */}
                <Link
                    href="/support"
                    className="group bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:scale-[1.01]"
                >
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                            <MessageCircle className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-1.5">
                                Contact Support
                            </h3>
                            <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                                Need help? Our support team is here to assist you with any questions or issues you may have.
                            </p>
                        </div>
                    </div>
                </Link>

                {/* Create a Ticket */}
                <Link
                    href="/support/ticket"
                    className="group bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:scale-[1.01]"
                >
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                            <Ticket className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-orange-900 dark:text-orange-100 mb-1.5">
                                Create a Ticket
                            </h3>
                            <p className="text-xs text-orange-800 dark:text-orange-200 leading-relaxed">
                                Submit a support ticket for technical issues, feature requests, or detailed inquiries.
                            </p>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}
