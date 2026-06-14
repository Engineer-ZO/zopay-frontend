"use client";

import { useState, useEffect } from "react";
import { useGetFirstMerchant, useUpdateMerchantProfile } from "@/features/merchants/hooks";
import { toast } from "sonner";
import { 
  Settings, 
  Mail, 
  MessageSquare, 
  Calculator, 
  TrendingUp, 
  HelpCircle,
  DollarSign,
  Shield,
  User,
  Building,
  Percent,
  AlertCircle,
  Check,
  ArrowRight,
  Wallet,
  Zap,
  Clock,
  Star,
  Phone,
  MessageCircle,
  Users,
  BarChart3,
  Rocket,
  Sparkles,
  Crown,
} from "lucide-react";

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
    setFeePayer(newFeePayer);
    try {
      await updateProfile.mutateAsync({ feePayer: newFeePayer });
      toast.success('Fee payer updated', {
        description: `Now set to: ${newFeePayer === 'PAYER' ? 'Customer (Payer)' : 'Merchant'}.`,
      });
    } catch (error) {
      setFeePayer(previous);
      toast.error('Failed to update fee payer setting');
    }
  };

  if (isLoadingMerchant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="max-w-[1400px] mx-auto p-6 space-y-6">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg mb-4" />
            <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded-2xl mb-4" />
            <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-[1400px] mx-auto p-6 space-y-6">
        {/* HEADER - Premium Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-white via-white to-indigo-50/50 dark:from-slate-800/80 dark:via-slate-800/60 dark:to-indigo-950/30 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-6 shadow-lg">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Fee Settings
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                  Configure transaction fees and understand how they work
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FEE PAYER SELECTION */}
        <div className="rounded-2xl bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50/30 to-transparent dark:from-slate-800/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                <Settings className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Who Pays Transaction Fees?</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Choose who bears the transaction costs</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Payer Option */}
              <button
                onClick={() => handleFeePayerChange('PAYER')}
                disabled={updateProfile.isPending}
                className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 text-left ${
                  feePayer === 'PAYER'
                    ? 'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-2 border-indigo-500 dark:border-indigo-400 shadow-lg'
                    : 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md'
                }`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                <div className="relative">
                  <div className="flex items-start gap-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      feePayer === 'PAYER' 
                        ? 'border-indigo-500 bg-indigo-500' 
                        : 'border-slate-300 dark:border-slate-600 group-hover:border-indigo-400'
                    }`}>
                      {feePayer === 'PAYER' && (
                        <Check className="w-3.5 h-3.5 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <User className={`w-5 h-5 ${feePayer === 'PAYER' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                        <div className={`font-semibold text-base ${
                          feePayer === 'PAYER' ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-900 dark:text-white'
                        }`}>
                          Customer (Payer)
                        </div>
                        {feePayer === 'PAYER' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400">
                            <Zap className="w-2.5 h-2.5" />
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        Customers pay base amount + fees. You receive the full base amount.
                      </p>
                      <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                          <Shield className="w-3 h-3 text-emerald-500" />
                          <span>Best for: Businesses with competitive pricing, customer pays convenience fees</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </button>

              {/* Merchant Option */}
              <button
                onClick={() => handleFeePayerChange('MERCHANT')}
                disabled={updateProfile.isPending}
                className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 text-left ${
                  feePayer === 'MERCHANT'
                    ? 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-2 border-emerald-500 dark:border-emerald-400 shadow-lg'
                    : 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-md'
                }`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                <div className="relative">
                  <div className="flex items-start gap-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      feePayer === 'MERCHANT' 
                        ? 'border-emerald-500 bg-emerald-500' 
                        : 'border-slate-300 dark:border-slate-600 group-hover:border-emerald-400'
                    }`}>
                      {feePayer === 'MERCHANT' && (
                        <Check className="w-3.5 h-3.5 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Building className={`w-5 h-5 ${feePayer === 'MERCHANT' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                        <div className={`font-semibold text-base ${
                          feePayer === 'MERCHANT' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                        }`}>
                          Merchant
                        </div>
                        {feePayer === 'MERCHANT' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                            <Zap className="w-2.5 h-2.5" />
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        Customers pay only base amount. Fees are deducted from your settlement.
                      </p>
                      <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                          <Shield className="w-3 h-3 text-emerald-500" />
                          <span>Best for: Businesses wanting simple pricing for customers</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* FEE STRUCTURE EXPLANATION */}
        <div className="rounded-2xl bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50/30 to-transparent dark:from-slate-800/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                <Calculator className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">How Fees Work</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Understanding the fee structure</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Fee Components */}
            <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/30 dark:to-slate-800/20 p-5 border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Percent className="w-4 h-4 text-indigo-500" />
                Transaction Fee Components
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-slate-800/50">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">Gateway Fees</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Fees charged by mobile money providers (MTN, Orange, etc.) for processing transactions. These vary by provider and transaction amount.
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-slate-800/50">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">Platform Fees</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      ZoPay platform charges for maintaining infrastructure, security, and 24/7 customer support.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Example Calculation */}
            <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 p-5 border border-indigo-200 dark:border-indigo-500/20">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-indigo-500" />
                Example Calculation
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2">
                  <span className="text-slate-600 dark:text-slate-400">Transaction Amount:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">10,000 XAF</span>
                </div>
                <div className="flex justify-between py-2 border-t border-indigo-200 dark:border-indigo-500/20">
                  <span className="text-slate-600 dark:text-slate-400">Gateway Fee (1.5%):</span>
                  <span className="text-slate-900 dark:text-white">150 XAF</span>
                </div>
                <div className="flex justify-between py-2 border-t border-indigo-200 dark:border-indigo-500/20">
                  <span className="text-slate-600 dark:text-slate-400">Platform Fee (0.5%):</span>
                  <span className="text-slate-900 dark:text-white">50 XAF</span>
                </div>
                <div className="mt-3 pt-3 border-t-2 border-indigo-300 dark:border-indigo-500/30">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-900 dark:text-white">Customer Pays:</span>
                    <span className="text-indigo-600 dark:text-indigo-400">10,200 XAF</span>
                  </div>
                  <div className="flex justify-between font-bold mt-1">
                    <span className="text-slate-900 dark:text-white">You Receive:</span>
                    <span className="text-emerald-600 dark:text-emerald-400">10,000 XAF</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* NEGOTIATION OPTIONS */}
        <div className="rounded-2xl bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50/30 to-transparent dark:from-slate-800/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Fee Negotiation</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Options for reducing your fees</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Email Support */}
              <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20 p-5 border border-rose-200 dark:border-rose-500/20 hover:shadow-lg transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-rose-500/5 to-pink-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-md">
                      <Mail className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Email Support</h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                    Contact our support team to discuss volume-based discounts and custom pricing options tailored to your business needs.
                  </p>
                  <div className="space-y-2 text-xs bg-white/50 dark:bg-slate-900/50 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3 text-rose-500" />
                      <span className="font-medium text-slate-900 dark:text-white">support@zopay.com</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-3 h-3 text-amber-500 mt-0.5" />
                      <span className="text-slate-600 dark:text-slate-400">Include: Merchant ID, monthly volume, business type</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Support Ticket */}
              <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 p-5 border border-indigo-200 dark:border-indigo-500/20 hover:shadow-lg transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Support Ticket</h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                    Create a support ticket for formal fee review and negotiation requests. Our team will respond within 24-48 hours.
                  </p>
                  <div className="space-y-2 text-xs bg-white/50 dark:bg-slate-900/50 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-indigo-500" />
                      <span className="font-medium text-slate-900 dark:text-white">Response: 24-48 hours</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Star className="w-3 h-3 text-amber-500 mt-0.5" />
                      <span className="text-slate-600 dark:text-slate-400">Best for: High-volume merchants, special pricing requests</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Negotiation Tips */}
            <div className="rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 p-5 border border-amber-200 dark:border-amber-500/20">
              <div className="flex items-center gap-2 mb-4">
                <Crown className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Negotiation Tips</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start gap-2 p-2">
                  <BarChart3 className="w-4 h-4 text-amber-500 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-white mb-1">Volume Matters</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Higher transaction volumes typically qualify for better rates</div>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2">
                  <Building className="w-4 h-4 text-amber-500 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-white mb-1">Business Type</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Certain business categories may have preferential pricing</div>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2">
                  <Rocket className="w-4 h-4 text-amber-500 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-white mb-1">Long-term Partners</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Commitment to longer terms can unlock better pricing</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ SECTION */}
        <div className="rounded-2xl bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50/30 to-transparent dark:from-slate-800/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg">
                <HelpCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Common questions about fees</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="group p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200 hover:shadow-md">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                Can I change the fee payer setting anytime?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-4">
                Yes, you can change this setting at any time. The change takes effect immediately on all new transactions.
              </p>
            </div>
            <div className="group p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200 hover:shadow-md">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                How are gateway fees determined?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-4">
                Gateway fees are set by mobile money providers and may vary by country, transaction amount, and volume. We always display the exact fee before confirmation.
              </p>
            </div>
            <div className="group p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all duration-200 hover:shadow-md">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Are there any hidden fees?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-4">
                No, all fees are transparently displayed. You'll see the exact fee breakdown before confirming any transaction.
              </p>
            </div>
            <div className="group p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-600 transition-all duration-200 hover:shadow-md">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                What's the minimum transaction amount?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-4">
                Minimum amounts vary by gateway and are typically around 1,000 XAF for most mobile money providers.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Support Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-500/5 dark:via-purple-500/5 dark:to-pink-500/5 border border-indigo-200 dark:border-indigo-500/20 p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Need Help with Fees?</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 max-w-md mx-auto">
            Our support team is here to help you understand fees and find the best pricing for your business.
          </p>
          <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all duration-200">
            Contact Support
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}