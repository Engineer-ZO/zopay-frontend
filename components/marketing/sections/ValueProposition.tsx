"use client";

import { motion } from "framer-motion";
import { Shield, Zap, BarChart3, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";

const valueProps = [
    {
        icon: Zap,
        title: "Unified Gateway Management",
        description: "Connect once, access all African payment gateways",
        details: "MTN MoMo, Orange Money, and more—all through one simple API",
        color: "from-[#ef2d10] to-[#d0260e]",
        iconBg: "bg-[#ef2d10]/10",
        iconColor: "text-[#ef2d10]"
    },
    {
        icon: Shield,
        title: "Environment Perfection",
        description: "Flawless sandbox-to-production transitions",
        details: "Test with real data, deploy with confidence—no configuration changes needed",
        color: "from-[#2466eb] to-[#1d55c7]",
        iconBg: "bg-[#2466eb]/10",
        iconColor: "text-[#2466eb]"
    },
    {
        icon: BarChart3,
        title: "Real-time Intelligence",
        description: "Complete visibility into every transaction",
        details: "Automated reconciliation, reporting, and analytics built-in",
        color: "from-success to-green-600",
        iconBg: "bg-success/10",
        iconColor: "text-success"
    },
    {
        icon: Lock,
        title: "Enterprise Security",
        description: "Bank-grade security with HMAC authentication",
        details: "Full compliance, audit trails, and PCI DSS standards",
        color: "from-purple-600 to-purple-700",
        iconBg: "bg-purple-600/10",
        iconColor: "text-purple-600"
    }
];

export function ValueProposition() {
    return (
        <section className="py-20 md:py-32 bg-muted/30 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#2466eb]/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#ef2d10]/5 rounded-full blur-3xl" />

            <div className="container mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 max-w-7xl relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-4 py-2 rounded-full text-sm font-semibold bg-[#2466eb]/10 text-[#2466eb] mb-4">
                        Why ZoPay Changes Everything
                    </span>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                        Built for{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ef2d10] to-[#2466eb]">
                            African Fintech Innovation
                        </span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                        From sandbox to production in minutes. One platform that understands the unique challenges of African payments.
                    </p>
                </motion.div>

                {/* Value Proposition Cards */}
                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    {valueProps.map((prop, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.15 }}
                            className="group relative bg-card border border-border rounded-3xl p-8 hover:shadow-2xl hover:border-primary/20 transition-all duration-500 overflow-hidden"
                        >
                            {/* Gradient Background on Hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${prop.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                            <div className="relative z-10">
                                {/* Icon */}
                                <div className={`w-16 h-16 rounded-2xl ${prop.iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <prop.icon className={`w-8 h-8 ${prop.iconColor}`} />
                                </div>

                                {/* Content */}
                                <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                                    {prop.title}
                                </h3>
                                <p className="text-lg font-medium text-foreground mb-2">
                                    {prop.description}
                                </p>
                                <p className="text-muted-foreground leading-relaxed">
                                    {prop.details}
                                </p>

                                {/* Animated Arrow */}
                                <div className="mt-6 flex items-center text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    Learn more
                                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <Link
                        href="/apply"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#ef2d10] to-[#d0260e] text-white rounded-xl font-bold shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
                    >
                        Start Your Payment Revolution
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                    <p className="mt-4 text-sm text-muted-foreground">
                        No credit card required • Free sandbox access
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
