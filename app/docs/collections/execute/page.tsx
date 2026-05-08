"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/docs/CodeBlock";

export default function ExecuteCollectionPage() {
    return (
        <div>
            <h1>Execute Collection</h1>
            <p>
                After creating a quote, use this endpoint to process the actual payment from the customer.
            </p>

            <h2>Endpoint</h2>
            <CodeBlock
                code={`POST /api/v1/wallets/collect`}
                language="http"
            />

            <h2>Request Body</h2>
            <CodeBlock
                code={`{
  "quote_id": "quote-uuid",
  "idempotency_key": "unique-payment-123"
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
                        <td>Unique identifier to prevent duplicate transactions</td>
                    </tr>
                </tbody>
            </table>
            
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 my-6">
                <div className="flex items-start gap-3">
                    <span className="text-blue-700 dark:text-blue-400 text-lg mt-0.5">💡</span>
                    <div className="flex-1 text-sm text-blue-900 dark:text-blue-100">
                        <p className="leading-relaxed">
                            <strong>Idempotency Key:</strong> Always use a unique idempotency key for each collection attempt. If you retry a request with the same idempotency key, ZitoPay will return the original transaction result instead of creating a duplicate payment.
                        </p>
                    </div>
                </div>
            </div>

            <h2>Response</h2>
            <CodeBlock
                code={`{
  "transaction_id": "txn-uuid",
  "status": "VERIFYING",
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
                        <td><code>transaction_id</code></td>
                        <td>string</td>
                        <td>Unique transaction identifier</td>
                    </tr>
                    <tr>
                        <td><code>status</code></td>
                        <td>string</td>
                        <td>Current transaction status (PENDING, VERIFYING, SUCCESS, FAILED)</td>
                    </tr>
                    <tr>
                        <td><code>gateway_reference</code></td>
                        <td>string</td>
                        <td>Reference from the mobile money provider</td>
                    </tr>
                    <tr>
                        <td><code>correlation_id</code></td>
                        <td>string</td>
                        <td>Correlation ID for tracking</td>
                    </tr>
                </tbody>
            </table>

            <h2>Example Request</h2>
            <CodeBlock
                code={`const response = await fetch('https://api.zitopay.com/api/v1/wallets/collect', {
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
    idempotency_key: \`payment-\${Date.now()}-\${Math.random()}\`
  })
});

const result = await response.json();
console.log('Transaction ID:', result.transaction_id);
console.log('Status:', result.status);`}
                language="javascript"
            />

            <h2>Idempotency</h2>
            <p>
                The <code>idempotency_key</code> ensures that if you retry a request with the same key, the same transaction will be returned instead of creating a duplicate. Always use a unique identifier for each payment attempt.
            </p>

            <h2>Transaction Status</h2>
            <p>
                After executing a collection, the transaction status will be <code>VERIFYING</code> initially. You should:
            </p>
            <ol>
                <li>Store the <code>transaction_id</code> in your database</li>
                <li>Set up webhooks to receive status updates</li>
                <li>Poll the status endpoint if needed: <Link href="/docs/collections/status">Get Transaction Status</Link></li>
            </ol>

            <h2>Error Handling</h2>
            <p>Common errors you might encounter:</p>
            <ul>
                <li><code>400 Bad Request</code>: Invalid quote_id or expired quote</li>
                <li><code>409 Conflict</code>: Duplicate idempotency_key</li>
                <li><code>402 Payment Required</code>: Insufficient balance or payment declined</li>
            </ul>
        </div>
    );
}
