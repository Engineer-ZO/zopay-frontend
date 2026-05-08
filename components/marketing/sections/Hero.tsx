"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslation } from "@/core/i18n/useTranslation";
import { useAuthContext } from "@/features/auth/context/AuthContext";
import { useState, useEffect, startTransition } from "react";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
            delayChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: "easeOut" as const,
        },
    },
};

export function Hero() {
    const { t } = useTranslation("marketing");
    const { isAuthenticated } = useAuthContext();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        startTransition(() => {
            setMounted(true);
        });
    }, []);

    return (
        <section className="relative py-12 md:py-16 lg:py-20 overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
            {/* Animated gradient orbs */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#ef2d10]/5 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#2466eb]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

            {/* Subtle grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808015_1px,transparent_1px),linear-gradient(to_bottom,#80808015_1px,transparent_1px)] bg-[size:24px_24px]" />

            {/* Content */}
            <div className="container mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 max-w-4xl relative z-10">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-8 text-center"
                >
                    <motion.div variants={itemVariants}>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                            <span className="text-[#ef2d10]">{t("hero.titleStart")}</span>
                            {" "}
                            <span className="text-foreground">{t("hero.titleEnd")}</span>
                        </h1>
                    </motion.div>

                    <motion.p
                        variants={itemVariants}
                        className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
                    >
                        {t("hero.subtitle")}
                    </motion.p>

                    <motion.div
                        variants={itemVariants}
                        className="flex flex-wrap gap-4 justify-center items-center"
                    >
                        {!mounted || !isAuthenticated ? (
                            <>
                                <Link
                                    href="/apply"
                                    className="group relative px-8 py-4 bg-gradient-to-r from-[#ef2d10] to-[#dc2626] text-white rounded-xl font-semibold text-base shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden"
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        {t("hero.ctaPrimary")}
                                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#dc2626] to-[#ef2d10] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </Link>
                                <Link
                                    href="/docs"
                                    className="group px-8 py-4 border-2 border-[#2466eb] bg-background text-[#2466eb] rounded-xl hover:bg-[#2466eb] hover:text-white transition-all duration-300 font-semibold text-base shadow-md hover:shadow-xl hover:scale-105 backdrop-blur-sm"
                                >
                                    <span className="flex items-center gap-2">
                                        Documentation
                                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    </span>
                                </Link>
                            </>
                        ) : (
                            <Link
                                href="/docs"
                                className="group px-8 py-4 border-2 border-[#2466eb] bg-background text-[#2466eb] rounded-xl hover:bg-[#2466eb] hover:text-white transition-all duration-300 font-semibold text-base shadow-md hover:shadow-xl hover:scale-105 backdrop-blur-sm"
                            >
                                <span className="flex items-center gap-2">
                                    Documentation
                                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </span>
                            </Link>
                        )}
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        className="pt-8 border-t border-border"
                    >
                        <p className="text-sm text-muted-foreground mb-4">
                            {t("hero.trustedBy")}
                        </p>
                        <div className="flex items-center justify-center gap-4">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="w-10 h-10 rounded-full border-2 border-background"
                                        style={{
                                            background: i === 1 ? 'linear-gradient(135deg, #2466eb, #ef2d10)' :
                                                i === 2 ? 'linear-gradient(135deg, #ef2d10, #2466eb)' :
                                                    'linear-gradient(135deg, #2466eb, #ef2d10)'
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
