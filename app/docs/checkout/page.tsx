"use client";

import { CodeBlock } from "@/components/docs/CodeBlock";

export default function HostedCheckoutDocsPage() {
  return (
    <div>
      <h1>Hosted Checkout</h1>
      <p>
        Hosted Checkout lets your backend create a short-lived ZitoPay payment session, then redirect
        the customer to a secure ZitoPay-hosted page at <code>/pay/:checkoutSessionId</code>.
      </p>

      <h2>Important Implementation Rule</h2>
      <p>
        Your browser frontend must not call <code>POST /api/v1/checkout/sessions</code> directly.
        Checkout session creation belongs on the merchant backend only because it uses merchant API
        credentials, signed headers, and allowlist validation against the real calling server/domain/IP.
      </p>
      <ul>
        <li>Creating checkout sessions must happen from the merchant backend.</li>
        <li>The merchant backend server/domain/IP must be approved in ZitoPay.</li>
        <li>Sending <code>x-zito-origin</code> alone is not enough if the real request comes from the wrong place.</li>
      </ul>

      <h2>When to Use Hosted Checkout</h2>
      <p>
        Use Hosted Checkout for ecommerce and customer-facing payment flows where ZitoPay should own
        the payment page. Direct collection APIs are still available for approved server-to-server
        integrations, but Hosted Checkout is the recommended browser checkout flow.
      </p>

      <h2>Flow</h2>
      <CodeBlock
        language="text"
        code={`Merchant backend
  -> POST /api/v1/checkout/sessions with API key + HMAC signature
  -> receives checkoutSession.checkoutUrl
Merchant website
  -> redirects customer to https://checkout.zitopay.co/pay/:checkoutSessionId
ZitoPay hosted page
  -> loads session, collects payer details, submits payment, polls status
  -> redirects to successUrl/cancelUrl when backend returns redirectUrl`}
      />
      <ol>
        <li>Your backend creates a checkout session with your API key and HMAC signature.</li>
        <li>ZitoPay returns a <code>checkoutUrl</code>.</li>
        <li>Your site redirects the customer to that URL.</li>
        <li>The customer selects MTN MoMo or Orange Money and enters payment details.</li>
        <li>ZitoPay starts the collection and polls/verifies status.</li>
        <li>ZitoPay redirects to your success or cancel URL when available.</li>
      </ol>

      <h2>Hosted Checkout URL</h2>
      <p>
        Backend returns a hosted <code>checkoutUrl</code> in the format
        <code>{` {CHECKOUT_BASE_URL}/pay/{checkoutSessionId}`}</code>.
      </p>
      <CodeBlock
        language="text"
        code={`https://checkout.zitopay.co/pay/<sessionId>
http://localhost:3001/pay/<sessionId>`}
      />
      <p>
        The public hosted-page route in this frontend is therefore <code>/pay/:checkoutSessionId</code>.
      </p>

      <h2>Routes Summary</h2>
      <ul>
        <li><code>POST /api/v1/checkout/sessions</code></li>
        <li><code>GET /api/v1/checkout/sessions/:id</code></li>
        <li><code>GET /public/v1/checkout/sessions/:id</code></li>
        <li><code>POST /public/v1/checkout/sessions/:id/pay</code></li>
        <li><code>GET /public/v1/checkout/sessions/:id/status</code></li>
      </ul>

      <h2>Backend Migration</h2>
      <p>
        Hosted Checkout uses the <code>checkout_sessions</code> table from
        <code>migrations/013_add_checkout_sessions.sql</code>. Local development has already been
        updated with <code>npm run db:push</code> on April 23, 2026. For any other environment, run
        the migration or DB push before testing if that environment does not already have the table.
      </p>

      <h2>Create a Session</h2>
      <p>
        This route is server-to-server only. Never call it from the customer browser and never expose
        your merchant secret key.
      </p>
      <CodeBlock
        language="http"
        code={`POST /api/v1/checkout/sessions
Content-Type: application/json
x-zito-key: <merchant_api_key>
x-zito-timestamp: <unix_ms>
x-zito-nonce: <unique_nonce>
x-zito-origin: <merchant_origin>
x-zito-signature: <hmac_signature>
x-zito-version: 1.0`}
      />
      <CodeBlock
        language="json"
        code={`{
  "amount": "5000",
  "currency": "XAF",
  "description": "Order #1001",
  "gateways": ["MTN_MOMO", "ORANGE_MONEY"],
  "expiresInMinutes": 30,
  "successUrl": "https://merchant.example.com/pay/success",
  "cancelUrl": "https://merchant.example.com/pay/cancel",
  "webhookUrl": "https://merchant.example.com/webhooks/zitopay",
  "metadata": {
    "orderId": "ORDER-1001",
    "cartId": "CART-22"
  },
  "customer": {
    "name": "Customer Name",
    "email": "customer@example.com",
    "phone": "2376XXXXXXXX"
  }
}`}
      />

      <h3>Request Notes</h3>
      <ul>
        <li><code>amount</code> is the product or order amount before fee calculation.</li>
        <li><code>currency</code> must be a 3-letter code such as <code>XAF</code>.</li>
        <li><code>gateways</code> is optional and defaults to MTN MoMo and Orange Money.</li>
        <li><code>expiresInMinutes</code> is optional and defaults to <code>30</code>.</li>
        <li><code>successUrl</code>, <code>cancelUrl</code>, and <code>webhookUrl</code> must be valid HTTP or HTTPS URLs when provided.</li>
        <li><code>metadata</code> is returned in checkout webhooks and status responses.</li>
        <li><code>customer</code> is optional and can prefill hosted checkout fields.</li>
      </ul>

      <h3>Security Notes</h3>
      <ul>
        <li>This route uses merchant API key lookup and environment detection from the API key.</li>
        <li>Timestamp and nonce replay protection are enforced.</li>
        <li>HMAC signature validation is required.</li>
        <li>IP/domain allowlist validation is required.</li>
        <li>If the merchant uses the wrong real server, domain, or IP, session creation can fail with <code>403 Access Forbidden</code>.</li>
      </ul>

      <h2>Success Response</h2>
      <CodeBlock
        language="json"
        code={`{
  "checkoutSession": {
    "id": "checkout-session-uuid",
    "checkoutUrl": "https://checkout.zitopay.co/pay/checkout-session-uuid",
    "amount": "5000.00",
    "currency": "XAF",
    "description": "Order #1001",
    "gateways": ["MTN_MOMO", "ORANGE_MONEY"],
    "environment": "production",
    "status": "PENDING",
    "payable": true,
    "successUrl": "https://merchant.example.com/pay/success",
    "cancelUrl": "https://merchant.example.com/pay/cancel",
    "metadata": {
      "orderId": "ORDER-1001"
    },
    "selectedGateway": null,
    "payerName": "Customer Name",
    "payerEmail": "customer@example.com",
    "payerMsisdn": "2376XXXXXXXX",
    "transactionId": null,
    "gatewayReference": null,
    "failureReason": null,
    "redirectUrl": null,
    "expiresAt": "2026-04-23T10:30:00.000Z",
    "createdAt": "2026-04-23T10:00:00.000Z",
    "updatedAt": "2026-04-23T10:00:00.000Z"
  }
}`}
      />
      <p>
        Your backend should return <code>checkoutSession.checkoutUrl</code> to your website, and
        your website should redirect the customer there. Your frontend should never expose the
        merchant secret key.
      </p>

      <h2>Merchant Backend Can Fetch the Session Again</h2>
      <p>
        Merchant backends can also fetch the latest mapped status for a session using:
        <code> GET /api/v1/checkout/sessions/:id</code>.
      </p>
      <ul>
        <li>This route is protected by the same API gateway and allowlist rules.</li>
        <li>It returns only the merchant&apos;s own session.</li>
        <li>Document it as a merchant-backend helper route, not as a public customer route.</li>
      </ul>

      <h2>Public Checkout Page Endpoints</h2>
      <p>The hosted page uses these public endpoints. They do not require bearer auth.</p>
      <ul>
        <li><code>GET /public/v1/checkout/sessions/:id</code> loads the session.</li>
        <li><code>POST /public/v1/checkout/sessions/:id/pay</code> starts payment.</li>
        <li><code>GET /public/v1/checkout/sessions/:id/status</code> polls final status.</li>
      </ul>

      <h3>Load Session Response</h3>
      <CodeBlock
        language="json"
        code={`{
  "checkoutSession": {
    "id": "checkout-session-uuid",
    "merchantName": "Merchant Business Name",
    "merchantLogoUrl": "https://signed-logo-url",
    "checkoutUrl": "https://checkout.zitopay.co/pay/checkout-session-uuid",
    "amount": "5000.00",
    "currency": "XAF",
    "description": "Order #1001",
    "gateways": ["MTN_MOMO", "ORANGE_MONEY"],
    "environment": "production",
    "status": "PENDING",
    "payable": true,
    "metadata": {
      "orderId": "ORDER-1001"
    },
    "selectedGateway": null,
    "payerName": null,
    "payerEmail": null,
    "payerMsisdn": null,
    "payerComment": null,
    "transactionId": null,
    "gatewayReference": null,
    "failureReason": null,
    "redirectUrl": null,
    "expiresAt": "2026-04-23T10:30:00.000Z"
  }
}`}
      />

      <h3>Hosted Page Display Rules</h3>
      <ul>
        <li>Show <code>merchantLogoUrl</code> at the top when present.</li>
        <li>When the logo is missing, fall back to merchant name or default ZitoPay branding.</li>
        <li>If <code>payable</code> is false or status is not <code>PENDING</code>, disable the form and show the matching state.</li>
        <li>Treat <code>merchantLogoUrl</code> as temporary because it is a signed URL.</li>
      </ul>

      <h2>Pay Request</h2>
      <CodeBlock
        language="json"
        code={`{
  "gateway": "MTN_MOMO",
  "payer": {
    "msisdn": "2376XXXXXXXX",
    "name": "Customer Name",
    "email": "customer@example.com"
  },
  "comment": "Please deliver after 5 PM",
  "idempotencyKey": "optional-client-generated-key"
}`}
      />

      <h3>Pay Response</h3>
      <CodeBlock
        language="json"
        code={`{
  "checkoutSession": {
    "id": "checkout-session-uuid",
    "status": "PROCESSING",
    "selectedGateway": "MTN_MOMO",
    "payerName": "Customer Name",
    "payerEmail": "customer@example.com",
    "payerMsisdn": "2376XXXXXXXX",
    "payerComment": "Please deliver after 5 PM",
    "transactionId": "transaction-uuid",
    "gatewayReference": "gateway-ref",
    "redirectUrl": null
  },
  "quote": {
    "quoteId": "quote-uuid",
    "amount": "5000.00",
    "totalAmount": "5150.00",
    "currency": "XAF",
    "gatewayFee": "100.00",
    "platformFee": "50.00",
    "netToMerchant": "5000.00",
    "expiresAt": "2026-04-23T10:15:00.000Z"
  },
  "transaction": {
    "transactionId": "transaction-uuid",
    "status": "VERIFYING",
    "gatewayReference": "gateway-ref",
    "correlationId": "correlation-id",
    "payerName": "Customer Name",
    "payerEmail": "customer@example.com",
    "payerMsisdn": "2376XXXXXXXX",
    "payerComment": "Please deliver after 5 PM"
  }
}`}
      />

      <h2>Fee Display</h2>
      <p>
        The customer-paid amount is <code>quote.totalAmount</code>. If the merchant fee payer is
        <code>PAYER</code>, it includes gateway/platform fees. If the merchant fee payer is
        <code>MERCHANT</code>, it equals the product amount and fees are deducted from merchant
        settlement or wallet.
      </p>

      <h2>Status and Redirects</h2>
      <p>After payment starts, poll <code>GET /public/v1/checkout/sessions/:id/status</code>.</p>
      <CodeBlock
        language="json"
        code={`{
  "checkoutSession": {
    "id": "checkout-session-uuid",
    "status": "PAID",
    "transactionId": "transaction-uuid",
    "gatewayReference": "gateway-ref",
    "failureReason": null,
    "redirectUrl": "https://merchant.example.com/pay/success?checkout_session_id=checkout-session-uuid&status=paid&transaction_id=transaction-uuid",
    "paidAt": "2026-04-23T10:08:00.000Z"
  }
}`}
      />
      <ul>
        <li><code>PENDING</code>: session created and payment not started.</li>
        <li><code>PROCESSING</code>: gateway request started and verification is running.</li>
        <li><code>PAID</code>: payment succeeded.</li>
        <li><code>FAILED</code>: payment failed.</li>
        <li><code>EXPIRED</code>: session expired before payment started.</li>
        <li><code>CANCELLED</code>: reserved for cancel flows.</li>
      </ul>
      <p>
        When the backend returns <code>redirectUrl</code>, the hosted checkout page redirects the
        customer there after the final status is reached.
      </p>
      <ul>
        <li>For <code>PAID</code>, backend returns the success URL with query params added.</li>
        <li>For <code>FAILED</code>, <code>EXPIRED</code>, or <code>CANCELLED</code>, backend returns the cancel URL when configured.</li>
        <li>If <code>redirectUrl</code> is null, keep the customer on the hosted page and show the final state.</li>
      </ul>

      <h2>Webhook Events</h2>
      <p>Hosted Checkout emits the existing payment webhooks plus checkout-specific events:</p>
      <ul>
        <li><code>payment.succeeded</code></li>
        <li><code>payment.failed</code></li>
        <li><code>checkout.session.paid</code></li>
        <li><code>checkout.session.failed</code></li>
      </ul>

      <h2>Direct Webhook Signature</h2>
      <p>
        Reliable webhook endpoints can subscribe to <code>checkout.session.paid</code> and
        <code>checkout.session.failed</code>. If <code>webhookUrl</code> is passed at session
        creation, backend also attempts a direct signed webhook notification to that URL.
      </p>
      <CodeBlock
        language="json"
        code={`{
  "checkout_session_id": "checkout-session-uuid",
  "merchant_id": "merchant-uuid",
  "transaction_id": "transaction-uuid",
  "amount": "5000.00",
  "currency": "XAF",
  "gateway": "MTN_MOMO",
  "payer_name": "Customer Name",
  "payer_email": "customer@example.com",
  "payer_msisdn": "2376XXXXXXXX",
  "payer_comment": "Please deliver after 5 PM",
  "gateway_reference": "gateway-ref",
  "failure_reason": null,
  "metadata": {
    "orderId": "ORDER-1001"
  },
  "status": "PAID"
}`}
      />
      <CodeBlock
        language="http"
        code={`X-Zito-Event: checkout.session.paid
X-Zito-Timestamp: <unix_ms>
X-Zito-Signature: <hmac_sha256(timestamp + "." + raw_body)>`}
      />
      <p>
        The direct webhook HMAC secret is the merchant secret for the session environment.
      </p>

      <h2>Hosted Page Frontend Checklist</h2>
      <ul>
        <li>Implement the public route <code>/pay/:checkoutSessionId</code>.</li>
        <li>Load the initial session using <code>GET /public/v1/checkout/sessions/:id</code>.</li>
        <li>Show only the enabled gateways returned on the session.</li>
        <li>Collect payer MSISDN, optional name, optional email, and optional comment.</li>
        <li>Submit payment with <code>POST /public/v1/checkout/sessions/:id/pay</code>.</li>
        <li>Show the customer-paid amount from <code>quote.totalAmount</code>.</li>
        <li>Poll <code>GET /public/v1/checkout/sessions/:id/status</code> until a final state.</li>
        <li>Show clear success, failure, and expired states.</li>
        <li>Redirect with the returned <code>redirectUrl</code> when present.</li>
      </ul>

      <h2>Merchant Integration Documentation Checklist</h2>
      <ul>
        <li>Explain that checkout session creation must be done from the merchant backend.</li>
        <li>Explain that browsers must not call <code>POST /api/v1/checkout/sessions</code> directly.</li>
        <li>Explain that merchant API credentials and signing logic must stay server-side.</li>
        <li>Explain that the correct approved server/domain/IP must be used when creating sessions.</li>
        <li>Explain that the wrong domain or IP can cause <code>403 Access Forbidden</code>.</li>
        <li>Explain that the customer-facing payment page is the hosted <code>checkoutUrl</code>.</li>
        <li>Explain that merchants should redirect the customer to <code>checkoutUrl</code>.</li>
        <li>Explain that merchants can use webhooks and/or final redirect URLs for order updates.</li>
        <li>Explain that customer amount confirmation should be based on <code>quote.totalAmount</code>.</li>
      </ul>

      <h2>Security Model</h2>
      <ul>
        <li>The public hosted page does not decide which merchant owns the payment.</li>
        <li>The merchant backend creates the session through the protected API Gateway route.</li>
        <li>Backend derives <code>merchantId</code> and <code>environment</code> from the authenticated API key.</li>
        <li>The public page only receives a checkout session id.</li>
        <li>Backend loads the session from the database and validates status and expiry.</li>
        <li>A session is one-time: once it leaves <code>PENDING</code>, the hosted page cannot start another payment on it.</li>
      </ul>

      <h2>DB Note</h2>
      <p>
        Hosted Checkout uses the <code>checkout_sessions</code> table from
        <code> migrations/013_add_checkout_sessions.sql</code>. Any environment missing that table must
        be migrated before Hosted Checkout can work there.
      </p>
    </div>
  );
}
