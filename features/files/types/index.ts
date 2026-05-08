// File & Document Types

// Document Types for KYC/KYB
export type DocumentType =
    | 'BUSINESS_REGISTRATION'
    | 'TAX_ID'
    | 'DIRECTOR_ID'
    | 'PROOF_OF_ADDRESS';

// Generic File Types
export type FileType =
    | 'LOGO'
    | 'INVOICE'
    | 'RECEIPT'
    | 'OTHER';

// Environment
export type Environment = 'sandbox' | 'production';

// Document Status
export type DocumentStatus =
    | 'PENDING'
    | 'APPROVED'
    | 'REJECTED'
    | 'EXPIRED';

// KYC Document Interface
export interface KYCDocument {
    id: string;
    documentType: DocumentType;
    status: DocumentStatus;
    fileId: string;
    filename: string;
    uploadedAt: string;
    reviewedAt?: string;
    rejectionReason?: string;
}

// File Metadata Interface
export interface FileMetadata {
    id: string;
    type: FileType | DocumentType;
    filename: string;
    size: number;
    mimeType: string;
    uploadedAt: string;
    storagePath?: string;
}

// Upload KYC Document Request
export interface UploadKYCDocumentRequest {
    file: File;
    documentType: DocumentType;
    environment?: Environment;
}

// Upload KYC Document Response
export interface UploadKYCDocumentResponse {
    fileId: string;
    kycDocumentId: string;
    status: DocumentStatus;
}

// Generic File Upload Request
export interface UploadFileRequest {
    file: File;
    type: FileType;
    environment?: Environment;
}

// Generic File Upload Response
export interface UploadFileResponse {
    id: string;
    filename: string;
    storagePath: string;
    size: number;
}

// Upload Payout CSV Request
export interface UploadPayoutCSVRequest {
    file: File;
    environment?: Environment;
}

// Upload Payout CSV Response
export interface UploadPayoutCSVResponse {
    id: string;
    filename: string;
    rowCount: number;
    validationStatus: 'VALID' | 'INVALID' | 'PENDING';
}

// List KYC Documents Response
export interface ListKYCDocumentsResponse {
    documents: KYCDocument[];
}

// Get File Details Response
export interface GetFileDetailsResponse {
    id: string;
    type: FileType | DocumentType;
    filename: string;
    size: number;
    mimeType: string;
    uploadedAt: string;
}

// Generate Signed URL Response
export interface GenerateSignedURLResponse {
    url: string;
    expiresAt: string;
}

// Delete File Response
export interface DeleteFileResponse {
    message: string;
}

// Update KYC Document Status Request
export interface UpdateKYCDocumentStatusRequest {
    status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
    rejectionReason?: string;
}

// Update KYC Document Status Response
export interface UpdateKYCDocumentStatusResponse {
    message: string;
}
