"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslation } from "@/core/i18n/useTranslation";
import { Check } from "lucide-react";

export function Developers() {
    const { t } = useTranslation("marketing");

    const features = [
        t("developers.features.restfulApi"),
        t("developers.features.webhooks"),
        t("developers.features.sandbox"),
    ];

    return (
        <section className="py-20 md:py-32 bg-muted/50">
            <div className="container mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 max-w-7xl">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="space-y-6"
                    >
                        <span className="inline-block px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: '#ef2d10' }}>
                            {t("developers.tag")}
                        </span>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                            {t("developers.title")}
                        </h2>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            {t("developers.description")}
                        </p>
                        <ul className="space-y-4">
                            {features.map((feature, index) => (
                                <motion.li
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: index * 0.1 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#10b981' }}>
                                        <Check className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-foreground">{feature}</span>
                                </motion.li>
                            ))}
                        </ul>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: 0.4 }}
                        >
                            <Link
                                href="/docs"
                                className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-lg hover:opacity-90 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                                style={{ backgroundColor: '#2466eb' }}
                            >
                                {t("developers.cta")}
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* Right Content - Code Preview */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="bg-card border border-border rounded-xl overflow-hidden shadow-xl"
                    >
                        <div className="bg-muted px-4 py-3 flex items-center gap-2 border-b border-border">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ef4444' }}></div>
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f59e0b' }}></div>
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10b981' }}></div>
                        </div>
                        <div className="p-6 font-mono text-sm">
                            <div className="space-y-4">
                                <div>
                                    <span className="text-muted-foreground">const</span>{" "}
                                    <span style={{ color: '#2466eb' }} className="font-semibold">payment</span>{" "}
                                    <span className="text-muted-foreground">=</span>{" "}
                                    <span style={{ color: '#ef2d10' }} className="font-semibold">await</span>{" "}
                                    <span className="text-foreground">zitoPay.collect</span>
                                    <span className="text-muted-foreground">({"{"}</span>
                                </div>
                                <div className="pl-4 space-y-2">
                                    <div>
                                        <span className="text-foreground">  amount</span>
                                        <span className="text-muted-foreground">:</span>{" "}
                                        <span style={{ color: '#10b981' }}>5000</span>
                                        <span className="text-muted-foreground">,</span>
                                    </div>
                                    <div>
                                        <span className="text-foreground">  currency</span>
                                        <span className="text-muted-foreground">:</span>{" "}
                                        <span style={{ color: '#10b981' }}>&quot;XOF&quot;</span>
                                        <span className="text-muted-foreground">,</span>
                                    </div>
                                    <div>
                                        <span className="text-foreground">  phone</span>
                                        <span className="text-muted-foreground">:</span>{" "}
                                        <span style={{ color: '#10b981' }}>&quot;+237...&quot;</span>
                                        <span className="text-muted-foreground">,</span>
                                    </div>
                                    <div>
                                        <span className="text-foreground">  network</span>
                                        <span className="text-muted-foreground">:</span>{" "}
                                        <span style={{ color: '#10b981' }}>&quot;MTN&quot;</span>
                                        <span className="text-muted-foreground">,</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">{"});"}</span>
                                </div>
                                <div className="pt-4 border-t border-border">
                                    <span className="text-muted-foreground">console.log(</span>
                                    <span style={{ color: '#10b981' }}>payment.status</span>
                                    <span className="text-muted-foreground">);</span>
                                    <span className="text-foreground"> // </span>
                                    <span className="text-muted-foreground">PENDING</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
