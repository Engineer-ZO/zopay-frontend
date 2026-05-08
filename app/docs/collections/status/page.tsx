"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/docs/CodeBlock";

export default function TransactionStatusPage() {
    return (
        <div>
            <h1>Transaction Status</h1>
            <p>
                Check the status of a collection transaction to see if it has been completed, failed, or is still processing.
            </p>

            <h2>Endpoint</h2>
            <CodeBlock
                code={`GET /api/v1/wallets/transactions/:id`}
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
                        <td>Transaction ID from the execute collection response</td>
                    </tr>
                </tbody>
            </table>

            <h2>Response</h2>
            <CodeBlock
                code={`{
  "transaction": {
    "id": "txn-uuid",
    "merchantId": "merchant-uuid",
    "gateway": "MTN_MOMO",
    "amount": "10000.00",
    "currency": "XAF",
    "status": "SUCCESS",
    "gatewayReference": "MTN_REF_123456789",
    "gatewayFee": "50.00",
    "platformFee": "100.00",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "completedAt": "2024-01-15T10:01:00.000Z"
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
                        <td><code>id</code></td>
                        <td>string</td>
                        <td>Transaction identifier</td>
                    </tr>
                    <tr>
                        <td><code>merchantId</code></td>
                        <td>string</td>
                        <td>Your merchant ID</td>
                    </tr>
                    <tr>
                        <td><code>gateway</code></td>
                        <td>string</td>
                        <td>Payment gateway used (MTN_MOMO, ORANGE_MONEY)</td>
                    </tr>
                    <tr>
                        <td><code>amount</code></td>
                        <td>string</td>
                        <td>Transaction amount</td>
                    </tr>
                    <tr>
                        <td><code>currency</code></td>
                        <td>string</td>
                        <td>Currency code</td>
                    </tr>
                    <tr>
                        <td><code>status</code></td>
                        <td>string</td>
                        <td>Transaction status (PENDING, VERIFYING, SUCCESS, FAILED, CANCELLED)</td>
                    </tr>
                    <tr>
                        <td><code>gatewayReference</code></td>
                        <td>string</td>
                        <td>Reference from mobile money provider</td>
                    </tr>
                    <tr>
                        <td><code>gatewayFee</code></td>
                        <td>string</td>
                        <td>Fee charged by gateway</td>
                    </tr>
                    <tr>
                        <td><code>platformFee</code></td>
                        <td>string</td>
                        <td>ZitoPay platform fee</td>
                    </tr>
                    <tr>
                        <td><code>createdAt</code></td>
                        <td>string</td>
                        <td>Transaction creation timestamp</td>
                    </tr>
                    <tr>
                        <td><code>completedAt</code></td>
                        <td>string</td>
                        <td>Transaction completion timestamp (null if pending)</td>
                    </tr>
                </tbody>
            </table>

            <h2>Example Request</h2>
            <CodeBlock
                code={`const transactionId = 'txn-uuid-from-execute-response';

const response = await fetch(\`https://api.zitopay.com/api/v1/wallets/transactions/\${transactionId}\`, {
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
console.log('Status:', data.transaction.status);
console.log('Amount:', data.transaction.amount);`}
                language="javascript"
            />

            <h2>Transaction Statuses</h2>
            <ul>
                <li><strong>PENDING:</strong> Transaction has been initiated but not yet processed</li>
                <li><strong>VERIFYING:</strong> Payment is being verified with the mobile money provider</li>
                <li><strong>SUCCESS:</strong> Payment completed successfully</li>
                <li><strong>FAILED:</strong> Payment failed (check error details in response)</li>
                <li><strong>CANCELLED:</strong> Transaction was cancelled by user or system</li>
            </ul>

            <h2>Polling vs Webhooks</h2>
            <p>
                While you can poll the status endpoint, we recommend using <Link href="/docs/webhooks">webhooks</Link> to receive real-time notifications when transaction status changes. This is more efficient and provides better user experience.
            </p>

            <h2>Best Practices</h2>
            <ul>
                <li>Use webhooks for real-time status updates</li>
                <li>Only poll status if webhook delivery fails</li>
                <li>Implement exponential backoff when polling</li>
                <li>Cache transaction status in your database</li>
                <li>Handle all possible status values in your code</li>
            </ul>
        </div>
    );
}
