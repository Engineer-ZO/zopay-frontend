"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/docs/CodeBlock";

export default function GetDisbursementStatusPage() {
    return (
        <div>
            <h1>Get Payout Status</h1>
            <p>
                Check the status of a disbursement to see if it has been completed, failed, or is still processing.
            </p>

            <h2>Endpoint</h2>
            <CodeBlock
                code={`GET /api/v1/disbursements/:id`}
                language="http"
            />

            <h2>Path Parameters</h2>
            <table>
                <thead>
                    <tr>
                        <th>Parameter</th>
                        <th>Type</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><code>id</code></td>
                        <td>string</td>
                        <td>Payout ID from the execute disbursement response</td>
                    </tr>
                </tbody>
            </table>

            <h2>Response</h2>
            <CodeBlock
                code={`{
  "payout": {
    "id": "payout-uuid",
    "merchantId": "merchant-uuid",
    "gateway": "MTN_MOMO",
    "amount": "5000.00",
    "currency": "XAF",
    "status": "SUCCESS",
    "recipient": {
      "msisdn": "+237612345678"
    },
    "gatewayReference": "MTN_REF_123456789",
    "gatewayFee": "50.00",
    "platformFee": "100.00",
    "totalAmount": "5150.00",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "completedAt": "2024-01-15T10:01:00.000Z",
    "error": null
  }
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
                        <td><code>payout.id</code></td>
                        <td>string</td>
                        <td>Unique identifier for the payout</td>
                    </tr>
                    <tr>
                        <td><code>payout.merchantId</code></td>
                        <td>string</td>
                        <td>Your merchant ID</td>
                    </tr>
                    <tr>
                        <td><code>payout.gateway</code></td>
                        <td>string</td>
                        <td>Payment gateway used (MTN_MOMO, ORANGE_MONEY)</td>
                    </tr>
                    <tr>
                        <td><code>payout.amount</code></td>
                        <td>string</td>
                        <td>Payout amount</td>
                    </tr>
                    <tr>
                        <td><code>payout.currency</code></td>
                        <td>string</td>
                        <td>Currency code</td>
                    </tr>
                    <tr>
                        <td><code>payout.status</code></td>
                        <td>string</td>
                        <td>Current status (PENDING, PROCESSING, SUCCESS, FAILED, CANCELLED)</td>
                    </tr>
                    <tr>
                        <td><code>payout.recipient.msisdn</code></td>
                        <td>string</td>
                        <td>Recipient phone number</td>
                    </tr>
                    <tr>
                        <td><code>payout.gatewayReference</code></td>
                        <td>string</td>
                        <td>Reference from the mobile money provider</td>
                    </tr>
                    <tr>
                        <td><code>payout.gatewayFee</code></td>
                        <td>string</td>
                        <td>Fee charged by the gateway</td>
                    </tr>
                    <tr>
                        <td><code>payout.platformFee</code></td>
                        <td>string</td>
                        <td>ZitoPay platform fee</td>
                    </tr>
                    <tr>
                        <td><code>payout.totalAmount</code></td>
                        <td>string</td>
                        <td>Total amount paid (amount + fees)</td>
                    </tr>
                    <tr>
                        <td><code>payout.createdAt</code></td>
                        <td>string</td>
                        <td>Payout creation timestamp</td>
                    </tr>
                    <tr>
                        <td><code>payout.completedAt</code></td>
                        <td>string</td>
                        <td>Payout completion timestamp (null if still processing)</td>
                    </tr>
                    <tr>
                        <td><code>payout.error</code></td>
                        <td>object | null</td>
                        <td>Error details if payout failed</td>
                    </tr>
                </tbody>
            </table>

            <h2>Status Values</h2>
            <ul>
                <li><strong>PENDING:</strong> Payout initiated, awaiting processing</li>
                <li><strong>PROCESSING:</strong> Payout is being processed by the gateway</li>
                <li><strong>SUCCESS:</strong> Payout completed successfully</li>
                <li><strong>FAILED:</strong> Payout failed (check the <code>error</code> field for details)</li>
                <li><strong>CANCELLED:</strong> Payout was cancelled</li>
            </ul>

            <h2>Example Request</h2>
            <CodeBlock
                code={`const payoutId = 'payout-uuid-from-execute-response';

const response = await fetch(\`https://api.zitopay.com/api/v1/disbursements/\${payoutId}\`, {
  method: 'GET',
  headers: {
    'x-zito-key': apiKey,
    'x-zito-timestamp': timestamp,
    'x-zito-nonce': nonce,
    'x-zito-origin': origin,
    'x-zito-signature': signature,
    'x-zito-version': '1.0'
  }
});

const data = await response.json();
console.log('Payout Status:', data.payout.status);
console.log('Amount:', data.payout.amount);`}
                language="javascript"
            />

            <h2>Polling Strategy</h2>
            <p>
                If a payout is in PROCESSING status, you may want to poll this endpoint periodically until it reaches a final state (SUCCESS, FAILED, or CANCELLED). However, we recommend using webhooks instead of polling for better efficiency.
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 my-6">
                <div className="flex items-start gap-3">
                    <span className="text-blue-700 dark:text-blue-400 text-lg mt-0.5">ℹ️</span>
                    <div className="flex-1 text-sm text-blue-900 dark:text-blue-100">
                        <p className="leading-relaxed">
                            <strong>Best Practice:</strong> Instead of polling, set up webhooks to receive real-time notifications when payouts complete. This is more efficient and reduces API calls.
                        </p>
                    </div>
                </div>
            </div>

            <h2>Error Handling</h2>
            <p>
                If a payout fails, the <code>error</code> field will contain details about what went wrong. Common error scenarios include:
            </p>
            <ul>
                <li>Invalid recipient phone number</li>
                <li>Insufficient funds in your account</li>
                <li>Gateway service unavailable</li>
                <li>Recipient account not found or inactive</li>
            </ul>

            <h2>Next Steps</h2>
            <p>
                Learn more about:
            </p>
            <ul>
                <li><Link href="/docs/disbursements/list-payouts">Listing all payouts</Link></li>
                <li><Link href="/docs/webhooks/overview">Setting up webhooks</Link> for real-time notifications</li>
            </ul>
        </div>
    );
}
