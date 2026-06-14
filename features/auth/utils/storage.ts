import SecureStorage from 'react-secure-storage';
import { STORAGE_KEY } from '@/constants/api';

const MUST_CHANGE_PASSWORD_COOKIE = 'mustChangePassword';

export interface User {
    id: string;
    email: string;
    role: 'merchant-user' | 'admin';
    preferredLanguage?: 'en' | 'fr';
    mustChangePassword?: boolean;
}

export interface AuthData {
    user: User;
    accessToken: string;
    refreshToken: string;
}

// Helper: set a plain cookie for middleware
const setCookie = (name: string, value: string, days: number = 7): void => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

const deleteCookie = (name: string): void => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

// Decode JWT and check expiration (returns true if token is valid and not expired)
const isTokenValid = (token: string): boolean => {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return false;
        const payload = JSON.parse(atob(parts[1]));
        const now = Date.now() / 1000;
        return !(payload.exp && payload.exp < now);
    } catch {
        return false;
    }
};

export const storeAuthData = (data: AuthData): void => {
    // Validate token before storing
    if (!isTokenValid(data.accessToken)) {
        console.warn('[storeAuthData] Attempting to store an invalid/expired token');
    }
    SecureStorage.setItem(STORAGE_KEY, data);
    setCookie('accessToken', data.accessToken, 7);
    setCookie(MUST_CHANGE_PASSWORD_COOKIE, data.user.mustChangePassword ? 'true' : 'false', 7);
};

export const getAuthData = (): AuthData | null => {
    try {
        const raw = SecureStorage.getItem(STORAGE_KEY);
        if (!raw || typeof raw !== 'object') return null;
        const data = raw as AuthData;
        if (!data.accessToken || !data.refreshToken || !data.user) {
            clearAuthData();
            return null;
        }
        // Optional: remove expired tokens to force refresh
        if (!isTokenValid(data.accessToken)) {
            console.warn('[getAuthData] Stored access token expired');
            // Return null so that caller knows to refresh
            return null;
        }
        return data;
    } catch (error) {
        console.error('[getAuthData] Decryption failed:', error);
        clearAuthData();
        return null;
    }
};

export const getAccessToken = (): string | null => {
    const data = getAuthData();
    return data?.accessToken ?? null;
};

export const getRefreshToken = (): string | null => {
    const data = getAuthData();
    return data?.refreshToken ?? null;
};

export const getCurrentUser = (): User | null => {
    const data = getAuthData();
    return data?.user ?? null;
};

export const clearAuthData = (): void => {
    SecureStorage.removeItem(STORAGE_KEY);
    deleteCookie('accessToken');
    deleteCookie(MUST_CHANGE_PASSWORD_COOKIE);
};

export const isAuthenticated = (): boolean => {
    const token = getAccessToken();
    return !!token && isTokenValid(token);
};

// Force cookie to match secure storage – useful after refresh
export const syncAuthCookie = (): void => {
    const data = getAuthData();
    if (data?.accessToken) {
        setCookie('accessToken', data.accessToken, 7);
        setCookie(MUST_CHANGE_PASSWORD_COOKIE, data.user.mustChangePassword ? 'true' : 'false', 7);
    } else {
        deleteCookie('accessToken');
        deleteCookie(MUST_CHANGE_PASSWORD_COOKIE);
    }
};