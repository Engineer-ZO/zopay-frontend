export type PaymentProvider = "mtn-momo" | "orange-money";

export type PaymentStatus = "pending" | "completed" | "failed" | "cancelled";

export interface PaymentRequest {
  amount: number;
  currency: string;
  phoneNumber: string;
  provider: PaymentProvider;
  description?: string;
  metadata?: Record<string, string>;
}

export interface PaymentResponse {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: PaymentProvider;
  phoneNumber: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentStatusResponse extends PaymentResponse {}
