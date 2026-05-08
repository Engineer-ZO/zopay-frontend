"use client";

import { useState } from "react";
import {
    Book,
    Code,
    Rocket,
    Key,
    CreditCard,
    FileText,
    Github,
    Download,
    Copy,
    Check,
} from "lucide-react";

export default function DocumentationPage() {
    const [selectedLanguage, setSelectedLanguage] = useState("javascript");
    const [copied, setCopied] = useState(false);

    const codeExamples = {
        javascript: `// Accept a payment
const zitopay = require('zitopay-sdk');

const client = new zitopay({
  apiKey: 'sk_sandbox_...',
  secretKey: 'secret_...'
});

const payment = await client.createPayment({
  amount: 10000,
  currency: 'XAF',
  customer: {
    phone: '+237670123456'
  }
});`,
        python: `# Accept a payment
from zitopay import ZitoPay

client = ZitoPay(
    api_key='sk_sandbox_...',
    secret_key='secret_...'
)

payment = client.create_payment(
    amount=10000,
    currency='XAF',
    customer={
        'phone': '+237670123456'
    }
)`,
        php: `<?php
// Accept a payment
require 'vendor/autoload.php';

$client = new ZitoPay\\Client([
    'api_key' => 'sk_sandbox_...',
    'secret_key' => 'secret_...'
]);

$payment = $client->createPayment([
    'amount' => 10000,
    'currency' => 'XAF',
    'customer' => [
        'phone' => '+237670123456'
    ]
]);`,
        ruby: `# Accept a payment
require 'zitopay'

client = ZitoPay::Client.new(
  api_key: 'sk_sandbox_...',
  secret_key: 'secret_...'
)

payment = client.create_payment(
  amount: 10000,
  currency: 'XAF',
  customer: {
    phone: '+237670123456'
  }
)`,
        curl: `# Accept a payment
curl https://api.zitopay.com/v1/payments \\
  -u sk_sandbox_...:secret_... \\
  -d amount=10000 \\
  -d currency=XAF \\
  -d customer[phone]=+237670123456`,
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(codeExamples[selectedLanguage as keyof typeof codeExamples]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="p-6 space-y-6">
            {/* HEADER */}
            <div>
                <h1 className="text-xl font-bold text-foreground">Documentation</h1>
                <p className="text-xs text-muted-foreground mt-1">
                    Learn how to integrate ZitoPay into your application
                </p>
            </div>

            {/* QUICK START */}
            <div className="bg-background rounded-xl p-6 border border-border">
                <h3 className="text-sm font-semibold text-foreground mb-4">QUICK START</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors">
                        <Rocket className="w-5 h-5 text-orange-600" />
                        <div className="text-left">
                            <p className="text-sm font-semibold text-foreground">Getting Started</p>
                            <p className="text-xs text-muted-foreground">Create your first integration</p>
                        </div>
                    </button>
                    <button className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors">
                        <Key className="w-5 h-5 text-blue-600" />
                        <div className="text-left">
                            <p className="text-sm font-semibold text-foreground">Authentication</p>
                            <p className="text-xs text-muted-foreground">Setup API credentials</p>
                        </div>
                    </button>
                    <button className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors">
                        <CreditCard className="w-5 h-5 text-green-600" />
                        <div className="text-left">
                            <p className="text-sm font-semibold text-foreground">Accept Payments</p>
                            <p className="text-xs text-muted-foreground">Process your first payment</p>
                        </div>
                    </button>
                </div>
            </div>

            {/* API REFERENCE & GUIDES */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* API Reference */}
                <div className="bg-background rounded-xl p-6 border border-border">
                    <div className="flex items-center gap-2 mb-4">
                        <Code className="w-5 h-5 text-purple-600" />
                        <h3 className="text-sm font-semibold text-foreground">API REFERENCE</h3>
                    </div>
                    <ul className="space-y-2 mb-4">
                        <li className="text-xs text-foreground hover:text-orange-600 cursor-pointer">
                            • Authentication
                        </li>
                        <li className="text-xs text-foreground hover:text-orange-600 cursor-pointer">
                            • Collections
                        </li>
                        <li className="text-xs text-foreground hover:text-orange-600 cursor-pointer">
                            • Payouts
                        </li>
                        <li className="text-xs text-foreground hover:text-orange-600 cursor-pointer">
                            • Refunds
                        </li>
                        <li className="text-xs text-foreground hover:text-orange-600 cursor-pointer">
                            • Webhooks
                        </li>
                        <li className="text-xs text-foreground hover:text-orange-600 cursor-pointer">
                            • Errors
                        </li>
                    </ul>
                    <button className="text-xs font-medium text-orange-600 dark:text-orange-400 hover:underline">
                        View API Docs →
                    </button>
                </div>

                {/* Guides */}
                <div className="bg-background rounded-xl p-6 border border-border">
                    <div className="flex items-center gap-2 mb-4">
                        <Book className="w-5 h-5 text-blue-600" />
                        <h3 className="text-sm font-semibold text-foreground">GUIDES</h3>
                    </div>
                    <ul className="space-y-2 mb-4">
                        <li className="text-xs text-foreground hover:text-orange-600 cursor-pointer">
                            • Quick Start Guide
                        </li>
                        <li className="text-xs text-foreground hover:text-orange-600 cursor-pointer">
                            • Accept Payments
                        </li>
                        <li className="text-xs text-foreground hover:text-orange-600 cursor-pointer">
                            • Process Refunds
                        </li>
                        <li className="text-xs text-foreground hover:text-orange-600 cursor-pointer">
                            • Webhooks Setup
                        </li>
                        <li className="text-xs text-foreground hover:text-orange-600 cursor-pointer">
                            • Going to Production
                        </li>
                        <li className="text-xs text-foreground hover:text-orange-600 cursor-pointer">
                            • Security Best Practices
                        </li>
                    </ul>
                    <button className="text-xs font-medium text-orange-600 dark:text-orange-400 hover:underline">
                        View All Guides →
                    </button>
                </div>
            </div>

            {/* CODE EXAMPLES */}
            <div className="bg-background rounded-xl p-6 border border-border">
                <h3 className="text-sm font-semibold text-foreground mb-4">CODE EXAMPLES</h3>

                {/* Language Tabs */}
                <div className="flex gap-2 mb-4 flex-wrap">
                    {["javascript", "python", "php", "ruby", "curl"].map((lang) => (
                        <button
                            key={lang}
                            onClick={() => setSelectedLanguage(lang)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedLanguage === lang
                                    ? "bg-orange-500 text-white"
                                    : "bg-background border border-border text-foreground hover:bg-muted"
                                }`}
                        >
                            {lang.charAt(0).toUpperCase() + lang.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Code Block */}
                <div className="relative">
                    <pre className="bg-muted/50 rounded-lg p-4 overflow-x-auto text-xs font-mono">
                        <code className="text-foreground">
                            {codeExamples[selectedLanguage as keyof typeof codeExamples]}
                        </code>
                    </pre>
                    <button
                        onClick={handleCopy}
                        className="absolute top-3 right-3 px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-semibold hover:bg-muted transition-colors flex items-center gap-2"
                    >
                        {copied ? (
                            <>
                                <Check className="w-3 h-3" />
                                Copied
                            </>
                        ) : (
                            <>
                                <Copy className="w-3 h-3" />
                                Copy Code
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* SDKS & LIBRARIES */}
            <div className="bg-background rounded-xl p-6 border border-border">
                <h3 className="text-sm font-semibold text-foreground mb-4">SDKS & LIBRARIES</h3>

                <div className="space-y-4">
                    <div>
                        <p className="text-xs font-medium text-muted-foreground mb-3">Official SDKs:</p>
                        <div className="space-y-2">
                            {[
                                { name: "JavaScript/Node.js", lang: "javascript" },
                                { name: "Python", lang: "python" },
                                { name: "PHP", lang: "php" },
                                { name: "Ruby", lang: "ruby" },
                            ].map((sdk) => (
                                <div
                                    key={sdk.lang}
                                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                                >
                                    <span className="text-xs font-medium text-foreground">• {sdk.name}</span>
                                    <div className="flex gap-2">
                                        <button className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                                            <Download className="w-3 h-3" />
                                            Download
                                        </button>
                                        <button className="text-xs font-medium text-gray-600 dark:text-gray-400 hover:underline flex items-center gap-1">
                                            <Github className="w-3 h-3" />
                                            GitHub
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                        <p className="text-xs font-medium text-muted-foreground mb-3">Community SDKs:</p>
                        <div className="space-y-2">
                            {["Java", "Go", ".NET"].map((sdk) => (
                                <div
                                    key={sdk}
                                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                                >
                                    <span className="text-xs font-medium text-foreground">• {sdk}</span>
                                    <button className="text-xs font-medium text-gray-600 dark:text-gray-400 hover:underline flex items-center gap-1">
                                        <Github className="w-3 h-3" />
                                        GitHub
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* POPULAR TOPICS */}
            <div className="bg-background rounded-xl p-6 border border-border">
                <h3 className="text-sm font-semibold text-foreground mb-4">POPULAR TOPICS</h3>
                <ol className="space-y-2 mb-4">
                    <li className="text-xs text-foreground hover:text-orange-600 cursor-pointer">
                        1. How to accept mobile money payments
                    </li>
                    <li className="text-xs text-foreground hover:text-orange-600 cursor-pointer">
                        2. Setting up webhooks for payment notifications
                    </li>
                    <li className="text-xs text-foreground hover:text-orange-600 cursor-pointer">
                        3. Processing bulk payouts
                    </li>
                    <li className="text-xs text-foreground hover:text-orange-600 cursor-pointer">
                        4. Handling refunds
                    </li>
                    <li className="text-xs text-foreground hover:text-orange-600 cursor-pointer">
                        5. Testing in sandbox mode
                    </li>
                    <li className="text-xs text-foreground hover:text-orange-600 cursor-pointer">
                        6. Going live with production
                    </li>
                </ol>
                <button className="text-xs font-medium text-orange-600 dark:text-orange-400 hover:underline">
                    View All Topics →
                </button>
            </div>
        </div>
    );
}
