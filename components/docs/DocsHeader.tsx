"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";
import { LanguageSwitcher } from "../LanguageSwitcher";

export function DocsHeader() {
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                setIsSearchOpen(true);
            }
            if (e.key === "Escape") {
                setIsSearchOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <Image
                            src="/zitopaylogo.png"
                            alt="ZitoPay Logo"
                            width={120}
                            height={35}
                            className="h-8 w-auto object-contain"
                            priority
                        />
                    </Link>

                    {/* Navigation Tabs - Moved to Sidebar */}

                    {/* Search Bar */}
                    <div className="hidden md:flex flex-1 max-w-md mx-8">
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="w-full flex items-center gap-2 px-4 py-2 bg-muted border border-border rounded-lg text-sm text-muted-foreground hover:bg-muted/80 transition-colors"
                        >
                            <Search className="w-4 h-4" />
                            <span>Search...</span>
                            <span className="ml-auto text-xs bg-card px-2 py-0.5 rounded border border-border">Ctrl K</span>
                        </button>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-3">
                        <Link href="/support" className="hidden md:block text-sm font-medium text-foreground hover:opacity-70 transition-opacity">
                            Support
                        </Link>
                        <Link
                            href="/dashboard"
                            className="hidden md:block px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                        >
                            Dashboard
                        </Link>
                        <div className="hidden md:flex items-center gap-2">
                            <ThemeToggle />
                            <LanguageSwitcher />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Modal */}
            {isSearchOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20"
                    onClick={() => setIsSearchOpen(false)}
                >
                    <div
                        className="bg-card border border-border rounded-lg shadow-xl w-full max-w-2xl mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3 p-4 border-b border-border">
                            <Search className="w-5 h-5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search documentation..."
                                className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
                                autoFocus
                            />
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">ESC</span>
                        </div>
                        <div className="p-4 text-sm text-muted-foreground">
                            Search functionality coming soon...
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
