# KYC Document Status Update - Implementation Guide

## ✅ Implementation Complete!

The `PATCH /files/v1/kyc/:id/status` endpoint integration is now ready for use in the admin pending-KYB page.

---

## 📦 What Was Created

### 1. **Types** (`features/files/types/index.ts`)

```typescript
// Update KYC Document Status Request
export interface UpdateKYCDocumentStatusRequest {
    status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
    rejectionReason?: string;
}

// Update KYC Document Status Response
export interface UpdateKYCDocumentStatusResponse {
    message: string;
}
```

### 2. **API Function** (`features/files/api/index.ts`)

```typescript
export const updateKYCDocumentStatus = async (
    documentId: string,
    request: UpdateKYCDocumentStatusRequest
): Promise<UpdateKYCDocumentStatusResponse> => {
    const response = await apiClient.patch<UpdateKYCDocumentStatusResponse>(
        `/files/v1/kyc/${documentId}/status`,
        request
    );
    return response.data;
};
```

### 3. **React Query Hook** (`features/files/hooks/index.ts`)

```typescript
export const useUpdateKYCDocumentStatus = (
    documentId: string
): UseMutationResult<
    UpdateKYCDocumentStatusResponse,
    Error,
    UpdateKYCDocumentStatusRequest
> => {
    return useMutation({
        mutationFn: (request: UpdateKYCDocumentStatusRequest) =>
            updateKYCDocumentStatus(documentId, request),
    });
};
```

---

## 🎯 How to Use in Pending-KYB Page

### Basic Usage

```typescript
import { useUpdateKYCDocumentStatus } from '@/features/files/hooks';
import { toast } from 'sonner';

function DocumentReviewComponent({ document }) {
    const { mutate: updateStatus, isPending } = useUpdateKYCDocumentStatus(document.id);

    const handleApprove = () => {
        updateStatus(
            { status: 'APPROVED' },
            {
                onSuccess: () => {
                    toast.success('Document approved successfully');
                    // Optionally refetch pending submissions
                },
                onError: (error) => {
                    toast.error(`Failed to approve: ${error.message}`);
                }
            }
        );
    };

    const handleReject = (reason: string) => {
        updateStatus(
            { 
                status: 'REJECTED',
                rejectionReason: reason 
            },
            {
                onSuccess: () => {
                    toast.success('Document rejected');
                },
                onError: (error) => {
                    toast.error(`Failed to reject: ${error.message}`);
                }
            }
        );
    };

    return (
        <div>
            <button onClick={handleApprove} disabled={isPending}>
                Approve
            </button>
            <button onClick={() => handleReject('Invalid document')} disabled={isPending}>
                Reject
            </button>
        </div>
    );
}
```

### Integration in Modal

```typescript
// In the review modal, for each document
{selectedMerchant.documents.map((doc) => {
    const { mutate: updateStatus, isPending } = useUpdateKYCDocumentStatus(doc.id);

    return (
        <div key={doc.id}>
            <p>{doc.type}</p>
            <button 
                onClick={() => updateStatus({ status: 'APPROVED' })}
                disabled={isPending}
            >
                ✓ Approve
            </button>
            <button 
                onClick={() => updateStatus({ 
                    status: 'REJECTED',
                    rejectionReason: 'Document unclear' 
                })}
                disabled={isPending}
            >
                ✗ Reject
            </button>
        </div>
    );
})}
```

---

## 🔄 Auto-Approval Logic

When you approve a document using this endpoint, the backend automatically:

1. **Updates the document status** in `kyc_documents` table
2. **Checks if all required documents are approved:**
   - `BUSINESS_REGISTRATION`
   - `TAX_ID`
   - `DIRECTOR_ID`
3. **If all approved:** Automatically updates `merchants.kyc_status` to `APPROVED`

---

## 📊 Status Flow

```
PENDING → UNDER_REVIEW → APPROVED ✓
                       → REJECTED ✗
```

### Status Meanings

| Status | Description | Use Case |
|--------|-------------|----------|
| `PENDING` | Waiting for review | Initial state |
| `UNDER_REVIEW` | Admin is reviewing | Optional tracking |
| `APPROVED` | Document is valid | Final approval |
| `REJECTED` | Document is invalid | Requires resubmission |

---

## 🎨 UI Implementation Suggestions

### Option 1: Individual Approve/Reject Buttons

```tsx
<div className="flex gap-2">
    <button 
        onClick={() => updateStatus({ status: 'APPROVED' })}
        className="px-3 py-1 bg-green-50 text-green-700 rounded"
    >
        ✓ Approve
    </button>
    <button 
        onClick={() => setShowRejectModal(true)}
        className="px-3 py-1 bg-red-50 text-red-700 rounded"
    >
        ✗ Reject
    </button>
</div>
```

### Option 2: Dropdown Menu

```tsx
<select 
    onChange={(e) => {
        if (e.target.value === 'APPROVED') {
            updateStatus({ status: 'APPROVED' });
        } else if (e.target.value === 'REJECTED') {
            setShowRejectModal(true);
        }
    }}
>
    <option value="">Select Action</option>
    <option value="APPROVED">Approve</option>
    <option value="REJECTED">Reject</option>
</select>
```

### Option 3: Icon Buttons

```tsx
<div className="flex gap-1">
    <button 
        onClick={() => updateStatus({ status: 'APPROVED' })}
        className="p-2 hover:bg-green-100 rounded"
        title="Approve"
    >
        <CheckCircle className="w-5 h-5 text-green-600" />
    </button>
    <button 
        onClick={() => setShowRejectModal(true)}
        className="p-2 hover:bg-red-100 rounded"
        title="Reject"
    >
        <XCircle className="w-5 h-5 text-red-600" />
    </button>
</div>
```

---

## ⚠️ Important Notes

### 1. **Rejection Reason Required**

When rejecting a document, always provide a `rejectionReason`:

```typescript
updateStatus({
    status: 'REJECTED',
    rejectionReason: 'Tax certificate is expired'
});
```

### 2. **Refetch After Update**

After approving/rejecting, refetch the pending submissions:

```typescript
const { refetch } = useGetPendingKYBSubmissions();

updateStatus(
    { status: 'APPROVED' },
    {
        onSuccess: () => {
            refetch(); // Refresh the list
        }
    }
);
```

### 3. **Loading States**

Show loading state while updating:

```typescript
const { mutate, isPending } = useUpdateKYCDocumentStatus(doc.id);

<button disabled={isPending}>
    {isPending ? 'Updating...' : 'Approve'}
</button>
```

### 4. **Error Handling**

Always handle errors gracefully:

```typescript
updateStatus(
    { status: 'APPROVED' },
    {
        onError: (error) => {
            console.error('Update failed:', error);
            toast.error(error.message || 'Failed to update document');
        }
    }
);
```

---

## 🔗 Related Endpoints

After updating individual documents, you may also want to use:

1. **Approve Entire KYB**
   ```typescript
   POST /merchant/v1/merchants/:id/kyb/approve
   ```

2. **Reject Entire KYB**
   ```typescript
   POST /merchant/v1/merchants/:id/kyb/reject
   ```

3. **Refetch Pending Submissions**
   ```typescript
   GET /merchant/v1/admin/pending-kyb
   ```

---

## ✅ Next Steps

1. **Add approve/reject buttons** to each document in the review modal
2. **Create rejection reason modal** for collecting rejection feedback
3. **Add loading states** during status updates
4. **Implement refetch** after successful updates
5. **Add success/error toasts** for user feedback

---

**The hook is ready to use! Just import it and start approving/rejecting documents.** 🎯
