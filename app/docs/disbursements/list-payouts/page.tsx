"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/docs/CodeBlock";

export default function ListPayoutsPage() {
    return (
        <div>
            <h1>List Payouts</h1>
            <p>
                Retrieve a list of all your payouts with optional filtering and pagination.
            </p>

            <h2>Endpoint</h2>
            <CodeBlock
                code={`GET /api/v1/disbursements`}
                language="http"
            />

            <h2>Query Parameters</h2>
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
                        <td><code>status</code></td>
                        <td>string</td>
                        <td>No</td>
                        <td>Filter by status (PENDING, PROCESSING, SUCCESS, FAILED, CANCELLED)</td>
                    </tr>
                    <tr>
                        <td><code>gateway</code></td>
                        <td>string</td>
                        <td>No</td>
                        <td>Filter by gateway (MTN_MOMO, ORANGE_MONEY)</td>
                    </tr>
                    <tr>
                        <td><code>limit</code></td>
                        <td>number</td>
                        <td>No</td>
                        <td>Number of results per page (default: 20, max: 100)</td>
                    </tr>
                    <tr>
                        <td><code>offset</code></td>
                        <td>number</td>
                        <td>No</td>
                        <td>Number of results to skip (for pagination)</td>
                    </tr>
                    <tr>
                        <td><code>startDate</code></td>
                        <td>string</td>
                        <td>No</td>
                        <td>Start date filter (ISO 8601 format, e.g., &quot;2024-01-01T00:00:00Z&quot;)</td>
                    </tr>
                    <tr>
                        <td><code>endDate</code></td>
                        <td>string</td>
                        <td>No</td>
                        <td>End date filter (ISO 8601 format, e.g., &quot;2024-01-31T23:59:59Z&quot;)</td>
                    </tr>
                </tbody>
            </table>

            <h2>Response</h2>
            <CodeBlock
                code={`{
  "payouts": [
    {
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
      "completedAt": "2024-01-15T10:01:00.000Z"
    }
  ],
  "total": 150,
  "limit": 20,
  "offset": 0,
  "hasMore": true
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
                        <td><code>payouts</code></td>
                        <td>array</td>
                        <td>Array of payout objects</td>
                    </tr>
                    <tr>
                        <td><code>total</code></td>
                        <td>number</td>
                        <td>Total number of payouts matching the filters</td>
                    </tr>
                    <tr>
                        <td><code>limit</code></td>
                        <td>number</td>
                        <td>Number of results per page</td>
                    </tr>
                    <tr>
                        <td><code>offset</code></td>
                        <td>number</td>
                        <td>Number of results skipped</td>
                    </tr>
                    <tr>
                        <td><code>hasMore</code></td>
                        <td>boolean</td>
                        <td>Whether there are more results available</td>
                    </tr>
                </tbody>
            </table>

            <h2>Example Requests</h2>

            <h3>Get All Payouts</h3>
            <CodeBlock
                code={`const response = await fetch('https://api.zitopay.com/api/v1/disbursements', {
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
console.log('Total payouts:', data.total);
console.log('Payouts:', data.payouts);`}
                language="javascript"
            />

            <h3>Filter by Status</h3>
            <CodeBlock
                code={`const response = await fetch('https://api.zitopay.com/api/v1/disbursements?status=SUCCESS', {
  method: 'GET',
  headers: {
    'x-zito-key': apiKey,
    'x-zito-timestamp': timestamp,
    'x-zito-nonce': nonce,
    'x-zito-origin': origin,
    'x-zito-signature': signature,
    'x-zito-version': '1.0'
  }
});`}
                language="javascript"
            />

            <h3>Pagination</h3>
            <CodeBlock
                code={`// Get second page (20 results per page)
const response = await fetch('https://api.zitopay.com/api/v1/disbursements?limit=20&offset=20', {
  method: 'GET',
  headers: {
    'x-zito-key': apiKey,
    'x-zito-timestamp': timestamp,
    'x-zito-nonce': nonce,
    'x-zito-origin': origin,
    'x-zito-signature': signature,
    'x-zito-version': '1.0'
  }
});`}
                language="javascript"
            />

            <h3>Date Range Filter</h3>
            <CodeBlock
                code={`const startDate = '2024-01-01T00:00:00Z';
const endDate = '2024-01-31T23:59:59Z';

const response = await fetch(
  \`https://api.zitopay.com/api/v1/disbursements?startDate=\${startDate}&endDate=\${endDate}\`,
  {
    method: 'GET',
    headers: {
      'x-zito-key': apiKey,
      'x-zito-timestamp': timestamp,
      'x-zito-nonce': nonce,
      'x-zito-origin': origin,
      'x-zito-signature': signature,
      'x-zito-version': '1.0'
    }
  }
);`}
                language="javascript"
            />

            <h2>Pagination Best Practices</h2>
            <ul>
                <li>Use <code>limit</code> to control page size (default: 20, max: 100)</li>
                <li>Use <code>offset</code> to navigate through pages</li>
                <li>Check <code>hasMore</code> to determine if there are more results</li>
                <li>For large datasets, consider using date range filters to reduce result size</li>
            </ul>

            <h2>Filtering Tips</h2>
            <ul>
                <li>Combine multiple filters (e.g., status + date range) for precise queries</li>
                <li>Use date filters to retrieve payouts from specific time periods</li>
                <li>Filter by gateway to see payouts for a specific payment method</li>
                <li>Filter by status to find failed payouts that need attention</li>
            </ul>

            <h2>Next Steps</h2>
            <p>
                Learn more about:
            </p>
            <ul>
                <li><Link href="/docs/disbursements/bulk-payouts">Bulk Payouts</Link> for processing multiple payouts</li>
                <li><Link href="/docs/disbursements/get-status">Get Status</Link> for detailed payout information</li>
            </ul>
        </div>
    );
}
