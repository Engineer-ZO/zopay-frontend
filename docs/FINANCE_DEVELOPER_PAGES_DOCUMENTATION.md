# Finance & Developer Pages Documentation

**Date:** January 13, 2026  
**Version:** 1.0.0

---

## 📋 Overview

This document covers the Finance and Developer section pages:

**Finance:**
1. ✅ Account status
2. ✅ Settlements

**Developer:**
3. ✅ Webhooks
4. ~~Gateways~~ — merchant dashboard page removed (redirect)

---

## 💰 ACCOUNT STATUS PAGE

**File:** `app/dashboard/wallet/page.tsx`  
**Route:** `/dashboard/wallet`  
**Purpose:** Manage wallet balance, view history, withdraw/top-up funds

### **Features Implemented:**

#### **1. Balance Overview Cards (4)**

**Available Balance Card:**
- Green gradient background
- Wallet icon
- Current balance (FCFA 450,000)
- Trend indicator (+5.2%)
- Last updated timestamp
- **Actions:**
  - 💸 Withdraw button
  - ➕ Top Up button

**Pending Balance Card:**
- Orange background
- Lock icon
- Pending amount (FCFA 25,000)
- Number of processing transactions
- "View Details" button

**Total Collected Card:**
- Blue background
- Arrow down icon
- Total collected this month
- "View Transactions" button

**Total Withdrawn Card:**
- Purple background
- Arrow up icon
- Total withdrawn this month
- "View History" button

#### **2. Balance Chart**
- Placeholder for area chart
- Time range buttons (7 Days, 30 Days, 90 Days)
- Will show balance over time
- Gradient visualization

#### **3. Recent Activity Table**

**Columns:**
1. Date/Time
2. Type (Credit, Withdrawal, Fee, Refund)
3. Amount (color-coded: green for credit, red for debit)
4. Balance After
5. Status (Completed, Pending, Failed)

**Features:**
- Icons for each transaction type
- Reference numbers
- Color-coded amounts
- Status badges
- Pagination

#### **4. Withdraw Modal**

**Fields:**
- Available balance display
- Amount input (with FCFA prefix)
- Min/Max validation
- Quick amount buttons (10K, 50K, 100K, All)

**Withdrawal Methods:**
- **Bank Transfer:**
  - Account: **** **** 1234
  - Bank: Afriland First Bank
  - Fee: 1,000 FCFA
  - Time: 1-2 business days

- **Mobile Money:**
  - MTN: +237 670 123 456
  - Fee: 500 FCFA
  - Time: Instant

**Amount Breakdown:**
- Withdrawal amount
- Processing fee
- You will receive (net amount)

**Action:** "Withdraw X FCFA" button

#### **5. Top-Up Modal**

**Fields:**
- Current balance display
- Amount input
- Min: 5,000 FCFA | Max: 1,000,000 FCFA
- Quick amount buttons (5K, 10K, 50K, 100K)

**Payment Methods:**
- **Mobile Money:**
  - Pay with MTN or Orange Money
  - Fee: 2%
  - Time: Instant

- **Bank Transfer:**
  - Transfer to our account
  - Fee: Free
  - Time: 1-2 business days

**Amount Breakdown:**
- Top-up amount
- Processing fee
- Total to pay

**Action:** "Proceed to Payment" button

### **Dummy Data:**
```javascript
balanceData: {
  available: 450000,
  pending: 25000,
  totalCollected: 2500000,
  totalWithdrawn: 1800000,
  trend: "+5.2%",
}

recentActivity: [
  {
    type: "credit",
    label: "Collection",
    amount: 10000,
    balanceAfter: 450000,
    status: "completed",
  },
  // ... more activities
]
```

---

## 📋 SETTLEMENTS PAGE

**File:** `app/dashboard/settlements/page.tsx`  
**Route:** `/dashboard/settlements`  
**Purpose:** Track settlement periods and bank transfers

### **Features Implemented:**

#### **1. Stats Cards (4)**
1. **Pending** - Orange - FCFA 125,000
2. **This Month** - Blue - FCFA 450,000
3. **Last Month** - Purple - FCFA 380,000
4. **Total YTD** - Green - FCFA 2,500,000

#### **2. Filters**
- Period dropdown (All, This Month, Last Month, Last 3 Months)
- Status dropdown (All, Pending, Processing, Completed, Failed)
- Export button

#### **3. Settlements Table**

**Columns:**
1. Period (e.g., "Jan 1-7, 2026")
2. Amount
3. Status (with badges)
4. Statement (PDF link or View button)
5. Bank Ref (reference number or "-")

**Features:**
- Click row to open detail modal
- Color-coded status badges
- Pagination

#### **4. Settlement Detail Modal**

**Sections:**

**Status:**
- Large status badge
- Expected date (if pending)
- Completed date (if completed)

**Breakdown:**
- Total Collections
- Total Payouts (negative)
- Total Refunds (negative)
- Total Fees (negative)
- **Net Settlement** (bold, green)

**Transactions:**
- Count of collections, payouts, refunds

**Bank Details** (if completed):
- Account number (masked)
- Bank name
- Reference number
- Completed date

**Actions:**
- Download Statement (if completed)
- View Transactions

### **Settlement Statuses:**
- **Pending:** Being calculated
- **Processing:** Bank transfer initiated
- **Completed:** Funds transferred
- **Failed:** Transfer failed

### **Dummy Data:**
```javascript
settlements: [
  {
    period: "Jan 1-7, 2026",
    amount: 125000,
    status: "pending",
    expectedDate: "Jan 10, 2026",
    transactions: { collections: 45, payouts: 3, refunds: 1 },
    breakdown: {
      collections: 150000,
      payouts: 20000,
      refunds: 5000,
      fees: 0,
    },
  },
  // ... more settlements
]
```

---

## 🪝 WEBHOOKS PAGE (TO BE IMPLEMENTED)

**File:** `app/dashboard/webhooks/page.tsx` (not yet created)  
**Route:** `/dashboard/webhooks`  
**Purpose:** Manage webhook endpoints and event subscriptions

### **Specification:**

#### **Stats Cards (4)**
1. Active Endpoints
2. Total Sent
3. Success Rate
4. Failed (Last 24h)

#### **Endpoints Section**
- List of webhook endpoints
- URL, Events count, Status, Actions
- Add Endpoint button

#### **Recent Deliveries Table**
- Time, Event, Endpoint, Status, HTTP Code
- View All button

#### **Add/Edit Endpoint Modal**

**Fields:**
- Endpoint URL (must be HTTPS)
- Events to Subscribe (checkboxes):
  - payment.created
  - payment.succeeded
  - payment.failed
  - payout.created
  - payout.completed
  - payout.failed
  - refund.processed
  - settlement.completed
- Signing Secret (auto-generated)

**Actions:**
- Test Endpoint
- Save Endpoint

#### **Delivery Details Modal**
- Event name
- Endpoint URL
- Timestamp
- Status
- Request headers
- Payload (JSON)
- Response
- Retry button

### **Webhook Events:**
```javascript
events: [
  "payment.created",
  "payment.succeeded",
  "payment.failed",
  "payout.created",
  "payout.completed",
  "payout.failed",
  "refund.processed",
  "settlement.completed",
]
```

---

## 🌐 GATEWAYS PAGE (TO BE IMPLEMENTED)

**File:** `app/dashboard/gateways/page.tsx` (not yet created)  
**Route:** `/dashboard/gateways`  
**Purpose:** Configure payment gateways (MTN, Orange, Moov, Bank)

### **Specification:**

#### **Gateway Cards (4)**

**MTN Mobile Money:**
- Status: ✅ Enabled
- Volume: 65%
- Success Rate: 96%
- Configure button

**Orange Money:**
- Status: ✅ Enabled
- Volume: 25%
- Success Rate: 94%
- Configure button

**Moov Money:**
- Status: ⏸️ Disabled
- Volume: -
- Success Rate: -
- Enable button

**Bank Transfer:**
- Status: ⏸️ Disabled
- Volume: -
- Success Rate: -
- Enable button

#### **Configure Gateway Modal**

**Fields:**
- Status toggle (Enabled/Disabled)

**Transaction Limits:**
- Min Amount (FCFA)
- Max Amount (FCFA)
- Daily Limit (FCFA)

**Fee Override (Optional):**
- Enable fee override checkbox
- Gateway Fee (%)
- Platform Fee (%)

**Actions:**
- Test Connection
- Save Configuration

### **Gateway Features:**
- Enable/Disable gateways
- Set transaction limits
- Custom fee structure
- Test integration
- Performance monitoring

---

## 📊 Data Flow

### **Wallet Flow:**
```
Collections → Wallet (Available Balance)
Wallet → Withdrawals → Bank/Mobile Money
Top-Ups → Wallet (Available Balance)
Pending Transactions → Pending Balance → Available Balance
```

### **Settlement Flow:**
```
Collections - Payouts - Refunds - Fees = Net Settlement
Net Settlement → Bank Transfer (Weekly/Monthly)
Settlement → Statement (PDF)
```

### **Webhook Flow:**
```
Event Occurs → Webhook Service → HTTP POST → Merchant Endpoint
Merchant Endpoint → Response → Logged
Failed Delivery → Retry (Exponential Backoff) → Dead Letter Queue
```

### **Gateway Flow:**
```
Payment Request → Gateway Selection → Gateway API
Gateway API → Response → Update Transaction
Gateway Performance → Stats → Dashboard
```

---

## 🚨 Missing Backend Features

### **Wallet:**
- [ ] Real-time balance updates
- [ ] Balance history snapshots
- [ ] Withdrawal processing
- [ ] Top-up payment integration
- [ ] Multi-currency support

### **Settlements:**
- [ ] Settlement calculation cron
- [ ] Bank transfer integration
- [ ] PDF statement generation
- [ ] Settlement reconciliation

### **Webhooks:**
- [ ] Webhook delivery system
- [ ] Retry mechanism
- [ ] Dead letter queue
- [ ] Signature generation
- [ ] Event publishing

### **Gateways:**
- [ ] Gateway configuration storage
- [ ] Fee override management
- [ ] Health checks
- [ ] Performance metrics

---

## ✅ Implementation Status

### **Completed:**
- [x] Wallet page with balance cards
- [x] Withdraw modal with methods
- [x] Top-up modal with payment options
- [x] Recent activity table
- [x] Balance chart placeholder
- [x] Settlements page with stats
- [x] Settlement detail modal
- [x] Settlements table

### **Pending:**
- [ ] Webhooks page
- [ ] Webhook endpoint management
- [ ] Webhook delivery logs
- [ ] Gateways page
- [ ] Gateway configuration
- [ ] Gateway performance stats

### **Future Enhancements:**
- [ ] Real-time balance updates (WebSocket)
- [ ] Chart library integration (Recharts)
- [ ] Export statements (PDF/CSV)
- [ ] Scheduled withdrawals
- [ ] Webhook testing tool
- [ ] Gateway health dashboard

---

## 🎨 Design Consistency

All pages follow the same design patterns:

**Colors:**
- Orange: Primary actions, pending states
- Green: Success, available balance
- Blue: Information, totals
- Red: Errors, failed states
- Purple: Secondary metrics

**Typography:**
- Page title: `text-xl font-bold`
- Section title: `text-sm font-semibold`
- Card label: `text-xs uppercase tracking-wide`
- Card value: `text-xl font-bold`

**Components:**
- Stats cards with colored backgrounds
- Tables with hover effects
- Modals with rounded corners
- Buttons with transitions
- Status badges with icons

---

**End of Documentation**

For questions or to implement remaining pages, contact the development team.
