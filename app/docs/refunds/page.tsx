"use client";

import { CodeBlock } from "@/components/docs/CodeBlock";

export default function RefundsPage() {
    return (
        <div>
            <h1>Refunds</h1>
            <p>
                Process refunds for completed transactions. This section covers how to create and manage refunds through the ZitoPay API.
            </p>

            <h2>Overview</h2>
            <p>
                Refunds allow you to return money to customers for various reasons such as:
            </p>
            <ul>
                <li>Customer request</li>
                <li>Duplicate payment</li>
                <li>Service not delivered</li>
                <li>Wrong amount charged</li>
                <li>Technical error</li>
            </ul>

            <h3>Refund Methods</h3>
            <p>
                ZitoPay supports two refund methods:
            </p>
            <ul>
                <li><strong>Reversal:</strong> Instant refund by reversing the original transaction through the gateway (preferred method)</li>
                <li><strong>Payout:</strong> Manual refund by creating a new payout to the customer (used when reversal is not available)</li>
            </ul>

            <h3>Refund Flow</h3>
            <ol>
                <li>Identify the original transaction that needs to be refunded</li>
                <li>Create a refund request via <code>POST /api/v1/refunds</code></li>
                <li>Specify refund amount (full or partial)</li>
                <li>Select refund method (reversal or payout)</li>
                <li>Provide reason for refund</li>
                <li>ZitoPay processes the refund</li>
                <li>Webhook notification sent when refund completes</li>
                <li>Check refund status via <code>GET /api/v1/refunds/:id</code></li>
            </ol>

            <h3>Refund Statuses</h3>
            <ul>
                <li><strong>PENDING:</strong> Refund initiated, awaiting processing</li>
                <li><strong>PROCESSING:</strong> Refund is being processed</li>
                <li><strong>SUCCESS:</strong> Refund completed successfully</li>
                <li><strong>FAILED:</strong> Refund failed (check error details)</li>
                <li><strong>CANCELLED:</strong> Refund was cancelled</li>
            </ul>

            <h2>Create Refund</h2>
            <p>
                Create a refund for a completed transaction. You can refund the full amount or a partial amount.
            </p>

            <h3>Endpoint</h3>
            <CodeBlock
                code={`POST /api/v1/refunds`}
                language="http"
            />

            <h3>Request Body</h3>
            <CodeBlock
                code={`{
  "transaction_id": "txn-uuid",
  "amount": "5000.00",
  "reason": "Customer request",
  "method": "REVERSAL",
  "idempotency_key": "unique-refund-123",
  "additional_details": "Order #123 was cancelled by customer"
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
                        <td><code>transaction_id</code></td>
                        <td>string</td>
                        <td>Yes</td>
                        <td>ID of the original transaction to refund</td>
                    </tr>
                    <tr>
                        <td><code>amount</code></td>
                        <td>string</td>
                        <td>Yes</td>
                        <td>Refund amount (must be less than or equal to original transaction amount)</td>
                    </tr>
                    <tr>
                        <td><code>reason</code></td>
                        <td>string</td>
                        <td>Yes</td>
                        <td>Reason for refund (e.g., "Customer request", "Duplicate payment", "Service not delivered")</td>
                    </tr>
                    <tr>
                        <td><code>method</code></td>
                        <td>string</td>
                        <td>No</td>
                        <td>Refund method: "REVERSAL" (default, instant) or "PAYOUT" (manual)</td>
                    </tr>
                    <tr>
                        <td><code>idempotency_key</code></td>
                        <td>string</td>
                        <td>Yes</td>
                        <td>Unique identifier to prevent duplicate refunds</td>
                    </tr>
                    <tr>
                        <td><code>additional_details</code></td>
                        <td>string</td>
                        <td>No</td>
                        <td>Additional information about the refund</td>
                    </tr>
                </tbody>
            </table>

            <h3>Response</h3>
            <CodeBlock
                code={`{
  "refund_id": "refund-uuid",
  "transaction_id": "txn-uuid",
  "amount": "5000.00",
  "status": "PROCESSING",
  "method": "REVERSAL",
  "reason": "Customer request",
  "created_at": "2024-01-15T10:00:00.000Z"
}`}
                language="json"
            />

            <h3>Example Request</h3>
            <CodeBlock
                code={`const response = await fetch('https://api.zitopay.com/api/v1/refunds', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-zito-key': 'your-api-key',
    'x-zito-timestamp': Math.floor(Date.now() / 1000).toString(),
    'x-zito-nonce': crypto.randomBytes(16).toString('hex'),
    'x-zito-origin': 'https://yourdomain.com',
    'x-zito-signature': signature,
    'x-zito-version': '1.0'
  },
  body: JSON.stringify({
    transaction_id: 'txn-uuid',
    amount: '5000.00',
    reason: 'Customer request',
    method: 'REVERSAL',
    idempotency_key: 'unique-refund-123',
    additional_details: 'Order #123 was cancelled by customer'
  })
});

const refund = await response.json();`}
                language="javascript"
            />

            <h3>Partial Refunds</h3>
            <p>
                You can create multiple partial refunds for a single transaction, as long as the total refunded amount does not exceed the original transaction amount.
            </p>

            <h2>Get Refund Status</h2>
            <p>
                Check the status of a refund to see if it has been completed, failed, or is still processing.
            </p>

            <h3>Endpoint</h3>
            <CodeBlock
                code={`GET /api/v1/refunds/:id`}
                language="http"
            />

            <h3>Path Parameters</h3>
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
                        <td>Refund ID from the create refund response</td>
                    </tr>
                </tbody>
            </table>

            <h3>Response</h3>
            <CodeBlock
                code={`{
  "refund": {
    "id": "refund-uuid",
    "transaction_id": "txn-uuid",
    "merchantId": "merchant-uuid",
    "amount": "5000.00",
    "currency": "XAF",
    "status": "SUCCESS",
    "method": "REVERSAL",
    "reason": "Customer request",
    "gatewayReference": "MTN_REF_123456789",
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
                        <td><code>refund.id</code></td>
                        <td>string</td>
                        <td>Unique refund identifier</td>
                    </tr>
                    <tr>
                        <td><code>refund.transaction_id</code></td>
                        <td>string</td>
                        <td>Original transaction ID</td>
                    </tr>
                    <tr>
                        <td><code>refund.amount</code></td>
                        <td>string</td>
                        <td>Refund amount</td>
                    </tr>
                    <tr>
                        <td><code>refund.status</code></td>
                        <td>string</td>
                        <td>Refund status (PENDING, PROCESSING, SUCCESS, FAILED, CANCELLED)</td>
                    </tr>
                    <tr>
                        <td><code>refund.method</code></td>
                        <td>string</td>
                        <td>Refund method used (REVERSAL or PAYOUT)</td>
                    </tr>
                    <tr>
                        <td><code>refund.reason</code></td>
                        <td>string</td>
                        <td>Reason for the refund</td>
                    </tr>
                    <tr>
                        <td><code>refund.completedAt</code></td>
                        <td>string</td>
                        <td>Refund completion timestamp (null if not completed)</td>
                    </tr>
                </tbody>
            </table>

            <h2>List Refunds</h2>
            <p>
                Retrieve a list of all your refunds with optional filtering and pagination.
            </p>

            <h3>Endpoint</h3>
            <CodeBlock
                code={`GET /api/v1/refunds`}
                language="http"
            />

            <h3>Query Parameters</h3>
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
                        <td><code>status</code></td>
                        <td>string</td>
                        <td>Filter by status (PENDING, PROCESSING, SUCCESS, FAILED, CANCELLED)</td>
                    </tr>
                    <tr>
                        <td><code>transaction_id</code></td>
                        <td>string</td>
                        <td>Filter by original transaction ID</td>
                    </tr>
                    <tr>
                        <td><code>limit</code></td>
                        <td>number</td>
                        <td>Number of results per page (default: 20, max: 100)</td>
                    </tr>
                    <tr>
                        <td><code>offset</code></td>
                        <td>number</td>
                        <td>Number of results to skip (for pagination)</td>
                    </tr>
                </tbody>
            </table>

            <h3>Response</h3>
            <CodeBlock
                code={`{
  "refunds": [
    {
      "id": "refund-uuid",
      "transaction_id": "txn-uuid",
      "amount": "5000.00",
      "status": "SUCCESS",
      "method": "REVERSAL",
      "reason": "Customer request",
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "total": 45,
  "limit": 20,
  "offset": 0
}`}
                language="json"
            />

            <h3>Example Request</h3>
            <CodeBlock
                code={`// Get all refunds for a specific transaction
const response = await fetch('https://api.zitopay.com/api/v1/refunds?transaction_id=txn-uuid', {
  method: 'GET',
  headers: {
    'x-zito-key': 'your-api-key',
    'x-zito-timestamp': Math.floor(Date.now() / 1000).toString(),
    'x-zito-nonce': crypto.randomBytes(16).toString('hex'),
    'x-zito-origin': 'https://yourdomain.com',
    'x-zito-signature': signature,
    'x-zito-version': '1.0'
  }
});

const data = await response.json();
console.log('Total refunds:', data.total);
console.log('Refunds:', data.refunds);`}
                language="javascript"
            />

            <h3>Best Practices</h3>
            <ul>
                <li>Always use idempotency keys to prevent duplicate refunds</li>
                <li>Prefer REVERSAL method when available (faster and more reliable)</li>
                <li>Provide clear reasons for refunds for audit purposes</li>
                <li>Set up webhooks to receive real-time refund status updates</li>
                <li>Keep track of partial refunds to ensure total doesn't exceed original amount</li>
                <li>Monitor refund success rates and handle failures appropriately</li>
            </ul>
        </div>
    );
}
