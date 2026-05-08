# Transaction Pages Documentation

**Date:** January 13, 2026  
**Version:** 1.0.0

---

## 📋 Overview

This document covers all transaction-related pages in the ZitoPay merchant dashboard:
1. **Transactions** - All transactions (collections + payouts)
2. **Collections** - Incoming payments only
3. **Payouts** - Outgoing disbursements
4. **Refunds** - Refund management

---

## 📁 File Locations

```
app/dashboard/
├── transactions/
│   └── page.tsx          # Main transactions page
├── collections/
│   └── page.tsx          # Collections page
├── payouts/
│   └── page.tsx          # Payouts page
└── refunds/
    └── page.tsx          # Refunds page
```

---

## 1️⃣ TRANSACTIONS PAGE

**File:** `app/dashboard/transactions/page.tsx`  
**Route:** `/dashboard/transactions`  
**Purpose:** View and manage all payment transactions

### **Features Implemented:**

#### **Header & Tabs**
- Page title and description
- **3 tabs:**
  - All Transactions (default)
  - Collections (📥 green)
  - Payouts (📤 blue)
- Tab switching functionality

#### **Stats Cards (4)**
1. **Total Volume** - Blue - Sum of all transactions
2. **Successful** - Green - Count & percentage
3. **Failed** - Red - Count & percentage
4. **Pending** - Orange - Count & percentage

#### **Filters & Search**
- **Search bar** - Search by ID, amount, phone
- **Date range dropdown** - Today, Last 7/30/90 days, Custom
- **Gateway dropdown** - All, MTN, Orange, Moov, Bank
- **Status dropdown** - All, Success, Pending, Failed, Refunded
- **Clear Filters** button
- **Export buttons** - CSV & PDF

#### **Transactions Table**
**Columns:**
1. Checkbox - Bulk selection
2. Date/Time - Sortable
3. Transaction ID - Clickable, shows customer phone
4. Type - Collection (📥) or Payout (📤)
5. Status - Color-coded badges with icons
6. Amount - Bold, formatted
7. Gateway - Gateway name
8. Actions - More menu (●)

**Features:**
- Row hover effect
- Click row to open detail modal
- Bulk selection with "Select All"
- Pagination (1-20 of 1,234)
- Page numbers with prev/next

#### **Bulk Actions**
- Shows when transactions selected
- Dropdown menu for bulk operations
- Export selected, Mark as reviewed, etc.

#### **Transaction Detail Modal**
**Sections:**
1. **Status Banner** - Color-coded with icon
2. **Transaction Information:**
   - Transaction ID
   - Type (Collection/Payout)
   - Date & time
   - Gateway
   - Gateway reference

3. **Amount Breakdown:**
   - Transaction amount
   - Gateway fee (200 FCFA)
   - Platform fee (100 FCFA)
   - Net amount

4. **Customer Information:**
   - Phone number
   - Name (if available)
   - Email (if available)

5. **Action Buttons:**
   - Download Receipt
   - Refund (if success)
   - Retry (if failed)

### **Dummy Data:**
```javascript
stats: {
  totalVolume: 2500000,
  successful: 1234,
  failed: 45,
  pending: 12,
}

transactions: [
  {
    id: "#27-9281-023",
    type: "collection",
    status: "success",
    amount: 10000,
    gateway: "MTN",
    customer: "+237 670 123 456",
    date: "Jan 12, 2026",
    time: "14:23:45",
  },
  // ... more transactions
]
```

---

## 2️⃣ COLLECTIONS PAGE

**File:** `app/dashboard/collections/page.tsx`  
**Route:** `/dashboard/collections`  
**Purpose:** Manage incoming payments from customers

### **Features Implemented:**

#### **Header**
- Page title and description
- **"+ New Payment" button** - Opens payment link modal

#### **Stats Cards (4)**
1. Total - Blue
2. Success - Green
3. Pending - Orange
4. Failed - Red

#### **Filters & Search**
- Search bar
- Date range dropdown
- Gateway dropdown
- Status dropdown
- Export button

#### **Table**
**Columns:**
1. Date
2. ID
3. Customer (phone number)
4. Amount
5. Gateway
6. Status (with icons)
7. Actions

#### **New Payment Modal**
**Purpose:** Generate payment link or QR code

**Fields:**
- Amount (FCFA)
- Description

**Actions:**
- **Generate Link** button (🔗)
- **QR Code** button (📱)

**Use Case:**
- Merchant enters amount and description
- System generates shareable payment link
- Customer clicks link and pays
- Payment appears in collections

### **Unique Features:**
- Payment link generation
- QR code generation
- Customer phone number display
- Quick refund for successful payments

---

## 3️⃣ PAYOUTS PAGE

**File:** `app/dashboard/payouts/page.tsx`  
**Route:** `/dashboard/payouts`  
**Purpose:** Send money to customers and vendors

### **Features Implemented:**

#### **Header**
- Page title and description
- **"+ Single" button** - Single payout modal
- **"📤 Bulk Upload" button** - CSV upload modal

#### **Stats Cards (4)**
1. Total - Blue
2. Success - Green
3. Pending - Orange
4. Failed - Red

#### **Filters & Search**
- Search bar
- Date range dropdown
- Gateway dropdown
- Status dropdown
- Export button

#### **Table**
**Columns:**
1. Date
2. ID
3. Recipient (phone number)
4. Amount
5. Gateway
6. Status (with icons)
7. Actions

#### **Single Payout Modal**
**Fields:**
- Recipient phone number
- Amount (FCFA)
- Gateway selection
- Reference/Description

**Fee Calculation:**
- Shows amount
- Shows fee (500 FCFA)
- Shows total

**Action:**
- "Send Payout" button

#### **Bulk Upload Modal**
**Features:**
- Drag & drop CSV upload area
- File size limit (5MB)
- CSV format example:
  ```csv
  phone,amount,gateway,reference
  +237670123456,10000,MTN,Salary
  +237690234567,15000,Orange,Commission
  ```
- "Download Template" button

**Use Case:**
- Merchant uploads CSV with multiple payouts
- System validates recipients
- Batch processes all payouts
- Shows results

### **Unique Features:**
- Single payout creation
- Bulk CSV upload
- Fee calculation
- Template download
- Retry failed payouts

---

## 4️⃣ REFUNDS PAGE

**File:** `app/dashboard/refunds/page.tsx`  
**Route:** `/dashboard/refunds`  
**Purpose:** Process refunds for customer payments

### **Features Implemented:**

#### **Header**
- Page title and description
- **"+ New Refund" button** - Opens refund modal

#### **Stats Cards (4)**
1. Total - Blue
2. Success - Green
3. Pending - Orange
4. Failed - Red

#### **Filters & Search**
- Search bar
- Date range dropdown
- **Method dropdown** - All, Reversal, Payout
- Status dropdown
- Export button

#### **Table**
**Columns:**
1. Date
2. TX ID (Original transaction ID + Refund ID)
3. Amount
4. Method (Reversal/Payout badge)
5. Reason
6. Status (with icons)
7. Actions

#### **New Refund Modal**
**Fields:**
1. **Original Transaction ID** - Search/input
2. **Refund Method:**
   - Reversal (Instant) - Gateway reverses transaction
   - Payout (Manual) - Send money back via payout
3. **Refund Amount** - Can be partial or full
4. **Reason (Required):**
   - Duplicate payment
   - Customer request
   - Service not delivered
   - Wrong amount
   - Technical error
   - Other
5. **Additional Details** - Optional textarea

**Warning:**
- Orange banner with alert icon
- "This action cannot be undone"
- "Customer will receive refund immediately"

**Action:**
- "Process Refund" button

### **Refund Methods:**

**Reversal:**
- Instant
- Gateway reverses original transaction
- Preferred method
- May not always be available

**Payout:**
- Manual
- Creates new payout to customer
- Used when reversal not available
- Takes longer

### **Unique Features:**
- Refund method selection
- Reason tracking
- Partial refund support
- Original transaction linking
- Warning messages

---

## 🎨 Common Design Elements

### **Stats Cards**
All pages use the same 4-card layout:
```tsx
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Total - Blue */}
  {/* Success - Green */}
  {/* Pending - Orange */}
  {/* Failed - Red */}
</div>
```

### **Status Colors**
```javascript
success: "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
pending: "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400"
failed: "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
```

### **Status Icons**
- Success: `<CheckCircle2 />`
- Pending: `<Clock />`
- Failed: `<XCircle />`

### **Table Structure**
- Rounded border
- Hover effect on rows
- Pagination at bottom
- Responsive (horizontal scroll on mobile)

### **Modals**
- Fixed overlay (black/50)
- Centered
- Max width (max-w-md or max-w-2xl)
- Close button (X) in top-right
- Rounded corners (rounded-2xl)
- Shadow and border

---

## 📊 Data Flow

### **Transactions Page**
```
User → Filter/Search → API Request → Display Results
User → Click Row → Open Detail Modal
User → Select Multiple → Bulk Actions
```

### **Collections Page**
```
User → Click "New Payment" → Enter Details → Generate Link
Customer → Click Link → Pay → Appears in Collections
User → Click Row → View Details → Refund (if needed)
```

### **Payouts Page**
```
Single:
User → Click "Single" → Enter Details → Send Payout

Bulk:
User → Click "Bulk Upload" → Upload CSV → Validate → Process
```

### **Refunds Page**
```
User → Click "New Refund" → Enter TX ID → Select Method → 
Choose Reason → Process → Refund Created
```

---

## 🚨 Missing Backend Features

### **All Pages**
- [ ] Real API integration
- [ ] Pagination backend
- [ ] Search functionality
- [ ] Filter combinations
- [ ] Export (CSV/PDF)
- [ ] Loading states
- [ ] Error handling

### **Collections**
- [ ] Payment link generation API
- [ ] QR code generation
- [ ] Link expiration
- [ ] Link tracking

### **Payouts**
- [ ] Bulk CSV upload endpoint
- [ ] CSV validation
- [ ] Batch processing
- [ ] Template generation
- [ ] Fee calculation API

### **Refunds**
- [ ] Refund eligibility check
- [ ] Partial refund support
- [ ] Reversal integration
- [ ] Refund reasons tracking
- [ ] Timeline tracking

---

## ✅ Implementation Checklist

### **Phase 1: Basic Functionality**
- [x] Transactions page layout
- [x] Collections page layout
- [x] Payouts page layout
- [x] Refunds page layout
- [x] Stats cards
- [x] Tables
- [x] Filters UI
- [x] Modals

### **Phase 2: API Integration**
- [ ] Connect to backend APIs
- [ ] Implement React Query hooks
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add empty states

### **Phase 3: Advanced Features**
- [ ] Real-time updates
- [ ] Export functionality
- [ ] Bulk operations
- [ ] Advanced filters
- [ ] Search autocomplete

### **Phase 4: Polish**
- [ ] Animations
- [ ] Tooltips
- [ ] Keyboard shortcuts
- [ ] Mobile optimization
- [ ] Accessibility

---

## 🎯 Quick Comparison

| Feature | Transactions | Collections | Payouts | Refunds |
|---------|-------------|-------------|---------|---------|
| **Direction** | Both | Incoming | Outgoing | Return |
| **Primary Action** | View | Generate Link | Send Money | Process Refund |
| **Tabs** | Yes (3) | No | No | No |
| **Bulk Support** | Yes | No | Yes (CSV) | No |
| **Special Field** | Type | Customer | Recipient | Reason |
| **Unique Modal** | Detail | Payment Link | Single/Bulk | Refund Form |
| **Method** | - | Gateway | Gateway | Reversal/Payout |

---

## 📝 Notes

### **Design Consistency**
- All pages follow the same layout pattern
- Same color scheme throughout
- Consistent spacing and typography
- Reusable components

### **User Experience**
- Clear visual hierarchy
- Obvious primary actions
- Helpful empty states
- Informative error messages

### **Performance**
- Pagination for large datasets
- Lazy loading ready
- Optimized re-renders
- Efficient state management

---

**End of Documentation**

For questions or updates, contact the development team.
