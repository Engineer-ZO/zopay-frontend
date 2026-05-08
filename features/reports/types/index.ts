// Reporting & Analytics API Types

// Dashboard Summary
export interface DashboardSummaryResponse {
  totalTransactionsToday: number;
  totalTransactionsThisWeek: number;
  totalTransactionsThisMonth: number;
  totalVolume: string;
  successRate: number;
  totalFeesPaid: string;
  currentWalletBalance: string;
}

// Dashboard Stats (Spec-Compliant)
export interface DashboardStat {
  label: string;
  value: string;
  currency: string;
  change: string;
  trend: "up" | "down";
  subtitle: string;
}

export interface DashboardStatsResponse {
  stats: DashboardStat[];
}

// Recent Transactions
export interface RecentTransaction {
  id: string;
  date: string;
  time: string;
  type: "collection" | "payout" | "refund";
  amount: number;
  currency: string;
  status: string;
  gateway: string;
  customer?: string;
  recipient?: string;
  fees: number;
  netAmount: number;
  createdAt: string;
  payerName?: string | null;
  payerEmail?: string | null;
  payerMsisdn?: string | null;
  payeeName?: string | null;
  payeeEmail?: string | null;
  payeeMsisdn?: string | null;
  phoneNumber?: string | null;
  comment?: string | null;
  paymentLinkId?: string | null;
  paymentLinkTitle?: string | null;
  source?: string | null;
}

export interface RecentTransactionsResponse {
  transactions: RecentTransaction[];
  total: number;
  hasMore: boolean;
}

// Chart Data
export interface VolumeOverTimeData {
  date: string;
  volume: string;
  collections: string;
  payouts: string;
}

export interface VolumeOverTimeResponse {
  data: VolumeOverTimeData[];
}

export interface SuccessVsFailedResponse {
  successful: number;
  failed: number;
  total: number;
}

export interface GatewayBreakdownItem {
  gateway: string;
  count: number;
  percentage: number;
}

export interface GatewayBreakdownResponse {
  breakdown: GatewayBreakdownItem[];
}

export interface CollectionsVsPayoutsData {
  date: string;
  collections: string;
  payouts: string;
}

export interface CollectionsVsPayoutsResponse {
  data: CollectionsVsPayoutsData[];
}

// Transaction Reports
export interface TransactionReportItem {
  id: string;
  date: string;
  amount: string;
  currency: string;
  gateway: string;
  status: string;
  transactionType: string;
  fees: string;
  netAmount: string;
  payerName?: string | null;
  payerEmail?: string | null;
  payerMsisdn?: string | null;
  payeeName?: string | null;
  payeeEmail?: string | null;
  payeeMsisdn?: string | null;
  phoneNumber?: string | null;
  comment?: string | null;
  paymentLinkId?: string | null;
  paymentLinkTitle?: string | null;
  source?: string | null;
}

export interface TransactionReportResponse {
  transactions: TransactionReportItem[];
  total: number;
  page: number;
  limit: number;
}

export interface TransactionReportFilters {
  startDate?: string;
  endDate?: string;
  status?: string;
  gateway?: string;
  transactionType?: string;
  page?: number;
  limit?: number;
}

// Settlement Reports
export interface SettlementReport {
  settlementId: string;
  periodStart: string;
  periodEnd: string;
  totalCollections: string;
  totalPayouts: string;
  totalRefunds: string;
  totalFees: string;
  netAmount: string;
  status: string;
}

export interface SettlementReportResponse {
  settlements: SettlementReport[];
}

export interface SettlementReportFilters {
  startDate?: string;
  endDate?: string;
  export?: "CSV" | "PDF";
}

// Revenue Report
export interface RevenueBreakdownByGateway {
  gateway: string;
  fees: string;
}

export interface RevenueBreakdownByMerchant {
  merchantId: string;
  merchantName: string;
  fees: string;
}

export interface RevenueReportResponse {
  totalPlatformFees: string;
  breakdownByGateway: RevenueBreakdownByGateway[];
  breakdownByMerchant: RevenueBreakdownByMerchant[];
}

export interface RevenueReportFilters {
  startDate?: string;
  endDate?: string;
  merchantId?: string;
}

// Scheduled Reports
export type ReportType = "TRANSACTION" | "SETTLEMENT" | "REVENUE" | "SUMMARY";
export type Frequency = "DAILY" | "WEEKLY" | "MONTHLY";
export type ExportFormat = "CSV" | "EXCEL" | "PDF";

export interface ScheduledReport {
  id: string;
  merchantId: string;
  reportType: ReportType;
  frequency: Frequency;
  emailRecipients: string[];
  format: ExportFormat;
  enabled: boolean;
  lastSentAt: string | null;
  nextSendAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScheduledReportRequest {
  reportType: ReportType;
  frequency: Frequency;
  emailRecipients: string[];
  format?: ExportFormat;
  enabled?: boolean;
}

export interface UpdateScheduledReportRequest {
  reportType?: ReportType;
  frequency?: Frequency;
  emailRecipients?: string[];
  format?: ExportFormat;
  enabled?: boolean;
}

export interface ScheduledReportsResponse {
  total: number;
  reports: ScheduledReport[];
}

export interface ScheduledReportResponse {
  report: ScheduledReport;
}

// Admin Routes
export interface PlatformSummaryResponse {
  totalMerchants: number;
  activeMerchants: number;
  inactiveMerchants: number;
  totalTransactions: number;
  totalPlatformRevenue: string;
  gatewayPerformance: {
    gateway: string;
    successRate: number;
    totalTransactions: number;
  }[];
}

export interface TopMerchantByVolume {
  merchantId: string;
  merchantName: string;
  volume: string;
}

export interface TopMerchantByRevenue {
  merchantId: string;
  merchantName: string;
  revenue: string;
}

export interface RecentlyOnboardedMerchant {
  merchantId: string;
  merchantName: string;
  createdAt: string;
}
