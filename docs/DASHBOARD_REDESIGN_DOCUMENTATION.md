# ZitoPay Dashboard & Sidebar Redesign Documentation

**Date:** January 13, 2026  
**Version:** 2.0.0  
**Author:** ZitoPay Development Team

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Sidebar Navigation Restructure](#sidebar-navigation-restructure)
3. [Dashboard Page Redesign](#dashboard-page-redesign)
4. [File Locations](#file-locations)
5. [Component Breakdown](#component-breakdown)
6. [Design System](#design-system)
7. [Future Enhancements](#future-enhancements)

---

## 🎯 Overview

This document details the complete redesign of the ZitoPay merchant dashboard, including:
- **Sidebar Navigation** - Restructured with grouped sections
- **Dashboard Page** - Complete redesign with 6 major sections
- **Design System** - Consistent colors, fonts, and spacing

---

## 🗂️ Sidebar Navigation Restructure

### **File Location**
```
components/dashboard/DashboardSidebar.tsx
```

### **What Changed**

#### **Before:**
- Flat list of 8 menu items
- No grouping or organization
- Simple navigation links

#### **After:**
- **7 organized sections** with collapsible groups
- **21 total menu items** across all sections
- **Collapsible functionality** for each section

### **New Structure**

```
┌─────────────────────────────┐
│ 📊 Dashboard (Standalone)   │
└─────────────────────────────┘

┌─────────────────────────────┐
│ 💰 PAYMENTS (Collapsible)   │
├─────────────────────────────┤
│ 🔄 Transactions             │
│ 📥 Collections              │
│ 📤 Payouts                  │
│ ↩️  Refunds                  │
└─────────────────────────────┘

┌─────────────────────────────┐
│ 💼 FINANCE (Collapsible)    │
├─────────────────────────────┤
│ 💳 Account status           │
│ 📋 Settlements              │
└─────────────────────────────┘

┌─────────────────────────────┐
│ 🔧 DEVELOPER (Collapsible)  │
├─────────────────────────────┤
│ 🔑 API Keys                 │
│ 🪝 Webhooks                 │
└─────────────────────────────┘

┌─────────────────────────────┐
│ 📈 INSIGHTS (Collapsible)   │
├─────────────────────────────┤
│ 📊 Reports & Analytics      │
└─────────────────────────────┘

┌─────────────────────────────┐
│ ⚙️  SETTINGS (Collapsible)   │
├─────────────────────────────┤
│ (Business settings removed) │
│ 👥 Team Members             │
│ 🌍 Domains                  │
│ 🔔 Notifications            │
└─────────────────────────────┘

┌─────────────────────────────┐
│ 📚 HELP (Collapsible)       │
├─────────────────────────────┤
│ 📖 Documentation            │
│ ❓ Help & Support           │
└─────────────────────────────┘
```

### **Key Features**

#### **1. Collapsible Sections**
- Click section headers to expand/collapse
- Chevron icons indicate state:
  - `ChevronDown` = Expanded
  - `ChevronRight` = Collapsed
- State managed with React `useState`

**Code Location:** Lines 169-171
```typescript
const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
```

#### **2. Section Headers**
- Uppercase text with tracking
- Subtle muted color
- Clickable to toggle collapse

**Code Location:** Lines 308-320
```typescript
{section.title && (
  <button onClick={() => section.collapsible && toggleSection(section.title!)}>
    <span className="text-xs font-semibold text-muted-foreground uppercase">
      {section.title}
    </span>
  </button>
)}
```

#### **3. Active Page Highlighting**
- Orange background for active page
- Orange text color
- Matches brand color

**Code Location:** Lines 333-339

#### **4. New Icons Added**
- `ArrowDownToLine` - Collections
- `ArrowUpFromLine` - Payouts
- `RotateCcw` - Refunds
- `Receipt` - Settlements
- `Webhook` - Webhooks
- `BarChart3` - Reports & Analytics
- `Users` - Team Members
- `Bell` - Notifications

### **Routes Defined**

| Section | Route | Description |
|---------|-------|-------------|
| **Dashboard** | `/dashboard` | Main overview page |
| **Transactions** | `/dashboard/transactions` | All transactions |
| **Collections** | `/dashboard/collections` | Incoming payments |
| **Payouts** | `/dashboard/payouts` | Outgoing disbursements |
| **Refunds** | `/dashboard/refunds` | Refund management |
| **Account status** | `/dashboard/wallet` | Balance & wallet |
| **Settlements** | `/dashboard/settlements` | Settlement tracking |
| **API Keys** | `/dashboard/api-keys` | API credentials |
| **Webhooks** | `/dashboard/webhooks` | Webhook management |
| **Reports & Analytics** | `/dashboard/reports` | Business insights |
| **(removed)** | — | Environment / KYB UI removed; use Help & Support |
| **Team Members** | `/dashboard/team` | User management |
| **Domains** | `/dashboard/domains` | Domain verification |
| **Notifications** | `/dashboard/notifications` | Email preferences |
| **Documentation** | `/docs` | API documentation |
| **Help & Support** | `/dashboard/support` | Support center |

---

## 📊 Dashboard Page Redesign

### **File Location**
```
app/dashboard/page.tsx
```

### **What Changed**

#### **Before:**
- 4 stat cards (Total Disbursed, Total Collection, Total Volume, Account Balance)
- Recent Transactions table
- Simple layout
- No charts or visualizations
- No alerts or quick actions

#### **After:**
- **6 major sections** with comprehensive data
- **5 key metric cards** with trends
- **2 chart placeholders** (Line & Pie)
- **4 quick stat cards**
- **Enhanced transactions table**
- **Alerts & notifications section**
- **Quick actions panel**

### **Complete Layout Structure**

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER                                                      │
│ - Title & Subtitle                                          │
│ - Sandbox Mode Badge (animated)                             │
│ - Date Range Selector                                       │
│ - Withdraw & Top Up Buttons                                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ SECTION 1: KEY METRICS (5 Cards)                           │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐              │
│ │Collec│ │Payout│ │  Net │ │Balanc│ │Succes│              │
│ │tions │ │  s   │ │Revenu│ │  e   │ │ Rate │              │
│ │      │ │      │ │  e   │ │      │ │      │              │
│ │+12.5%│ │-5.2% │ │+18.3%│ │Avail.│ │+2.1% │              │
│ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ SECTION 2: CHARTS                                           │
│ ┌────────────────────────┐ ┌──────────────────┐            │
│ │ Transaction Volume     │ │ Gateway          │            │
│ │ (Line Chart)           │ │ Breakdown        │            │
│ │                        │ │ (Pie Chart)      │            │
│ │ [Chart Placeholder]    │ │                  │            │
│ │                        │ │ MTN: 65%         │            │
│ │                        │ │ Orange: 25%      │            │
│ │                        │ │ Moov: 10%        │            │
│ └────────────────────────┘ └──────────────────┘            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ SECTION 3: QUICK STATS (4 Mini Cards)                      │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                       │
│ │Trans │ │ Avg  │ │Fees  │ │Pendin│                       │
│ │1,234 │ │ 45s  │ │45,000│ │  12  │                       │
│ └──────┘ └──────┘ └──────┘ └──────┘                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ SECTION 4: RECENT TRANSACTIONS TABLE                       │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ Date | TX ID | Status | Amount | Gateway | Actions   │   │
│ ├───────────────────────────────────────────────────────┤   │
│ │ Oct 24 | #27... | ✅ Success | $120 | MTN | ⋮       │   │
│ │ Oct 24 | #27... | ⏳ Pending | $43  | Orange | ⋮    │   │
│ │ Oct 23 | #27... | ❌ Failed  | $210 | MTN | ⋮       │   │
│ └───────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ SECTION 5: ALERTS & NOTIFICATIONS                          │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ ⚠️  KYB Status: Pending Review                        │   │
│ │    Your KYB documents are under review...             │   │
│ │    [View Status →]                                    │   │
│ ├───────────────────────────────────────────────────────┤   │
│ │ ℹ️  Production Access Available                       │   │
│ │    Your KYB is approved! Request access now           │   │
│ │    [Request Access →]                                 │   │
│ └───────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ SECTION 6: QUICK ACTIONS                                   │
│ [➕ New Payout] [🔄 Refund] [📊 Export] [🔑 API Docs]      │
└─────────────────────────────────────────────────────────────┘
```

---

## 📍 Section Breakdown

### **HEADER SECTION**
**Location:** Lines 106-151

**Components:**
1. **Title & Subtitle**
   - `text-xl font-bold` for title
   - `text-xs text-muted-foreground` for subtitle

2. **Sandbox Mode Badge**
   - Orange background
   - Animated pulse dot
   - `animate-pulse` on indicator

3. **Date Range Selector**
   - Dropdown button
   - Calendar icon
   - ChevronDown icon

4. **Action Buttons**
   - Withdraw (orange, primary)
   - Top Up (outlined)

---

### **SECTION 1: KEY METRICS**
**Location:** Lines 153-215

**5 Stat Cards:**

#### **1. Collections Card**
- **Color:** Green (`bg-green-50`, `text-green-600`)
- **Icon:** `ArrowDownToLine`
- **Value:** FCFA 2,450,000
- **Trend:** +12.5% ↗
- **Border:** `border-green-200`

#### **2. Payouts Card**
- **Color:** Orange (`bg-crimson-red-50`, `text-crimson-red-600`)
- **Icon:** `ArrowUpFromLine`
- **Value:** FCFA 850,000
- **Trend:** -5.2% ↘
- **Border:** `border-crimson-red-200`

#### **3. Net Revenue Card**
- **Color:** Purple (`bg-purple-50`, `text-purple-600`)
- **Icon:** `TrendingUp`
- **Value:** FCFA 1,600,000
- **Trend:** +18.3% ↗
- **Border:** `border-purple-200`

#### **4. Balance Card**
- **Color:** Blue (`bg-deep-blue-violet-50`, `text-deep-blue-violet-600`)
- **Icon:** `Wallet`
- **Value:** FCFA 450,000
- **Status:** Available (green dot)
- **Action:** Withdraw button
- **Border:** `border-deep-blue-violet-200`

#### **5. Success Rate Card**
- **Color:** Emerald (`bg-emerald-50`, `text-emerald-600`)
- **Icon:** `CheckCircle2`
- **Value:** 94.2%
- **Trend:** +2.1% ↗
- **Subtitle:** 1,234 / 1,310 transactions
- **Border:** `border-emerald-200`

**Card Features:**
- Icon in white container with shadow
- Trend percentage in top-right
- Uppercase labels with tracking
- Large bold values
- Consistent padding (`p-4`)

---

### **SECTION 2: CHARTS**
**Location:** Lines 217-292

#### **Chart 1: Transaction Volume (Line Chart)**
**Grid:** `lg:col-span-2` (2/3 width)

**Features:**
- Title: "Transaction Volume"
- Subtitle: "Last 30 days"
- Refresh button (top-right)
- Chart placeholder with dashed border
- Will display:
  - Collections line (green)
  - Payouts line (orange)
  - Net Revenue line (purple)

**Placeholder Text:**
```
"Chart will be displayed here"
"Line chart showing Collections, Payouts, and Net Revenue"
```

#### **Chart 2: Gateway Breakdown (Pie Chart)**
**Grid:** `lg:col-span-1` (1/3 width)

**Features:**
- Title: "Gateway Breakdown"
- Subtitle: "By volume"
- Pie chart placeholder
- Gateway list with percentages:
  - MTN: 65% (yellow dot)
  - Orange: 25% (orange dot)
  - Moov: 10% (blue dot)
- "View Details →" button

---

### **SECTION 3: QUICK STATS**
**Location:** Lines 294-313

**4 Mini Cards:**

| Label | Value | Subtitle |
|-------|-------|----------|
| TRANSACTIONS | 1,234 | This period |
| AVG TIME | 45s | To complete |
| TOTAL FEES | FCFA 45,000 | Gateway + Platform |
| PENDING | 12 | Awaiting confirm |

**Features:**
- Grid: 2 columns on mobile, 4 on desktop
- Hover effect (border color change)
- Large value text (`text-xl font-bold`)
- Uppercase labels

---

### **SECTION 4: RECENT TRANSACTIONS**
**Location:** Lines 315-399

**Table Structure:**

**Columns:**
1. **Date** - Date + Time (stacked)
2. **Transaction ID** - Monospace font
3. **Status** - Badge with colored dot
4. **Amount** - Bold, semibold
5. **Gateway** - Gateway name
6. **Actions** - 3-dot menu icon

**Status Badges:**
- **Success:** Green background, green dot
- **Pending:** Orange background, orange dot
- **Failed:** Red background, red dot

**Features:**
- Hover effect on rows (`hover:bg-muted/50`)
- Last row has no border
- Responsive table (horizontal scroll on mobile)
- "View All →" button in header

**Sample Data:**
```javascript
{
  date: "Oct 24",
  time: "14:23",
  id: "#27-9281-023",
  status: "success",
  amount: "$120.00",
  gateway: "MTN",
}
```

---

### **SECTION 5: ALERTS & NOTIFICATIONS**
**Location:** Lines 401-439

**2 Alert Types:**

#### **Alert 1: Warning (Orange)**
- **Icon:** `AlertCircle` (orange)
- **Title:** "KYB Status: Pending Review"
- **Message:** "Your KYB documents are under review. Estimated: 2-3 days"
- **Action:** "View Status →"
- **Background:** `bg-crimson-red-50`
- **Border:** `border-crimson-red-200`

#### **Alert 2: Info (Blue)**
- **Icon:** `AlertCircle` (blue)
- **Title:** "Production Access Available"
- **Message:** "Your KYB is approved! Request production access now"
- **Action:** "Request Access →"
- **Background:** `bg-deep-blue-violet-50`
- **Border:** `border-deep-blue-violet-200`

**Features:**
- Icon + title on same line
- Message below
- Action button on right
- Color-coded by type
- Spacing between alerts

---

### **SECTION 6: QUICK ACTIONS**
**Location:** Lines 441-465

**4 Action Buttons:**

| Button | Icon | Style | Purpose |
|--------|------|-------|---------|
| **New Payout** | `Plus` | Orange (primary) | Create new payout |
| **Refund** | `RotateCcw` | Outlined | Process refund |
| **Export Report** | `Download` | Outlined | Download CSV/PDF |
| **API Docs** | `FileText` | Outlined | View documentation |

**Features:**
- Grid: 2 columns on mobile, 4 on desktop
- Icons with text
- Consistent sizing
- Hover effects

---

## 🎨 Design System

### **Color Palette**

| Purpose | Light Mode | Dark Mode | Usage |
|---------|-----------|-----------|-------|
| **Success/Collections** | `bg-green-50` | `bg-green-900/10` | Positive metrics |
| **Warning/Payouts** | `bg-crimson-red-50` | `bg-crimson-red-900/10` | Alerts, actions |
| **Info/Balance** | `bg-deep-blue-violet-50` | `bg-deep-blue-violet-900/10` | Information |
| **Error/Failed** | `bg-red-50` | `bg-red-900/10` | Failed states |
| **Revenue** | `bg-purple-50` | `bg-purple-900/10` | Net revenue |
| **Success Rate** | `bg-emerald-50` | `bg-emerald-900/10` | Success metrics |

### **Typography**

| Element | Class | Size | Weight |
|---------|-------|------|--------|
| **Page Title** | `text-xl` | 20px | Bold |
| **Section Title** | `text-sm` | 14px | Semibold |
| **Card Label** | `text-xs` | 12px | Medium |
| **Card Value** | `text-lg` or `text-xl` | 18-20px | Bold |
| **Body Text** | `text-xs` | 12px | Normal |
| **Muted Text** | `text-xs text-muted-foreground` | 12px | Normal |

### **Spacing**

| Element | Class | Value |
|---------|-------|-------|
| **Page Padding** | `p-6` | 24px |
| **Section Gap** | `space-y-6` | 24px |
| **Card Padding** | `p-4` or `p-6` | 16px or 24px |
| **Grid Gap** | `gap-4` or `gap-6` | 16px or 24px |
| **Button Padding** | `px-3 py-1.5` | 12px × 6px |

### **Border Radius**

| Element | Class | Value |
|---------|-------|-------|
| **Cards** | `rounded-xl` | 12px |
| **Buttons** | `rounded-lg` | 8px |
| **Badges** | `rounded` or `rounded-lg` | 4px or 8px |
| **Icons** | `rounded-lg` | 8px |

### **Responsive Breakpoints**

| Screen | Grid Columns | Behavior |
|--------|--------------|----------|
| **Mobile** (`< 768px`) | 1-2 columns | Stack vertically |
| **Tablet** (`768px - 1024px`) | 2-3 columns | Partial grid |
| **Desktop** (`> 1024px`) | 4-5 columns | Full grid |

---

## 📁 File Locations

### **Modified Files**

```
components/
└── dashboard/
    └── DashboardSidebar.tsx          # Sidebar navigation (MODIFIED)

app/
└── dashboard/
    └── page.tsx                       # Dashboard page (MODIFIED)
```

### **Key Imports**

#### **DashboardSidebar.tsx**
```typescript
import {
  LayoutDashboard,      // Dashboard icon
  ArrowLeftRight,       // Transactions
  ArrowDownToLine,      // Collections
  ArrowUpFromLine,      // Payouts
  RotateCcw,           // Refunds
  Wallet,              // Wallet
  Receipt,             // Settlements
  Key,                 // API Keys
  Webhook,             // Webhooks
  Globe,               // Network access (domains & IPs)
  BarChart3,           // Reports
  Users,               // Team Members
  Bell,                // Notifications
  FileText,            // Documentation
  HelpCircle,          // Help & Support
  ChevronDown,         // Expanded state
  ChevronRight,        // Collapsed state
} from "lucide-react";
```

#### **page.tsx (Dashboard)**
```typescript
import {
  ArrowDownToLine,     // Collections
  ArrowUpFromLine,     // Payouts
  TrendingUp,          // Net Revenue
  Wallet,              // Balance
  CheckCircle2,        // Success Rate
  ArrowRight,          // View All
  Clock,               // Time
  DollarSign,          // Fees
  AlertCircle,         // Alerts
  Plus,                // New Payout
  RotateCcw,           // Refund
  Download,            // Export
  FileText,            // API Docs
  ChevronDown,         // Dropdown
  RefreshCw,           // Refresh
  MoreVertical,        // Actions menu
} from "lucide-react";
```

---

## 🔄 State Management

### **Sidebar State**

```typescript
// Collapsed sections tracking
const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

// Toggle function
const toggleSection = (title: string) => {
  setCollapsedSections(prev => {
    const newSet = new Set(prev);
    if (newSet.has(title)) {
      newSet.delete(title);
    } else {
      newSet.add(title);
    }
    return newSet;
  });
};
```

### **Dashboard State**

Currently using **dummy data** (hardcoded). Will be replaced with:
- API calls to backend
- React Query for data fetching
- Loading states
- Error handling

---

## 🚀 Future Enhancements

### **Phase 1: Data Integration**
- [ ] Connect to backend APIs
- [ ] Implement React Query hooks
- [ ] Add loading skeletons
- [ ] Add error states
- [ ] Add empty states

### **Phase 2: Charts**
- [ ] Integrate chart library (Recharts or Chart.js)
- [ ] Implement line chart for transaction volume
- [ ] Implement pie chart for gateway breakdown
- [ ] Add sparklines to stat cards
- [ ] Add chart export functionality

### **Phase 3: Interactivity**
- [ ] Date range picker functionality
- [ ] Real-time data refresh
- [ ] Transaction detail modals
- [ ] Quick action modals (New Payout, Refund)
- [ ] Alert dismissal
- [ ] Notification preferences

### **Phase 4: Advanced Features**
- [ ] Dashboard customization
- [ ] Widget drag-and-drop
- [ ] Custom date ranges
- [ ] Export dashboard as PDF
- [ ] Scheduled reports
- [ ] Real-time notifications

---

## 📊 Data Requirements

### **API Endpoints Needed**

```javascript
// Dashboard stats
GET /reports/v1/dashboard/stats?period=30d

// Transaction volume chart
GET /reports/v1/dashboard/volume-chart?period=30d

// Gateway breakdown
GET /reports/v1/dashboard/gateway-breakdown?period=30d

// Quick stats
GET /reports/v1/dashboard/quick-stats?period=30d

// Recent transactions
GET /transactions/v1/recent?limit=10

// Merchant alerts
GET /merchant/v1/merchants/:id/alerts
```

---

## ✅ Checklist

### **Completed**
- [x] Sidebar restructure with 7 sections
- [x] Collapsible section functionality
- [x] 21 navigation menu items
- [x] Dashboard header with actions
- [x] 5 key metric cards with trends
- [x] Chart placeholders (2)
- [x] Quick stats section (4 cards)
- [x] Recent transactions table
- [x] Alerts & notifications section
- [x] Quick actions panel
- [x] Responsive design
- [x] Dark mode support
- [x] Consistent design system

### **Pending**
- [ ] Backend API integration
- [ ] Chart library integration
- [ ] Loading states
- [ ] Error handling
- [ ] Real data fetching
- [ ] Interactive modals
- [ ] Date range picker
- [ ] Export functionality

---

## 📝 Notes

### **Design Principles**
1. **Consistency** - Same fonts, colors, spacing throughout
2. **Clarity** - Clear labels, obvious actions
3. **Hierarchy** - Important info stands out
4. **Responsiveness** - Works on all screen sizes
5. **Accessibility** - Proper contrast, readable text

### **Code Quality**
- TypeScript for type safety
- Clean component structure
- Reusable patterns
- Commented sections
- Consistent naming

### **Performance**
- Minimal re-renders
- Efficient state management
- Lazy loading ready
- Optimized images

---

**End of Documentation**

For questions or updates, contact the development team.
