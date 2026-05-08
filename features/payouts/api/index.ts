import { apiClient } from '@/lib/apiClient';
import type {
    CsvUploadResponse,
    CsvPreviewRequest,
    ManualPreviewRequest,
    BulkPreviewResponse,
    BulkConfirmRequest,
    BulkConfirmResponse,
    BatchDetails,
    CreatePayoutQuoteRequest,
    CreatePayoutQuoteResponse,
    ExecutePayoutRequest,
    ExecutePayoutResponse,
    ListPayoutsRequest,
    ListPayoutsResponse,
} from '../types/index';

export const uploadPayoutCsv = async (
    file: File
): Promise<CsvUploadResponse> => {
    const path = '/files/v1/payout-csv';
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<CsvUploadResponse>(path, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const createPayoutQuote = async (
    payload: CreatePayoutQuoteRequest
): Promise<CreatePayoutQuoteResponse> => {
    const response = await apiClient.post<CreatePayoutQuoteResponse>('/merchant/v1/payouts/quote', payload);
    return response.data;
};

export const executePayout = async (
    payload: ExecutePayoutRequest
): Promise<ExecutePayoutResponse> => {
    const response = await apiClient.post<ExecutePayoutResponse>('/merchant/v1/payouts/execute', payload);
    return response.data;
};

export const listPayouts = async (
    params: ListPayoutsRequest = {}
): Promise<ListPayoutsResponse> => {
    const response = await apiClient.get<ListPayoutsResponse>('/merchant/v1/payouts', { params });
    return response.data;
};

export const downloadPayoutReceipt = async (
    payoutId: string,
    environment?: 'sandbox' | 'production'
): Promise<Blob> => {
    const response = await apiClient.get<Blob>(
        `/merchant/v1/payouts/${payoutId}/receipt`,
        {
            params: environment ? { environment } : undefined,
            responseType: 'blob',
        }
    );
    return response.data;
};

export const previewCsvBatch = async (
    payload: CsvPreviewRequest
): Promise<BulkPreviewResponse> => {
    const path = '/merchant/v1/payouts/bulk/preview';
    const response = await apiClient.post<BulkPreviewResponse>(path, payload);
    return response.data;
};

export const previewManualBatch = async (
    payload: ManualPreviewRequest
): Promise<BulkPreviewResponse> => {
    const path = '/merchant/v1/payouts/bulk/manual-preview';
    const response = await apiClient.post<BulkPreviewResponse>(path, payload);
    return response.data;
};

export const confirmBatch = async (
    payload: BulkConfirmRequest
): Promise<BulkConfirmResponse> => {
    const path = '/merchant/v1/payouts/bulk/confirm';
    const response = await apiClient.post<BulkConfirmResponse>(path, payload);
    return response.data;
};

export const cancelBatch = async (
    batchId: string
): Promise<{ message: string }> => {
    const path = `/merchant/v1/payouts/bulk/${batchId}`;
    const response = await apiClient.delete<{ message: string }>(path);
    return response.data;
};

export const getBatch = async (
    batchId: string
): Promise<BatchDetails> => {
    const path = `/merchant/v1/payouts/bulk/${batchId}`;
    const response = await apiClient.get<BatchDetails>(path);
    return response.data;
};
