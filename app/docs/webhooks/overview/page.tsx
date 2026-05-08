"use client";

import Link from "next/link";

export default function WebhooksOverviewPage() {
    return (
        <div>
            <h1>Webhooks Overview</h1>
            <p>
                Webhooks allow you to receive real-time notifications about transaction events. Instead of polling for status updates, ZitoPay will automatically send HTTP POST requests to your registered endpoint when events occur.
            </p>

            <h2>How Webhooks Work</h2>
            <ol>
                <li>Register a webhook endpoint in your dashboard (or via API) with your server URL</li>
                <li>ZitoPay generates a unique webhook secret (shown only once - save it securely!)</li>
                <li>ZitoPay sends HTTP POST requests to your endpoint when events occur</li>
                <li>Your server verifies the webhook signature using the provided secret</li>
                <li>Your server checks the delivery ID for idempotency (prevent duplicates)</li>
                <li>Your server processes the event and updates your system</li>
                <li>Your server returns a 200 OK response within 30 seconds</li>
            </ol>

            <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-lg p-4 my-6">
                <div className="flex items-start gap-3">
                    <span className="text-orange-700 dark:text-orange-400 text-lg mt-0.5">⚠️</span>
                    <div className="flex-1 text-sm text-orange-900 dark:text-orange-100">
                        <p className="leading-relaxed">
                            <strong>Important:</strong> Your webhook secret is shown only once when you register the endpoint. Make sure to save it securely in your environment variables or secret management system. You&apos;ll need it to verify webhook signatures.
                        </p>
                    </div>
                </div>
            </div>

            <h2>Supported Events</h2>
            <p>
                <strong>Important:</strong> You must subscribe to <strong>all 6 required events</strong> when registering a webhook endpoint. This ensures you receive all transaction notifications.
            </p>

            <div className="bg-muted/50 border border-border rounded-lg p-3 my-4">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="text-left py-1.5 pr-4 font-medium">Event</th>
                            <th className="text-left py-1.5 font-medium">Description</th>
                            <th className="text-left py-1.5 font-medium">When It Fires</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="py-1.5 pr-4"><code>payment.succeeded</code></td>
                            <td className="py-1.5">Payment completed successfully</td>
                            <td className="py-1.5">When a collection transaction succeeds</td>
                        </tr>
                        <tr>
                            <td className="py-1.5 pr-4"><code>payment.failed</code></td>
                            <td className="py-1.5">Payment failed</td>
                            <td className="py-1.5">When a collection transaction fails</td>
                        </tr>
                        <tr>
                            <td className="py-1.5 pr-4"><code>payout.completed</code></td>
                            <td className="py-1.5">Payout sent successfully</td>
                            <td className="py-1.5">When a disbursement/payout succeeds</td>
                        </tr>
                        <tr>
                            <td className="py-1.5 pr-4"><code>payout.failed</code></td>
                            <td className="py-1.5">Payout failed</td>
                            <td className="py-1.5">When a disbursement/payout fails</td>
                        </tr>
                        <tr>
                            <td className="py-1.5 pr-4"><code>refund.completed</code></td>
                            <td className="py-1.5">Refund processed</td>
                            <td className="py-1.5">When a refund is successfully processed</td>
                        </tr>
                        <tr>
                            <td className="py-1.5 pr-4"><code>settlement.generated</code></td>
                            <td className="py-1.5">Settlement created</td>
                            <td className="py-1.5">When a new settlement is generated</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-lg p-4 my-6">
                <div className="flex items-start gap-3">
                    <span className="text-orange-700 dark:text-orange-400 text-lg mt-0.5">⚠️</span>
                    <div className="flex-1 text-sm text-orange-900 dark:text-orange-100">
                        <p className="leading-relaxed">
                            <strong>Required Events:</strong> All 6 events listed above must be included when registering a webhook endpoint. You cannot subscribe to a subset of events.
                        </p>
                    </div>
                </div>
            </div>

            <h2>Key Features</h2>
            <ul>
                <li>✅ <strong>Real-time notifications</strong> for all transaction events</li>
                <li>✅ <strong>HMAC signature verification</strong> for security</li>
                <li>✅ <strong>Automatic retries</strong> with exponential backoff (6 attempts)</li>
                <li>✅ <strong>Dead letter queue</strong> for failed deliveries</li>
                <li>✅ <strong>Manual replay</strong> of failed webhooks</li>
                <li>✅ <strong>Delivery logs</strong> and monitoring</li>
            </ul>

            <h2>Webhook Security</h2>
            <p>
                All webhooks include an HMAC-SHA256 signature in the <code>X-Zito-Signature</code> header. Always verify this signature before processing webhook payloads to ensure requests are from ZitoPay.
            </p>
            
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4 my-6">
                <div className="flex items-start gap-3">
                    <span className="text-red-700 dark:text-red-400 text-lg mt-0.5">🔒</span>
                    <div className="flex-1 text-sm text-red-900 dark:text-red-100">
                        <p className="font-semibold mb-2">Critical Security Requirements</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li><strong>Always verify signatures:</strong> Never process webhooks without signature verification</li>
                            <li><strong>Use raw body:</strong> Capture the raw request body (before JSON parsing) for signature verification</li>
                            <li><strong>Check timestamp:</strong> Reject requests older than 5 minutes (replay attack prevention)</li>
                            <li><strong>Signature format:</strong> The signature header contains only the hex string (no <code>sha256=</code> prefix)</li>
                            <li><strong>Timestamp format:</strong> Timestamp is in milliseconds, not seconds</li>
                        </ul>
                    </div>
                </div>
            </div>

            <p>
                For detailed signature verification instructions, see the <Link href="/docs/webhooks/security" className="text-primary hover:underline">Webhook Security</Link> page.
            </p>

            <h2>Retry Logic</h2>
            <p>
                If your server doesn&apos;t respond with HTTP 200-299, ZitoPay will automatically retry the webhook delivery (up to 6 attempts):
            </p>

            <div className="bg-muted/50 border border-border rounded-lg p-3 my-4">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="text-left py-1.5 pr-4 font-medium">Attempt</th>
                            <th className="text-left py-1.5 font-medium">Delay</th>
                            <th className="text-left py-1.5 font-medium">Total Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td className="py-1.5 pr-4">1</td><td className="py-1.5">Immediate</td><td className="py-1.5">0s</td></tr>
                        <tr><td className="py-1.5 pr-4">2</td><td className="py-1.5">1 minute</td><td className="py-1.5">1m</td></tr>
                        <tr><td className="py-1.5 pr-4">3</td><td className="py-1.5">5 minutes</td><td className="py-1.5">6m</td></tr>
                        <tr><td className="py-1.5 pr-4">4</td><td className="py-1.5">15 minutes</td><td className="py-1.5">21m</td></tr>
                        <tr><td className="py-1.5 pr-4">5</td><td className="py-1.5">1 hour</td><td className="py-1.5">1h 21m</td></tr>
                        <tr><td className="py-1.5 pr-4">6</td><td className="py-1.5">6 hours</td><td className="py-1.5">7h 21m</td></tr>
                    </tbody>
                </table>
            </div>

            <p>
                After 6 failed attempts, the webhook is moved to the <strong>Dead Letter Queue (DLQ)</strong> where you can manually replay it after fixing the issue.
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 my-6">
                <div className="flex items-start gap-3">
                    <span className="text-blue-700 dark:text-blue-400 text-lg mt-0.5">💡</span>
                    <div className="flex-1 text-sm text-blue-900 dark:text-blue-100">
                        <p className="leading-relaxed">
                            <strong>Response Codes:</strong> Return 200 OK even if processing fails (if you don&apos;t want retries), or return 500/502/503 if you want ZitoPay to retry the webhook.
                        </p>
                    </div>
                </div>
            </div>

            <h2>Best Practices</h2>
            <ul>
                <li><strong>Always verify signatures:</strong> Never process webhooks without signature verification - this is critical for security</li>
                <li><strong>Use raw body for signature:</strong> Capture the raw request body before JSON parsing for signature verification</li>
                <li><strong>Respond quickly:</strong> Return HTTP 200 within 30 seconds. Process webhooks asynchronously using a queue if needed.</li>
                <li><strong>Implement idempotency:</strong> Use <code>X-Zito-Delivery-Id</code> header to prevent duplicate processing</li>
                <li><strong>Handle duplicates:</strong> Webhooks may be delivered more than once. Always check delivery ID before processing.</li>
                <li><strong>Check timestamps:</strong> Verify timestamp is within 5 minutes to prevent replay attacks</li>
                <li><strong>Use HTTPS:</strong> Webhook URLs must use HTTPS in production (HTTP is only allowed for local testing)</li>
                <li><strong>Store secrets securely:</strong> Never commit webhook secrets to code - use environment variables or secret management</li>
                <li><strong>Log everything:</strong> Log all webhook deliveries for debugging and auditing</li>
                <li><strong>Monitor deliveries:</strong> Regularly check webhook delivery status in the dashboard and set up alerts for failed webhooks</li>
                <li><strong>Handle errors gracefully:</strong> Don&apos;t let processing errors crash your server</li>
                <li><strong>Subscribe to all events:</strong> All 6 events are required when registering a webhook endpoint</li>
            </ul>

            <h2>Monitoring and Logging</h2>
            <p>
                It&apos;s important to monitor your webhook activity to ensure everything is working correctly:
            </p>

            <h3>What to Monitor</h3>
            <ul>
                <li><strong>Webhook Receipts:</strong> Track all incoming webhooks</li>
                <li><strong>Success Rate:</strong> Monitor successful vs failed webhook processing</li>
                <li><strong>Signature Verification:</strong> Track invalid signature attempts (security concern)</li>
                <li><strong>Duplicate Deliveries:</strong> Monitor how often duplicate webhooks are received</li>
                <li><strong>Response Times:</strong> Ensure responses are within 30 seconds</li>
                <li><strong>Error Rates:</strong> Alert on high error rates</li>
            </ul>

            <h3>Webhook Status Indicators</h3>
            <p>
                Your webhook handler should track these statuses:
            </p>

            <div className="bg-muted/50 border border-border rounded-lg p-3 my-4">
                <ul className="space-y-2 text-sm">
                    <li>
                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs font-medium mr-2">SUCCESS</span>
                        Webhook processed successfully
                    </li>
                    <li>
                        <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-xs font-medium mr-2">ERROR</span>
                        Error during processing - check logs
                    </li>
                    <li>
                        <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded text-xs font-medium mr-2">INVALID_SIGNATURE</span>
                        Signature verification failed - security issue
                    </li>
                    <li>
                        <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded text-xs font-medium mr-2">DUPLICATE</span>
                        Already processed (idempotency working correctly)
                    </li>
                </ul>
            </div>

            <h3>Logging Best Practices</h3>
            <ul>
                <li><strong>Log all receipts:</strong> Include delivery ID, event type, timestamp, status</li>
                <li><strong>Store payloads:</strong> Keep payload data for troubleshooting (sanitize sensitive data)</li>
                <li><strong>Track errors:</strong> Log full error context for debugging</li>
                <li><strong>Set up alerts:</strong> Alert on security issues or high error rates</li>
                <li><strong>Use persistent storage:</strong> Store logs in database or logging service (not just in-memory)</li>
            </ul>

            <h2>Production Checklist</h2>
            <p>
                Before going to production, ensure:
            </p>

            <div className="bg-muted/50 border border-border rounded-lg p-3 my-4">
                <ul className="space-y-2 text-sm">
                    <li>✅ Webhook endpoint uses HTTPS only</li>
                    <li>✅ Signature verification is implemented and tested</li>
                    <li>✅ Timestamp validation is in place (prevent replay attacks)</li>
                    <li>✅ Idempotency is implemented (prevent duplicate processing)</li>
                    <li>✅ Webhook secret is stored securely (not in code)</li>
                    <li>✅ Error handling is implemented</li>
                    <li>✅ Logging is in place for debugging</li>
                    <li>✅ Endpoint responds within 30 seconds</li>
                    <li>✅ Endpoint is publicly accessible</li>
                    <li>✅ All 6 event types are handled</li>
                    <li>✅ Monitoring and alerts are set up</li>
                    <li>✅ Database integration for persistent storage (if needed)</li>
                </ul>
            </div>

            <h2>Next Steps</h2>
            <ul>
                <li>Learn how to <Link href="/docs/webhooks/register" className="text-primary hover:underline">Register a Webhook Endpoint</Link></li>
                <li>See all available <Link href="/docs/webhooks/events" className="text-primary hover:underline">Webhook Events</Link></li>
                <li>Understand <Link href="/docs/webhooks/security" className="text-primary hover:underline">Webhook Security and Signature Verification</Link></li>
                <li>View <Link href="/dashboard/webhooks" className="text-primary hover:underline">Your Webhook Endpoints</Link> in the dashboard</li>
            </ul>
        </div>
    );
}
