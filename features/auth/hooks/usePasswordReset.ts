import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { forgotPassword, verifyResetCode, resetPassword, resendResetCode } from '../api/index';
import type {
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    VerifyResetCodeRequest,
    VerifyResetCodeResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
    ResendVerificationRequest,
    ResendVerificationResponse,
} from '../types/index';

/**
 * Hook for requesting password reset
 * Sends reset code to email
 */
export const useForgotPassword = (): UseMutationResult<ForgotPasswordResponse, Error, ForgotPasswordRequest> => {
    const router = useRouter();

    return useMutation({
        mutationFn: (payload: ForgotPasswordRequest) => forgotPassword(payload),
        onSuccess: (_, variables) => {
            // Navigate to code verification page with email
            router.push(`/verify-code?email=${encodeURIComponent(variables.email)}`);
        },
    });
};

/**
 * Hook for verifying reset code
 * Optional step before password reset
 */
export const useVerifyResetCode = (): UseMutationResult<VerifyResetCodeResponse, Error, VerifyResetCodeRequest> => {
    const router = useRouter();

    return useMutation({
        mutationFn: (payload: VerifyResetCodeRequest) => verifyResetCode(payload),
        onSuccess: (_, variables) => {
            // Navigate to reset password page with email and code
            router.push(`/reset-password?email=${encodeURIComponent(variables.email)}&code=${encodeURIComponent(variables.code)}`);
        },
    });
};

/**
 * Hook for resetting password
 * Updates password and navigates to success page
 */
export const useResetPassword = (): UseMutationResult<ResetPasswordResponse, Error, ResetPasswordRequest> => {
    const router = useRouter();

    return useMutation({
        mutationFn: (payload: ResetPasswordRequest) => resetPassword(payload),
        onSuccess: () => {
            // Navigate to success page
            router.push('/password-reset-success');
        },
    });
};

/**
 * Hook for resending reset code
 */
export const useResendResetCode = (): UseMutationResult<ResendVerificationResponse, Error, ResendVerificationRequest> => {
    return useMutation({
        mutationFn: (payload: ResendVerificationRequest) => resendResetCode(payload),
    });
};
