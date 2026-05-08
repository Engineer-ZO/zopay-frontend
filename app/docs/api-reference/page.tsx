"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { ArrowRight, ExternalLink } from "lucide-react";

interface Endpoint {
    method: string;
    path: string;
    description: string;
    category: string;
    link?: string;
}

const endpoints: Endpoint[] = [
    // Collections
    {
        method: "POST",
        path: "/api/v1/wallets/quote",
        description: "Create a quote for a collection or disbursement transaction",
        category: "Collections",
        link: "/docs/collections/create-quote",
    },
    {
        method: "POST",
        path: "/api/v1/wallets/collect",
        description: "Execute a collection (receive payment from customer)",
        category: "Collections",
        link: "/docs/collections/execute",
    },
    {
        method: "GET",
        path: "/api/v1/wallets/transactions/:id",
        description: "Get transaction status and details",
        category: "Collections",
        link: "/docs/collections/status",
    },
    // Disbursements
    {
        method: "POST",
        path: "/api/v1/disbursements/execute",
        description: "Execute a disbursement (send payment to recipient)",
        category: "Disbursements",
        link: "/docs/disbursements/execute",
    },
    {
        method: "GET",
        path: "/api/v1/disbursements/:id",
        description: "Get disbursement status and details",
        category: "Disbursements",
        link: "/docs/disbursements/get-status",
    },
    {
        method: "GET",
        path: "/api/v1/disbursements",
        description: "List all disbursements with filters and pagination",
        category: "Disbursements",
        link: "/docs/disbursements/list-payouts",
    },
    {
        method: "POST",
        path: "/api/v1/disbursements/bulk",
        description: "Process multiple disbursements from a CSV file",
        category: "Disbursements",
        link: "/docs/disbursements/bulk-payouts",
    },
    // Refunds
    {
        method: "POST",
        path: "/api/v1/refunds",
        description: "Create a refund for a completed transaction",
        category: "Refunds",
        link: "/docs/refunds",
    },
    {
        method: "GET",
        path: "/api/v1/refunds/:id",
        description: "Get refund status and details",
        category: "Refunds",
        link: "/docs/refunds",
    },
    // Wallet
    {
        method: "GET",
        path: "/wallet/summary",
        description: "Get wallet balance summary and overview",
        category: "Wallet",
    },
    {
        method: "GET",
        path: "/wallet/activity",
        description: "Get recent wallet activity and transactions",
        category: "Wallet",
    },
];

const categories = ["Collections", "Disbursements", "Refunds", "Wallet"];

export default function ApiReferencePage() {
    const getMethodColor = (method: string) => {
        switch (method) {
            case "GET":
                return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
            case "POST":
                return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20";
            case "PUT":
                return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20";
            case "DELETE":
                return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
            default:
                return "bg-muted text-muted-foreground border-border";
        }
    };

    return (
        <div>
            <h1>API Reference</h1>
            <p className="mb-6">
                Complete reference documentation for all ZitoPay API endpoints. All endpoints require authentication using API keys and HMAC signatures.
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 my-6">
                <div className="flex items-start gap-3">
                    <span className="text-blue-700 dark:text-blue-400 text-lg mt-0.5">💡</span>
                    <div className="flex-1 text-sm text-blue-900 dark:text-blue-100">
                        <p className="leading-relaxed">
                            <strong>Base URLs:</strong> Sandbox: <code>http://localhost:9000</code> | Production: <code>https://api.zitopay.com</code>. All <code>/api/v1/*</code> endpoints require the 6 authentication headers. See <Link href="/docs/getting-started/using-the-api" className="text-blue-700 dark:text-blue-400 hover:underline font-medium">Using the API</Link> for details.
                        </p>
                    </div>
                </div>
            </div>

            <h2>Authentication</h2>
            <p>
                All <code>/api/v1/*</code> endpoints require the following headers:
            </p>
            <ul>
                <li><code>x-zito-key</code> - Your API key</li>
                <li><code>x-zito-timestamp</code> - Unix timestamp in seconds</li>
                <li><code>x-zito-nonce</code> - Unique random string (UUID recommended)</li>
                <li><code>x-zito-origin</code> - Your verified domain or allowed IP</li>
                <li><code>x-zito-signature</code> - HMAC-SHA256 signature</li>
                <li><code>x-zito-version</code> - API version (&quot;1.0&quot;)</li>
            </ul>
            <p>
                For detailed authentication instructions, see <Link href="/docs/getting-started/using-the-api" className="text-primary hover:underline">Using the API</Link>.
            </p>

            {categories.map((category) => {
                const categoryEndpoints = endpoints.filter((ep) => ep.category === category);
                if (categoryEndpoints.length === 0) return null;

                return (
                    <div key={category} className="mb-10">
                        <h2 className="mb-4">{category}</h2>
                        <div className="space-y-3">
                            {categoryEndpoints.map((endpoint, index) => (
                                <div
                                    key={index}
                                    className="bg-background border border-border rounded-lg p-4 hover:shadow-md transition-all duration-200"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span
                                                    className={`px-2.5 py-1 rounded text-xs font-semibold border ${getMethodColor(
                                                        endpoint.method
                                                    )}`}
                                                >
                                                    {endpoint.method}
                                                </span>
                                                <code className="text-sm font-mono text-foreground break-all">
                                                    {endpoint.path}
                                                </code>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                                        </div>
                                        {endpoint.link && (
                                            <Link
                                                href={endpoint.link}
                                                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors flex-shrink-0"
                                            >
                                                <span>Details</span>
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}

            <h2>Response Codes</h2>
            <div className="bg-muted/50 border border-border rounded-lg p-3 my-4">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="text-left py-1.5 pr-4 font-medium">Code</th>
                            <th className="text-left py-1.5 font-medium">Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="py-1.5 pr-4"><code className="text-xs">200 OK</code></td>
                            <td className="py-1.5">Request successful</td>
                        </tr>
                        <tr>
                            <td className="py-1.5 pr-4"><code className="text-xs">201 Created</code></td>
                            <td className="py-1.5">Resource created successfully</td>
                        </tr>
                        <tr>
                            <td className="py-1.5 pr-4"><code className="text-xs">202 Accepted</code></td>
                            <td className="py-1.5">Request accepted for processing</td>
                        </tr>
                        <tr>
                            <td className="py-1.5 pr-4"><code className="text-xs">400 Bad Request</code></td>
                            <td className="py-1.5">Invalid request parameters</td>
                        </tr>
                        <tr>
                            <td className="py-1.5 pr-4"><code className="text-xs">401 Unauthorized</code></td>
                            <td className="py-1.5">Authentication failed</td>
                        </tr>
                        <tr>
                            <td className="py-1.5 pr-4"><code className="text-xs">403 Forbidden</code></td>
                            <td className="py-1.5">IP/domain not allowlisted or access denied</td>
                        </tr>
                        <tr>
                            <td className="py-1.5 pr-4"><code className="text-xs">404 Not Found</code></td>
                            <td className="py-1.5">Resource not found</td>
                        </tr>
                        <tr>
                            <td className="py-1.5 pr-4"><code className="text-xs">409 Conflict</code></td>
                            <td className="py-1.5">Resource already exists or conflict</td>
                        </tr>
                        <tr>
                            <td className="py-1.5 pr-4"><code className="text-xs">429 Too Many Requests</code></td>
                            <td className="py-1.5">Rate limit exceeded</td>
                        </tr>
                        <tr>
                            <td className="py-1.5 pr-4"><code className="text-xs">500 Internal Server Error</code></td>
                            <td className="py-1.5">Server error</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h2>Rate Limiting</h2>
            <p>
                The default rate limit is 100 requests per minute per merchant. When exceeded, you&apos;ll receive a <code>429 Too Many Requests</code> response with a <code>retry_after</code> header indicating how many seconds to wait.
            </p>

            <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-lg p-4 my-6">
                <div className="flex items-start gap-3">
                    <span className="text-orange-700 dark:text-orange-400 text-lg mt-0.5">💡</span>
                    <div className="flex-1 text-sm text-orange-900 dark:text-orange-100">
                        <p className="leading-relaxed">
                            <strong>Rate Limit Best Practice:</strong> Implement exponential backoff when handling 429 responses. Wait for the duration specified in the <code>retry_after</code> header before retrying your request.
                        </p>
                    </div>
                </div>
            </div>

            <h2>Detailed Documentation</h2>
            <p>
                For detailed endpoint documentation with request/response examples, see:
            </p>
            <ul>
                <li>
                    <Link href="/docs/collections/overview" className="text-primary hover:underline">
                        Collections Documentation
                    </Link> - Complete guide for receiving payments
                </li>
                <li>
                    <Link href="/docs/disbursements/overview" className="text-primary hover:underline">
                        Disbursements Documentation
                    </Link> - Complete guide for sending payments
                </li>
                <li>
                    <Link href="/docs/refunds" className="text-primary hover:underline">
                        Refunds Documentation
                    </Link> - Complete guide for processing refunds
                </li>
                <li>
                    <Link href="/docs/webhooks/overview" className="text-primary hover:underline">
                        Webhooks Documentation
                    </Link> - Real-time event notifications
                </li>
            </ul>
        </div>
    );
}
