# Admin Merchants Page Implementation

**Date:** January 13, 2026
**Status:** ✅ Phase 1 Complete (UI with Dummy Data)

---

## 🎯 OVERVIEW

The Merchants page allows admins to view and manage all merchant accounts on the platform. It serves as the primary entry point for KYB reviews, production approvals, and account management.

**URL:** `/admin/merchants`

---

## 📊 FEATURES IMPLEMENTED

### **1. Header Section**
- **Page Title:** "Merchants" with icon
- **Actions:**
  - Export Button
  - Add Merchant Button

### **2. Quick Stats Cards**
Displays key metrics at a glance:
- **Total Merchants:** (Blue)
- **Active Merchants:** (Green)
- **Sandbox Only:** (Yellow)
- **Production:** (Teal)
- **Suspended:** (Red)

### **3. Search & Filters**
- **Search Bar:** Filters by name, email, or ID (visual only currently)
- **Filter Button:** Toggle for advanced filters (placeholder)

### **4. Merchants Table**
Comprehensive table showing:
- **Checkbox:** For bulk actions
- **Merchant Info:** Business Name + Email + Avatar
- **Merchant ID:** Copiable monospace ID
- **KYB Status:** Badge (Approved, Pending, Rejected, Not Submitted)
- **Environment:** Badge (Prod Active, Prod Pending, Sandbox)
- **Status:** Badge (Active, Suspended, Disabled)
- **Created Date:** Formatted date
- **Actions:** Context menu trigger

### **5. Pagination**
- Standard pagination controls (Previous, Next, Page Numbers)
- Currently static visual implementation

---

## 🎨 DESIGN SYSTEM

### **Color Coding (Badges)**
- **Green:** Approved, Active
- **Orange:** Pending
- **Red:** Rejected, Suspended
- **Teal:** Production Active
- **Gray:** Not Submitted, Disabled

### **Components used**
- `lucide-react` for icons
- Tailwind CSS for all styling

---

## 📅 NEXT STEPS (Phase 2 & 3)

1.  **Backend Integration:** Connect to `/api/v1/admin/merchants`
2.  **Modals:**
    - Implementation of "Add Merchant" Modal
    - Implementation of "Merchant Details" Modal/Drawer
3.  **Search Logic:** Implement actual debounce search
4.  **Filter Logic:** Implement complex filtering (Status, Date, Country)
5.  **Bulk Actions:** Implement "Suspend Selected", "Export Selected"

---

## 📝 DATA COMPOSITION (Dummy)

The page uses a `DUMMY_MERCHANTS` array to strictly type and render the table rows, demonstrating all possible states (Approved/Pending, Prod/Sandbox, Active/Suspended).
