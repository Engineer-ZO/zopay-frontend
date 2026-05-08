# Pending KYB Submissions - API Integration Guide

## Overview

This document explains how the admin pending KYB review page integrates with the backend API, including secure document viewing with signed URLs.

---

## API Endpoint

**URL:** `GET /merchant/v1/admin/pending-kyb`

**Authentication:** Admin JWT token required

**Authorization:** `role: 'admin'` only

---

## Response Structure

### KYBDocument Interface

```typescript
export interface KYBDocument {
    id: string;              // KYC document ID
    fileId: string;          // Uploaded file ID
    type: string;            // Human-readable type (e.g., "Business Registration")
    name: string;            // Original filename
    size: string;            // Formatted size (e.g., "2.3 MB")
    status: 'valid' | 'error' | 'warning';  // Document validation status
    url: string;             // Signed URL for viewing/downloading (1 hour expiry)
    urlExpiresAt: string;    // ISO 8601 timestamp when URL expires
}
```

### KYBSubmission Interface

```typescript
export interface KYBSubmission {
    id: string;              // Merchant ID
    merchant: {
        businessName: string;
        email: string;
        phone: string;
        businessType: string;
        country: string;
        countryCode: string;
    };
    submittedAt: string;     // ISO 8601 timestamp
    documents: KYBDocument[];
    notes: string;
    isResubmission: boolean;
    priority: 'recent' | 'attention' | 'urgent';
    ageInDays: number;
}
```

---

## Frontend Integration

### 1. Fetching Data

```typescript
import { useGetPendingKYBSubmissions } from "@/features/merchants/hooks/useMerchant";

const { data, isLoading, error } = useGetPendingKYBSubmissions();
const submissions = data?.submissions || [];
```

### 2. Viewing Documents

The API provides signed URLs that are valid for 1 hour. You can use these URLs to:

#### Option A: Open in New Tab

```typescript
const viewDocument = (doc: KYBDocument) => {
    window.open(doc.url, '_blank');
};
```

#### Option B: Download Document

```typescript
const downloadDocument = async (doc: KYBDocument) => {
    try {
        const response = await fetch(doc.url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Download failed:', error);
    }
};
```

#### Option C: Display in Modal/Iframe (for PDFs)

```typescript
const displayPDFInModal = (doc: KYBDocument) => {
    // For PDF documents
    if (doc.name.endsWith('.pdf')) {
        return (
            <iframe
                src={doc.url}
                width="100%"
                height="600px"
                style={{ border: 'none' }}
                title={doc.name}
            />
        );
    }
    
    // For images
    if (doc.name.match(/\.(jpg|jpeg|png)$/i)) {
        return (
            <img
                src={doc.url}
                alt={doc.name}
                style={{ maxWidth: '100%', height: 'auto' }}
            />
        );
    }
};
```

#### Option D: Check URL Expiry

```typescript
const isURLExpired = (doc: KYBDocument): boolean => {
    const expiryTime = new Date(doc.urlExpiresAt).getTime();
    const now = Date.now();
    return now >= expiryTime;
};

const viewDocumentWithCheck = (doc: KYBDocument) => {
    if (isURLExpired(doc)) {
        // Refetch submissions to get fresh URLs
        refetch();
        alert('Document URL expired. Refreshing...');
        return;
    }
    
    window.open(doc.url, '_blank');
};
```

---

## Document Status Indicators

```typescript
const getDocumentStatusColor = (status: KYBDocument['status']) => {
    switch (status) {
        case 'valid':
            return 'text-green-600 bg-green-50';
        case 'error':
            return 'text-red-600 bg-red-50';
        case 'warning':
            return 'text-orange-600 bg-orange-50';
        default:
            return 'text-gray-600 bg-gray-50';
    }
};
```

---

## Priority Calculation

The backend automatically calculates priority based on submission age:

| Age | Priority | UI Color |
|-----|----------|----------|
| 0-2 days | `recent` | Blue |
| 3-4 days | `attention` | Orange |
| 5+ days | `urgent` | Red |

```typescript
const getPriorityColor = (priority: KYBSubmission['priority']) => {
    switch (priority) {
        case 'urgent':
            return 'bg-red-50 text-red-600 border-red-100';
        case 'attention':
            return 'bg-orange-50 text-orange-600 border-orange-100';
        case 'recent':
            return 'bg-blue-50 text-blue-600 border-blue-100';
    }
};
```

---

## Complete Example: Document Viewer Component

```typescript
import { useState } from 'react';
import { Eye, Download, ExternalLink } from 'lucide-react';
import type { KYBDocument } from '@/features/merchants/types/index';

interface DocumentViewerProps {
    document: KYBDocument;
}

export function DocumentViewer({ document }: DocumentViewerProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    
    const handleView = () => {
        window.open(document.url, '_blank');
    };
    
    const handleDownload = async () => {
        try {
            const response = await fetch(document.url);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = document.name;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
        }
    };
    
    const isExpired = new Date(document.urlExpiresAt) < new Date();
    
    return (
        <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="font-semibold">{document.type}</h4>
                    <p className="text-sm text-gray-500">{document.name} • {document.size}</p>
                    {isExpired && (
                        <p className="text-xs text-red-600 mt-1">URL expired - refresh page</p>
                    )}
                </div>
                
                <div className="flex gap-2">
                    <button
                        onClick={handleView}
                        disabled={isExpired}
                        className="p-2 hover:bg-gray-100 rounded"
                        title="View document"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    
                    <button
                        onClick={handleDownload}
                        disabled={isExpired}
                        className="p-2 hover:bg-gray-100 rounded"
                        title="Download document"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                    
                    <button
                        onClick={handleView}
                        disabled={isExpired}
                        className="p-2 hover:bg-gray-100 rounded"
                        title="Open in new tab"
                    >
                        <ExternalLink className="w-4 h-4" />
                    </button>
                </div>
            </div>
            
            {isExpanded && !isExpired && (
                <div className="mt-4">
                    {document.name.endsWith('.pdf') ? (
                        <iframe
                            src={document.url}
                            width="100%"
                            height="600px"
                            className="border rounded"
                        />
                    ) : (
                        <img
                            src={document.url}
                            alt={document.name}
                            className="max-w-full h-auto rounded"
                        />
                    )}
                </div>
            )}
        </div>
    );
}
```

---

## Security Considerations

1. **Signed URLs Expire After 1 Hour**
   - URLs are time-limited for security
   - No additional authentication needed to access URL
   - URLs automatically expire and become invalid

2. **Automatic Refresh**
   - React Query automatically refetches data
   - Fresh URLs generated on each fetch
   - Stale URLs are replaced

3. **No Direct File Access**
   - Files are not publicly accessible
   - Signed URLs provide temporary, secure access
   - Backend validates admin permissions before generating URLs

---

## Error Handling

```typescript
const { data, isLoading, error } = useGetPendingKYBSubmissions();

if (error) {
    return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-red-900">
                Failed to Load Submissions
            </h3>
            <p className="text-sm text-red-700">{error.message}</p>
        </div>
    );
}

if (isLoading) {
    return <SkeletonLoader />;
}

if (!data || data.submissions.length === 0) {
    return (
        <div className="text-center p-12">
            <h3 className="text-xl font-bold">All Caught Up!</h3>
            <p className="text-gray-500">No pending KYB submissions.</p>
        </div>
    );
}
```

---

## Related Endpoints

After reviewing documents, use these endpoints:

1. **Approve Entire KYB**
   ```typescript
   POST /merchant/v1/merchants/:merchantId/kyb/approve
   ```

2. **Reject KYB**
   ```typescript
   POST /merchant/v1/merchants/:merchantId/kyb/reject
   ```

3. **Update Individual Document Status**
   ```typescript
   PATCH /files/v1/kyc/:documentId/status
   Body: { status: 'APPROVED' | 'REJECTED' }
   ```

---

## Best Practices

1. **Always Check URL Expiry**
   - Check `urlExpiresAt` before using URL
   - Refetch data if URLs are expired

2. **Handle Different File Types**
   - PDFs: Use iframe or open in new tab
   - Images: Display inline or open in new tab
   - Other: Trigger download

3. **Provide User Feedback**
   - Show loading states during download
   - Display error messages if download fails
   - Indicate when URLs are expired

4. **Optimize Performance**
   - Don't embed all documents at once
   - Load documents on-demand (when user clicks)
   - Use lazy loading for images

---

## Summary

The pending KYB submissions API now provides:
- ✅ Complete merchant and document information
- ✅ Secure, time-limited signed URLs for document access
- ✅ Priority calculation for urgent reviews
- ✅ Document status indicators
- ✅ Flexible viewing options (view, download, embed)

All document URLs are valid for 1 hour and require no additional authentication! 🎯
