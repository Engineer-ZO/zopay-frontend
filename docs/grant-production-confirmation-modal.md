# Grant Production Access - Confirmation Modal Implementation

**Date:** 2026-01-14  
**Status:** ✅ COMPLETED

---

## 📝 Summary

Updated the "Grant Production Access" functionality to always show the button and display a smart confirmation modal with different messages based on document approval status.

---

## ✨ Key Features

### 1. **Always-Visible Button**
- ✅ "Grant Production" button now appears for ALL merchants (not just those with approved docs)
- ✅ Located in both card view and modal footer
- ✅ Purple-themed button with Rocket icon

### 2. **Smart Confirmation Modal**
The modal shows different content based on KYB document status:

#### **When All Documents Are Approved** ✅
- **Icon:** Green checkmark circle
- **Title:** "Grant Production Access?"
- **Message:** "All documents for [Business Name] have been approved. Are you sure you want to grant production access to this merchant?"
- **Button:** Green "Grant Access" button
- **Action:** Proceeds with granting access

#### **When Documents Are NOT All Approved** ⚠️
- **Icon:** Orange alert circle
- **Title:** "Documents Not Fully Approved"
- **Message:** "[Business Name] has not completed the KYB review process."
- **Info Badge:** Shows "X of Y documents approved"
- **Warning:** "You can still grant production access, but it's recommended to complete the review first."
- **Button:** Orange "Grant Anyway" button
- **Action:** Allows granting access despite incomplete review

---

## 🎨 Modal Design

### Approved State (Green)
```
┌─────────────────────────────────┐
│         ✓ (Green Circle)        │
│  Grant Production Access?       │
│                                 │
│  All documents for ABC Corp     │
│  have been approved.            │
│                                 │
│  Are you sure you want to grant │
│  production access?             │
│                                 │
│  [Cancel]  [🚀 Grant Access]   │
└─────────────────────────────────┘
```

### Not Approved State (Orange)
```
┌─────────────────────────────────┐
│         ⚠ (Orange Circle)       │
│  Documents Not Fully Approved   │
│                                 │
│  ABC Corp has not completed     │
│  the KYB review process.        │
│                                 │
│  ┌───────────────────────────┐ │
│  │ 2 of 4 documents approved │ │
│  └───────────────────────────┘ │
│                                 │
│  You can still grant access,    │
│  but it's recommended to        │
│  complete the review first.     │
│                                 │
│  [Cancel]  [🚀 Grant Anyway]   │
└─────────────────────────────────┘
```

---

## 🔧 Implementation Details

### State Management
```tsx
const [isProductionConfirmOpen, setIsProductionConfirmOpen] = useState(false);
const [productionMerchant, setProductionMerchant] = useState<KYBSubmission | null>(null);
```

### Functions Added
```tsx
const openProductionConfirm = (merchant: KYBSubmission) => {
    setProductionMerchant(merchant);
    setIsProductionConfirmOpen(true);
};

const closeProductionConfirm = () => {
    setIsProductionConfirmOpen(false);
    setProductionMerchant(null);
};

const handleGrantProduction = () => {
    if (productionMerchant) {
        // TODO: Implement grant production access API call
        toast.success(`Production access granted to ${productionMerchant.merchant.businessName}`);
        closeProductionConfirm();
        closeReviewModal();
    }
};
```

### Button Placement
1. **Card View** (line ~311-329)
   - Always visible next to "Ready for Approval" badge
   - Calls `openProductionConfirm(item)` on click

2. **Modal Footer** (line ~624-631)
   - Always visible in document review modal
   - Calls `openProductionConfirm(selectedMerchant)` on click

### Conditional Logic
```tsx
{productionMerchant.documents.every(doc => doc.reviewStatus === 'APPROVED') ? (
    // Show green success confirmation
) : (
    // Show orange warning confirmation
)}
```

---

## 📦 Files Modified

### `app/admin/merchants/pending-kyb/page.tsx`
**Changes:**
1. Added state variables for production confirmation modal
2. Added helper functions (`openProductionConfirm`, `closeProductionConfirm`, `handleGrantProduction`)
3. Updated card button to always be visible (removed conditional rendering)
4. Updated modal footer button to always be visible
5. Added new `AnimatePresence` section with confirmation modal (lines 645-740)

### Sidebar/Navigation
- ✅ No changes needed - `pending-production` references already removed

---

## 🎯 User Flow

1. **Admin clicks "Grant Production" button**
   - Button is always visible (no prerequisites)

2. **Confirmation modal appears**
   - Modal checks document approval status
   - Shows appropriate message and styling

3. **Admin makes decision**
   - **If approved:** Confident to grant access
   - **If not approved:** Warned but can proceed anyway

4. **Action executed**
   - Toast notification confirms action
   - Both modals close
   - TODO: Backend API call to actually grant access

---

## ✅ Benefits

1. **Always Accessible:** Admins can grant access at any time
2. **Smart Warnings:** System alerts when documents aren't fully reviewed
3. **Flexible Workflow:** Allows emergency access grants when needed
4. **Clear Feedback:** Visual indicators (green vs orange) communicate status
5. **Informed Decisions:** Shows exact document approval count

---

## 🚀 Next Steps

1. **Backend Integration:**
   ```tsx
   // Replace TODO in handleGrantProduction
   const response = await grantProductionAccess(productionMerchant.id);
   ```

2. **Error Handling:**
   - Add try/catch in `handleGrantProduction`
   - Show error toast if API call fails

3. **Data Refresh:**
   - Invalidate queries after successful grant
   - Update merchant status in UI

4. **Audit Logging:**
   - Log who granted access and when
   - Include document approval status at time of grant

5. **Email Notifications:**
   - Notify merchant when production access granted
   - Include next steps and API credentials

---

## 🧪 Testing Checklist

- [x] Button visible on all merchant cards
- [x] Button visible in document review modal
- [x] Modal opens when button clicked
- [x] Green confirmation shown when all docs approved
- [x] Orange warning shown when docs not all approved
- [x] Document count displayed correctly in warning
- [x] Cancel button closes modal
- [x] Grant button shows toast notification
- [x] Both modals close after granting
- [x] Apostrophe properly escaped in text
- [ ] Backend API integration (TODO)
- [ ] E2E testing with real data (TODO)
