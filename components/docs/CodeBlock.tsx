"use client";

import { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockProps {
    code: string;
    language: string;
    filename?: string;
}

export function CodeBlock({ code, language, filename }: CodeBlockProps) {
    const [copied, setCopied] = useState(false);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        setIsDark(document.documentElement.classList.contains("dark"));
        const observer = new MutationObserver(() => {
            setIsDark(document.documentElement.classList.contains("dark"));
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });
        return () => observer.disconnect();
    }, []);

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative my-6 rounded-lg overflow-hidden border border-border">
            {filename && (
                <div className="px-4 py-2 bg-muted border-b border-border text-sm text-muted-foreground font-mono">
                    {filename}
                </div>
            )}
            <div className="relative">
                <button
                    onClick={copyToClipboard}
                    className="absolute top-4 right-4 z-10 p-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
                    aria-label="Copy code"
                >
                    {copied ? (
                        <Check className="w-4 h-4 text-success" />
                    ) : (
                        <Copy className="w-4 h-4 text-foreground" />
                    )}
                </button>
                <SyntaxHighlighter
                    language={language}
                    style={isDark ? oneDark : oneLight}
                    customStyle={{
                        margin: 0,
                        padding: "1.5rem",
                        background: "var(--card)",
                        fontSize: "0.875rem",
                        lineHeight: "1.5",
                    }}
                    showLineNumbers
                >
                    {code}
                </SyntaxHighlighter>
            </div>
        </div>
    );
}
