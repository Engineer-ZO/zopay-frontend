# Production Access Integration - useApproveProduction Hook

**Date:** 2026-01-14  
**Status:** ✅ COMPLETED

---

## 📝 Summary

Successfully integrated the `useApproveProduction` hook from `@/features/merchants/hooks/useMerchant` to grant production access to merchants directly from the KYB review page.

---

## 🔧 Implementation Details

### Hook Integration

```tsx
import { useApproveProduction } from "@/features/merchants/hooks/useMerchant";
import { useQueryClient } from "@tanstack/react-query";

// Production approval mutation
const { mutate: approveProductionMutation, isPending: isApprovingProduction } = useApproveProduction(
    productionMerchant?.id || ''
);
```

### Grant Production Handler

```tsx
const handleGrantProduction = () => {
    if (!productionMerchant) return;

    approveProductionMutation(undefined, {
        onSuccess: () => {
            toast.success(`Production access granted to ${productionMerchant.merchant.businessName}`);
            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: ['pending-kyb-submissions'] });
            queryClient.invalidateQueries({ queryKey: ['merchants'] });
            closeProductionConfirm();
            closeReviewModal();
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to grant production access');
        },
    });
};
```

---

## ✨ Features

### 1. **Real API Integration**
- ✅ Uses `useApproveProduction(merchantId)` hook
- ✅ Calls backend endpoint to grant production access
- ✅ Generates production credentials automatically

### 2. **Loading States**
- ✅ Buttons disabled during API call (`isApprovingProduction`)
- ✅ Spinner animation shown while processing
- ✅ Text changes to "Granting..." during mutation
- ✅ Cancel button also disabled to prevent interruption

### 3. **Success Handling**
- ✅ Shows success toast notification
- ✅ Invalidates `pending-kyb-submissions` query (refreshes list)
- ✅ Invalidates `merchants` query (updates merchant status)
- ✅ Closes both confirmation and review modals
- ✅ UI automatically updates with fresh data

### 4. **Error Handling**
- ✅ Catches API errors
- ✅ Shows error toast with message
- ✅ Modal stays open on error (allows retry)
- ✅ Buttons re-enabled after error

---

## 🎨 UI States

### Idle State
```
┌─────────────────────────────────┐
│  [Cancel]  [🚀 Grant Access]   │
└─────────────────────────────────┘
```

### Loading State
```
┌─────────────────────────────────┐
│  [Cancel]  [⏳ Granting...]     │
│  (both disabled, spinner shown) │
└─────────────────────────────────┘
```

### Success State
```
✅ Toast: "Production access granted to ABC Corp"
→ Modals close
→ Data refreshes
→ Merchant removed from pending list
```

### Error State
```
❌ Toast: "Failed to grant production access"
→ Modal stays open
→ Buttons re-enabled
→ User can retry
```

---

## 📦 Files Modified

### `app/admin/merchants/pending-kyb/page.tsx`

**Imports Added:**
```tsx
import { useApproveProduction } from "@/features/merchants/hooks/useMerchant";
import { useQueryClient } from "@tanstack/react-query";
```

**State Added:**
```tsx
const queryClient = useQueryClient();
const { mutate: approveProductionMutation, isPending: isApprovingProduction } = useApproveProduction(
    productionMerchant?.id || ''
);
```

**Handler Updated:**
- Replaced TODO comment with actual API call
- Added success/error callbacks
- Added query invalidation
- Integrated loading state

**Buttons Updated (2 locations):**
1. **Green "Grant Access" button** (approved state)
   - Added `disabled={isApprovingProduction}`
   - Added loading spinner
   - Text changes to "Granting..."

2. **Orange "Grant Anyway" button** (warning state)
   - Added `disabled={isApprovingProduction}`
   - Added loading spinner
   - Text changes to "Granting..."

---

## 🔄 Data Flow

1. **User clicks "Grant Production" button**
   - Opens confirmation modal

2. **User confirms in modal**
   - `handleGrantProduction()` called
   - `approveProductionMutation()` triggered
   - Buttons disabled, spinner shown

3. **API Call to Backend**
   - `POST /merchant/v1/admin/{merchantId}/approve-production`
   - Backend grants production access
   - Backend generates production credentials

4. **Success Response**
   - Success toast shown
   - Queries invalidated (data refreshes)
   - Modals close
   - Merchant disappears from pending list

5. **Error Response** (if any)
   - Error toast shown
   - Modal stays open
   - Buttons re-enabled
   - User can retry

---

## 🎯 Query Invalidation

After successful grant, these queries are invalidated:

```tsx
queryClient.invalidateQueries({ queryKey: ['pending-kyb-submissions'] });
queryClient.invalidateQueries({ queryKey: ['merchants'] });
```

**Effect:**
- Pending KYB list refreshes (merchant removed)
- Merchant list updates (status changed)
- UI shows current state without manual refresh

---

## ✅ Benefits

1. **Real Backend Integration:** Actually grants production access
2. **Automatic Credential Generation:** Backend creates production API keys
3. **Optimistic UI Updates:** Data refreshes automatically
4. **Better UX:** Loading states provide clear feedback
5. **Error Recovery:** Users can retry on failure
6. **Type Safety:** Full TypeScript support from hook

---

## 🧪 Testing Checklist

- [x] Hook imported correctly
- [x] Mutation triggered on button click
- [x] Loading state shows spinner
- [x] Buttons disabled during mutation
- [x] Success toast appears on success
- [x] Queries invalidated on success
- [x] Modals close on success
- [x] Error toast appears on failure
- [x] Modal stays open on error
- [x] Buttons re-enabled on error
- [x] No TypeScript errors
- [x] No lint warnings

---

## 🚀 Production Ready

The implementation is now **production-ready** with:
- ✅ Real API integration
- ✅ Proper error handling
- ✅ Loading states
- ✅ Data synchronization
- ✅ User feedback (toasts)
- ✅ Type safety

The merchant will receive production credentials and can start processing live transactions immediately after approval! 🎉
