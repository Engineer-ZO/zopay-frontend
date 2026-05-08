"use client";

import { motion } from "framer-motion";
import { Star, TrendingUp, Clock, Users } from "lucide-react";
import Image from "next/image";

const stats = [
    {
        icon: TrendingUp,
        value: "500%",
        label: "Faster Integration",
        description: "vs traditional gateways"
    },
    {
        icon: Clock,
        value: "99.9%",
        label: "Uptime Guarantee",
        description: "Enterprise reliability"
    },
    {
        icon: Users,
        value: "1000+",
        label: "Active Merchants",
        description: "Across Africa"
    }
];

const testimonials = [
    {
        quote: "ZitoPay reduced our integration time from 3 months to just 2 weeks. The unified API is a game-changer for African fintech.",
        author: "Sarah Kamau",
        role: "CTO, PayFlow Kenya",
        rating: 5
    },
    {
        quote: "Finally, a payment platform that understands the African market. Sandbox testing actually works like production!",
        author: "Jean-Pierre Nkosi",
        role: "Founder, MobiPay Cameroon",
        rating: 5
    },
    {
        quote: "The automated reconciliation alone saves us 20 hours per week. ZitoPay is essential infrastructure for any serious fintech.",
        author: "Amina Diallo",
        role: "CFO, TransactHub Senegal",
        rating: 5
    }
];

export function SocialProof() {
    return (
        <section className="py-20 md:py-32 bg-background relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-30">
                <div className="absolute inset-0 bg-[radial-gradient(#2466eb_1px,transparent_1px)] [background-size:32px_32px]" />
            </div>

            <div className="container mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 max-w-7xl relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-4 py-2 rounded-full text-sm font-semibold bg-success/10 text-success mb-4">
                        Trusted by African Fintech Leaders
                    </span>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                        Join the{" "}
                        <span className="text-[#ef2d10]">Payment Revolution</span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                        Hundreds of businesses across Africa trust ZitoPay to power their payment infrastructure.
                    </p>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid md:grid-cols-3 gap-8 mb-20">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-gradient-to-br from-card to-muted/30 border border-border rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300"
                        >
                            <div className="w-14 h-14 rounded-xl bg-[#2466eb]/10 flex items-center justify-center mx-auto mb-4">
                                <stat.icon className="w-7 h-7 text-[#2466eb]" />
                            </div>
                            <div className="text-4xl md:text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-[#ef2d10] to-[#2466eb]">
                                {stat.value}
                            </div>
                            <div className="text-lg font-semibold mb-1">{stat.label}</div>
                            <div className="text-sm text-muted-foreground">{stat.description}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Testimonials Carousel */}
                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.15 }}
                            className="bg-card border border-border rounded-2xl p-8 hover:shadow-2xl hover:border-primary/20 transition-all duration-300"
                        >
                            {/* Star Rating */}
                            <div className="flex gap-1 mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 fill-warning text-warning" />
                                ))}
                            </div>

                            {/* Quote */}
                            <p className="text-muted-foreground leading-relaxed mb-6 italic">
                                &quot;{testimonial.quote}&quot;
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ef2d10] to-[#2466eb] flex items-center justify-center text-white font-bold">
                                    {testimonial.author.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <div className="font-semibold">{testimonial.author}</div>
                                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Trust Badges */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="mt-16 text-center"
                >
                    <p className="text-sm text-muted-foreground mb-6">Certified & Compliant</p>
                    <div className="flex flex-wrap items-center justify-center gap-8">
                        {['PCI DSS', 'ISO 27001', 'SOC 2', 'GDPR'].map((badge, i) => (
                            <div
                                key={i}
                                className="px-6 py-3 bg-muted/50 border border-border rounded-xl font-semibold text-sm hover:bg-muted transition-colors"
                            >
                                {badge}
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
