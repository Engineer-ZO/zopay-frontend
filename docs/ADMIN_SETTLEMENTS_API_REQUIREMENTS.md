# Admin Settlements API Requirements

**Date:** January 2025  
**Purpose:** API routes required for the Admin Settlements Management page  
**Status:** ⏳ Pending Backend Implementation

---

## Overview

The Admin Settlements page requires two new API routes that allow admins to view and manage settlements across all merchants. These routes are similar to the merchant settlement routes but provide admin-level access to all merchants' settlements.

---

## Required API Routes

### 1. List All Settlements (Admin)

**Endpoint:** `GET /admin/settlements`

**Authentication:** JWT Bearer Token (Admin only)

**Purpose:** Get list of all settlements across all merchants for admin review and management

**Query Parameters:**
- `merchantId` (optional, string): Filter by specific merchant ID (UUID)
- `startDate` (optional, string): Filter by period start date (ISO 8601 format: `2025-01-01T00:00:00Z`)
- `endDate` (optional, string): Filter by period end date (ISO 8601 format: `2025-01-07T23:59:59Z`)
- `status` (optional, string): Filter by status. Options: `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`
- `page` (optional, number): Page number for pagination (default: 1)
- `limit` (optional, number): Items per page (default: 50, max: 100)

**Example Request:**
```
GET /admin/settlements?status=PENDING&merchantId=123e4567-e89b-12d3-a456-426614174000&page=1&limit=20
```

**Response (200 OK):**
```json
{
  "settlements": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "merchantId": "123e4567-e89b-12d3-a456-426614174000",
      "merchantName": "John Doe",
      "merchantBusinessName": "Acme Corp",
      "periodStart": "2025-01-01T00:00:00Z",
      "periodEnd": "2025-01-07T23:59:59Z",
      "totalCollections": "100000.00",
      "totalPayouts": "20000.00",
      "totalRefunds": "5000.00",
      "totalFees": "1500.00",
      "netAmount": "73500.00",
      "status": "PENDING",
      "statementUrl": "https://storage.example.com/statements/550e8400-...?signature=...",
      "bankTransferReference": null,
      "createdAt": "2025-01-08T02:00:00Z",
      "updatedAt": "2025-01-08T02:00:00Z"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "merchantId": "223e4567-e89b-12d3-a456-426614174001",
      "merchantName": "Jane Smith",
      "merchantBusinessName": "Tech Solutions Ltd",
      "periodStart": "2025-01-01T00:00:00Z",
      "periodEnd": "2025-01-07T23:59:59Z",
      "totalCollections": "200000.00",
      "totalPayouts": "30000.00",
      "totalRefunds": "10000.00",
      "totalFees": "3000.00",
      "netAmount": "157000.00",
      "status": "COMPLETED",
      "statementUrl": "https://storage.example.com/statements/660e8400-...?signature=...",
      "bankTransferReference": "MTN_MOMO_TX_123456789",
      "createdAt": "2025-01-08T02:00:00Z",
      "updatedAt": "2025-01-08T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

**Response Fields:**
- `settlements` (array): Array of settlement objects
  - `id` (string, UUID): Settlement ID
  - `merchantId` (string, UUID): Merchant ID
  - `merchantName` (string, optional): Merchant user's name (for display)
  - `merchantBusinessName` (string, optional): Merchant business name (for display)
  - `periodStart` (string, ISO 8601): Settlement period start date
  - `periodEnd` (string, ISO 8601): Settlement period end date
  - `totalCollections` (string, decimal): Total collections amount
  - `totalPayouts` (string, decimal): Total payouts amount
  - `totalRefunds` (string, decimal): Total refunds amount
  - `totalFees` (string, decimal): Total fees amount
  - `netAmount` (string, decimal): Net settlement amount (collections - payouts - refunds - fees)
  - `status` (string): Settlement status (`PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`)
  - `statementUrl` (string, optional): Signed URL to PDF statement (if available)
  - `bankTransferReference` (string, optional): Bank/MoMo transaction reference (if completed)
  - `createdAt` (string, ISO 8601): Settlement creation timestamp
  - `updatedAt` (string, ISO 8601, optional): Last update timestamp
- `pagination` (object): Pagination metadata
  - `page` (number): Current page number
  - `limit` (number): Items per page
  - `total` (number): Total number of settlements matching filters

**Error Responses:**
- `401 Unauthorized`: Not authenticated or invalid token
  ```json
  {
    "error": "UNAUTHORIZED",
    "message": "Authentication required"
  }
  ```
- `403 Forbidden`: User is not an admin
  ```json
  {
    "error": "FORBIDDEN",
    "message": "Admin access required"
  }
  ```
- `400 Bad Request`: Invalid query parameters
  ```json
  {
    "error": "INVALID_PARAMETERS",
    "message": "Invalid date format or status value"
  }
  ```

**Notes:**
- Returns settlements from all merchants (unless filtered by `merchantId`)
- `merchantName` and `merchantBusinessName` are optional but recommended for better UX
- If merchant info is not available, frontend will display "Unknown" or merchant ID
- Same settlement structure as merchant route (`GET /settlements`) but with merchant info added
- Supports pagination for large datasets

---

### 2. Get Settlement Details (Admin)

**Endpoint:** `GET /admin/settlements/:id`

**Authentication:** JWT Bearer Token (Admin only)

**Purpose:** Get detailed information about a specific settlement (admin can access any merchant's settlement)

**Path Parameters:**
- `id` (string, UUID, required): Settlement ID

**Example Request:**
```
GET /admin/settlements/550e8400-e29b-41d4-a716-446655440000
```

**Response (200 OK):**
```json
{
  "settlement": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "merchantId": "123e4567-e89b-12d3-a456-426614174000",
    "merchantName": "John Doe",
    "merchantBusinessName": "Acme Corp",
    "periodStart": "2025-01-01T00:00:00Z",
    "periodEnd": "2025-01-07T23:59:59Z",
    "totalCollections": "100000.00",
    "totalPayouts": "20000.00",
    "totalRefunds": "5000.00",
    "totalFees": "1500.00",
    "netAmount": "73500.00",
    "status": "PENDING",
    "statementUrl": "https://storage.example.com/statements/550e8400-...?signature=...",
    "bankTransferReference": null,
    "createdAt": "2025-01-08T02:00:00Z",
    "updatedAt": "2025-01-08T02:00:00Z"
  },
  "items": [
    {
      "id": "item-1",
      "transactionId": "tx-001",
      "type": "COLLECTION",
      "amount": "50000.00",
      "fees": "750.00",
      "createdAt": "2025-01-08T02:00:00Z"
    },
    {
      "id": "item-2",
      "transactionId": "tx-002",
      "type": "PAYOUT",
      "amount": "20000.00",
      "fees": "300.00",
      "createdAt": "2025-01-08T02:00:00Z"
    },
    {
      "id": "item-3",
      "transactionId": "tx-003",
      "type": "REFUND",
      "amount": "5000.00",
      "fees": "0.00",
      "createdAt": "2025-01-08T02:00:00Z"
    }
  ]
}
```

**Response Fields:**
- `settlement` (object): Settlement details (same structure as list endpoint)
- `items` (array): Array of transaction items included in the settlement
  - `id` (string): Item ID
  - `transactionId` (string): Related transaction ID
  - `type` (string): Transaction type (`COLLECTION`, `PAYOUT`, `REFUND`)
  - `amount` (string, decimal): Transaction amount
  - `fees` (string, decimal): Fees for this transaction
  - `createdAt` (string, ISO 8601): Transaction timestamp

**Error Responses:**
- `401 Unauthorized`: Not authenticated
  ```json
  {
    "error": "UNAUTHORIZED",
    "message": "Authentication required"
  }
  ```
- `403 Forbidden`: User is not an admin
  ```json
  {
    "error": "FORBIDDEN",
    "message": "Admin access required"
  }
  ```
- `404 Not Found`: Settlement not found
  ```json
  {
    "error": "SETTLEMENT_NOT_FOUND",
    "message": "Settlement with the specified ID does not exist"
  }
  ```

**Notes:**
- Admin can access any merchant's settlement (no merchant restriction)
- Same structure as merchant route (`GET /settlements/:id`) but with merchant info added
- Includes full transaction breakdown in `items` array
- `merchantName` and `merchantBusinessName` are optional but recommended

---

## Implementation Notes

### Authentication
- Both routes require JWT Bearer Token authentication
- Token should be validated and user role checked (must be admin)
- Token is sent in `Authorization: Bearer <token>` header

### Data Structure
- Settlement structure matches merchant routes exactly
- Additional fields (`merchantName`, `merchantBusinessName`) are optional but recommended
- All monetary amounts are strings with 2 decimal places (e.g., `"100000.00"`)
- All dates are ISO 8601 format (e.g., `"2025-01-01T00:00:00Z"`)

### Filtering & Pagination
- Filters should be applied server-side for performance
- Pagination is required for large datasets
- Default page size: 50, maximum: 100
- Total count should reflect filtered results, not all settlements

### Merchant Information
- `merchantName`: User's name associated with the merchant account
- `merchantBusinessName`: Business/company name from merchant profile
- If merchant info is not available, these fields can be `null` or omitted
- Frontend will handle missing merchant info gracefully

### Performance Considerations
- Consider database indexing on:
  - `merchantId`
  - `status`
  - `periodStart` / `periodEnd`
  - `createdAt`
- For large datasets, consider cursor-based pagination as an alternative
- Cache merchant names if possible to reduce join queries

---

## Frontend Integration

The frontend is already implemented and ready to use these routes:

- **API Functions:** `features/settlements/api.ts`
  - `listAllSettlements()` - Calls `GET /admin/settlements`
  - `getAdminSettlementDetails()` - Calls `GET /admin/settlements/:id`

- **React Query Hooks:** `features/settlements/queries.ts`
  - `useListAllSettlements()` - Hook for listing all settlements
  - `useAdminSettlementDetails()` - Hook for getting settlement details

- **Admin Page:** `app/admin/settlements/page.tsx`
  - Full table view with filters
  - Settlement details modal
  - Complete settlement functionality

---

## Testing Checklist

- [ ] Admin can list all settlements
- [ ] Admin can filter by merchant ID
- [ ] Admin can filter by status
- [ ] Admin can filter by date range
- [ ] Admin can paginate through results
- [ ] Admin can view settlement details
- [ ] Admin can see merchant information in list
- [ ] Admin can see merchant information in details
- [ ] Non-admin users get 403 Forbidden
- [ ] Invalid settlement ID returns 404
- [ ] Invalid query parameters return 400
- [ ] Empty results return empty array (not error)

---

## Related Routes

These routes work together with existing settlement routes:

- `POST /settlements/:id/complete` - Complete settlement (already exists, admin only)
- `GET /settlements` - List merchant's own settlements (merchant route)
- `GET /settlements/:id` - Get merchant's own settlement details (merchant route)

---

## Questions or Issues?

If you have questions about the implementation or need clarification on any requirements, please contact the frontend team.

---

**Last Updated:** January 2025  
**Version:** 1.0
