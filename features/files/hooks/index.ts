import { useMutation, useQuery, UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import {
    uploadKYCDocument,
    uploadFile,
    uploadPayoutCSV,
    listKYCDocuments,
    getFileDetails,
    generateSignedURL,
    deleteFile,
    uploadMultipleKYCDocuments,
    updateKYCDocumentStatus,
} from '../api/index';
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
} from '../types/index';

/**
 * Hook for uploading KYC/KYB documents
 * 
 * @param onProgress - Optional progress callback
 * @returns Mutation result with upload function
 */
export const useUploadKYCDocument = (
    onProgress?: (progress: number) => void
): UseMutationResult<
    UploadKYCDocumentResponse,
    Error,
    UploadKYCDocumentRequest
> => {
    return useMutation({
        mutationFn: (request: UploadKYCDocumentRequest) =>
            uploadKYCDocument(request, onProgress),
    });
};

/**
 * Hook for generic file uploads
 * 
 * @param onProgress - Optional progress callback
 * @returns Mutation result with upload function
 */
export const useUploadFile = (
    onProgress?: (progress: number) => void
): UseMutationResult<
    UploadFileResponse,
    Error,
    UploadFileRequest
> => {
    return useMutation({
        mutationFn: (request: UploadFileRequest) =>
            uploadFile(request, onProgress),
    });
};

/**
 * Hook for uploading bulk payout CSV
 * 
 * @param onProgress - Optional progress callback
 * @returns Mutation result with upload function
 */
export const useUploadPayoutCSV = (
    onProgress?: (progress: number) => void
): UseMutationResult<
    UploadPayoutCSVResponse,
    Error,
    UploadPayoutCSVRequest
> => {
    return useMutation({
        mutationFn: (request: UploadPayoutCSVRequest) =>
            uploadPayoutCSV(request, onProgress),
    });
};

/**
 * Hook for uploading multiple KYC documents
 * 
 * @param onProgress - Optional progress callback for overall progress
 * @returns Mutation result with upload function
 */
export const useUploadMultipleKYCDocuments = (
    onProgress?: (progress: number) => void
): UseMutationResult<
    UploadKYCDocumentResponse[],
    Error,
    UploadKYCDocumentRequest[]
> => {
    return useMutation({
        mutationFn: (documents: UploadKYCDocumentRequest[]) =>
            uploadMultipleKYCDocuments(documents, onProgress),
    });
};

/**
 * Hook for fetching list of KYC documents
 * 
 * @param enabled - Whether to enable the query
 * @returns Query result with documents list
 */
export const useListKYCDocuments = (
    enabled: boolean = true
): UseQueryResult<ListKYCDocumentsResponse, Error> => {
    return useQuery({
        queryKey: ['kyc-documents'],
        queryFn: () => listKYCDocuments(),
        enabled,
    });
};

/**
 * Hook for fetching file details
 * 
 * @param fileId - File ID
 * @param enabled - Whether to enable the query
 * @returns Query result with file details
 */
export const useGetFileDetails = (
    fileId: string,
    enabled: boolean = true
): UseQueryResult<GetFileDetailsResponse, Error> => {
    return useQuery({
        queryKey: ['file-details', fileId],
        queryFn: () => getFileDetails(fileId),
        enabled: enabled && !!fileId,
    });
};

/**
 * Hook for generating signed download URL
 * 
 * @param fileId - File ID
 * @param enabled - Whether to enable the query
 * @returns Query result with signed URL
 */
export const useGenerateSignedURL = (
    fileId: string,
    enabled: boolean = true
): UseQueryResult<GenerateSignedURLResponse, Error> => {
    return useQuery<GenerateSignedURLResponse, Error>({
        queryKey: ['signed-url', fileId],
        queryFn: () => generateSignedURL(fileId),
        enabled: enabled && !!fileId,
        staleTime: 0, // Always fetch fresh URL
        gcTime: 0, // Don't cache signed URLs (formerly cacheTime)
    });
};

/**
 * Hook for deleting a file
 * 
 * @returns Mutation result with delete function
 */
export const useDeleteFile = (): UseMutationResult<
    DeleteFileResponse,
    Error,
    string
> => {
    return useMutation({
        mutationFn: (fileId: string) => deleteFile(fileId),
    });
};

/**
 * Hook for updating KYC document status
 * 
 * Allows admins to approve or reject individual KYC documents
 * 
 * @param documentId - The KYC document ID
 * @returns Mutation result with update function
 */
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
