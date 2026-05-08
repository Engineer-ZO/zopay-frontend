"use client";

import { useState } from "react";
import { CreditCard, FileText, Building2, Wallet } from "lucide-react";
import FeeVersionsTab from "./components/FeeVersionsTab";
import FeeRulesTab from "./components/FeeRulesTab";
import MerchantOverridesTab from "./components/MerchantOverridesTab";
import WalletSettingsTab from "./components/WalletSettingsTab";

export default function FeesManagementPage() {
  const [activeTab, setActiveTab] = useState("versions");

  const tabs = [
    { id: "versions", label: "Fee Versions", icon: FileText },
    { id: "rules", label: "Fee Rules", icon: CreditCard },
    { id: "overrides", label: "Merchant Overrides", icon: Building2 },
    { id: "wallet", label: "Wallet Settings", icon: Wallet },
  ];

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-blue-600" />
            Fee Management
          </h1>
          <p className="text-xs text-gray-500 mt-1">Manage fee versions, rules, overrides, and wallet settings</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-1 flex gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "versions" && <FeeVersionsTab />}
        {activeTab === "rules" && <FeeRulesTab />}
        {activeTab === "overrides" && <MerchantOverridesTab />}
        {activeTab === "wallet" && <WalletSettingsTab />}
      </div>
    </div>
  );
}
