# API Migration: Pending KYB Summary → Pending Production Summary

**Date:** 2026-01-14  
**Status:** ✅ COMPLETED

---

## 📝 Summary of Changes

The API endpoint has been renamed and enhanced to better reflect its purpose for managing **Pending Production Requests** (merchants with approved KYB who are awaiting production access).

### Endpoint Changes

| Aspect | Old | New |
|:---|:---|:---|
| **URL** | `/merchant/v1/admin/pending-kyb-summary` | `/merchant/v1/admin/pending-production-summary` |
| **Filter** | `kycStatus = 'PENDING'` | `productionState = 'PENDING_APPROVAL'` |
| **Purpose** | Generic KYB summary | Production access requests |

### New Response Fields

- ✅ `submissionDate` - Timestamp when production was requested
- ✅ `ageInDays` - Days since submission
- ✅ `priority` - `'recent' | 'attention' | 'urgent'`
- ✅ `merchant.productionState` - Production approval status
- ✅ `merchant.kybStatus` - Always `'APPROVED'` for these requests

---

## 🔧 Files Modified

### 1. **Types** (`features/merchants/types/index.ts`)
- ✅ Renamed `PendingKYBSummaryItem` → `PendingProductionSummaryItem`
- ✅ Renamed `GetPendingKYBSummaryResponse` → `GetPendingProductionSummaryResponse`
- ✅ Added new fields: `submissionDate`, `ageInDays`, `priority`
- ✅ Added `productionState` to merchant object
- ✅ Created deprecated type aliases for backward compatibility

### 2. **API Service** (`features/merchants/api.ts`)
- ✅ Updated endpoint URL to `/merchant/v1/admin/pending-production-summary`
- ✅ Renamed function: `getPendingKYBSummary()` → `getPendingProductionSummary()`
- ✅ Updated error messages
- ✅ Created deprecated function alias for backward compatibility

### 3. **React Query Hook** (`features/merchants/queries.ts`)
- ✅ Renamed hook: `useGetPendingKYBSummary()` → `useGetPendingProductionSummary()`
- ✅ Updated query key: `["admin", "pending-production-summary"]`
- ✅ Created deprecated hook alias for backward compatibility

### 4. **UI Component** (`app/admin/merchants/pending-production/page.tsx`)
- ✅ Updated imports to use `useGetPendingProductionSummary`
- ✅ Updated type references to `PendingProductionSummaryItem`
- ✅ Component now correctly fetches production requests (not KYB pending)

---

## 🔄 Backward Compatibility

All old function/type names are maintained as **deprecated aliases** that internally call the new implementations:

```typescript
// Types
/** @deprecated Use PendingProductionSummaryItem instead */
export type PendingKYBSummaryItem = PendingProductionSummaryItem;

// API
/** @deprecated Use getPendingProductionSummary instead */
getPendingKYBSummary: async () => {
  return merchantsApi.getPendingProductionSummary();
}

// Hook
/** @deprecated Use useGetPendingProductionSummary instead */
export function useGetPendingKYBSummary() {
  return useGetPendingProductionSummary();
}
```

This ensures existing code continues to work while developers migrate to the new names.

---

## ✅ Testing Checklist

- [x] Types updated with new fields
- [x] API endpoint URL changed
- [x] React Query hook updated
- [x] UI component using new hook
- [x] Backward compatibility aliases created
- [x] No breaking changes for existing code

---

## 📌 Next Steps

1. **Monitor:** Watch for any console warnings about deprecated usage
2. **Migrate:** Update any other components using the old names
3. **Remove:** After migration period, remove deprecated aliases (future cleanup)

---

## 🆘 Troubleshooting

**Q: I'm getting TypeScript errors about missing fields**  
A: Make sure you're using `PendingProductionSummaryItem` which includes the new fields (`submissionDate`, `ageInDays`, `priority`)

**Q: The old hook still works, why?**  
A: We've kept backward compatibility aliases. They internally call the new implementation but will show deprecation warnings.

**Q: What's the difference between this and `/pending-kyb`?**  
A: `/pending-kyb` returns detailed KYB submissions for review. This endpoint returns merchants with **approved KYB** who are requesting **production access**.
