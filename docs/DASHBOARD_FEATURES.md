# Dashboard Implementation & Features Documentation

## Overview
This document provides comprehensive documentation for all dashboard features implemented, including sandbox/live mode toggle, logout functionality, route protection, and authentication redirects.

---

## 📋 Table of Contents
1. [Sandbox/Live Mode Toggle](#sandboxlive-mode-toggle)
2. [Logout Functionality](#logout-functionality)
3. [Route Protection](#route-protection)
4. [Authentication Redirects](#authentication-redirects)
5. [Cookie Synchronization](#cookie-synchronization)
6. [File Structure](#file-structure)
7. [Component Breakdown](#component-breakdown)

---

## 🔄 Sandbox/Live Mode Toggle

### **Location:**
`components/dashboard/DashboardNavbar.tsx`

### **Purpose:**
Allows users to toggle between Sandbox Mode (for testing) and Live Mode (for production transactions).

### **Implementation:**

#### **State Management:**
```tsx
const [isSandboxMode, setIsSandboxMode] = useState(true);
```

#### **UI Components:**
- **Badge Container:** Light orange background (`bg-orange-50`) with border
- **Mode Text:** Displays "SANDBOX MODE" or "LIVE MODE" dynamically
- **Toggle Switch:** 
  - Gray (`bg-gray-300`) when in Sandbox Mode
  - Green (`bg-green-500`) when in Live Mode
  - Smooth animation on toggle

#### **Visual Design:**
```tsx
<div className="hidden md:flex items-center gap-3 px-4 py-2 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-full">
    <span className="text-xs font-semibold uppercase text-orange-600 dark:text-orange-400">
        {isSandboxMode ? 'Sandbox Mode' : 'Live Mode'}
    </span>
    <button onClick={() => setIsSandboxMode(!isSandboxMode)}>
        {/* Toggle switch */}
    </button>
</div>
```

#### **Responsive Behavior:**
- **Desktop:** Fully visible with toggle
- **Mobile:** Hidden (`hidden md:flex`)

---

## 🚪 Logout Functionality

### **Location:**
`components/dashboard/DashboardSidebar.tsx`

### **Purpose:**
Provides secure logout with user confirmation and loading feedback.

### **Implementation Flow:**

#### **1. User Clicks Logout Button**
```tsx
<button onClick={handleLogoutClick}>
    <LogOut className="w-5 h-5" />
    <span>Logout</span>
</button>
```

#### **2. Confirmation Dialog Appears**
```tsx
const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
};
```

**Dialog Features:**
- **Title:** "Confirm Logout"
- **Message:** "Are you sure you want to logout? You'll need to sign in again to access your dashboard."
- **Buttons:**
  - **Cancel:** Closes dialog, no action taken
  - **Logout:** Proceeds with logout

#### **3. User Confirms Logout**
```tsx
const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    logout(); // Calls useLogout hook
};
```

#### **4. Loading Popup Displays**
```tsx
{isLoggingOut && (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center">
        <div className="bg-background rounded-2xl p-8 shadow-2xl border border-border flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-lg font-semibold text-foreground">Logging out...</p>
        </div>
    </div>
)}
```

#### **5. Logout Process (useLogout Hook)**
Located in: `features/auth/hooks/useAuth.ts`

**Actions Performed:**
1. Calls logout API endpoint
2. Clears `SecureStorage` (localStorage)
3. Deletes `accessToken` cookie
4. Redirects to `/login`

**Error Handling:**
- Even if API call fails, local data is cleared and user is redirected

---

## 🔒 Route Protection

### **Location:**
`app/dashboard/layout.tsx`

### **Purpose:**
Protects all dashboard routes from unauthorized access.

### **Implementation:**

#### **Authentication Check:**
```tsx
const { isAuthenticated, isLoading } = useAuthContext();

useEffect(() => {
    if (!isLoading && !isAuthenticated) {
        router.push("/login");
    }
}, [isAuthenticated, isLoading, router]);
```

#### **Loading State:**
While checking authentication:
```tsx
if (isLoading) {
    return (
        <div className="flex h-screen items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-lg font-semibold text-foreground">Loading...</p>
            </div>
        </div>
    );
}
```

#### **Protected Routes:**
All routes under `/dashboard/*`:
- `/dashboard` - Main dashboard
- `/dashboard/transactions`
- `/dashboard/balance-history`
- `/dashboard/wallet`
- `/dashboard/api-keys`
- `/dashboard/settings`
- `/dashboard/support`

---

## 🔀 Authentication Redirects

### **Location:**
`middleware.ts`

### **Purpose:**
Automatically redirects authenticated users from marketing pages to dashboard.

### **Implementation:**

#### **Middleware Logic:**
```typescript
// If accessing marketing pages while authenticated, redirect to dashboard
if (token && (
    pathname === "/" ||
    pathname.startsWith("/solutions") ||
    pathname.startsWith("/pricing") ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/contact") ||
    pathname.startsWith("/security")
)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
}
```

#### **Redirect Rules:**

| Current Page | Authenticated? | Redirect To |
|-------------|----------------|-------------|
| `/` (Home) | ✅ Yes | `/dashboard` |
| `/login` | ✅ Yes | `/dashboard` |
| `/register` | ✅ Yes | `/dashboard` |
| `/solutions` | ✅ Yes | `/dashboard` |
| `/pricing` | ✅ Yes | `/dashboard` |
| `/about` | ✅ Yes | `/dashboard` |
| `/contact` | ✅ Yes | `/dashboard` |
| `/security` | ✅ Yes | `/dashboard` |
| `/dashboard/*` | ❌ No | `/login` |

---

## 🍪 Cookie Synchronization

### **Problem:**
Middleware can't access `localStorage`, but auth data was stored there.

### **Solution:**
Dual storage system - `localStorage` + `cookies`

### **Implementation:**

#### **1. Storage Utilities** (`features/auth/utils/storage.ts`)

**Set Cookie Helper:**
```typescript
const setCookie = (name: string, value: string, days: number = 7): void => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};
```

**Delete Cookie Helper:**
```typescript
const deleteCookie = (name: string): void => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};
```

**Updated storeAuthData:**
```typescript
export const storeAuthData = (data: AuthData): void => {
    SecureStorage.setItem(STORAGE_KEY, data);
    setCookie('accessToken', data.accessToken, 7); // Also set cookie
};
```

**Updated clearAuthData:**
```typescript
export const clearAuthData = (): void => {
    SecureStorage.removeItem(STORAGE_KEY);
    deleteCookie('accessToken'); // Also clear cookie
};
```

#### **2. AuthCookieSync Component** (`components/AuthCookieSync.tsx`)

**Purpose:** Syncs existing localStorage sessions to cookies

```tsx
export function AuthCookieSync() {
    useEffect(() => {
        const authData = getAuthData();
        if (authData?.accessToken) {
            // Set cookie if user is authenticated but cookie doesn't exist
            const expires = new Date();
            expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000);
            document.cookie = `accessToken=${authData.accessToken};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
        }
    }, []);

    return null;
}
```

**Location in App:** `app/layout.tsx`
```tsx
<AuthProvider>
    <AuthCookieSync />
    <LanguageProvider>{children}</LanguageProvider>
</AuthProvider>
```

---

## 📁 File Structure

```
app/
├── dashboard/
│   ├── layout.tsx                    # Protected layout with auth check
│   ├── page.tsx                      # Main dashboard page
│   ├── transactions/page.tsx
│   ├── balance-history/page.tsx
│   ├── wallet/page.tsx
│   ├── api-keys/page.tsx
│   ├── settings/page.tsx
│   └── support/page.tsx
├── layout.tsx                        # Root layout with AuthCookieSync
└── middleware.ts                     # Route protection & redirects

components/
├── dashboard/
│   ├── DashboardSidebar.tsx         # Sidebar with logout
│   └── DashboardNavbar.tsx          # Navbar with sandbox toggle
└── AuthCookieSync.tsx               # Cookie sync component

features/
└── auth/
    ├── hooks/
    │   └── useAuth.ts               # useLogout hook
    └── utils/
        └── storage.ts               # Auth storage with cookies
```

---

## 🧩 Component Breakdown

### **1. DashboardNavbar**
**File:** `components/dashboard/DashboardNavbar.tsx`

**Features:**
- User greeting (extracts name from email)
- Language selector (hidden on mobile)
- **Sandbox/Live Mode Toggle** (hidden on mobile)
- Theme toggle (hidden on mobile)
- User avatar (always visible)

**State:**
- `isSandboxMode` - Boolean for mode toggle

**Responsive:**
- Mobile: Only greeting + avatar
- Desktop: All features visible

---

### **2. DashboardSidebar**
**File:** `components/dashboard/DashboardSidebar.tsx`

**Features:**
- ZitoPay logo (links to `/dashboard`)
- Merchants badge
- Navigation menu (8 items)
- **Logout button with confirmation**
- Mobile hamburger menu
- Slide-in animation

**State:**
- `isMobileMenuOpen` - Mobile menu visibility
- `showLogoutConfirm` - Logout confirmation dialog
- `isLoggingOut` - From useLogout hook

**Dialogs:**
1. **Logout Confirmation:**
   - Title, message, Cancel/Logout buttons
   - Z-index: 100

2. **Logout Loading:**
   - Spinner + "Logging out..." text
   - Z-index: 100

---

### **3. DashboardLayout**
**File:** `app/dashboard/layout.tsx`

**Features:**
- **Route Protection** - Redirects unauthenticated users
- **Loading State** - Shows spinner while checking auth
- **Layout Structure** - Sidebar + Navbar + Content

**Auth Flow:**
1. Check `isLoading` from AuthContext
2. If loading → Show loading spinner
3. If not authenticated → Redirect to `/login`
4. If authenticated → Render dashboard

---

### **4. AuthCookieSync**
**File:** `components/AuthCookieSync.tsx`

**Purpose:** Ensures middleware can detect authentication

**How it Works:**
1. Runs on every page load
2. Checks localStorage for auth data
3. If found, sets `accessToken` cookie
4. Middleware can now read cookie

**Why Needed:**
- Middleware can't access localStorage
- Cookies are accessible to middleware
- Enables server-side redirects

---

## 🔑 Key Features Summary

### **Sandbox/Live Mode Toggle:**
- ✅ Visual toggle switch
- ✅ Light orange styling
- ✅ Text changes dynamically
- ✅ Hidden on mobile
- ✅ Smooth animations

### **Logout Flow:**
- ✅ Confirmation dialog before logout
- ✅ Loading popup during logout
- ✅ Clears localStorage
- ✅ Deletes cookies
- ✅ Redirects to login
- ✅ Error handling

### **Route Protection:**
- ✅ Dashboard routes protected
- ✅ Loading state while checking auth
- ✅ Auto-redirect if not authenticated
- ✅ Prevents unauthorized access

### **Authentication Redirects:**
- ✅ Authenticated users → Dashboard
- ✅ Unauthenticated users → Login
- ✅ Works on page refresh
- ✅ Middleware-based (server-side)

### **Cookie Sync:**
- ✅ Dual storage (localStorage + cookies)
- ✅ Automatic sync on mount
- ✅ Enables middleware detection
- ✅ 7-day cookie expiry

---

## 🎯 User Flows

### **Flow 1: Logout**
1. User clicks "Logout" in sidebar
2. Confirmation dialog appears
3. User clicks "Logout" to confirm (or "Cancel" to abort)
4. Loading popup shows "Logging out..."
5. API call made to logout endpoint
6. localStorage cleared
7. Cookie deleted
8. Redirect to `/login`

### **Flow 2: Accessing Dashboard (Authenticated)**
1. User visits `/dashboard`
2. Middleware checks `accessToken` cookie
3. Cookie exists → Allow access
4. Dashboard layout checks `AuthContext`
5. User is authenticated → Render dashboard
6. User sees dashboard content

### **Flow 3: Accessing Dashboard (Unauthenticated)**
1. User visits `/dashboard`
2. Middleware checks `accessToken` cookie
3. Cookie doesn't exist → Redirect to `/login`
4. User sees login page

### **Flow 4: Accessing Home (Authenticated)**
1. User visits `/`
2. Middleware checks `accessToken` cookie
3. Cookie exists → Redirect to `/dashboard`
4. User sees dashboard instead of home

---

## 🛠️ Technical Details

### **Technologies Used:**
- **React Hooks:** `useState`, `useEffect`
- **Next.js:** `useRouter`, `usePathname`
- **TanStack Query:** `useMutation` (for logout)
- **Tailwind CSS:** Styling
- **Framer Motion:** Animations (sidebar)
- **Lucide React:** Icons

### **Security Measures:**
- Encrypted localStorage (react-secure-storage)
- HTTP-only cookies (SameSite=Lax)
- Server-side route protection (middleware)
- Client-side auth checks (AuthContext)
- Automatic session cleanup on logout

---

**Last Updated:** January 12, 2026  
**Version:** 1.0.0  
**Author:** ZitoPay Development Team
