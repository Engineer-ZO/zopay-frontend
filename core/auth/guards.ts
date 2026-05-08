import { User } from "@/features/auth/types";

export type UserRole = "merchant" | "admin";

export function isMerchant(user: User | null): boolean {
  return user?.role === "merchant";
}

export function isAdmin(user: User | null): boolean {
  return user?.role === "admin";
}

export function hasRole(user: User | null, role: UserRole): boolean {
  if (!user) return false;
  return user.role === role;
}

export function requireAuth(user: User | null): asserts user is User {
  if (!user) {
    throw new Error("User must be authenticated");
  }
}

export function requireRole(
  user: User | null,
  role: UserRole
): asserts user is User {
  requireAuth(user);
  if (user.role !== role) {
    throw new Error(`User must have role: ${role}`);
  }
}
