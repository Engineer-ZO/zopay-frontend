"use client";

import Link from "next/link";

export default function IntroductionPage() {
    return (
        <div>
            <h1>Introduction</h1>
            
            <p className="mb-6">
                ZitoPay provides a unified payment orchestration API to integrate mobile money payments across Cameroon into your applications, supporting both MTN Mobile Money and Orange Money with real-time transaction monitoring and comprehensive financial management.
            </p>

            <h2>What is ZitoPay?</h2>
            <p>
                ZitoPay is a comprehensive payment orchestration platform that simplifies the integration of MTN Mobile Money and Orange Money services. Designed for secure money movement and high-volume transaction processing, ZitoPay is built specifically for businesses operating in Cameroon.
            </p>
            <p>
                Whether you're building an e-commerce platform, a mobile app, or a web service, ZitoPay provides the tools you need to handle payments efficiently and securely.
            </p>

            <h2>Key Platform Features</h2>
            <ul>
                <li><strong>Standardized API</strong> for both collections (C2B) and disbursements (B2C)</li>
                <li><strong>Multi-gateway support</strong> (MTN Mobile Money, Orange Money)</li>
                <li><strong>Quote-based pricing</strong> with locked fees (15-minute expiry)</li>
                <li><strong>Real-time transaction monitoring</strong> and status tracking</li>
                <li><strong>Webhook notifications</strong> for payment status updates</li>
                <li><strong>Wallet management</strong> with double-entry ledger system</li>
                <li><strong>Environment separation</strong> (sandbox and production)</li>
                <li><strong>Comprehensive security</strong> (HMAC signatures, IP/domain allowlisting, rate limiting)</li>
                <li><strong>Fee pricing engine</strong> with configurable rules and merchant overrides</li>
                <li><strong>Settlement and reconciliation</strong> capabilities</li>
                <li><strong>Audit logging</strong> for all financial operations</li>
            </ul>

            <h2>Getting Started</h2>
            <p>
                Once you have a ZitoPay account, you'll have access to the sandbox environment where you can test your integration before going live.
            </p>
            
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 my-6">
                <div className="flex items-start gap-3">
                    <span className="text-blue-700 dark:text-blue-400 text-lg mt-0.5">💡</span>
                    <div className="flex-1 text-sm text-blue-900 dark:text-blue-100">
                        <p className="leading-relaxed">
                            Our sandbox and production environment are completely separated from each other. You can invite anybody into the sandbox portal, they will not get access to any production information as part of the sandbox.
                        </p>
                    </div>
                </div>
            </div>
            
            <p>
                Navigate to your merchant dashboard to retrieve your API keys (sandbox and production). The sandbox and production environments are completely separated - sandbox testing does not affect production data.
            </p>

            <h2>What&apos;s Next</h2>
            <p>
                Ready to start integrating? Follow these guides:
            </p>
            <ul>
                <li>
                    <Link href="/docs/getting-started/implementation-guide" className="text-primary hover:underline">
                        Implementation Guide
                    </Link> - Learn how to set up and configure your ZitoPay integration
                </li>
                <li>
                    <Link href="/docs/getting-started/using-the-api" className="text-primary hover:underline">
                        Using the API
                    </Link> - Understand authentication, headers, and API usage
                </li>
                <li>
                    Detailed API reference is available for specific endpoints in the <Link href="/docs/api-reference" className="text-primary hover:underline">API Reference</Link> section
                </li>
            </ul>
        </div>
    );
}
