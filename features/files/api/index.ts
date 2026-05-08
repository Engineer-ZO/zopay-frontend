import { fileUploadClient } from '@/lib/fileUploadClient';
import { apiClient } from '@/lib/apiClient';
import type {
    UploadKYCDocumentRequest,
    UploadKYCDocumentResponse,
    UploadFileRequest,
    UploadFileResponse,
    UploadPayoutCSVRequest,
    UploadPayoutCSVResponse,
    ListKYCDocumentsResponse,
    GetFileDetailsResponse,
    GenerateSignedURLResponse,
    DeleteFileResponse,
    UpdateKYCDocumentStatusRequest,
    UpdateKYCDocumentStatusResponse,
    DocumentType,
    FileType,
    Environment,
    KYCDocument,
} from '../types/index';

const FILES_BASE_URL = '/files/v1';

/**
 * Upload KYC/KYB Document
 * 
 * @param request - Upload request with file and document type
 * @param onProgress - Optional progress callback
 * @returns Upload response with file and document IDs
 */
export const uploadKYCDocument = async (
    request: UploadKYCDocumentRequest,
    onProgress?: (progress: number) => void
): Promise<UploadKYCDocumentResponse> => {
    const formData = new FormData();
    formData.append('file', request.file);

    // Build query parameters
    const params = new URLSearchParams({
        documentType: request.documentType,
    });

    if (request.environment) {
        params.append('environment', request.environment);
    }

    const url = `${FILES_BASE_URL}/kyc?${params.toString()}`;

    if (onProgress) {
        const response = await fileUploadClient.uploadWithProgress<UploadKYCDocumentResponse>(
            url,
            formData,
            onProgress
        );
        return response.data;
    } else {
        const response = await fileUploadClient.upload<UploadKYCDocumentResponse>(
            url,
            formData
        );
        return response.data;
    }
};

/**
 * Generic File Upload
 * 
 * @param request - Upload request with file and type
 * @param onProgress - Optional progress callback
 * @returns Upload response with file metadata
 */
export const uploadFile = async (
    request: UploadFileRequest,
    onProgress?: (progress: number) => void
): Promise<UploadFileResponse> => {
    const formData = new FormData();
    formData.append('file', request.file);

    const params = new URLSearchParams({
        type: request.type,
    });

    if (request.environment) {
        params.append('environment', request.environment);
    }

    const url = `${FILES_BASE_URL}/upload?${params.toString()}`;

    if (onProgress) {
        const response = await fileUploadClient.uploadWithProgress<UploadFileResponse>(
            url,
            formData,
            onProgress
        );
        return response.data;
    } else {
        const response = await fileUploadClient.upload<UploadFileResponse>(
            url,
            formData
        );
        return response.data;
    }
};

/**
 * Upload Bulk Payout CSV
 * 
 * @param request - Upload request with CSV file
 * @param onProgress - Optional progress callback
 * @returns Upload response with validation status
 */
export const uploadPayoutCSV = async (
    request: UploadPayoutCSVRequest,
    onProgress?: (progress: number) => void
): Promise<UploadPayoutCSVResponse> => {
    const formData = new FormData();
    formData.append('file', request.file);

    const params = new URLSearchParams();
    if (request.environment) {
        params.append('environment', request.environment);
    }

    const url = `${FILES_BASE_URL}/payout-csv${params.toString() ? `?${params.toString()}` : ''}`;

    if (onProgress) {
        const response = await fileUploadClient.uploadWithProgress<UploadPayoutCSVResponse>(
            url,
            formData,
            onProgress
        );
        return response.data;
    } else {
        const response = await fileUploadClient.upload<UploadPayoutCSVResponse>(
            url,
            formData
        );
        return response.data;
    }
};

/**
 * List KYC Documents
 * 
 * @returns List of uploaded KYC documents
 */
export const listKYCDocuments = async (): Promise<ListKYCDocumentsResponse> => {
    const response = await fileUploadClient.get<KYCDocument[]>(
        `${FILES_BASE_URL}/kyc`
    );

    return { documents: response.data };
};

/**
 * Get File Details
 * 
 * @param fileId - File ID
 * @returns File metadata
 */
export const getFileDetails = async (
    fileId: string
): Promise<GetFileDetailsResponse> => {
    const response = await fileUploadClient.get<GetFileDetailsResponse>(
        `${FILES_BASE_URL}/${fileId}`
    );

    return response.data;
};

/**
 * Generate Secure Download Link (Signed URL)
 * 
 * @param fileId - File ID
 * @returns Signed URL with expiration
 */
export const generateSignedURL = async (
    fileId: string
): Promise<GenerateSignedURLResponse> => {
    const response = await fileUploadClient.get<GenerateSignedURLResponse>(
        `${FILES_BASE_URL}/${fileId}/signed-url`
    );

    return response.data;
};

/**
 * Delete File (Soft Delete)
 * 
 * @param fileId - File ID
 * @returns Success message
 */
export const deleteFile = async (
    fileId: string
): Promise<DeleteFileResponse> => {
    const response = await fileUploadClient.delete<DeleteFileResponse>(
        `${FILES_BASE_URL}/${fileId}`
    );

    return response.data;
};

/**
 * Helper: Upload Multiple KYC Documents
 * 
 * This helper function handles uploading multiple KYC documents sequentially.
 * Since the API accepts one file at a time, we make separate calls for each.
 * 
 * @param documents - Array of document upload requests
 * @param onProgress - Optional progress callback (receives overall progress)
 * @returns Array of upload responses
 */
export const uploadMultipleKYCDocuments = async (
    documents: UploadKYCDocumentRequest[],
    onProgress?: (progress: number) => void
): Promise<UploadKYCDocumentResponse[]> => {
    const results: UploadKYCDocumentResponse[] = [];
    const total = documents.length;

    for (let i = 0; i < total; i++) {
        const document = documents[i];

        // Upload with individual progress tracking
        const result = await uploadKYCDocument(document, (fileProgress) => {
            if (onProgress) {
                // Calculate overall progress
                const overallProgress = Math.round(
                    ((i / total) * 100) + ((fileProgress / total))
                );
                onProgress(overallProgress);
            }
        });

        results.push(result);
    }

    return results;
};

/**
 * Update KYC Document Status
 * 
 * Allows admins to approve or reject individual KYC documents
 * 
 * @param documentId - The KYC document ID
 * @param request - Status update request
 * @returns Update response
 */
export const updateKYCDocumentStatus = async (
    documentId: string,
    request: UpdateKYCDocumentStatusRequest
): Promise<UpdateKYCDocumentStatusResponse> => {
    const response = await apiClient.patch<UpdateKYCDocumentStatusResponse>(
        `${FILES_BASE_URL}/kyc/${documentId}/status`,
        request
    );
    return response.data;
};

// Re-export types for convenience
export type { KYCDocument } from '../types/index';
