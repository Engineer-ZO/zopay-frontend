"use client";

import Link from "next/link";

export default function ImplementationGuidePage() {
    return (
        <div>
            <h1>Implementation Guide</h1>
            
            <p>
                This guide explains how to set up and configure your ZitoPay integration, including how payment methods work, domain verification, and the payment flow architecture.
            </p>

            <h2>Gateway Configuration</h2>

            <h3>Understanding Gateways</h3>
            <p>
                Payment gateways are the underlying payment methods that ZitoPay supports. Currently, ZitoPay supports two main gateways:
            </p>
            <ul>
                <li><strong>MTN_MOMO</strong> - MTN Mobile Money</li>
                <li><strong>ORANGE_MONEY</strong> - Orange Money</li>
            </ul>
            <p>
                Each merchant account is enabled for the payment methods agreed with ZitoPay (typically MTN Mobile Money and/or Orange Money). Gateway availability and limits are managed by ZitoPay operations—not via a self-service screen in the dashboard.
            </p>

            <h3>Configuring a Gateway</h3>
            <p>
                If you need to change which gateways are enabled or adjust transaction limits, contact <strong>Help &amp; Support</strong> from your merchant dashboard. The team will update your account configuration.
            </p>

            <h2>Domain Verification</h2>

            <h3>Why Domain Verification?</h3>
            <p>
                Domain verification is a security feature that proves you own the domain you're claiming. It's required for production API access and prevents unauthorized domains from using your API keys. Only verified domains can be used in the <code>x-zito-origin</code> header.
            </p>

            <h3>Domain Verification Process</h3>
            
            <div className="bg-deep-blue-violet-50 dark:bg-deep-blue-violet-900/10 border border-deep-blue-violet-200 dark:border-deep-blue-violet-800 rounded-lg p-4 my-6">
                <div className="flex items-start gap-3">
                    <span className="text-deep-blue-violet-700 dark:text-deep-blue-violet-400 text-lg mt-0.5">💡</span>
                    <div className="flex-1 text-sm text-deep-blue-violet-900 dark:text-deep-blue-violet-100">
                        <p className="leading-relaxed">
                            Our sandbox and production environment are completely separated from each other. You can invite anybody into the sandbox portal, they will not get access to any production information as part of the sandbox.
                        </p>
                    </div>
                </div>
            </div>
            
            <div className="bg-deep-blue-violet-50 dark:bg-deep-blue-violet-900/10 border border-deep-blue-violet-200 dark:border-deep-blue-violet-800 rounded-lg p-4 my-6">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <span>📦</span> Domain Verification Steps
                </h4>
                <ol className="space-y-3 list-decimal list-inside text-sm">
                    <li className="font-medium">Add Your Domain
                        <ul className="list-disc list-inside ml-5 mt-1.5 font-normal text-sm">
                            <li>Navigate to Domain Settings in your merchant dashboard</li>
                            <li>Enter your domain (e.g., example.com)</li>
                            <li>Click &quot;Add Domain&quot;</li>
                            <li>You&apos;ll receive a verification token</li>
                        </ul>
                    </li>
                    <li className="font-medium">Add DNS TXT Record
                        <ul className="list-disc list-inside ml-5 mt-1.5 font-normal text-sm">
                            <li>Log into your domain&apos;s DNS provider (GoDaddy, Cloudflare, Namecheap, etc.)</li>
                            <li><strong>Important for Vercel users:</strong> You cannot add DNS records to Vercel domains (*.vercel.app). You must use a custom domain and add the TXT record at your domain registrar (where you bought the domain), not in Vercel&apos;s DNS settings.</li>
                            <li>Add a new TXT record:
                                <ul className="list-none ml-3 mt-1 space-y-0.5 text-sm">
                                    <li>• <strong>Name:</strong> <code>_zitopay</code></li>
                                    <li>• <strong>Type:</strong> TXT</li>
                                    <li>• <strong>Value:</strong> [your verification token]</li>
                                    <li>• <strong>TTL:</strong> 3600 (or default)</li>
                                </ul>
                            </li>
                        </ul>
                    </li>
                    
                    <div className="bg-crimson-red-50 dark:bg-crimson-red-900/10 border border-crimson-red-200 dark:border-crimson-red-800 rounded-lg p-4 my-4">
                        <div className="flex items-start gap-3">
                            <span className="text-crimson-red-700 dark:text-crimson-red-400 text-lg mt-0.5">💡</span>
                            <div className="flex-1 text-sm text-crimson-red-900 dark:text-crimson-red-100">
                                <p className="leading-relaxed">
                                    <strong>About TTL:</strong> TTL (Time To Live) determines how long DNS servers cache the record. A TTL of 3600 seconds (1 hour) means the record will be cached for 1 hour. After the TTL expires, the record can still be verified - TTL only affects caching, not the record&apos;s validity. You can verify your domain at any time after adding the DNS record, regardless of TTL.
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <li className="font-medium">Wait for DNS Propagation
                        <ul className="list-disc list-inside ml-5 mt-1.5 font-normal text-sm">
                            <li><strong>Important:</strong> DNS changes can take 15-30 minutes (sometimes up to 48 hours) to propagate globally</li>
                            <li><strong>You must wait before clicking &quot;Verify Domain&quot;</strong> - if you click too soon, verification will fail</li>
                            <li><strong>Test the DNS record first</strong> using online tools (see <Link href="/docs/getting-started/domain-verification" className="text-primary hover:underline">Domain Verification Guide</Link>)</li>
                            <li>You can check if the record has propagated with: <code>nslookup -type=TXT _zitopay.example.com</code></li>
                            <li>Wait at least 15-30 minutes after adding the TXT record before attempting verification</li>
                        </ul>
                    </li>
                    <li className="font-medium">Verify Domain
                        <ul className="list-disc list-inside ml-5 mt-1.5 font-normal text-sm">
                            <li><strong>After waiting 15-30 minutes</strong>, return to your merchant dashboard</li>
                            <li><strong>Test the DNS record first</strong> using online tools (recommended - see <Link href="/docs/getting-started/domain-verification" className="text-primary hover:underline">Domain Verification Guide</Link>)</li>
                            <li>Click &quot;Verify Domain&quot; next to your domain</li>
                            <li>System will automatically check DNS records</li>
                            <li>If token matches → Domain verified ✅</li>
                            <li>If not found → Wait a bit longer (DNS may still be propagating) and try again</li>
                        </ul>
                    </li>
                    <li className="font-medium">Domain Ready
                        <ul className="list-disc list-inside ml-5 mt-1.5 font-normal text-sm">
                            <li>Once verified, you can use this domain in the <code>x-zito-origin</code> header</li>
                            <li>Verified domains are automatically allowlisted</li>
                        </ul>
                    </li>
                </ol>
            </div>

            <h3>Important Notes</h3>
            <ul>
                <li>Only domain owners can add DNS records (proves ownership)</li>
                <li>DNS propagation may take 15-30 minutes</li>
                <li>You can verify multiple domains</li>
                <li>Domain verification is required for production (sandbox may be more lenient)</li>
            </ul>

            <h2>IP Allowlisting (Alternative to Domain Verification)</h2>

            <h3>IP Allowlisting Overview</h3>
            <p>
                IP allowlisting is an alternative security method to domain verification. You can use either IP allowlisting OR domain verification (or both). If you use IP allowlisting, requests must come from allowed IP addresses.
            </p>
            <p>
                This method is particularly useful for server-to-server integrations where domain verification isn't applicable, such as backend services or mobile applications.
            </p>

            <h3>How It Works</h3>
            <p>
                Configure allowed IP addresses or CIDR ranges in your merchant dashboard. Requests from non-allowlisted IPs are rejected with a 403 Forbidden response. This provides an additional layer of security by ensuring only requests from your known servers can access your API.
            </p>

            <h2>Understanding the Payment Flow</h2>

            <h3>Quote-Based System</h3>
            <p>
                All payments in ZitoPay start with creating a quote. The quote locks in fees for 15 minutes, ensuring you know exactly what you'll be charged. The quote must be used before expiry, and each quote can only be used once.
            </p>
            <p>
                This quote-based approach provides price certainty and prevents fee fluctuations during the payment process.
            </p>

            <h3>Transaction States</h3>
            <p>
                Transactions in ZitoPay go through several states:
            </p>
            <ul>
                <li><strong>PENDING</strong> - Transaction has been initiated</li>
                <li><strong>PROCESSING</strong> - Transaction is being processed by the gateway</li>
                <li><strong>VERIFYING</strong> - Transaction is being verified</li>
                <li><strong>SUCCESS</strong> - Transaction completed successfully</li>
                <li><strong>FAILED</strong> - Transaction failed (check error details)</li>
            </ul>
            <p>
                Transactions are asynchronous, meaning the API returns immediately after accepting the request. You should use webhooks or polling to check the final status of your transactions.
            </p>

            <h3>Idempotency</h3>
            <p>
                Use unique idempotency keys for each transaction. This prevents duplicate payments if a request is retried due to network issues or timeouts. The idempotency key must be unique per quote and helps ensure that retrying a request doesn't result in multiple charges.
            </p>

            <h2>Security Best Practices</h2>
            <ul>
                <li>Protect your API keys and secret keys - never commit them to version control</li>
                <li>Use HTTPS for all API requests</li>
                <li>Implement proper error handling and retry logic</li>
                <li>Monitor your API usage and set up alerts for unusual activity</li>
                <li>Set up webhooks for real-time notifications</li>
                <li>Test thoroughly in sandbox before moving to production</li>
                <li>Keep your secret keys secure and rotate them periodically</li>
                <li>Use IP allowlisting or domain verification for additional security</li>
            </ul>

            <h2>Next Steps</h2>
            <p>
                Now that you understand the setup process, learn how to use the API:
            </p>
            <ul>
                <li>
                    <Link href="/docs/getting-started/domain-verification" className="text-primary hover:underline">
                        Domain Verification Guide
                    </Link> - Complete guide to verifying your domain for production
                </li>
                <li>
                    <Link href="/docs/getting-started/using-the-api" className="text-primary hover:underline">
                        Using the API
                    </Link> - Learn about authentication, headers, and making requests
                </li>
                <li>
                    <Link href="/docs/collections" className="text-primary hover:underline">
                        Collections Documentation
                    </Link> - Learn how to accept payments
                </li>
                <li>
                    <Link href="/docs/disbursements" className="text-primary hover:underline">
                        Disbursements Documentation
                    </Link> - Learn how to send payments
                </li>
            </ul>
        </div>
    );
}
