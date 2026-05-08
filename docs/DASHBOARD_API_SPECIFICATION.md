# Dashboard API Specification

**Version:** 1.0  
**Last Updated:** January 2026  
**Purpose:** API endpoints required for the Merchant Dashboard page

---

## Overview

This document specifies the API endpoints required to power the Merchant Dashboard (`/dashboard`). All endpoints require authentication and must include the merchant ID in the request path or as a query parameter.

---

## Base URL

- **Sandbox:** `http://localhost:9000`
- **Production:** `https://api.zitopay.com`

---

## Authentication

All endpoints require JWT Bearer token authentication:

```
Authorization: Bearer <accessToken>
```

The merchant ID should be extracted from the authenticated user's context or passed as a path parameter.

---

## Endpoints

### 1. Get Dashboard Overview Stats

**Endpoint:** `GET /merchant/v1/merchants/:merchantId/dashboard/stats`

**Description:** Returns the 5 key metric cards displayed at the top of the dashboard.

**Path Parameters:**
- `merchantId` (string, required) - UUID of the merchant

**Query Parameters:**
- `period` (string, optional) - Time period for calculations. Options: `7d`, `30d`, `90d`, `all`. Default: `30d`

**Response (200 OK):**

```json
{
  "stats": [
    {
      "label": "Available Balance",
      "value": "2450000.50",
      "currency": "XAF",
      "change": "+12.5%",
      "trend": "up",
      "subtitle": "Available balance"
    },
    {
      "label": "Total Revenue",
      "value": "12500000",
      "currency": "XAF",
      "change": "+8.2%",
      "trend": "up",
      "subtitle": "All time collections"
    },
    {
      "label": "Transactions",
      "value": "1245",
      "currency": "",
      "change": "+15.3%",
      "trend": "up",
      "subtitle": "Last 30 days"
    },
    {
      "label": "Success Rate",
      "value": "98.5",
      "currency": "%",
      "change": "+2.1%",
      "trend": "up",
      "subtitle": "Transaction success"
    },
    {
      "label": "Pending",
      "value": "125000",
      "currency": "XAF",
      "change": "-5.2%",
      "trend": "down",
      "subtitle": "In processing"
    }
  ]
}
```

**Data Structure:**

| Field | Type | Description |
|-------|------|-------------|
| `label` | string | Display label for the metric card |
| `value` | string | The main numeric value (formatted as string for display) |
| `currency` | string | Currency code (e.g., "XAF") or empty string for percentages/counts |
| `change` | string | Percentage change from previous period (e.g., "+12.5%", "-5.2%") |
| `trend` | string | Direction of change: `"up"` or `"down"` |
| `subtitle` | string | Additional context text displayed below the value |

**Calculation Notes:**
- **Available Balance:** Current wallet balance
- **Total Revenue:** Sum of all successful collection transactions (all-time)
- **Transactions:** Count of all transactions in the specified period
- **Success Rate:** Percentage of successful transactions vs total transactions in the period
- **Pending:** Sum of amounts in transactions with status `PENDING_GATEWAY` or `VERIFYING`

**Error Responses:**
- `401 Unauthorized` - Invalid or missing authentication token
- `403 Forbidden` - User doesn't have access to this merchant
- `404 Not Found` - Merchant not found
- `500 Internal Server Error` - Server error

---

### 2. Get Recent Transactions

**Endpoint:** `GET /merchant/v1/merchants/:merchantId/dashboard/transactions/recent`

**Description:** Returns the most recent transactions for display in the dashboard table.

**Path Parameters:**
- `merchantId` (string, required) - UUID of the merchant

**Query Parameters:**
- `limit` (integer, optional) - Number of transactions to return. Default: `10`, Max: `50`
- `type` (string, optional) - Filter by transaction type: `collection`, `payout`, `refund`. If not provided, returns all types.

**Response (200 OK):**

```json
{
  "transactions": [
    {
      "id": "tx_550e8400e29b41d4a716446655440000",
      "date": "Jan 30, 2026",
      "time": "14:32",
      "type": "collection",
      "amount": 125000,
      "currency": "XAF",
      "status": "SUCCESS",
      "gateway": "MTN_MOMO",
      "customer": "+237 6 12 34 56 78",
      "fees": 2500,
      "netAmount": 122500,
      "createdAt": "2026-01-30T14:32:00.000Z"
    },
    {
      "id": "tx_660e8400e29b41d4a716446655440001",
      "date": "Jan 30, 2026",
      "time": "13:15",
      "type": "payout",
      "amount": 50000,
      "currency": "XAF",
      "status": "PENDING_GATEWAY",
      "gateway": "ORANGE_MONEY",
      "recipient": "+237 6 98 76 54 32",
      "fees": 1000,
      "netAmount": 49000,
      "createdAt": "2026-01-30T13:15:00.000Z"
    },
    {
      "id": "tx_770e8400e29b41d4a716446655440002",
      "date": "Jan 30, 2026",
      "time": "12:45",
      "type": "collection",
      "amount": 75000,
      "currency": "XAF",
      "status": "SUCCESS",
      "gateway": "MTN_MOMO",
      "customer": "+237 6 11 22 33 44",
      "fees": 1500,
      "netAmount": 73500,
      "createdAt": "2026-01-30T12:45:00.000Z"
    },
    {
      "id": "tx_880e8400e29b41d4a716446655440003",
      "date": "Jan 30, 2026",
      "time": "11:20",
      "type": "refund",
      "amount": 30000,
      "currency": "XAF",
      "status": "SUCCESS",
      "gateway": "MTN_MOMO",
      "customer": "+237 6 55 66 77 88",
      "fees": 0,
      "netAmount": 30000,
      "createdAt": "2026-01-30T11:20:00.000Z"
    },
    {
      "id": "tx_990e8400e29b41d4a716446655440004",
      "date": "Jan 29, 2026",
      "time": "16:10",
      "type": "collection",
      "amount": 200000,
      "currency": "XAF",
      "status": "FAILED",
      "gateway": "ORANGE_MONEY",
      "customer": "+237 6 99 88 77 66",
      "fees": 0,
      "netAmount": 0,
      "createdAt": "2026-01-29T16:10:00.000Z"
    }
  ],
  "total": 1245,
  "hasMore": true
}
```

**Data Structure:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique transaction identifier (UUID) |
| `date` | string | Formatted date string (e.g., "Jan 30, 2026") |
| `time` | string | Formatted time string (e.g., "14:32") |
| `type` | string | Transaction type: `"collection"`, `"payout"`, or `"refund"` |
| `amount` | number | Transaction amount (in smallest currency unit) |
| `currency` | string | Currency code (e.g., "XAF") |
| `status` | string | Transaction status: `"SUCCESS"`, `"PENDING_GATEWAY"`, `"FAILED"`, `"CANCELLED"`, `"VERIFYING"` |
| `gateway` | string | Payment gateway used: `"MTN_MOMO"`, `"ORANGE_MONEY"`, etc. |
| `customer` | string | Customer phone number (for collections/refunds) |
| `recipient` | string | Recipient phone number (for payouts) - only present for payout type |
| `fees` | number | Transaction fees charged |
| `netAmount` | number | Net amount after fees |
| `createdAt` | string | ISO 8601 timestamp of transaction creation |

**Response Metadata:**

| Field | Type | Description |
|-------|------|-------------|
| `total` | number | Total number of transactions matching the query |
| `hasMore` | boolean | Whether there are more transactions available |

**Date/Time Formatting:**
- `date`: Format as "MMM DD, YYYY" (e.g., "Jan 30, 2026")
- `time`: Format as "HH:MM" in 24-hour format (e.g., "14:32")

**Error Responses:**
- `401 Unauthorized` - Invalid or missing authentication token
- `403 Forbidden` - User doesn't have access to this merchant
- `404 Not Found` - Merchant not found
- `500 Internal Server Error` - Server error

---

## Data Types and Enums

### Transaction Status

```
SUCCESS          - Transaction completed successfully
PENDING_GATEWAY  - Transaction pending at gateway
VERIFYING        - Transaction being verified
FAILED           - Transaction failed
CANCELLED        - Transaction was cancelled
REFUNDED         - Transaction was refunded
```

### Transaction Type

```
collection  - Money received from customer
payout      - Money sent to recipient
refund      - Refund issued to customer
```

### Gateway Types

```
MTN_MOMO      - MTN Mobile Money
ORANGE_MONEY  - Orange Money
```

### Trend Direction

```
up    - Positive change (increase)
down  - Negative change (decrease)
```

---

## Implementation Notes

### 1. Date Range Calculations

For the dashboard stats endpoint, when calculating metrics:
- **Available Balance:** Current real-time balance
- **Total Revenue:** All-time sum (not affected by period parameter)
- **Transactions:** Count filtered by period
- **Success Rate:** Calculated for transactions in the specified period
- **Pending:** Current pending amount (not affected by period)

### 2. Transaction Ordering

Recent transactions should be ordered by `createdAt` in descending order (newest first).

### 3. Currency Formatting

All amounts should be returned as numbers (in smallest currency unit). The frontend will handle formatting with currency symbols.

### 4. Percentage Calculations

For trend calculations:
- Compare current period to previous period of same length
- Format as string with `+` or `-` prefix and `%` suffix
- Example: `"+12.5%"`, `"-5.2%"`


---

## Example Requests

### Get Dashboard Stats

```bash
curl -X GET \
  'https://api.zitopay.com/merchant/v1/merchants/550e8400-e29b-41d4-a716-446655440000/dashboard/stats?period=30d' \
  -H 'Authorization: Bearer <accessToken>'
```

### Get Recent Transactions

```bash
curl -X GET \
  'https://api.zitopay.com/merchant/v1/merchants/550e8400-e29b-41d4-a716-446655440000/dashboard/transactions/recent?limit=10' \
  -H 'Authorization: Bearer <accessToken>'
```


---

## Testing Checklist

- [ ] Dashboard stats endpoint returns all 5 metrics correctly
- [ ] Trend calculations are accurate (comparing periods)
- [ ] Recent transactions are ordered correctly (newest first)
- [ ] Transaction date/time formatting is correct
- [ ] All endpoints require authentication
- [ ] Merchant ID validation (user can only access their own merchant)
- [ ] Error responses are properly formatted
- [ ] Currency handling is consistent

---

## Questions or Issues?

If you have questions about this specification, please contact the frontend development team.
