"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/docs/CodeBlock";

export default function RegisterWebhookPage() {
    return (
        <div>
            <h1>Register Webhook Endpoint</h1>
            <p>
                This guide explains how to register and manage webhook endpoints in ZitoPay. You can register endpoints through the dashboard or via the API.
            </p>

            <h2>Prerequisites</h2>
            <ul>
                <li>A server endpoint that accepts HTTP POST requests</li>
                <li>HTTPS URL (required for production, HTTP allowed for local testing)</li>
                <li>Endpoint must be publicly accessible (not behind a firewall)</li>
                <li>Ability to verify HMAC signatures</li>
                <li>Endpoint must respond within 30 seconds</li>
                <li>Ability to capture raw request body (before JSON parsing) for signature verification</li>
            </ul>

            <h2>Registering via Dashboard</h2>
            <p>
                The easiest way to register a webhook endpoint is through the ZitoPay dashboard:
            </p>

            <ol>
                <li>Navigate to <Link href="/dashboard/webhooks" className="text-primary hover:underline">Dashboard → Webhooks</Link></li>
                <li>Click &quot;Add Endpoint&quot; button</li>
                <li>Enter your webhook URL (must be HTTPS in production)</li>
                <li>All 6 events are automatically selected (required)</li>
                <li>Click &quot;Create Endpoint&quot;</li>
                <li><strong>Save your webhook secret</strong> - it&apos;s only shown once!</li>
            </ol>

            <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-lg p-4 my-6">
                <div className="flex items-start gap-3">
                    <span className="text-orange-700 dark:text-orange-400 text-lg mt-0.5">⚠️</span>
                    <div className="flex-1 text-sm text-orange-900 dark:text-orange-100">
                        <p className="leading-relaxed">
                            <strong>Important:</strong> The webhook secret is only returned once during registration. Make sure to save it securely - you&apos;ll need it to verify webhook signatures. If you lose it, you&apos;ll need to create a new endpoint.
                        </p>
                    </div>
                </div>
            </div>

            <h2>Registering via API</h2>
            <p>
                You can also register webhook endpoints programmatically using the API:
            </p>

            <h3>Endpoint</h3>
            <p>
                <code>POST /merchant/v1/webhooks/endpoints</code>
            </p>

            <h3>Request Body</h3>
            <CodeBlock
                code={`{
  "url": "https://your-server.com/webhooks/zitopay",
  "events": [
    "payment.succeeded",
    "payment.failed",
    "payout.completed",
    "payout.failed",
    "refund.completed",
    "settlement.generated"
  ]
}`}
                language="json"
            />

            <h3>Response</h3>
            <CodeBlock
                code={`{
  "endpoint": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "merchantId": "merchant-uuid",
    "url": "https://your-server.com/webhooks/zitopay",
    "enabled": true,
    "events": [
      "payment.succeeded",
      "payment.failed",
      "payout.completed",
      "payout.failed",
      "refund.completed",
      "settlement.generated"
    ],
    "secret": "whsec_abc123def456...",
    "createdAt": "2026-01-18T23:30:00.000Z"
  }
}`}
                language="json"
            />

            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 my-6">
                <div className="flex items-start gap-3">
                    <span className="text-blue-700 dark:text-blue-400 text-lg mt-0.5">💡</span>
                    <div className="flex-1 text-sm text-blue-900 dark:text-blue-100">
                        <p className="leading-relaxed">
                            <strong>Save the Secret:</strong> The <code>secret</code> field in the response is your webhook signing secret. Store it securely in your environment variables or secret management system. You&apos;ll use this to verify that webhook requests are actually from ZitoPay.
                        </p>
                    </div>
                </div>
            </div>

            <h2>Required Events</h2>
            <p>
                When registering a webhook endpoint, you <strong>must</strong> include all 6 required events:
            </p>

            <div className="bg-muted/50 border border-border rounded-lg p-3 my-4">
                <ul className="list-disc list-inside space-y-1 text-sm">
                    <li><code>payment.succeeded</code> - Payment completed successfully</li>
                    <li><code>payment.failed</code> - Payment failed</li>
                    <li><code>payout.completed</code> - Payout sent successfully</li>
                    <li><code>payout.failed</code> - Payout failed</li>
                    <li><code>refund.completed</code> - Refund processed</li>
                    <li><code>settlement.generated</code> - Settlement created</li>
                </ul>
            </div>

            <p>
                You cannot register a webhook endpoint with only a subset of events. All 6 events are required to ensure you receive all transaction notifications.
            </p>

            <h2>URL Requirements</h2>
            <ul>
                <li><strong>Production:</strong> Must use HTTPS (HTTP is not allowed)</li>
                <li><strong>Sandbox/Local:</strong> HTTP is allowed for testing only</li>
                <li>URL must be publicly accessible (not localhost in production, not behind a firewall)</li>
                <li>URL must accept POST requests</li>
                <li>Endpoint should respond within 30 seconds</li>
            </ul>

            <div className="bg-muted/50 border border-border rounded-lg p-3 my-4">
                <p className="text-sm font-medium mb-2">Example URLs:</p>
                <ul className="text-sm space-y-1">
                    <li>✅ <code>https://api.yourstore.com/webhooks/zitopay</code></li>
                    <li>✅ <code>https://yourstore.com/api/webhooks/zitopay</code></li>
                    <li>❌ <code>http://localhost:3000/webhooks</code> (HTTP not allowed in production)</li>
                    <li>❌ <code>https://192.168.1.100/webhooks</code> (Not publicly accessible)</li>
                </ul>
            </div>

            <h2>Updating an Endpoint</h2>
            <p>
                You can update an existing webhook endpoint to change its URL, enable/disable it, or update events:
            </p>

            <h3>Endpoint</h3>
            <p>
                <code>PUT /merchant/v1/webhooks/endpoints/:id</code>
            </p>

            <h3>Request Body</h3>
            <CodeBlock
                code={`{
  "url": "https://new-server.com/webhooks/zitopay",
  "enabled": true,
  "events": [
    "payment.succeeded",
    "payment.failed",
    "payout.completed",
    "payout.failed",
    "refund.completed",
    "settlement.generated"
  ]
}`}
                language="json"
            />

            <p>
                All fields are optional, but if you update <code>events</code>, you must include all 6 required events.
            </p>

            <h2>Listing Endpoints</h2>
            <p>
                Get all webhook endpoints for your merchant account:
            </p>

            <h3>Endpoint</h3>
            <p>
                <code>GET /merchant/v1/webhooks/endpoints</code>
            </p>

            <h3>Response</h3>
            <CodeBlock
                code={`{
  "endpoints": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "url": "https://your-server.com/webhooks/zitopay",
      "enabled": true,
      "events": [...],
      "createdAt": "2026-01-18T23:30:00.000Z"
    }
  ]
}`}
                language="json"
            />

            <p>
                Note: The <code>secret</code> is not included in the list response. To retrieve the secret for an existing endpoint, use the <code>GET /merchant/v1/webhooks/endpoints/:id</code> endpoint.
            </p>

            <h2>Getting Endpoint Details</h2>
            <p>
                Get detailed information about a specific endpoint, including the secret:
            </p>

            <h3>Endpoint</h3>
            <p>
                <code>GET /merchant/v1/webhooks/endpoints/:id</code>
            </p>

            <h3>Response</h3>
            <CodeBlock
                code={`{
  "endpoint": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "url": "https://your-server.com/webhooks/zitopay",
    "enabled": true,
    "events": [...],
    "secret": "whsec_abc123def456...",
    "createdAt": "2026-01-18T23:30:00.000Z",
    "updatedAt": "2026-01-18T23:35:00.000Z"
  }
}`}
                language="json"
            />

            <h2>Enabling and Disabling Endpoints</h2>
            <p>
                You can temporarily disable a webhook endpoint without deleting it. Disabled endpoints will not receive webhook deliveries:
            </p>

            <CodeBlock
                code={`PUT /merchant/v1/webhooks/endpoints/:id
{
  "enabled": false
}`}
                language="json"
            />

            <p>
                To re-enable the endpoint, set <code>enabled: true</code>.
            </p>

            <h2>Testing Your Endpoint</h2>
            <p>
                After registering your endpoint, you can test it using several methods:
            </p>

            <h3>Method 1: Test Transaction</h3>
            <ol>
                <li>Make a test transaction in sandbox mode</li>
                <li>Check the webhook deliveries in your ZitoPay dashboard</li>
                <li>Verify that your server receives the webhook</li>
                <li>Confirm that signature verification works</li>
                <li>Check your server logs for webhook processing</li>
            </ol>

            <h3>Method 2: Test Endpoint (if available)</h3>
            <p>
                Some implementations provide a test endpoint to verify your webhook handler is accessible:
            </p>

            <CodeBlock
                code={`# Test if webhook endpoint is accessible
curl -X GET https://your-domain.com/api/webhooks/test

# Expected response:
{
  "message": "Webhook endpoint is accessible",
  "endpoint": "/api/webhooks/zitopay",
  "method": "POST",
  "status": "ready"
}`}
                language="bash"
            />

            <h3>Method 3: Manual Testing with curl</h3>
            <p>
                You can test your endpoint manually, but note that signature verification will fail without a proper signature from ZitoPay:
            </p>

            <CodeBlock
                code={`# Basic connectivity test (signature will fail)
curl -X POST https://your-domain.com/api/webhooks/zitopay \\
  -H "Content-Type: application/json" \\
  -H "X-Zito-Event: payment.succeeded" \\
  -H "X-Zito-Delivery-Id: test-123" \\
  -H "X-Zito-Timestamp: 1769164241000" \\
  -H "X-Zito-Signature: test-signature" \\
  -d '{"event":"payment.succeeded","data":{"transaction_id":"test"}}'`}
                language="bash"
            />

            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 my-6">
                <div className="flex items-start gap-3">
                    <span className="text-blue-700 dark:text-blue-400 text-lg mt-0.5">💡</span>
                    <div className="flex-1 text-sm text-blue-900 dark:text-blue-100">
                        <p className="leading-relaxed">
                            <strong>Note:</strong> Real webhooks must come from ZitoPay with proper HMAC-SHA256 signatures. Manual testing with curl will fail signature verification, but you can verify that your endpoint is accessible and returns appropriate error messages.
                        </p>
                    </div>
                </div>
            </div>

            <h3>Verification Checklist</h3>
            <ul>
                <li>✅ Webhook endpoint is publicly accessible (HTTPS)</li>
                <li>✅ Environment variables are set correctly</li>
                <li>✅ Webhook secret is configured</li>
                <li>✅ Test endpoint returns success (if available)</li>
                <li>✅ Webhook logs appear in your monitoring system</li>
                <li>✅ Signature verification works (test with invalid signature)</li>
                <li>✅ Idempotency works (test duplicate delivery ID)</li>
                <li>✅ All 6 event types are handled</li>
            </ul>

            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 my-6">
                <div className="flex items-start gap-3">
                    <span className="text-blue-700 dark:text-blue-400 text-lg mt-0.5">💡</span>
                    <div className="flex-1 text-sm text-blue-900 dark:text-blue-100">
                        <p className="leading-relaxed">
                            <strong>Local Testing:</strong> Use a tool like <strong>ngrok</strong> to expose your local server for testing. Run <code>ngrok http 3000</code> and use the provided HTTPS URL for your webhook endpoint. This allows you to test webhook signature verification locally before deploying to production.
                        </p>
                    </div>
                </div>
            </div>

            <h2>Your Webhook Secret</h2>
            <p>
                When you register a webhook endpoint, ZitoPay generates a unique <strong>webhook secret</strong> (64-character hex string). This secret is:
            </p>
            <ul>
                <li><strong>Shown only once</strong> when you create the endpoint</li>
                <li><strong>Used to verify signatures</strong> - store it securely</li>
                <li><strong>Different for each endpoint</strong> - if you have multiple endpoints, each has its own secret</li>
            </ul>

            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4 my-6">
                <div className="flex items-start gap-3">
                    <span className="text-red-700 dark:text-red-400 text-lg mt-0.5">⚠️</span>
                    <div className="flex-1 text-sm text-red-900 dark:text-red-100">
                        <p className="leading-relaxed">
                            <strong>Critical:</strong> Store your webhook secret securely (environment variable, secrets manager, etc.). Never commit it to code or version control. If you lose it, you&apos;ll need to create a new endpoint.
                        </p>
                    </div>
                </div>
            </div>

            <h2>Configuration Requirements</h2>
            <p>
                After registering your webhook endpoint, you need to configure your server with the webhook secret:
            </p>

            <h3>Environment Variables</h3>
            <p>
                Store your webhook secret in an environment variable:
            </p>

            <CodeBlock
                code={`# .env.local or production environment
ZITOPAY_WEBHOOK_SECRET=your_64_character_hex_string_from_zitopay`}
                language="bash"
            />

            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4 my-6">
                <div className="flex items-start gap-3">
                    <span className="text-red-700 dark:text-red-400 text-lg mt-0.5">⚠️</span>
                    <div className="flex-1 text-sm text-red-900 dark:text-red-100">
                        <p className="leading-relaxed">
                            <strong>Security Warning:</strong> Never commit your webhook secret to version control. Always use environment variables or a secrets management service. Never expose the secret in client-side code or logs.
                        </p>
                    </div>
                </div>
            </div>

            <h3>Endpoint Requirements</h3>
            <ul>
                <li><strong>HTTPS Only:</strong> Webhook endpoint must be publicly accessible via HTTPS (HTTP only for local testing)</li>
                <li><strong>Public URL:</strong> Cannot be localhost or private IP address in production</li>
                <li><strong>Response Time:</strong> Must respond within 30 seconds</li>
                <li><strong>Status Code:</strong> Must return 200 OK for successful receipt</li>
                <li><strong>Raw Body Access:</strong> Must be able to access raw request body (before JSON parsing) for signature verification</li>
            </ul>

            <h2>Best Practices</h2>
            <ul>
                <li><strong>Save your secret securely:</strong> Store it in environment variables or a secret management system</li>
                <li><strong>Use HTTPS in production:</strong> Never use HTTP for production webhooks</li>
                <li><strong>Test thoroughly:</strong> Test your endpoint with sandbox transactions before going live</li>
                <li><strong>Monitor deliveries:</strong> Regularly check webhook delivery status in the dashboard</li>
                <li><strong>Handle all events:</strong> Make sure your webhook handler can process all 6 event types</li>
                <li><strong>Implement idempotency:</strong> Use delivery IDs to prevent duplicate processing</li>
                <li><strong>Log everything:</strong> Log all webhook receipts for debugging and auditing</li>
                <li><strong>Respond quickly:</strong> Return 200 OK within 30 seconds, process events asynchronously</li>
            </ul>

            <h2>Next Steps</h2>
            <ul>
                <li>Learn about <Link href="/docs/webhooks/events" className="text-primary hover:underline">Webhook Events</Link> and their payloads</li>
                <li>Understand <Link href="/docs/webhooks/security" className="text-primary hover:underline">Webhook Security</Link> and signature verification</li>
                <li>View <Link href="/dashboard/webhooks" className="text-primary hover:underline">Your Webhook Endpoints</Link> in the dashboard</li>
            </ul>
        </div>
    );
}
