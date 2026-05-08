"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslation } from "@/core/i18n/useTranslation";

export function CTA() {
    const { t } = useTranslation("marketing");

    return (
        <section className="py-20 md:py-32 bg-background">
            <div className="container mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="bg-muted border border-border rounded-2xl p-8 md:p-12 text-center"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                        {t("cta.title")}
                    </h2>
                    <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                        {t("cta.subtitle")}
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link
                            href="/apply"
                            className="px-8 py-4 text-white rounded-lg hover:opacity-90 transition-all font-semibold text-base shadow-xl hover:shadow-2xl transform hover:scale-105"
                            style={{ backgroundColor: '#ef2d10' }}
                        >
                            {t("cta.primary")}
                        </Link>
                        <Link
                            href="/contact"
                            className="px-8 py-4 border-2 bg-background rounded-lg hover:bg-muted transition-all font-semibold text-base"
                            style={{ borderColor: '#2466eb', color: '#2466eb' }}
                        >
                            {t("cta.secondary")}
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
