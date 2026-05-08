"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/docs/CodeBlock";

export default function ExecuteDisbursementPage() {
    return (
        <div>
            <h1>Execute Disbursement</h1>
            <p>
                After creating a quote, use this endpoint to process the actual payout to the recipient.
            </p>

            <h2>Endpoint</h2>
            <CodeBlock
                code={`POST /api/v1/disbursements/execute`}
                language="http"
            />

            <h2>Request Body</h2>
            <CodeBlock
                code={`{
  "quote_id": "quote-uuid",
  "idempotency_key": "unique-payout-123",
  "recipient": {
    "msisdn": "+237612345678"
  }
}`}
                language="json"
            />

            <h3>Request Parameters</h3>
            <table>
                <thead>
                    <tr>
                        <th>Parameter</th>
                        <th>Type</th>
                        <th>Required</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><code>quote_id</code></td>
                        <td>string</td>
                        <td>Yes</td>
                        <td>Quote ID from the create quote response</td>
                    </tr>
                    <tr>
                        <td><code>idempotency_key</code></td>
                        <td>string</td>
                        <td>Yes</td>
                        <td>Unique identifier to prevent duplicate payouts</td>
                    </tr>
                    <tr>
                        <td><code>recipient</code></td>
                        <td>object</td>
                        <td>Yes</td>
                        <td>Recipient information</td>
                    </tr>
                    <tr>
                        <td><code>recipient.msisdn</code></td>
                        <td>string</td>
                        <td>Yes</td>
                        <td>Recipient phone number in E.164 format</td>
                    </tr>
                </tbody>
            </table>

            <h2>Response</h2>
            <CodeBlock
                code={`{
  "payout_id": "payout-uuid",
  "status": "PROCESSING",
  "gateway_reference": "MTN_REF_123456789",
  "correlation_id": "corr-uuid"
}`}
                language="json"
            />

            <h3>Response Fields</h3>
            <table>
                <thead>
                    <tr>
                        <th>Field</th>
                        <th>Type</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><code>payout_id</code></td>
                        <td>string</td>
                        <td>Unique identifier for the payout (use this to check status)</td>
                    </tr>
                    <tr>
                        <td><code>status</code></td>
                        <td>string</td>
                        <td>Current payout status (PENDING, PROCESSING, SUCCESS, FAILED, CANCELLED)</td>
                    </tr>
                    <tr>
                        <td><code>gateway_reference</code></td>
                        <td>string</td>
                        <td>Reference from the mobile money provider</td>
                    </tr>
                    <tr>
                        <td><code>correlation_id</code></td>
                        <td>string</td>
                        <td>Correlation ID for tracking the transaction</td>
                    </tr>
                </tbody>
            </table>

            <h2>Example Request</h2>
            <CodeBlock
                code={`const response = await fetch('https://api.zitopay.com/api/v1/disbursements/execute', {
  method: 'POST',
  headers: {
    'x-zito-key': apiKey,
    'x-zito-timestamp': timestamp,
    'x-zito-nonce': nonce,
    'x-zito-origin': origin,
    'x-zito-signature': signature,
    'x-zito-version': '1.0',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    quote_id: 'quote-uuid-from-previous-step',
    idempotency_key: 'unique-payout-123',
    recipient: {
      msisdn: '+237612345678'
    }
  })
});

const payout = await response.json();
console.log('Payout ID:', payout.payout_id);
console.log('Status:', payout.status);`}
                language="javascript"
            />

            <h2>Idempotency</h2>
            <p>
                The <code>idempotency_key</code> ensures that if you retry a request with the same key, the payout won&apos;t be processed twice. Use a unique identifier for each payout (e.g., UUID, timestamp + merchant reference).
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 my-6">
                <div className="flex items-start gap-3">
                    <span className="text-blue-700 dark:text-blue-400 text-lg mt-0.5">ℹ️</span>
                    <div className="flex-1 text-sm text-blue-900 dark:text-blue-100">
                        <p className="leading-relaxed">
                            <strong>Important:</strong> Payouts are processed asynchronously. The initial response may show a status of &quot;PROCESSING&quot;. Use the payout ID to check the status later, or set up webhooks to receive notifications when the payout completes.
                        </p>
                    </div>
                </div>
            </div>

            <h2>Next Steps</h2>
            <p>
                After executing a disbursement, you can:
            </p>
            <ul>
                <li>Check the payout status using <Link href="/docs/disbursements/get-status">Get Status</Link></li>
                <li>View all payouts using <Link href="/docs/disbursements/list-payouts">List Payouts</Link></li>
                <li>Set up webhooks to receive real-time notifications</li>
            </ul>
        </div>
    );
}
