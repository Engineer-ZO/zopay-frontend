// Webhook API Types

export interface WebhookEndpoint {
  id: string;
  merchantId: string;
  url: string;
  enabled: boolean;
  events: string[];
  secret?: string; // Only returned on create/get single
  createdAt: string;
  updatedAt?: string;
}

export interface CreateWebhookEndpointRequest {
  url: string;
  events: string[]; // Must include all 6 events
}

export interface CreateWebhookEndpointResponse {
  endpoint: WebhookEndpoint;
}

export interface UpdateWebhookEndpointRequest {
  url?: string;
  enabled?: boolean;
  events?: string[]; // If updating, must include all 6 events
}

export interface UpdateWebhookEndpointResponse {
  endpoint: WebhookEndpoint;
}

export interface ListWebhookEndpointsResponse {
  endpoints: WebhookEndpoint[];
}

export interface GetWebhookEndpointResponse {
  endpoint: WebhookEndpoint;
}

export interface WebhookDelivery {
  id: string;
  endpointId: string;
  event: string;
  attemptCount: number;
  status: 'PENDING' | 'DELIVERED' | 'FAILED' | 'RETRYING';
  responseStatusCode?: number;
  responseBody?: string;
  errorMessage?: string;
  nextAttemptAt?: string;
  deliveredAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface ListWebhookDeliveriesParams {
  endpointId?: string;
  event?: string;
  status?: 'PENDING' | 'DELIVERED' | 'FAILED' | 'RETRYING';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface ListWebhookDeliveriesResponse {
  deliveries: WebhookDelivery[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface GetWebhookDeliveryResponse {
  delivery: WebhookDelivery & {
    payload?: Record<string, unknown>;
  };
}

export interface ReplayWebhookDeliveryResponse {
  delivery: {
    id: string;
    status: string;
    attemptCount: number;
  };
}

export interface DeadLetterQueueItem {
  id: string;
  endpointId: string;
  event: string;
  attemptCount: number;
  lastError?: string;
  movedToDlqAt: string;
  replayed: boolean;
  createdAt: string;
}

export interface ListDeadLetterQueueParams {
  endpointId?: string;
  event?: string;
  replayed?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface ListDeadLetterQueueResponse {
  items: DeadLetterQueueItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// Required events - must include all 6
export const REQUIRED_WEBHOOK_EVENTS = [
  'payment.succeeded',
  'payment.failed',
  'payout.completed',
  'payout.failed',
  'refund.completed',
  'settlement.generated',
] as const;

export type WebhookEvent = typeof REQUIRED_WEBHOOK_EVENTS[number];
