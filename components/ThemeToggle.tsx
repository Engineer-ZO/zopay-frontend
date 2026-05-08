"use client";

import { useCallback, useEffect, useState, startTransition } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
    // Get current theme from DOM (checking if 'dark' class exists)
    const getIsDark = useCallback(() => {
        if (typeof window === "undefined") return false;
        return document.documentElement.classList.contains("dark");
    }, []);

    // Initialize to false for SSR consistency, then update after mount
    const [isDark, setIsDark] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // After mount, check the actual theme
        startTransition(() => {
            setIsDark(getIsDark());
        });

        // Watch for theme changes from external sources
        const observer = new MutationObserver(() => {
            const currentIsDark = getIsDark();
            startTransition(() => {
                setIsDark(currentIsDark);
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        return () => observer.disconnect();
    }, [getIsDark]);

    const toggleTheme = useCallback(() => {
        const currentIsDark = getIsDark();
        const newIsDark = !currentIsDark;

        // THE MAGIC: Add or remove 'dark' class from <html>
        if (newIsDark) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }

        setIsDark(newIsDark);
    }, [getIsDark]);

    // Render consistent button during SSR and initial client render
    if (!mounted) {
        return (
            <button
                className="p-2 rounded-lg transition-colors duration-200 border border-border bg-muted hover:bg-muted/80 text-foreground"
                aria-label="Toggle theme"
                style={{ backgroundColor: 'var(--muted)' }}
                suppressHydrationWarning
            >
                <Sun size={18} />
            </button>
        );
    }

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg transition-colors duration-200 border border-border bg-muted hover:bg-muted/80 text-foreground"
            aria-label="Toggle theme"
            style={{ backgroundColor: 'var(--muted)' }}
        >
            {isDark ? (
                <Moon size={18} />
            ) : (
                <Sun size={18} />
            )}
        </button>
    );
}
