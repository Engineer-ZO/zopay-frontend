"use client";

import { CodeBlock } from "@/components/docs/CodeBlock";

export default function CollectionsPage() {
    return (
        <div>
            <h1>Collections</h1>
            <p>
                Collections allow you to receive payments from customers via mobile money. This section covers everything you need to know about collecting payments through ZitoPay.
            </p>

            <h2>Overview</h2>
            <p>
                The collection process involves three main steps:
            </p>
            <ol>
                <li><strong>Create a Quote:</strong> Get pricing information for the transaction</li>
                <li><strong>Execute Collection:</strong> Process the payment from the customer</li>
                <li><strong>Check Status:</strong> Monitor the transaction status</li>
            </ol>

            <h3>Supported Gateways</h3>
            <ul>
                <li><strong>MTN Mobile Money:</strong> Available in Cameroon, Ivory Coast, and other supported countries</li>
                <li><strong>Orange Money:</strong> Merchant payment integration</li>
            </ul>

            <h3>Collection Flow</h3>
            <ol>
                <li>Customer initiates payment on your platform</li>
                <li>Your application creates a quote via <code>POST /api/v1/wallets/quote</code></li>
                <li>Quote includes fees and total amount</li>
                <li>Customer confirms payment details</li>
                <li>Your application executes collection via <code>POST /api/v1/wallets/collect</code></li>
                <li>ZitoPay processes payment with the mobile money provider</li>
                <li>Webhook notification sent when transaction completes</li>
                <li>Check transaction status via <code>GET /api/v1/wallets/transactions/:id</code></li>
            </ol>

            <h3>Transaction Statuses</h3>
            <ul>
                <li><strong>PENDING:</strong> Transaction initiated, awaiting processing</li>
                <li><strong>VERIFYING:</strong> Payment is being verified with the gateway</li>
                <li><strong>SUCCESS:</strong> Payment completed successfully</li>
                <li><strong>FAILED:</strong> Payment failed (check error details)</li>
                <li><strong>CANCELLED:</strong> Transaction was cancelled</li>
            </ul>

            <h3>Fees</h3>
            <p>
                Each collection includes:
            </p>
            <ul>
                <li><strong>Gateway Fee:</strong> Fee charged by the mobile money provider (MTN, Orange, etc.)</li>
                <li><strong>Platform Fee:</strong> ZitoPay service fee</li>
                <li><strong>Total Amount:</strong> Amount customer pays (original amount + fees)</li>
                <li><strong>Net to Merchant:</strong> Amount you receive after fees</li>
            </ul>

            <h3>Idempotency</h3>
            <p>
                Always include an <code>idempotency_key</code> when executing collections. This ensures that if a request is retried due to network issues, the same transaction won't be processed twice.
            </p>

            <h2>Create Quote</h2>
            <p>
                Before executing a collection, you should create a quote to get pricing information including fees and the total amount the customer will pay.
            </p>

            <h3>Endpoint</h3>
            <CodeBlock
                code={`POST /api/v1/wallets/quote`}
                language="http"
            />

            <p>
                <strong>Note:</strong> This endpoint is used for both collections and disbursements. Set <code>transaction_type</code> to <code>COLLECTION</code> or <code>DISBURSEMENT</code>.
            </p>

            <h3>Request Body</h3>
            <CodeBlock
                code={`{
  "gateway": "MTN_MOMO",
  "transaction_type": "COLLECTION",
  "amount": "10000",
  "currency": "XAF",
  "payer": {
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
                        <td><code>gateway</code></td>
                        <td>string</td>
                        <td>Yes</td>
                        <td>Payment gateway (e.g., "MTN_MOMO", "ORANGE_MONEY")</td>
                    </tr>
                    <tr>
                        <td><code>transaction_type</code></td>
                        <td>string</td>
                        <td>Yes</td>
                        <td>Type of transaction: "COLLECTION" or "DISBURSEMENT"</td>
                    </tr>
                    <tr>
                        <td><code>amount</code></td>
                        <td>string</td>
                        <td>Yes</td>
                        <td>Transaction amount as a string</td>
                    </tr>
                    <tr>
                        <td><code>currency</code></td>
                        <td>string</td>
                        <td>Yes</td>
                        <td>Currency code (e.g., "XAF", "USD")</td>
                    </tr>
                    <tr>
                        <td><code>payer.msisdn</code></td>
                        <td>string</td>
                        <td>Yes</td>
                        <td>Customer phone number in E.164 format</td>
                    </tr>
                </tbody>
            </table>

            <h3>Response</h3>
            <CodeBlock
                code={`{
  "quote_id": "quote-uuid",
  "fees": {
    "gateway_fee": "50.00",
    "platform_fee": "100.00"
  },
  "total_amount": "10150.00",
  "net_to_merchant": "10150.00",
  "expires_at": "2024-01-15T10:45:00.000Z"
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
                        <td><code>quote_id</code></td>
                        <td>string</td>
                        <td>Unique quote identifier (use this in execute collection)</td>
                    </tr>
                    <tr>
                        <td><code>fees.gateway_fee</code></td>
                        <td>string</td>
                        <td>Fee charged by the mobile money provider</td>
                    </tr>
                    <tr>
                        <td><code>fees.platform_fee</code></td>
                        <td>string</td>
                        <td>ZitoPay platform fee</td>
                    </tr>
                    <tr>
                        <td><code>total_amount</code></td>
                        <td>string</td>
                        <td>Total amount customer will pay (amount + fees)</td>
                    </tr>
                    <tr>
                        <td><code>net_to_merchant</code></td>
                        <td>string</td>
                        <td>Amount you will receive after fees</td>
                    </tr>
                    <tr>
                        <td><code>expires_at</code></td>
                        <td>string</td>
                        <td>Quote expiration timestamp (ISO 8601)</td>
                    </tr>
                </tbody>
            </table>

            <h3>Example Request</h3>
            <CodeBlock
                code={`const response = await fetch('https://api.zitopay.com/api/v1/wallets/quote', {
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
    gateway: 'MTN_MOMO',
    transaction_type: 'COLLECTION',
    amount: '10000',
    currency: 'XAF',
    payer: {
      msisdn: '+237612345678'
    }
  })
});

const quote = await response.json();`}
                language="javascript"
            />

            <h2>Execute Collection</h2>
            <p>
                After creating a quote, use this endpoint to process the actual payment from the customer.
            </p>

            <h3>Endpoint</h3>
            <CodeBlock
                code={`POST /api/v1/wallets/collect`}
                language="http"
            />

            <h3>Request Body</h3>
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

            <h3>Response</h3>
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
                        <td>Initial transaction status (usually "VERIFYING")</td>
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

            <h3>Example Request</h3>
            <CodeBlock
                code={`const response = await fetch('https://api.zitopay.com/api/v1/wallets/collect', {
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
    quote_id: 'quote-uuid',
    idempotency_key: 'unique-payment-123'
  })
});

const transaction = await response.json();`}
                language="javascript"
            />

            <h2>Transaction Status</h2>
            <p>
                Check the status of a collection transaction to see if it has been completed, failed, or is still processing.
            </p>

            <h3>Endpoint</h3>
            <CodeBlock
                code={`GET /api/v1/wallets/transactions/:id`}
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
                        <td>Transaction ID from the execute collection response</td>
                    </tr>
                </tbody>
            </table>

            <h3>Response</h3>
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
                        <td><code>transaction.id</code></td>
                        <td>string</td>
                        <td>Unique transaction identifier</td>
                    </tr>
                    <tr>
                        <td><code>transaction.merchantId</code></td>
                        <td>string</td>
                        <td>Merchant identifier</td>
                    </tr>
                    <tr>
                        <td><code>transaction.gateway</code></td>
                        <td>string</td>
                        <td>Payment gateway used</td>
                    </tr>
                    <tr>
                        <td><code>transaction.amount</code></td>
                        <td>string</td>
                        <td>Transaction amount</td>
                    </tr>
                    <tr>
                        <td><code>transaction.currency</code></td>
                        <td>string</td>
                        <td>Currency code</td>
                    </tr>
                    <tr>
                        <td><code>transaction.status</code></td>
                        <td>string</td>
                        <td>Transaction status (PENDING, VERIFYING, SUCCESS, FAILED, CANCELLED)</td>
                    </tr>
                    <tr>
                        <td><code>transaction.gatewayReference</code></td>
                        <td>string</td>
                        <td>Reference from the mobile money provider</td>
                    </tr>
                    <tr>
                        <td><code>transaction.gatewayFee</code></td>
                        <td>string</td>
                        <td>Fee charged by the gateway</td>
                    </tr>
                    <tr>
                        <td><code>transaction.platformFee</code></td>
                        <td>string</td>
                        <td>ZitoPay platform fee</td>
                    </tr>
                    <tr>
                        <td><code>transaction.createdAt</code></td>
                        <td>string</td>
                        <td>Transaction creation timestamp</td>
                    </tr>
                    <tr>
                        <td><code>transaction.completedAt</code></td>
                        <td>string</td>
                        <td>Transaction completion timestamp (null if not completed)</td>
                    </tr>
                </tbody>
            </table>

            <h3>Example Request</h3>
            <CodeBlock
                code={`const response = await fetch('https://api.zitopay.com/api/v1/wallets/transactions/txn-uuid', {
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

const transaction = await response.json();`}
                language="javascript"
            />

            <h3>Status Polling</h3>
            <p>
                After executing a collection, you should poll this endpoint periodically to check the transaction status. Alternatively, you can set up webhooks to receive real-time notifications when the transaction status changes.
            </p>
        </div>
    );
}
