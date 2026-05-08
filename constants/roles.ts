export const roles = {
  MERCHANT: "merchant",
  ADMIN: "admin",
} as const;

export type Role = (typeof roles)[keyof typeof roles];

export const roleLabels: Record<Role, string> = {
  merchant: "Merchant",
  admin: "Admin",
};
