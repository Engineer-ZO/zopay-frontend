import { useMutation, useQuery, useQueryClient, UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import {
    uploadPayoutCsv,
    createPayoutQuote,
    executePayout,
    listPayouts,
    previewCsvBatch,
    previewManualBatch,
    confirmBatch,
    cancelBatch,
    getBatch,
} from '../api/index';
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

// ---- Upload CSV ----
export const useUploadPayoutCsv = (): UseMutationResult<
    CsvUploadResponse,
    Error,
    { file: File; apiKey?: string; secretKey?: string }
> =>
    useMutation({
        mutationFn: ({ file }) => uploadPayoutCsv(file),
    });

export const useCreatePayoutQuote = (): UseMutationResult<
    CreatePayoutQuoteResponse,
    Error,
    CreatePayoutQuoteRequest
> =>
    useMutation({
        mutationFn: (payload) => createPayoutQuote(payload),
    });

export const useExecutePayout = (): UseMutationResult<
    ExecutePayoutResponse,
    Error,
    ExecutePayoutRequest
> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => executePayout(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payouts'] });
        },
    });
};

export const usePayouts = (
    params: ListPayoutsRequest = {}
): UseQueryResult<ListPayoutsResponse, Error> =>
    useQuery({
        queryKey: ['payouts', params],
        queryFn: () => listPayouts(params),
        staleTime: 30 * 1000,
    });

// ---- Preview CSV batch ----
export const usePreviewCsvBatch = (): UseMutationResult<
    BulkPreviewResponse,
    Error,
    { payload: CsvPreviewRequest; apiKey?: string; secretKey?: string }
> =>
    useMutation({
        mutationFn: ({ payload }) => previewCsvBatch(payload),
    });

// ---- Preview manual batch ----
export const usePreviewManualBatch = (): UseMutationResult<
    BulkPreviewResponse,
    Error,
    { payload: ManualPreviewRequest; apiKey?: string; secretKey?: string }
> =>
    useMutation({
        mutationFn: ({ payload }) => previewManualBatch(payload),
    });

// ---- Confirm batch ----
export const useConfirmBatch = (): UseMutationResult<
    BulkConfirmResponse,
    Error,
    { payload: BulkConfirmRequest; apiKey?: string; secretKey?: string }
> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ payload }) => confirmBatch(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payouts'] });
        },
    });
};

// ---- Cancel batch ----
export const useCancelBatch = (): UseMutationResult<
    { message: string },
    Error,
    { batchId: string; apiKey?: string; secretKey?: string }
> =>
    useMutation({
        mutationFn: ({ batchId }) => cancelBatch(batchId),
    });

// ---- Get batch status (for polling AWAITING_APPROVAL) ----
export const useGetBatch = (
    batchId: string | null
): UseQueryResult<BatchDetails, Error> =>
    useQuery({
        queryKey: ['batch', batchId],
        queryFn: () => getBatch(batchId!),
        enabled: !!batchId,
        refetchInterval: (query) => {
            const status = query.state.data?.status;
            const hasProcessingItems = query.state.data?.items?.some((item) =>
                item.status === 'PENDING' || item.status === 'PROCESSING'
            );
            if (status === 'AWAITING_APPROVAL' || status === 'PROCESSING' || status === 'CONFIRMED' || hasProcessingItems) {
                return 5000; // Poll every 5s while not settled
            }
            return false;
        },
    });
