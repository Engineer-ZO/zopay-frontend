import { env } from "./env";

export const appConfig = {
  name: "ZitoPay",
  description: "Mobile Money Payment Gateway",
  version: "1.0.0",
  api: {
    baseUrl: env.apiUrl,
    timeout: 30000,
  },
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },
  features: {
    enableAnalytics: true,
    enableWebhooks: true,
  },
} as const;
