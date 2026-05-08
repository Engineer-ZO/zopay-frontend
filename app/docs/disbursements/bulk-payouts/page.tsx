"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/docs/CodeBlock";

export default function BulkPayoutsPage() {
    return (
        <div>
            <h1>Bulk Payouts</h1>
            <p>
                Process multiple payouts at once by uploading a CSV file. This is useful for payroll, vendor payments, or mass disbursements.
            </p>

            <h2>Overview</h2>
            <p>
                Bulk payouts allow you to process hundreds or thousands of payouts in a single operation. The process involves:
            </p>
            <ol>
                <li>Preparing a CSV file with payout details</li>
                <li>Uploading the CSV file</li>
                <li>Initiating the bulk payout process</li>
                <li>Monitoring the batch status</li>
            </ol>

            <h2>Step 1: Upload CSV File</h2>
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

            <h3>Upload Request</h3>
            <CodeBlock
                code={`const formData = new FormData();
formData.append('file', csvFile);

const response = await fetch('https://api.zitopay.com/files/v1/payout-csv', {
  method: 'POST',
  headers: {
    'x-zito-key': apiKey,
    'x-zito-timestamp': timestamp,
    'x-zito-nonce': nonce,
    'x-zito-origin': origin,
    'x-zito-signature': signature,
    'x-zito-version': '1.0'
  },
  body: formData
});

const uploadResult = await response.json();
console.log('File ID:', uploadResult.file_id);`}
                language="javascript"
            />

            <h3>Upload Response</h3>
            <CodeBlock
                code={`{
  "file_id": "file-uuid",
  "filename": "payouts.csv",
  "row_count": 100,
  "uploaded_at": "2024-01-15T10:00:00.000Z"
}`}
                language="json"
            />

            <h2>Step 2: Process Bulk Payout</h2>
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
                        <td><code>file_id</code></td>
                        <td>string</td>
                        <td>Yes</td>
                        <td>File ID from the CSV upload response</td>
                    </tr>
                    <tr>
                        <td><code>idempotency_key</code></td>
                        <td>string</td>
                        <td>Yes</td>
                        <td>Unique identifier to prevent duplicate bulk payout processing</td>
                    </tr>
                </tbody>
            </table>

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
                        <td><code>batch_id</code></td>
                        <td>string</td>
                        <td>Unique identifier for the bulk payout batch</td>
                    </tr>
                    <tr>
                        <td><code>total_payouts</code></td>
                        <td>number</td>
                        <td>Total number of payouts in the batch</td>
                    </tr>
                    <tr>
                        <td><code>status</code></td>
                        <td>string</td>
                        <td>Batch status (PROCESSING, COMPLETED, FAILED)</td>
                    </tr>
                    <tr>
                        <td><code>created_at</code></td>
                        <td>string</td>
                        <td>Batch creation timestamp</td>
                    </tr>
                </tbody>
            </table>

            <h2>Step 3: Monitor Bulk Payout Status</h2>
            <p>
                Bulk payouts are processed asynchronously. You can check the status of individual payouts using the <Link href="/docs/disbursements/list-payouts">List Payouts</Link> endpoint with a batch filter, or set up webhooks to receive notifications for each payout.
            </p>

            <h3>Example: Check Batch Status</h3>
            <CodeBlock
                code={`// List payouts from a specific batch
const response = await fetch('https://api.zitopay.com/api/v1/disbursements?batch_id=batch-uuid', {
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
const successful = data.payouts.filter(p => p.status === 'SUCCESS').length;
const failed = data.payouts.filter(p => p.status === 'FAILED').length;
console.log(\`Successful: \${successful}, Failed: \${failed}\`);`}
                language="javascript"
            />

            <h2>Best Practices</h2>
            <ul>
                <li><strong>Validate CSV format:</strong> Ensure all required columns are present and data is valid before uploading</li>
                <li><strong>Use unique references:</strong> Include meaningful references for each payout to help with reconciliation</li>
                <li><strong>Monitor via webhooks:</strong> Set up webhooks to receive real-time notifications for each payout</li>
                <li><strong>File size limits:</strong> Keep CSV files under 10MB (typically 10,000-50,000 rows)</li>
                <li><strong>Test with small batches:</strong> Test with a small batch first (10-20 payouts) before processing large batches</li>
                <li><strong>Handle failures:</strong> Some payouts in a batch may fail. Check individual payout statuses and retry failed ones if needed</li>
                <li><strong>Idempotency:</strong> Use a unique idempotency key for each bulk payout to prevent duplicate processing</li>
            </ul>

            <h2>Error Handling</h2>
            <p>
                Individual payouts within a batch may fail. Common reasons include:
            </p>
            <ul>
                <li>Invalid phone numbers</li>
                <li>Insufficient funds in your account</li>
                <li>Gateway service unavailable</li>
                <li>Recipient account issues</li>
            </ul>
            <p>
                Failed payouts will have their status set to &quot;FAILED&quot; with error details. You can query the list of payouts to identify and handle failures.
            </p>

            <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 my-6">
                <div className="flex items-start gap-3">
                    <span className="text-yellow-700 dark:text-yellow-400 text-lg mt-0.5">⚠️</span>
                    <div className="flex-1 text-sm text-yellow-900 dark:text-yellow-100">
                        <p className="leading-relaxed">
                            <strong>Important:</strong> Ensure you have sufficient funds in your account to cover all payouts in the batch, including fees. The system will process payouts sequentially, and if your account balance becomes insufficient, remaining payouts will fail.
                        </p>
                    </div>
                </div>
            </div>

            <h2>Next Steps</h2>
            <p>
                Learn more about:
            </p>
            <ul>
                <li><Link href="/docs/disbursements/list-payouts">Listing payouts</Link> to monitor batch progress</li>
                <li><Link href="/docs/webhooks/overview">Setting up webhooks</Link> for real-time notifications</li>
                <li><Link href="/docs/disbursements/get-status">Getting payout status</Link> for individual payout details</li>
            </ul>
        </div>
    );
}
