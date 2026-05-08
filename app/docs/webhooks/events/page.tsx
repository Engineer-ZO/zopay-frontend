"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/docs/CodeBlock";

export default function WebhookEventsPage() {
    return (
        <div>
            <h1>Webhook Events</h1>
            <p>
                ZitoPay sends webhook notifications for 6 different event types. This page describes each event in detail, including when they fire and what data they contain.
            </p>

            <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-lg p-4 my-6">
                <div className="flex items-start gap-3">
                    <span className="text-orange-700 dark:text-orange-400 text-lg mt-0.5">⚠️</span>
                    <div className="flex-1 text-sm text-orange-900 dark:text-orange-100">
                        <p className="leading-relaxed">
                            <strong>Required Events:</strong> All 6 events listed below must be subscribed to when registering a webhook endpoint. You cannot subscribe to a subset of events.
                        </p>
                    </div>
                </div>
            </div>

            <h2>Event Structure</h2>
            <p>
                All webhook events follow the same structure:
            </p>

            <CodeBlock
                code={`{
  "event": "payment.succeeded",
  "data": {
    // Event-specific data
  },
  "timestamp": "2026-01-18T23:30:00.000Z"
}`}
                language="json"
            />

            <h2>Event Types</h2>

            <h3>1. payment.succeeded</h3>
            <p>
                Fired when a collection transaction completes successfully. This means money has been received from the customer.
            </p>

            <h4>When It Fires</h4>
            <ul>
                <li>Collection transaction status changes to <code>SUCCESS</code></li>
                <li>Payment is confirmed by the gateway</li>
                <li>Funds are available in merchant wallet</li>
            </ul>

            <h4>Payload</h4>
            <CodeBlock
                code={`{
  "event": "payment.succeeded",
  "data": {
    "transaction_id": "550e8400-e29b-41d4-a716-446655440000",
    "merchant_id": "merchant-uuid",
    "amount": "10000",
    "currency": "XAF",
    "gateway": "MTN_MOMO",
    "customer_msisdn": "237670000000",
    "status": "SUCCESS",
    "fees": "250",
    "net_amount": "9750",
    "created_at": "2026-01-18T23:30:00.000Z"
  },
  "timestamp": "2026-01-18T23:30:00.000Z"
}`}
                language="json"
            />

            <h4>Data Fields</h4>
            <div className="bg-muted/50 border border-border rounded-lg p-3 my-4">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="text-left py-1.5 pr-4 font-medium">Field</th>
                            <th className="text-left py-1.5 font-medium">Type</th>
                            <th className="text-left py-1.5 font-medium">Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="py-1.5 pr-4"><code>transaction_id</code></td>
                            <td className="py-1.5">string</td>
                            <td className="py-1.5">Unique transaction identifier</td>
                        </tr>
                        <tr>
                            <td className="py-1.5 pr-4"><code>merchant_id</code></td>
                            <td className="py-1.5">string</td>
                            <td className="py-1.5">Your merchant ID</td>
                        </tr>
                        <tr>
                            <td className="py-1.5 pr-4"><code>amount</code></td>
                            <td className="py-1.5">string</td>
                            <td className="py-1.5">Transaction amount (in smallest currency unit)</td>
                        </tr>
                        <tr>
                            <td className="py-1.5 pr-4"><code>currency</code></td>
                            <td className="py-1.5">string</td>
                            <td className="py-1.5">Currency code (e.g., &quot;XAF&quot;)</td>
                        </tr>
                        <tr>
                            <td className="py-1.5 pr-4"><code>gateway</code></td>
                            <td className="py-1.5">string</td>
                            <td className="py-1.5">Payment gateway used (e.g., &quot;MTN_MOMO&quot;)</td>
                        </tr>
                        <tr>
                            <td className="py-1.5 pr-4"><code>customer_msisdn</code></td>
                            <td className="py-1.5">string</td>
                            <td className="py-1.5">Customer phone number (E.164 format)</td>
                        </tr>
                        <tr>
                            <td className="py-1.5 pr-4"><code>fees</code></td>
                            <td className="py-1.5">string</td>
                            <td className="py-1.5">Total fees charged</td>
                        </tr>
                        <tr>
                            <td className="py-1.5 pr-4"><code>net_amount</code></td>
                            <td className="py-1.5">string</td>
                            <td className="py-1.5">Net amount after fees</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h3>2. payment.failed</h3>
            <p>
                Fired when a collection transaction fails. This could be due to insufficient funds, network issues, or other gateway errors.
            </p>

            <h4>When It Fires</h4>
            <ul>
                <li>Collection transaction status changes to <code>FAILED</code></li>
                <li>Gateway rejects the payment</li>
                <li>Payment timeout occurs</li>
            </ul>

            <h4>Payload</h4>
            <CodeBlock
                code={`{
  "event": "payment.failed",
  "data": {
    "transaction_id": "550e8400-e29b-41d4-a716-446655440000",
    "merchant_id": "merchant-uuid",
    "amount": "10000",
    "currency": "XAF",
    "gateway": "MTN_MOMO",
    "customer_msisdn": "237670000000",
    "status": "FAILED",
    "failure_reason": "Insufficient funds",
    "created_at": "2026-01-18T23:30:00.000Z"
  },
  "timestamp": "2026-01-18T23:30:00.000Z"
}`}
                language="json"
            />

            <h4>Additional Fields</h4>
            <ul>
                <li><code>failure_reason</code> - Human-readable reason for failure</li>
            </ul>

            <h3>3. payout.completed</h3>
            <p>
                Fired when a disbursement/payout transaction completes successfully. This means money has been sent to the recipient.
            </p>

            <h4>When It Fires</h4>
            <ul>
                <li>Payout transaction status changes to <code>SUCCESS</code></li>
                <li>Funds are successfully sent to recipient</li>
                <li>Gateway confirms the payout</li>
            </ul>

            <h4>Payload</h4>
            <CodeBlock
                code={`{
  "event": "payout.completed",
  "data": {
    "payout_id": "660e8400-e29b-41d4-a716-446655440001",
    "merchant_id": "merchant-uuid",
    "amount": "5000",
    "currency": "XAF",
    "gateway": "MTN_MOMO",
    "recipient_msisdn": "237671111111",
    "status": "SUCCESS",
    "fees": "100",
    "total_deducted": "5100",
    "created_at": "2026-01-18T23:30:00.000Z"
  },
  "timestamp": "2026-01-18T23:30:00.000Z"
}`}
                language="json"
            />

            <h4>Data Fields</h4>
            <ul>
                <li><code>payout_id</code> - Unique payout identifier</li>
                <li><code>recipient_msisdn</code> - Recipient phone number</li>
                <li><code>total_deducted</code> - Total amount deducted from wallet (amount + fees)</li>
            </ul>

            <h3>4. payout.failed</h3>
            <p>
                Fired when a disbursement/payout transaction fails. This could be due to invalid recipient, network issues, or insufficient wallet balance.
            </p>

            <h4>When It Fires</h4>
            <ul>
                <li>Payout transaction status changes to <code>FAILED</code></li>
                <li>Gateway rejects the payout</li>
                <li>Insufficient wallet balance</li>
            </ul>

            <h4>Payload</h4>
            <CodeBlock
                code={`{
  "event": "payout.failed",
  "data": {
    "payout_id": "660e8400-e29b-41d4-a716-446655440001",
    "merchant_id": "merchant-uuid",
    "amount": "5000",
    "currency": "XAF",
    "gateway": "MTN_MOMO",
    "recipient_msisdn": "237671111111",
    "status": "FAILED",
    "failure_reason": "Invalid recipient",
    "created_at": "2026-01-18T23:30:00.000Z"
  },
  "timestamp": "2026-01-18T23:30:00.000Z"
}`}
                language="json"
            />

            <h3>5. refund.completed</h3>
            <p>
                Fired when a refund is successfully processed. This means money has been returned to the customer.
            </p>

            <h4>When It Fires</h4>
            <ul>
                <li>Refund transaction status changes to <code>SUCCESS</code></li>
                <li>Refund is confirmed by the gateway</li>
                <li>Funds are returned to customer</li>
            </ul>

            <h4>Payload</h4>
            <CodeBlock
                code={`{
  "event": "refund.completed",
  "data": {
    "refund_id": "770e8400-e29b-41d4-a716-446655440002",
    "transaction_id": "550e8400-e29b-41d4-a716-446655440000",
    "merchant_id": "merchant-uuid",
    "amount": "10000",
    "currency": "XAF",
    "status": "SUCCESS",
    "created_at": "2026-01-18T23:30:00.000Z"
  },
  "timestamp": "2026-01-18T23:30:00.000Z"
}`}
                language="json"
            />

            <h4>Data Fields</h4>
            <ul>
                <li><code>refund_id</code> - Unique refund identifier</li>
                <li><code>transaction_id</code> - Original transaction that was refunded</li>
            </ul>

            <h3>6. settlement.generated</h3>
            <p>
                Fired when a new settlement is generated. Settlements represent periodic transfers of funds to merchants.
            </p>

            <h4>When It Fires</h4>
            <ul>
                <li>A new settlement is created</li>
                <li>Settlement period ends</li>
                <li>Settlement is ready for processing</li>
            </ul>

            <h4>Payload</h4>
            <CodeBlock
                code={`{
  "event": "settlement.generated",
  "data": {
    "settlement_id": "880e8400-e29b-41d4-a716-446655440003",
    "merchant_id": "merchant-uuid",
    "amount": "50000",
    "currency": "XAF",
    "period_start": "2026-01-01T00:00:00.000Z",
    "period_end": "2026-01-07T23:59:59.999Z",
    "transaction_count": 125,
    "created_at": "2026-01-18T23:30:00.000Z"
  },
  "timestamp": "2026-01-18T23:30:00.000Z"
}`}
                language="json"
            />

            <h4>Data Fields</h4>
            <ul>
                <li><code>settlement_id</code> - Unique settlement identifier</li>
                <li><code>period_start</code> - Start of settlement period</li>
                <li><code>period_end</code> - End of settlement period</li>
                <li><code>transaction_count</code> - Number of transactions in settlement</li>
            </ul>

            <h2>HTTP Headers</h2>
            <p>
                All webhook requests include the following headers:
            </p>

            <div className="bg-muted/50 border border-border rounded-lg p-3 my-4">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="text-left py-1.5 pr-4 font-medium">Header</th>
                            <th className="text-left py-1.5 font-medium">Description</th>
                            <th className="text-left py-1.5 font-medium">Example</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="py-1.5 pr-4"><code>X-Zito-Event</code></td>
                            <td className="py-1.5">The event type</td>
                            <td className="py-1.5"><code>payment.succeeded</code></td>
                        </tr>
                        <tr>
                            <td className="py-1.5 pr-4"><code>X-Zito-Delivery-Id</code></td>
                            <td className="py-1.5">Unique delivery ID (for idempotency)</td>
                            <td className="py-1.5"><code>delivery-uuid-123</code></td>
                        </tr>
                        <tr>
                            <td className="py-1.5 pr-4"><code>X-Zito-Timestamp</code></td>
                            <td className="py-1.5">Timestamp in milliseconds</td>
                            <td className="py-1.5"><code>1769164241000</code></td>
                        </tr>
                        <tr>
                            <td className="py-1.5 pr-4"><code>X-Zito-Signature</code></td>
                            <td className="py-1.5">HMAC-SHA256 signature (hex only, no prefix)</td>
                            <td className="py-1.5"><code>a1b2c3d4e5f6...</code></td>
                        </tr>
                        <tr>
                            <td className="py-1.5 pr-4"><code>X-Zito-Replay</code></td>
                            <td className="py-1.5">"true" if replayed (optional)</td>
                            <td className="py-1.5"><code>true</code></td>
                        </tr>
                        <tr>
                            <td className="py-1.5 pr-4"><code>Content-Type</code></td>
                            <td className="py-1.5">Always application/json</td>
                            <td className="py-1.5"><code>application/json</code></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h2>Handling Events</h2>
            <p>
                Your webhook handler should follow these steps:
            </p>

            <ol>
                <li><strong>Verify the webhook signature</strong> using your webhook secret (see <Link href="/docs/webhooks/security" className="text-primary hover:underline">Security</Link>)</li>
                <li><strong>Check the timestamp</strong> to prevent replay attacks (reject if older than 5 minutes)</li>
                <li><strong>Check delivery ID</strong> for idempotency (prevent duplicate processing)</li>
                <li><strong>Parse the event type</strong> from <code>X-Zito-Event</code> header or <code>event</code> field</li>
                <li><strong>Process the event data</strong> based on type</li>
                <li><strong>Return HTTP 200</strong> within 30 seconds (process asynchronously if needed)</li>
                <li><strong>Handle errors gracefully</strong> - don&apos;t let processing errors crash your server</li>
            </ol>

            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4 my-6">
                <div className="flex items-start gap-3">
                    <span className="text-red-700 dark:text-red-400 text-lg mt-0.5">⚠️</span>
                    <div className="flex-1 text-sm text-red-900 dark:text-red-100">
                        <p className="font-semibold mb-2">Critical: Always Verify Signature First</p>
                        <p className="leading-relaxed">
                            Never process a webhook without verifying the signature first. This ensures the request is from ZitoPay and hasn&apos;t been tampered with.
                        </p>
                    </div>
                </div>
            </div>

            <h2>Event Processing Example</h2>
            <p>
                Here&apos;s a simple example of processing webhook events:
            </p>

            <CodeBlock
                code={`app.post('/webhooks/zitopay', async (req, res) => {
  // 1. Verify signature (see Security page)
  if (!verifySignature(req)) {
    return res.status(401).send('Invalid signature');
  }

  const { event, data } = req.body;

  // 2. Process based on event type
  switch (event) {
    case 'payment.succeeded':
      await handlePaymentSuccess(data);
      break;
    case 'payment.failed':
      await handlePaymentFailure(data);
      break;
    case 'payout.completed':
      await handlePayoutSuccess(data);
      break;
    case 'payout.failed':
      await handlePayoutFailure(data);
      break;
    case 'refund.completed':
      await handleRefundCompleted(data);
      break;
    case 'settlement.generated':
      await handleSettlementGenerated(data);
      break;
    default:
      console.log('Unknown event:', event);
  }

  // 3. Respond quickly
  res.status(200).send('OK');
});

async function handlePaymentSuccess(data) {
  // Update order status in database
  await db.orders.update({
    where: { transactionId: data.transaction_id },
    data: { status: 'paid' }
  });
  
  // Send confirmation email
  await sendEmail(data.customer_msisdn, 'Payment confirmed');
}`}
                language="javascript"
            />

            <h2>Idempotency</h2>
            <p>
                Webhooks may be delivered more than once. Always make your handlers idempotent by checking if you&apos;ve already processed the event:
            </p>

            <CodeBlock
                code={`async function handlePaymentSuccess(data) {
  // Check if already processed
  const existing = await db.webhookLogs.findUnique({
    where: { transactionId: data.transaction_id }
  });
  
  if (existing) {
    console.log('Already processed:', data.transaction_id);
    return; // Skip duplicate
  }
  
  // Process the event
  await db.orders.update({
    where: { transactionId: data.transaction_id },
    data: { status: 'paid' }
  });
  
  // Log the webhook
  await db.webhookLogs.create({
    data: { transactionId: data.transaction_id }
  });
}`}
                language="javascript"
            />

            <h2>Next Steps</h2>
            <ul>
                <li>Learn how to <Link href="/docs/webhooks/register" className="text-primary hover:underline">Register a Webhook Endpoint</Link></li>
                <li>Understand <Link href="/docs/webhooks/security" className="text-primary hover:underline">Webhook Security</Link> and signature verification</li>
                <li>View <Link href="/docs/webhooks/overview" className="text-primary hover:underline">Webhooks Overview</Link> for general information</li>
            </ul>
        </div>
    );
}
