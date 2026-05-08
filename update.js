const fs = require('fs');
const file = 'c:/Users/Utilisateur/Desktop/Zitopay-project/zitopay-frontend/app/admin/users/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    'import { toast } from "sonner";',
    'import { toast } from "sonner";\nimport { useMutation, useQueryClient } from "@tanstack/react-query";\nimport { verifyEmail, resendVerificationCode } from "@/features/auth/api";'
);

content = content.replace(
    'const [showConfirmPassword, setShowConfirmPassword] = useState(false);\r\n\r\n    // Hooks',
    'const [showConfirmPassword, setShowConfirmPassword] = useState(false);\n\n    // Verification Modal State\n    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);\n    const [adminToVerify, setAdminToVerify] = useState<{ email: string } | null>(null);\n    const [verificationCode, setVerificationCode] = useState("");\n\n    // Hooks'
);

content = content.replace(
    'const { data, isLoading, error } = useAllAdmins();',
    'const queryClient = useQueryClient();\n    const { data, isLoading, error } = useAllAdmins();'
);

content = content.replace(
    'const handleDeleteClick = (adminId: string, adminEmail: string) => {',
    `const verifyAdminMutation = useMutation({
        mutationFn: (payload: { email: string; code: string }) => verifyEmail(payload),
        onSuccess: () => {
            toast.success("Admin email verified successfully");
            queryClient.invalidateQueries({ queryKey: ['auth', 'admin', 'all'] });
            setIsVerifyModalOpen(false);
            setVerificationCode("");
            setAdminToVerify(null);
        },
        onError: (err: unknown) => {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || "Failed to verify email");
        }
    });

    const resendCodeMutation = useMutation({
        mutationFn: (email: string) => resendVerificationCode({ email }),
        onSuccess: () => {
            toast.success("Verification code resent successfully");
        },
        onError: (err: unknown) => {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || "Failed to resend code");
        }
    });

    const handleDeleteClick = (adminId: string, adminEmail: string) => {`
);

content = content.replace(
    `<button
                                                        onClick={() => handleDeleteClick(admin.id, admin.email)}
                                                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Delete admin"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>`,
    `<>
                                                        {!admin.emailVerified && (
                                                            <button
                                                                onClick={() => {
                                                                    setAdminToVerify({ email: admin.email });
                                                                    setIsVerifyModalOpen(true);
                                                                    setVerificationCode("");
                                                                }}
                                                                className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-all border border-blue-200"
                                                                title="Verify admin"
                                                            >
                                                                Verify
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDeleteClick(admin.id, admin.email)}
                                                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                            title="Delete admin"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>`
);

const modalContent = `
            {/* Verify Admin Modal */}
            <AnimatePresence>
                {isVerifyModalOpen && adminToVerify && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => !verifyAdminMutation.isPending && setIsVerifyModalOpen(false)}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                    Verify Admin Email
                                </h2>
                                {!verifyAdminMutation.isPending && (
                                    <button
                                        onClick={() => setIsVerifyModalOpen(false)}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5 text-gray-500" />
                                    </button>
                                )}
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="text-sm text-gray-600">
                                    Enter the 6-digit verification code sent to <span className="font-semibold text-gray-900">{adminToVerify.email}</span>.
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Verification Code <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value.replace(/\\D/g, '').slice(0, 6))}
                                        placeholder="123456"
                                        maxLength={6}
                                        disabled={verifyAdminMutation.isPending}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm disabled:bg-gray-50 disabled:cursor-not-allowed text-center tracking-widest text-lg font-mono"
                                    />
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <button
                                        type="button"
                                        onClick={() => resendCodeMutation.mutate(adminToVerify.email)}
                                        disabled={resendCodeMutation.isPending || verifyAdminMutation.isPending}
                                        className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                    >
                                        {resendCodeMutation.isPending ? "Resending..." : "Resend Code"}
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                                {!verifyAdminMutation.isPending && (
                                    <button
                                        onClick={() => setIsVerifyModalOpen(false)}
                                        className="px-4 py-2 text-gray-600 text-sm font-medium hover:bg-gray-200 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    onClick={() => verifyAdminMutation.mutate({ email: adminToVerify.email, code: verificationCode })}
                                    disabled={verifyAdminMutation.isPending || verificationCode.length !== 6}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {verifyAdminMutation.isPending ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Verifying...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-4 h-4" />
                                            Verify
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
`;

content = content.replace(
    '        </div>\r\n    );\r\n}',
    modalContent
);

fs.writeFileSync(file, content);
