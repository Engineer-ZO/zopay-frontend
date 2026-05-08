const fs = require('fs');
const file = 'c:/Users/Utilisateur/Desktop/Zitopay-project/zitopay-frontend/app/admin/login/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add imports
content = content.replace(
  'import { Eye, EyeOff, Shield, Loader2, Mail } from "lucide-react";',
  'import { Eye, EyeOff, Shield, Loader2, Mail, CheckCircle2, ArrowLeft } from "lucide-react";\nimport { useMutation } from "@tanstack/react-query";\nimport { verifyEmail } from "@/features/auth/api/index";'
);

// Add verificationCode state
content = content.replace(
  'const [turnstileToken, setTurnstileToken] = useState<string | null>(null);',
  'const [turnstileToken, setTurnstileToken] = useState<string | null>(null);\n  const [verificationCode, setVerificationCode] = useState("");'
);

// Add verifyMutation and submit handler after handleSubmit
const newLogic = `
  const verifyMutation = useMutation({
    mutationFn: (code: string) => verifyEmail({ email: email.trim(), code }),
    onSuccess: () => {
      toast.success("Email verified successfully. Logging in...");
      // Re-trigger login with same credentials to get the token, handle 2FA etc.
      adminLogin({
        email: email.trim(),
        password,
        turnstileToken: turnstileConfig?.enabled ? turnstileToken ?? undefined : undefined,
      });
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || "Verification failed");
    }
  });

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }
    verifyMutation.mutate(verificationCode);
  };
`;

content = content.replace(
  '  const errorStatus =',
  newLogic + '\n  const errorStatus ='
);

// Remove the Resend button from the error block in Login UI
content = content.replace(
  `{isVerificationRequired && (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendVerificationMutation.isPending}
                  className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
                >
                  {resendVerificationMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  Resend verification code
                </button>
              )}`,
  ''
);

const loginUI = `<div className="flex items-center justify-center gap-2 mb-6">
            <Shield className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Admin Login</h2>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              <div>{loginErrorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">`;

const verifyUI = `{isVerificationRequired ? (
          <>
            <div className="mb-6 relative">
              <button
                type="button"
                onClick={() => {
                   // reset the mutation error so it goes back to login form
                   if (error) {
                     (adminLogin as any).reset?.(); // Try to reset, or just rely on state
                     // Actually better: just reload or clear error
                     window.location.reload();
                   }
                }}
                className="absolute left-0 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Verify Email</h2>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-6 text-center">
              Please enter the 6-digit verification code sent to <span className="font-medium text-gray-900">{email}</span>.
            </p>
            
            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-center tracking-widest text-xl font-mono"
                  required
                  disabled={verifyMutation.isPending || isPending}
                />
              </div>
              
              <button
                type="submit"
                disabled={verifyMutation.isPending || isPending || verificationCode.length !== 6}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {verifyMutation.isPending || isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Verify & Sign In
                  </>
                )}
              </button>
              
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendVerificationMutation.isPending || verifyMutation.isPending || isPending}
                  className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 font-medium inline-flex items-center gap-1.5"
                >
                  {resendVerificationMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                  Resend Code
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            ${loginUI}`;

content = content.replace(
  `<div className="flex items-center justify-center gap-2 mb-6">
            <Shield className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Admin Login</h2>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              <div>{loginErrorMessage}</div>
              
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">`,
  verifyUI
);

// We need to close the conditional block at the end of the form
content = content.replace(
  `</form>

          {/* Security Notice */}`,
  `</form>\n          </>\n        )}\n\n          {/* Security Notice */}`
);

fs.writeFileSync(file, content);
