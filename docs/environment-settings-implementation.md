# Environment Settings - KYB & Production Access Implementation

> **Product status (current):** The merchant **Environment Settings** page and in-dashboard KYB upload UI have been **removed**. KYB is submitted **manually** (e.g. via Help & Support). The legacy route `/dashboard/settings/business` **redirects** to `/dashboard/support`.  
> The rest of this document is **historical / reference** only.

## Overview

This document provided a guide to the Environment Settings feature, which managed the merchant's journey from sandbox testing to production access through KYB (Know Your Business) verification.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [File Structure](#file-structure)
3. [Component Documentation](#component-documentation)
4. [API Integration](#api-integration)
5. [User Flow](#user-flow)
6. [Toast Notifications](#toast-notifications)
7. [State Management](#state-management)

---

## Architecture Overview

### The Sandbox to Production Lifecycle

```
Registration → Sandbox Testing → KYB Upload → KYB Review → 
Production Request → Admin Approval → Production Active 🚀
```

### Merchant States

**KYC Status:**
- `NOT_SUBMITTED` - No documents uploaded yet
- `PENDING` - Documents submitted, awaiting admin review
- `APPROVED` - KYB approved by admin
- `REJECTED` - Documents rejected, needs resubmission

**Sandbox State:**
- `ACTIVE` - Sandbox environment is active (default)
- `SUSPENDED` - Sandbox suspended by admin

**Production State:**
- `NOT_REQUESTED` - Production not yet requested
- `PENDING_APPROVAL` - Production request submitted, awaiting admin approval
- `ACTIVE` - Production environment is live
- `SUSPENDED` - Production suspended by admin

---

## File Structure

```
app/dashboard/settings/business/
├── page.tsx                              # Main environment settings page
├── components/
│   ├── KYBUploadSection.tsx             # KYB document upload component
│   └── ProductionAccessSection.tsx      # Production access request component

features/files/
├── api/index.ts                          # File upload API functions
├── hooks/index.ts                        # React Query hooks for file operations
└── types/index.ts                        # TypeScript types for files

features/merchants/
├── api/index.ts                          # Merchant API functions
├── hooks/useMerchant.ts                 # React Query hooks for merchant operations
└── types/index.ts                        # TypeScript types for merchants

docs/
└── environment-settings-implementation.md # This documentation file
```

---

## Component Documentation

### 1. Main Page: `page.tsx`

**Location:** `app/dashboard/settings/business/page.tsx`

**Purpose:** Main container for environment settings, orchestrates KYB and production workflows.

#### Key Features:

1. **Merchant Data Fetching**
   ```typescript
   const { data: merchantsData, isLoading, refetch } = useGetUserMerchants();
   ```
   - Fetches merchant data using React Query
   - Automatically caches and updates merchant information
   - `refetch()` used to update data after mutations

2. **Merchant Selection**
   ```typescript
   const selectedMerchant = useMemo(() => {
       if (merchantsData?.merchants && merchantsData.merchants.length > 0) {
           return merchantsData.merchants[0];
       }
       return null;
   }, [merchantsData]);
   ```
   - Uses `useMemo` to avoid cascading renders
   - Selects first merchant (assuming single merchant per user)
   - Returns `null` if no merchant found

3. **KYB Submission Handler**
   ```typescript
   const handleSubmitKYB = async () => {
       if (!selectedMerchant) return;
       
       try {
           await submitKYBMutation.mutateAsync();
           await refetch();
           toast.success('KYB Submitted Successfully!', {
               description: 'Your documents have been submitted for review...',
           });
       } catch (error) {
           // Error handling with toast notification
       }
   };
   ```
   - Validates merchant exists
   - Submits KYB for review
   - Refetches merchant data to get updated status
   - Shows success/error toast notifications

4. **Production Request Handler**
   ```typescript
   const handleRequestProduction = async () => {
       if (!selectedMerchant) return;
       
       try {
           const result = await requestProductionMutation.mutateAsync();
           await refetch();
           
           // Check if credentials were returned (immediate approval)
           if (result && typeof result === 'object' && 
               'productionApiKey' in result && 
               'productionSecretKey' in result) {
               setProductionCredentials({
                   apiKey: result.productionApiKey as string,
                   secretKey: result.productionSecretKey as string,
               });
               toast.success('Production Access Granted!');
           } else {
               toast.success('Production Request Submitted!');
           }
       } catch (error) {
           // Error handling
       }
   };
   ```
   - Requests production access
   - Handles two scenarios:
     - Immediate approval: Shows credentials modal
     - Pending approval: Shows pending message
   - Type-safe credential handling

#### UI Sections:

1. **Environment Status Overview**
   - 3-column grid showing Sandbox, KYB, and Production status
   - Color-coded status indicators
   - Real-time status updates

2. **KYB Verification Section**
   - Integrates `KYBUploadSection` component
   - Passes merchant ID, KYC status, and handlers

3. **Production Access Section**
   - Integrates `ProductionAccessSection` component
   - Handles production credentials display

4. **Business Information**
   - Displays merchant details
   - Edit functionality (modal)

---

### 2. KYB Upload Section: `KYBUploadSection.tsx`

**Location:** `app/dashboard/settings/business/components/KYBUploadSection.tsx`

**Purpose:** Flexible document upload interface for KYB verification.

#### Key Features:

1. **Flexible Document Type Selection**
   ```typescript
   const PREDEFINED_DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
       { value: "BUSINESS_REGISTRATION", label: "Business Registration Certificate" },
       { value: "TAX_ID", label: "Tax Identification Number (TIN)" },
       { value: "DIRECTOR_ID", label: "Director's ID Card" },
       { value: "PROOF_OF_ADDRESS", label: "Proof of Business Address" },
   ];
   ```
   - Predefined common document types
   - "Other (Specify below)" option for custom types
   - Dropdown selection for easy UX

2. **Custom Document Type Support**
   ```typescript
   const isCustomType = selectedDocType === "CUSTOM";
   
   {isCustomType && (
       <input
           type="text"
           value={customDocType}
           onChange={(e) => setCustomDocType(e.target.value)}
           placeholder="e.g., Bank Statement, Utility Bill, etc."
       />
   )}
   ```
   - Text input appears when "Other" is selected
   - Allows merchants to specify any document type
   - Gives admin flexibility in review process

3. **Upload State Management**
   ```typescript
   const [selectedFile, setSelectedFile] = useState<File | null>(null);
   const [selectedDocType, setSelectedDocType] = useState<string>("");
   const [customDocType, setCustomDocType] = useState<string>("");
   const [isUploading, setIsUploading] = useState(false);
   const [uploadProgress, setUploadProgress] = useState(0);
   ```
   - Tracks selected file
   - Manages document type selection
   - Handles upload progress (0-100%)
   - Upload state for UI feedback

4. **Upload Validation**
   ```typescript
   const canUpload = selectedFile && 
       (isCustomType ? customDocType.trim() !== "" : selectedDocType !== "");
   const canSubmitKYB = uploadedDocuments.length > 0 && 
       kycStatus === "NOT_SUBMITTED";
   ```
   - Ensures file is selected
   - Validates document type (predefined or custom)
   - Submit button enabled only with at least 1 document

5. **Upload Handler with Progress Tracking**
   ```typescript
   const uploadKYCMutation = useUploadKYCDocument((progress) => {
       setUploadProgress(progress);
   });
   
   const handleUpload = async () => {
       if (!canUpload || !selectedFile) return;
       
       setIsUploading(true);
       setUploadProgress(0);
       
       try {
           const docType = isCustomType ? customDocType.trim() : selectedDocType;
           
           await uploadKYCMutation.mutateAsync({
               file: selectedFile,
               documentType: docType as DocumentType,
               environment: "sandbox",
           });
           
           toast.success("Document uploaded successfully!");
           
           // Reset form
           setSelectedFile(null);
           setSelectedDocType("");
           setCustomDocType("");
           
           // Refetch documents list
           await refetchDocuments();
       } catch (error) {
           toast.error("Upload failed");
       } finally {
           setIsUploading(false);
       }
   };
   ```
   - Progress callback updates UI in real-time
   - Handles both predefined and custom document types
   - Resets form after successful upload
   - Refetches document list to show new upload
   - Toast notifications for feedback

6. **Uploaded Documents List**
   ```typescript
   const { data: documentsData, refetch: refetchDocuments } = useListKYCDocuments();
   const uploadedDocuments = documentsData?.documents || [];
   ```
   - Fetches list of uploaded documents
   - Displays document type and filename
   - Shows document count
   - Green checkmark for each uploaded document

#### UI Components:

1. **Status Banners**
   - Different banner for each KYC status
   - Color-coded (blue, orange, green, red)
   - Contextual messages

2. **Upload Form**
   - Document type dropdown
   - Custom type input (conditional)
   - File upload area with drag-and-drop styling
   - File preview with size display
   - Progress bar during upload

3. **Uploaded Documents Display**
   - List of all uploaded documents
   - Document type and filename
   - Visual confirmation (checkmarks)

4. **Submit Button**
   - Enabled when at least 1 document uploaded
   - Shows document count
   - Loading state during submission

---

### 3. Production Access Section: `ProductionAccessSection.tsx`

**Location:** `app/dashboard/settings/business/components/ProductionAccessSection.tsx`

**Purpose:** Manages production access requests and credentials display.

#### Key Features:

1. **Conditional Rendering Based on Status**
   ```typescript
   const canRequestProduction = kycStatus === "APPROVED" && 
       productionState === "NOT_REQUESTED";
   ```
   - Button only enabled when KYB is approved
   - Different UI for each production state

2. **Status-Specific Banners**
   ```typescript
   const getProductionStatusBanner = () => {
       if (kycStatus !== "APPROVED") {
           return /* KYB approval required banner */;
       }
       
       switch (productionState) {
           case "NOT_REQUESTED": return /* Ready for production banner */;
           case "PENDING_APPROVAL": return /* Pending review banner */;
           case "ACTIVE": return /* Production active banner */;
           case "SUSPENDED": return /* Suspended banner */;
       }
   };
   ```
   - Dynamic banner based on KYC and production state
   - Clear messaging for each state
   - Color-coded for visual clarity

3. **Production Credentials Modal**
   ```typescript
   const [showCredentialsModal, setShowCredentialsModal] = useState(!!productionCredentials);
   const [showApiKey, setShowApiKey] = useState(false);
   const [showSecretKey, setShowSecretKey] = useState(false);
   ```
   - Automatically shows when credentials are received
   - Password-style inputs (hidden by default)
   - Show/hide toggles for each credential
   - Copy-to-clipboard functionality

4. **Secure Credential Handling**
   ```typescript
   const handleCopy = (text: string, field: string) => {
       navigator.clipboard.writeText(text);
       setCopiedField(field);
       toast.success('Copied to clipboard!', {
           description: `${field === 'apiKey' ? 'API Key' : 'Secret Key'} has been copied.`,
       });
       setTimeout(() => setCopiedField(null), 2000);
   };
   ```
   - Uses Clipboard API
   - Visual feedback (button text changes)
   - Toast notification
   - Auto-reset after 2 seconds

5. **Security Warning**
   ```typescript
   <div className="bg-red-50 dark:bg-red-900/10 border border-red-200">
       <AlertTriangle className="w-5 h-5" />
       <div>
           <h4>Important: Save These Credentials Now</h4>
           <p>These credentials will only be shown once. Make sure to copy 
              and store them securely before closing this window.</p>
       </div>
   </div>
   ```
   - Prominent warning about one-time display
   - Red color scheme for urgency
   - Clear instructions

#### UI Components:

1. **Request Production Button**
   - Conditionally rendered
   - Disabled states
   - Loading indicator

2. **Credentials Modal**
   - Full-screen overlay
   - Centered modal
   - API Key input with show/hide
   - Secret Key input with show/hide
   - Copy buttons for each
   - Security warning
   - Confirmation button

---

## API Integration

### File Upload APIs

**Location:** `features/files/api/index.ts`

1. **Upload KYC Document**
   ```typescript
   export const uploadKYCDocument = async (
       request: UploadKYCDocumentRequest,
       onProgress?: (progress: number) => void
   ): Promise<UploadKYCDocumentResponse>
   ```
   - Uploads single document with multipart/form-data
   - Optional progress callback
   - Returns file ID and KYC document ID

2. **List KYC Documents**
   ```typescript
   export const listKYCDocuments = async (): Promise<ListKYCDocumentsResponse>
   ```
   - Fetches all uploaded KYC documents
   - Returns array of documents with metadata

### Merchant APIs

**Location:** `features/merchants/api/index.ts`

1. **Get User Merchants**
   ```typescript
   export const getUserMerchants = async (): Promise<GetUserMerchantsResponse>
   ```
   - Fetches all merchants for authenticated user
   - Returns merchant array with full details

2. **Submit KYB**
   ```typescript
   export const submitKYB = async (merchantId: string): Promise<SubmitKYBResponse>
   ```
   - Submits uploaded documents for KYB review
   - Updates merchant KYC status to PENDING

3. **Request Production**
   ```typescript
   export const requestProduction = async (merchantId: string): Promise<RequestProductionResponse>
   ```
   - Requests production environment access
   - Updates production state to PENDING_APPROVAL

### React Query Hooks

**Location:** `features/files/hooks/index.ts` and `features/merchants/hooks/useMerchant.ts`

1. **useUploadKYCDocument**
   ```typescript
   const uploadMutation = useUploadKYCDocument((progress) => {
       console.log(`Upload progress: ${progress}%`);
   });
   
   await uploadMutation.mutateAsync({
       file: selectedFile,
       documentType: "BUSINESS_REGISTRATION",
       environment: "sandbox"
   });
   ```
   - Mutation hook for uploading documents
   - Progress callback support
   - Automatic error handling

2. **useListKYCDocuments**
   ```typescript
   const { data, isLoading, refetch } = useListKYCDocuments();
   const documents = data?.documents || [];
   ```
   - Query hook for fetching documents
   - Automatic caching
   - Manual refetch capability

3. **useSubmitKYB**
   ```typescript
   const submitKYBMutation = useSubmitKYB(merchantId);
   await submitKYBMutation.mutateAsync();
   ```
   - Mutation hook for KYB submission
   - No parameters needed (uses merchantId)

4. **useRequestProduction**
   ```typescript
   const requestProductionMutation = useRequestProduction(merchantId);
   const result = await requestProductionMutation.mutateAsync();
   ```
   - Mutation hook for production request
   - May return credentials if immediately approved

---

## User Flow

### Complete Journey

1. **Registration & Sandbox Setup**
   - User creates account
   - Merchant profile created automatically
   - Sandbox credentials generated
   - Status: `kycStatus: NOT_SUBMITTED`, `sandboxState: ACTIVE`, `productionState: NOT_REQUESTED`

2. **Sandbox Testing**
   - Merchant integrates API using sandbox credentials
   - Tests transactions with dummy data
   - No KYB required for sandbox

3. **KYB Document Upload**
   - Navigate to Environment Settings
   - Select document type from dropdown (or choose "Other")
   - Upload file (PDF, JPG, PNG)
   - Repeat for all required documents
   - At least 1 document required

4. **Submit for KYB Review**
   - Click "Submit for KYB Review" button
   - Status changes to `kycStatus: PENDING`
   - Cannot upload more documents while pending
   - Admin reviews in admin dashboard

5. **KYB Approval**
   - Admin approves KYB
   - Status changes to `kycStatus: APPROVED`
   - "Request Production Access" button becomes enabled
   - Merchant receives notification

6. **Request Production Access**
   - Click "Request Production Access" button
   - Status changes to `productionState: PENDING_APPROVAL`
   - Admin reviews sandbox activity
   - Admin approves production request

7. **Production Activation**
   - Admin approves production
   - Status changes to `productionState: ACTIVE`
   - Production credentials displayed in modal
   - Merchant must save credentials (shown only once)
   - Merchant can now accept real payments

### State Transitions

```
KYC Status Flow:
NOT_SUBMITTED → PENDING → APPROVED (or REJECTED → NOT_SUBMITTED)

Production State Flow:
NOT_REQUESTED → PENDING_APPROVAL → ACTIVE (or SUSPENDED)
```

---

## Toast Notifications

**Library:** Sonner (`npm install sonner`)

**Location:** Integrated in `app/layout.tsx`

### Setup

```typescript
import { Toaster } from "sonner";

<body>
    <Toaster position="top-right" richColors />
    {/* rest of app */}
</body>
```

### Usage Examples

1. **Success Notifications**
   ```typescript
   toast.success('Document uploaded successfully!', {
       description: 'Business Registration Certificate has been uploaded.',
   });
   ```

2. **Error Notifications**
   ```typescript
   toast.error('Upload failed', {
       description: errorMessage,
   });
   ```

3. **Info Notifications**
   ```typescript
   toast.success('Copied to clipboard!', {
       description: 'API Key has been copied.',
   });
   ```

### Toast Locations

- **Document Upload**: Success/error after each upload
- **KYB Submission**: Success/error after submitting for review
- **Production Request**: Success/error after requesting production
- **Credential Copy**: Success when copying API keys

---

## State Management

### Local Component State

1. **KYBUploadSection**
   - `selectedFile`: Currently selected file
   - `selectedDocType`: Selected document type
   - `customDocType`: Custom document type name
   - `isUploading`: Upload in progress
   - `uploadProgress`: Upload percentage (0-100)

2. **ProductionAccessSection**
   - `showCredentialsModal`: Modal visibility
   - `showApiKey`: API key visibility toggle
   - `showSecretKey`: Secret key visibility toggle
   - `copiedField`: Which field was copied

3. **Main Page**
   - `showEditModal`: Edit business info modal
   - `productionCredentials`: Production API credentials

### Server State (React Query)

1. **Merchant Data**
   - Query Key: `['merchants']`
   - Cached automatically
   - Refetched after mutations

2. **KYC Documents**
   - Query Key: `['kyc-documents']`
   - Refetched after each upload
   - Shows real-time document list

### State Synchronization

- React Query handles caching and synchronization
- Manual `refetch()` after mutations ensures fresh data
- Optimistic updates not used (wait for server confirmation)

---

## Error Handling

### Upload Errors

```typescript
try {
    await uploadKYCMutation.mutateAsync({...});
    toast.success("Document uploaded successfully!");
} catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Upload failed";
    toast.error("Upload failed", {
        description: errorMessage,
    });
}
```

### Network Errors

- Handled by React Query automatically
- Error states available via `isError` flag
- Error messages displayed in toast notifications

### Validation Errors

- Client-side validation before API calls
- Disabled buttons prevent invalid submissions
- Clear error messages in UI

---

## Security Considerations

1. **Credential Display**
   - Production credentials shown only once
   - Password-style inputs (hidden by default)
   - Prominent security warning
   - No credential storage in frontend

2. **File Upload**
   - File type validation (PDF, JPG, PNG)
   - File size limit (10MB)
   - Server-side validation required

3. **Authentication**
   - All API calls require authentication
   - Merchant ID validation
   - Role-based access control

---

## Future Enhancements

1. **Document Preview**
   - View uploaded documents before submission
   - PDF viewer integration

2. **Document Deletion**
   - Allow removing uploaded documents before submission
   - Admin-only deletion after submission

3. **Rejection Feedback**
   - Display specific rejection reasons
   - Highlight which documents need resubmission

4. **Email Notifications**
   - Notify merchant when KYB is approved/rejected
   - Notify when production is approved

5. **Document Expiry**
   - Track document expiration dates
   - Remind merchants to update expired documents

---

## Troubleshooting

### Common Issues

1. **Upload Progress Not Showing**
   - Ensure `onProgress` callback is passed to mutation
   - Check network speed (slow uploads may not show progress)

2. **Documents Not Appearing in List**
   - Call `refetchDocuments()` after upload
   - Check API response for errors

3. **Submit Button Disabled**
   - Verify at least 1 document is uploaded
   - Check KYC status is `NOT_SUBMITTED` or `REJECTED`

4. **Production Credentials Not Showing**
   - Check API response includes credentials
   - Verify modal state is set correctly

---

## Testing Checklist

- [ ] Upload document with predefined type
- [ ] Upload document with custom type
- [ ] Upload multiple documents
- [ ] Submit KYB with 1 document
- [ ] Submit KYB with multiple documents
- [ ] Request production access
- [ ] Copy production credentials
- [ ] View uploaded documents list
- [ ] Test all status banners
- [ ] Test toast notifications
- [ ] Test error handling
- [ ] Test loading states
- [ ] Test responsive design

---

## Support

For questions or issues:
- Check this documentation first
- Review API documentation in `/docs/FILES_SERVICE_API_GUIDE.md`
- Contact backend team for API issues
- Contact frontend team for UI/UX issues
