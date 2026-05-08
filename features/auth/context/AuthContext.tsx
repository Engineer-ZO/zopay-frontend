"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthData, getAuthData, storeAuthData, clearAuthData, getAccessToken, getRefreshToken } from '../utils/storage';
import { getCurrentUser, refreshToken } from '../api/index';

// Context type definition
interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (data: AuthData) => void;
    updateUser: (updates: Partial<User>) => void;
    refreshUser: () => Promise<User | null>;
    logout: () => void;
}

// Create context with undefined default
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth Provider Component
 * Manages user authentication state across the app
 * Fetches fresh user data from API on mount if token exists
 */
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const getErrorStatus = (error: unknown): number | undefined => {
        if (typeof error !== 'object' || error === null) {
            return undefined;
        }

        const maybeResponse = 'response' in error ? error.response as { status?: number } | undefined : undefined;
        if (typeof maybeResponse?.status === 'number') {
            return maybeResponse.status;
        }

        return 'status' in error && typeof error.status === 'number' ? error.status : undefined;
    };

    const isNetworkError = (error: unknown): boolean => {
        if (typeof error !== 'object' || error === null) {
            return false;
        }

        const code = 'code' in error ? error.code : undefined;
        const message = 'message' in error ? error.message : undefined;
        const hasResponse = 'response' in error ? Boolean(error.response) : false;

        return code === 'ERR_NETWORK' || message === 'Network Error' || !hasResponse;
    };

    const isMustChangePasswordError = (error: unknown): boolean => {
        if (typeof error !== 'object' || error === null) {
            return false;
        }

        const maybeResponse = 'response' in error ? error.response as { status?: number; data?: { error?: string } } | undefined : undefined;
        const maybeStatus = maybeResponse?.status ?? ('status' in error ? error.status as number | undefined : undefined);

        return maybeStatus === 403 && maybeResponse?.data?.error === 'MUST_CHANGE_PASSWORD';
    };

    // Load user from storage and fetch fresh data from API on mount
    useEffect(() => {
        const loadUser = async () => {
            try {
                const token = getAccessToken();
                const refreshTokenValue = getRefreshToken();
                const authData = getAuthData();

                // If no token and no refresh token, user is not authenticated
                if (!token && !refreshTokenValue) {
                    setUser(null);
                    setIsLoading(false);
                    return;
                }

                // First, set user from storage (for immediate UI update)
                if (authData?.user) {
                    setUser(authData.user);
                }

                // Then fetch fresh user data from API
                try {
                    const freshUser = await getCurrentUser();
                    
                    // Update context with fresh data
                    setUser(freshUser);
                    
                    // Update storage with fresh user data (keep existing tokens)
                    if (authData) {
                        storeAuthData({
                            ...authData,
                            user: freshUser,
                        });
                    }
                } catch (error: unknown) {
                    // Check error type
                    const status = getErrorStatus(error);
                    const is401 = status === 401;
                    const is403 = status === 403;
                    const is404 = status === 404; // Account not found (deleted)
                    const networkError = isNetworkError(error);
                    const mustChangePasswordRequired = isMustChangePasswordError(error);

                    if (mustChangePasswordRequired) {
                        const nextUser = authData?.user ? { ...authData.user, mustChangePassword: true } : null;
                        if (authData && nextUser) {
                            storeAuthData({
                                ...authData,
                                user: nextUser,
                            });
                        }
                        setUser(nextUser);
                        return;
                    }
                    
                    // If it's a network error (server unreachable, CORS, etc.), keep user logged in
                    // Don't clear auth on network errors - user might be offline or server might be down
                    if (networkError) {
                        const message = error instanceof Error ? error.message : String(error);
                        console.warn('Network error fetching user data, keeping cached user:', message);
                        // Keep the user from localStorage - don't clear auth
                        // The user is still authenticated, just can't verify with server right now
                        if (authData?.user) {
                            setUser(authData.user);
                        }
                        return; // Exit early, keep user logged in
                    }
                    
                    // If it's a 401 (unauthorized), try to refresh token
                    if (is401 && refreshTokenValue) {
                        try {
                            console.log('Access token expired, attempting refresh...');
                            // Attempt to refresh the token
                            const refreshResponse = await refreshToken(refreshTokenValue);
                            const mustChangePassword = typeof refreshResponse.mustChangePassword === 'boolean'
                                ? refreshResponse.mustChangePassword
                                : authData?.user?.mustChangePassword;
                            const refreshedUser = authData?.user
                                ? { ...authData.user, mustChangePassword }
                                : null;
                            
                            // Store new tokens if we have a user
                            if (refreshedUser) {
                                storeAuthData({
                                    user: refreshedUser,
                                    accessToken: refreshResponse.accessToken,
                                    refreshToken: refreshTokenValue,
                                });
                            }
                            
                            // Update context with refreshed user data
                            setUser(refreshedUser);
                            
                            // Try to get fresh user data again
                            try {
                                const freshUser = await getCurrentUser();
                                setUser(freshUser);
                                if (authData) {
                                    storeAuthData({
                                        user: freshUser,
                                        accessToken: refreshResponse.accessToken,
                                        refreshToken: refreshTokenValue,
                                    });
                                }
                            } catch (retryError: unknown) {
                                // Check if retry also failed due to network
                                const isRetryNetworkError = isNetworkError(retryError);
                                const isRetry404 = getErrorStatus(retryError) === 404;
                                const mustChangePasswordAfterRefresh = isMustChangePasswordError(retryError);
                                
                                if (isRetryNetworkError) {
                                    // Network error on retry - keep refresh response user
                                    console.warn('Network error on retry, using refresh response user');
                                } else if (mustChangePasswordAfterRefresh) {
                                    if (refreshedUser) {
                                        storeAuthData({
                                            user: { ...refreshedUser, mustChangePassword: true },
                                            accessToken: refreshResponse.accessToken,
                                            refreshToken: refreshTokenValue,
                                        });
                                        setUser({ ...refreshedUser, mustChangePassword: true });
                                    }
                                } else if (isRetry404) {
                                    // Account not found after refresh - account was deleted, clear auth
                                    console.error('Account not found after token refresh (account deleted), clearing auth');
                                    clearAuthData();
                                    setUser(null);
                                } else {
                                    // Even after refresh, getCurrentUser failed - but we have valid tokens
                                    // Keep the user from refresh response
                                    console.warn('Failed to fetch fresh user after refresh, using refresh response:', retryError);
                                }
                            }
                        } catch (refreshError: unknown) {
                            // Check if refresh failed due to network error
                            const isRefreshNetworkError = isNetworkError(refreshError);
                            const isRefresh404 = getErrorStatus(refreshError) === 404;
                            const mustChangePasswordDuringRefresh = isMustChangePasswordError(refreshError);
                            
                            if (isRefreshNetworkError) {
                                // Network error during refresh - keep user logged in with cached data
                                console.warn('Network error during token refresh, keeping cached user');
                                if (authData?.user) {
                                    setUser(authData.user);
                                }
                            } else if (mustChangePasswordDuringRefresh) {
                                const nextUser = authData?.user ? { ...authData.user, mustChangePassword: true } : null;
                                if (authData && nextUser) {
                                    storeAuthData({
                                        ...authData,
                                        user: nextUser,
                                    });
                                }
                                setUser(nextUser);
                            } else if (isRefresh404) {
                                // Account not found during refresh - account was deleted, clear auth
                                console.error('Account not found during token refresh (account deleted), clearing auth');
                                clearAuthData();
                                setUser(null);
                            } else {
                                // Refresh failed (invalid refresh token, expired, etc.), clear auth and logout
                                console.error('Token refresh failed:', refreshError);
                                clearAuthData();
                                setUser(null);
                            }
                        }
                    } else if (is401 || is403 || is404) {
                        // 401/403/404 - account doesn't exist, token invalid, or account deleted - clear auth
                        if (is404) {
                            console.error('Account not found (may be deleted), clearing auth:', error);
                        } else {
                            console.error('Unauthorized access, clearing auth:', error);
                        }
                        clearAuthData();
                        setUser(null);
                    } else {
                        // Other error (500, etc.) - don't clear auth, keep cached user
                        console.warn('Error fetching user data (non-auth error), keeping cached user:', status || (error instanceof Error ? error.message : String(error)));
                        if (authData?.user) {
                            setUser(authData.user);
                        }
                    }
                }
            } catch (error) {
                console.error('Error loading user:', error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        loadUser();
    }, []);

    const login = (data: AuthData) => {
        storeAuthData(data);
        setUser(data.user);
    };

    const updateUser = (updates: Partial<User>) => {
        setUser((currentUser) => {
            if (!currentUser) {
                return currentUser;
            }

            const nextUser = { ...currentUser, ...updates };
            const authData = getAuthData();

            if (authData) {
                storeAuthData({
                    ...authData,
                    user: nextUser,
                });
            }

            return nextUser;
        });
    };

    const refreshUser = async (): Promise<User | null> => {
        try {
            const freshUser = await getCurrentUser();
            setUser(freshUser);

            const authData = getAuthData();
            if (authData) {
                storeAuthData({
                    user: freshUser,
                    accessToken: authData.accessToken,
                    refreshToken: authData.refreshToken,
                });
            }

            return freshUser;
        } catch (error) {
            console.error("Failed to refresh user:", error);
            return null;
        }
    };

    const logout = () => {
        clearAuthData();
        setUser(null);
    };

    // Compute isAuthenticated from user state
    // We trust local state 'user' which is synced with storage on login/logout
    const isAuthenticated = !!user;

    const value: AuthContextType = {
        user,
        isAuthenticated,
        isLoading,
        login,
        updateUser,
        refreshUser,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context
 * Must be used within AuthProvider
 */
export function useAuthContext(): AuthContextType {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuthContext must be used within AuthProvider');
    }

    return context;
}
