"use client";

import { CodeBlock } from "@/components/docs/CodeBlock";

export default function DisbursementsPage() {
    return (
        <div>
            <h1>Disbursements</h1>
            <p>
                Disbursements allow you to send money to customers, suppliers, employees, or partners via mobile money. This section covers everything you need to know about processing payouts through ZoPay.
            </p>

            <h2>Overview</h2>
            <p>
                The disbursement process involves several steps:
            </p>
            <ol>
                <li><strong>Create a Quote:</strong> Get pricing information for the payout</li>
                <li><strong>Execute Disbursement:</strong> Process the payout to the recipient</li>
                <li><strong>Check Status:</strong> Monitor the payout status</li>
                <li><strong>List Payouts:</strong> View all your payouts with filters</li>
                <li><strong>Bulk Payouts:</strong> Process multiple payouts from a CSV file</li>
            </ol>

            <h3>Supported Gateways</h3>
            <ul>
                <li><strong>MTN Mobile Money:</strong> Available in Cameroon, Ivory Coast, and other supported countries</li>
                <li><strong>Orange Money:</strong> Push payment integration</li>
            </ul>

            <h3>Disbursement Flow</h3>
            <ol>
                <li>You initiate a payout on your platform</li>
                <li>Your application creates a quote via <code>POST /api/v1/disbursements/quote</code></li>
                <li>Quote includes gateway fee, platform fee, recipient amount, and total wallet deduction</li>
                <li>Your application executes disbursement via <code>POST /api/v1/disbursements/execute</code></li>
                <li>ZoPay processes payout with the mobile money provider</li>
                <li>Webhook notification sent when payout completes</li>
                <li>Check payout status via <code>GET /api/v1/disbursements/:id</code></li>
            </ol>

            <h3>Payout Statuses</h3>
            <ul>
                <li><strong>PENDING:</strong> Payout initiated, awaiting processing</li>
                <li><strong>PROCESSING:</strong> Payout is being processed</li>
                <li><strong>SUCCESS:</strong> Payout completed successfully</li>
                <li><strong>FAILED:</strong> Payout failed (check error details)</li>
                <li><strong>CANCELLED:</strong> Payout was cancelled</li>
            </ul>

            <h3>Fees</h3>
            <p>
                Each disbursement includes:
            </p>
            <ul>
                <li><strong>Gateway Fee:</strong> Fee charged by the mobile money provider</li>
                <li><strong>Platform Fee:</strong> ZoPay service fee</li>
                <li><strong>Total Amount:</strong> Amount the recipient receives</li>
                <li><strong>Net to Merchant:</strong> Total deducted from the merchant wallet</li>
            </ul>

            <h2>Create Disbursement Quote</h2>
            <p>
                Before executing a disbursement, you should create a quote to see the fee breakdown, the amount the recipient receives, and the total wallet deduction for the merchant.
            </p>

            <h3>Endpoint</h3>
            <CodeBlock
                code={`POST /api/v1/disbursements/quote`}
                language="http"
            />

            <p>
                <strong>Note:</strong> This endpoint returns the amount the recipient receives in <code>total_amount</code> and the total merchant wallet debit in <code>net_to_merchant</code>.
            </p>

            <h3>Request Body</h3>
            <CodeBlock
                code={`{
  "merchant_id": "uuid",
  "gateway": "MTN_MOMO",
  "amount": "5000",
  "currency": "XAF",
  "transaction_type": "DISBURSEMENT"
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
                        <td>Payment gateway (e.g., &quot;MTN_MOMO&quot;, &quot;ORANGE_MONEY&quot;)</td>
                    </tr>
                    <tr>
                        <td><code>transaction_type</code></td>
                        <td>string</td>
                        <td>Yes</td>
                        <td>Must be &quot;DISBURSEMENT&quot;</td>
                    </tr>
                    <tr>
                        <td><code>amount</code></td>
                        <td>string</td>
                        <td>Yes</td>
                        <td>Payout amount as a string</td>
                    </tr>
                    <tr>
                        <td><code>currency</code></td>
                        <td>string</td>
                        <td>Yes</td>
                        <td>Currency code (e.g., &quot;XAF&quot;, &quot;USD&quot;)</td>
                    </tr>
                    <tr>
                        <td><code>merchant_id</code></td>
                        <td>string</td>
                        <td>Yes</td>
                        <td>The merchant UUID requesting the quote</td>
                    </tr>
                </tbody>
            </table>

            <h3>Response</h3>
            <CodeBlock
                code={`{
  "gateway_fee": "15.00",
  "platform_fee": "10.00",
  "total_amount": "5000.00",
  "net_to_merchant": "-5025.00"
}`}
                language="json"
            />

            <h2>Execute Disbursement</h2>
            <p>
                After creating a quote, use this endpoint to process the actual payout to the recipient.
            </p>

            <h3>Endpoint</h3>
            <CodeBlock
                code={`POST /api/v1/disbursements/execute`}
                language="http"
            />

            <h3>Request Body</h3>
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
                        <td><code>recipient.msisdn</code></td>
                        <td>string</td>
                        <td>Yes</td>
                        <td>Recipient phone number in E.164 format</td>
                    </tr>
                </tbody>
            </table>

            <h3>Response</h3>
            <CodeBlock
                code={`{
  "payout_id": "payout-uuid",
  "status": "PROCESSING",
  "gateway_reference": "MTN_REF_123456789",
  "correlation_id": "corr-uuid"
}`}
                language="json"
            />

            <h2>Get Payout Status</h2>
            <p>
                Check the status of a disbursement to see if it has been completed, failed, or is still processing.
            </p>

            <h3>Endpoint</h3>
            <CodeBlock
                code={`GET /api/v1/disbursements/:id`}
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
                        <td>Payout ID from the execute disbursement response</td>
                    </tr>
                </tbody>
            </table>

            <h3>Response</h3>
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
    "createdAt": "2024-01-15T10:00:00.000Z",
    "completedAt": "2024-01-15T10:01:00.000Z"
  }
}`}
                language="json"
            />

            <h2>List Payouts</h2>
            <p>
                Retrieve a list of all your payouts with optional filtering and pagination.
            </p>

            <h3>Endpoint</h3>
            <CodeBlock
                code={`GET /api/v1/disbursements`}
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
                        <td><code>limit</code></td>
                        <td>number</td>
                        <td>Number of results per page (default: 20, max: 100)</td>
                    </tr>
                    <tr>
                        <td><code>offset</code></td>
                        <td>number</td>
                        <td>Number of results to skip (for pagination)</td>
                    </tr>
                    <tr>
                        <td><code>startDate</code></td>
                        <td>string</td>
                        <td>Start date filter (ISO 8601 format)</td>
                    </tr>
                    <tr>
                        <td><code>endDate</code></td>
                        <td>string</td>
                        <td>End date filter (ISO 8601 format)</td>
                    </tr>
                </tbody>
            </table>

            <h3>Response</h3>
            <CodeBlock
                code={`{
  "payouts": [
    {
      "id": "payout-uuid",
      "amount": "5000.00",
      "currency": "XAF",
      "status": "SUCCESS",
      "recipient": {
        "msisdn": "+237612345678"
      },
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "total": 150,
  "limit": 20,
  "offset": 0
}`}
                language="json"
            />

            <h2>Bulk Payouts</h2>
            <p>
                Process multiple payouts at once by uploading a CSV file. This is useful for payroll, vendor payments, or mass disbursements.
            </p>

            <h3>Step 1: Upload CSV File</h3>
            <p>
                First, upload your payout CSV file using the files API:
            </p>
            <CodeBlock
                code={`POST /files/v1/payout-csv`}
                language="http"
            />

            <h3>CSV Format</h3>
            <p>
                Your CSV file should have the following format:
            </p>
            <CodeBlock
                code={`phone,amount,gateway,reference
+237612345678,10000,MTN_MOMO,Salary January
+237690123456,15000,ORANGE_MONEY,Commission Q1
+237670987654,5000,MTN_MOMO,Bonus`}
                language="csv"
            />

            <h3>CSV Columns</h3>
            <table>
                <thead>
                    <tr>
                        <th>Column</th>
                        <th>Required</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><code>phone</code></td>
                        <td>Yes</td>
                        <td>Recipient phone number (with or without + prefix)</td>
                    </tr>
                    <tr>
                        <td><code>amount</code></td>
                        <td>Yes</td>
                        <td>Payout amount (numeric value)</td>
                    </tr>
                    <tr>
                        <td><code>gateway</code></td>
                        <td>Yes</td>
                        <td>Payment gateway (MTN_MOMO, ORANGE_MONEY)</td>
                    </tr>
                    <tr>
                        <td><code>reference</code></td>
                        <td>No</td>
                        <td>Optional reference/description for the payout</td>
                    </tr>
                </tbody>
            </table>

            <h3>Step 2: Process Bulk Payout</h3>
            <p>
                After uploading the CSV, process the bulk payout:
            </p>
            <CodeBlock
                code={`POST /api/v1/disbursements/bulk`}
                language="http"
            />

            <h3>Request Body</h3>
            <CodeBlock
                code={`{
  "file_id": "file-uuid",
  "idempotency_key": "bulk-payout-2024-01-15"
}`}
                language="json"
            />

            <h3>Response</h3>
            <CodeBlock
                code={`{
  "batch_id": "batch-uuid",
  "total_payouts": 100,
  "status": "PROCESSING",
  "created_at": "2024-01-15T10:00:00.000Z"
}`}
                language="json"
            />

            <h3>Bulk Payout Status</h3>
            <p>
                Bulk payouts are processed asynchronously. You can check the status of individual payouts using the List Payouts endpoint with a batch filter, or set up webhooks to receive notifications for each payout.
            </p>

            <h3>Best Practices</h3>
            <ul>
                <li>Validate CSV format before uploading</li>
                <li>Use unique references for each payout</li>
                <li>Monitor bulk payout status via webhooks</li>
                <li>Keep CSV files under 10MB (typically 10,000-50,000 rows)</li>
                <li>Test with a small batch first</li>
            </ul>
        </div>
    );
}
