import { apiClient } from '@/lib/apiClient';
import type {
    ListWithdrawalMethodsResponse,
    SubmitLocalBankRequest,
    SubmitInternationalBankRequest,
    SubmitPrepaidCardRequest,
    SubmitWithdrawalMethodResponse,
    InitiateWithdrawalRequest,
    InitiateWithdrawalResponse,
    WithdrawalQuoteResponse,
    RawWithdrawalQuoteResponse,
    RawInitiateWithdrawalResponse,
    GetWithdrawalResponse,
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
    Withdrawal,
} from '../types/index';

const buildMsisdnDisplayName = (payload: {
    name?: string;
    given_name?: string;
    family_name?: string;
    firstName?: string;
    lastName?: string;
}): string => {
    if (payload.name?.trim()) {
        return payload.name.trim();
    }

    const combinedName = [payload.given_name, payload.family_name, payload.firstName, payload.lastName]
        .map((part) => part?.trim())
        .filter(Boolean)
        .join(' ');

    return combinedName || 'Name not available';
};

const isMsisdnUsable = (payload: { found: boolean; status?: string }): boolean =>
    payload.found && (!payload.status || payload.status.toUpperCase() === 'ACTIVE');

const normalizeWithdrawal = (withdrawal: Record<string, unknown>): Withdrawal => ({
    id: String(withdrawal.id ?? withdrawal.withdrawal_id ?? ''),
    merchantId: String(withdrawal.merchantId ?? withdrawal.merchant_id ?? ''),
    withdrawalMethod: (withdrawal.withdrawalMethod ?? withdrawal.withdrawal_method ?? 'LOCAL_BANK') as Withdrawal['withdrawalMethod'],
    gateway: (withdrawal.gateway as string | null | undefined) ?? null,
    amount: String(withdrawal.amount ?? '0'),
    currency: String(withdrawal.currency ?? 'XAF'),
    gatewayFee: String(withdrawal.gatewayFee ?? withdrawal.gateway_fee ?? '0'),
    platformFee: String(withdrawal.platformFee ?? withdrawal.platform_fee ?? '0'),
    withdrawalFee: String(withdrawal.withdrawalFee ?? withdrawal.withdrawal_fee ?? '0'),
    totalDeduction: String(withdrawal.totalDeduction ?? withdrawal.total_deduction ?? '0'),
    recipientMsisdn: (withdrawal.recipientMsisdn ?? withdrawal.recipient_msisdn ?? null) as string | null,
    status: (withdrawal.status ?? 'PENDING') as Withdrawal['status'],
    gatewayReference: (withdrawal.gatewayReference ?? withdrawal.gateway_reference ?? null) as string | null,
    environment: (withdrawal.environment ?? 'sandbox') as Withdrawal['environment'],
    createdAt: String(withdrawal.createdAt ?? withdrawal.created_at ?? ''),
    updatedAt: String(withdrawal.updatedAt ?? withdrawal.updated_at ?? ''),
});

const normalizeInitiateWithdrawalResponse = (
    response: RawInitiateWithdrawalResponse
): InitiateWithdrawalResponse => ({
    withdrawalId: String(response.withdrawalId ?? response.withdrawal_id ?? ''),
    status: response.status,
    withdrawalMethod: (response.withdrawalMethod ?? response.withdrawal_method ?? 'LOCAL_BANK') as InitiateWithdrawalResponse['withdrawalMethod'],
    amount: String(response.amount ?? '0'),
    currency: String(response.currency ?? 'XAF'),
    gatewayFee: String(response.gatewayFee ?? response.gateway_fee ?? '0'),
    platformFee: String(response.platformFee ?? response.platform_fee ?? '0'),
    withdrawalFee: String(response.withdrawalFee ?? response.withdrawal_fee ?? '0'),
    totalDeduction: String(response.totalDeduction ?? response.total_deduction ?? '0'),
    gatewayReference: (response.gatewayReference ?? response.gateway_reference ?? null) as string | null,
    createdAt: String(response.createdAt ?? response.created_at ?? ''),
});

const normalizeWithdrawalQuoteResponse = (
    response: RawWithdrawalQuoteResponse
): WithdrawalQuoteResponse => ({
    amount: String(response.amount ?? '0'),
    withdrawalMethod: (response.withdrawalMethod ?? response.withdrawal_method ?? 'LOCAL_BANK') as WithdrawalQuoteResponse['withdrawalMethod'],
    currency: String(response.currency ?? 'XAF'),
    gatewayFee: String(response.gatewayFee ?? response.gateway_fee ?? '0'),
    platformFee: String(response.platformFee ?? response.platform_fee ?? '0'),
    withdrawalFee: String(response.withdrawalFee ?? response.withdrawal_fee ?? '0'),
    totalDeduction: String(response.totalDeduction ?? response.total_deduction ?? '0'),
});

// ---- Withdrawal Methods ----

export const listWithdrawalMethods = async (merchantId: string): Promise<ListWithdrawalMethodsResponse> => {
    const { data } = await apiClient.get<ListWithdrawalMethodsResponse>(
        '/merchant/v1/withdrawal-methods',
        { params: { merchant_id: merchantId } }
    );
    return data;
};

export const submitLocalBank = async (payload: SubmitLocalBankRequest): Promise<SubmitWithdrawalMethodResponse> => {
    const { data } = await apiClient.post<SubmitWithdrawalMethodResponse>(
        '/merchant/v1/withdrawal-methods/local-bank',
        payload
    );
    return data;
};

export const submitInternationalBank = async (payload: SubmitInternationalBankRequest): Promise<SubmitWithdrawalMethodResponse> => {
    const { data } = await apiClient.post<SubmitWithdrawalMethodResponse>(
        '/merchant/v1/withdrawal-methods/international-bank',
        payload
    );
    return data;
};

export const submitPrepaidCard = async (payload: SubmitPrepaidCardRequest): Promise<SubmitWithdrawalMethodResponse> => {
    const { data } = await apiClient.post<SubmitWithdrawalMethodResponse>(
        '/merchant/v1/withdrawal-methods/prepaid-card',
        payload
    );
    return data;
};

// ---- Withdrawals ----

export const initiateWithdrawal = async (payload: InitiateWithdrawalRequest): Promise<InitiateWithdrawalResponse> => {
    const { data } = await apiClient.post<RawInitiateWithdrawalResponse>('/merchant/v1/withdrawals', payload);
    return normalizeInitiateWithdrawalResponse(data);
};

export const quoteWithdrawal = async (payload: InitiateWithdrawalRequest): Promise<WithdrawalQuoteResponse> => {
    const { data } = await apiClient.post<RawWithdrawalQuoteResponse>('/merchant/v1/withdrawals/quote', payload);
    return normalizeWithdrawalQuoteResponse(data);
};

export const getWithdrawal = async (id: string): Promise<GetWithdrawalResponse> => {
    const { data } = await apiClient.get<{ withdrawal: Record<string, unknown> }>(`/merchant/v1/withdrawals/${id}`);
    return { withdrawal: normalizeWithdrawal(data.withdrawal) };
};

export const listWithdrawals = async (params: ListWithdrawalsParams): Promise<ListWithdrawalsResponse> => {
    const { data } = await apiClient.get<{ withdrawals: Record<string, unknown>[]; total: number }>('/merchant/v1/withdrawals', { params });
    return {
        withdrawals: data.withdrawals.map(normalizeWithdrawal),
        total: data.total,
    };
};

// ---- MSISDN Verification ----

export const verifyMsisdn = async (payload: MsisdnVerifyRequest): Promise<MsisdnVerifyResponse> => {
    const { data } = await apiClient.post<MsisdnVerifyResponse>('/merchant/v1/msisdn/verify', payload);
    return {
        ...data,
        displayName: buildMsisdnDisplayName(data),
        isUsable: isMsisdnUsable(data),
    };
};

export const verifyMsisdnBulk = async (payload: MsisdnVerifyBulkRequest): Promise<MsisdnVerifyBulkResponse> => {
    const { data } = await apiClient.post<MsisdnVerifyBulkResponse>('/merchant/v1/msisdn/verify-bulk', payload);
    return {
        ...data,
        valid: data.valid.map((entry) => ({
            ...entry,
            displayName: buildMsisdnDisplayName(entry),
            isUsable: isMsisdnUsable(entry),
        })),
    };
};

// ---- Local Bank Catalog ----

export const listMerchantLocalBanks = async (): Promise<ListLocalBanksResponse> => {
    const { data } = await apiClient.get<ListLocalBanksResponse>('/merchant/v1/local-banks');
    return data;
};

export const listAdminLocalBanks = async (params?: { country?: string; active_only?: boolean }): Promise<ListLocalBanksResponse> => {
    const { data } = await apiClient.get<ListLocalBanksResponse>('/admin/v1/local-banks', { params });
    return data;
};

export const createLocalBank = async (payload: { name: string; code: string; country?: string }): Promise<{ bank: LocalBank }> => {
    const { data } = await apiClient.post<{ bank: LocalBank }>('/admin/v1/local-banks', payload);
    return data;
};

export const updateLocalBank = async (id: string, payload: Partial<LocalBank>): Promise<{ bank: LocalBank }> => {
    const { data } = await apiClient.put<{ bank: LocalBank }>(`/admin/v1/local-banks/${id}`, payload);
    return data;
};

export const deleteLocalBank = async (id: string): Promise<{ success: boolean; message: string }> => {
    const { data } = await apiClient.delete<{ success: boolean; message: string }>(`/admin/v1/local-banks/${id}`);
    return data;
};

// ---- Withdrawal Limits ----

export const listWithdrawalLimits = async (): Promise<ListWithdrawalLimitsResponse> => {
    const { data } = await apiClient.get<ListWithdrawalLimitsResponse>('/admin/v1/withdrawal-limits');
    return data;
};

export const createWithdrawalLimit = async (payload: SetWithdrawalLimitRequest): Promise<{ limit: WithdrawalLimit }> => {
    const { data } = await apiClient.post<{ limit: WithdrawalLimit }>('/admin/v1/withdrawal-limits', payload);
    return data;
};

export const deleteWithdrawalLimit = async (id: string): Promise<{ success: boolean }> => {
    const { data } = await apiClient.delete<{ success: boolean }>(`/admin/v1/withdrawal-limits/${id}`);
    return data;
};

// ---- Withdrawal Fee Rules ----

export const listWithdrawalFeeRules = async (): Promise<ListWithdrawalFeeRulesResponse> => {
    const { data } = await apiClient.get<ListWithdrawalFeeRulesResponse>('/admin/v1/withdrawal-fees');
    return data;
};

export const upsertWithdrawalFeeRule = async (payload: UpsertWithdrawalFeeRuleRequest): Promise<UpsertWithdrawalFeeRuleResponse> => {
    const { data } = await apiClient.post<UpsertWithdrawalFeeRuleResponse>('/admin/v1/withdrawal-fees', payload);
    return data;
};

export const deleteWithdrawalFeeRule = async (id: string): Promise<{ success: boolean; message: string }> => {
    const { data } = await apiClient.delete<{ success: boolean; message: string }>(`/admin/v1/withdrawal-fees/${id}`);
    return data;
};
