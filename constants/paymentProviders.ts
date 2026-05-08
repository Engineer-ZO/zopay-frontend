export const paymentProviders = {
  MTN_MOMO: "mtn-momo",
  ORANGE_MONEY: "orange-money",
} as const;

export type PaymentProvider =
  (typeof paymentProviders)[keyof typeof paymentProviders];

export const paymentProviderLabels: Record<PaymentProvider, string> = {
  "mtn-momo": "MTN Mobile Money",
  "orange-money": "Orange Money",
};

export const paymentProviderConfig: Record<
  PaymentProvider,
  { label: string; color: string; countries: string[] }
> = {
  "mtn-momo": {
    label: "MTN Mobile Money",
    color: "#FFC107",
    countries: ["CI", "GH", "CM", "UG"],
  },
  "orange-money": {
    label: "Orange Money",
    color: "#FF6600",
    countries: ["CI", "SN", "ML", "BF"],
  },
};
