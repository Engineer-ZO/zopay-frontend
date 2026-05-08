"use client";

import { createContext, ReactNode, useState, useEffect, useCallback, useMemo } from "react";
import type { Language } from "./types";
import { useAuthContext } from "@/features/auth/context/AuthContext";
import { useUpdatePreferredLanguage } from "@/features/auth/preferences";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated, user, updateUser } = useAuthContext();
    const updatePreferredLanguageMutation = useUpdatePreferredLanguage();
    // Keep initial SSR and client render deterministic to avoid hydration mismatch.
    const [localLanguage, setLocalLanguageState] = useState<Language>("en");

    const language = useMemo<Language>(() => {
        if (user?.preferredLanguage === "en" || user?.preferredLanguage === "fr") {
            return user.preferredLanguage;
        }

        return localLanguage;
    }, [localLanguage, user?.preferredLanguage]);

    const applyLanguage = useCallback((lang: Language) => {
        setLocalLanguageState(lang);
        localStorage.setItem("language", lang);
        document.documentElement.lang = lang;
    }, []);

    const setLanguage = useCallback((lang: Language) => {
        applyLanguage(lang);

        if (!isAuthenticated || !user) {
            return;
        }

        // Update local user state immediately
        updateUser({ preferredLanguage: lang });

        // Update backend preference
        updatePreferredLanguageMutation.mutate(lang, {
            onSuccess: (result) => {
                if (result.user?.preferredLanguage) {
                    updateUser({ preferredLanguage: result.user.preferredLanguage as Language });
                }
            },
            onError: (error) => {
                console.error("Failed to update preferred language:", error);
            },
        });
    }, [applyLanguage, isAuthenticated, updateUser, user, updatePreferredLanguageMutation]);

    useEffect(() => {
        document.documentElement.lang = language;
    }, [language]);

    useEffect(() => {
        const saved = localStorage.getItem("language");
        if (saved === "fr" || saved === "en") {
            const nextLanguage = saved as Language;
            const timer = window.setTimeout(() => {
                setLocalLanguageState(nextLanguage);
            }, 0);
            return () => window.clearTimeout(timer);
        }
    }, []);

    return (
        <LanguageContext.Provider value={{ language, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}
