export const routes = {
  // Marketing
  home: "/",
  pricing: "/pricing",
  solutions: "/solutions",
  security: "/security",
  contact: "/contact",
  about: "/about",

  // Auth
  login: "/login",
  register: "/register",
  verifyEmail: "/verify-email",
  forgotPassword: "/forgot-password",

  // Merchant
  merchant: {
    dashboard: "/",
    transactions: "/transactions",
    paymentLinks: "/payment-links",
    payments: "/payments",
    customers: "/customers",
    settlements: "/settlements",
    apiKeys: "/api-keys",
    webhooks: "/webhooks",
    analytics: "/analytics",
    settings: "/settings",
    publicPay: "/pay",
  },

  // Admin Auth
  adminLogin: "/admin/login",
  adminResetPassword: "/admin/reset-password",

  // Admin
  admin: {
    dashboard: "/admin",
    merchants: "/admin/merchants",
    merchantsCreate: "/admin/merchants/create",
    transactions: "/admin/transactions",
    settlements: "/admin/settlements",
    fees: "/admin/fees",
    integrations: "/admin/integrations",
    systemSettings: "/admin/system-settings",
  },

  // Docs
  docs: {
    home: "/docs",
    gettingStarted: "/docs/getting-started",
    authentication: "/docs/authentication",
    mtnMomo: "/docs/mtn-momo",
    orangeMoney: "/docs/orange-money",
    webhooks: "/docs/webhooks",
    apiReference: "/docs/api-reference",
  },
} as const;
