"use client";

import { useState } from "react";
import { Bell, Mail, CheckCircle2 } from "lucide-react";

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState({
        // Transaction Notifications
        successfulPayments: true,
        failedPayments: true,
        largeTransactions: true,
        allTransactions: false,
        // Payout Notifications
        payoutCompleted: true,
        payoutFailed: true,
        allPayouts: false,
        // Account Notifications
        lowBalance: true,
        kybUpdates: true,
        productionUpdates: true,
        securityAlerts: true,
        // Settlement Notifications
        settlementCompleted: true,
        settlementFailed: true,
        weeklySettlement: true,
    });

    const [recipients, setRecipients] = useState("finance@zitopay.com, admin@zitopay.com");
    const [saved, setSaved] = useState(false);

    const handleToggle = (key: keyof typeof notifications) => {
        setNotifications((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="p-6 space-y-6">
            {/* HEADER */}
            <div>
                <h1 className="text-xl font-bold text-foreground">Notification Settings</h1>
                <p className="text-xs text-muted-foreground mt-1">
                    Manage your email notification preferences
                </p>
            </div>

            {/* EMAIL NOTIFICATIONS */}
            <div className="bg-background rounded-xl p-6 border border-border">
                <div className="flex items-center gap-2 mb-6">
                    <Bell className="w-5 h-5 text-orange-600" />
                    <h3 className="text-sm font-semibold text-foreground">EMAIL NOTIFICATIONS</h3>
                </div>

                <div className="space-y-6">
                    {/* Transaction Notifications */}
                    <div>
                        <h4 className="text-sm font-semibold text-foreground mb-3">Transaction Notifications</h4>
                        <div className="space-y-3">
                            <label className="flex items-center justify-between cursor-pointer group">
                                <span className="text-xs text-foreground group-hover:text-orange-600 transition-colors">
                                    Successful payments
                                </span>
                                <input
                                    type="checkbox"
                                    checked={notifications.successfulPayments}
                                    onChange={() => handleToggle("successfulPayments")}
                                    className="rounded border-border"
                                />
                            </label>
                            <label className="flex items-center justify-between cursor-pointer group">
                                <span className="text-xs text-foreground group-hover:text-orange-600 transition-colors">
                                    Failed payments
                                </span>
                                <input
                                    type="checkbox"
                                    checked={notifications.failedPayments}
                                    onChange={() => handleToggle("failedPayments")}
                                    className="rounded border-border"
                                />
                            </label>
                            <label className="flex items-center justify-between cursor-pointer group">
                                <span className="text-xs text-foreground group-hover:text-orange-600 transition-colors">
                                    Large transactions (&gt; 100,000 FCFA)
                                </span>
                                <input
                                    type="checkbox"
                                    checked={notifications.largeTransactions}
                                    onChange={() => handleToggle("largeTransactions")}
                                    className="rounded border-border"
                                />
                            </label>
                            <label className="flex items-center justify-between cursor-pointer group">
                                <span className="text-xs text-foreground group-hover:text-orange-600 transition-colors">
                                    All transactions
                                </span>
                                <input
                                    type="checkbox"
                                    checked={notifications.allTransactions}
                                    onChange={() => handleToggle("allTransactions")}
                                    className="rounded border-border"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Payout Notifications */}
                    <div className="pt-6 border-t border-border">
                        <h4 className="text-sm font-semibold text-foreground mb-3">Payout Notifications</h4>
                        <div className="space-y-3">
                            <label className="flex items-center justify-between cursor-pointer group">
                                <span className="text-xs text-foreground group-hover:text-orange-600 transition-colors">
                                    Payout completed
                                </span>
                                <input
                                    type="checkbox"
                                    checked={notifications.payoutCompleted}
                                    onChange={() => handleToggle("payoutCompleted")}
                                    className="rounded border-border"
                                />
                            </label>
                            <label className="flex items-center justify-between cursor-pointer group">
                                <span className="text-xs text-foreground group-hover:text-orange-600 transition-colors">
                                    Payout failed
                                </span>
                                <input
                                    type="checkbox"
                                    checked={notifications.payoutFailed}
                                    onChange={() => handleToggle("payoutFailed")}
                                    className="rounded border-border"
                                />
                            </label>
                            <label className="flex items-center justify-between cursor-pointer group">
                                <span className="text-xs text-foreground group-hover:text-orange-600 transition-colors">
                                    All payouts
                                </span>
                                <input
                                    type="checkbox"
                                    checked={notifications.allPayouts}
                                    onChange={() => handleToggle("allPayouts")}
                                    className="rounded border-border"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Account Notifications */}
                    <div className="pt-6 border-t border-border">
                        <h4 className="text-sm font-semibold text-foreground mb-3">Account Notifications</h4>
                        <div className="space-y-3">
                            <label className="flex items-center justify-between cursor-pointer group">
                                <span className="text-xs text-foreground group-hover:text-orange-600 transition-colors">
                                    Low balance alerts (&lt; 50,000 FCFA)
                                </span>
                                <input
                                    type="checkbox"
                                    checked={notifications.lowBalance}
                                    onChange={() => handleToggle("lowBalance")}
                                    className="rounded border-border"
                                />
                            </label>
                            <label className="flex items-center justify-between cursor-pointer group">
                                <span className="text-xs text-foreground group-hover:text-orange-600 transition-colors">
                                    KYB status updates
                                </span>
                                <input
                                    type="checkbox"
                                    checked={notifications.kybUpdates}
                                    onChange={() => handleToggle("kybUpdates")}
                                    className="rounded border-border"
                                />
                            </label>
                            <label className="flex items-center justify-between cursor-pointer group">
                                <span className="text-xs text-foreground group-hover:text-orange-600 transition-colors">
                                    Production access updates
                                </span>
                                <input
                                    type="checkbox"
                                    checked={notifications.productionUpdates}
                                    onChange={() => handleToggle("productionUpdates")}
                                    className="rounded border-border"
                                />
                            </label>
                            <label className="flex items-center justify-between cursor-pointer group">
                                <span className="text-xs text-foreground group-hover:text-orange-600 transition-colors">
                                    Security alerts
                                </span>
                                <input
                                    type="checkbox"
                                    checked={notifications.securityAlerts}
                                    onChange={() => handleToggle("securityAlerts")}
                                    className="rounded border-border"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Settlement Notifications */}
                    <div className="pt-6 border-t border-border">
                        <h4 className="text-sm font-semibold text-foreground mb-3">Settlement Notifications</h4>
                        <div className="space-y-3">
                            <label className="flex items-center justify-between cursor-pointer group">
                                <span className="text-xs text-foreground group-hover:text-orange-600 transition-colors">
                                    Settlement completed
                                </span>
                                <input
                                    type="checkbox"
                                    checked={notifications.settlementCompleted}
                                    onChange={() => handleToggle("settlementCompleted")}
                                    className="rounded border-border"
                                />
                            </label>
                            <label className="flex items-center justify-between cursor-pointer group">
                                <span className="text-xs text-foreground group-hover:text-orange-600 transition-colors">
                                    Settlement failed
                                </span>
                                <input
                                    type="checkbox"
                                    checked={notifications.settlementFailed}
                                    onChange={() => handleToggle("settlementFailed")}
                                    className="rounded border-border"
                                />
                            </label>
                            <label className="flex items-center justify-between cursor-pointer group">
                                <span className="text-xs text-foreground group-hover:text-orange-600 transition-colors">
                                    Weekly settlement summary
                                </span>
                                <input
                                    type="checkbox"
                                    checked={notifications.weeklySettlement}
                                    onChange={() => handleToggle("weeklySettlement")}
                                    className="rounded border-border"
                                />
                            </label>
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors flex items-center gap-2"
                    >
                        {saved ? (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                Saved!
                            </>
                        ) : (
                            "Save Preferences"
                        )}
                    </button>
                </div>
            </div>

            {/* NOTIFICATION RECIPIENTS */}
            <div className="bg-background rounded-xl p-6 border border-border">
                <div className="flex items-center gap-2 mb-6">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <h3 className="text-sm font-semibold text-foreground">NOTIFICATION RECIPIENTS</h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Primary Email</p>
                        <p className="text-sm font-semibold text-foreground">contact@zitopay.com</p>
                    </div>

                    <div>
                        <label className="text-xs font-medium text-foreground mb-2 block">
                            Additional Recipients (comma-separated)
                        </label>
                        <input
                            type="text"
                            value={recipients}
                            onChange={(e) => setRecipients(e.target.value)}
                            placeholder="finance@zitopay.com, admin@zitopay.com"
                            className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Separate multiple email addresses with commas
                        </p>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors flex items-center gap-2"
                    >
                        {saved ? (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                Saved!
                            </>
                        ) : (
                            "Save Recipients"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
