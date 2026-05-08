# ZitoPay Authentication Infrastructure Documentation

## 📁 Project Structure

```
features/auth/
├── api/
│   └── index.ts          # API functions for backend calls
├── hooks/
│   ├── index.ts          # Export all hooks
│   ├── useAuth.ts        # Login, register, logout hooks
│   └── usePasswordReset.ts # Password reset hooks
├── context/
│   └── AuthContext.tsx   # Global auth state management
├── types/
│   └── index.ts          # TypeScript types
└── utils/
    └── storage.ts        # Secure token storage utilities

lib/
└── apiClient.ts          # Axios instance with interceptors

providers/
└── QueryProvider.tsx     # React Query provider

constants/
└── api.ts                # API configuration constants
```

---

## 🔐 Core Components

### 1. **Secure Storage (`features/auth/utils/storage.ts`)**

**Purpose:** Encrypt and store authentication data using `react-secure-storage`

**Key Functions:**
- `storeAuthData(data)` - Encrypts and stores user + tokens
- `getAuthData()` - Retrieves and decrypts auth data
- `getAccessToken()` - Gets only the access token
- `getRefreshToken()` - Gets only the refresh token
- `getCurrentUser()` - Gets only user info
- `clearAuthData()` - Removes all auth data (logout)
- `isAuthenticated()` - Checks if user is logged in

**Why:** Uses `react-secure-storage` to automatically encrypt tokens before storing in localStorage, preventing XSS attacks from stealing plain-text tokens.

---

### 2. **API Client (`lib/apiClient.ts`)**

**Purpose:** Axios instance with automatic token injection and refresh

**Features:**
- **Request Interceptor:** Automatically adds `Authorization: Bearer <token>` to protected endpoints
- **Response Interceptor:** Catches 401 errors and automatically refreshes expired tokens
- **Public Endpoints:** Skips auth for login, register, password reset, etc.

**Why:** Centralizes all API configuration so you never manually add auth headers. Handles token refresh transparently - if a request fails with 401, it refreshes the token and retries automatically.

---

### 3. **API Functions (`features/auth/api/index.ts`)**

**Purpose:** Simple functions that call backend endpoints

**Functions:**
- `register(credentials)` - POST /public/v1/auth/register
- `verifyEmail(payload)` - POST /public/v1/auth/verify-email
- `resendVerificationCode(payload)` - POST /public/v1/auth/resend-verification
- `login(credentials)` - POST /public/v1/auth/login
- `forgotPassword(payload)` - POST /public/v1/auth/forgot-password
- `verifyResetCode(payload)` - POST /public/v1/auth/verify-reset-code
- `resetPassword(payload)` - POST /public/v1/auth/reset-password
- `resendResetCode(payload)` - POST /public/v1/auth/resend-reset-code
- `getCurrentUser()` - GET /auth/v1/me
- `logout()` - POST /auth/v1/logout

**Why:** Keeps API calls simple and reusable. Each function does one thing - call the backend.

---

### 4. **React Query Hooks (`features/auth/hooks/`)**

**Purpose:** Provide React components with loading states, error handling, and automatic navigation

**Hooks:**

#### Authentication Hooks (`useAuth.ts`)
- `useRegister()` - Register user, navigate to verify-email-code
- `useVerifyEmail()` - Verify email, store tokens, navigate to email-verified
- `useResendVerification()` - Resend verification code
- `useLogin()` - Login user, store tokens, navigate to dashboard
- `useLogout()` - Logout user, clear tokens, navigate to login

#### Password Reset Hooks (`usePasswordReset.ts`)
- `useForgotPassword()` - Request reset code, navigate to verify-code
- `useVerifyResetCode()` - Verify reset code, navigate to reset-password
- `useResetPassword()` - Reset password, navigate to success page
- `useResendResetCode()` - Resend reset code

**Usage Example:**
```tsx
const { mutate: login, isPending, error } = useLogin();

const handleSubmit = (e) => {
  e.preventDefault();
  login({ email, password });
};

return (
  <form onSubmit={handleSubmit}>
    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
    <button disabled={isPending}>
      {isPending ? 'Logging in...' : 'Login'}
    </button>
    {error && <p>{error.message}</p>}
  </form>
);
```

**Why:** TanStack Query (React Query) provides:
- `isPending` - Shows loading state automatically
- `error` - Catches and displays errors
- `data` - Returns API response
- Automatic retries on failure
- Request deduplication
- Cache management

---

### 5. **Auth Context (`features/auth/context/AuthContext.tsx`)**

**Purpose:** Global state for current user accessible anywhere in the app

**Provides:**
- `user` - Current user object (id, email, role)
- `isAuthenticated` - Boolean if user is logged in
- `isLoading` - Boolean while checking auth status
- `setUser` - Function to update user

**Usage:**
```tsx
import { useAuthContext } from '@/features/auth/context/AuthContext';

function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please login</div>;

  return <div>Welcome, {user.email}!</div>;
}
```

**Why:** Provides user data to any component without prop drilling. Automatically loads user from encrypted storage on app start.

---

### 6. **Query Provider (`providers/QueryProvider.tsx`)**

**Purpose:** Wraps app with React Query for data fetching

**Configuration:**
- `staleTime: 60000` - Data stays fresh for 1 minute
- `refetchOnWindowFocus: false` - Don't refetch when window regains focus

**Why:** Required for all React Query hooks to work. Manages cache and request lifecycle.

---

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
npm install axios react-secure-storage @tanstack/react-query
```

### 2. Create Environment File
Create `.env.local` in project root:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

### 3. Wrap App with Providers
Update `app/layout.tsx`:
```tsx
import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from '@/features/auth/context/AuthContext';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
```

---

## 📝 Usage Examples

### Registration Flow

```tsx
"use client";

import { useState } from 'react';
import { useRegister } from '@/features/auth/hooks';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { mutate: register, isPending, error } = useRegister();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register({ email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        required 
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        required 
      />
      <button disabled={isPending}>
        {isPending ? 'Creating account...' : 'Register'}
      </button>
      {error && <p className="error">{error.message}</p>}
    </form>
  );
}
```

### Email Verification

```tsx
"use client";

import { useState } from 'react';
import { useVerifyEmail } from '@/features/auth/hooks';

export default function VerifyEmailPage() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  
  const { mutate: verify, isPending, error } = useVerifyEmail();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verify({ email, code });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        required 
      />
      <input 
        type="text" 
        value={code} 
        onChange={(e) => setCode(e.target.value)} 
        maxLength={6}
        required 
      />
      <button disabled={isPending}>
        {isPending ? 'Verifying...' : 'Verify Email'}
      </button>
      {error && <p className="error">{error.message}</p>}
    </form>
  );
}
```

### Login

```tsx
"use client";

import { useState } from 'react';
import { useLogin } from '@/features/auth/hooks';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { mutate: login, isPending, error } = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        required 
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        required 
      />
      <button disabled={isPending}>
        {isPending ? 'Logging in...' : 'Login'}
      </button>
      {error && <p className="error">{error.message}</p>}
    </form>
  );
}
```

### Password Reset

```tsx
"use client";

import { useState } from 'react';
import { useResetPassword } from '@/features/auth/hooks';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const { mutate: resetPassword, isPending, error } = useResetPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetPassword({ email, code, newPassword });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        required 
      />
      <input 
        type="text" 
        value={code} 
        onChange={(e) => setCode(e.target.value)} 
        maxLength={6}
        required 
      />
      <input 
        type="password" 
        value={newPassword} 
        onChange={(e) => setNewPassword(e.target.value)} 
        required 
      />
      <button disabled={isPending}>
        {isPending ? 'Resetting...' : 'Reset Password'}
      </button>
      {error && <p className="error">{error.message}</p>}
    </form>
  );
}
```

### Accessing User Data

```tsx
"use client";

import { useAuthContext } from '@/features/auth/context/AuthContext';
import { useLogout } from '@/features/auth/hooks';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuthContext();
  const { mutate: logout } = useLogout();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please login</div>;
  }

  return (
    <div>
      <h1>Welcome, {user.email}!</h1>
      <p>Role: {user.role}</p>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}
```

---

## 🔒 Security Features

### 1. **Encrypted Token Storage**
- Uses `react-secure-storage` to encrypt tokens before storing
- Prevents XSS attacks from stealing plain-text tokens
- Automatic encryption/decryption on read/write

### 2. **Automatic Token Refresh**
- Intercepts 401 errors
- Refreshes access token using refresh token
- Retries failed request with new token
- Redirects to login if refresh fails

### 3. **Secure API Client**
- Automatically adds Authorization header
- Only sends tokens to your API (not third-party)
- Clears tokens on logout

### 4. **Type Safety**
- Full TypeScript support
- Compile-time error checking
- IntelliSense autocomplete

---

## 🎯 Key Benefits

1. **Simple API** - Just call hooks, no manual token management
2. **Automatic Loading States** - `isPending` shows loading automatically
3. **Error Handling** - `error` object contains error messages
4. **Automatic Navigation** - Hooks navigate to next page on success
5. **Secure by Default** - Tokens encrypted, auto-refresh, type-safe
6. **Clean Code** - Separation of concerns (API, hooks, storage)
7. **Reusable** - Use same hooks across multiple pages

---

## 📚 File Responsibilities

| File | Responsibility |
|------|----------------|
| `api/index.ts` | Make HTTP requests to backend |
| `hooks/useAuth.ts` | Provide React hooks for auth actions |
| `hooks/usePasswordReset.ts` | Provide React hooks for password reset |
| `utils/storage.ts` | Encrypt/decrypt and store tokens |
| `context/AuthContext.tsx` | Global user state management |
| `types/index.ts` | TypeScript type definitions |
| `lib/apiClient.ts` | Axios configuration with interceptors |
| `providers/QueryProvider.tsx` | React Query setup |
| `constants/api.ts` | API URLs and constants |

---

## 🚦 Next Steps

1. ✅ Install dependencies
2. ✅ Create `.env.local` file
3. ⏳ Wrap app with providers in `app/layout.tsx`
4. ⏳ Connect hooks to auth pages
5. ⏳ Test registration flow
6. ⏳ Test login flow
7. ⏳ Test password reset flow

---

**Created:** January 12, 2026  
**Version:** 1.0
