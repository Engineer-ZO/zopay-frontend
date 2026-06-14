'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    User,
    AuthData,
    getAuthData,
    storeAuthData,
    clearAuthData,
    getAccessToken,
    getRefreshToken,
    syncAuthCookie,
} from '../utils/storage';
import { getCurrentUser, refreshToken } from '../api/index';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (data: AuthData) => void;
    updateUser: (updates: Partial<User>) => void;
    refreshUser: () => Promise<User | null>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Helper to check error types
    const getErrorStatus = (error: unknown): number | undefined =>
        (error as any)?.response?.status ?? (error as any)?.status;

    const isNetworkError = (error: unknown): boolean =>
        // !!(error as any)?.code === 'ERR_NETWORK' || (error as any)?.message === 'Network Error' || !(error as any)?.response;
        (error as any)?.code === 'ERR_NETWORK' || (error as any)?.message === 'Network Error' || !(error as any)?.response;

    const isMustChangePasswordError = (error: unknown): boolean =>
        getErrorStatus(error) === 403 && (error as any)?.response?.data?.error === 'MUST_CHANGE_PASSWORD';

    useEffect(() => {
        // Inside AuthProvider useEffect – loadUser function
const loadUser = async () => {
    try {
        const token = getAccessToken();
        const refreshTokenValue = getRefreshToken();
        if (!token && !refreshTokenValue) {
            setUser(null);
            setIsLoading(false);
            return;
        }

        const authData = getAuthData();
        if (authData?.user) setUser(authData.user);

        // Try to fetch fresh user – let the interceptor handle 401 via refresh
        try {
            const freshUser = await getCurrentUser();
            setUser(freshUser);
            if (authData) {
                storeAuthData({ ...authData, user: freshUser });
                syncAuthCookie();
            }
        } catch (error: unknown) {
            const status = getErrorStatus(error);
            const networkError = isNetworkError(error);
            const mustChangePassword = isMustChangePasswordError(error);

            if (mustChangePassword && authData?.user) {
                const updatedUser = { ...authData.user, mustChangePassword: true };
                storeAuthData({ ...authData, user: updatedUser });
                setUser(updatedUser);
                return;
            }

            if (networkError && authData?.user) {
                console.warn('Network error, using cached user');
                return;
            }

            // For 401, the interceptor already attempted refresh and would have cleared
            // if it failed. So we just set user to null if no cached user.
            if (status === 401 || status === 403 || status === 404) {
                // If we had a cached user but the token is now invalid,
                // the interceptor already cleared storage and redirected.
                // So just set local user to null.
                setUser(null);
            } else {
                // Other errors – keep cached user
                console.warn('Non‑auth error, keeping cached user');
                if (authData?.user) setUser(authData.user);
            }
        }
    } catch (err) {
        console.error('Unexpected error in loadUser:', err);
        setUser(null);
    } finally {
        setIsLoading(false);
    }
};

        loadUser();
    }, []);

    const login = (data: AuthData) => {
        storeAuthData(data);
        syncAuthCookie();
        setUser(data.user);
    };

    const updateUser = (updates: Partial<User>) => {
        setUser(prev => {
            if (!prev) return prev;
            const next = { ...prev, ...updates };
            const auth = getAuthData();
            if (auth) storeAuthData({ ...auth, user: next });
            return next;
        });
    };

    const refreshUser = async (): Promise<User | null> => {
        try {
            const fresh = await getCurrentUser();
            setUser(fresh);
            const auth = getAuthData();
            if (auth) {
                storeAuthData({ ...auth, user: fresh });
                syncAuthCookie();
            }
            return fresh;
        } catch (error) {
            console.error('refreshUser failed:', error);
            return null;
        }
    };

    const logout = () => {
        clearAuthData();
        setUser(null);
    };

    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider
            value={{ user, isAuthenticated, isLoading, login, updateUser, refreshUser, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthContext(): AuthContextType {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
    return ctx;
}