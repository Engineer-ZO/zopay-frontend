# ZitoPay Merchant Dashboard Documentation

## Overview
This document provides a complete guide to the ZitoPay Merchant Dashboard implementation, including file structure, components, routing, and design decisions.

---

## 📁 File Structure

```
app/
└── dashboard/
    ├── layout.tsx                    # Main dashboard layout wrapper
    ├── page.tsx                      # Dashboard home page (Business Dashboard)
    ├── transactions/
    │   └── page.tsx                  # Transactions page
    ├── balance-history/
    │   └── page.tsx                  # Balance History page
    ├── wallet/
    │   └── page.tsx                  # Wallet management page
    ├── api-keys/
    │   └── page.tsx                  # API Keys management page
    ├── settings/
    │   └── page.tsx                  # Settings page
    └── support/
        └── page.tsx                  # Help & Support page

components/
└── dashboard/
    ├── DashboardSidebar.tsx          # Left navigation sidebar
    └── DashboardNavbar.tsx           # Top navigation bar
```

---

## 🎨 Components

### 1. **DashboardSidebar** (`components/dashboard/DashboardSidebar.tsx`)

**Purpose:** Left navigation sidebar for the dashboard

**Location:** Displayed on the left side of all dashboard pages

**Features:**
- ZitoPay logo at the top (links to home page `/`)
- "Merchants" badge with emerald green styling
- Navigation menu with 8 items
- Active state highlighting (emerald green background)
- Logout button at the bottom
- Uses `usePathname()` to detect active route
- Uses `useAuthContext()` to access user data

**Navigation Items:**
1. **Dashboard** → `/dashboard`
2. **Transactions** → `/dashboard/transactions`
3. **Balance History** → `/dashboard/balance-history`
4. **Wallet** → `/dashboard/wallet`
5. **API Keys** → `/dashboard/api-keys`
6. **Settings** → `/dashboard/settings`
7. **Documentation** → `/docs`
8. **Help & Support** → `/dashboard/support`

**Icons Used (from lucide-react):**
- `LayoutDashboard` - Dashboard
- `ArrowLeftRight` - Transactions
- `History` - Balance History
- `Wallet` - Wallet
- `Key` - API Keys
- `Settings` - Settings
- `FileText` - Documentation
- `HelpCircle` - Help & Support
- `LogOut` - Logout
- `Store` - Merchants badge

**Styling:**
- Width: `w-64` (256px)
- Background: `bg-background` (theme-aware)
- Border: `border-r border-border`
- Active state: `bg-emerald-500/10 text-emerald-600`
- Hover state: `hover:bg-muted hover:text-foreground`

---

### 2. **DashboardNavbar** (`components/dashboard/DashboardNavbar.tsx`)

**Purpose:** Top navigation bar with user info and actions

**Location:** Displayed at the top of all dashboard pages

**Features:**
- User greeting (extracts username from email)
- Language selector (Globe icon + "English" + dropdown)
- **SANDBOX MODE** badge (orange, uppercase)
- Theme toggle button
- User avatar (circular, emerald green with initials)
- Uses `useAuthContext()` to access user data

**Components:**
1. **Greeting:** "Hi, [username]" (extracted from email before @)
2. **Language Selector:** Button with Globe icon
3. **Sandbox Mode Badge:** Orange background, white text
4. **Theme Toggle:** Imported from `@/components/ThemeToggle`
5. **User Avatar:** Circular div with user initials

**Helper Functions:**
- `getInitials(email: string)`: Extracts first 2 characters from email for avatar

**Styling:**
- Height: `h-16` (64px)
- Background: `bg-background`
- Border: `border-b border-border`
- Sandbox badge: `bg-crimson-red-500 text-white rounded-full`
- Avatar: `w-9 h-9 rounded-full bg-emerald-500`

---

## 📄 Pages

### 1. **Dashboard Home** (`app/dashboard/page.tsx`)

**Route:** `/dashboard`

**Purpose:** Main business dashboard with stats and charts

**Components:**
1. **Header Section:**
   - Title: "Business Dashboard"
   - Subtitle: "Monitor your transactions and business performance"
   - Date badge (emerald green)
   - Action buttons: "Withdraw" (emerald) and "Top Up" (outlined)

2. **Stats Cards (4 cards):**
   - **Total Disbursed** (orange background)
     - Icon: `ArrowUpRight`
     - Value: "FCFA 0"
   - **Total Collection** (purple background)
     - Icon: `ArrowDownLeft`
     - Value: "FCFA 0"
   - **Total Volume** (emerald background)
     - Icon: `Wallet`
     - Value: "FCFA 0"
   - **Account Balance** (white background)
     - Icons: `RefreshCw`, `EyeOff`
     - Value: "FCFA 0"

3. **Chart Sections (2 charts):**
   - **Payment Trends**
     - Date range navigation
     - "Current" badge
     - Placeholder: "No data available"
   - **Volume Analysis**
     - Date range navigation
     - "Current" badge
     - Placeholder: "No data available"

**Grid Layout:**
- Stats: `grid-cols-1 md:grid-cols-3`
- Charts: `grid-cols-1 lg:grid-cols-2`

---

### 2. **Transactions** (`app/dashboard/transactions/page.tsx`)

**Route:** `/dashboard/transactions`

**Status:** Placeholder page

**Content:** "Transactions page - Coming soon"

---

### 3. **Balance History** (`app/dashboard/balance-history/page.tsx`)

**Route:** `/dashboard/balance-history`

**Status:** Placeholder page

**Content:** "Balance History page - Coming soon"

---

### 4. **Wallet** (`app/dashboard/wallet/page.tsx`)

**Route:** `/dashboard/wallet`

**Status:** Placeholder page

**Content:** "Wallet page - Coming soon"

---

### 5. **API Keys** (`app/dashboard/api-keys/page.tsx`)

**Route:** `/dashboard/api-keys`

**Status:** Placeholder page

**Content:** "API Keys page - Coming soon"

---

### 6. **Settings** (`app/dashboard/settings/page.tsx`)

**Route:** `/dashboard/settings`

**Status:** Placeholder page

**Content:** "Settings page - Coming soon"

---

### 7. **Support** (`app/dashboard/support/page.tsx`)

**Route:** `/dashboard/support`

**Status:** Placeholder page

**Content:** "Support page - Coming soon"

---

## 🎯 Layout System

### **Dashboard Layout** (`app/dashboard/layout.tsx`)

**Purpose:** Wraps all dashboard pages with sidebar and navbar

**Structure:**
```tsx
<div className="flex h-screen bg-background">
  <DashboardSidebar />
  <div className="flex-1 flex flex-col overflow-hidden">
    <DashboardNavbar />
    <main className="flex-1 overflow-y-auto bg-muted/30">
      {children}
    </main>
  </div>
</div>
```

**Layout Breakdown:**
1. **Container:** Full screen height, flex layout
2. **Sidebar:** Fixed width (256px), left side
3. **Main Area:** Flex-1 (takes remaining space)
   - **Navbar:** Fixed height (64px), top
   - **Content:** Scrollable area with muted background

---

## 🎨 Design System

### **Colors**

All colors use Tailwind CSS semantic tokens for theme support:

**Primary Colors:**
- **Emerald (Brand):** `emerald-500`, `emerald-600`, `emerald-100`, `emerald-900/20`
  - Used for: Active states, primary actions, merchant badge
- **Orange (Accent):** `orange-500`, `orange-100`, `orange-900/20`
  - Used for: Sandbox mode, disbursed stats
- **Purple:** `purple-100`, `purple-500`, `purple-900/20`
  - Used for: Collection stats

**Semantic Colors (Theme-aware):**
- `bg-background` - Main background
- `bg-muted` - Secondary background
- `text-foreground` - Primary text
- `text-muted-foreground` - Secondary text
- `border-border` - Borders

### **Typography**

- **Page Titles:** `text-2xl font-bold`
- **Section Titles:** `text-lg font-semibold`
- **Subtitles:** `text-sm text-muted-foreground`
- **Labels:** `text-xs font-medium uppercase tracking-wide`
- **Stats Values:** `text-2xl font-bold`

### **Spacing**

- **Page Padding:** `p-6`
- **Card Padding:** `p-6`
- **Section Gaps:** `space-y-6`
- **Grid Gaps:** `gap-4`, `gap-6`

### **Borders & Radius**

- **Cards:** `rounded-2xl border border-border`
- **Buttons:** `rounded-lg`
- **Badges:** `rounded-full` or `rounded-lg`
- **Avatar:** `rounded-full`

---

## 🔗 Routing

### **Route Structure:**

```
/dashboard                    → Dashboard home (stats & charts)
/dashboard/transactions       → Transactions list
/dashboard/balance-history    → Balance history
/dashboard/wallet             → Wallet management
/dashboard/api-keys           → API keys management
/dashboard/settings           → Account settings
/dashboard/support            → Help & support
/docs                         → Documentation (external)
```

### **Navigation Flow:**

1. User logs in → Redirected to `/dashboard`
2. Click sidebar item → Navigate to respective page
3. Click logo → Navigate to home page `/`
4. Click logout → Navigate to logout flow

---

## 🔐 Authentication Integration

### **Auth Context Usage:**

Both `DashboardSidebar` and `DashboardNavbar` use `useAuthContext()`:

```tsx
const { user } = useAuthContext();
```

**User Data Used:**
- `user.email` - For greeting and avatar initials
- `user.id` - For user identification
- `user.role` - For role-based access (future)

### **Protected Routes:**

The dashboard is wrapped in the `(dashboard)` route group, which should be protected by middleware or layout-level auth checks.

---

## 📱 Responsive Design

### **Breakpoints:**

- **Mobile:** Default (< 768px)
- **Tablet:** `md:` (≥ 768px)
- **Desktop:** `lg:` (≥ 1024px)

### **Responsive Behavior:**

1. **Stats Cards:**
   - Mobile: 1 column
   - Tablet+: 3 columns

2. **Charts:**
   - Mobile: 1 column (stacked)
   - Desktop: 2 columns (side by side)

3. **Sidebar:**
   - Currently always visible
   - **Future:** Should collapse on mobile with hamburger menu

---

## 🚀 Future Enhancements

### **Planned Features:**

1. **Mobile Sidebar:**
   - Hamburger menu for mobile
   - Slide-out drawer
   - Overlay backdrop

2. **Charts Integration:**
   - Replace placeholders with real charts (e.g., Chart.js, Recharts)
   - Connect to API endpoints
   - Real-time data updates

3. **Data Integration:**
   - Connect stats cards to API
   - Implement data fetching hooks
   - Add loading states

4. **User Menu:**
   - Dropdown from avatar
   - Profile link
   - Settings link
   - Logout action

5. **Notifications:**
   - Bell icon in navbar
   - Notification dropdown
   - Real-time updates

6. **Search:**
   - Global search in navbar
   - Quick navigation

---

## 🛠️ Development Notes

### **Component Dependencies:**

```tsx
// DashboardSidebar
import { usePathname } from "next/navigation"
import { useAuthContext } from "@/features/auth/context/AuthContext"
import { lucide-react icons }

// DashboardNavbar
import { useAuthContext } from "@/features/auth/context/AuthContext"
import { ThemeToggle } from "@/components/ThemeToggle"
import { lucide-react icons }
```

### **State Management:**

Currently using:
- `useAuthContext()` for user data
- `usePathname()` for active route detection
- No additional state management needed yet

### **Performance Considerations:**

- All dashboard pages are client components (`"use client"`)
- Sidebar and navbar are reused across all pages
- Images use Next.js `Image` component for optimization
- Icons are tree-shaken from lucide-react

---

## 📝 Quick Reference

### **Where is what?**

| What | Where | Displayed |
|------|-------|-----------|
| Sidebar | `components/dashboard/DashboardSidebar.tsx` | Left side of all dashboard pages |
| Navbar | `components/dashboard/DashboardNavbar.tsx` | Top of all dashboard pages |
| Dashboard Home | `app/dashboard/page.tsx` | `/dashboard` route |
| Layout | `app/dashboard/layout.tsx` | Wraps all `/dashboard/*` routes |
| Stats Cards | `app/dashboard/page.tsx` (lines 20-91) | Dashboard home page |
| Charts | `app/dashboard/page.tsx` (lines 93-155) | Dashboard home page |
| Logo | `components/dashboard/DashboardSidebar.tsx` (lines 59-69) | Top of sidebar |
| User Avatar | `components/dashboard/DashboardNavbar.tsx` (lines 47-50) | Top right of navbar |
| Sandbox Badge | `components/dashboard/DashboardNavbar.tsx` (lines 40-42) | Top navbar |

---

## 🎓 Learning Resources

### **Key Concepts Used:**

1. **Next.js App Router** - File-based routing
2. **React Server Components** - Default for pages
3. **Client Components** - For interactive elements
4. **Tailwind CSS** - Utility-first styling
5. **Lucide React** - Icon library
6. **Context API** - Auth state management

### **Best Practices Followed:**

- ✅ Semantic HTML
- ✅ Accessible components
- ✅ Theme-aware colors
- ✅ Responsive design
- ✅ Component reusability
- ✅ Clear file organization
- ✅ TypeScript types
- ✅ Consistent naming

---

**Last Updated:** January 12, 2026
**Version:** 1.0.0
**Author:** ZitoPay Development Team
