# ZitoPay Project Structure - Complete Guide

This document explains the entire folder structure, file organization, and how Next.js routing determines which page shows up by default.

---

## 📁 Root Directory Overview

The project follows a **feature-based architecture** combined with Next.js App Router conventions. Here's what each top-level folder does:

```
zitopay/
├── app/              # Next.js routing & pages (what users see)
├── features/         # Business logic organized by domain
├── components/       # Reusable UI components
├── core/             # Infrastructure & shared utilities
├── lib/              # Third-party integrations & helpers
├── hooks/            # Custom React hooks
├── styles/           # (Removed - Using Tailwind CSS directly)
├── types/            # TypeScript type definitions
├── constants/        # App-wide constants (routes, roles, etc.)
├── public/           # Static assets (images, icons)
└── docs/             # This documentation!
```

---

## 🎯 The `app/` Directory - Where Magic Happens

The `app/` folder is where Next.js looks for routes and pages. Every folder here represents a URL path, and every `page.tsx` file becomes a route.

### Understanding Route Groups `(folder-name)`

Route groups are folders wrapped in parentheses like `(marketing)`. They're **organizational tools** that don't affect the URL structure.

**Important:** Route groups are invisible to the browser! They're just for organizing your code.

For example:
- `app/(marketing)/page.tsx` → Serves `/` (not `/marketing`)
- `app/(auth)/login/page.tsx` → Serves `/login` (not `/auth/login`)

### Why We Use Route Groups

Route groups let us:
1. **Apply different layouts** to different sections
2. **Organize code** without changing URLs
3. **Share common layouts** across related pages

---

## 🏠 How the Marketing Page Became the Default Landing Page

This is probably the most confusing part, so let's break it down step by step.

### The Root Route (`/`)

When someone visits your website's homepage (like `zitopay.com`), Next.js looks for a file to serve at the root path `/`.

### Next.js Route Resolution Priority

Next.js follows this order when determining what to show:

1. **First:** Check for `app/page.tsx` (direct root page) - ❌ We don't have this
2. **Second:** Look inside route groups for `page.tsx` files at the root level
3. **If multiple exist:** Next.js gets confused and throws errors (which we fixed!)

### Our Specific Case

In our project, we have:
```
app/
├── (marketing)/
│   └── page.tsx      ← This serves "/"
└── (auth)/
    └── login/
        └── page.tsx  ← This serves "/login"
```

Since there's no `app/page.tsx`, Next.js looks inside route groups. The `(marketing)/page.tsx` is the only `page.tsx` directly inside a route group at the root level, so it automatically becomes the homepage.

### What Happens When You Visit `/`?

1. User visits `http://localhost:3000/`
2. Next.js checks: "Do I have `app/page.tsx`?" → No
3. Next.js checks route groups: "Do I have `app/(marketing)/page.tsx`?" → Yes!
4. Next.js applies layouts in order:
   - `app/layout.tsx` (root layout - wraps everything)
   - `app/(marketing)/layout.tsx` (marketing-specific layout)
   - `app/(marketing)/page.tsx` (the actual content)

### Layout Nesting

Think of layouts like Russian nesting dolls:

```
Root Layout (app/layout.tsx)
  └─ HTML structure, fonts, QueryProvider
      └─ Marketing Layout (app/(marketing)/layout.tsx)
          └─ Navbar and Footer
              └─ Marketing Page (app/(marketing)/page.tsx)
                  └─ Your "Accept Mobile Money" content
```

Each layout wraps the content inside it, creating a layered structure.

---

## 📂 Detailed Folder Explanations

### `app/` - User-Facing Pages

This is where all the pages your users can visit live.

#### Route Structure:

```
app/
├── (marketing)/              # Public website
│   ├── layout.tsx           # Marketing navbar & footer
│   ├── page.tsx             # Homepage ("/")
│   ├── pricing/page.tsx     # "/pricing"
│   ├── solutions/page.tsx   # "/solutions"
│   ├── security/page.tsx    # "/security"
│   ├── contact/page.tsx     # "/contact"
│   └── about/page.tsx       # "/about"
│
├── (auth)/                  # Merchant authentication
│   ├── login/page.tsx       # "/login"
│   ├── register/page.tsx    # "/register"
│   ├── verify-email/page.tsx # "/verify-email"
│   └── forgot-password/page.tsx # "/forgot-password"
│
├── dashboard/               # Merchant dashboard (protected)
│   ├── layout.tsx           # Sidebar & merchant header
│   ├── page.tsx             # "/dashboard"
│   ├── transactions/page.tsx # "/dashboard/transactions"
│   ├── payments/page.tsx    # "/dashboard/payments"
│   ├── customers/page.tsx   # "/dashboard/customers"
│   ├── settlements/page.tsx # "/dashboard/settlements"
│   ├── api-keys/page.tsx    # "/dashboard/api-keys"
│   ├── webhooks/page.tsx    # "/dashboard/webhooks"
│   ├── analytics/page.tsx   # "/dashboard/analytics"
│   └── settings/page.tsx    # "/dashboard/settings"
│
├── admin/                   # Admin dashboard
│   ├── layout.tsx           # Admin sidebar & header
│   ├── page.tsx             # "/admin"
│   ├── login/page.tsx       # "/admin/login"
│   ├── merchants/page.tsx   # "/admin/merchants"
│   ├── transactions/page.tsx # "/admin/transactions"
│   ├── settlements/page.tsx # "/admin/settlements"
│   ├── fees/page.tsx        # "/admin/fees"
│   ├── integrations/page.tsx # "/admin/integrations"
│   └── system-settings/page.tsx # "/admin/system-settings"
│
├── docs/                    # Developer documentation
│   ├── layout.tsx           # Docs sidebar
│   ├── page.tsx             # "/docs"
│   ├── getting-started/page.tsx # "/docs/getting-started"
│   ├── authentication/page.tsx # "/docs/authentication"
│   ├── mtn-momo/page.tsx    # "/docs/mtn-momo"
│   ├── orange-money/page.tsx # "/docs/orange-money"
│   ├── webhooks/page.tsx    # "/docs/webhooks"
│   └── api-reference/page.tsx # "/docs/api-reference"
│
├── layout.tsx               # Root layout (applies to ALL pages)
├── error.tsx                # Error boundary (catches errors)
├── loading.tsx              # Loading state (shows while page loads)
└── not-found.tsx            # 404 page (when route doesn't exist)
```

**Key Files:**
- `layout.tsx` at root: Wraps EVERY page (provides HTML structure, fonts, React Query)
- `error.tsx`: Catches and displays errors gracefully
- `loading.tsx`: Shows a spinner while data loads
- `not-found.tsx`: Custom 404 page

---

### `features/` - Business Domain Logic

This folder contains all the business logic organized by feature/domain. Each feature is self-contained with its own API calls, data types, and components.

```
features/
├── auth/                    # Authentication logic
│   ├── api.ts              # Login, logout, session API calls
│   ├── queries.ts          # React Query hooks (useLogin, useSession)
│   ├── types.ts            # TypeScript types for auth
│   └── components/         # Auth-specific UI components
│
├── payments/               # Payment processing
│   ├── api.ts              # Payment API calls (MTN, Orange Money)
│   ├── queries.ts          # React Query hooks for payments
│   ├── types.ts            # Payment types (PaymentRequest, PaymentResponse)
│   └── components/
│       ├── PaymentProviderCard.tsx  # UI card for selecting provider
│       └── PaymentStatusBadge.tsx   # Status indicator badge
│
├── transactions/           # Transaction management
├── merchants/              # Merchant profile management
├── settlements/            # Settlement operations
├── apiKeys/                # API key management
├── webhooks/               # Webhook configuration
├── analytics/              # Analytics & reporting
└── admin/                  # Admin-specific operations
```

**Why This Structure?**

Each feature folder follows the same pattern:
- `api.ts` - Raw API functions (calls to backend)
- `queries.ts` - React Query hooks (handles caching, loading states)
- `types.ts` - TypeScript definitions
- `components/` - Feature-specific UI components

This makes the code:
- **Easy to find** - All payment-related code is in `features/payments/`
- **Self-contained** - Each feature manages its own logic
- **Reusable** - Can use `useLogin()` hook anywhere in the app

---

### `core/` - Infrastructure & Foundation

Think of this as the "plumbing" of your application - things that make everything else work.

```
core/
├── http/                   # HTTP client setup
│   ├── client.ts          # Main HTTP client (handles API calls)
│   ├── interceptors.ts    # Request/response interceptors (adds auth tokens)
│   └── errors.ts          # Custom error classes
│
├── query/                  # React Query configuration
│   ├── queryClient.ts     # Query client setup (caching rules)
│   └── provider.tsx       # QueryProvider component (wraps app)
│
├── auth/                   # Authentication utilities
│   ├── token.ts           # Token storage & refresh logic
│   ├── guards.ts          # Route protection helpers
│   └── permissions.ts     # Permission checking system
│
├── config/                 # Configuration
│   ├── env.ts             # Environment variables
│   └── app.config.ts      # App-wide settings
│
└── utils/                  # Utility functions
    ├── formatCurrency.ts  # Format money (1000 → "1,000 XOF")
    ├── formatDate.ts      # Format dates (ISO → "Jan 1, 2024")
    └── normalizeApiError.ts # Convert errors to readable messages
```

**Key Concepts:**

- **HTTP Client** (`core/http/client.ts`): A wrapper around `fetch()` that automatically adds authentication tokens to requests
- **Query Client** (`core/query/queryClient.ts`): Configures React Query's caching behavior (how long to cache data, when to refetch)
- **Token Management** (`core/auth/token.ts`): Handles storing and refreshing authentication tokens

---

### `components/` - Shared UI Components

This folder will contain reusable components that multiple pages might use. Think buttons, cards, modals, forms that appear throughout the app.

Currently empty, but you'd add things like:
- `Button.tsx` - Reusable button component
- `Card.tsx` - Card container component
- `Modal.tsx` - Dialog/modal component
- `Input.tsx` - Form input component

---

### `hooks/` - Custom React Hooks

React hooks are reusable functions that let components share stateful logic. These are app-wide hooks that can be used anywhere.

```
hooks/
├── useAuth.ts            # Authentication hook (current user, login/logout)
├── usePermissions.ts     # Permission checking hook
└── usePagination.ts      # Pagination logic hook
```

**Example:** `useAuth()` hook can be used in any component to get the current user:

```tsx
function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <LoginButton onClick={login} />;
  }
  
  return <div>Welcome, {user.name}!</div>;
}
```

---

### `lib/` - External Libraries & Helpers

This folder contains integrations with third-party libraries or helper functions for specific purposes.

```
lib/
├── markdown.ts           # Markdown/MDX rendering utilities
├── syntaxHighlight.ts    # Code syntax highlighting (for docs)
└── charts.ts             # Chart library helpers
```

These are typically placeholders that will be implemented when you add the actual libraries (like `remark` for markdown, `prism` for syntax highlighting).

---

### `app/globals.css` - Tailwind CSS Setup

We use **Tailwind CSS** for styling, which means you style directly in your components using utility classes. The only CSS file needed is:

```
app/
└── globals.css           # Tailwind directives & base styles
```

**What's in `globals.css`:**
- `@import "tailwindcss"` - Imports Tailwind's base, components, and utilities
- CSS variables for theming
- Dark mode support
- Custom utility classes (like `.text-balance`)

**With Tailwind, you don't need separate CSS files** - you style directly in your JSX:

```tsx
<div className="flex min-h-screen items-center justify-center bg-gray-50">
  <h1 className="text-4xl font-bold text-deep-blue-violet-600">Hello!</h1>
</div>
```

This is more maintainable because styles are co-located with components!

---

### `types/` - Global TypeScript Types

TypeScript type definitions that are used across multiple features or throughout the app.

```
types/
├── api.ts                # API response/request types
├── auth.ts               # Authentication-related types
└── index.ts              # Exports all types (makes importing easier)
```

**Why separate from features?**

Some types are shared across features. For example, `User` type might be used in `auth`, `merchants`, and `admin` features. Instead of duplicating, we define it once in `types/auth.ts`.

---

### `constants/` - App-Wide Constants

Values that don't change and are used throughout the application.

```
constants/
├── routes.ts             # All route paths as constants
├── roles.ts              # User roles ("merchant", "admin")
└── paymentProviders.ts   # Payment provider configurations
```

**Example from `constants/routes.ts`:**

```typescript
export const routes = {
  home: "/",
  login: "/login",
  dashboard: "/dashboard",
  // ... etc
};
```

Instead of writing `href="/dashboard"` everywhere, you can use `href={routes.dashboard}`. This makes refactoring easier - change the route in one place!

---

### `public/` - Static Assets

Files here are served directly by the server. No processing, no bundling - just served as-is.

```
public/
├── favicon.ico           # Browser tab icon
├── next.svg              # Images
└── vercel.svg
```

Access these files using `/filename.svg` (the `/` refers to the public folder).

---

## 🔐 How Route Protection Works

The `middleware.ts` file at the root level runs before every request and controls access to routes.

### Middleware Flow

1. **User visits a route** (e.g., `/dashboard`)
2. **Middleware runs first** (before the page loads)
3. **Middleware checks:**
   - Is this a public route? → Allow
   - Is user authenticated? → Check token
   - Does user have permission? → Verify role
4. **Decision:**
   - ✅ Allow → Show page
   - ❌ Block → Redirect to login

### Current Middleware Logic

```typescript
// Public routes (no auth required)
const publicRoutes = ["/", "/pricing", "/login", "/register", ...];

// Check if route is public
if (isPublicRoute && !token) {
  // Allow access to public routes
}

// Check protected routes
if (!isPublicRoute && !token) {
  // Redirect to login
  return NextResponse.redirect("/login");
}
```

**Note:** The current middleware is a basic implementation. In production, you'd add actual token validation and role-based access control.

---

## 🎨 Layout System Explained

Next.js layouts are powerful for creating consistent page structures. Here's how they work:

### Layout Hierarchy

Every page goes through this layout chain:

```
1. Root Layout (app/layout.tsx)
   ├─ HTML structure
   ├─ Fonts setup
   └─ QueryProvider (for React Query)
       │
       └─ 2. Route Group Layout (e.g., app/(marketing)/layout.tsx)
           ├─ Navbar
           └─ Footer
               │
               └─ 3. Page Content (app/(marketing)/page.tsx)
                   └─ Your actual content
```

### Layout Files

- **`app/layout.tsx`**: Applied to ALL pages. Contains `<html>`, `<body>`, fonts, global providers.
- **`app/(marketing)/layout.tsx`**: Only applied to marketing routes. Adds navbar and footer.
- **`app/dashboard/layout.tsx`**: Only applied to `/dashboard/*` routes. Adds sidebar and merchant header.

### The `children` Prop

Layouts receive a `children` prop that contains the page content:

```tsx
export default function MarketingLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}  {/* This is the page content */}
      <Footer />
    </>
  );
}
```

The `{children}` is where the actual page gets rendered.

---

## 🔄 Data Fetching with React Query

We use **TanStack Query** (formerly React Query) for data fetching. Here's how it works:

### The Flow

1. **Component needs data** → Calls a hook like `usePayments()`
2. **Hook checks cache** → "Do I have this data already?"
3. **If cached & fresh** → Return cached data immediately
4. **If not cached or stale** → Fetch from API
5. **Update cache** → Store for next time
6. **Return data** → Component renders

### Example from `features/payments/queries.ts`

```typescript
export function usePayments() {
  return useQuery({
    queryKey: ["payments"],           // Cache key
    queryFn: () => paymentsApi.list(), // Function to fetch data
  });
}
```

**In a component:**

```tsx
function TransactionsPage() {
  const { data, isLoading, error } = usePayments();
  
  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage />;
  
  return <TransactionList transactions={data} />;
}
```

React Query automatically handles:
- ✅ Loading states
- ✅ Error handling
- ✅ Caching (no duplicate requests)
- ✅ Refetching on window focus
- ✅ Retry logic

---

## 🚀 Key Next.js Concepts

### Server Components vs Client Components

By default, all components in the `app/` directory are **Server Components**. They render on the server, which means:
- ✅ Faster initial load
- ✅ Smaller JavaScript bundle
- ✅ Can access database directly
- ❌ Can't use browser APIs (localStorage, window)
- ❌ Can't use React hooks (useState, useEffect)

To make a component a **Client Component**, add `"use client"` at the top:

```tsx
"use client";

import { useState } from "react";

export default function InteractiveComponent() {
  const [count, setCount] = useState(0);
  // Now we can use hooks and browser APIs!
}
```

**Rule of thumb:**
- Default: Server Component (faster, better SEO)
- Add `"use client"` only when you need interactivity or browser APIs

---

### File Naming Conventions

Next.js uses special file names with special meanings:

- `page.tsx` → Creates a route (what users visit)
- `layout.tsx` → Creates a layout (wraps pages)
- `loading.tsx` → Shows while page is loading
- `error.tsx` → Error boundary (catches errors)
- `not-found.tsx` → 404 page
- `route.ts` → API route (backend endpoint)

These are **reserved names** - Next.js recognizes them and treats them specially.

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot have two parallel pages"

**Problem:** Multiple route groups have `page.tsx` at the same level, both resolving to `/`.

**Solution:** Only one route group can have a root `page.tsx`, or use explicit routes like `/dashboard` or `/admin`.

**What we did:** Moved merchant routes to `/dashboard/*`, admin routes to `/admin/*`, and kept marketing at `/`.

---

### Issue: "Module not found: @tanstack/react-query"

**Problem:** The `QueryProvider` requires React Query, but it's not installed.

**Solution:** Install it:
```bash
npm install @tanstack/react-query
```

---

### Issue: Styles not applying

**Problem:** Tailwind classes aren't working.

**Solution:** Make sure `globals.css` is imported in `app/layout.tsx` and Tailwind is configured in `postcss.config.mjs`.

---

## 📝 Summary: Why Marketing is Default

To bring it all together, here's the complete answer:

1. **No explicit root page** - We don't have `app/page.tsx`
2. **Route groups don't create URLs** - `(marketing)` doesn't become `/marketing`
3. **Next.js finds `(marketing)/page.tsx`** - This is the only `page.tsx` at root level in route groups
4. **Next.js maps it to `/`** - Because it's in a route group at root level
5. **Layouts apply** - Root layout wraps marketing layout wraps page content
6. **User sees marketing page** - Beautiful landing page with "Accept Mobile Money Payments with Ease"

**The key insight:** Route groups are organizational - they help you manage layouts and code organization without affecting the actual URLs users visit.

---

## 🎓 Next Steps

Now that you understand the structure:

1. **Install dependencies** - Run `npm install @tanstack/react-query`
2. **Set up environment variables** - Create `.env.local` with API URLs
3. **Implement API calls** - Connect the feature API files to your backend
4. **Add authentication logic** - Implement token validation in middleware
5. **Build out components** - Create reusable UI components in `components/`
6. **Style your pages** - Customize the Tailwind classes to match your brand

Happy coding! 🚀
