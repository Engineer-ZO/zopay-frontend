# Dashboard Frontend Implementation Guide

**Version:** 1.0  
**Last Updated:** January 2026  
**Purpose:** Documentation for frontend developers on the dashboard implementation

---

## Overview

This document describes the implementation of the Merchant Dashboard page (`/dashboard`) with real API integration. The dashboard displays key business metrics and recent transactions, fetching data from the backend API endpoints.

---

## What Was Implemented

### 1. API Functions

**Location:** `features/merchants/api/index.ts`

Two new API functions were added:

#### `getDashboardStats(merchantId, period)`
- **Endpoint:** `GET /merchant/v1/merchants/:merchantId/dashboard/stats`
- **Parameters:**
  - `merchantId` (string, required) - UUID of the merchant
  - `period` ('7d' | '30d' | '90d' | 'all', optional) - Time period for calculations. Default: '30d'
- **Returns:** `DashboardStatsResponse` with 5 metric cards

#### `getRecentTransactions(merchantId, limit, type)`
- **Endpoint:** `GET /merchant/v1/merchants/:merchantId/dashboard/transactions/recent`
- **Parameters:**
  - `merchantId` (string, required) - UUID of the merchant
  - `limit` (number, optional) - Number of transactions to return. Default: 10, Max: 50
  - `type` ('collection' | 'payout' | 'refund', optional) - Filter by transaction type
- **Returns:** `RecentTransactionsResponse` with transaction array and metadata

---

### 2. React Query Hooks

**Location:** `features/merchants/hooks/useMerchant.ts`

Two new hooks were added:

#### `useDashboardStats(merchantId, period, enabled)`
- Fetches dashboard overview statistics
- **Auto-refetch:** Every 30 seconds
- **Query key:** `['dashboard', 'stats', merchantId, period]`
- **Returns:** `UseQueryResult<DashboardStatsResponse, Error>`

#### `useRecentTransactions(merchantId, limit, type, enabled)`
- Fetches recent transactions for dashboard display
- **Auto-refetch:** Every 60 seconds
- **Query key:** `['dashboard', 'transactions', 'recent', merchantId, limit, type]`
- **Returns:** `UseQueryResult<RecentTransactionsResponse, Error>`

---

### 3. TypeScript Types

**Location:** `features/merchants/types/index.ts`

New types added:

```typescript
export interface DashboardStat {
    label: string;
    value: string;
    currency: string;
    change: string;
    trend: 'up' | 'down';
    subtitle: string;
}

export interface DashboardStatsResponse {
    stats: DashboardStat[];
}

export interface RecentTransaction {
    id: string;
    date: string;
    time: string;
    type: 'collection' | 'payout' | 'refund';
    amount: number;
    currency: string;
    status: string;
    gateway: string;
    customer?: string;
    recipient?: string;
    fees: number;
    netAmount: number;
    createdAt: string;
}

export interface RecentTransactionsResponse {
    transactions: RecentTransaction[];
    total: number;
    hasMore: boolean;
}
```

---

### 4. Dashboard Page Implementation

**Location:** `app/dashboard/page.tsx`

#### Key Features:

1. **Real API Integration**
   - Uses `useDashboardStats()` hook to fetch metrics
   - Uses `useRecentTransactions()` hook to fetch transactions
   - Gets `merchantId` from `useUserMerchantData()` context

2. **Skeleton Loading States**
   - Stats cards show skeleton loaders while fetching
   - Transaction table shows skeleton rows while fetching
   - Smooth loading experience with pulse animations

3. **Data Mapping**
   - Maps API response to UI structure
   - Icon mapping based on stat label
   - Color mapping for different metric types

4. **Error Handling**
   - Handles missing merchant ID gracefully
   - Shows empty states when no data available
   - Transactions table shows "No transactions found" when empty

5. **Period Selection**
   - Supports period filtering (7d, 30d, 90d, all)
   - Period label displayed in header
   - Period parameter passed to API

---

## File Structure

```
features/merchants/
├── api/
│   └── index.ts                    # Added getDashboardStats() and getRecentTransactions()
├── hooks/
│   └── useMerchant.ts              # Added useDashboardStats() and useRecentTransactions()
└── types/
    └── index.ts                    # Added DashboardStat, DashboardStatsResponse, RecentTransaction, RecentTransactionsResponse

app/dashboard/
└── page.tsx                        # Updated to use real API hooks with skeleton loading
```

---

## Usage Example

```typescript
import { useUserMerchantData } from "@/features/merchants/context/MerchantContext";
import { useDashboardStats, useRecentTransactions } from "@/features/merchants/hooks/useMerchant";

function DashboardPage() {
  const { merchantId } = useUserMerchantData();
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  // Fetch dashboard stats
  const { data: statsData, isLoading: isLoadingStats } = useDashboardStats(
    merchantId || '',
    period,
    !!merchantId
  );

  // Fetch recent transactions
  const { data: transactionsData, isLoading: isLoadingTransactions } = useRecentTransactions(
    merchantId || '',
    10,
    undefined,
    !!merchantId
  );

  // Render with skeleton loading states
  return (
    <div>
      {isLoadingStats ? (
        <SkeletonLoader />
      ) : (
        <StatsCards stats={statsData?.stats} />
      )}
      
      {isLoadingTransactions ? (
        <SkeletonTable />
      ) : (
        <TransactionsTable transactions={transactionsData?.transactions} />
      )}
    </div>
  );
}
```

---

## Skeleton Loading Implementation

### Stats Cards Skeleton

```typescript
{isLoadingStats ? (
  Array.from({ length: 5 }).map((_, i) => (
    <div key={i} className="bg-background rounded-xl p-4 border border-border animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 bg-muted rounded-lg" />
        <div className="w-12 h-4 bg-muted rounded" />
      </div>
      <div className="w-24 h-3 bg-muted rounded mb-2" />
      <div className="w-32 h-6 bg-muted rounded mb-2" />
      <div className="w-20 h-3 bg-muted rounded" />
    </div>
  ))
) : (
  // Actual stats cards
)}
```

### Transactions Table Skeleton

```typescript
{isLoadingTransactions ? (
  Array.from({ length: 5 }).map((_, i) => (
    <tr key={i} className="border-b border-border last:border-0">
      <td className="py-3 px-4">
        <div className="w-20 h-3 bg-muted rounded mb-1 animate-pulse" />
        <div className="w-16 h-3 bg-muted rounded animate-pulse" />
      </td>
      {/* More skeleton cells */}
    </tr>
  ))
) : (
  // Actual transaction rows
)}
```

---

## Data Flow

1. **Page Loads**
   - `useUserMerchantData()` provides `merchantId` from context
   - Hooks are enabled only when `merchantId` exists

2. **API Calls**
   - `useDashboardStats()` fetches stats from `/merchant/v1/merchants/:merchantId/dashboard/stats`
   - `useRecentTransactions()` fetches transactions from `/merchant/v1/merchants/:merchantId/dashboard/transactions/recent`

3. **Data Processing**
   - API responses are automatically cached by React Query
   - Data is mapped to UI components with icons and colors

4. **Auto-refresh**
   - Stats refresh every 30 seconds
   - Transactions refresh every 60 seconds
   - Manual refresh available via React Query refetch

---

## Icon and Color Mapping

The dashboard maps stat labels to icons and colors:

| Stat Label | Icon | Background | Border | Icon Color |
|------------|------|------------|--------|------------|
| Available Balance | Wallet | Blue | Blue | Blue |
| Total Revenue | DollarSign | Green | Green | Green |
| Transactions | Activity | Purple | Purple | Purple |
| Success Rate | CheckCircle2 | Emerald | Emerald | Emerald |
| Pending | Clock | Orange | Orange | Orange |

---

## Error Handling

### Missing Merchant ID
- Hooks are disabled when `merchantId` is null
- No API calls are made until merchant ID is available

### API Errors
- React Query handles errors automatically
- Error states can be accessed via `error` property from hooks
- UI gracefully handles error states

### Empty Data
- Transactions table shows "No transactions found" when empty
- Stats cards show loading state until data arrives

---

## Period Selection

The dashboard supports period filtering:

- **7d** - Last 7 days
- **30d** - Last 30 days (default)
- **90d** - Last 90 days
- **all** - All time

**Note:** Some metrics (Available Balance, Total Revenue, Pending) are not affected by period and always show current/all-time values.

---

## Auto-refresh Behavior

- **Stats:** Refresh every 30 seconds
- **Transactions:** Refresh every 60 seconds
- **Manual Refresh:** Can be triggered via `refetch()` from hooks

This ensures the dashboard stays up-to-date with minimal user interaction.

---

## Testing Checklist

- [x] API functions properly call endpoints with correct parameters
- [x] Hooks fetch data when merchant ID is available
- [x] Skeleton loaders display during loading states
- [x] Stats cards render with correct icons and colors
- [x] Transactions table displays all transaction data
- [x] Empty states show when no data available
- [x] Period parameter works correctly
- [x] Auto-refresh works as expected
- [x] Error handling works gracefully
- [x] Merchant ID validation prevents unnecessary API calls

---

## Next Steps

1. **Period Selector Dropdown**
   - Currently shows period label but doesn't allow selection
   - Can be enhanced with a dropdown menu to change period

2. **Transaction Filtering**
   - Add type filter dropdown (collection/payout/refund)
   - Add status filter dropdown

3. **Pagination**
   - Implement pagination for transactions if needed
   - Use `hasMore` field from API response

4. **Error Toasts**
   - Add toast notifications for API errors
   - Show user-friendly error messages

5. **Refresh Button**
   - Add manual refresh button in header
   - Trigger refetch for both hooks

---

## Dependencies

- `@tanstack/react-query` - For data fetching and caching
- `features/merchants/context/MerchantContext` - For merchant ID
- `lib/apiClient` - For API requests with authentication

---

## Questions or Issues?

If you encounter any issues or have questions about this implementation, please contact the development team.

---

## Changelog

**Version 1.0 (January 2026)**
- Initial implementation
- API functions for dashboard stats and recent transactions
- React Query hooks with auto-refresh
- Skeleton loading states
- Real-time data integration
- TypeScript types for all data structures
