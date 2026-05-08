"use client";

import Link from "next/link";

export default function GettingStartedPage() {
    return (
        <div>
            <h1 className="text-4xl font-bold text-foreground mb-4">Getting Started</h1>
            <p className="text-muted-foreground mb-8 text-base">
                Get up and running with ZitoPay in minutes. Follow these guides to integrate mobile money payments into your application.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 my-8">
                <Link
                    href="/docs/getting-started/introduction"
                    className="p-6 bg-card border border-border rounded-lg hover:bg-muted transition-colors block"
                >
                    <h2 className="text-xl font-bold text-foreground mb-2">Introduction</h2>
                    <p className="text-muted-foreground text-sm">
                        Learn about ZitoPay, its features, and use cases.
                    </p>
                </Link>

                <Link
                    href="/docs/getting-started/implementation-guide"
                    className="p-6 bg-card border border-border rounded-lg hover:bg-muted transition-colors block"
                >
                    <h2 className="text-xl font-bold text-foreground mb-2">Implementation Guide</h2>
                    <p className="text-muted-foreground text-sm">
                        Step-by-step guide to integrate ZitoPay into your app.
                    </p>
                </Link>

                <Link
                    href="/docs/getting-started/using-the-api"
                    className="p-6 bg-card border border-border rounded-lg hover:bg-muted transition-colors block"
                >
                    <h2 className="text-xl font-bold text-foreground mb-2">Using the API</h2>
                    <p className="text-muted-foreground text-sm">
                        Understand authentication, environments, and API usage.
                    </p>
                </Link>

                <Link
                    href="/docs/getting-started/domain-verification"
                    className="p-6 bg-card border border-border rounded-lg hover:bg-muted transition-colors block"
                >
                    <h2 className="text-xl font-bold text-foreground mb-2">Domain Verification</h2>
                    <p className="text-muted-foreground text-sm">
                        Learn how to verify your domain for production API access.
                    </p>
                </Link>
            </div>

            <h2 className="mt-8 mb-4">Quick Start</h2>
            <ol className="space-y-2">
                <li>Create a ZitoPay account</li>
                <li>Get your API keys from the dashboard</li>
                <li>Follow the <Link href="/docs/getting-started/implementation-guide" className="text-primary hover:underline">Implementation Guide</Link></li>
                <li>Start testing in the sandbox environment</li>
            </ol>
        </div>
    );
}
