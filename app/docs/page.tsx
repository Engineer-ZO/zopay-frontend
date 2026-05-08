"use client";

import Link from "next/link";

export default function DocsHome() {
    return (
        <div>
            <h1>ZitoPay API Documentation</h1>
            <p className="mb-6">
                Welcome to the ZitoPay API documentation. Learn how to integrate mobile money payments into your application with our comprehensive guides and API reference.
            </p>

            <div className="grid md:grid-cols-2 gap-4 my-6">
                <Link
                    href="/docs/getting-started"
                    className="p-4 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                    <h2 className="mb-1.5">Get Started</h2>
                    <p className="text-muted-foreground mb-3">
                        New to ZitoPay? Start here to learn the basics and get your first integration working.
                    </p>
                    <span className="text-xs font-medium text-primary">
                        Get Started →
                    </span>
                </Link>

                <Link
                    href="/docs/collections/overview"
                    className="p-4 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                    <h2 className="mb-1.5">Collections</h2>
                    <p className="text-muted-foreground mb-3">
                        Learn how to accept payments from customers via mobile money.
                    </p>
                    <span className="text-xs font-medium text-primary">
                        View Collections →
                    </span>
                </Link>

                <Link
                    href="/docs/checkout"
                    className="p-4 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                    <h2 className="mb-1.5">Hosted Checkout</h2>
                    <p className="text-muted-foreground mb-3">
                        Create secure checkout sessions from your backend and redirect customers to ZitoPay.
                    </p>
                    <span className="text-xs font-medium text-primary">
                        View Hosted Checkout â†’
                    </span>
                </Link>

                <Link
                    href="/docs/disbursements/overview"
                    className="p-4 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                    <h2 className="mb-1.5">Disbursements</h2>
                    <p className="text-muted-foreground mb-3">
                        Send money to customers, suppliers, or employees via mobile money.
                    </p>
                    <span className="text-xs font-medium text-primary">
                        View Disbursements →
                    </span>
                </Link>

                <Link
                    href="/docs/webhooks/overview"
                    className="p-4 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                    <h2 className="mb-1.5">Webhooks</h2>
                    <p className="text-muted-foreground mb-3">
                        Receive real-time notifications about transaction events.
                    </p>
                    <span className="text-xs font-medium text-primary">
                        View Webhooks →
                    </span>
                </Link>
            </div>

            <h2 className="mt-6 mb-3">Popular Guides</h2>
            <ul className="space-y-1.5">
                <li><Link href="/docs/getting-started/using-the-api" className="text-primary hover:underline">Using the API</Link> - Authentication and API usage</li>
                <li><Link href="/docs/mtn-momo" className="text-primary hover:underline">MTN Mobile Money</Link> - Integration guide for MTN MoMo</li>
                <li><Link href="/docs/orange-money" className="text-primary hover:underline">Orange Money</Link> - Integration guide for Orange Money</li>
            </ul>
        </div>
    );
}
