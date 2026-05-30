"use client";

import Link from "next/link";

export default function DisbursementsOverviewPage() {
    return (
        <div>
            <h1>Disbursements Overview</h1>
            <p>
                Disbursements allow you to send money to customers, suppliers, employees, or partners via mobile money. This section covers everything you need to know about processing payouts through ZitoPay.
            </p>

            <h2>How Disbursements Work</h2>
            <p>
                The disbursement process involves several steps:
            </p>
            <ol>
                <li><strong>Create a Quote:</strong> Get pricing information for the payout</li>
                <li><strong>Execute Disbursement:</strong> Process the payout to the recipient</li>
                <li><strong>Check Status:</strong> Monitor the payout status</li>
                <li><strong>List Payouts:</strong> View all your payouts with filters</li>
                <li><strong>Bulk Payouts:</strong> Process multiple payouts from a CSV file</li>
            </ol>

            <h2>Supported Gateways</h2>
            <ul>
                <li><strong>MTN Mobile Money:</strong> Available in Cameroon, Ivory Coast, and other supported countries</li>
                <li><strong>Orange Money:</strong> Push payment integration</li>
            </ul>

            <h2>Disbursement Flow</h2>
            <ol>
                <li>You initiate a payout on your platform</li>
                <li>Your application creates a quote via <code>POST /api/v1/disbursements/quote</code></li>
                <li>Quote includes fees, the recipient amount, and the merchant wallet deduction</li>
                <li>Your application executes disbursement via <code>POST /api/v1/disbursements/execute</code></li>
                <li>ZitoPay processes payout with the mobile money provider</li>
                <li>Webhook notification sent when payout completes</li>
                <li>Check payout status via <code>GET /api/v1/disbursements/:id</code></li>
            </ol>

            <h2>Payout Statuses</h2>
            <ul>
                <li><strong>PENDING:</strong> Payout initiated, awaiting processing</li>
                <li><strong>PROCESSING:</strong> Payout is being processed</li>
                <li><strong>SUCCESS:</strong> Payout completed successfully</li>
                <li><strong>FAILED:</strong> Payout failed (check error details)</li>
                <li><strong>CANCELLED:</strong> Payout was cancelled</li>
            </ul>

            <h2>Fees</h2>
            <p>
                Each disbursement includes:
            </p>
            <ul>
                <li><strong>Gateway Fee:</strong> Fee charged by the mobile money provider</li>
                <li><strong>Platform Fee:</strong> ZitoPay service fee</li>
                <li><strong>Total Amount:</strong> Amount you pay (payout amount + fees)</li>
            </ul>

            <h2>Idempotency</h2>
            <p>
                Always include an <code>idempotency_key</code> when executing disbursements. This ensures that if a request is retried due to network issues, the same payout won&apos;t be processed twice.
            </p>
            
            <div className="bg-crimson-red-50 dark:bg-crimson-red-900/10 border border-crimson-red-200 dark:border-crimson-red-800 rounded-lg p-4 my-6">
                <div className="flex items-start gap-3">
                    <span className="text-crimson-red-700 dark:text-crimson-red-400 text-lg mt-0.5">💡</span>
                    <div className="flex-1 text-sm text-crimson-red-900 dark:text-crimson-red-100">
                        <p className="leading-relaxed">
                            <strong>Quote Expiry:</strong> Quotes are valid for 15 minutes. After expiry, you must create a new quote as fees may have changed. Always use the quote ID from the most recent quote when executing a disbursement.
                        </p>
                    </div>
                </div>
            </div>

            <h2>Next Steps</h2>
            <ul>
                <li>Learn how to <Link href="/docs/disbursements/create-quote">Create a Quote</Link></li>
                <li>See how to <Link href="/docs/disbursements/execute">Execute a Disbursement</Link></li>
                <li>Understand <Link href="/docs/disbursements/get-status">Payout Status</Link></li>
                <li>View <Link href="/docs/disbursements/list-payouts">List Payouts</Link> documentation</li>
                <li>Learn about <Link href="/docs/disbursements/bulk-payouts">Bulk Payouts</Link></li>
            </ul>
        </div>
    );
}
