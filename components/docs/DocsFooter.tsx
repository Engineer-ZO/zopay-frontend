"use client";

import { Github, Twitter, Linkedin } from "lucide-react";

export function DocsFooter() {
    return (
        <footer className="mt-12 pt-8 border-t border-border">
            <div className="flex items-center justify-between">
                {/* Social Media Icons */}
                <div className="flex items-center gap-4">
                    <a
                        href="https://twitter.com/zitopay"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Twitter"
                    >
                        <Twitter className="w-5 h-5" />
                    </a>
                    <a
                        href="https://github.com/zitopay"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="GitHub"
                    >
                        <Github className="w-5 h-5" />
                    </a>
                    <a
                        href="https://linkedin.com/company/zitopay"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="LinkedIn"
                    >
                        <Linkedin className="w-5 h-5" />
                    </a>
                </div>

                {/* Powered by zotech */}
                <div className="text-xs text-muted-foreground">
                    Powered by{" "}
                    <span className="font-medium text-foreground">
                        zotech
                    </span>
                </div>
            </div>
        </footer>
    );
}
