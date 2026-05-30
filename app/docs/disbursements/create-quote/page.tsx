"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/docs/CodeBlock";

export default function CreateDisbursementQuotePage() {
    return (
        <div>
            <h1>Create Disbursement Quote</h1>
            <p>
                Before executing a disbursement, you should create a quote to get pricing information including fees, the amount the recipient receives, and the total merchant wallet deduction.
            </p>

            <h2>Endpoint</h2>
            <CodeBlock
                code={`POST /api/v1/disbursements/quote`}
                language="http"
            />

            <p>
                <strong>Note:</strong> This endpoint returns the recipient amount in <code>total_amount</code> and the merchant wallet debit in <code>net_to_merchant</code>.
            </p>
            
            <div className="bg-crimson-red-50 dark:bg-crimson-red-900/10 border border-crimson-red-200 dark:border-crimson-red-800 rounded-lg p-4 my-6">
                <div className="flex items-start gap-3">
                    <span className="text-crimson-red-700 dark:text-crimson-red-400 text-lg mt-0.5">💡</span>
                    <div className="flex-1 text-sm text-crimson-red-900 dark:text-crimson-red-100">
                        <p className="leading-relaxed">
                            <strong>Quote Validity:</strong> Quotes expire after 15 minutes. Fees are locked in during this period, but after expiry, you must create a new quote as pricing may have changed. Each quote can only be used once.
                        </p>
                    </div>
                </div>
            </div>

            <h2>Request Body</h2>
            <CodeBlock
                code={`{
  "gateway": "MTN_MOMO",
  "transaction_type": "DISBURSEMENT",
  "amount": "5000",
  "currency": "XAF",
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
  "gateway_fee": "15.00",
  "platform_fee": "10.00",
  "total_amount": "500.00",
  "net_to_merchant": "-525.00"
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
                        <td><code>gateway_fee</code></td>
                        <td>string</td>
                        <td>Fee charged by the mobile money provider</td>
                    </tr>
                    <tr>
                        <td><code>platform_fee</code></td>
                        <td>string</td>
                        <td>ZitoPay platform fee</td>
                    </tr>
                    <tr>
                        <td><code>total_amount</code></td>
                        <td>string</td>
                        <td><strong>What the recipient receives</strong> (the base amount you entered)</td>
                    </tr>
                    <tr>
                        <td><code>net_to_merchant</code></td>
                        <td>string</td>
                        <td><strong>Total deducted from merchant wallet</strong> (always negative for disbursements)</td>
                    </tr>
                </tbody>
            </table>

            <h2>Example Request</h2>
            <CodeBlock
                code={`const response = await fetch('https://api.zitopay.com/api/v1/disbursements/quote', {
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
    gateway: 'MTN_MOMO',
    transaction_type: 'DISBURSEMENT',
    amount: '5000',
    currency: 'XAF',
    recipient: {
      msisdn: '+237612345678'
    }
  })
});

const quote = await response.json();
console.log('Quote ID:', quote.quote_id);
console.log('Total Amount:', quote.total_amount);`}
                language="javascript"
            />

            <h2>Quote Expiration</h2>
            <p>
                Quotes expire after a set period (typically 15 minutes). If a quote expires, you&apos;ll need to create a new one before executing the disbursement. Always check the <code>expires_at</code> field before using a quote.
            </p>

            <h2>Next Steps</h2>
            <p>
                Once you have a quote, proceed to <Link href="/docs/disbursements/execute">Execute Disbursement</Link> to process the payout.
            </p>
        </div>
    );
}
