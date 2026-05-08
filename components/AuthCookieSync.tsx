"use client";

import { useEffect } from "react";
import { getAuthData } from "@/features/auth/utils/storage";

/**
 * Syncs authentication cookie with localStorage
 * This ensures middleware can detect authentication status
 * Runs on mount and whenever storage might have changed
 */
export function AuthCookieSync() {
    useEffect(() => {
        const syncCookie = () => {
            const authData = getAuthData();
            if (authData?.accessToken) {
                // Check if cookie already exists and matches
                const existingCookie = document.cookie
                    .split('; ')
                    .find(row => row.startsWith('accessToken='));
                
                const cookieValue = existingCookie?.split('=')[1];
                
                // Only set cookie if it doesn't exist or doesn't match
                if (cookieValue !== authData.accessToken) {
                    const expires = new Date();
                    expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000);
                    document.cookie = `accessToken=${authData.accessToken};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
                }
            }
        };

        // Sync immediately on mount
        syncCookie();

        // Also sync periodically to catch any storage updates
        const interval = setInterval(syncCookie, 1000);

        // Listen for storage events (in case auth data changes in another tab)
        const handleStorageChange = () => {
            syncCookie();
        };
        window.addEventListener('storage', handleStorageChange);

        return () => {
            clearInterval(interval);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    return null;
}
