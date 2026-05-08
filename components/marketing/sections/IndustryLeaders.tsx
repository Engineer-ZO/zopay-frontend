"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/core/i18n/useTranslation";

export function IndustryLeaders() {
    const logos = [
        { name: "Orange", bg: "bg-primary-orange" },
        { name: "MTN", bg: "bg-yellow-500" },
        { name: "UBA", bg: "bg-green-600" },
        { name: "Ecobank", bg: "bg-primary-blue" },
    ];

    return (
        <section className="py-16 bg-background border-y border-border">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            POWERING PAYMENTS FOR INDUSTRY LEADERS
                        </h3>
                    </motion.div>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
                        {logos.map((logo, index) => (
                            <motion.div
                                key={logo.name}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                className={`w-20 h-20 rounded-full ${logo.bg} flex items-center justify-center text-white font-bold text-lg`}
                            >
                                {logo.name[0]}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
