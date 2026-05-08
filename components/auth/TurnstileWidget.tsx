"use client";

import Script from "next/script";
import { useEffect, useId, useRef, useState } from "react";

declare global {
    interface Window {
        turnstile?: {
            render: (
                container: string | HTMLElement,
                options: {
                    sitekey: string;
                    callback?: (token: string) => void;
                    "expired-callback"?: () => void;
                    "error-callback"?: () => void;
                    theme?: "light" | "dark" | "auto";
                }
            ) => string;
            remove: (widgetId: string) => void;
            reset: (widgetId?: string) => void;
        };
    }
}

interface TurnstileWidgetProps {
    siteKey: string;
    onTokenChange: (token: string | null) => void;
}

export function TurnstileWidget({ siteKey, onTokenChange }: TurnstileWidgetProps) {
    const widgetContainerId = useId().replace(/:/g, "");
    const [scriptReady, setScriptReady] = useState(false);
    const widgetIdRef = useRef<string | null>(null);

    useEffect(() => {
        if (!scriptReady || !siteKey || !window.turnstile || widgetIdRef.current) {
            return;
        }

        const renderedWidgetId = window.turnstile.render(`#${widgetContainerId}`, {
            sitekey: siteKey,
            callback: (token: string) => onTokenChange(token),
            "expired-callback": () => onTokenChange(null),
            "error-callback": () => onTokenChange(null),
            theme: "auto",
        });
        widgetIdRef.current = renderedWidgetId;

        return () => {
            if (renderedWidgetId && window.turnstile) {
                window.turnstile.remove(renderedWidgetId);
                widgetIdRef.current = null;
            }
        };
    }, [scriptReady, siteKey, widgetContainerId, onTokenChange]);

    return (
        <div className="space-y-2">
            <Script
                src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
                strategy="afterInteractive"
                onLoad={() => setScriptReady(true)}
            />
            <div id={widgetContainerId} className="min-h-[65px]" />
            <p className="text-[11px] text-muted-foreground">
                Complete the security check to continue.
            </p>
        </div>
    );
}
