export interface AnalyticsData {
  totalRevenue: number;
  totalTransactions: number;
  successRate: number;
  averageTransactionValue: number;
  revenueByPeriod: { period: string; revenue: number }[];
  transactionsByPeriod: { period: string; count: number }[];
  revenueByProvider: { provider: string; revenue: number }[];
}

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  provider?: string;
}
