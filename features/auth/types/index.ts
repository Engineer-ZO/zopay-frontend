import { User } from '../utils/storage';

// ============ REQUEST TYPES ============

export interface RegisterRequest {
    email: string;
    password: string;
}

export interface VerifyEmailRequest {
    email: string;
    code: string;
}

export interface ResendVerificationRequest {
    email: string;
}

export interface MerchantRegistrationConfig {
    allowSelfRegistration: boolean;
    applicationFormUrl: string;
}

export interface TurnstileConfigResponse {
    enabled: boolean;
    siteKey: string | null;
}

export interface LoginRequest {
    email: string;
    password: string;
    turnstileToken?: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface VerifyResetCodeRequest {
    email: string;
    code: string;
}

export interface ResetPasswordRequest {
    email: string;
    code: string;
    newPassword: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface UpdateAdminProfileRequest {
    email: string;
}

export interface UpdateAdminProfileResponse {
    user: {
        id: string;
        email: string;
        role: string;
    };
    message: string;
}

export interface AdminDetails {
    id: string;
    email: string;
    role: string;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface GetCurrentAdminResponse {
    admin: AdminDetails;
}

export interface GetAllAdminsResponse {
    admins: AdminDetails[];
    total: number;
}

export interface CreateAdminRequest {
    email: string;
    password: string;
}

export interface CreateAdminResponse {
    user: {
        id: string;
        email: string;
        role: string;
    };
}

export interface DeleteAdminResponse {
    message: string;
}

// ============ RESPONSE TYPES ============

export interface RegisterResponse {
    success: true;
    message: string;
    userId: string;
}

export interface VerifyEmailResponse {
    success: true;
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface ResendVerificationResponse {
    success: true;
    message: string;
}

// Normal login response (no 2FA)
export interface LoginResponse {
    accessToken?: string;
    refreshToken?: string;
    user: User;
    mustChangePassword?: boolean;
    expiresIn?: number;
    // 2FA fields — present when account has 2FA enabled
    requires2FA?: boolean;
    partialToken?: string;
}

// ============ 2FA TYPES ============

export interface TwoFAStatusResponse {
    enabled: boolean;
    enabledAt: string | null;
    backupCodesRemaining: number;
}

export interface TwoFASetupInitiateResponse {
    secret: string;
    qrDataUrl: string;
    manualEntryKey: string;
}

export interface TwoFASetupConfirmRequest {
    secret: string;
    totpCode: string;
}

export interface TwoFASetupConfirmResponse {
    success: true;
    message: string;
    backupCodes: string[];
}

export interface TwoFAVerifyRequest {
    partialToken: string;
    code: string;
}

export interface TwoFADisableRequest {
    password: string;
}

export interface TwoFADisableResponse {
    success: true;
    message: string;
}

export interface TwoFARegenerateCodesResponse {
    success: true;
    message: string;
    backupCodes: string[];
}

export interface ForgotPasswordResponse {
    success: true;
    message: string;
}

export interface VerifyResetCodeResponse {
    success: true;
    message: string;
}

export interface ResetPasswordResponse {
    success: true;
    message: string;
}

export interface ChangePasswordResponse {
    success: true;
    message: string;
}

export type PreferredLanguage = 'en' | 'fr';

export interface UpdatePreferredLanguageRequest {
    preferredLanguage: PreferredLanguage;
}

export interface UpdatePreferredLanguageResponse {
    user: User;
    message: string;
}

export interface RefreshTokenResponse {
    accessToken: string;
  mustChangePassword?: boolean;
    expiresIn: number;
}

export type GetCurrentUserResponse = User;

export interface LogoutResponse {
    success: true;
    message: string;
}

// ============ ERROR RESPONSE ============

export interface ApiErrorResponse {
    error: string;
    message: string;
    emailVerified?: boolean;
}
