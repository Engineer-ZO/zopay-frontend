"use client";

import Link from "next/link";

export default function WebhooksPage() {
    return (
        <div>
            <h1>Webhooks</h1>
            <p>
                Webhooks allow you to receive real-time notifications about transaction events. This section covers everything you need to know about setting up and handling webhooks.
            </p>

            <div className="grid md:grid-cols-2 gap-4 my-6">
                <Link
                    href="/docs/webhooks/overview"
                    className="p-4 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                    <h2 className="mb-1.5">Overview</h2>
                    <p className="text-muted-foreground">
                        Learn how webhooks work and understand the event system.
                    </p>
                </Link>

                <Link
                    href="/docs/webhooks/register"
                    className="p-4 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                    <h2 className="mb-1.5">Register Endpoint</h2>
                    <p className="text-muted-foreground">
                        Set up a webhook endpoint to receive notifications.
                    </p>
                </Link>

                <Link
                    href="/docs/webhooks/events"
                    className="p-4 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                    <h2 className="mb-1.5">Webhook Events</h2>
                    <p className="text-muted-foreground">
                        Learn about all available webhook events.
                    </p>
                </Link>

                <Link
                    href="/docs/webhooks/security"
                    className="p-4 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                    <h2 className="mb-1.5">Webhook Security</h2>
                    <p className="text-muted-foreground">
                        Verify webhook signatures and secure your endpoints.
                    </p>
                </Link>
            </div>
        </div>
    );
}
