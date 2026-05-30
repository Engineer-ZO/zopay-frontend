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
            extend: {
    colors: {
        // Primary brand colors - consistent across modes
        "primary-deep-blue-violet": "#2D2A5A",
        "primary-crimson-red": "#DC143C",

        // Deep Blue-Violet palette (primary)
        "deep-blue-violet": {
            50: "#f0f2fa",
            100: "#e3e6f5",
            200: "#cbd1ec",
            300: "#aab3df",
            400: "#8a95d2",
            500: "#2D2A5A", // Your primary deep blue-violet
            600: "#26234d",
            700: "#1e1b3d",
            800: "#16142e",
            900: "#0e0c1f",
            950: "#07060f",
        },

        // Crimson Red palette (secondary)
        "crimson-red": {
            50: "#fdf2f4",
            100: "#fce6ea",
            200: "#f9d0d8",
            300: "#f4a6b4",
            400: "#ec6b82",
            500: "#DC143C", // Your primary crimson red
            600: "#b81032",
            700: "#940d28",
            800: "#70091e",
            900: "#4c0614",
            950: "#26030a",
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
        primary: "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",
        secondary: "var(--secondary)",
        "secondary-foreground": "var(--secondary-foreground)",
        accent: "var(--accent)",
        "accent-foreground": "var(--accent-foreground)",
        destructive: "var(--destructive)",
        "destructive-foreground": "var(--destructive-foreground)",
    },
},
        },
    },
    plugins: [],
};

export default config;
