"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/docs/CodeBlock";

export default function CollectionsOverviewPage() {
    return (
        <div>
            <h1>Collections Overview</h1>
            <p>
                Collections allow you to receive payments from customers via mobile money. This section covers everything you need to know about collecting payments through ZitoPay.
            </p>

            <h2>How Collections Work</h2>
            <p>
                The collection process involves three main steps:
            </p>
            <ol>
                <li><strong>Create a Quote:</strong> Get pricing information for the transaction</li>
                <li><strong>Execute Collection:</strong> Process the payment from the customer</li>
                <li><strong>Check Status:</strong> Monitor the transaction status</li>
            </ol>

            <h2>Supported Gateways</h2>
            <ul>
                <li><strong>MTN Mobile Money:</strong> Available in Cameroon, Ivory Coast, and other supported countries</li>
                <li><strong>Orange Money:</strong> Merchant payment integration</li>
            </ul>

            <h2>Collection Flow</h2>
            <ol>
                <li>Customer initiates payment on your platform</li>
                <li>Your application creates a quote via <code>POST /api/v1/wallets/quote</code></li>
                <li>Quote includes fees and total amount</li>
                <li>Customer confirms payment details</li>
                <li>Your application executes collection via <code>POST /api/v1/wallets/collect</code></li>
                <li>ZitoPay processes payment with the mobile money provider</li>
                <li>Webhook notification sent when transaction completes</li>
                <li>Check transaction status via <code>GET /api/v1/wallets/transactions/:id</code></li>
            </ol>

            <h2>Transaction Statuses</h2>
            <ul>
                <li><strong>PENDING:</strong> Transaction initiated, awaiting processing</li>
                <li><strong>VERIFYING:</strong> Payment is being verified with the gateway</li>
                <li><strong>SUCCESS:</strong> Payment completed successfully</li>
                <li><strong>FAILED:</strong> Payment failed (check error details)</li>
                <li><strong>CANCELLED:</strong> Transaction was cancelled</li>
            </ul>

            <h2>Fees</h2>
            <p>
                Each collection includes:
            </p>
            <ul>
                <li><strong>Gateway Fee:</strong> Fee charged by the mobile money provider (MTN, Orange, etc.)</li>
                <li><strong>Platform Fee:</strong> ZitoPay service fee</li>
                <li><strong>Total Amount:</strong> Amount customer pays (original amount + fees)</li>
                <li><strong>Net to Merchant:</strong> Amount you receive after fees</li>
            </ul>

            <h2>Idempotency</h2>
            <p>
                Always include an <code>idempotency_key</code> when executing collections. This ensures that if a request is retried due to network issues, the same transaction won&apos;t be processed twice.
            </p>
            
            <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-lg p-4 my-6">
                <div className="flex items-start gap-3">
                    <span className="text-orange-700 dark:text-orange-400 text-lg mt-0.5">💡</span>
                    <div className="flex-1 text-sm text-orange-900 dark:text-orange-100">
                        <p className="leading-relaxed">
                            <strong>Quote Expiry:</strong> Quotes are valid for 15 minutes. After expiry, you must create a new quote as fees may have changed. Always use the quote ID from the most recent quote when executing a collection.
                        </p>
                    </div>
                </div>
            </div>

            <h2>Next Steps</h2>
            <ul>
                <li>Learn how to <Link href="/docs/collections/create-quote">Create a Quote</Link></li>
                <li>See how to <Link href="/docs/collections/execute">Execute a Collection</Link></li>
                <li>Understand <Link href="/docs/collections/status">Transaction Status</Link></li>
            </ul>
        </div>
    );
}
