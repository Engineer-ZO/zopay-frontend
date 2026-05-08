export interface Merchant {
  id: string;
  businessName: string;
  email: string;
  phoneNumber?: string;
  status: "active" | "inactive" | "suspended";
  feePayer: 'PAYER' | 'MERCHANT';
  createdAt: string;
  updatedAt: string;
}

// Re-export everything from the full types module so both import paths work:
// "@/features/merchants/types" and "@/features/merchants/types/index"
export * from './types/index';
