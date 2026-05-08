# Merchant Feature Documentation

## Overview

The Merchant feature provides a complete implementation for managing merchant accounts, KYB verification, production access, domain verification, and gateway configuration. It follows the same architecture as the Auth feature with API functions, React hooks, and TypeScript types.

---

## 📁 File Structure

```
features/merchants/
├── api/
│   └── index.ts              # API functions for all merchant endpoints
├── hooks/
│   ├── useMerchant.ts        # Hooks for merchant management
│   ├── useDomains.ts         # Hooks for domain management
│   └── index.ts              # Exports all hooks
└── types/
    └── index.ts              # TypeScript types and interfaces
```

---

## 🔧 Components

### 1. Types (`features/merchants/types/index.ts`)

Defines all TypeScript interfaces for:
- **Merchant states**: KYCStatus, SandboxState, ProductionState
- **Data objects**: Merchant, Domain, GatewayConfig, FeeOverride
- **Request types**: CreateMerchantRequest, UpdateMerchantRequest, etc.
- **Response types**: CreateMerchantResponse, GetMerchantResponse, etc.

### 2. API Functions (`features/merchants/api/index.ts`)

All API functions use the `apiClient` from `@/lib/apiClient` which handles:
- Base URL configuration
- Authentication headers
- Request/response interceptors
- Error handling

#### Merchant Management Functions

| Function | Description | Parameters | Returns |
|----------|-------------|------------|---------|
| `createMerchant` | Create new merchant | `CreateMerchantRequest` | `CreateMerchantResponse` |
| `getMerchant` | Get merchant details | `merchantId: string` | `GetMerchantResponse` |
| `updateMerchant` | Update merchant profile | `merchantId, UpdateMerchantRequest` | `UpdateMerchantResponse` |
| `submitKYB` | Submit KYB for review | `merchantId: string` | `SubmitKYBResponse` |
| `approveKYB` | Approve KYB (Admin) | `merchantId: string` | `ApproveKYBResponse` |
| `rejectKYB` | Reject KYB (Admin) | `merchantId: string` | `RejectKYBResponse` |
| `requestProduction` | Request production access | `merchantId: string` | `RequestProductionResponse` |
| `approveProduction` | Approve production (Admin) | `merchantId: string` | `ApproveProductionResponse` |
| `suspendSandbox` | Suspend sandbox (Admin) | `merchantId: string` | `SuspendSandboxResponse` |
| `reactivateSandbox` | Reactivate sandbox (Admin) | `merchantId: string` | `ReactivateSandboxResponse` |
| `suspendProduction` | Suspend production (Admin) | `merchantId: string` | `SuspendProductionResponse` |
| `reactivateProduction` | Reactivate production (Admin) | `merchantId: string` | `ReactivateProductionResponse` |

#### Domain Management Functions

| Function | Description | Parameters | Returns |
|----------|-------------|------------|---------|
| `addDomain` | Add domain for verification | `merchantId, AddDomainRequest` | `AddDomainResponse` |
| `verifyDomain` | Verify domain ownership | `merchantId, domainId` | `VerifyDomainResponse` |
| `getDomains` | Get all domains | `merchantId: string` | `GetDomainsResponse` |

#### Gateway / fee API functions (no merchant dashboard UI)

| Function | Description | Parameters | Returns |
|----------|-------------|------------|---------|
| `getGateways` | List configured gateways | `merchantId` | `GetGatewaysResponse` |
| `configureGateway` | Configure payment gateway | `merchantId, ConfigureGatewayRequest` | `ConfigureGatewayResponse` |
| `setFeeOverride` | Set custom fees | `merchantId, SetFeeOverrideRequest` | `SetFeeOverrideResponse` |

> React hooks for these were removed with the merchant **Gateways** page; call the API functions directly if needed (e.g. internal tools).

### 3. React Hooks

All hooks use TanStack Query (React Query) for:
- Automatic caching
- Background refetching
- Loading and error states
- Optimistic updates

#### Merchant Management Hooks (`useMerchant.ts`)

```typescript
// Create merchant
const { mutate: createMerchant, isPending, isError, error } = useCreateMerchant();

// Get merchant (query)
const { data, isLoading, isError, error, refetch } = useGetMerchant(merchantId);

// Update merchant
const { mutate: updateMerchant, isPending } = useUpdateMerchant(merchantId);

// KYB operations
const { mutate: submitKYB } = useSubmitKYB(merchantId);
const { mutate: approveKYB } = useApproveKYB(merchantId);
const { mutate: rejectKYB } = useRejectKYB(merchantId);

// Production access
const { mutate: requestProduction } = useRequestProduction(merchantId);
const { mutate: approveProduction } = useApproveProduction(merchantId);

// Environment management (Admin)
const { mutate: suspendSandbox } = useSuspendSandbox(merchantId);
const { mutate: reactivateSandbox } = useReactivateSandbox(merchantId);
const { mutate: suspendProduction } = useSuspendProduction(merchantId);
const { mutate: reactivateProduction } = useReactivateProduction(merchantId);
```

#### Domain Management Hooks (`useDomains.ts`)

```typescript
// Add domain
const { mutate: addDomain, isPending } = useAddDomain(merchantId);

// Verify domain
const { mutate: verifyDomain, isPending } = useVerifyDomain(merchantId, domainId);

// Get domains (query)
const { data, isLoading, refetch } = useGetDomains(merchantId);
```

---

## 💡 Usage Examples

### Example 1: Create Merchant Account

```typescript
import { useCreateMerchant } from '@/features/merchants/hooks';

function CreateMerchantForm() {
  const { mutate: createMerchant, isPending, isError, error } = useCreateMerchant();

  const handleSubmit = (formData) => {
    createMerchant(
      {
        businessName: formData.businessName,
        email: formData.email,
        phone: formData.phone,
        businessType: formData.businessType,
        country: formData.country,
      },
      {
        onSuccess: (data) => {
          console.log('Merchant created:', data.merchant);
          // Store sandbox credentials securely
          const { sandboxApiKey, sandboxSecretKey } = data.merchant;
          // Show credentials to user
        },
        onError: (error) => {
          console.error('Failed to create merchant:', error);
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Merchant'}
      </button>
      {isError && <p>Error: {error.message}</p>}
    </form>
  );
}
```

### Example 2: Get and Display Merchant Profile

```typescript
import { useGetMerchant } from '@/features/merchants/hooks';

function MerchantProfile({ merchantId }: { merchantId: string }) {
  const { data, isLoading, isError, error } = useGetMerchant(merchantId);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  const { merchant } = data;

  return (
    <div>
      <h2>{merchant.businessName}</h2>
      <p>Email: {merchant.email}</p>
      <p>KYC Status: {merchant.kycStatus}</p>
      <p>Sandbox: {merchant.sandboxState}</p>
      <p>Production: {merchant.productionState}</p>
      <p>Sandbox API Key: {merchant.sandboxApiKey}</p>
      {merchant.productionApiKey && (
        <p>Production API Key: {merchant.productionApiKey}</p>
      )}
    </div>
  );
}
```

### Example 3: KYB Submission Flow

```typescript
import { useSubmitKYB, useGetMerchant } from '@/features/merchants/hooks';

function KYBSubmission({ merchantId }: { merchantId: string }) {
  const { data: merchantData } = useGetMerchant(merchantId);
  const { mutate: submitKYB, isPending } = useSubmitKYB(merchantId);

  const handleSubmit = () => {
    submitKYB(undefined, {
      onSuccess: () => {
        alert('KYB submitted successfully! We will review your documents.');
      },
      onError: (error) => {
        alert(`Failed to submit KYB: ${error.message}`);
      },
    });
  };

  const canSubmit = merchantData?.merchant.kycStatus === 'NOT_SUBMITTED';

  return (
    <div>
      <h3>KYB Status: {merchantData?.merchant.kycStatus}</h3>
      {canSubmit && (
        <button onClick={handleSubmit} disabled={isPending}>
          {isPending ? 'Submitting...' : 'Submit KYB'}
        </button>
      )}
    </div>
  );
}
```

### Example 4: Request Production Access

```typescript
import { useRequestProduction, useGetMerchant } from '@/features/merchants/hooks';

function ProductionRequest({ merchantId }: { merchantId: string }) {
  const { data: merchantData } = useGetMerchant(merchantId);
  const { mutate: requestProduction, isPending } = useRequestProduction(merchantId);

  const handleRequest = () => {
    requestProduction(undefined, {
      onSuccess: () => {
        alert('Production access requested! Awaiting admin approval.');
      },
      onError: (error) => {
        alert(`Failed to request production: ${error.message}`);
      },
    });
  };

  const canRequest =
    merchantData?.merchant.kycStatus === 'APPROVED' &&
    merchantData?.merchant.productionState === 'NOT_REQUESTED';

  return (
    <div>
      <h3>Production Status: {merchantData?.merchant.productionState}</h3>
      {canRequest && (
        <button onClick={handleRequest} disabled={isPending}>
          {isPending ? 'Requesting...' : 'Request Production Access'}
        </button>
      )}
    </div>
  );
}
```

### Example 5: Domain Verification

```typescript
import { useAddDomain, useVerifyDomain, useGetDomains } from '@/features/merchants/hooks';

function DomainManagement({ merchantId }: { merchantId: string }) {
  const { data: domainsData, refetch } = useGetDomains(merchantId);
  const { mutate: addDomain, isPending: isAdding } = useAddDomain(merchantId);
  const [selectedDomainId, setSelectedDomainId] = useState<string>('');
  const { mutate: verifyDomain, isPending: isVerifying } = useVerifyDomain(
    merchantId,
    selectedDomainId
  );

  const handleAddDomain = (domainName: string) => {
    addDomain(
      { domain: domainName },
      {
        onSuccess: (data) => {
          alert(
            `Domain added! Add this TXT record to your DNS:\nzitopay-verify=${data.domain.verificationToken}`
          );
          refetch();
        },
      }
    );
  };

  const handleVerifyDomain = (domainId: string) => {
    setSelectedDomainId(domainId);
    verifyDomain(undefined, {
      onSuccess: (data) => {
        if (data.domain.verified) {
          alert('Domain verified successfully!');
        }
        refetch();
      },
      onError: () => {
        alert('Domain verification failed. Please check your DNS TXT record.');
      },
    });
  };

  return (
    <div>
      <h3>Domains</h3>
      {domainsData?.domains.map((domain) => (
        <div key={domain.id}>
          <p>
            {domain.domain} - {domain.verified ? 'Verified' : 'Not Verified'}
          </p>
          {!domain.verified && (
            <button
              onClick={() => handleVerifyDomain(domain.id)}
              disabled={isVerifying}
            >
              Verify
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Example 6: Gateway API (no dashboard UI)

The merchant **Gateways** page was removed. Use `configureGateway` / `setFeeOverride` / `getGateways` from `@/features/merchants/api` with your own mutation logic if you build an internal tool.

### Example 7: Admin Actions

```typescript
import {
  useApproveKYB,
  useApproveProduction,
  useSuspendSandbox,
} from '@/features/merchants/hooks';

function AdminActions({ merchantId }: { merchantId: string }) {
  const { mutate: approveKYB } = useApproveKYB(merchantId);
  const { mutate: approveProduction } = useApproveProduction(merchantId);
  const { mutate: suspendSandbox } = useSuspendSandbox(merchantId);

  return (
    <div>
      <h3>Admin Actions</h3>
      <button
        onClick={() =>
          approveKYB(undefined, {
            onSuccess: () => alert('KYB approved!'),
          })
        }
      >
        Approve KYB
      </button>
      <button
        onClick={() =>
          approveProduction(undefined, {
            onSuccess: (data) => {
              alert(
                `Production approved!\nAPI Key: ${data.productionApiKey}\nSecret: ${data.productionSecretKey}`
              );
            },
          })
        }
      >
        Approve Production
      </button>
      <button
        onClick={() =>
          suspendSandbox(undefined, {
            onSuccess: () => alert('Sandbox suspended!'),
          })
        }
      >
        Suspend Sandbox
      </button>
    </div>
  );
}
```

---

## 🔑 Key Features

### 1. Type Safety
- Full TypeScript support
- Type-safe API calls
- IntelliSense support

### 2. Error Handling
- Automatic error catching
- Error state management
- Error messages from API

### 3. Loading States
- `isPending` for mutations
- `isLoading` for queries
- Automatic UI updates

### 4. Caching
- Automatic query caching
- Background refetching
- Cache invalidation

### 5. Optimistic Updates
- Immediate UI feedback
- Rollback on error
- Smooth user experience

---

## 🔒 Access Control

### Merchant Owner/Admin Can:
- Create merchant
- Get merchant details
- Update merchant profile
- Submit KYB
- Request production access
- Add domains
- Verify domains
- Configure gateways
- Set fee overrides

### Platform Admin Only Can:
- Approve/reject KYB
- Approve production access
- Suspend/reactivate sandbox
- Suspend/reactivate production

---

## 🚀 Integration Steps

### 1. Import Hooks
```typescript
import { useCreateMerchant, useGetMerchant } from '@/features/merchants/hooks';
```

### 2. Use in Components
```typescript
const { mutate, isPending } = useCreateMerchant();
const { data, isLoading } = useGetMerchant(merchantId);
```

### 3. Handle Success/Error
```typescript
mutate(data, {
  onSuccess: (response) => {
    // Handle success
  },
  onError: (error) => {
    // Handle error
  },
});
```

---

## 📝 Notes

- All hooks require authentication (JWT token)
- Admin-only hooks will return 403 if user is not admin
- Query hooks automatically refetch on window focus
- Mutations can be chained for complex workflows
- All API responses follow consistent structure

---

**Created:** January 12, 2026  
**Version:** 1.0.0  
**Author:** ZitoPay Development Team
