# Merchant API Quick Reference

## 🚀 Quick Start

```typescript
import {
  useCreateMerchant,
  useGetMerchant,
  useUpdateMerchant,
  useSubmitKYB,
  useRequestProduction,
  useAddDomain,
} from '@/features/merchants/hooks';
```

---

## 📦 All Available Hooks

### Merchant Management
- `useCreateMerchant()` - Create new merchant account
- `useGetMerchant(merchantId)` - Get merchant details
- `useUpdateMerchant(merchantId)` - Update merchant profile
- `useSubmitKYB(merchantId)` - Submit KYB documents
- `useApproveKYB(merchantId)` - Approve KYB (Admin)
- `useRejectKYB(merchantId)` - Reject KYB (Admin)
- `useRequestProduction(merchantId)` - Request production access
- `useApproveProduction(merchantId)` - Approve production (Admin)
- `useSuspendSandbox(merchantId)` - Suspend sandbox (Admin)
- `useReactivateSandbox(merchantId)` - Reactivate sandbox (Admin)
- `useSuspendProduction(merchantId)` - Suspend production (Admin)
- `useReactivateProduction(merchantId)` - Reactivate production (Admin)

### Domain Management
- `useAddDomain(merchantId)` - Add domain
- `useVerifyDomain(merchantId, domainId)` - Verify domain
- `useGetDomains(merchantId)` - Get all domains

### Gateway API (no React hooks)

Use `getGateways`, `configureGateway`, and `setFeeOverride` from `@/features/merchants/api` if needed (merchant dashboard Gateways page removed).

---

## 🎯 Common Patterns

### Pattern 1: Create Merchant
```typescript
const { mutate: createMerchant, isPending } = useCreateMerchant();

createMerchant(
  {
    businessName: 'Acme Ltd',
    email: 'contact@acme.com',
    country: 'CM',
  },
  {
    onSuccess: (data) => {
      // Store credentials
      const { sandboxApiKey, sandboxSecretKey } = data.merchant;
    },
  }
);
```

### Pattern 2: Get Merchant Data
```typescript
const { data, isLoading } = useGetMerchant(merchantId);

if (isLoading) return <Spinner />;

const merchant = data?.merchant;
```

### Pattern 3: Update Merchant
```typescript
const { mutate: updateMerchant } = useUpdateMerchant(merchantId);

updateMerchant({
  email: 'newemail@acme.com',
  phone: '+237670000000',
});
```

### Pattern 4: KYB Flow
```typescript
// Step 1: Submit KYB
const { mutate: submitKYB } = useSubmitKYB(merchantId);
submitKYB();

// Step 2: Admin approves
const { mutate: approveKYB } = useApproveKYB(merchantId);
approveKYB();
```

### Pattern 5: Production Access
```typescript
// Step 1: Request production
const { mutate: requestProduction } = useRequestProduction(merchantId);
requestProduction();

// Step 2: Admin approves
const { mutate: approveProduction } = useApproveProduction(merchantId);
approveProduction(undefined, {
  onSuccess: (data) => {
    const { productionApiKey, productionSecretKey } = data;
  },
});
```

### Pattern 6: Domain Verification
```typescript
// Step 1: Add domain
const { mutate: addDomain } = useAddDomain(merchantId);
addDomain(
  { domain: 'acme.com' },
  {
    onSuccess: (data) => {
      // Show verification token
      alert(`Add TXT record: zitopay-verify=${data.domain.verificationToken}`);
    },
  }
);

// Step 2: Verify domain
const { mutate: verifyDomain } = useVerifyDomain(merchantId, domainId);
verifyDomain();
```

### Pattern 7: Gateway API (direct)

```typescript
import { configureGateway, setFeeOverride } from '@/features/merchants/api';

await configureGateway(merchantId, {
  gateway: 'mtn',
  enabled: true,
  minAmount: '100',
  maxAmount: '1000000',
});
```

---

## 🔍 Merchant States

### KYC Status
- `NOT_SUBMITTED` - No documents uploaded
- `PENDING` - Awaiting review
- `APPROVED` - Verified
- `REJECTED` - Rejected

### Sandbox State
- `ACTIVE` - Enabled (default)
- `SUSPENDED` - Suspended by admin

### Production State
- `NOT_REQUESTED` - Not requested
- `PENDING_APPROVAL` - Awaiting approval
- `ACTIVE` - Enabled
- `SUSPENDED` - Suspended by admin

---

## ⚡ Hook Return Values

### Mutations (useMutation)
```typescript
{
  mutate: (data, options) => void,
  isPending: boolean,
  isError: boolean,
  error: Error | null,
  isSuccess: boolean,
  data: Response | undefined,
}
```

### Queries (useQuery)
```typescript
{
  data: Response | undefined,
  isLoading: boolean,
  isError: boolean,
  error: Error | null,
  refetch: () => void,
}
```

---

## 🎨 UI State Handling

```typescript
function MerchantForm() {
  const { mutate, isPending, isError, error } = useCreateMerchant();

  return (
    <>
      <button disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Merchant'}
      </button>
      {isError && <p className="error">{error.message}</p>}
    </>
  );
}
```

---

## 🔐 Admin-Only Actions

```typescript
// Check user role before showing admin actions
const { user } = useAuthContext();

if (user?.role === 'admin') {
  return (
    <>
      <button onClick={() => approveKYB()}>Approve KYB</button>
      <button onClick={() => approveProduction()}>Approve Production</button>
      <button onClick={() => suspendSandbox()}>Suspend Sandbox</button>
    </>
  );
}
```

---

## 📊 Complete Merchant Lifecycle

```typescript
// 1. Create merchant
createMerchant({ businessName: 'Acme' });

// 2. Submit KYB
submitKYB();

// 3. Admin approves KYB
approveKYB();

// 4. Request production
requestProduction();

// 5. Admin approves production
approveProduction();

// 6. Configure gateway
configureGateway({ gateway: 'mtn', enabled: true });

// 7. Set fees
setFeeOverride({ gateway: 'mtn', percentage: '2.0' });
```

---

## 🛠️ Error Handling

```typescript
mutate(data, {
  onSuccess: (response) => {
    console.log('Success:', response);
  },
  onError: (error) => {
    if (error.message.includes('Admin access required')) {
      alert('You need admin privileges');
    } else if (error.message.includes('KYB')) {
      alert('KYB error: ' + error.message);
    } else {
      alert('Error: ' + error.message);
    }
  },
});
```

---

**Last Updated:** January 12, 2026
