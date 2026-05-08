import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./features/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Primary brand colors - consistent across modes
                "primary-orange": "#ef2d10",
                "primary-blue": "#2466eb",

                // Orange palette (logo color - used more)
                orange: {
                    50: "#fef2f2",
                    100: "#fee2e2",
                    200: "#fecaca",
                    300: "#fca5a5",
                    400: "#f87171",
                    500: "#ef2d10", // Your primary orange
                    600: "#dc2626",
                    700: "#b91c1c",
                    800: "#991b1b",
                    900: "#7f1d1d",
                    950: "#450a0a",
                },

                // Blue palette
                blue: {
                    50: "#eff6ff",
                    100: "#dbeafe",
                    200: "#bfdbfe",
                    300: "#93c5fd",
                    400: "#60a5fa",
                    500: "#2466eb", // Your primary blue
                    600: "#2563eb",
                    700: "#1d4ed8",
                    800: "#1e40af",
                    900: "#1e3a8a",
                    950: "#172554",
                },

                // Semantic colors - will adapt via CSS variables
                success: "var(--success)",
                "success-foreground": "var(--success-foreground)",
                warning: "var(--warning)",
                "warning-foreground": "var(--warning-foreground)",
                error: "var(--error)",
                "error-foreground": "var(--error-foreground)",
                info: "var(--info)",
                "info-foreground": "var(--info-foreground)",

                // Background & foreground - adapt via CSS variables
                background: "var(--background)",
                foreground: "var(--foreground)",
                muted: "var(--muted)",
                "muted-foreground": "var(--muted-foreground)",
                card: "var(--card)",
                "card-foreground": "var(--card-foreground)",
                border: "var(--border)",
                input: "var(--input)",
                ring: "var(--ring)",
                accent: "var(--accent)",
                "accent-foreground": "var(--accent-foreground)",
            },
        },
    },
    plugins: [],
};

export default config;
