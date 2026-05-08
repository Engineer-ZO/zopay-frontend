"use client";

import { PaymentProvider } from "../types";

interface PaymentProviderCardProps {
  provider: PaymentProvider;
  name: string;
  description: string;
  icon?: string;
  onSelect: (provider: PaymentProvider) => void;
}

export function PaymentProviderCard({
  provider,
  name,
  description,
  icon,
  onSelect,
}: PaymentProviderCardProps) {
  return (
    <div
      className="border rounded-lg p-6 cursor-pointer hover:border-blue-500 transition-colors"
      onClick={() => onSelect(provider)}
    >
      {icon && <div className="mb-4">{icon}</div>}
      <h3 className="text-xl font-semibold mb-2">{name}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}
