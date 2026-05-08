"use client";

import { useLanguage } from "@/core/i18n/useLanguage";
import { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown } from "lucide-react";

interface LanguageSwitcherProps {
    showLabel?: boolean;
}

export function LanguageSwitcher({ showLabel = false }: LanguageSwitcherProps) {
    const { language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLanguageSelect = (lang: "en" | "fr") => {
        setLanguage(lang);
        setIsOpen(false);
    };

    const getLanguageName = (lang: "en" | "fr") => (lang === "en" ? "English" : "Francais");

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`rounded-lg transition-colors duration-200 text-foreground ${
                    showLabel
                        ? "flex items-center gap-2 px-3 py-1.5 text-xs border border-border bg-background hover:bg-muted/60"
                        : "p-2 bg-muted border border-border hover:bg-muted/80"
                }`}
                aria-label="Change language"
            >
                <Globe size={18} />
                {showLabel && (
                    <>
                        <span>{getLanguageName(language)}</span>
                        <ChevronDown className="w-3 h-3" />
                    </>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
                    <div className="py-1">
                        <button
                            onClick={() => handleLanguageSelect("en")}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                                language === "en"
                                    ? "bg-primary-orange text-white"
                                    : "text-foreground hover:bg-muted"
                            }`}
                        >
                            English
                        </button>
                        <button
                            onClick={() => handleLanguageSelect("fr")}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                                language === "fr"
                                    ? "bg-primary-orange text-white"
                                    : "text-foreground hover:bg-muted"
                            }`}
                        >
                            Francais
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
