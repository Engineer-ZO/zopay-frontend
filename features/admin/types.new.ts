
export type GatewayCode = 'MTN_MOMO' | 'ORANGE_MONEY';
export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED' | 'API_BLOCKED';

export interface GlobalGateway {
    id: string;
    code: GatewayCode;
    name: string;
    isActive: boolean;
    collectionsEnabled: boolean;
    disbursementsEnabled: boolean;
    updatedAt: string;
}

export interface GetGlobalGatewaysResponse {
    success: boolean;
    gateways: GlobalGateway[];
}

export interface UpdateGlobalGatewayRequest {
    isActive?: boolean;
    collectionsEnabled?: boolean;
    disbursementsEnabled?: boolean;
}

export interface UpdateGlobalGatewayResponse {
    success: boolean;
    gateway: GlobalGateway;
}

export interface MerchantStatusUpdate {
    status: AccountStatus;
    notifyUser?: boolean;
    reason?: string;
}

export interface UpdateMerchantStatusResponse {
    success: boolean;
    merchant: {
        id: string;
        businessName: string;
        accountStatus: AccountStatus;
        updatedAt: string;
        // ...other merchant fields can be partial using Record<string, any> or just what we need
    };
}

export interface MerchantCapabilitiesUpdate {
    canCollect?: boolean;
    canDisburse?: boolean;
}

export interface UpdateMerchantCapabilitiesResponse {
    success: boolean;
    merchant: {
        id: string;
        canCollect: boolean;
        canDisburse: boolean;
        updatedAt: string;
    };
}

export interface MerchantGatewayConfigUpdate {
    gateway: GatewayCode;
    enabled?: boolean;
    canCollect?: boolean;
    canDisburse?: boolean;
}

export interface UpdateMerchantGatewayConfigResponse {
    success: boolean;
    config: {
        id: string;
        merchantId: string;
        gateway: GatewayCode;
        enabled: boolean;
        canCollect: boolean;
        canDisburse: boolean;
        updatedAt: string;
    };
}
