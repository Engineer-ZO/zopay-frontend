"use client";

import Link from "next/link";
import { useTranslation } from "@/core/i18n/useTranslation";

export function Footer() {
    const { t } = useTranslation("footer");

    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-border bg-background mt-auto">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div className="md:col-span-1">
                        <Link href="/" className="text-xl font-bold text-foreground hover:text-primary-orange transition-colors mb-4 inline-block">
                            ZitoPay
                        </Link>
                        <p className="text-sm text-muted-foreground mb-4">
                            Building the financial infrastructure for the African internet economy.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary-orange hover:text-white transition-colors">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                                </svg>
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary-orange hover:text-white transition-colors">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                            </a>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-4 text-foreground">{t("product")}</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/solutions" className="text-muted-foreground hover:text-primary-orange transition-colors">
                                    {t("solutions")}
                                </Link>
                            </li>
                            <li>
                                <Link href="/pricing" className="text-muted-foreground hover:text-primary-orange transition-colors">
                                    {t("pricing")}
                                </Link>
                            </li>
                            <li>
                                <Link href="/security" className="text-muted-foreground hover:text-primary-orange transition-colors">
                                    {t("security")}
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-4 text-foreground">{t("developers")}</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/docs" className="text-muted-foreground hover:text-primary-orange transition-colors">
                                    {t("documentation")}
                                </Link>
                            </li>
                            <li>
                                <Link href="/docs/api-reference" className="text-muted-foreground hover:text-primary-orange transition-colors">
                                    {t("apiReference")}
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-4 text-foreground">{t("company")}</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/about" className="text-muted-foreground hover:text-primary-orange transition-colors">
                                    {t("about")}
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-muted-foreground hover:text-primary-orange transition-colors">
                                    {t("contact")}
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-muted-foreground hover:text-primary-orange transition-colors">
                                    {t("privacy")}
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-muted-foreground hover:text-primary-orange transition-colors">
                                    {t("terms")}
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
                    {t("copyright").replace("{{year}}", currentYear.toString())}
                </div>
            </div>
        </footer>
    );
}
