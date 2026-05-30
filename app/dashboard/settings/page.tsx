'use client';

import { useState } from 'react';
import { useGetFirstMerchant, useSubmitProfileUpdateRequest } from '@/features/merchants/hooks';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { data: merchantData, isLoading: isLoadingMerchant } = useGetFirstMerchant();
  const submitProfileUpdateRequest = useSubmitProfileUpdateRequest();
  
  const [feePayer, setFeePayer] = useState<'PAYER' | 'MERCHANT'>('PAYER');

  // Update form when merchant data loads
  if (merchantData?.merchant && feePayer === 'PAYER') {
    setFeePayer(merchantData.merchant.feePayer || 'PAYER');
  }

  const handleFeePayerChange = async (newFeePayer: 'PAYER' | 'MERCHANT') => {
    try {
      setFeePayer(newFeePayer);
      await submitProfileUpdateRequest.mutateAsync({
        proposedChanges: {
          merchant: { feePayer: newFeePayer },
        },
      });
      toast.success('Request submitted for admin review', {
        description: `Fee payer change to ${newFeePayer === 'PAYER' ? 'Customer (Payer)' : 'Merchant'} was submitted.`,
      });
    } catch (error) {
      toast.error('Failed to update fee payer setting');
      // Revert on error
      setFeePayer(feePayer);
    }
  };

  if (isLoadingMerchant) {
    return (
      <div>
        <h1 className="text-xl font-semibold text-foreground mb-6">Settings</h1>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground mb-6">Settings</h1>
      <div className="space-y-6">
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Fee Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block mb-2 font-medium">Who pays transaction fees?</label>
              <p className="text-sm text-gray-600 mb-4">
                Choose whether transaction fees are charged to the customer or deducted from your received amount.
              </p>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="feePayer"
                    value="PAYER"
                    checked={feePayer === 'PAYER'}
                    onChange={(e) => handleFeePayerChange(e.target.value as 'PAYER' | 'MERCHANT')}
                    className="w-4 h-4 text-deep-blue-violet-600"
                    disabled={submitProfileUpdateRequest.isPending}
                  />
                  <div>
                    <div className="font-medium">Customer (Payer)</div>
                    <div className="text-sm text-gray-600">
                      Customers pay the base amount plus fees. You receive the full base amount.
                    </div>
                  </div>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="feePayer"
                    value="MERCHANT"
                    checked={feePayer === 'MERCHANT'}
                    onChange={(e) => handleFeePayerChange(e.target.value as 'PAYER' | 'MERCHANT')}
                    className="w-4 h-4 text-deep-blue-violet-600"
                    disabled={submitProfileUpdateRequest.isPending}
                  />
                  <div>
                    <div className="font-medium">Merchant</div>
                    <div className="text-sm text-gray-600">
                      Customers pay only the base amount. Fees are deducted from your received amount.
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
