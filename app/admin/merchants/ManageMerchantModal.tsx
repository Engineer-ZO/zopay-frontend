"use client";

import { useMemo, useState } from "react";
import {
    X,
    Shield,
    Server,
    Activity,
    CheckCircle2,
    AlertTriangle,
    Ban,
    Lock,
    Save,
    Loader2,
    User,
    XCircle
} from "lucide-react";
import { toast } from "sonner";
import { MerchantUser, AccountStatus, GatewayCode } from "@/features/admin/types";
import {
    useUpdateMerchantStatus,
    useUpdateMerchant,
    useUpdateMerchantCapabilities,
    useMerchantGatewayConfigs,
    useUpdateMerchantGatewayConfig
} from "@/features/admin/queries";

interface ManageMerchantModalProps {
    merchant: MerchantUser;
    onClose: () => void;
}

type TabType = 'status' | 'capabilities' | 'gateways' | 'profile';

const DEFAULT_GATEWAYS: Record<GatewayCode, { enabled: boolean; canCollect: boolean; canDisburse: boolean }> = {
    MTN_MOMO: { enabled: true, canCollect: true, canDisburse: true },
    ORANGE_MONEY: { enabled: true, canCollect: true, canDisburse: true }
};

export default function ManageMerchantModal({ merchant, onClose }: ManageMerchantModalProps) {
    const [activeTab, setActiveTab] = useState<TabType>('status');

    // Status State
    const [status, setStatus] = useState<AccountStatus>(merchant.accountStatus || 'ACTIVE');
    const [statusReason, setStatusReason] = useState("");
    const [notifyUser, setNotifyUser] = useState(true);

    // Capabilities State
    const [canCollect, setCanCollect] = useState(merchant.canCollect ?? true);
    const [canDisburse, setCanDisburse] = useState(merchant.canDisburse ?? true);
    const [canWithdraw, setCanWithdraw] = useState(merchant.canWithdraw ?? true);

    // Gateways State
    const [gatewayEdits, setGatewayEdits] = useState<Partial<Record<GatewayCode, { enabled: boolean; canCollect: boolean; canDisburse: boolean }>>>({});

    // Profile State
    const [businessName, setBusinessName] = useState(merchant.businessName);
    const [email, setEmail] = useState(merchant.userEmail);
    const [phone, setPhone] = useState(merchant.merchantPhone || '');
    const [feePayer, setFeePayer] = useState<'PAYER' | 'MERCHANT'>(merchant.feePayer || 'PAYER');

    // Mutations
    const updateStatusMutation = useUpdateMerchantStatus();
    const updateMerchantMutation = useUpdateMerchant();
    const updateCapabilitiesMutation = useUpdateMerchantCapabilities();
    const { data: gatewayConfigsResponse, isLoading: gatewayConfigsLoading } = useMerchantGatewayConfigs(merchant.merchantId);
    const updateGatewayConfigMutation = useUpdateMerchantGatewayConfig();

    const gateways = useMemo(() => {
        const merged = { ...DEFAULT_GATEWAYS };

        gatewayConfigsResponse?.configs?.forEach((config) => {
            merged[config.gateway] = {
                enabled: config.enabled,
                canCollect: config.canCollect,
                canDisburse: config.canDisburse,
            };
        });

        (Object.keys(gatewayEdits) as GatewayCode[]).forEach((code) => {
            const edit = gatewayEdits[code];
            if (edit) {
                merged[code] = edit;
            }
        });

        return merged;
    }, [gatewayConfigsResponse, gatewayEdits]);

    const handleSaveProfile = async () => {
        try {
            await updateMerchantMutation.mutateAsync({
                merchantId: merchant.merchantId,
                data: {
                    businessName,
                    email,
                    phone,
                    feePayer
                }
            });
            toast.success("Merchant profile updated successfully");
        } catch (error: unknown) {
            const err = error as Error & { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || err.message || "Failed to update profile");
        }
    };

    const handleSaveStatus = async () => {
        try {
            await updateStatusMutation.mutateAsync({
                merchantId: merchant.merchantId,
                data: {
                    status,
                    reason: statusReason,
                    notifyUser
                }
            });
            toast.success("Merchant status updated successfully");
        } catch (error: unknown) {
            const err = error as Error & { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || err.message || "Failed to update status");
        }
    };

    const handleSaveCapabilities = async () => {
        try {
            await updateCapabilitiesMutation.mutateAsync({
                merchantId: merchant.merchantId,
                data: {
                    canCollect,
                    canDisburse,
                    canWithdraw
                }
            });
            toast.success("Merchant capabilities updated successfully");
        } catch (error: unknown) {
            const err = error as Error & { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || err.message || "Failed to update capabilities");
        }
    };

    const handleSaveGateway = async (code: GatewayCode) => {
        try {
            const config = gateways[code];
            await updateGatewayConfigMutation.mutateAsync({
                merchantId: merchant.merchantId,
                data: {
                    gateway: code,
                    enabled: config.enabled,
                    canCollect: config.canCollect,
                    canDisburse: config.canDisburse
                }
            });
            setGatewayEdits((prev) => {
                const next = { ...prev };
                delete next[code];
                return next;
            });
            toast.success(`${code === 'MTN_MOMO' ? 'MTN' : 'Orange'} configuration updated`);
        } catch (error: unknown) {
            const err = error as Error & { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || err.message || `Failed to update ${code}`);
        }
    };

    const tabs = [
        { id: 'status', label: 'Account Status', icon: Activity },
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'capabilities', label: 'Capabilities', icon: Shield },
        { id: 'gateways', label: 'Gateways', icon: Server },
    ];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl border border-gray-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Manage Merchant</h2>
                        <p className="text-sm text-gray-500">{merchant.businessName} ({merchant.merchantId.slice(0, 8)}...)</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 px-6">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabType)}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${isActive
                                    ? "border-blue-600 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'status' && (
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-gray-700">Account Status</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {[
                                        { value: 'ACTIVE', label: 'Active', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
                                        { value: 'INACTIVE', label: 'Inactive', icon: XCircle, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
                                        { value: 'SUSPENDED', label: 'Suspended', icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
                                        { value: 'BANNED', label: 'Banned', icon: Ban, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
                                        { value: 'API_BLOCKED', label: 'API Blocked', icon: Lock, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' },
                                    ].map((option) => {
                                        const OptionIcon = option.icon;
                                        const isSelected = status === option.value;
                                        return (
                                            <div
                                                key={option.value}
                                                onClick={() => setStatus(option.value as AccountStatus)}
                                                className={`relative cursor-pointer rounded-lg border p-4 flex items-start gap-3 transition-all ${isSelected
                                                    ? `${option.bg} ${option.border} ring-1 ring-offset-1 ring-blue-500`
                                                    : "bg-white border-gray-200 hover:bg-gray-50"
                                                    }`}
                                            >
                                                <div className={`p-2 rounded-full bg-white ${option.color}`}>
                                                    <OptionIcon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className={`font-semibold ${isSelected ? option.color : 'text-gray-900'}`}>{option.label}</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {option.value === 'ACTIVE' && "Full access granted"}
                                                        {option.value === 'INACTIVE' && "Account is inactive and access is disabled"}
                                                        {option.value === 'SUSPENDED' && "Temporary restricted access"}
                                                        {option.value === 'BANNED' && "Permanent restriction"}
                                                        {option.value === 'API_BLOCKED' && "Dashboard access only"}
                                                    </p>
                                                </div>
                                                {isSelected && (
                                                    <div className="absolute top-3 right-3 text-blue-600">
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-gray-700">Reason for Change (Optional)</label>
                                <textarea
                                    value={statusReason}
                                    onChange={(e) => setStatusReason(e.target.value)}
                                    placeholder="e.g. Suspicious activity detected on Feb 14..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm h-24 resize-none"
                                />
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={notifyUser}
                                        onChange={(e) => setNotifyUser(e.target.checked)}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                    />
                                    <span className="text-sm text-gray-700 select-none">Notify user via email about this status change</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-gray-700">Business Information</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Business Name</label>
                                        <input
                                            type="text"
                                            value={businessName}
                                            onChange={(e) => setBusinessName(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Merchant ID</label>
                                        <input
                                            type="text"
                                            value={merchant.merchantId}
                                            disabled
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-600"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-gray-700">Fee Settings</label>
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <p className="text-sm text-gray-600 mb-4">
                                        Choose whether transaction fees are charged to the customer or deducted from the merchant&apos;s received amount.
                                    </p>
                                    <div className="space-y-3">
                                        <label className="flex items-center space-x-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="feePayer"
                                                value="PAYER"
                                                checked={feePayer === 'PAYER'}
                                                onChange={(e) => setFeePayer(e.target.value as 'PAYER' | 'MERCHANT')}
                                                className="w-4 h-4 text-blue-600"
                                            />
                                            <div>
                                                <div className="font-medium text-sm">Customer (Payer)</div>
                                                <div className="text-xs text-gray-600">
                                                    Customers pay base amount plus fees. Merchant receives full base amount.
                                                </div>
                                            </div>
                                        </label>
                                        <label className="flex items-center space-x-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="feePayer"
                                                value="MERCHANT"
                                                checked={feePayer === 'MERCHANT'}
                                                onChange={(e) => setFeePayer(e.target.value as 'PAYER' | 'MERCHANT')}
                                                className="w-4 h-4 text-blue-600"
                                            />
                                            <div>
                                                <div className="font-medium text-sm">Merchant</div>
                                                <div className="text-xs text-gray-600">
                                                    Customers pay only base amount. Fees are deducted from merchant&apos;s received amount.
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'capabilities' && (
                        <div className="space-y-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-800">
                                    These settings control the merchant&apos;s ability to process transaction types globally. Disabling a capability here will override any gateway-specific settings.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                                            <Activity className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">Collections</h4>
                                            <p className="text-sm text-gray-500">Allow merchant to accept payments</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={canCollect}
                                            onChange={() => setCanCollect(!canCollect)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                            <Activity className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">Disbursements</h4>
                                            <p className="text-sm text-gray-500">Allow merchant to send payouts</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={canDisburse}
                                            onChange={() => setCanDisburse(!canDisburse)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                                            <Activity className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">Withdrawals</h4>
                                            <p className="text-sm text-gray-500">Allow merchant to withdraw funds to their own accounts</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={canWithdraw}
                                            onChange={() => setCanWithdraw(!canWithdraw)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'gateways' && (
                        <div className="space-y-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-800">
                                    These settings apply per gateway for this merchant. They work underneath the global gateway switches and the merchant-wide capability toggles.
                                </p>
                            </div>
                            {gatewayConfigsLoading && (
                                <div className="space-y-3">
                                    <div className="h-28 rounded-lg border border-gray-200 bg-gray-50 animate-pulse" />
                                    <div className="h-28 rounded-lg border border-gray-200 bg-gray-50 animate-pulse" />
                                </div>
                            )}
                            {!gatewayConfigsLoading && (['MTN_MOMO', 'ORANGE_MONEY'] as GatewayCode[]).map((code) => {
                                const config = gateways[code];
                                const isMtn = code === 'MTN_MOMO';
                                return (
                                    <div key={code} className="border border-gray-200 rounded-lg overflow-hidden">
                                        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b border-gray-200">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold ${isMtn ? 'bg-yellow-400' : 'bg-orange-500'}`}>
                                                    {isMtn ? 'MTN' : 'OM'}
                                                </div>
                                                <h4 className="font-semibold text-gray-900">{isMtn ? 'MTN Mobile Money' : 'Orange Money'}</h4>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={config.enabled}
                                                        onChange={() => setGatewayEdits(prev => ({
                                                            ...prev,
                                                            [code]: { ...gateways[code], enabled: !gateways[code].enabled }
                                                        }))}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                                                </label>

                                                <button
                                                    onClick={() => handleSaveGateway(code)}
                                                    disabled={updateGatewayConfigMutation.isPending}
                                                    className="ml-2 p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors disabled:opacity-50"
                                                    title="Save Gateway Settings"
                                                >
                                                    {updateGatewayConfigMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className={`p-4 grid grid-cols-2 gap-4 transition-opacity ${!config.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                                            <label className="flex items-center justify-between p-3 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer">
                                                <span className="text-sm text-gray-700">Collections</span>
                                                <input
                                                    type="checkbox"
                                                    checked={config.canCollect}
                                                    onChange={() => setGatewayEdits(prev => ({
                                                        ...prev,
                                                        [code]: { ...gateways[code], canCollect: !gateways[code].canCollect }
                                                    }))}
                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                                />
                                            </label>
                                            <label className="flex items-center justify-between p-3 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer">
                                                <span className="text-sm text-gray-700">Disbursements</span>
                                                <input
                                                    type="checkbox"
                                                    checked={config.canDisburse}
                                                    onChange={() => setGatewayEdits(prev => ({
                                                        ...prev,
                                                        [code]: { ...gateways[code], canDisburse: !gateways[code].canDisburse }
                                                    }))}
                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                                />
                                            </label>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Close
                    </button>
                    {activeTab === 'status' && (
                        <button
                            onClick={handleSaveStatus}
                            disabled={updateStatusMutation.isPending}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {updateStatusMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Update Status
                        </button>
                    )}
                    {activeTab === 'profile' && (
                        <button
                            onClick={handleSaveProfile}
                            disabled={updateMerchantMutation.isPending}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {updateMerchantMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Update Profile
                                </>
                            )}
                        </button>
                    )}
                    {activeTab === 'capabilities' && (
                        <button
                            onClick={handleSaveCapabilities}
                            disabled={updateCapabilitiesMutation.isPending}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {updateCapabilitiesMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Update Capabilities
                        </button>
                    )}
                    {activeTab === 'gateways' && (
                        <p className="text-xs text-gray-500 italic">Save each gateway individually using the icon next to its name.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
