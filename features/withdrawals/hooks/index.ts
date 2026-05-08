import {
    useQuery,
    useMutation,
    useQueryClient,
    UseQueryResult,
    UseMutationResult,
} from '@tanstack/react-query';
import {
    listWithdrawalMethods,
    submitLocalBank,
    submitInternationalBank,
    submitPrepaidCard,
    quoteWithdrawal,
    initiateWithdrawal,
    listWithdrawals,
    verifyMsisdn,
    verifyMsisdnBulk,
    listMerchantLocalBanks,
    listAdminLocalBanks,
    createLocalBank,
    updateLocalBank,
    deleteLocalBank,
    listWithdrawalLimits,
    createWithdrawalLimit,
    deleteWithdrawalLimit,
    listWithdrawalFeeRules,
    upsertWithdrawalFeeRule,
    deleteWithdrawalFeeRule,
} from '../api/index';
import type {
    ListWithdrawalMethodsResponse,
    SubmitLocalBankRequest,
    SubmitInternationalBankRequest,
    SubmitPrepaidCardRequest,
    SubmitWithdrawalMethodResponse,
    InitiateWithdrawalRequest,
    InitiateWithdrawalResponse,
    WithdrawalQuoteResponse,
    ListWithdrawalsResponse,
    ListWithdrawalsParams,
    MsisdnVerifyRequest,
    MsisdnVerifyResponse,
    MsisdnVerifyBulkRequest,
    MsisdnVerifyBulkResponse,
    LocalBank,
    ListLocalBanksResponse,
    WithdrawalLimit,
    ListWithdrawalLimitsResponse,
    SetWithdrawalLimitRequest,
    ListWithdrawalFeeRulesResponse,
    UpsertWithdrawalFeeRuleRequest,
    UpsertWithdrawalFeeRuleResponse,
} from '../types/index';

export const useWithdrawalMethods = (
    merchantId: string | null
): UseQueryResult<ListWithdrawalMethodsResponse, Error> => {
    return useQuery({
        queryKey: ['withdrawalMethods', merchantId],
        queryFn: () => listWithdrawalMethods(merchantId!),
        enabled: !!merchantId,
        staleTime: 30 * 1000,
    });
};

export const useSubmitLocalBank = (): UseMutationResult<SubmitWithdrawalMethodResponse, Error, SubmitLocalBankRequest> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => submitLocalBank(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['withdrawalMethods'] });
        },
    });
};

export const useSubmitInternationalBank = (): UseMutationResult<SubmitWithdrawalMethodResponse, Error, SubmitInternationalBankRequest> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => submitInternationalBank(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['withdrawalMethods'] });
        },
    });
};

export const useSubmitPrepaidCard = (): UseMutationResult<SubmitWithdrawalMethodResponse, Error, SubmitPrepaidCardRequest> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => submitPrepaidCard(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['withdrawalMethods'] });
        },
    });
};

export const useInitiateWithdrawal = (): UseMutationResult<InitiateWithdrawalResponse, Error, InitiateWithdrawalRequest> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => initiateWithdrawal(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
        },
    });
};

export const useQuoteWithdrawal = (): UseMutationResult<WithdrawalQuoteResponse, Error, InitiateWithdrawalRequest> => {
    return useMutation({
        mutationFn: (payload) => quoteWithdrawal(payload),
    });
};

export const useWithdrawals = (
    params: ListWithdrawalsParams | null
): UseQueryResult<ListWithdrawalsResponse, Error> => {
    return useQuery({
        queryKey: ['withdrawals', params],
        queryFn: () => listWithdrawals(params!),
        enabled: !!params,
        staleTime: 30 * 1000,
    });
};

export const useVerifyMsisdn = (): UseMutationResult<MsisdnVerifyResponse, Error, MsisdnVerifyRequest> => {
    return useMutation({
        mutationFn: (payload) => verifyMsisdn(payload),
    });
};

export const useVerifyMsisdnBulk = (): UseMutationResult<MsisdnVerifyBulkResponse, Error, MsisdnVerifyBulkRequest> => {
    return useMutation({
        mutationFn: (payload) => verifyMsisdnBulk(payload),
    });
};

export const useMerchantLocalBanks = (): UseQueryResult<ListLocalBanksResponse, Error> => {
    return useQuery({
        queryKey: ['merchantLocalBanks'],
        queryFn: listMerchantLocalBanks,
        staleTime: 5 * 60 * 1000,
    });
};

export const useAdminLocalBanks = (params?: { country?: string; active_only?: boolean }): UseQueryResult<ListLocalBanksResponse, Error> => {
    return useQuery({
        queryKey: ['adminLocalBanks', params],
        queryFn: () => listAdminLocalBanks(params),
        staleTime: 5 * 60 * 1000,
    });
};

export const useCreateLocalBank = (): UseMutationResult<{ bank: LocalBank }, Error, { name: string; code: string; country?: string }> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createLocalBank,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminLocalBanks'] }),
    });
};

export const useUpdateLocalBank = (): UseMutationResult<{ bank: LocalBank }, Error, { id: string; payload: Partial<LocalBank> }> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }) => updateLocalBank(id, payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminLocalBanks'] }),
    });
};

export const useDeleteLocalBank = (): UseMutationResult<{ success: boolean; message: string }, Error, string> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteLocalBank,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminLocalBanks'] }),
    });
};

export const useAdminWithdrawalLimits = (): UseQueryResult<ListWithdrawalLimitsResponse, Error> => {
    return useQuery({
        queryKey: ['withdrawalLimits'],
        queryFn: listWithdrawalLimits,
        staleTime: 5 * 60 * 1000,
    });
};

export const useCreateWithdrawalLimit = (): UseMutationResult<{ limit: WithdrawalLimit }, Error, SetWithdrawalLimitRequest> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createWithdrawalLimit,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['withdrawalLimits'] }),
    });
};

export const useDeleteWithdrawalLimit = (): UseMutationResult<{ success: boolean }, Error, string> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteWithdrawalLimit,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['withdrawalLimits'] }),
    });
};

// ---- Withdrawal Fee Rules ----

export const useWithdrawalFeeRules = (): UseQueryResult<ListWithdrawalFeeRulesResponse, Error> => {
    return useQuery({
        queryKey: ['withdrawalFeeRules'],
        queryFn: listWithdrawalFeeRules,
        staleTime: 5 * 60 * 1000,
    });
};

export const useUpsertWithdrawalFeeRule = (): UseMutationResult<UpsertWithdrawalFeeRuleResponse, Error, UpsertWithdrawalFeeRuleRequest> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: upsertWithdrawalFeeRule,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['withdrawalFeeRules'] }),
    });
};

export const useDeleteWithdrawalFeeRule = (): UseMutationResult<{ success: boolean; message: string }, Error, string> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteWithdrawalFeeRule,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['withdrawalFeeRules'] }),
    });
};
