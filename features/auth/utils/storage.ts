import SecureStorage from 'react-secure-storage';
import { STORAGE_KEY } from '@/constants/api';

const MUST_CHANGE_PASSWORD_COOKIE = 'mustChangePassword';

// Types for stored authentication data
export interface User {
    id: string;
    email: string;
    role: 'merchant-user' | 'admin';
    preferredLanguage?: 'en' | 'fr';
    /**
     * Backend first-login flag.
     * When true, the UI must force the user onto a change-password screen.
     */
    mustChangePassword?: boolean;
}

export interface AuthData {
    user: User;
    accessToken: string;
    refreshToken: string;
}

/**
 * Set a cookie (for middleware access)
 */
const setCookie = (name: string, value: string, days: number = 7): void => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

/**
 * Delete a cookie
 */
const deleteCookie = (name: string): void => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

/**
 * Store encrypted authentication data
 * Uses react-secure-storage to encrypt tokens before storing
 * Also sets a cookie for middleware access
 */
export const storeAuthData = (data: AuthData): void => {
    SecureStorage.setItem(STORAGE_KEY, data);
    // Set cookie for middleware to detect authentication
    setCookie('accessToken', data.accessToken, 7);
    setCookie(MUST_CHANGE_PASSWORD_COOKIE, data.user.mustChangePassword ? 'true' : 'false', 7);
};

/**
 * Get decrypted authentication data
 * Returns null if no data exists or if decryption fails
 */
export const getAuthData = (): AuthData | null => {
    try {
        const data = SecureStorage.getItem(STORAGE_KEY);

        // Validate the data structure
        if (data && typeof data === 'object' && 'accessToken' in data && 'user' in data) {
            return data as AuthData;
        }

        // If data is corrupted or invalid, clear it
        if (data) {
            console.warn('Invalid auth data structure detected, clearing storage');
            clearAuthData();
        }

        return null;
    } catch (error) {
        // If decryption fails, clear the corrupted data
        console.error('Failed to decrypt auth data:', error);
        try {
            clearAuthData();
        } catch (clearError) {
            console.error('Failed to clear corrupted auth data:', clearError);
        }
        return null;
    }
};

/**
 * Get only the access token
 * Useful for API requests
 */
export const getAccessToken = (): string | null => {
    const data = getAuthData();
    return data?.accessToken || null;
};

/**
 * Get only the refresh token
 * Useful for token refresh
 */
export const getRefreshToken = (): string | null => {
    const data = getAuthData();
    return data?.refreshToken || null;
};

/**
 * Get current user info
 * Returns null if not authenticated
 */
export const getCurrentUser = (): User | null => {
    const data = getAuthData();
    return data?.user || null;
};

/**
 * Clear all authentication data
 * Used for logout
 */
export const clearAuthData = (): void => {
    SecureStorage.removeItem(STORAGE_KEY);
    // Also clear the cookie
    deleteCookie('accessToken');
    deleteCookie(MUST_CHANGE_PASSWORD_COOKIE);
};

/**
 * Check if user is authenticated
 * Returns true if valid auth data exists
 */
export const isAuthenticated = (): boolean => {
    const data = getAuthData();
    return !!data?.accessToken;
};
