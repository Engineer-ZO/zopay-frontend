import { apiClient } from '@/lib/apiClient';
import type {
  CreateWebhookEndpointRequest,
  CreateWebhookEndpointResponse,
  UpdateWebhookEndpointRequest,
  UpdateWebhookEndpointResponse,
  ListWebhookEndpointsResponse,
  GetWebhookEndpointResponse,
  ListWebhookDeliveriesParams,
  ListWebhookDeliveriesResponse,
  GetWebhookDeliveryResponse,
  ReplayWebhookDeliveryResponse,
  ListDeadLetterQueueParams,
  ListDeadLetterQueueResponse,
} from './types';

const WEBHOOK_BASE_URL = '/merchant/v1/webhooks';

/**
 * Register a new webhook endpoint
 * Creates a webhook endpoint to receive event notifications
 */
export const createWebhookEndpoint = async (
  data: CreateWebhookEndpointRequest
): Promise<CreateWebhookEndpointResponse> => {
  const response = await apiClient.post<CreateWebhookEndpointResponse>(
    `${WEBHOOK_BASE_URL}/endpoints`,
    data
  );
  return response.data;
};

/**
 * Update an existing webhook endpoint
 * Updates webhook URL, enabled status, or events
 */
export const updateWebhookEndpoint = async (
  id: string,
  data: UpdateWebhookEndpointRequest
): Promise<UpdateWebhookEndpointResponse> => {
  const response = await apiClient.put<UpdateWebhookEndpointResponse>(
    `${WEBHOOK_BASE_URL}/endpoints/${id}`,
    data
  );
  return response.data;
};

/**
 * List all webhook endpoints for the merchant
 * Returns all registered webhook endpoints
 */
export const listWebhookEndpoints = async (): Promise<ListWebhookEndpointsResponse> => {
  const response = await apiClient.get<ListWebhookEndpointsResponse>(
    `${WEBHOOK_BASE_URL}/endpoints`
  );
  return response.data;
};

/**
 * Get a specific webhook endpoint
 * Returns details including the secret (only on get single)
 */
export const getWebhookEndpoint = async (
  id: string
): Promise<GetWebhookEndpointResponse> => {
  const response = await apiClient.get<GetWebhookEndpointResponse>(
    `${WEBHOOK_BASE_URL}/endpoints/${id}`
  );
  return response.data;
};

/**
 * List webhook deliveries
 * Returns delivery history with filtering options
 */
export const listWebhookDeliveries = async (
  params?: ListWebhookDeliveriesParams
): Promise<ListWebhookDeliveriesResponse> => {
  const response = await apiClient.get<ListWebhookDeliveriesResponse>(
    `${WEBHOOK_BASE_URL}/deliveries`,
    {
      params,
    }
  );
  return response.data;
};

/**
 * Get a specific webhook delivery
 * Returns detailed delivery information including payload
 */
export const getWebhookDelivery = async (
  id: string
): Promise<GetWebhookDeliveryResponse> => {
  const response = await apiClient.get<GetWebhookDeliveryResponse>(
    `${WEBHOOK_BASE_URL}/deliveries/${id}`
  );
  return response.data;
};

/**
 * Replay a failed webhook delivery
 * Manually retry a failed webhook delivery
 */
export const replayWebhookDelivery = async (
  id: string
): Promise<ReplayWebhookDeliveryResponse> => {
  const response = await apiClient.post<ReplayWebhookDeliveryResponse>(
    `${WEBHOOK_BASE_URL}/deliveries/${id}/replay`
  );
  return response.data;
};

/**
 * List dead letter queue items
 * Returns webhooks that failed all retry attempts
 */
export const listDeadLetterQueue = async (
  params?: ListDeadLetterQueueParams
): Promise<ListDeadLetterQueueResponse> => {
  const response = await apiClient.get<ListDeadLetterQueueResponse>(
    `${WEBHOOK_BASE_URL}/dlq`,
    {
      params,
    }
  );
  return response.data;
};
