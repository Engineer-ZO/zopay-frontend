# ZitoPay Frontend — App Structure & Architecture

## Overview

ZitoPay is a **Next.js 14 (App Router)** application. It is a merchant-facing payment gateway platform that allows businesses to accept MTN Mobile Money and Orange Money payments in Cameroon.

---

## 1. The Four Sections

The app is divided into four distinct sections, each with its own route group in the `app/` directory.

```
app/
├── (auth)/          → Login, register, onboarding flows
├── (marketing)/     → Public marketing pages
├── admin/           → Internal admin panel
├── dashboard/       → Merchant dashboard (main product)
└── docs/            → Developer documentation
```

### 1.1 — Dashboard (`/dashboard/**`)
> The core product. Where merchants manage their business.

| Route | Purpose |
|---|---|
| `/dashboard` | Main overview — stats cards, recent transactions |
| `/dashboard/transactions` | Full transaction history (collections + payouts) |
| `/dashboard/collections` | Incoming payments from customers |
| `/dashboard/payouts` | Outgoing payments to merchants/customers |
| `/dashboard/refunds` | Refund management |
| `/dashboard/wallet` | Account status: balance, top-up, and withdrawal |
| `/dashboard/settlements` | Settlement history and pending settlements |
| `/dashboard/analytics` | Charts and analytics |
| `/dashboard/api-keys` | Sandbox & production API key management |
| `/dashboard/webhooks` | Webhook configuration |
| `/dashboard/gateways` | Legacy URL → redirects to `/dashboard` (merchant gateway UI removed) |
| `/dashboard/fee-settings` | Fee override settings |
| `/dashboard/profile` | Merchant profile |
| `/dashboard/settings/**` | Team, network access (domains & IPs), notifications; legacy `/settings/business` → support |
| `/dashboard/reports` | Downloadable reports |
| `/dashboard/support` | Support tickets |

Each dashboard page:
1. Gets merchant identity from `MerchantContext` (`useUserMerchantData`)
2. Gets the current environment (sandbox/production) from `EnvironmentContext` (`useEnvironment`)
3. Calls a **React Query hook** to fetch data
4. Renders UI with loading/error/empty states

---

### 1.2 — Admin (`/admin/**`)
> Internal tool for the ZitoPay operations team.

| Route | Purpose |
|---|---|
| `/admin/dashboard` | Admin overview |
| `/admin/merchants` | List and manage all merchants |
| `/admin/transactions` | All transactions across all merchants |
| `/admin/refunds` | All refunds across all merchants |
| `/admin/settlements` | Settlement management |
| `/admin/fees` | Global fee rule management |
| `/admin/domains` | Domain verification requests |
| `/admin/ips` | IP whitelist requests |
| `/admin/audit-logs` | System audit log |
| `/admin/users` | Admin user management |
| `/admin/reconciliation` | Financial reconciliation tools |
| `/admin/system-settings` | Global system configuration |
| `/admin/support` | Support queue |

The Admin section uses **separate API functions** from the merchant dashboard, pointing to `/admin/v1/` endpoints.

---

### 1.3 — Marketing (`/(marketing)/**`)
> Public-facing pages. No auth required.

| Route | Purpose |
|---|---|
| `/` | Homepage |
| `/pricing` | Pricing tiers |
| `/about` | About ZitoPay |
| `/contact` | Contact form |
| `/security` | Security overview |
| `/solutions` | Use cases |
| `/how-it-works` | Platform explainer |
| `/developers` | Developer landing page |

These pages do **not** use any API calls or context providers. They are purely static/marketing content.

### Public customer pay (`/pay/**`)

| Route | Purpose |
|---|---|
| `/pay/[segment]` | **Hosted checkout or payment link** (no auth): a **UUID** `segment` loads hosted checkout (`GET /public/v1/checkout/sessions/:id`); any other `segment` is treated as a payment link slug (`GET /public/v1/payment-links/:slug`). Checkout sessions are created by the merchant **backend** (`POST /api/v1/checkout/sessions` with API keys); the browser only opens this page. |

---


### 1.4 — Docs (`/docs/**`)
> Developer documentation rendered inside the app.

| Route | Purpose |
|---|---|
| `/docs` | Docs homepage |
| `/docs/getting-started/**` | Quickstart guides |
| `/docs/authentication` | Auth overview |
| `/docs/collections/**` | Collections API docs |
| `/docs/disbursements/**` | Disbursements API docs |
| `/docs/webhooks/**` | Webhook guides |
| `/docs/refunds` | Refunds reference |
| `/docs/api-reference` | Full API reference |
| `/docs/mtn-momo` | MTN MoMo specifics |
| `/docs/orange-money` | Orange Money specifics |
| `/docs/faq` | Frequently asked questions |

These are **content pages** — no API calls, no auth required.

---

## 2. The Data Flow Pattern

Every piece of API data in the dashboard follows this exact pattern:

```
┌─────────────────────────────────┐
│  features/<domain>/api.ts       │  ← Raw HTTP calls using apiClient (Axios)
│  e.g. listMerchantRefunds()     │     Calls backend REST API
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│  features/<domain>/queries.ts   │  ← React Query hooks wrapping the API functions
│  OR                             │     useQuery / useMutation
│  features/merchants/hooks/      │     Handles caching, loading, error states
│  useMerchant.ts                 │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│  app/dashboard/<page>/page.tsx  │  ← The actual page component
│  e.g. RefundsPage               │     Calls hooks, renders UI
└─────────────────────────────────┘
```

### Example — Refunds Page

```
features/refunds/api.ts
  └─ listMerchantRefunds(merchantId, params)   ← Calls GET /merchant/v1/merchants/:id/refunds

features/refunds/queries.ts
  └─ useMerchantRefunds(merchantId, params)    ← useQuery wrapping above function

app/dashboard/refunds/page.tsx
  └─ const { data } = useMerchantRefunds(...)  ← Page consumes the hook
```

---

## 3. The `features/` Module

All business logic, API functions, types, and hooks live in `features/`. Each domain gets its own folder.

```
features/
├── admin/           → Admin-specific API & hooks
├── analytics/       → Analytics API, types, queries
├── apiKeys/         → API key management
├── audit-logs/      → Audit log queries
├── auth/            → Auth context, login/register API & hooks
├── files/           → File upload hooks
├── merchants/       → Core merchant module (see below ↓)
├── payments/        → Payment initiation API
├── refunds/         → Refund API, queries, types
├── reports/         → Report generation
├── settlements/     → Settlement API & queries
├── support/         → Support ticket API
├── transactions/    → Transaction API & queries
├── wallet/          → Wallet hooks (useWalletSummary, useWalletActivity)
└── webhooks/        → Webhook API & queries
```

### The Merchants Module (most important)

`features/merchants/` is the backbone of the dashboard. It contains:

```
features/merchants/
├── api/
│   └── index.ts         → ALL merchant HTTP calls
│                           (CRUD, KYB, production, dashboard stats,
│                            recent transactions, wallet ops, domains, IPs)
├── context/
│   └── MerchantContext.tsx  → MerchantProvider + useUserMerchantData hook
│                              Fetches first merchant, exposes:
│                              { merchant, merchantId, isLoading, error, refetch }
├── hooks/
│   ├── useMerchant.ts   → All React Query hooks for merchant actions
│   ├── useDomains.ts    → Domain management hooks
│   ├── useIps.ts        → IP whitelist hooks
│   ├── useAdminDomains.ts → Admin domain approval hooks
│   └── useAdminIps.ts   → Admin IP approval hooks
├── types/
│   └── index.ts         → All merchant TypeScript types
└── types.ts             → (legacy, mostly merged into types/)
```

---

## 4. Global State — Context Providers

The app wraps everything in `app/layout.tsx` using these providers **in this exact nesting order**:

```tsx
<QueryProvider>             // React Query client — makes all useQuery hooks work
  <AuthProvider>            // Manages auth tokens, user session
    <MerchantProvider>      // Fetches first merchant, exposes merchant data globally
      <EnvironmentProvider> // Manages sandbox/production toggle
        <LanguageProvider>  // i18n (EN/FR)
          {children}
        </LanguageProvider>
      </EnvironmentProvider>
    </MerchantProvider>
  </AuthProvider>
</QueryProvider>
```

### How to access global state in a page

```ts
// Get merchant identity
import { useUserMerchantData } from "@/features/merchants/context/MerchantContext";
const { merchant, merchantId, isLoading } = useUserMerchantData();

// Get current environment (sandbox / production)
import { useEnvironment } from "@/core/environment/EnvironmentContext";
const { environment, switchEnvironment, hasProductionAccess } = useEnvironment();

// Get auth info
import { useAuthContext } from "@/features/auth/context/AuthContext";
const { isAuthenticated, user } = useAuthContext();
```

> ⚠️ **IMPORTANT:** `useUserMerchantData()` does **NOT** expose `environment`. You must call
> `useEnvironment()` separately to get it. Mixing these up causes compiler warnings and runtime bugs.

---

## 5. The Environment System

Merchants can toggle between **Sandbox** (test) and **Production** (live money) environments.

```
EnvironmentContext (core/environment/EnvironmentContext.tsx)
  - Reads from localStorage (key: 'zitopay_environment')
  - Defaults to 'sandbox' until merchant data loads
  - If merchant has no production access → always locked to 'sandbox'
  - switchEnvironment() → clears React Query cache → redirects to /dashboard
  - Shows confirmation modal before switching
  - Shows loading screen while switching
```

The environment is passed to API calls as a query parameter:
```
GET /merchant/v1/merchants/:id/dashboard/stats?environment=sandbox&period=30d
GET /merchant/v1/merchants/:id/dashboard/transactions/recent?environment=production&limit=50
```

The hooks `useDashboardStats` and `useRecentTransactions` call `useEnvironment()` **internally** — pages do not need to pass `environment` into these hooks manually.

---

## 6. The API Client

All HTTP calls go through:
```
lib/apiClient.ts  → Axios instance with base URL + auth interceptors
```

The base URL is configured from environment variables (`.env`).

Backend API versioning:
- Merchant routes: `/merchant/v1/...`
- Admin routes: `/admin/v1/...`
- Auth routes: `/auth/v1/...`

---

## 7. Current Status

All pages referenced in this document are **now aligned with the architecture guidelines**, and the
previously listed issues for collections and payouts have been fixed in the source code.

There are **no known open issues** in the dashboard regarding environment handling or hardcoded mock
data on the transactions, collections, payouts, wallet, or refunds pages.

---

## 8. Directory Quick Reference

```
zitopay/
├── app/                  → Next.js pages (routes)
│   ├── (auth)/           → Login, register
│   ├── (marketing)/      → Public marketing pages
│   ├── admin/            → Admin panel pages
│   ├── dashboard/        → Merchant dashboard pages
│   └── docs/             → Developer docs pages
├── features/             → Business logic (API, hooks, types)
├── components/           → Shared UI components
├── core/                 → Infrastructure (auth, environment, i18n, http, query)
├── providers/            → QueryProvider (React Query setup)
├── lib/                  → apiClient (Axios)
├── hooks/                → Misc shared hooks
├── types/                → Shared TypeScript types
├── constants/            → App-wide constants
└── docs/                 → Static doc files (MDX content)
```

---

*Document generated: 2026-02-27*
