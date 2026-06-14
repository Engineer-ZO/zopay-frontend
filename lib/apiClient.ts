import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { API_BASE_URL } from '@/constants/api';
import {
    getAccessToken,
    getRefreshToken,
    storeAuthData,
    clearAuthData,
    getAuthData,
    syncAuthCookie,
} from '@/features/auth/utils/storage';

const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
    timeout: 30000,
});

const publicEndpoints = [
    '/public/v1/auth/register',
    '/public/v1/auth/login',
    '/public/v1/auth/admin/login',
    '/public/v1/auth/verify-email',
    '/public/v1/auth/resend-verification',
    '/public/v1/auth/forgot-password',
    '/public/v1/auth/verify-reset-code',
    '/public/v1/auth/reset-password',
    '/public/v1/auth/resend-reset-code',
    '/public/v1/auth/refresh',
    '/public/v1/config/merchant-registration',
    '/public/v1/auth/turnstile-config',
];

// Request interceptor
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getAccessToken();
        const isPublic = publicEndpoints.some(endpoint => config.url?.includes(endpoint));
        if (token && !isPublic) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        if (process.env.NODE_ENV === 'development') {
            console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
                hasToken: !!token,
                isPublic,
            });
        }
        return config;
    },
    error => Promise.reject(error)
);

// Response interceptor – handles 401 with refresh
apiClient.interceptors.response.use(
    response => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        const isNetworkError = !error.response || error.code === 'ERR_NETWORK';
        if (isNetworkError) return Promise.reject(error);

        const status = error.response?.status;
        const isPublic = publicEndpoints.some(endpoint => originalRequest.url?.includes(endpoint));

        console.log(`[API Response Error] ${originalRequest.url} - status: ${status}, retry: ${originalRequest._retry}`);

        // 403 – must change password
        if (status === 403 && (error.response?.data as any)?.error === 'MUST_CHANGE_PASSWORD') {
            if (typeof window !== 'undefined' && window.location.pathname !== '/change-password') {
                window.location.href = '/change-password';
            }
            return Promise.reject(error);
        }

        // 401 and not a public endpoint – attempt refresh once
        if (status === 401 && !originalRequest._retry && !isPublic) {
            originalRequest._retry = true;
            const refreshToken = getRefreshToken();

            console.log('[API Interceptor] 401 detected, refresh token exists:', !!refreshToken);

            if (!refreshToken) {
                console.warn('[API Interceptor] No refresh token, clearing auth');
                clearAuthData();
                if (typeof window !== 'undefined') window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                const { data } = await axios.post(`${API_BASE_URL}/public/v1/auth/refresh`, {
                    refreshToken,
                });

                console.log('[API Interceptor] Refresh successful, new access token received');

                const current = getAuthData();
                const mustChangePassword =
                    typeof data.mustChangePassword === 'boolean'
                        ? data.mustChangePassword
                        : current?.user?.mustChangePassword ?? false;
                const nextUser = data.user || (current?.user ? { ...current.user, mustChangePassword } : null);

                if (!nextUser) throw new Error('No user data after refresh');

                storeAuthData({
                    user: nextUser,
                    accessToken: data.accessToken,
                    refreshToken: data.refreshToken || refreshToken,
                });
                syncAuthCookie();

                // Small delay to ensure storage is updated
                await new Promise(resolve => setTimeout(resolve, 10));

                // Retry original request with new token
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                }
                return apiClient(originalRequest);
            } catch (refreshError) {
                console.error('[API Interceptor] Refresh failed:', refreshError);
                clearAuthData();
                if (typeof window !== 'undefined') window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        // 404 account deleted – clear and redirect
        const isFirstMerchantEndpoint = originalRequest.url?.includes('/merchant/v1/merchants/first');
        if (status === 404 && !isPublic && !isFirstMerchantEndpoint) {
            clearAuthData();
            if (typeof window !== 'undefined') {
                const role = getAuthData()?.user?.role;
                window.location.href = role === 'admin' ? '/admin/login' : '/login';
            }
            return Promise.reject(error);
        }

        // Attach API error message
        const responseData = error.response?.data as Record<string, unknown> | undefined;
        if (responseData && typeof responseData === 'object') {
            const apiMessage = (responseData.message || responseData.error) as string;
            if (apiMessage) error.message = apiMessage;
        }
        return Promise.reject(error);
    }
);

export { apiClient };