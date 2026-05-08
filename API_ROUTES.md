## API Routes Used in ZitoPay Frontend

This document lists all backend API routes referenced by the frontend, grouped by domain. Each entry includes a **short 1–2 line description**.

---

### 1. Public & Auth API (via `features/auth/api/index.ts`)

- **POST `/public/v1/auth/register`**  
  Register a new merchant user account and start onboarding.

- **GET `/public/v1/config/merchant-registration`**  
  Fetch configuration for merchant registration (countries, requirements, etc.).

- **POST `/public/v1/auth/verify-email`**  
  Verify a user's email using a verification token/code.

- **POST `/public/v1/auth/resend-verification`**  
  Resend the account verification email to the user.

- **POST `/public/v1/auth/login`**  
  Log in a merchant user and issue access/refresh tokens.

- **POST `/public/v1/auth/admin/login`**  
  Log in an admin user and issue access/refresh tokens.

- **POST `/public/v1/auth/forgot-password`**  
  Start password reset by sending a reset code/email.

- **POST `/public/v1/auth/verify-reset-code`**  
  Verify that a password reset code is valid.

- **POST `/public/v1/auth/reset-password`**  
  Complete password reset and set a new password.

- **POST `/public/v1/auth/resend-reset-code`**  
  Resend the password reset code.

- **PUT `/auth/v1/change-password`**  
  Change the authenticated user’s password.

- **GET `/auth/v1/me`**  
  Get the current authenticated merchant user profile.

- **POST `/auth/v1/logout`**  
  Log out the current user and invalidate tokens.

- **PUT `/auth/v1/admin/profile`**  
  Update the current admin user’s profile information.

- **GET `/auth/v1/admin/me`**  
  Fetch the currently logged in admin’s details.

- **GET `/auth/v1/admin/all`**  
  List all admin users in the system.

- **POST `/auth/v1/admin/create`**  
  Create a new admin user.

- **DELETE `/auth/v1/admin/{adminId}`**  
  Delete an admin user by ID.

---

### 2. Legacy `/api` Application Endpoints (via `fetch` with `NEXT_PUBLIC_API_URL`)

#### 2.1 Auth (`features/auth/api.ts`)

- **POST `/auth/login`**  
  Legacy login endpoint (wrapped by `authApi.login`).

- **POST `/auth/logout`**  
  Legacy logout endpoint to end the current session.

- **POST `/auth/refresh`**  
  Refresh an access token using a refresh token.

- **GET `/auth/session`**  
  Get the current session information if the user is logged in.

#### 2.2 Transactions (`features/transactions/api.ts`)

- **GET `/transactions`**  
  List transactions with filters (status, provider, dates, pagination).

- **GET `/transactions/{id}`**  
  Get detailed information about a specific transaction.

#### 2.3 Payments (`features/payments/api.ts`)

- **POST `/payments`**  
  Initiate a payment (e.g. mobile money collection).

- **GET `/payments/{paymentId}`**  
  Get the current status of a given payment.

- **GET `/payments`**  
  List payments with pagination and optional status filter.

#### 2.4 Analytics (`features/analytics/api.ts`)

- **GET `/analytics/dashboard`**  
  Fetch aggregated analytics data for the merchant dashboard.

#### 2.5 API Keys (`features/apiKeys/api.ts`) 

- **GET `/api-keys`**  
  List API keys associated with the current user or merchant.

- **POST `/api-keys`**  
  Create a new API key.

- **DELETE `/api-keys/{id}`**  
  Delete an API key by its ID.

#### 2.6 Legacy Admin Stats (`features/admin/api.ts` – `adminApi`)

- **GET `/admin/stats`**  
  Fetch legacy admin statistics (kept for backward compatibility).

---

### 3. Merchant Core API (`features/merchants/api/index.ts`)

Base: **`/merchant/v1/merchants`**

- **POST `/merchant/v1/merchants`**  
  Create a new merchant account and initial sandbox credentials.

- **GET `/merchant/v1/merchants`**  
  List merchants that the authenticated user can access.

- **GET `/merchant/v1/merchants/first`**  
  Fetch the first merchant linked to the current user.

- **GET `/merchant/v1/merchants/{merchantId}`**  
  Get detailed information about a merchant.

- **PUT `/merchant/v1/merchants/{merchantId}`**  
  Update merchant profile fields (business info, contacts, etc.).

#### 3.1 KYB & Production Access

- **POST `/merchant/v1/merchants/{merchantId}/kyb/submit`**  
  Submit KYB (Know Your Business) documents for review.

- **POST `/merchant/v1/merchants/{merchantId}/kyb/approve`**  
  Approve a merchant’s KYB submission (admin workflow).

- **POST `/merchant/v1/merchants/{merchantId}/kyb/reject`**  
  Reject a KYB submission, usually with a reason.

- **POST `/merchant/v1/merchants/{merchantId}/production-request`**  
  Request access to the production (live money) environment.

- **POST `/merchant/v1/merchants/{merchantId}/production-approve`**  
  Approve production access and generate production credentials.

#### 3.2 Environment Suspension

- **POST `/merchant/v1/merchants/{merchantId}/sandbox/suspend`**  
  Suspend a merchant’s sandbox environment.

- **POST `/merchant/v1/merchants/{merchantId}/sandbox/reactivate`**  
  Reactivate a previously suspended sandbox environment.

- **POST `/merchant/v1/merchants/{merchantId}/production/suspend`**  
  Suspend a merchant’s production environment.

- **POST `/merchant/v1/merchants/{merchantId}/production/reactivate`**  
  Reactivate a suspended production environment.

#### 3.3 Domains

- **POST `/merchant/v1/merchants/{merchantId}/domains`**  
  Add a new domain (for redirects/webhooks) pending admin approval.

- **DELETE `/merchant/v1/merchants/{merchantId}/domains/{domainId}`**  
  Delete a pending or rejected domain from the merchant.

- **GET `/merchant/v1/merchants/{merchantId}/domains`**  
  List all domains configured for a merchant.

#### 3.4 Gateways & Fees

> **Frontend:** The merchant dashboard **Gateways** page was removed; these endpoints remain for API/admin use.

- **GET `/merchant/v1/merchants/{merchantId}/gateways`**  
  Fetch configured payment gateways for the merchant.

- **POST `/merchant/v1/merchants/{merchantId}/gateways`**  
  Configure or update gateway settings (like MTN/Orange).

- **POST `/merchant/v1/merchants/{merchantId}/fee-overrides`**  
  Define or update custom fee overrides for a merchant.

#### 3.5 Credentials

- **POST `/merchant/v1/merchants/{merchantId}/regenerate-sandbox-credentials`**  
  Regenerate sandbox API keys; old ones become invalid.

- **POST `/merchant/v1/merchants/{merchantId}/regenerate-production-credentials`**  
  Regenerate production API keys; old ones become invalid.

#### 3.6 Dashboard Data

- **GET `/merchant/v1/merchants/{merchantId}/dashboard/stats`**  
  Get dashboard overview stats with `period` and `environment` query params.

- **GET `/merchant/v1/merchants/{merchantId}/dashboard/transactions/recent`**  
  Fetch recent transactions for dashboard cards with filters (`limit`, `type`, `environment`).

#### 3.7 Wallet

- **POST `/merchant/v1/merchants/{merchantId}/wallet/topup`**  
  Initiate a wallet top‑up from a customer payment.

- **POST `/merchant/v1/merchants/{merchantId}/wallet/withdraw`**  
  Withdraw funds from the wallet to a payout destination.

- **GET `/merchant/v1/merchants/{merchantId}/wallet/operations`**  
  List wallet operations (top‑ups, withdrawals) with optional environment and limit.

#### 3.8 Profile

- **PUT `/merchant/v1/profile`**  
  Update profile for the first/default merchant associated with the user.

#### 3.9 Merchant IP Management (Merchant-Side)

- **POST `/merchant/v1/merchants/{merchantId}/ips`**  
  Add a new IP address for whitelisting, pending admin approval.

- **GET `/merchant/v1/merchants/{merchantId}/ips`**  
  List all IP addresses registered for a merchant.

- **DELETE `/merchant/v1/merchants/{merchantId}/ips/{ipId}`**  
  Delete a pending or rejected IP address.

---

### 4. Merchant Support API (`features/support/api.ts`)

Base: **`/merchant/v1/support`**

- **POST `/merchant/v1/support/tickets`**  
  Create a new support ticket from the merchant dashboard.

- **GET `/merchant/v1/support/tickets`**  
  List all support tickets for the current merchant.

- **GET `/merchant/v1/support/tickets/{ticketId}`**  
  Fetch full details for a specific support ticket.

- **POST `/merchant/v1/support/tickets/{ticketId}/reply`**  
  Add a merchant reply message to a support ticket.

---

### 5. Merchant Refunds API (`features/refunds/api.ts`)

Merchant endpoints:

- **GET `/merchant/v1/merchants/{merchantId}/refunds`**  
  List refunds for a merchant with filters (status, dates, environment, pagination).

- **GET `/merchant/v1/merchants/{merchantId}/refunds/{refundId}`**  
  Fetch details for a specific merchant refund.

Admin endpoints:

- **GET `/admin/v1/refunds`**  
  List refunds across all merchants, with filters (merchant, status, env, dates, pagination).

- **GET `/admin/v1/refunds/{refundId}`**  
  Get details of a specific refund as an admin.

---

### 6. Merchant Webhooks API (`features/webhooks/api.ts`)

Base: **`/merchant/v1/webhooks`**

- **POST `/merchant/v1/webhooks/endpoints`**  
  Register a new webhook endpoint for event notifications.

- **PUT `/merchant/v1/webhooks/endpoints/{id}`**  
  Update a webhook endpoint (URL, events, enabled flag).

- **GET `/merchant/v1/webhooks/endpoints`**  
  List all webhook endpoints configured by the merchant.

- **GET `/merchant/v1/webhooks/endpoints/{id}`**  
  Get detailed information about a single webhook endpoint.

Deliveries & DLQ:

- **GET `/merchant/v1/webhooks/deliveries`**  
  List webhook deliveries with optional filters (status, event, etc.).

- **GET `/merchant/v1/webhooks/deliveries/{id}`**  
  Get detailed delivery information, including payload.

- **POST `/merchant/v1/webhooks/deliveries/{id}/replay`**  
  Replay a failed webhook delivery.

- **GET `/merchant/v1/webhooks/dlq`**  
  List dead‑letter queue items for permanently failed webhook deliveries.

---

### 7. Merchant Settlements & Reconciliation API (`features/settlements/api.ts`)

Merchant:

- **PUT `/merchant/v1/settlement-frequency`**  
  Set the merchant’s settlement frequency preference.

- **POST `/settlements/generate`**  
  Manually generate a settlement for the merchant.

- **GET `/settlements`**  
  List settlements for the merchant with filters (dates, status, pagination).

- **GET `/settlements/{id}`**  
  Get details for a specific merchant settlement.

- **GET `/settlements/{id}/statement`**  
  Get signed URL/metadata for the settlement’s statement PDF.

- **POST `/settlements/{id}/complete`**  
  Mark a settlement as completed after funds are paid out.

Admin:

- **GET `/admin/settlements`**  
  List settlements across all merchants, including merchant details.

- **GET `/admin/settlements/{id}`**  
  Get admin‑level details for a specific settlement.

Reconciliation (Admin only):

- **POST `/reconciliation/files/{fileId}/reconcile`**  
  Trigger reconciliation of a gateway settlement file.

- **GET `/reconciliation/queue`**  
  List reconciliation queue items with filters (gateway, match status, dates, etc.).

- **POST `/reconciliation/queue/{queueItemId}/link`**  
  Link a transaction to a reconciliation queue item manually.

- **POST `/reconciliation/queue/{queueItemId}/resolve`**  
  Mark a reconciliation queue item as resolved.

---

### 8. Admin Audit Logs API (`features/audit-logs/api.ts`)

- **GET `/admin/v1/audit-logs`**  
  List audit logs with rich filters (actor, entity, action, date range, pagination, sorting).

- **GET `/admin/v1/audit-logs/filter-options`**  
  Get available filter options for audit logs (actor types, actions, entities, etc.).

---

### 9. Admin Support Tickets (`features/admin/api.ts` – support section)

Base: **`/admin/v1/support`**

- **GET `/admin/v1/support/tickets`**  
  List all support tickets with filters (status, priority, assignee, search, pagination).

- **GET `/admin/v1/support/tickets/{ticketId}`**  
  Get full details of a specific support ticket.

- **POST `/admin/v1/support/tickets/{ticketId}/reply`**  
  Reply to a support ticket as an admin.

- **PATCH `/admin/v1/support/tickets/{ticketId}`**  
  Update ticket attributes (status, priority, assignment, etc.).

---

### 10. Admin Dashboard & Platform Metrics (`features/admin/api.ts`)

Base: **`/admin/v1/dashboard`**

- **GET `/admin/v1/dashboard/platform-metrics`**  
  Fetch global platform metrics (merchants count, volume, revenue, etc.).

- **GET `/admin/v1/dashboard/health-metrics`**  
  Get system health metrics (success rate, failures, KYB backlog, recon issues).

- **GET `/admin/v1/dashboard/gateway-performance`**  
  Fetch performance metrics for payment gateways (MTN, Orange, etc.).

---

### 11. Admin Merchant Management (`features/admin/api.ts`)

Base: **`/admin/v1`**

- **GET `/admin/v1/merchant-users`**  
  List all merchant‑user relationships for the platform.

- **GET `/admin/v1/merchants/{id}`**  
  Fetch rich detailed information about a single merchant (admin view).

- **POST `/admin/v1/merchants/create`**  
  Create a new merchant account from the admin panel.

- **GET `/admin/v1/settings`**  
  Fetch global platform settings.

- **PUT `/admin/v1/settings/merchant-registration`**  
  Update merchant registration settings (requirements, defaults, etc.).

- **POST `/admin/v1/bypass-passwords/generate`**  
  Generate a bypass (master) password for support/debug flows.

- **GET `/admin/v1/transactions`**  
  List all transactions across merchants with filters and pagination.

- **POST `/admin/v1/transactions/{transactionId}/reconcile`**  
  Manually reconcile a transaction’s final status.

- **POST `/admin/v1/transactions/{transactionId}/requery-status`**  
  Manually requery the status of a transaction from the payment gateway.

Merchant CRUD & Status:

- **DELETE `/admin/v1/merchants/{merchantId}`**  
  Permanently delete a merchant and all related data.

- **PUT `/admin/v1/merchants/{merchantId}`**  
  Update a merchant’s data from the admin side.

- **PUT `/admin/v1/merchants/{merchantId}/status`**  
  Change a merchant’s account status (e.g. ban, suspend).

- **PUT `/admin/v1/merchants/{merchantId}/capabilities`**  
  Toggle high‑level capabilities for a merchant.

- **PUT `/admin/v1/merchants/{merchantId}/gateways`**  
  Configure gateway settings for a specific merchant.

Global Gateways:

- **GET `/admin/v1/gateways`**  
  List all global gateway configurations.

- **PUT `/admin/v1/gateways/{code}`**  
  Update configuration for a specific gateway code.

Platform Wallet Fee Settings:

- **GET `/admin/v1/platform/wallet-fee-settings`**  
  Get platform‑wide wallet fee configuration.

- **PATCH `/admin/v1/platform/wallet-fee-settings`**  
  Update platform wallet fee configuration.

---

### 12. Admin Domain & IP Approval (`features/merchants/api/index.ts`)

Domains:

- **GET `/admin/v1/domain-requests/pending`**  
  List pending domain approval requests.

- **GET `/admin/v1/domain-requests`**  
  List domain requests with optional status filter.

- **POST `/admin/v1/domain-requests/{domainId}/approve`**  
  Approve a merchant domain request.

- **POST `/admin/v1/domain-requests/{domainId}/reject`**  
  Reject a domain request with a reason.

- **DELETE `/admin/v1/domain-requests/{domainId}`**  
  Delete a domain request (any status) as admin.

IPs:

- **GET `/admin/v1/ip-requests/pending`**  
  List pending merchant IP approval requests.

- **GET `/admin/v1/ip-requests`**  
  List IP approval requests with optional status filter.

- **POST `/admin/v1/ip-requests/{ipId}/approve`**  
  Approve an IP request.

- **POST `/admin/v1/ip-requests/{ipId}/reject`**  
  Reject an IP request with a reason.

- **DELETE `/admin/v1/ip-requests/{ipId}`**  
  Delete an IP entry as admin, regardless of status.

---

### 13. Hosted checkout (ZitoPay customer page) & related notes

**Public hosted page** (`features/checkout/api.ts` — unauthenticated `axios` client, same base URL as the app API):

- **GET `/public/v1/checkout/sessions/{id}`**  
  Load a checkout session for the hosted pay UI (`/pay/{checkoutSessionId}`). `id` is a **UUID** returned when the merchant **backend** created the session.

- **POST `/public/v1/checkout/sessions/{id}/pay`**  
  Start payment: gateway, payer MSISDN, optional name/email/comment, optional idempotency key. Response includes a **quote**; the UI should treat **`quote.totalAmount`** as the amount the customer must approve on the phone (per fee rules).

- **GET `/public/v1/checkout/sessions/{id}/status`**  
  Poll checkout status (`PENDING`, `PROCESSING`, `PAID`, `FAILED`, `EXPIRED`, `CANCELLED`); when terminal, use **`redirectUrl`** if the backend returns it (success or cancel URL).

> **Not used by this frontend app:** **POST `/api/v1/checkout/sessions`** and **GET `/api/v1/checkout/sessions/{id}`** (merchant API key + signed headers). Session creation must run on the **merchant server**, not in the browser. The customer only opens the ZitoPay-hosted URL (this app’s `/pay/{uuid}`) and uses the public routes above.

**Payment links** (`features/payment-links/api.ts`): **`/pay/[segment]`** uses **non-UUID** slugs with **`/public/v1/payment-links/{slug}`** (UUID `segment` is hosted checkout, see above).

**Merchant (`Authorization: Bearer`)**

- **POST `/merchant/v1/payment-links`** — Create link (`FIXED`, `PAYER_CHOICE`, or **`PARTIAL`** with `partialMinimumAmount`, `partialMinimumScope`, optional deadline/reminders; **`PARTIAL`** requires **`MULTI_USE`**).
- **GET `/merchant/v1/payment-links`**, **GET `/merchant/v1/payment-links/{id}`**, **PATCH `/merchant/v1/payment-links/{id}`** — List/get/update (partial renew: `partialDeadlineAt`, `partialCollectionPaused`, reminder fields, `partialNotifyMerchantOnInstallment`).
- **GET `/merchant/v1/payment-links/{id}/transactions`** — Ledger for the link.
- **GET `/merchant/v1/payment-links/{id}/partial-plans`** — **PARTIAL** only: payer emails, verified state, totals paid.

**Public (no auth)**

- **GET `/public/v1/payment-links/{slug}`** — Load link (`amountMode`, **`partial`** config when **PARTIAL**).
- **POST `/public/v1/payment-links/{slug}/pay`** — **Unified** pay for **FIXED**, **PAYER_CHOICE**, and **PARTIAL**. **PARTIAL** requires **`amount`** (instalment) and **`payer.email`** (identifies/creates the per-link plan) plus **`gateway`**, **`payer.msisdn`**, etc. No separate `/partial/*` routes and no OTP.
- **GET `/public/v1/payment-links/{slug}/transactions/{transactionId}`** — Poll collection / instalment status.
