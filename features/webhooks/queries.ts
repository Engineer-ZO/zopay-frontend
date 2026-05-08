"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  UseMutationResult,
  UseQueryResult,
} from '@tanstack/react-query';
import {
  createWebhookEndpoint,
  updateWebhookEndpoint,
  listWebhookEndpoints,
  getWebhookEndpoint,
  listWebhookDeliveries,
  getWebhookDelivery,
  replayWebhookDelivery,
  listDeadLetterQueue,
} from './api';
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

/**
 * Hook for listing all webhook endpoints
 */
export const useWebhookEndpoints = (): UseQueryResult<ListWebhookEndpointsResponse, Error> => {
  return useQuery({
    queryKey: ['webhooks', 'endpoints'],
    queryFn: listWebhookEndpoints,
  });
};

/**
 * Hook for getting a specific webhook endpoint
 */
export const useWebhookEndpoint = (
  id: string,
  enabled: boolean = true
): UseQueryResult<GetWebhookEndpointResponse, Error> => {
  return useQuery({
    queryKey: ['webhooks', 'endpoints', id],
    queryFn: () => getWebhookEndpoint(id),
    enabled: enabled && !!id,
  });
};

/**
 * Hook for creating a new webhook endpoint
 */
export const useCreateWebhookEndpoint = (): UseMutationResult<
  CreateWebhookEndpointResponse,
  Error,
  CreateWebhookEndpointRequest
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWebhookEndpoint,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks', 'endpoints'] });
    },
  });
};

/**
 * Hook for updating a webhook endpoint
 */
export const useUpdateWebhookEndpoint = (): UseMutationResult<
  UpdateWebhookEndpointResponse,
  Error,
  { id: string; data: UpdateWebhookEndpointRequest }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateWebhookEndpoint(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['webhooks', 'endpoints'] });
      queryClient.invalidateQueries({ queryKey: ['webhooks', 'endpoints', variables.id] });
    },
  });
};

/**
 * Hook for listing webhook deliveries
 */
export const useWebhookDeliveries = (
  params?: ListWebhookDeliveriesParams,
  enabled: boolean = true
): UseQueryResult<ListWebhookDeliveriesResponse, Error> => {
  return useQuery({
    queryKey: ['webhooks', 'deliveries', params],
    queryFn: () => listWebhookDeliveries(params),
    enabled,
  });
};

/**
 * Hook for getting a specific webhook delivery
 */
export const useWebhookDelivery = (
  id: string,
  enabled: boolean = true
): UseQueryResult<GetWebhookDeliveryResponse, Error> => {
  return useQuery({
    queryKey: ['webhooks', 'deliveries', id],
    queryFn: () => getWebhookDelivery(id),
    enabled: enabled && !!id,
  });
};

/**
 * Hook for replaying a failed webhook delivery
 */
export const useReplayWebhookDelivery = (): UseMutationResult<
  ReplayWebhookDeliveryResponse,
  Error,
  string
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => replayWebhookDelivery(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['webhooks', 'deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['webhooks', 'deliveries', id] });
      queryClient.invalidateQueries({ queryKey: ['webhooks', 'dlq'] });
    },
  });
};

/**
 * Hook for listing dead letter queue items
 */
export const useDeadLetterQueue = (
  params?: ListDeadLetterQueueParams,
  enabled: boolean = true
): UseQueryResult<ListDeadLetterQueueResponse, Error> => {
  return useQuery({
    queryKey: ['webhooks', 'dlq', params],
    queryFn: () => listDeadLetterQueue(params),
    enabled,
  });
};
