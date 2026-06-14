import { apiClient } from '@/lib/apiClient';
import type {
    RegisterRequest,
    RegisterResponse,
    MerchantRegistrationConfig,
    TurnstileConfigResponse,
    VerifyEmailRequest,
    VerifyEmailResponse,
    ResendVerificationRequest,
    ResendVerificationResponse,
    LoginRequest,
    LoginResponse,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    VerifyResetCodeRequest,
    VerifyResetCodeResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
    ChangePasswordRequest,
    ChangePasswordResponse,
    UpdatePreferredLanguageRequest,
    UpdatePreferredLanguageResponse,
    GetCurrentUserResponse,
    RefreshTokenResponse,
    LogoutResponse,
    UpdateAdminProfileRequest,
    UpdateAdminProfileResponse,
    GetCurrentAdminResponse,
    GetAllAdminsResponse,
    CreateAdminRequest,
    CreateAdminResponse,
    DeleteAdminResponse,
    TwoFAStatusResponse,
    TwoFASetupInitiateResponse,
    TwoFASetupConfirmRequest,
    TwoFASetupConfirmResponse,
    TwoFAVerifyRequest,
    TwoFADisableRequest,
    TwoFADisableResponse,
    TwoFARegenerateCodesResponse,
} from '../types/index';
// import { getAccessToken } from '../utils/storage';

import { getAccessToken, getRefreshToken, storeAuthData, syncAuthCookie } from '../utils/storage';
/**
 * Register a new user account
 * Sends verification code to email
 */


export const register = async (credentials: RegisterRequest): Promise<RegisterResponse> => {
    const { data } = await apiClient.post<RegisterResponse>('/public/v1/auth/register', credentials);
    return data;
};

export const getMerchantRegistrationConfig = async (): Promise<MerchantRegistrationConfig> => {
    const { data } = await apiClient.get<MerchantRegistrationConfig>('/public/v1/config/merchant-registration');
    return data;
};

export const getTurnstileConfig = async (): Promise<TurnstileConfigResponse> => {
    const { data } = await apiClient.get<TurnstileConfigResponse>('/public/v1/auth/turnstile-config');
    return data;
};

/**
 * Verify email with 6-digit code
 * Returns user data and tokens
 */
export const verifyEmail = async (payload: VerifyEmailRequest): Promise<VerifyEmailResponse> => {
    const { data } = await apiClient.post<VerifyEmailResponse>('/public/v1/auth/verify-email', payload);
    return data;
};

/**
 * Resend email verification code
 */
export const resendVerificationCode = async (payload: ResendVerificationRequest): Promise<ResendVerificationResponse> => {
    const { data } = await apiClient.post<ResendVerificationResponse>('/public/v1/auth/resend-verification', payload);
    return data;
};

/**
 * Login with email and password
 * Returns user data and tokens
 */
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>('/public/v1/auth/login', credentials);
    return data;
};

/**
 * Admin login with email and password
 * Returns admin user data and tokens
 * Only allows users with 'admin' role
 */
export const adminLogin = async (credentials: LoginRequest): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>('/public/v1/auth/admin/login', credentials);
    return data;
};


/**
 * Request password reset code
 * Sends 6-digit code to email
 */
export const forgotPassword = async (payload: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
    const { data } = await apiClient.post<ForgotPasswordResponse>('/public/v1/auth/forgot-password', payload);
    return data;
};

/**
 * Verify password reset code
 * Optional step before resetting password
 */
export const verifyResetCode = async (payload: VerifyResetCodeRequest): Promise<VerifyResetCodeResponse> => {
    const { data } = await apiClient.post<VerifyResetCodeResponse>('/public/v1/auth/verify-reset-code', payload);
    return data;
};

/**
 * Reset password with code and new password
 */
export const resetPassword = async (payload: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
    const { data } = await apiClient.post<ResetPasswordResponse>('/public/v1/auth/reset-password', payload);
    return data;
};

/**
 * Change password for authenticated user
 * Requires current password for verification
 */
export const changePassword = async (payload: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
    const { data } = await apiClient.put<ChangePasswordResponse>('/auth/v1/change-password', payload);
    return data;
};

/**
 * Resend password reset code
 */
export const resendResetCode = async (payload: ResendVerificationRequest): Promise<ResendVerificationResponse> => {
    const { data } = await apiClient.post<ResendVerificationResponse>('/public/v1/auth/resend-reset-code', payload);
    return data;
};

/**
 * Refresh access token using refresh token
 * Returns new access token and user data
 */

export const refreshToken = async (refreshTokenValue: string): Promise<RefreshTokenResponse> => {
    const { data } = await apiClient.post<RefreshTokenResponse>('/public/v1/auth/refresh', {
        refreshToken: refreshTokenValue,
    });
    return data;
};

/**
 * Get current authenticated user
 * Requires valid access token
 */
// In getCurrentUser, add debug logging
// In features/auth/api/index.ts
export const getCurrentUser = async (): Promise<GetCurrentUserResponse> => {
    const token = getAccessToken();
    console.log('=== DEBUG AUTH ===');
    console.log('Token exists:', !!token);
    if (token) {
        console.log('Token length:', token.length);
        console.log('Token first 50 chars:', token.substring(0, 50));
        console.log('Token last 10 chars:', token.substring(token.length - 10));
        
        // Try to decode JWT
        try {
            const parts = token.split('.');
            if (parts.length === 3) {
                const payload = JSON.parse(atob(parts[1]));
                console.log('Token payload:', {
                    exp: new Date(payload.exp * 1000).toISOString(),
                    now: new Date().toISOString(),
                    isExpired: payload.exp * 1000 < Date.now(),
                    email: payload.email,
                    sub: payload.sub,
                    role: payload.role
                });
            } else {
                console.error('Token is not a valid JWT (wrong parts):', parts.length);
            }
        } catch (e) {
            console.error('Failed to decode token:', e);
        }
    }
    
    const { data } = await apiClient.get<GetCurrentUserResponse>('/auth/v1/me');
    return data;
};
/**
 * Update preferred language for the authenticated user
 */
export const updatePreferredLanguage = async (
    payload: UpdatePreferredLanguageRequest
): Promise<UpdatePreferredLanguageResponse> => {
    const { data } = await apiClient.put<UpdatePreferredLanguageResponse>('/auth/v1/preferences/language', payload);
    return data;
};

/**
 * Logout current user
 * Invalidates access token
 */
export const logout = async (): Promise<LogoutResponse> => {
    const { data } = await apiClient.post<LogoutResponse>('/auth/v1/logout');
    return data;
};

/**
 * Update admin profile (email)
 * Requires admin authentication
 */
export const updateAdminProfile = async (payload: UpdateAdminProfileRequest): Promise<UpdateAdminProfileResponse> => {
    const { data } = await apiClient.put<UpdateAdminProfileResponse>('/auth/v1/admin/profile', payload);
    return data;
};

/**
 * Get current admin details
 * Returns detailed admin information including email verification status
 */
export const getCurrentAdmin = async (): Promise<GetCurrentAdminResponse> => {
    const { data } = await apiClient.get<GetCurrentAdminResponse>('/auth/v1/admin/me');
    return data;
};

/**
 * Get all admin users
 * Returns list of all admins on the platform
 */
export const getAllAdmins = async (): Promise<GetAllAdminsResponse> => {
    const { data } = await apiClient.get<GetAllAdminsResponse>('/auth/v1/admin/all');
    return data;
};

/**
 * Create new admin account
 * Only existing admins can create new admin accounts
 */
export const createAdmin = async (payload: CreateAdminRequest): Promise<CreateAdminResponse> => {
    const { data } = await apiClient.post<CreateAdminResponse>('/auth/v1/admin/create', payload);
    return data;
};

/**
 * Delete admin account
 * Includes safety checks: cannot delete yourself, cannot delete last admin
 */
export const deleteAdmin = async (adminId: string): Promise<DeleteAdminResponse> => {
    const { data } = await apiClient.delete<DeleteAdminResponse>(`/auth/v1/admin/${adminId}`);
    return data;
};

// ============ 2FA API ============

/**
 * Complete login when 2FA is required
 * Uses partialToken from login response + TOTP code from authenticator app
 */
export const verify2FA = async (payload: TwoFAVerifyRequest): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>('/public/v1/auth/2fa/verify', payload);
    return data;
};

/**
 * Get current 2FA status for the logged-in user
 */
export const get2FAStatus = async (): Promise<TwoFAStatusResponse> => {
    const { data } = await apiClient.get<TwoFAStatusResponse>('/auth/v1/2fa/status');
    return data;
};

/**
 * Start 2FA setup — returns QR code and secret
 */
export const initiate2FASetup = async (): Promise<TwoFASetupInitiateResponse> => {
    const { data } = await apiClient.post<TwoFASetupInitiateResponse>('/auth/v1/2fa/setup/initiate');
    return data;
};

/**
 * Confirm 2FA setup — returns backup codes (shown once only)
 */
export const confirm2FASetup = async (payload: TwoFASetupConfirmRequest): Promise<TwoFASetupConfirmResponse> => {
    const { data } = await apiClient.post<TwoFASetupConfirmResponse>('/auth/v1/2fa/setup/confirm', payload);
    return data;
};

/**
 * Disable 2FA — requires current password confirmation
 */
export const disable2FA = async (payload: TwoFADisableRequest): Promise<TwoFADisableResponse> => {
    const { data } = await apiClient.delete<TwoFADisableResponse>('/auth/v1/2fa', { data: payload });
    return data;
};

/**
 * Regenerate backup codes — invalidates all previous codes
 */
export const regenerateBackupCodes = async (): Promise<TwoFARegenerateCodesResponse> => {
    const { data } = await apiClient.post<TwoFARegenerateCodesResponse>('/auth/v1/2fa/backup-codes/regenerate');
    return data;
};
