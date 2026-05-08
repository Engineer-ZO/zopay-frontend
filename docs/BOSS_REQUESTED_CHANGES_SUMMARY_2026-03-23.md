# Boss-Requested Changes Summary (Backend + Frontend)

Date: 2026-03-23
Scope: Combined backend and frontend changes for the latest boss directives.

---

## 1) Profile Overhaul (Start Here)

### Boss intent
- Merchant onboarding/profile model must be typed and enforce admin review for edits.
- Supported merchant account types:
  - `INDIVIDUAL`
  - `COMPANY`
  - `ASSOCIATION`
  - `GROUP`

### Backend implemented
- Added typed merchant model and profile storage:
  - `merchants.account_type`
  - `merchant_individual_profiles`
  - `merchant_institution_profiles`
  - `merchant_profile_documents`
  - `merchant_profile_update_requests`
- Merchant direct profile edits blocked (`403`, `USE_PROFILE_UPDATE_REQUEST`):
  - `PUT /merchant/v1/profile`
  - `PUT /merchant/v1/merchants/:id`
- Added profile update request flow:
  - `POST /merchant/v1/profile/update-request`
  - `GET /merchant/v1/profile/update-requests`
  - `GET /admin/v1/merchants/profile-update-requests`
  - `POST /admin/v1/merchants/profile-update-requests/:id/approve`
  - `POST /admin/v1/merchants/profile-update-requests/:id/reject`
- `getMerchantById` now returns enriched profile/document data.

### Frontend implemented
- Profile page now resolves merchant kind and renders type-specific sections.
- View mode reflects merchant type:
  - `Individual details`
  - `Company / Association / Group details`
- Edit modal now submits structured payload to update-request API:
  - `proposedChanges.merchant`
  - `proposedChanges.individual` (for individual)
  - `proposedChanges.institution` (for company/association/group)
- Added profile normalization/utilities to safely map API fields.

### Main frontend files
- `app/dashboard/profile/page.tsx`
- `features/merchants/utils/profileDisplay.ts`
- `features/merchants/types/index.ts`
- `features/merchants/api/index.ts`
- `features/merchants/hooks/useMerchant.ts`

---

## 2) Admin-Only Merchant Onboarding

### Backend implemented
- Enforced admin-driven creation model.
- Typed admin create routes added:
  - `POST /admin/v1/merchants/create/individual`
  - `POST /admin/v1/merchants/create/company`
  - `POST /admin/v1/merchants/create/association`
  - `POST /admin/v1/merchants/create/group`
- Legacy route retained:
  - `POST /admin/v1/merchants/create`
- Each typed flow now:
  - creates verified user with temporary credentials
  - sets `mustChangePassword = true`
  - stores typed profile and linked docs
  - uploads files via storage service
  - writes audit + sends account-created email

### Frontend implemented
- Replaced popup with full admin creation page and typed forms (individual/company/association/group).
- Wired all new typed endpoints.

### Main frontend files
- `app/admin/merchants/create/page.tsx`
- `features/admin/api.ts`
- `features/admin/queries.ts`
- `features/admin/types.ts`
- `app/admin/merchants/page.tsx`

---

## 3) First Login Password-Change Enforcement

### Backend implemented
- Added `users.must_change_password`.
- Login/admin login/refresh/me now carry `mustChangePassword`.
- IAM/user context re-checks latest DB value.
- `PUT /auth/v1/change-password` clears the flag.

### Frontend implemented
- Forced redirect to change-password page when `mustChangePassword = true`.
- Added page and guards in auth/dashboard/admin flows.

### Main frontend files
- `app/(auth)/change-password/page.tsx`
- `features/auth/context/AuthContext.tsx`
- `lib/apiClient.ts`
- auth/admin layout guards and login handlers

---

## 4) Merchant Gateway Policy (Merchant Edit Disabled)

### Backend implemented
- Merchant gateway configuration disabled for merchants:
  - `POST /merchant/v1/merchants/:id/gateways` -> `403` (`MERCHANT_GATEWAY_CONFIG_DISABLED`)
- On merchant creation, default gateways auto-provisioned:
  - `MTN_MOMO`
  - `ORANGE_MONEY`
- Merchant can still read configured gateways:
  - `GET /merchant/v1/merchants/:id/gateways`
- Admin can still override:
  - `PUT /admin/v1/merchants/:id/gateways`

### Frontend implemented
- Removed merchant Gateways page from sidebar.
- Legacy route preserved as redirect:
  - `/dashboard/gateways` -> `/dashboard`
- Removed merchant gateway UI hooks.

### Main frontend files
- `components/dashboard/DashboardSidebar.tsx`
- `app/dashboard/gateways/page.tsx` (redirect)
- `features/merchants/hooks/index.ts`
- Removed: `features/merchants/hooks/useGateways.ts`

---

## 5) Environment Settings Removed (Manual KYB for now)

### Boss intent
- No dedicated merchant environment/KYB settings page for now.

### Frontend implemented
- Removed Environment Settings nav entry.
- Removed old in-page KYB/env components.
- Preserved old route with redirect:
  - `/dashboard/settings/business` -> `/dashboard/support`
- Updated production CTA flow to support/manual guidance.

### Main frontend files
- `components/dashboard/DashboardSidebar.tsx`
- `components/dashboard/DashboardNavbar.tsx`
- `app/dashboard/settings/business/page.tsx` (redirect)
- Removed:
  - `app/dashboard/settings/business/components/KYBUploadSection.tsx`
  - `app/dashboard/settings/business/components/ProductionAccessSection.tsx`

---

## 6) Network Access Consolidation (Domains + IP)

### Boss intent
- Domains and IP whitelist should be one page with tabs.

### Frontend implemented
- Created unified settings page:
  - `/dashboard/settings/network-access`
- Tabs:
  - `Domains`
  - `IP Whitelist`
- Legacy route redirects:
  - `/dashboard/settings/domains` -> `/dashboard/settings/network-access?tab=domains`
  - `/dashboard/settings/ips` -> `/dashboard/settings/network-access?tab=ips`
- Sidebar now uses one item: `Network access`.

### Main frontend files
- `app/dashboard/settings/network-access/page.tsx`
- `app/dashboard/settings/network-access/NetworkAccessView.tsx`
- `components/dashboard/settings/NetworkAccessDomainsTab.tsx`
- `components/dashboard/settings/NetworkAccessIpsTab.tsx`
- `app/dashboard/settings/domains/page.tsx` (redirect)
- `app/dashboard/settings/ips/page.tsx` (redirect)
- `components/dashboard/DashboardSidebar.tsx`

---

## 7) One Domain + One IP Limit in UI

### Boss intent
- Merchant should only add one domain and one IP; no extra add button once one exists.

### Frontend implemented
- Domain tab:
  - max 1 domain
  - hides Add button when limit reached
  - adds client-side submission guard
- IP tab:
  - max 1 IP/CIDR
  - hides Add button when limit reached
  - adds client-side submission guard

### Main frontend files
- `components/dashboard/settings/NetworkAccessDomainsTab.tsx`
- `components/dashboard/settings/NetworkAccessIpsTab.tsx`
- `app/dashboard/settings/network-access/NetworkAccessView.tsx`

---

## 8) Label/Naming Updates

### Frontend implemented
- Renamed merchant finance nav/page label:
  - `Wallet & Balance` -> `Account status`
- Route remains `/dashboard/wallet`.

### Main frontend files
- `components/dashboard/DashboardSidebar.tsx`
- `app/dashboard/wallet/page.tsx`

---

## 9) Database and Storage Changes (Backend)

### Migrations
- `006_merchant_overhaul.sql`
  - `users.must_change_password`
  - `merchants.account_type`
  - new profile/update tables
- `007_merchant_gateways_default.sql`
  - backfill default gateway rows for existing merchants
- `008_backfill_legacy_individual_merchants.sql`
  - optional classification/backfill for legacy merchants

### Storage
- File storage moved to Supabase Storage-backed service.
- Env vars:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_STORAGE_BUCKET`

---

## 10) Reliability Fixes During Rollout (Backend)

- Fixed merchant delete FK failures by expanding deletion order (profile requests/docs/profiles/support then remaining rows).
- Fixed retry user conflict by adding cleanup rollback in typed create flows.

---

## Final Status / Handover Notes

This cycle now enforces the boss direction end-to-end:
- typed profile onboarding,
- admin-only creation,
- first-login password enforcement,
- merchant profile updates via admin-review workflow,
- merchant gateway editing disabled,
- simpler merchant settings/navigation,
- profile UI/edit aligned to individual/company/association/group models.

Primary references:
- `changes.md`
- `docs/BOSS_REQUESTED_CHANGES_SUMMARY_2026-03-23.md` (this combined summary)
