# Frontend Merchant Onboarding API (Auth + Profiles)

This document describes the backend routes that were changed or added to support the new onboarding model:
1. Merchants are created by an admin only.
2. Admin creates a merchant + sends temporary password by email.
3. On the merchant's first login, the API returns `mustChangePassword=true` to force a password-change screen.
4. Merchants cannot edit profile/account data directly; they must request updates which admins review/approve.

Base URLs in this codebase:
- Auth uses `POST /public/v1/...` for public endpoints and `.../auth/...` for JWT-protected endpoints.
- Admin endpoints use `.../admin/v1/...`.
- Merchant endpoints use `.../merchant/v1/...`.

Auth model:
- JWT is used via `Authorization: Bearer <accessToken>`.
- The API expects `role` to be `admin` for admin-only operations.

---

## 0) Important behavior changes (backend-enforced)

### Self registration is disabled (merchant cannot create their account)
- `POST /public/v1/auth/register`
- `POST /public/v1/auth/register-dev`

If merchant self-registration is disabled, these routes return `403`.

### Merchant direct profile/account edits are blocked
Merchants can only change their profile by submitting an update request:
- `PUT /merchant/v1/profile` returns `403` for non-admins.
- `PUT /merchant/v1/merchants/:id` returns `403` for non-admins.

Admins can still use these PUT endpoints for support purposes.

---

## 1) First-login password change flow

The backend uses `users.must_change_password` to signal first-login state.

Frontend rules:
- After login, check `mustChangePassword`.
- If `true`, redirect the user to the “Change password” page before allowing the rest of the app.

### Field
- `mustChangePassword: boolean`

### Cleared after password change
When the user successfully changes password (`PUT /auth/v1/change-password`), the backend clears `users.must_change_password=false`.

---

## 2) Authentication routes

### POST /public/v1/auth/register
Self-registration for merchants (disabled in production by configuration).

Request body
```json
{
  "email": "string",
  "password": "string"
}
```

Responses
- `201`:
```json
{
  "success": true,
  "message": "Verification code sent to your email",
  "userId": "uuid"
}
```
- `403` (self-registration disabled):
```json
{
  "error": "Forbidden",
  "message": "Self-registration is currently disabled. Please apply via our application form.",
  "applicationFormUrl": "string | null",
  "allowSelfRegistration": false
}
```
- `503` (platform settings lookup failure):
```json
{
  "error": "Service Unavailable",
  "message": "Registration is currently unavailable. Please contact support.",
  "allowSelfRegistration": false
}
```

Notes
- Frontend should not use this route after the new onboarding model is enabled.

---

### POST /public/v1/auth/register-dev
Dev/test registration (also disabled by the same self-registration gate).

Request body: same as `/register`.

Responses
- `201`:
  (returns tokens immediately in dev mode; see controller for exact fields)
- `403` / `503` are returned by the same self-registration middleware when disabled or on settings errors.

---

### POST /public/v1/auth/verify-email
Email verification for the register flow.

Request body
```json
{
  "email": "string",
  "code": "string"
}
```

Responses
- `200`:
```json
{
  "success": true,
  "accessToken": "string",
  "refreshToken": "string",
  "mustChangePassword": false,
  "user": {
    "id": "uuid",
    "email": "string",
    "role": "string"
  }
}
```

---

### POST /public/v1/auth/login
Merchant login (admin also works, but returns access only based on user role).

Request body
```json
{
  "email": "string",
  "password": "string"
}
```

Responses
- `200`:
```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "mustChangePassword": true,
  "user": {
    "id": "uuid",
    "email": "string",
    "role": "string"
  },
  "expiresIn": 1800
}
```
- `401`:
```json
{
  "error": "Unauthorized",
  "message": "Invalid email or password"
}
```
- `403` (email not verified; used by the old flows):
```json
{
  "error": "Forbidden",
  "message": "Please verify your email before logging in",
  "emailVerified": false
}
```

Frontend: redirect to password-change page if `mustChangePassword=true`.

---

### POST /public/v1/auth/admin/login
Admin login. Same request body as `/login`.

Request body
```json
{
  "email": "string",
  "password": "string"
}
```

Responses
- `200` is the same as `/login`, including `mustChangePassword`.
- `403` if the user is not an admin:
```json
{
  "error": "Forbidden",
  "message": "Admin access required. Please use the merchant login."
}
```

---

### POST /public/v1/auth/refresh
Get a new access token from refresh token.

Request body
```json
{
  "refreshToken": "string"
}
```

Responses
- `200`:
```json
{
  "accessToken": "string",
  "mustChangePassword": true,
  "expiresIn": 1800
}
```
- `401`:
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired refresh token"
}
```

---

### POST /auth/v1/logout
Logout (blacklists refresh/access tokens in Redis).

Headers
- `Authorization: Bearer <accessToken>`

Response
- `200`:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### GET /auth/v1/me
Fetch current user.

Headers
- `Authorization: Bearer <accessToken>`

Response
- `200`:
```json
{
  "id": "uuid",
  "email": "string",
  "role": "string",
  "mustChangePassword": true
}
```

---

### PUT /auth/v1/change-password
Change password for authenticated user. This clears the first-login flag.

Headers
- `Authorization: Bearer <accessToken>`

Request body
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

Validation
- `newPassword` must be at least 6 chars (backend rule)

Responses
- `200`:
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```
- `400` (wrong current password):
```json
{
  "error": "Bad Request",
  "message": "Current password is incorrect"
}
```

Frontend:
- After success, call `GET /auth/v1/me` or just proceed; backend clears `mustChangePassword=false`.

---

## 3) Admin-driven merchant creation (NEW)

All merchant creation is admin-only.
These endpoints are IAM-protected; frontend should call them only from the admin panel.

Common response
- `201` returns merchant identifiers and `sandboxApiKey`.
- The temporary password is not returned here; it is sent by email to the merchant.

### POST /admin/v1/merchants/create/individual
Creates an INDIVIDUAL merchant + profile + linked documents.

Auth
- Admin only.

Request body (required fields)
- `email`
- `firstName`, `lastName`
- `dateOfBirth`, `gender`
- `phone`, `address`
- `idType`, `idNumber`, `niu` (niu is optional in schema but accepted)
- `doingBusinessAs`
- `passportPhoto` (base64 file object)
- `idDocuments` (array of 1..10 base64 file objects)
- `businessLogo` (optional; can be omitted or set to `null`)
- `country` (optional)

Base64 file object format
```json
{
  "base64": "string",
  "filename": "string",
  "mimeType": "string"
}
```

Response (`201`)
```json
{
  "success": true,
  "message": "Individual merchant created. Credentials sent via email.",
  "merchant": {
    "userId": "uuid",
    "merchantId": "uuid",
    "email": "string",
    "businessName": "string",
    "feePayer": "string",
    "sandboxApiKey": "string"
  }
}
```

Notes
- `idDocuments` max is 10.
- `businessLogo` can be `null`.

---

### POST /admin/v1/merchants/create/company
Creates a COMPANY merchant + institution profile + linked documents.

Auth
- Admin only.

Request body (required fields)
- `email`
- `institutionName`
- `registrationNumber`
- `dateOfCreation`
- `niu` (optional)
- `managerName`, `managerContact`, `managerAddress`
- `address`, `contactPhone`, `contactEmail`
- `documents` (array of 1..10 base64 file objects)
- `country` (optional)

Response (`201`)
same shape as the INDIVIDUAL route (with `businessName` set to the institution name).

---

### POST /admin/v1/merchants/create/association
Same as COMPANY, but `documentRole` becomes `ASSOCIATION_DOCUMENT`.

Response shape is the same.

---

### POST /admin/v1/merchants/create/group
Same as ASSOCIATION, but `documentRole` becomes `GROUP_DOCUMENT`.

Response shape is the same.

---

### POST /admin/v1/merchants/create (legacy)
Creates a merchant with minimal legacy fields.

Request body
```json
{
  "email": "string",
  "businessName": "string",
  "phone": "string | optional",
  "businessType": "string | optional",
  "country": "string | optional"
}
```

Response (`201`)
```json
{
  "success": true,
  "message": "Merchant account created successfully. Credentials sent via email.",
  "merchant": {
    "userId": "uuid",
    "merchantId": "uuid",
    "email": "string",
    "businessName": "string",
    "feePayer": "string",
    "sandboxApiKey": "string"
  }
}
```

---

## 4) Merchant profile update request flow (NEW)

Merchants cannot edit their profile/account directly. They must submit an update request.

### POST /merchant/v1/profile/update-request
Submit a profile update request for review by admin.

Auth
- Merchant auth required (JWT).

Headers
- `Authorization: Bearer <accessToken>`

Request body
```json
{
  "proposedChanges": {
    "merchant": { "businessName": "string", "email": "string", "phone": "string", "businessType": "string", "country": "string" },
    "individual": { "firstName": "string", "lastName": "string", "...": "other individual fields" },
    "institution": { "institutionName": "string", "registrationNumber": "string", "...": "other institution fields" }
  },
  "changeDescription": "string | optional",
  "supportingFileIds": ["uuid", "..."] 
}
```

Responses
- `201`:
```json
{
  "id": "uuid",
  "message": "Profile update request submitted"
}
```
- `401`:
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```
- `409` if a pending request already exists for that merchant.

---

### GET /merchant/v1/profile/update-requests
List the current merchant’s update requests.

Auth: JWT

Response (`200`)
```json
{
  "requests": [ { "...": "update request rows" } ]
}
```

The backend returns DB fields such as:
- `id`, `merchantId`, `submittedBy`, `status`, `proposedChanges` (JSON stored as text), `supportingFileIds` (JSON stored as text), `createdAt`, etc.

---

## 5) Admin review endpoints (NEW)

### GET /admin/v1/merchants/profile-update-requests?status=...
List profile update requests for review (admin only).

Query params
- `status` (optional): e.g. `PENDING`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`

Response (`200`)
```json
{
  "requests": [ { "...": "update request rows" } ]
}
```

---

### POST /admin/v1/merchants/profile-update-requests/:id/approve
Approve a profile update request and apply text changes.

Params
- `id` (string, request id)

Response (`200`)
```json
{
  "success": true,
  "message": "Request approved and profile updated"
}
```

---

### POST /admin/v1/merchants/profile-update-requests/:id/reject
Reject a profile update request.

Params
- `id` (string, request id)

Request body
```json
{
  "rejectionReason": "string | optional"
}
```

Response (`200`)
```json
{
  "success": true,
  "message": "Request rejected"
}
```

---

## 6) Profile edit endpoints (now blocked for merchants)

The following endpoints are still present for backward compatibility, but they are not allowed for merchants anymore.

### PUT /merchant/v1/profile
Merchant tries to update their profile directly.

Auth
- JWT required.

Responses
- `403` for non-admins:
```json
{
  "error": "Forbidden",
  "code": "USE_PROFILE_UPDATE_REQUEST",
  "message": "Direct profile updates are not allowed. Submit a profile update request via POST /merchant/v1/profile/update-request instead."
}
```
- Admins can still use this endpoint for support.

---

### PUT /merchant/v1/merchants/:id
General merchant update endpoint.

Auth
- JWT required.

Responses
- `403` for non-admins:
```json
{
  "error": "Forbidden",
  "code": "USE_PROFILE_UPDATE_REQUEST",
  "message": "Direct profile updates are not allowed. Submit a profile update request via POST /merchant/v1/profile/update-request instead."
}
```

---

## 7) Merchant account creation is admin-only

### POST /merchant/v1/merchants
This route exists, but now it is admin-only.

Auth
- JWT required.

Body
- Uses the existing `createMerchantSchema`:
```json
{
  "businessName": "string",
  "email": "string | optional",
  "phone": "string | optional",
  "businessType": "string | optional",
  "country": "string | optional"
}
```

Response when a non-admin tries to call it
- `403`:
```json
{
  "error": "Forbidden",
  "code": "ADMIN_ONLY",
  "message": "Merchant account creation is admin-only."
}
```

---

## 8) File/document endpoints note (Supabase-backed)

The API endpoints for file upload and signed URLs remain the same, but the storage backend was switched to Supabase Storage.

Frontend usage typically:
- Upload documents using multipart:
  - `POST /files/v1/upload` (generic)
  - `POST /files/v1/kyc`
  - `POST /files/v1/payout-csv`
- Then request a signed URL for display/download:
  - `GET /files/v1/:id/signed-url`

Signed URL response (`GET /files/v1/:id/signed-url`, `200`)
```json
{
  "url": "string",
  "expiresAt": "ISO-string"
}
```

When you need to attach supporting docs to a profile update request:
- Upload the files first, then use the returned `uploaded_files.id` values in `supportingFileIds` of `POST /merchant/v1/profile/update-request`.

---

## 9) Implementation note / residual risk

Approved profile updates currently apply only the structured/text fields from `proposedChanges`.
File attachments in `supportingFileIds` are stored with the request for review purposes, but are not automatically merged into the live profile document set on approve (unless future work adds that).

---

## Appendix: Suggested frontend flow

1. Admin creates merchant via `POST /admin/v1/merchants/create/...`.
2. Merchant receives email with temporary password.
3. Merchant logs in via `POST /public/v1/auth/login`.
4. If `mustChangePassword=true`, show the change-password page:
   - `PUT /auth/v1/change-password`
5. Merchant cannot edit profile directly; they submit changes with:
   - `POST /merchant/v1/profile/update-request`
6. Admin reviews and approves/rejects:
   - `GET /admin/v1/merchants/profile-update-requests`
   - `POST /admin/v1/merchants/profile-update-requests/:id/approve`
   - `POST /admin/v1/merchants/profile-update-requests/:id/reject`

