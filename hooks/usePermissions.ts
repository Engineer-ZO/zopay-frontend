"use client";

import { hasPermission, requirePermission } from "@/core/auth/permissions";
import { Permission } from "@/core/auth/permissions";
import { useAuth } from "./useAuth";

export function usePermissions() {
  const { user } = useAuth();

  return {
    hasPermission: (permission: Permission) => hasPermission(user, permission),
    requirePermission: (permission: Permission) =>
      requirePermission(user, permission),
  };
}
