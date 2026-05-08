"use client";

import { motion } from "framer-motion";
import { Terminal, Book, Code2, Zap, ArrowRight, ShieldCheck, Globe } from "lucide-react";
import Link from "next/link";

const resources = [
    {
        icon: Book,
        title: "API Reference",
        description: "Complete reference documentation for the ZitoPay API.",
        link: "/docs/api-reference",
        color: "text-blue-500",
        bg: "bg-blue-500/10"
    },
    {
        icon: Terminal,
        title: "Client SDKs",
        description: "Libraries for Node.js, Python, PHP, and more.",
        link: "/docs/sdks",
        color: "text-orange-500",
        bg: "bg-orange-500/10"
    },
    {
        icon: Zap,
        title: "Webhooks",
        description: "Real-time notifications for payment events.",
        link: "/docs/webhooks",
        color: "text-yellow-500",
        bg: "bg-yellow-500/10"
    },
    {
        icon: ShieldCheck,
        title: "Security Guides",
        description: "Best practices for securing your integration.",
        link: "/docs/security",
        color: "text-green-500",
        bg: "bg-green-500/10"
    }
];

export default function DevelopersPage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative py-24 lg:py-32 overflow-hidden bg-[#0A0A0B]">
                {/* Abstract Code Pattern Background */}
                <div className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: `radial-gradient(#2466eb 1px, transparent 1px)`,
                        backgroundSize: '32px 32px'
                    }}
                />

                <div className="container px-4 md:px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-4xl mx-auto text-center space-y-8"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-sm font-medium">
                            <Code2 className="w-4 h-4" />
                            <span>Developer Experience First</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-white leading-tight">
                            Build the future of <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ef2d10] to-[#2466eb]">
                                digital payments
                            </span>
                        </h1>

                        <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                            Integrate ZitoPay&apos;s robust payment infrastructure into your applications with just a few lines of code.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <Link
                                href="/docs"
                                className="px-8 py-4 bg-[#2466eb] hover:bg-[#1d55c7] text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-500/25 flex items-center gap-2 group"
                            >
                                Read the Docs
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="/dashboard"
                                className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-bold transition-all backdrop-blur-sm"
                            >
                                Get API Keys
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Resources Grid */}
            <section className="py-20 lg:py-32 bg-background relative">
                <div className="container px-4 md:px-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {resources.map((resource, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Link
                                    href={resource.link}
                                    className="block p-6 rounded-2xl border border-border bg-card hover:shadow-xl hover:border-primary/20 transition-all duration-300 group h-full"
                                >
                                    <div className={`w-12 h-12 rounded-xl ${resource.bg} ${resource.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                        <resource.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{resource.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {resource.description}
                                    </p>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Code Preview Section */}
            <section className="py-20 bg-muted/30 border-y border-border">
                <div className="container px-4 md:px-6">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <h2 className="text-3xl md:text-4xl font-bold">
                                Powerful, easy-to-use API
                            </h2>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                We designed our API to be predictable and intuitive. Use standard HTTP verbs and response codes, and authenticate with simple API keys.
                            </p>

                            <ul className="space-y-4">
                                {[
                                    "RESTful API design",
                                    "Predictable resource-oriented URLs",
                                    "JSON-encoded request bodies",
                                    "Standard HTTP response codes"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-600 flex items-center justify-center">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <span className="font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link href="/docs" className="inline-flex items-center text-[#2466eb] font-semibold hover:underline mt-4">
                                Explore full API Reference <ArrowRight className="w-4 h-4 ml-1" />
                            </Link>
                        </div>

                        {/* Code Block */}
                        <div className="bg-[#0A0A0B] rounded-2xl shadow-2xl overflow-hidden border border-white/10">
                            <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                </div>
                                <div className="text-xs text-gray-500 font-mono">Create Payment</div>
                            </div>
                            <div className="p-6 overflow-x-auto">
                                <pre className="font-mono text-sm leading-relaxed text-gray-300">
                                    <code>
                                        {`const response = await fetch('https://api.zitopay.africa/v1/payments', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer sk_test_...',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 5000,
    currency: 'XAF',
    provider: 'MTN_MOMO',
    phone: '+237670000000',
    description: 'Order #12334'
  })
});

const payment = await response.json();`}
                                    </code>
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-background">
                <div className="container px-4 md:px-6">
                    <div className="bg-[#2466eb] rounded-3xl p-12 overflow-hidden relative text-center">
                        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                            <h2 className="text-3xl md:text-4xl font-bold text-white">
                                Ready to start building?
                            </h2>
                            <p className="text-blue-100 text-lg">
                                Create an account and get your API keys in less than 5 minutes.
                            </p>
                            <div className="flex justify-center gap-4 pt-4">
                                <Link
                                    href="/get-started"
                                    className="px-8 py-3 bg-white text-[#2466eb] rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all"
                                >
                                    Create Account
                                </Link>
                            </div>
                        </div>

                        {/* Decorative Circles */}
                        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
                    </div>
                </div>
            </section>
        </div>
    );
}
