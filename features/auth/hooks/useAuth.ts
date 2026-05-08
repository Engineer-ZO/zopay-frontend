import { useMutation, useQuery, UseMutationResult, UseQueryResult, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '../context/AuthContext';
import { register, getMerchantRegistrationConfig, getTurnstileConfig, verifyEmail, resendVerificationCode, login, adminLogin, logout, changePassword, updateAdminProfile, getCurrentAdmin, getAllAdmins, createAdmin, deleteAdmin, verify2FA, get2FAStatus, initiate2FASetup, confirm2FASetup, disable2FA, regenerateBackupCodes } from '../api/index';
// storeAuthData/clearAuthData removed as we use context now
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
    LogoutResponse,
    ChangePasswordRequest,
    ChangePasswordResponse,
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

/**
 * Hook for user registration
 * Sends verification code to email
 */
export const useRegister = (): UseMutationResult<RegisterResponse, Error, RegisterRequest> => {
    const router = useRouter();

    return useMutation({
        mutationFn: (credentials: RegisterRequest) => register(credentials),
        onSuccess: (_, variables) => {
            // Navigate to verification page with email
            router.push(`/verify-email-code?email=${encodeURIComponent(variables.email)}`);
        },
    });
};

/**
 * Hook for authenticated password change
 */
export const useChangePassword = (): UseMutationResult<ChangePasswordResponse, Error, ChangePasswordRequest> => {
    return useMutation({
        mutationFn: (payload: ChangePasswordRequest) => changePassword(payload),
    });
};

export const useMerchantRegistrationConfig = (): UseQueryResult<MerchantRegistrationConfig, Error> => {
    return useQuery({
        queryKey: ['public', 'config', 'merchant-registration'],
        queryFn: () => getMerchantRegistrationConfig(),
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });
};

export const useTurnstileConfig = (): UseQueryResult<TurnstileConfigResponse, Error> => {
    return useQuery({
        queryKey: ['public', 'auth', 'turnstile-config'],
        queryFn: () => getTurnstileConfig(),
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });
};

/**
 * Hook for email verification
 * Stores tokens and navigates to success page
 */
export const useVerifyEmail = (): UseMutationResult<VerifyEmailResponse, Error, VerifyEmailRequest> => {
    const router = useRouter();
    const { login: authLogin } = useAuthContext();

    return useMutation({
        mutationFn: (payload: VerifyEmailRequest) => verifyEmail(payload),
        onSuccess: (data) => {
            // Update auth context (syncs state + storage)
            authLogin({
                user: data.user,
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
            });

            // Navigate to success page
            router.push('/email-verified');
        },
    });
};

/**
 * Hook for resending verification code
 */
export const useResendVerification = (): UseMutationResult<ResendVerificationResponse, Error, ResendVerificationRequest> => {
    return useMutation({
        mutationFn: (payload: ResendVerificationRequest) => resendVerificationCode(payload),
    });
};

/**
 * Hook for user login
 * Stores tokens and navigates to dashboard
 * Handles 2FA interception — if requires2FA is true, redirects to 2FA verification page
 */
export const useLogin = (): UseMutationResult<LoginResponse, Error, LoginRequest> => {
    const router = useRouter();
    const { login: authLogin } = useAuthContext();

    return useMutation({
        mutationFn: (credentials: LoginRequest) => login(credentials),
        onSuccess: (data) => {
            // 2FA required — redirect to verification page with partial token
            if (data.requires2FA && data.partialToken) {
                router.push(`/verify-2fa?token=${encodeURIComponent(data.partialToken)}&email=${encodeURIComponent(data.user.email)}`);
                return;
            }

            const mustChangePassword = !!data.mustChangePassword;
            authLogin({
                user: { ...data.user, mustChangePassword },
                accessToken: data.accessToken!,
                refreshToken: data.refreshToken!,
            });
            router.push(mustChangePassword ? '/change-password' : '/dashboard');
        },
    });
};

/**
 * Hook for admin login
 * Stores tokens and navigates to admin dashboard
 * Only allows users with 'admin' role
 * Handles 2FA interception
 */
export const useAdminLogin = (): UseMutationResult<LoginResponse, Error, LoginRequest> => {
    const router = useRouter();
    const { login: authLogin } = useAuthContext();

    return useMutation({
        mutationFn: (credentials: LoginRequest) => adminLogin(credentials),
        onSuccess: (data) => {
            // 2FA required — redirect to admin 2FA verification page
            if (data.requires2FA && data.partialToken) {
                router.push(`/admin/verify-2fa?token=${encodeURIComponent(data.partialToken)}&email=${encodeURIComponent(data.user.email)}`);
                return;
            }

            const mustChangePassword = !!data.mustChangePassword;
            authLogin({
                user: { ...data.user, mustChangePassword },
                accessToken: data.accessToken!,
                refreshToken: data.refreshToken!,
            });
            router.push(mustChangePassword ? '/change-password' : '/admin/dashboard');
        },
    });
};

/**
 * Hook to complete 2FA login using partialToken + TOTP code
 */
export const useVerify2FA = (): UseMutationResult<LoginResponse, Error, TwoFAVerifyRequest> => {
    const router = useRouter();
    const { login: authLogin } = useAuthContext();

    return useMutation({
        mutationFn: (payload: TwoFAVerifyRequest) => verify2FA(payload),
        onSuccess: (data) => {
            const mustChangePassword = !!data.mustChangePassword;
            authLogin({
                user: { ...data.user, mustChangePassword },
                accessToken: data.accessToken!,
                refreshToken: data.refreshToken!,
            });
            router.push(mustChangePassword ? '/change-password' : '/dashboard');
        },
    });
};

/**
 * Hook to complete admin 2FA login
 */
export const useAdminVerify2FA = (): UseMutationResult<LoginResponse, Error, TwoFAVerifyRequest> => {
    const router = useRouter();
    const { login: authLogin } = useAuthContext();

    return useMutation({
        mutationFn: (payload: TwoFAVerifyRequest) => verify2FA(payload),
        onSuccess: (data) => {
            const mustChangePassword = !!data.mustChangePassword;
            authLogin({
                user: { ...data.user, mustChangePassword },
                accessToken: data.accessToken!,
                refreshToken: data.refreshToken!,
            });
            router.push(mustChangePassword ? '/change-password' : '/admin/dashboard');
        },
    });
};

// ============ 2FA MANAGEMENT HOOKS ============

export const use2FAStatus = (): UseQueryResult<TwoFAStatusResponse, Error> => {
    return useQuery({
        queryKey: ['auth', '2fa', 'status'],
        queryFn: () => get2FAStatus(),
        staleTime: 2 * 60 * 1000,
    });
};

export const useInitiate2FASetup = (): UseMutationResult<TwoFASetupInitiateResponse, Error, void> => {
    return useMutation({
        mutationFn: () => initiate2FASetup(),
    });
};

export const useConfirm2FASetup = (): UseMutationResult<TwoFASetupConfirmResponse, Error, TwoFASetupConfirmRequest> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: TwoFASetupConfirmRequest) => confirm2FASetup(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['auth', '2fa', 'status'] });
        },
    });
};

export const useDisable2FA = (): UseMutationResult<TwoFADisableResponse, Error, TwoFADisableRequest> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: TwoFADisableRequest) => disable2FA(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['auth', '2fa', 'status'] });
        },
    });
};

export const useRegenerateBackupCodes = (): UseMutationResult<TwoFARegenerateCodesResponse, Error, void> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => regenerateBackupCodes(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['auth', '2fa', 'status'] });
        },
    });
};


/**
 * Hook for user logout
 * Clears tokens and navigates to login
 */
export const useLogout = (): UseMutationResult<LogoutResponse, Error, void> => {
    const router = useRouter();
    const { logout: authLogout } = useAuthContext();

    return useMutation({
        mutationFn: () => logout(),
        onSuccess: () => {
            // Clear auth context (clears state + storage)
            authLogout();

            // Navigate to login page
            router.push('/login');
        },
        onError: () => {
            // Even if API call fails, clear local data and redirect
            authLogout();
            router.push('/login');
        },
    });
};

/**
 * Hook for updating admin profile (email)
 */
export const useUpdateAdminProfile = (): UseMutationResult<UpdateAdminProfileResponse, Error, UpdateAdminProfileRequest> => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (payload: UpdateAdminProfileRequest) => updateAdminProfile(payload),
        onSuccess: () => {
            // Invalidate admin queries to refresh data
            queryClient.invalidateQueries({ queryKey: ['admin', 'profile'] });
            queryClient.invalidateQueries({ queryKey: ['auth', 'admin', 'me'] });
        },
    });
};

/**
 * Hook for getting current admin details
 */
export const useCurrentAdmin = (): UseQueryResult<GetCurrentAdminResponse, Error> => {
    return useQuery({
        queryKey: ['auth', 'admin', 'me'],
        queryFn: () => getCurrentAdmin(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

/**
 * Hook for getting all admins
 */
export const useAllAdmins = (): UseQueryResult<GetAllAdminsResponse, Error> => {
    return useQuery({
        queryKey: ['auth', 'admin', 'all'],
        queryFn: () => getAllAdmins(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

/**
 * Hook for creating new admin account
 */
export const useCreateAdmin = (): UseMutationResult<CreateAdminResponse, Error, CreateAdminRequest> => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (payload: CreateAdminRequest) => createAdmin(payload),
        onSuccess: () => {
            // Invalidate admins list to refresh
            queryClient.invalidateQueries({ queryKey: ['auth', 'admin', 'all'] });
        },
    });
};

/**
 * Hook for deleting admin account
 */
export const useDeleteAdmin = (): UseMutationResult<DeleteAdminResponse, Error, string> => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (adminId: string) => deleteAdmin(adminId),
        onSuccess: () => {
            // Invalidate admins list to refresh
            queryClient.invalidateQueries({ queryKey: ['auth', 'admin', 'all'] });
        },
    });
};
