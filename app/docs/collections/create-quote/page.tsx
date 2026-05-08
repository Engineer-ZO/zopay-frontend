"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/docs/CodeBlock";

export default function CreateQuotePage() {
    return (
        <div>
            <h1>Create Quote</h1>
            <p>
                Before executing a collection, you should create a quote to get pricing information including fees and the total amount the customer will pay.
            </p>

            <h2>Endpoint</h2>
            <CodeBlock
                code={`POST /api/v1/wallets/quote`}
                language="http"
            />

            <p>
                <strong>Note:</strong> This endpoint is used for both collections and disbursements. Set <code>transaction_type</code> to <code>COLLECTION</code> or <code>DISBURSEMENT</code>.
            </p>
            
            <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-lg p-4 my-6">
                <div className="flex items-start gap-3">
                    <span className="text-orange-700 dark:text-orange-400 text-lg mt-0.5">💡</span>
                    <div className="flex-1 text-sm text-orange-900 dark:text-orange-100">
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
                        <td>Payment gateway (e.g., &quot;MTN_MOMO&quot;, &quot;ORANGE_MONEY&quot;)</td>
                    </tr>
                    <tr>
                        <td><code>transaction_type</code></td>
                        <td>string</td>
                        <td>Yes</td>
                        <td>Type of transaction: &quot;COLLECTION&quot; or &quot;DISBURSEMENT&quot;</td>
                    </tr>
                    <tr>
                        <td><code>amount</code></td>
                        <td>string</td>
                        <td>Yes</td>
                        <td>Transaction amount (as string to avoid precision issues)</td>
                    </tr>
                    <tr>
                        <td><code>currency</code></td>
                        <td>string</td>
                        <td>Yes</td>
                        <td>Currency code (e.g., &quot;XAF&quot;, &quot;XOF&quot;, &quot;USD&quot;)</td>
                    </tr>
                    <tr>
                        <td><code>payer</code></td>
                        <td>object</td>
                        <td>Yes</td>
                        <td>Payer information (for collections)</td>
                    </tr>
                    <tr>
                        <td><code>payer.msisdn</code></td>
                        <td>string</td>
                        <td>Yes</td>
                        <td>Customer&apos;s phone number in international format</td>
                    </tr>
                </tbody>
            </table>

            <h2>Response</h2>
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
                        <td>Unique identifier for the quote (use this when executing collection)</td>
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

            <h2>Example Request</h2>
            <CodeBlock
                code={`const response = await fetch('https://api.zitopay.com/api/v1/wallets/quote', {
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
    transaction_type: 'COLLECTION',
    amount: '10000',
    currency: 'XAF',
    payer: {
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
                Quotes expire after a set period (typically 5-15 minutes). If a quote expires, you&apos;ll need to create a new one before executing the collection. Always check the <code>expires_at</code> field before using a quote.
            </p>

            <h2>Next Steps</h2>
            <p>
                Once you have a quote, proceed to <Link href="/docs/collections/execute">Execute Collection</Link> to process the payment.
            </p>
        </div>
    );
}
