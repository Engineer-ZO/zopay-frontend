"use client";

import Link from "next/link";

export default function UsingTheAPIPage() {
    return (
        <div>
            <h1>Using the API</h1>
            
            <p>
                This guide explains how to authenticate your requests and use the ZitoPay API effectively, including understanding required headers and generating signatures.
            </p>

            <h2>API Environments</h2>

            <h3>Environment Separation</h3>
            <p>
                Sandbox and production environments are completely isolated. They have different base URLs, different API keys, and separate data. What you do in sandbox does not affect production, and vice versa.
            </p>

            <h3>Base URLs</h3>
            <div className="bg-muted/50 border border-border rounded-lg p-3 my-4">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="text-left py-1.5 pr-4 font-medium">Environment</th>
                            <th className="text-left py-1.5 font-medium">Base URL</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="py-1.5 pr-4">Sandbox</td>
                            <td className="py-1.5"><code className="text-xs">http://localhost:9000</code></td>
                        </tr>
                        <tr>
                            <td className="py-1.5 pr-4">Production</td>
                            <td className="py-1.5"><code className="text-xs">https://api.zitopay.com</code></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p className="text-xs text-muted-foreground">
                <strong>Note:</strong> Update base URLs based on actual deployment configuration.
            </p>

            <h2>Authentication</h2>

            <h3>API Key Authentication</h3>
            <p>
                ZitoPay uses API key authentication with HMAC-SHA256 signatures. This is not JWT tokens (those are for merchant dashboard access). Each request must include your API key and a valid signature.
            </p>
            <p>
                This authentication method ensures that:
            </p>
            <ul>
                <li>Only you can make requests with your API key</li>
                <li>Requests cannot be tampered with (signature validation)</li>
                <li>Requests cannot be replayed (timestamp and nonce validation)</li>
            </ul>

            <h3>Getting Your API Keys</h3>
            <ol>
                <li>Navigate to your merchant dashboard</li>
                <li>Go to <strong>API Settings</strong> or <strong>Credentials</strong> section</li>
                <li>Copy your sandbox API key and secret key</li>
                <li>For production, complete KYC and request production access</li>
                <li>Save your secret key securely - it&apos;s only shown once!</li>
            </ol>
            
            <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-lg p-4 my-6">
                <div className="flex items-start gap-3">
                    <span className="text-orange-700 dark:text-orange-400 text-lg mt-0.5">💡</span>
                    <div className="flex-1 text-sm text-orange-900 dark:text-orange-100">
                        <p className="leading-relaxed">
                            This key will authenticate your requests to the sandbox environment only and <strong>should not</strong> be used in production. Production API keys are separate and only available after completing KYC verification and requesting production access.
                        </p>
                    </div>
                </div>
            </div>

            <h2>Required Headers</h2>

            <h3>Overview</h3>
            <p>
                Every request to <code>/api/v1/*</code> endpoints must include these 6 headers. Think of headers as labels on a package - they tell the API who you are, when the request was made, and prove it&apos;s authentic.
            </p>

            <h3>Header Details</h3>

            <h4>x-zito-key</h4>
            <p>
                Your merchant API key (sandbox or production). This identifies which merchant is making the request - like your ID card, it proves who you are. Retrieved from your merchant dashboard.
            </p>

            <h4>x-zito-timestamp</h4>
            <p>
                Current Unix timestamp in seconds. Must be within ±5 minutes of server time. This prevents replay attacks (using old requests). Example: <code>1705564800</code>
            </p>

            <h4>x-zito-nonce</h4>
            <p>
                Unique random string (UUID recommended). Each request must have a different nonce. This prevents duplicate request attacks. Cannot be reused within 10 minutes. Example: <code>550e8400-e29b-41d4-a716-446655440000</code>
            </p>

            <h4>x-zito-origin</h4>
            <p>
                Your application&apos;s origin URL or IP address. Must match a verified domain OR allowed IP. Used for allowlisting validation. Example: <code>https://example.com</code> or <code>192.168.1.1</code>
            </p>

            <h4>x-zito-signature</h4>
            <p>
                HMAC-SHA256 signature of the request. Generated using your secret key. This proves the request is authentic and hasn&apos;t been tampered with. See &quot;Signature Generation&quot; section below.
            </p>

            <h4>x-zito-version</h4>
            <p>
                API version you&apos;re using. Currently: <code>&quot;1.0&quot;</code>. This allows for future API versioning while maintaining backward compatibility.
            </p>

            <h2>Signature Generation</h2>

            <h3>Why Signatures?</h3>
            <p>
                Signatures serve three critical purposes:
            </p>
            <ul>
                <li>Proves the request really came from you (authentication)</li>
                <li>Prevents tampering (if request is changed, signature won&apos;t match)</li>
                <li>Prevents forgery (only you have the secret key)</li>
            </ul>

            <h3>How to Generate</h3>
            <p>
                To generate a signature, you need to:
            </p>
            <ol>
                <li>Construct a canonical string from: <code>method + path + sorted_query + body_json + timestamp + nonce + origin</code></li>
                <li>Generate HMAC-SHA256 using your secret key</li>
                <li>Include the signature in <code>x-zito-signature</code> header</li>
            </ol>

            <h3>Signature Formula</h3>
            <div className="bg-muted/50 border border-border rounded-lg p-3 my-4">
                <p className="font-mono text-xs">
                    stringToSign = METHOD + PATH + SORTED_QUERY_PARAMS + REQUEST_BODY + TIMESTAMP + NONCE + ORIGIN
                </p>
                <p className="mt-2 font-mono text-xs">
                    signature = HMAC-SHA256(secretKey, stringToSign)
                </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4 my-4">
                <div className="flex items-start gap-3">
                    <span className="text-red-700 dark:text-red-400 text-lg mt-0.5">⚠️</span>
                    <div className="flex-1 text-sm text-red-900 dark:text-red-100">
                        <p className="font-semibold mb-2">Critical Formatting Rules</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li><strong>NO separators:</strong> All components must be concatenated directly without newlines, spaces, or special characters</li>
                            <li><strong>NO prefix:</strong> The signature header must contain ONLY the hexadecimal hash (no <code>sha256=</code> prefix)</li>
                            <li><strong>Query sorting:</strong> Query parameters must be sorted alphabetically before inclusion</li>
                            <li><strong>Canonical JSON:</strong> Body must be stringified consistently (same format for signature and request)</li>
                        </ul>
                    </div>
                </div>
            </div>
            <p>
                The exact format must match precisely. Code examples with detailed implementations are provided in the <Link href="/docs/authentication" className="text-primary hover:underline">Authentication documentation</Link>. It&apos;s crucial that the string construction matches exactly, including the order of components and how query parameters are sorted. Even small formatting differences will cause authentication failures in both sandbox and production environments.
            </p>

            <h2>Request Flow</h2>

            <h3>Typical Request Flow</h3>
            <ol>
                <li>Prepare your request body</li>
                <li>Generate timestamp and nonce</li>
                <li>Construct canonical string</li>
                <li>Generate HMAC signature</li>
                <li>Include all headers</li>
                <li>Send request</li>
                <li>Handle response</li>
            </ol>

            <h3>Response Handling</h3>
            <p>
                ZitoPay uses standard HTTP status codes:
            </p>
            <ul>
                <li><strong>2xx:</strong> Success - Your request was processed successfully</li>
                <li><strong>4xx:</strong> Client error - Check your request (authentication, validation, etc.)</li>
                <li><strong>5xx:</strong> Server error - Retry later (these are rare)</li>
            </ul>
            <p>
                Always implement proper error handling to gracefully manage different response scenarios.
            </p>

            <h2>Rate Limiting</h2>

            <h3>Overview</h3>
            <p>
                The API implements rate limiting for stability and fair usage. Default rate limit is 100 requests per minute per merchant, but this is configurable per merchant based on your needs.
            </p>

            <h3>Rate Limit Responses</h3>
            <p>
                When rate limit is exceeded, you&apos;ll receive a <code>429 Too Many Requests</code> response. The response includes a <code>retry_after</code> header indicating how many seconds to wait before retrying. Implement exponential backoff when handling rate limit responses.
            </p>

            <h2>Security Features</h2>

            <h3>IP/Domain Allowlisting</h3>
            <p>
                Requests must come from allowlisted IPs OR verified domains. Configure this in your merchant dashboard. This provides an additional security layer by ensuring only requests from your known sources can access your API.
            </p>

            <h3>Timestamp Validation</h3>
            <p>
                Prevents replay attacks. Requests older than 5 minutes are rejected. This ensures that even if someone intercepts your request, they can&apos;t use it later.
            </p>

            <h3>Nonce Validation</h3>
            <p>
                Prevents duplicate requests. Each nonce can only be used once within a 10-minute window. This protects against accidental or malicious duplicate submissions.
            </p>
            
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 my-6">
                <div className="flex items-start gap-3">
                    <span className="text-blue-700 dark:text-blue-400 text-lg mt-0.5">💡</span>
                    <div className="flex-1 text-sm text-blue-900 dark:text-blue-100">
                        <p className="leading-relaxed">
                            <strong>Important:</strong> If you retry a request with the same nonce within 10 minutes, it will be rejected. Always generate a new nonce (UUID recommended) for each API request, even if you&apos;re retrying a failed request.
                        </p>
                    </div>
                </div>
            </div>

            <h3>Signature Verification</h3>
            <p>
                All signatures are verified using constant-time comparison (prevents timing attacks). Invalid signatures are rejected immediately. This ensures that only requests with valid signatures from the correct secret key are accepted.
            </p>

            <h2>Best Practices</h2>
            <ul>
                <li>Always use HTTPS in production</li>
                <li>Store API keys securely (never in client-side code)</li>
                <li>Generate unique nonces for each request</li>
                <li>Handle all error responses gracefully</li>
                <li>Implement retry logic for transient errors (with exponential backoff)</li>
                <li>Monitor your API usage and set up alerts</li>
                <li>Test in sandbox before production</li>
                <li>Keep your secret keys secure and rotate them periodically</li>
                <li>Use IP allowlisting or domain verification for additional security</li>
            </ul>

            <h2>Next Steps</h2>
            <p>
                Now that you understand how to authenticate and make requests, explore the specific API endpoints:
            </p>
            <ul>
                <li>
                    <Link href="/docs/collections" className="text-primary hover:underline">
                        Collection API Documentation
                    </Link> - Learn how to accept payments from customers
                </li>
                <li>
                    <Link href="/docs/disbursements" className="text-primary hover:underline">
                        Disbursement API Documentation
                    </Link> - Learn how to send payments to customers
                </li>
                <li>
                    <Link href="/docs/collections/status" className="text-primary hover:underline">
                        Transaction Status Documentation
                    </Link> - Learn how to check transaction status
                </li>
                <li>
                    <Link href="/docs/webhooks" className="text-primary hover:underline">
                        Webhooks Documentation
                    </Link> - Learn how to receive real-time notifications
                </li>
            </ul>
        </div>
    );
}
