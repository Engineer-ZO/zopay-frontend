"use client";

import { useState, useEffect } from "react";
import { useGetFirstMerchant, useUpdateMerchantProfile } from "@/features/merchants/hooks";
import { toast } from "sonner";
import { Settings, Mail, MessageSquare, Calculator, TrendingUp, HelpCircle } from "lucide-react";

export default function FeeSettingsPage() {
  const { data: merchantData, isLoading: isLoadingMerchant } = useGetFirstMerchant();
  const updateProfile = useUpdateMerchantProfile();

  const [feePayer, setFeePayer] = useState<'PAYER' | 'MERCHANT'>('PAYER');

  useEffect(() => {
    if (merchantData?.merchant) {
      setFeePayer(merchantData.merchant.feePayer || 'PAYER');
    }
  }, [merchantData]);

  const handleFeePayerChange = async (newFeePayer: 'PAYER' | 'MERCHANT') => {
    const previous = feePayer;
    setFeePayer(newFeePayer); // optimistic
    try {
      await updateProfile.mutateAsync({ feePayer: newFeePayer });
      toast.success('Fee payer updated', {
        description: `Now set to: ${newFeePayer === 'PAYER' ? 'Customer (Payer)' : 'Merchant'}.`,
      });
    } catch (error) {
      setFeePayer(previous); // revert on failure
      toast.error('Failed to update fee payer setting');
    }
  };

  if (isLoadingMerchant) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">Fee Settings</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Configure transaction fees and understand how they work
        </p>
      </div>

      {/* FEE PAYER SELECTION */}
      <div className="bg-background rounded-xl p-6 border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-deep-blue-violet-100 rounded-lg flex items-center justify-center">
            <Settings className="w-4 h-4 text-deep-blue-violet-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Who Pays Transaction Fees?</h2>
            <p className="text-xs text-muted-foreground">Choose who bears the transaction costs</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => handleFeePayerChange('PAYER')}
                disabled={updateProfile.isPending}
            className={`p-4 rounded-lg border transition-colors text-left ${
              feePayer === 'PAYER'
                ? 'bg-deep-blue-violet-50 dark:bg-deep-blue-violet-900/20 border-deep-blue-violet-200 dark:border-deep-blue-violet-800'
                : 'bg-background border-border hover:bg-muted'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-4 h-4 rounded-full border-2 mt-0.5 ${
                feePayer === 'PAYER' 
                  ? 'bg-deep-blue-violet-500 border-deep-blue-violet-500' 
                  : 'border-border'
              }`}>
                {feePayer === 'PAYER' && (
                  <div className="w-full h-full rounded-full bg-white scale-50"></div>
                )}
              </div>
              <div className="flex-1">
                <div className={`font-medium text-sm ${
                  feePayer === 'PAYER' ? 'text-deep-blue-violet-700 dark:text-deep-blue-violet-400' : 'text-foreground'
                }`}>
                  Customer (Payer)
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Customers pay base amount + fees. You receive full base amount.
                </div>
              </div>
            </div>
          </button>
          <button
            onClick={() => handleFeePayerChange('MERCHANT')}
                disabled={updateProfile.isPending}
            className={`p-4 rounded-lg border transition-colors text-left ${
              feePayer === 'MERCHANT'
                ? 'bg-deep-blue-violet-50 dark:bg-deep-blue-violet-900/20 border-deep-blue-violet-200 dark:border-deep-blue-violet-800'
                : 'bg-background border-border hover:bg-muted'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-4 h-4 rounded-full border-2 mt-0.5 ${
                feePayer === 'MERCHANT' 
                  ? 'bg-deep-blue-violet-500 border-deep-blue-violet-500' 
                  : 'border-border'
              }`}>
                {feePayer === 'MERCHANT' && (
                  <div className="w-full h-full rounded-full bg-white scale-50"></div>
                )}
              </div>
              <div className="flex-1">
                <div className={`font-medium text-sm ${
                  feePayer === 'MERCHANT' ? 'text-deep-blue-violet-700 dark:text-deep-blue-violet-400' : 'text-foreground'
                }`}>
                  Merchant
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Customers pay only base amount. Fees deducted from your amount.
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* FEE STRUCTURE EXPLANATION */}
      <div className="bg-background rounded-xl p-6 border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <Calculator className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">How Fees Work</h2>
            <p className="text-xs text-muted-foreground">Understanding the fee structure</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Transaction Fee Components</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-deep-blue-violet-500 rounded-full mt-1.5"></div>
                <div>
                  <div className="text-xs font-semibold text-foreground">Gateway Fees</div>
                  <div className="text-xs text-muted-foreground">
                    Fees charged by mobile money providers (MTN, Orange, etc.) for processing transactions
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-deep-blue-violet-500 rounded-full mt-1.5"></div>
                <div>
                  <div className="text-xs font-semibold text-foreground">Platform Fees</div>
                  <div className="text-xs text-muted-foreground">
                    ZoPay platform charges for maintaining infrastructure, security, and support
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-deep-blue-violet-50 dark:bg-deep-blue-violet-900/20 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Example Calculation</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction Amount:</span>
                <span className="font-medium text-foreground">10,000 XAF</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gateway Fee (1.5%):</span>
                <span className="font-medium text-foreground">150 XAF</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform Fee (0.5%):</span>
                <span className="font-medium text-foreground">50 XAF</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-medium">
                  <span>Customer Pays:</span>
                  <span>10,200 XAF</span>
                </div>
                <div className="flex justify-between font-medium text-deep-blue-violet-600">
                  <span>You Receive:</span>
                  <span>10,000 XAF</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NEGOTIATION OPTIONS */}
      <div className="bg-background rounded-xl p-6 border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-crimson-red-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-crimson-red-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Fee Negotiation</h2>
            <p className="text-xs text-muted-foreground">Options for reducing your fees</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-crimson-red-50 dark:bg-crimson-red-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Mail className="w-4 h-4 text-crimson-red-600" />
                <h3 className="text-sm font-semibold text-foreground">Email Support</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Contact our support team to discuss volume-based discounts and custom pricing
              </p>
              <div className="space-y-2">
                <div className="text-xs">
                  <span className="font-medium text-foreground">Email:</span> support@zopay.com
                </div>
                <div className="text-xs">
                  <span className="font-medium text-foreground">Include:</span> Your merchant ID, monthly volume, business type
                </div>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-semibold text-foreground">Support Ticket</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Create a support ticket for formal fee review and negotiation requests
              </p>
              <div className="space-y-2">
                <div className="text-xs">
                  <span className="font-medium text-foreground">Response Time:</span> 24-48 hours
                </div>
                <div className="text-xs">
                  <span className="font-medium text-foreground">Best for:</span> High-volume merchants, special pricing requests
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <HelpCircle className="w-4 h-4 text-yellow-600" />
              <h3 className="text-sm font-semibold text-foreground">Negotiation Tips</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <div className="font-medium text-foreground mb-1">Volume Matters</div>
                <div className="text-muted-foreground">
                  Higher transaction volumes typically qualify for better rates
                </div>
              </div>
              <div>
                <div className="font-medium text-foreground mb-1">Business Type</div>
                <div className="text-muted-foreground">
                  Certain business categories may have preferential pricing
                </div>
              </div>
              <div>
                <div className="font-medium text-foreground mb-1">Long-term Partners</div>
                <div className="text-muted-foreground">
                  Commitment to longer terms can unlock better pricing
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-background rounded-xl p-6 border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-deep-blue-violet-100 rounded-lg flex items-center justify-center">
            <HelpCircle className="w-4 h-4 text-deep-blue-violet-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Frequently Asked Questions</h2>
            <p className="text-xs text-muted-foreground">Common questions about fees</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border-l-2 border-deep-blue-violet-200 pl-4">
            <h3 className="text-sm font-semibold text-foreground mb-1">Can I change the fee payer setting anytime?</h3>
            <p className="text-xs text-muted-foreground">
              Yes, you can change this setting at any time. The change takes effect immediately on all new transactions.
            </p>
          </div>
          <div className="border-l-2 border-deep-blue-violet-200 pl-4">
            <h3 className="text-sm font-semibold text-foreground mb-1">How are gateway fees determined?</h3>
            <p className="text-xs text-muted-foreground">
              Gateway fees are set by mobile money providers and may vary by country, transaction amount, and volume.
            </p>
          </div>
          <div className="border-l-2 border-purple-200 pl-4">
            <h3 className="text-sm font-semibold text-foreground mb-1">Are there any hidden fees?</h3>
            <p className="text-xs text-muted-foreground">
              No, all fees are transparently displayed. You'll see the exact fee breakdown before confirming any transaction.
            </p>
          </div>
          <div className="border-l-2 border-crimson-red-200 pl-4">
            <h3 className="text-sm font-semibold text-foreground mb-1">What's the minimum transaction amount?</h3>
            <p className="text-xs text-muted-foreground">
              Minimum amounts vary by gateway and are typically around 1,000 XAF for most mobile money providers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
