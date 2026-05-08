"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/docs/CodeBlock";

export default function WebhookSecurityPage() {
    return (
        <div>
            <h1>Webhook Security</h1>
            <p>
                Webhook security is critical to ensure that requests are actually from ZitoPay and haven&apos;t been tampered with. This page explains how to verify webhook signatures using HMAC-SHA256.
            </p>

            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4 my-6">
                <div className="flex items-start gap-3">
                    <span className="text-red-700 dark:text-red-400 text-lg mt-0.5">🔒</span>
                    <div className="flex-1 text-sm text-red-900 dark:text-red-100">
                        <p className="leading-relaxed">
                            <strong>Critical:</strong> Always verify webhook signatures before processing any webhook payload. Never trust webhook data without signature verification, as it could be a malicious request attempting to manipulate your system.
                        </p>
                    </div>
                </div>
            </div>

            <h2>How Signature Verification Works</h2>
            <p>
                ZitoPay uses HMAC-SHA256 to sign webhook payloads. The signature is sent in the <code>X-Zito-Signature</code> header, and you verify it by recreating the signature using your webhook secret.
            </p>

            <ol>
                <li>ZitoPay creates a signature using HMAC-SHA256 with your webhook secret</li>
                <li>The signature is sent in the <code>X-Zito-Signature</code> header</li>
                <li>You recreate the signature using your stored secret</li>
                <li>Compare the signatures - if they match, the webhook is authentic</li>
            </ol>

            <h2>Headers Sent by ZitoPay</h2>
            <p>
                Every webhook request includes these headers:
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

            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4 my-6">
                <div className="flex items-start gap-3">
                    <span className="text-red-700 dark:text-red-400 text-lg mt-0.5">⚠️</span>
                    <div className="flex-1 text-sm text-red-900 dark:text-red-100">
                        <p className="font-semibold mb-2">Critical: Signature Format</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li><strong>NO prefix:</strong> The signature header contains ONLY the hexadecimal hash (no <code>sha256=</code> prefix)</li>
                            <li><strong>Timestamp in milliseconds:</strong> The timestamp is in milliseconds, not seconds</li>
                            <li><strong>Raw body required:</strong> You must use the raw request body (before JSON parsing) for signature verification</li>
                        </ul>
                    </div>
                </div>
            </div>

            <h2>Verification Steps</h2>

            <h3>Step 1: Extract Headers</h3>
            <CodeBlock
                code={`const signature = req.headers['x-zito-signature'];
const timestamp = req.headers['x-zito-timestamp'];

if (!signature || !timestamp) {
  return res.status(400).send('Missing signature headers');
}`}
                language="javascript"
            />

            <h3>Step 2: Check Timestamp (Prevent Replay Attacks)</h3>
            <p>
                Verify that the request is recent (within 5 minutes) to prevent replay attacks. <strong>Important:</strong> The timestamp is in milliseconds, not seconds.
            </p>

            <CodeBlock
                code={`const timestamp = parseInt(req.headers['x-zito-timestamp']);
const now = Date.now(); // Current time in milliseconds
const age = Math.abs(now - timestamp);

// Reject if older than 5 minutes (300,000 milliseconds)
if (age > 5 * 60 * 1000) {
  return res.status(400).send('Request too old');
}`}
                language="javascript"
            />

            <h3>Step 3: Get Raw Request Body</h3>
            <p>
                <strong>Critical:</strong> You must use the raw request body (as string, before JSON parsing) for signature verification. The body must be exactly as received from ZitoPay.
            </p>

            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4 my-4">
                <div className="flex items-start gap-3">
                    <span className="text-red-700 dark:text-red-400 text-lg mt-0.5">⚠️</span>
                    <div className="flex-1 text-sm text-red-900 dark:text-red-100">
                        <p className="leading-relaxed">
                            <strong>Common Mistake:</strong> Using <code>JSON.stringify(req.body)</code> will fail because the JSON formatting may differ. You must capture the raw body before any parsing occurs.
                        </p>
                    </div>
                </div>
            </div>

            <h3>Step 4: Compute Expected Signature</h3>
            <p>
                The signature is computed as: <code>HMAC-SHA256(secret, timestamp + "." + payload)</code>
            </p>

            <CodeBlock
                code={`const crypto = require('crypto');

// Get raw body (must be captured before JSON parsing)
const payload = req.body.toString(); // Raw body as string
const timestamp = req.headers['x-zito-timestamp']; // Already a string

// Construct string to sign: timestamp + "." + payload
const stringToSign = \`\${timestamp}.\${payload}\`;

// Compute expected signature
const expectedSignature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(stringToSign)
  .digest('hex');`}
                language="javascript"
            />

            <h3>Step 5: Compare Signatures (Timing-Safe)</h3>
            <p>
                Use timing-safe comparison to prevent timing attacks. <strong>Important:</strong> The signature header contains only the hex string (no prefix).
            </p>

            <CodeBlock
                code={`const signature = req.headers['x-zito-signature']; // Just hex, no prefix

// Constant-time comparison
const isValid = crypto.timingSafeEqual(
  Buffer.from(expectedSignature),
  Buffer.from(signature)
);

if (!isValid) {
  return res.status(401).send('Invalid signature');
}`}
                language="javascript"
            />

            <h2>Complete Example (Node.js/Express)</h2>
            <p>
                Here&apos;s a complete webhook handler with signature verification, idempotency, and proper error handling:
            </p>

            <CodeBlock
                code={`const express = require('express');
const crypto = require('crypto');
const app = express();

// Your webhook secret (from ZitoPay dashboard)
const WEBHOOK_SECRET = process.env.ZITOPAY_WEBHOOK_SECRET;

// Middleware to capture raw body for signature verification
// IMPORTANT: Must capture raw body BEFORE JSON parsing
app.use('/webhooks/zitopay', express.raw({ type: 'application/json' }));

// Track processed deliveries (use Redis or database in production)
const processedDeliveries = new Set();

function verifyWebhookSignature(req, secret) {
  const signature = req.headers['x-zito-signature'];
  const timestamp = req.headers['x-zito-timestamp'];
  const payload = req.body.toString(); // Raw body as string
  
  // Validate timestamp (prevent replay attacks)
  const now = Date.now(); // Milliseconds
  const age = Math.abs(now - parseInt(timestamp));
  if (age > 5 * 60 * 1000) { // 5 minutes
    return false;
  }
  
  // Compute expected signature
  const stringToSign = \`\${timestamp}.\${payload}\`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(stringToSign)
    .digest('hex');
  
  // Constant-time comparison
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

app.post('/webhooks/zitopay', async (req, res) => {
  try {
    // Verify signature
    if (!verifyWebhookSignature(req, WEBHOOK_SECRET)) {
      console.error('Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    // Parse JSON payload
    const payload = JSON.parse(req.body.toString());
    const deliveryId = req.headers['x-zito-delivery-id'];
    const event = req.headers['x-zito-event'];
    
    // Check idempotency
    if (processedDeliveries.has(deliveryId)) {
      console.log('Webhook already processed:', deliveryId);
      return res.status(200).json({ message: 'Already processed' });
    }
    
    // Log webhook
    console.log('Webhook received:', {
      deliveryId,
      event,
      timestamp: new Date().toISOString()
    });
    
    // Process event asynchronously
    processWebhookEvent(payload, event).catch(err => {
      console.error('Error processing webhook:', err);
    });
    
    // Mark as processed
    processedDeliveries.add(deliveryId);
    
    // Respond immediately (within 30 seconds)
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Processing error' });
  }
});

async function processWebhookEvent(payload, event) {
  switch (event) {
    case 'payment.succeeded':
      await handlePaymentSucceeded(payload.data);
      break;
    case 'payment.failed':
      await handlePaymentFailed(payload.data);
      break;
    case 'payout.completed':
      await handlePayoutCompleted(payload.data);
      break;
    case 'payout.failed':
      await handlePayoutFailed(payload.data);
      break;
    case 'refund.completed':
      await handleRefundCompleted(payload.data);
      break;
    case 'settlement.generated':
      await handleSettlementGenerated(payload.data);
      break;
    default:
      console.warn('Unknown event type:', event);
  }
}

async function handlePaymentSucceeded(data) {
  console.log('Payment succeeded:', data.transaction_id);
  // Update your database, send notification, etc.
}

app.listen(3000, () => {
  console.log('Webhook server listening on port 3000');
});`}
                language="javascript"
            />

            <h2>Python Example</h2>
            <CodeBlock
                code={`from flask import Flask, request, jsonify
import hmac
import hashlib
import time
import json
import os

app = Flask(__name__)

# Your webhook secret (from ZitoPay dashboard)
WEBHOOK_SECRET = os.environ.get('ZITOPAY_WEBHOOK_SECRET')

# Track processed deliveries (use Redis in production)
processed_deliveries = set()

def verify_webhook_signature(request, secret):
    """Verify webhook signature"""
    signature = request.headers.get('X-Zito-Signature')
    timestamp = request.headers.get('X-Zito-Timestamp')
    payload = request.get_data(as_text=True)  # Raw body as string
    
    # Validate timestamp (prevent replay attacks)
    now = int(time.time() * 1000)  # Milliseconds
    age = abs(now - int(timestamp))
    if age > 5 * 60 * 1000:  # 5 minutes
        return False
    
    # Compute expected signature
    string_to_sign = f"{timestamp}.{payload}"
    expected_signature = hmac.new(
        secret.encode('utf-8'),
        string_to_sign.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    # Constant-time comparison
    return hmac.compare_digest(signature, expected_signature)

@app.route('/webhooks/zitopay', methods=['POST'])
def webhook_handler():
    try:
        # Verify signature
        if not verify_webhook_signature(request, WEBHOOK_SECRET):
            return jsonify({'error': 'Invalid signature'}), 401
        
        # Parse payload
        payload = request.get_json()
        delivery_id = request.headers.get('X-Zito-Delivery-Id')
        event = request.headers.get('X-Zito-Event')
        
        # Check idempotency
        if delivery_id in processed_deliveries:
            return jsonify({'message': 'Already processed'}), 200
        
        # Log webhook
        print(f'Webhook received: {delivery_id}, Event: {event}')
        
        # Process event asynchronously (use background task queue in production)
        process_webhook_event(payload, event)
        
        # Mark as processed
        processed_deliveries.add(delivery_id)
        
        # Respond immediately
        return jsonify({'received': True}), 200
    except Exception as e:
        print(f'Webhook error: {e}')
        return jsonify({'error': 'Processing error'}), 500

def process_webhook_event(payload, event):
    """Process webhook event"""
    data = payload.get('data', {})
    
    if event == 'payment.succeeded':
        handle_payment_succeeded(data)
    elif event == 'payment.failed':
        handle_payment_failed(data)
    # ... handle other events

def handle_payment_succeeded(data):
    print(f'Payment succeeded: {data.get("transaction_id")}')
    # Update your database, send notification, etc.

if __name__ == '__main__':
    app.run(port=3000)`}
                language="python"
            />

            <h2>PHP Example</h2>
            <CodeBlock
                code={`<?php

// Your webhook secret (from ZitoPay dashboard)
define('WEBHOOK_SECRET', getenv('ZITOPAY_WEBHOOK_SECRET'));

// Track processed deliveries (use Redis or database in production)
$processedDeliveries = [];

function verifyWebhookSignature($headers, $payload, $secret) {
    $signature = $headers['X-Zito-Signature'] ?? '';
    $timestamp = $headers['X-Zito-Timestamp'] ?? '';
    
    // Validate timestamp (prevent replay attacks)
    $now = round(microtime(true) * 1000); // Milliseconds
    $age = abs($now - (int)$timestamp);
    if ($age > 5 * 60 * 1000) { // 5 minutes
        return false;
    }
    
    // Compute expected signature
    $stringToSign = $timestamp . '.' . $payload;
    $expectedSignature = hash_hmac('sha256', $stringToSign, $secret);
    
    // Constant-time comparison
    return hash_equals($expectedSignature, $signature);
}

// Get raw request body
$payload = file_get_contents('php://input');
$headers = getallheaders();
$deliveryId = $headers['X-Zito-Delivery-Id'] ?? '';
$event = $headers['X-Zito-Event'] ?? '';

// Verify signature
if (!verifyWebhookSignature($headers, $payload, WEBHOOK_SECRET)) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid signature']);
    exit;
}

// Check idempotency
if (in_array($deliveryId, $processedDeliveries)) {
    http_response_code(200);
    echo json_encode(['message' => 'Already processed']);
    exit;
}

// Parse JSON payload
$data = json_decode($payload, true);

// Log webhook
error_log("Webhook received: $deliveryId, Event: $event");

// Process event
processWebhookEvent($data, $event);

// Mark as processed
$processedDeliveries[] = $deliveryId;

// Respond
http_response_code(200);
echo json_encode(['received' => true]);

function processWebhookEvent($payload, $event) {
    $data = $payload['data'] ?? [];
    
    switch ($event) {
        case 'payment.succeeded':
            handlePaymentSucceeded($data);
            break;
        case 'payment.failed':
            handlePaymentFailed($data);
            break;
        // ... handle other events
    }
}

function handlePaymentSucceeded($data) {
    error_log('Payment succeeded: ' . $data['transaction_id']);
    // Update your database, send notification, etc.
}
?>`}
                language="php"
            />

            <h2>Common Mistakes and How to Fix Them</h2>

            <h3>1. Not Verifying Signatures</h3>
            <p>
                <strong>Never skip signature verification.</strong> Always verify the signature before processing webhook data. This is the most critical security step.
            </p>

            <CodeBlock
                code={`// ❌ WRONG - No signature verification
app.post('/webhooks/zitopay', (req, res) => {
  const event = req.body.event;
  processEvent(event); // DANGEROUS!
  res.sendStatus(200);
});

// ✅ CORRECT - Verify signature first
app.post('/webhooks/zitopay', (req, res) => {
  if (!verifySignature(req, WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }
  const event = req.body.event;
  processEvent(event);
  res.sendStatus(200);
});`}
                language="javascript"
            />

            <h3>2. Using Parsed Body Instead of Raw Body</h3>
            <p>
                <strong>Critical mistake:</strong> Using <code>JSON.stringify(req.body)</code> will fail because the JSON formatting may differ. You must use the raw request body.
            </p>

            <CodeBlock
                code={`// ❌ WRONG - Using parsed body
const payload = JSON.stringify(req.body);
const stringToSign = \`\${timestamp}.\${payload}\`;

// ✅ CORRECT - Using raw body
app.use('/webhooks/zitopay', express.raw({ type: 'application/json' }));
const payload = req.body.toString(); // Raw body as string
const stringToSign = \`\${timestamp}.\${payload}\`;`}
                language="javascript"
            />

            <h3>3. Using String Comparison Instead of Timing-Safe</h3>
            <p>
                <strong>Don&apos;t use regular string comparison.</strong> Use timing-safe comparison functions to prevent timing attacks:
            </p>

            <CodeBlock
                code={`// ❌ WRONG - Vulnerable to timing attacks
if (expectedSignature === receivedSignature) { ... }

// ✅ CORRECT - Timing-safe comparison
if (crypto.timingSafeEqual(
  Buffer.from(expectedSignature),
  Buffer.from(receivedSignature)
)) { ... }`}
                language="javascript"
            />

            <h3>4. Wrong Timestamp Format</h3>
            <p>
                <strong>Critical:</strong> The timestamp is in milliseconds, not seconds. Using seconds will cause signature verification to fail.
            </p>

            <CodeBlock
                code={`// ❌ WRONG - Using seconds
const currentTime = Math.floor(Date.now() / 1000);
const requestTime = parseInt(timestamp);

// ✅ CORRECT - Using milliseconds
const now = Date.now(); // Milliseconds
const requestTime = parseInt(timestamp); // Already in milliseconds`}
                language="javascript"
            />

            <h3>5. Adding Prefix to Signature</h3>
            <p>
                <strong>Critical:</strong> The signature header contains only the hex string. Do NOT add or expect a <code>sha256=</code> prefix.
            </p>

            <CodeBlock
                code={`// ❌ WRONG - Removing non-existent prefix
const receivedSignature = signature.replace('sha256=', '');

// ✅ CORRECT - Signature is already just hex
const signature = req.headers['x-zito-signature']; // Just hex, no prefix`}
                language="javascript"
            />

            <h3>6. Not Implementing Idempotency</h3>
            <p>
                <strong>Webhooks may be delivered multiple times.</strong> Use <code>X-Zito-Delivery-Id</code> to prevent duplicate processing.
            </p>

            <CodeBlock
                code={`// ❌ WRONG - No idempotency check
app.post('/webhooks/zitopay', (req, res) => {
  processEvent(req.body); // May process same event multiple times
  res.sendStatus(200);
});

// ✅ CORRECT - Check delivery ID
const deliveryId = req.headers['x-zito-delivery-id'];
if (processedDeliveries.has(deliveryId)) {
  return res.status(200).send({ message: 'Already processed' });
}
processedDeliveries.add(deliveryId);
processEvent(req.body);
res.sendStatus(200);`}
                language="javascript"
            />

            <h3>7. Storing Secret in Code</h3>
            <p>
                <strong>Never commit secrets to code.</strong> Store your webhook secret in environment variables or a secret management system.
            </p>

            <h2>Security Best Practices</h2>
            <ul>
                <li><strong>Always verify signatures:</strong> Never process webhooks without verification - this is critical</li>
                <li><strong>Use raw body for signature:</strong> Capture the raw request body before JSON parsing</li>
                <li><strong>Use timing-safe comparison:</strong> Prevent timing attacks with constant-time comparison</li>
                <li><strong>Check timestamps:</strong> Reject requests older than 5 minutes (replay attack prevention)</li>
                <li><strong>Implement idempotency:</strong> Use X-Zito-Delivery-Id to prevent duplicate processing</li>
                <li><strong>Store secrets securely:</strong> Use environment variables or secret management - never in code</li>
                <li><strong>Use HTTPS:</strong> Always use HTTPS for webhook endpoints in production</li>
                <li><strong>Respond quickly:</strong> Return 200 OK within 30 seconds, process events asynchronously</li>
                <li><strong>Log everything:</strong> Log all webhook deliveries for debugging and auditing</li>
                <li><strong>Handle errors gracefully:</strong> Don&apos;t let processing errors crash your server</li>
            </ul>

            <h2>Troubleshooting</h2>

            <h3>Issue: "Invalid signature" errors</h3>
            <p>
                <strong>Problem:</strong> Signature verification fails even with correct secret
            </p>
            <p>
                <strong>Solutions:</strong>
            </p>
            <ul>
                <li>Ensure you&apos;re using the raw request body (before JSON parsing)</li>
                <li>Verify timestamp is in milliseconds (not seconds)</li>
                <li>Check that you&apos;re concatenating <code>timestamp + "." + payload</code> correctly</li>
                <li>Ensure signature header contains only hex (no <code>sha256=</code> prefix)</li>
                <li>Verify you&apos;re using the correct webhook secret</li>
            </ul>

            <h3>Issue: Webhooks not being received</h3>
            <p>
                <strong>Problem:</strong> No webhooks are reaching your endpoint
            </p>
            <p>
                <strong>Solutions:</strong>
            </p>
            <ul>
                <li>Verify your endpoint is publicly accessible (test with curl/Postman)</li>
                <li>Ensure your endpoint uses HTTPS (HTTP is not allowed in production)</li>
                <li>Check firewall/security group settings</li>
                <li>Verify the endpoint URL is correct in ZitoPay dashboard</li>
                <li>Check that the endpoint is enabled</li>
            </ul>

            <h3>Issue: Duplicate webhook deliveries</h3>
            <p>
                <strong>Problem:</strong> Same webhook is processed multiple times
            </p>
            <p>
                <strong>Solutions:</strong>
            </p>
            <ul>
                <li>Implement idempotency using <code>X-Zito-Delivery-Id</code> header</li>
                <li>Store processed delivery IDs in a database or Redis</li>
                <li>Check for duplicates before processing</li>
            </ul>

            <h3>Issue: Timeout errors</h3>
            <p>
                <strong>Problem:</strong> Webhook requests timeout
            </p>
            <p>
                <strong>Solutions:</strong>
            </p>
            <ul>
                <li>Respond to webhooks within 30 seconds</li>
                <li>Process events asynchronously (don&apos;t block the response)</li>
                <li>Use background job queues for heavy processing</li>
            </ul>

            <h2>Testing Signature Verification</h2>
            <p>
                You can test your signature verification with this example:
            </p>

            <CodeBlock
                code={`// Test signature generation
const crypto = require('crypto');
const secret = 'whsec_test123';
const timestamp = '1768763180';
const payload = JSON.stringify({
  event: 'payment.succeeded',
  data: { transaction_id: 'test-123' }
});

const signedPayload = \`\${timestamp}.\${payload}\`;
const signature = crypto
  .createHmac('sha256', secret)
  .update(signedPayload)
  .digest('hex');

console.log('X-Zito-Signature: sha256=' + signature);
console.log('X-Zito-Timestamp: ' + timestamp);`}
                language="javascript"
            />

            <h2>Idempotency Implementation</h2>
            <p>
                Webhooks may be delivered multiple times. Always implement idempotency using the <code>X-Zito-Delivery-Id</code> header to prevent duplicate processing:
            </p>

            <CodeBlock
                code={`// Track processed deliveries (use Redis or database in production)
const processedDeliveries = new Set();

app.post('/webhooks/zitopay', async (req, res) => {
  // Verify signature first
  if (!verifySignature(req, WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }
  
  const deliveryId = req.headers['x-zito-delivery-id'];
  
  // Check if already processed
  if (processedDeliveries.has(deliveryId)) {
    console.log('Webhook already processed:', deliveryId);
    return res.status(200).json({ message: 'Already processed' });
  }
  
  // Process event
  await processEvent(req.body);
  
  // Mark as processed
  processedDeliveries.add(deliveryId);
  
  res.status(200).json({ received: true });
});`}
                language="javascript"
            />

            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 my-6">
                <div className="flex items-start gap-3">
                    <span className="text-blue-700 dark:text-blue-400 text-lg mt-0.5">💡</span>
                    <div className="flex-1 text-sm text-blue-900 dark:text-blue-100">
                        <p className="leading-relaxed">
                            <strong>Production Tip:</strong> In production, use Redis or a database to track processed delivery IDs instead of an in-memory Set. This ensures idempotency works across server restarts and multiple server instances.
                        </p>
                    </div>
                </div>
            </div>

            <h2>Response Time Requirements</h2>
            <p>
                Your endpoint must respond with HTTP 200 within <strong>30 seconds</strong>. If you need more time to process the event, respond immediately and process asynchronously:
            </p>

            <CodeBlock
                code={`// ✅ CORRECT - Respond immediately, process async
app.post('/webhooks/zitopay', (req, res) => {
  // Verify signature
  if (!verifySignature(req, WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }
  
  // Respond immediately
  res.sendStatus(200);
  
  // Process event asynchronously
  processEventAsync(req.body).catch(err => {
    console.error('Error processing webhook:', err);
  });
});`}
                language="javascript"
            />

            <h2>Monitoring Webhook Activity</h2>
            <p>
                After implementing webhook signature verification, you should monitor webhook activity to ensure everything is working correctly:
            </p>

            <h3>What to Monitor</h3>
            <ul>
                <li><strong>Webhook Receipts:</strong> All incoming webhooks should be logged</li>
                <li><strong>Signature Verification:</strong> Track invalid signature attempts (security concern)</li>
                <li><strong>Processing Status:</strong> Monitor success vs error rates</li>
                <li><strong>Duplicate Deliveries:</strong> Track how often duplicate webhooks are received</li>
                <li><strong>Response Times:</strong> Ensure responses are within 30 seconds</li>
            </ul>

            <h3>Status Indicators</h3>
            <p>
                Your webhook handler should track and display these statuses:
            </p>

            <div className="bg-muted/50 border border-border rounded-lg p-3 my-4">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="text-left py-1.5 pr-4 font-medium">Status</th>
                            <th className="text-left py-1.5 font-medium">Description</th>
                            <th className="text-left py-1.5 font-medium">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="py-1.5 pr-4"><span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs font-medium">SUCCESS</span></td>
                            <td className="py-1.5">Webhook processed successfully</td>
                            <td className="py-1.5">No action needed</td>
                        </tr>
                        <tr>
                            <td className="py-1.5 pr-4"><span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-xs font-medium">ERROR</span></td>
                            <td className="py-1.5">Error during processing</td>
                            <td className="py-1.5">Check error logs, fix issue</td>
                        </tr>
                        <tr>
                            <td className="py-1.5 pr-4"><span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded text-xs font-medium">INVALID_SIGNATURE</span></td>
                            <td className="py-1.5">Signature verification failed</td>
                            <td className="py-1.5">Check webhook secret, verify implementation</td>
                        </tr>
                        <tr>
                            <td className="py-1.5 pr-4"><span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded text-xs font-medium">DUPLICATE</span></td>
                            <td className="py-1.5">Already processed (idempotency)</td>
                            <td className="py-1.5">No action needed (expected behavior)</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h3>Logging Best Practices</h3>
            <ul>
                <li><strong>Log all webhook receipts:</strong> Include delivery ID, event type, timestamp</li>
                <li><strong>Log verification failures:</strong> Track invalid signatures for security monitoring</li>
                <li><strong>Log processing errors:</strong> Include full error context for debugging</li>
                <li><strong>Store payloads:</strong> Keep payload data for troubleshooting (sanitize sensitive data)</li>
                <li><strong>Set up alerts:</strong> Alert on high error rates or security issues</li>
            </ul>

            <h2>Production Considerations</h2>
            <p>
                When deploying webhooks to production, consider these important factors:
            </p>

            <h3>Storage</h3>
            <ul>
                <li><strong>Idempotency:</strong> Use Redis or database for delivery ID tracking (not in-memory)</li>
                <li><strong>Webhook Logs:</strong> Store logs in database or logging service (not in-memory)</li>
                <li><strong>Persistence:</strong> Ensure data survives server restarts</li>
            </ul>

            <h3>Performance</h3>
            <ul>
                <li><strong>Async Processing:</strong> Always process events asynchronously</li>
                <li><strong>Background Jobs:</strong> Use job queues (Bull, BullMQ) for heavy processing</li>
                <li><strong>Response Time:</strong> Respond within 30 seconds, don&apos;t block on processing</li>
            </ul>

            <h3>Reliability</h3>
            <ul>
                <li><strong>Error Handling:</strong> Implement retry mechanisms for failed processing</li>
                <li><strong>Monitoring:</strong> Set up error tracking (Sentry, etc.)</li>
                <li><strong>Alerts:</strong> Monitor webhook delivery success rates</li>
                <li><strong>Database Integration:</strong> Update transaction/refund status in database</li>
            </ul>

            <h3>Security</h3>
            <ul>
                <li><strong>Secret Management:</strong> Use secure secret storage (AWS Secrets Manager, etc.)</li>
                <li><strong>Access Control:</strong> Restrict access to webhook endpoint logs</li>
                <li><strong>Rate Limiting:</strong> Implement rate limiting to prevent abuse</li>
                <li><strong>Audit Logging:</strong> Log all webhook activity for compliance</li>
            </ul>

            <h2>Next Steps</h2>
            <ul>
                <li>Learn how to <Link href="/docs/webhooks/register" className="text-primary hover:underline">Register a Webhook Endpoint</Link></li>
                <li>See all available <Link href="/docs/webhooks/events" className="text-primary hover:underline">Webhook Events</Link></li>
                <li>View <Link href="/docs/webhooks/overview" className="text-primary hover:underline">Webhooks Overview</Link> for general information</li>
            </ul>
        </div>
    );
}
