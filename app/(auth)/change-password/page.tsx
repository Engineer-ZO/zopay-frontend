"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, Loader2 } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";
import { useChangePassword } from "@/features/auth/hooks";
import { useAuthContext } from "@/features/auth/context/AuthContext";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, refreshUser } = useAuthContext();

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const changePasswordMutation = useChangePassword();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (user && !user.mustChangePassword) {
      router.replace(user.role === "admin" ? "/admin/dashboard" : "/dashboard");
    }
  }, [isAuthenticated, isLoading, router, user]);

  if (isLoading || !isAuthenticated || !user?.mustChangePassword) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const current = currentPassword.trim();
    const next = newPassword.trim();
    const confirm = confirmNewPassword.trim();

    if (!current || !next || !confirm) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (next.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }

    if (next !== confirm) {
      toast.error("New passwords do not match.");
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: current,
        newPassword: next,
      });

      // Refresh context to clear mustChangePassword flag and avoid redirect loops.
      const refreshedUser = await refreshUser();
      const role = refreshedUser?.role ?? user?.role;

      toast.success("Password changed successfully.");

      router.push(role === "admin" ? "/admin/dashboard" : "/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to change password";
      toast.error(message);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <div className="bg-background rounded-2xl shadow-xl border border-border p-6 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-foreground mb-1.5">Change Password</h1>
            <p className="text-xs text-muted-foreground">
              For your security, you must update your temporary password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full pl-3 pr-10 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef2d10] focus:border-transparent transition-all text-foreground placeholder:text-muted-foreground"
                  required
                  disabled={changePasswordMutation.isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Create a new password"
                  minLength={6}
                  className="w-full pl-3 pr-10 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef2d10] focus:border-transparent transition-all text-foreground placeholder:text-muted-foreground"
                  required
                  disabled={changePasswordMutation.isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">Minimum 6 characters.</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  minLength={6}
                  className="w-full pl-3 pr-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef2d10] focus:border-transparent transition-all text-foreground placeholder:text-muted-foreground"
                  required
                  disabled={changePasswordMutation.isPending}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="w-full py-2.5 bg-[#ef2d10] text-white rounded-lg font-semibold text-sm hover:bg-[#d0260e] transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {changePasswordMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Update Password
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </AuthLayout>
  );
}

