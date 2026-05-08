export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed";
  provider: "mtn-momo" | "orange-money";
  phoneNumber: string;
  merchantId: string;
  customerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  status?: string;
  provider?: string;
  startDate?: string;
  endDate?: string;
}
