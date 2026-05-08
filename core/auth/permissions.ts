import { User } from "@/features/auth/types";

export type Permission =
  | "payments:create"
  | "payments:read"
  | "payments:update"
  | "transactions:read"
  | "settlements:read"
  | "apiKeys:manage"
  | "webhooks:manage"
  | "analytics:read"
  | "merchants:manage"
  | "admin:access";

const rolePermissions: Record<string, Permission[]> = {
  merchant: [
    "payments:create",
    "payments:read",
    "transactions:read",
    "settlements:read",
    "apiKeys:manage",
    "webhooks:manage",
    "analytics:read",
  ],
  admin: [
    "payments:read",
    "transactions:read",
    "settlements:read",
    "merchants:manage",
    "admin:access",
    "analytics:read",
  ],
};

export function hasPermission(user: User | null, permission: Permission): boolean {
  if (!user) return false;
  const permissions = rolePermissions[user.role] || [];
  return permissions.includes(permission);
}

export function requirePermission(user: User | null, permission: Permission): void {
  if (!hasPermission(user, permission)) {
    throw new Error(`User does not have permission: ${permission}`);
  }
}
