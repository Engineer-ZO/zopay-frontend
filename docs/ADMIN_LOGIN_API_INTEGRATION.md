# Admin Login API Integration Documentation

**Date:** January 13, 2026  
**Status:** ✅ Complete

---

## 🎯 OVERVIEW

The admin login functionality has been fully integrated with the backend API, following the same secure pattern as the merchant login.

---

## 📁 FILES CREATED/MODIFIED

### **1. API Function** (`features/auth/api/index.ts`)
```typescript
/**
 * Admin login with email and password
 * Returns admin user data and tokens
 * Only allows users with 'admin' role
 */
export const adminLogin = async (credentials: LoginRequest): Promise<LoginResponse> => {
    const { data} = await apiClient.post<LoginResponse>('/public/v1/auth/admin/login', credentials);
    return data;
};
```

### **2. React Hook** (`features/auth/hooks/useAuth.ts`)
```typescript
/**
 * Hook for admin login
 * Stores tokens and navigates to admin dashboard
 * Only allows users with 'admin' role
 */
export const useAdminLogin = (): UseMutationResult<LoginResponse, Error, LoginRequest> => {
    const router = useRouter();

    return useMutation({
        mutationFn: (credentials: LoginRequest) => adminLogin(credentials),
        onSuccess: (data) => {
            // Store authentication data securely
            storeAuthData({
                user: data.user,
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
            });

            // Navigate to admin dashboard
            router.push('/admin/dashboard');
        },
    });
};
```

### **3. Admin Login Page** (`app/admin/login/page.tsx`)
- Uses `useAdminLogin` hook
- Proper error handling
- Loading states
- Secure password input
- Remember me checkbox
- Forgot password link

---

## 🔐 API ENDPOINT

**Endpoint:** `POST /public/v1/auth/admin/login`

**Request:**
```json
{
  "email": "admin@zitopay.com",
  "password": "AdminPassword123!"
}
```

**Success Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "email": "admin@zitopay.com",
    "role": "admin"
  },
  "expiresIn": "15m"
}
```

**Error Responses:**

**401 Unauthorized:**
```json
{
  "error": "Unauthorized",
  "message": "Invalid email or password"
}
```

**403 Forbidden (Not Admin):**
```json
{
  "error": "Forbidden",
  "message": "Admin access required. Please use the merchant login."
}
```

**403 Forbidden (Email Not Verified):**
```json
{
  "error": "Forbidden",
  "message": "Please verify your email before logging in",
  "emailVerified": false
}
```

---

## 💾 DATA STORAGE

### **Secure Storage**
Uses the same `storeAuthData` function from `features/auth/utils/storage.ts`:

```typescript
storeAuthData({
    user: data.user,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
});
```

**Storage Location:** `localStorage` (encrypted with secure-ls)

**Storage Key:** `zitopay_auth`

**Data Stored:**
- User object (id, email, role)
- Access token (JWT)
- Refresh token (JWT)

---

## 🔄 AUTHENTICATION FLOW

```
1. User visits /admin
   ↓
2. Redirects to /admin/login
   ↓
3. User enters credentials
   ↓
4. Click "Sign In"
   ↓
5. useAdminLogin hook called
   ↓
6. POST /public/v1/auth/admin/login
   ↓
7. Backend validates:
   - Email exists
   - Password correct
   - User role is 'admin'
   - Email is verified
   ↓
8. On success:
   - Store tokens in localStorage
   - Redirect to /admin/dashboard
   ↓
9. Admin dashboard layout checks auth
   - If authenticated → Show dashboard
   - If not → Redirect to login
```

---

## 🎨 UI FEATURES

### **Admin Login Page:**
- Blue/purple gradient background
- ZitoPay logo with "ADMIN" badge
- Email and password inputs
- Show/hide password toggle
- Remember me checkbox
- Forgot password link
- Loading spinner during login
- Error message display
- Link to merchant login
- Security notice

### **Loading States:**
- Button disabled during login
- Spinner animation
- "Signing in..." text
- All inputs disabled

### **Error Handling:**
- Display error messages in red alert box
- Specific error messages from API
- Fallback to generic error message

---

## 🔒 SECURITY FEATURES

1. **Role Validation:** Backend ensures only admin users can login
2. **Secure Storage:** Tokens stored using secure-ls encryption
3. **HTTPS Only:** API calls over HTTPS
4. **JWT Tokens:** Short-lived access tokens (15 minutes)
5. **Refresh Tokens:** Long-lived refresh tokens for session renewal
6. **Email Verification:** Required before login
7. **Audit Logging:** All admin actions logged (backend)

---

## 📊 COMPARISON: MERCHANT VS ADMIN LOGIN

| Feature | Merchant Login | Admin Login |
|---------|---------------|-------------|
| **Endpoint** | `/public/v1/auth/login` | `/public/v1/auth/admin/login` |
| **Hook** | `useLogin` | `useAdminLogin` |
| **Page** | `/login` | `/admin/login` |
| **Redirect** | `/dashboard` | `/admin/dashboard` |
| **Allowed Roles** | `merchant-user` | `admin` only |
| **Theme** | Orange/Blue | Blue/Purple |
| **Storage** | Same (`storeAuthData`) | Same (`storeAuthData`) |
| **Error Handling** | Same pattern | Same pattern |

---

## 🧪 TESTING

### **Test Cases:**

1. **Valid Admin Login:**
   - Email: `admin@zitopay.com`
   - Password: Valid password
   - Expected: Redirect to `/admin/dashboard`

2. **Invalid Credentials:**
   - Email: `admin@zitopay.com`
   - Password: Wrong password
   - Expected: Error message "Invalid email or password"

3. **Merchant User Trying Admin Login:**
   - Email: `merchant@example.com`
   - Password: Valid password
   - Expected: Error "Admin access required"

4. **Unverified Email:**
   - Email: Unverified admin email
   - Password: Valid password
   - Expected: Error "Please verify your email"

5. **Loading State:**
   - Submit form
   - Expected: Button disabled, spinner shown

6. **Network Error:**
   - Disconnect network
   - Submit form
   - Expected: Error message displayed

---

## 🚀 USAGE EXAMPLE

```typescript
// In any component
import { useAdminLogin } from '@/features/auth/hooks';

function AdminLoginForm() {
  const { mutate: adminLogin, isPending, error } = useAdminLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    adminLogin({ 
      email: 'admin@zitopay.com', 
      password: 'password123' 
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div>{error.message}</div>}
      <input type="email" />
      <input type="password" />
      <button disabled={isPending}>
        {isPending ? 'Loading...' : 'Login'}
      </button>
    </form>
  );
}
```

---

## ✅ IMPLEMENTATION CHECKLIST

- [x] Create `adminLogin` API function
- [x] Create `useAdminLogin` hook
- [x] Export hook from index
- [x] Update admin login page to use hook
- [x] Add loading states
- [x] Add error handling
- [x] Test with backend API
- [x] Document implementation

---

## 📝 NOTES

1. **Same Storage Pattern:** Admin and merchant use the same `storeAuthData` function, so they share the same localStorage key. This means logging in as admin will overwrite merchant session and vice versa.

2. **Role-Based Access:** The backend enforces role validation. Frontend should also check user role before showing admin features.

3. **Token Refresh:** Both admin and merchant use the same token refresh logic in `lib/apiClient.ts`.

4. **Logout:** Admin logout uses the same `useLogout` hook, which clears all auth data.

---

## 🔗 RELATED FILES

- `features/auth/api/index.ts` - API functions
- `features/auth/hooks/useAuth.ts` - Auth hooks
- `features/auth/hooks/index.ts` - Hook exports
- `features/auth/utils/storage.ts` - Secure storage
- `app/admin/login/page.tsx` - Admin login page
- `app/admin/dashboard/layout.tsx` - Admin dashboard layout
- `lib/apiClient.ts` - API client with interceptors

---

## 🎉 SUMMARY

The admin login is now fully integrated with the backend API using:
- ✅ Secure API endpoint (`/public/v1/auth/admin/login`)
- ✅ React Query mutation hook (`useAdminLogin`)
- ✅ Encrypted localStorage storage
- ✅ Proper error handling
- ✅ Loading states
- ✅ Auto-redirect to admin dashboard
- ✅ Role validation
- ✅ Same security pattern as merchant login

**Admin login is production-ready!** 🚀
