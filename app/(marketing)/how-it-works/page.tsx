"use client";

import { motion } from "framer-motion";
import { UserPlus, TestTube, Code2, Rocket, CheckCircle, ArrowRight, Copy, Check } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const steps = [
    {
        number: "01",
        icon: UserPlus,
        title: "Merchant Onboarding",
        subtitle: "Welcome to the Platform",
        description: "Get approved in 24 hours with our streamlined KYB process",
        features: [
            "Simple registration form",
            "Secure document upload",
            "Fast verification process",
            "Dedicated account manager"
        ],
        color: "from-[#ef2d10] to-[#d0260e]",
        iconBg: "bg-[#ef2d10]/10",
        iconColor: "text-[#ef2d10]"
    },
    {
        number: "02",
        icon: TestTube,
        title: "Sandbox Testing",
        subtitle: "Test with Confidence",
        description: "Full-featured sandbox environment that mirrors production perfectly",
        features: [
            "Instant API key generation",
            "Test transaction simulator",
            "Webhook testing tools",
            "Real-time debugging"
        ],
        color: "from-[#2466eb] to-[#1d55c7]",
        iconBg: "bg-[#2466eb]/10",
        iconColor: "text-[#2466eb]"
    },
    {
        number: "03",
        icon: Code2,
        title: "Integration",
        subtitle: "Connect Your Application",
        description: "Simple, well-documented APIs with SDKs for every platform",
        features: [
            "RESTful API design",
            "Comprehensive documentation",
            "Multi-language SDKs",
            "Code examples & tutorials"
        ],
        color: "from-success to-green-600",
        iconBg: "bg-success/10",
        iconColor: "text-success"
    },
    {
        number: "04",
        icon: Rocket,
        title: "Go Live",
        subtitle: "Production Deployment",
        description: "Switch to production with zero configuration changes",
        features: [
            "One-click environment switch",
            "Production API keys",
            "Real-time monitoring",
            "24/7 support access"
        ],
        color: "from-purple-600 to-purple-700",
        iconBg: "bg-purple-600/10",
        iconColor: "text-purple-600"
    }
];

const codeExample = `// Initialize ZitoPay
const zitopay = new ZitoPay({
  apiKey: process.env.ZITOPAY_API_KEY,
  environment: 'sandbox' // or 'production'
});

// Create a payment
const payment = await zitopay.collect({
  amount: "10000",
  currency: "XAF",
  provider: "MTN_MOMO",
  payer: {
    msisdn: "+237670000000"
  },
  reference: "ORDER_12345",
  description: "Payment for order #12345"
});

console.log(payment.status); // PENDING`;

export default function HowItWorksPage() {
    const [copiedCode, setCopiedCode] = useState(false);

    const handleCopyCode = () => {
        navigator.clipboard.writeText(codeExample);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
    };

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-br from-background via-background to-muted/30">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

                <div className="container px-4 md:px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl mx-auto text-center space-y-6"
                    >
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                            The{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ef2d10] to-[#2466eb]">
                                Payment Flow Journey
                            </span>
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            From signup to production in 4 simple steps. No complexity, no surprises.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Steps Section */}
            <section className="py-20 bg-background">
                <div className="container px-4 md:px-6">
                    <div className="max-w-6xl mx-auto space-y-24">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.2 }}
                                className="relative"
                            >
                                {/* Connecting Line */}
                                {index < steps.length - 1 && (
                                    <div className="absolute left-8 top-24 w-0.5 h-full bg-gradient-to-b from-border to-transparent hidden md:block" />
                                )}

                                <div className="grid md:grid-cols-2 gap-12 items-center">
                                    {/* Content */}
                                    <div className={index % 2 === 1 ? "md:order-2" : ""}>
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className={`w-16 h-16 rounded-2xl ${step.iconBg} flex items-center justify-center`}>
                                                <step.icon className={`w-8 h-8 ${step.iconColor}`} />
                                            </div>
                                            <div className={`text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${step.color}`}>
                                                {step.number}
                                            </div>
                                        </div>

                                        <h3 className="text-3xl font-bold mb-2">{step.title}</h3>
                                        <p className="text-lg text-muted-foreground mb-4">{step.subtitle}</p>
                                        <p className="text-foreground mb-6">{step.description}</p>

                                        <ul className="space-y-3">
                                            {step.features.map((feature, i) => (
                                                <li key={i} className="flex items-center gap-3">
                                                    <CheckCircle className={`w-5 h-5 ${step.iconColor}`} />
                                                    <span className="text-muted-foreground">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Visual */}
                                    <div className={index % 2 === 1 ? "md:order-1" : ""}>
                                        <div className={`relative bg-gradient-to-br ${step.color} p-1 rounded-3xl`}>
                                            <div className="bg-card rounded-3xl p-8 min-h-[300px] flex items-center justify-center">
                                                <div className={`w-32 h-32 rounded-full ${step.iconBg} flex items-center justify-center`}>
                                                    <step.icon className={`w-16 h-16 ${step.iconColor}`} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Code Example Section */}
            <section className="py-20 bg-muted/30">
                <div className="container px-4 md:px-6">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Simple Integration
                            </h2>
                            <p className="text-lg text-muted-foreground">
                                Get started with just a few lines of code
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-[#0A0A0B] rounded-2xl shadow-2xl overflow-hidden border border-white/10"
                        >
                            <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                </div>
                                <button
                                    onClick={handleCopyCode}
                                    className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm text-gray-300"
                                >
                                    {copiedCode ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            Copy
                                        </>
                                    )}
                                </button>
                            </div>
                            <div className="p-6 overflow-x-auto">
                                <pre className="font-mono text-sm leading-relaxed text-gray-300">
                                    <code>{codeExample}</code>
                                </pre>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-center mt-8"
                        >
                            <Link
                                href="/docs"
                                className="inline-flex items-center gap-2 text-[#2466eb] font-semibold hover:underline"
                            >
                                View Full Documentation
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-background">
                <div className="container px-4 md:px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto bg-gradient-to-r from-[#ef2d10] to-[#2466eb] rounded-3xl p-12 text-center text-white relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Ready to Get Started?
                            </h2>
                            <p className="text-xl mb-8 text-white/90">
                                Create your account and start testing in minutes
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/get-started"
                                    className="px-8 py-4 bg-white text-[#ef2d10] rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all"
                                >
                                    Get Sandbox Access
                                </Link>
                                <Link
                                    href="/contact"
                                    className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl font-bold hover:bg-white/20 transition-all"
                                >
                                    Schedule Demo
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
